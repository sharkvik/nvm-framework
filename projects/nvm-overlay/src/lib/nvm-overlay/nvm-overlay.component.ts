import {
	Component,
	OnInit,
	ViewEncapsulation,
	ChangeDetectionStrategy,
	Input,
	ElementRef,
	OnDestroy,
	ChangeDetectorRef,
	ViewRef,
	HostBinding,
	Output,
	EventEmitter
} from '@angular/core';
import { isNil } from 'lodash';
import { Subscription, Subject, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';
import { NvmOverlayService } from '../nvm-overlay.service';

@Component({
	selector: 'nvm-overlay',
	templateUrl: './nvm-overlay.component.html',
	styleUrls: ['./nvm-overlay.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations: [
		trigger("fade", [
			state('hidden', style({opacity: '0.0'})),
			state('visible', style({opacity: '1.0'})),
			transition('hidden <=> visible', [animate('0.5s', keyframes([
				style({ opacity: '0.1', offset: 0.1 }),
				style({ opacity: '0.2', offset: 0.2 }),
				style({ opacity: '0.3', offset: 0.3 }),
				style({ opacity: '0.5', offset: 0.4 })
			]))])
		])
	]
})
export class NvmOverlayComponent implements OnInit, OnDestroy {
	@Output() public openned: EventEmitter<any> = new EventEmitter<any>();
	@Output() public closed: EventEmitter<any> = new EventEmitter<any>();

	@Input() public appendTo: ElementRef<HTMLElement> | HTMLElement | string;
	@Input() public anchor: ElementRef<HTMLElement> | HTMLElement;
	@Input() public container: ElementRef<HTMLElement> | HTMLElement | string;
	@Input() public adjustWidth: boolean = false;
	@Input() public adjustHeight: boolean = true;

	public get isVisible() {
		return this._display;
	}

	public get nativeElement(): Element {
		return this._host.nativeElement;
	}

	public get anchorElement(): Element {
		return this._anchor;
	}

	public id: string;
	public position: string = 'bottom';
	private _appendTo: HTMLElement;
	private _anchor: HTMLElement;
	private _container: HTMLElement;
	@HostBinding('@fade')
	public apear: string = 'hidden';
	private _display: boolean = false;
	private _show: Subject<any> = new Subject<any>();
	private _subscriptions: Subscription = new Subscription();

	private _top: number = -9999;
	private _left: number = -9999;
	private _right: number;
	private _bottom: number;
	private _maxHeight: number;
	private _width: number;
	private _containerRect: any;
	private _initialStyles: CSSStyleDeclaration;

	constructor(private _host: ElementRef<HTMLElement>, private _cd: ChangeDetectorRef, private _overlayService: NvmOverlayService) {
		this.id = this._newGuid;
		this._overlayService.register(this);
	}

	public ngOnInit() {
		this._host.nativeElement.style.top = `${this._top}px`;
		this._host.nativeElement.style.left = `${this._left}px`;
		this._host.nativeElement.remove();
		this._subscriptions.add(this._show.pipe(switchMap(() => {
			this._displayImpl();
			return of(true);
		})).subscribe(() => {
			this._adjust();
			this.openned.emit();
		}));
		this._appendTo = this.appendTo === 'body' ? document.body : (this.appendTo as ElementRef<HTMLElement>).nativeElement || (this.appendTo as HTMLElement);
		this._anchor = (this.anchor as ElementRef<HTMLElement>).nativeElement || (this.anchor as HTMLElement);
		this._container = this.container === 'body' ? document.body : (this.container as ElementRef<HTMLElement>).nativeElement || (this.container as HTMLElement);
	}

	public ngOnDestroy(): void {
		this._subscriptions.unsubscribe();
		this._overlayService.remove(this.id);
	}

	public contains = (element: HTMLElement): boolean => {
		return this._anchor.contains(element) || this._host.nativeElement.contains(element);
	}

	public show = (): void => {
		this._display = true;
		this.apear = 'visible';
		this._fillPosition();
		this._show.next();
	}

	public hide = (): void => {
		this.apear = 'hidden';
		this._display = false;
		this._host.nativeElement.remove();
		this._detectChanges();
		this.closed.emit();
	}

	public adjust = (): void => {
		this._calculatePosition();
		if (!isNil(this._top) && this._top < this._container.offsetTop) {
			this.hide();
			return;
		}
		if (!isNil(this._bottom) && this._bottom < this._container.offsetTop + this._container.offsetHeight) {
			this.hide();
			return;
		}
		this._adjust();
	}

	private _calculatePosition = (): void => {
		this.position = 'bottom';
		if (isNil(this._appendTo) || isNil(this._anchor)) {
			return;
		}
		const anchorRectangle = this._anchor.getBoundingClientRect();
		if (isNil(this.container)) {
			this._top = anchorRectangle.bottom;
			this._left = anchorRectangle.left;
			return;
		}
		this._containerRect = this._container.getBoundingClientRect();
		const overlayRectangle = this._host.nativeElement.getBoundingClientRect();
		const bottomDifference = this._containerRect.bottom - anchorRectangle.bottom - overlayRectangle.height;
		const topDifference = anchorRectangle.top - this._containerRect.top - overlayRectangle.height;

		if (this.adjustWidth) {
			this._width = anchorRectangle.width;
		}

		if (bottomDifference > 5) {
			this._top = anchorRectangle.bottom + window.scrollY;
			this._left = anchorRectangle.left;
			return;
		}
		if (topDifference > 5) {
			this.position = 'top';
			this._bottom = window.innerHeight - anchorRectangle.top - window.scrollY;
			this._left = anchorRectangle.left;
			return;
		}
		if (!this.adjustHeight) {
			this._top = anchorRectangle.bottom + window.scrollY;
			this._left = anchorRectangle.left;
			return;
		}
		if (topDifference > bottomDifference) {
			this.position = 'top';
			this._bottom = window.innerHeight - anchorRectangle.top - window.scrollY;
			this._left = anchorRectangle.left;
			this._maxHeight = anchorRectangle.top - this._containerRect.top;
		} else {
			this._top = anchorRectangle.bottom + window.scrollY;
			this._left = anchorRectangle.left;
			this._maxHeight = this._containerRect.bottom - anchorRectangle.bottom;
		}
	}

	private _adjust = (): void => {
		if (this._top === -9999) {
			this._top = undefined;
		}
		if (this._left === -9999) {
			this._left = undefined;
		}
		this._calculatePosition();
		this._fillPosition();
		this._detectChanges();
	}

	private _displayImpl = (): void => {
		this._append();
		this._detectChanges();
	}

	private _fillPosition = (): void => {
		if (isNil(this._initialStyles)) {
			this._initialStyles = this._host.nativeElement.style;
		}
		if (!isNil(this._top) && this._top !== -9999) {
			this._host.nativeElement.style.top = `${this._top}px`;
		} else if (this._top !== -9999) {
			this._host.nativeElement.style.top = this._initialStyles.top;
		}
		if (!isNil(this._left) && this._left !== -9999) {
			this._host.nativeElement.style.left = `${this._left}px`;
		} else if (this._left !== -9999) {
			this._host.nativeElement.style.left = this._initialStyles.left;
		}
		if (!isNil(this._bottom)) {
			this._host.nativeElement.style.bottom = `${this._bottom}px`;
		} else {
			this._host.nativeElement.style.bottom = this._initialStyles.bottom;
		}
		if (!isNil(this._right)) {
			this._host.nativeElement.style.right = `${this._right}px`;
		} else {
			this._host.nativeElement.style.right = this._initialStyles.right;
		}
		if (!isNil(this._maxHeight)) {
			this._host.nativeElement.style.maxHeight = `${this._maxHeight}px`;
			this._host.nativeElement.style.overflowY = 'auto';
		} else {
			this._host.nativeElement.style.maxHeight = this._initialStyles.maxHeight;
			this._host.nativeElement.style.overflowY = this._initialStyles.overflowY;
		}
		if (!isNil(this._width)) {
			this._host.nativeElement.style.width = `${this._width}px`;
		} else {
			this._host.nativeElement.style.width = this._initialStyles.width;
		}
		this._host.nativeElement.className = this.position;
	}

	private _append = (): void => {
		if (isNil(this._appendTo)) {
			return;
		}
		this._appendTo.appendChild(this._host.nativeElement);
	}

	private _detectChanges = (): void => {
		if ((this._cd as ViewRef).destroyed) {
			return;
		}
		this._cd.detectChanges();
	}

	private get _newGuid() {
		return `${this._s4}${this._s4}-${this._s4}-${this._s4}-${this._s4}-${this._s4}${this._s4}${this._s4}`;
	}

	private get _s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}
}
