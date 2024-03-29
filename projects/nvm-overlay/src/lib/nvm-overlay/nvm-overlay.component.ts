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
	Output,
	EventEmitter,
	HostListener
} from '@angular/core';
import { Subscription, Subject, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { NvmOverlayService } from '../nvm-overlay.service';
import { isNil } from 'lodash';

@Component({
	selector: 'nvm-overlay',
	templateUrl: './nvm-overlay.component.html',
	styleUrls: ['./nvm-overlay.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class NvmOverlayComponent implements OnInit, OnDestroy {
	@Output() public openned: EventEmitter<any> = new EventEmitter<any>();
	@Output() public closed: EventEmitter<any> = new EventEmitter<any>();
	@Output() public mouseIn: EventEmitter<{ inside: boolean, event: MouseEvent }> = new EventEmitter<{ inside: boolean, event: MouseEvent }>();

	@Input() public appendTo: ElementRef<HTMLElement> | HTMLElement | string;
	@Input() public anchor: ElementRef<HTMLElement> | HTMLElement;
	@Input() public container: ElementRef<HTMLElement> | HTMLElement | string;
	@Input() public adjustWidth: boolean = false;
	@Input() public adjustHeight: boolean = true;
	@Input() public maxHeight: number;
	@Input() public align: string = 'left';

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
	private _cursorIn: boolean = false;

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
			this._detectChanges();
			return of(true);
		})).subscribe(() => {
			this._adjust();
			this.openned.emit();
		}));
		this._appendTo = this.appendTo === 'body' ? document.body : (this.appendTo as ElementRef<HTMLElement>).nativeElement || (this.appendTo as HTMLElement);
		this._anchor = (this.anchor as ElementRef<HTMLElement>).nativeElement || (this.anchor as HTMLElement);
		if (!isNil(this._anchor)) {
			this._anchor.setAttribute('data-autocomplete-id', this.id);
		}
		this._container = this.container === 'body' ? document.body : (this.container as ElementRef<HTMLElement>).nativeElement || (this.container as HTMLElement);
	}

	public ngOnDestroy(): void {
		this._subscriptions.unsubscribe();
		this._overlayService.remove(this.id);
		this._cd.detach();
	}

	public contains = (element: HTMLElement): boolean => {
		return this._anchor.contains(element) || this._host.nativeElement.contains(element);
	}

	public show = (): void => {
		this._display = true;
		this._show.next();
	}

	public hide = (): void => {
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

	@HostListener('mouseenter', ['$event'])
	public cursorIn(ev: MouseEvent): void {
		this._cursorIn = true;
		this.mouseIn.emit({ inside: this._cursorIn, event: ev });
	}

	@HostListener('mouseleave', ['$event'])
	public cursorOut(ev: MouseEvent): void {
		this._cursorIn = false;
		this.mouseIn.emit({ inside: this._cursorIn, event: ev });
	}

	private _calculatePosition = (): void => {
		this.position = 'bottom';
		if (isNil(this._appendTo) || isNil(this._anchor)) {
			return;
		}
		const anchorRectangle = this._anchor.getBoundingClientRect();
		const overlayRectangle = this._host.nativeElement.getBoundingClientRect();
		const bodyRectangle = document.body.getBoundingClientRect();
		if (this.adjustWidth) {
			this._width = anchorRectangle.width;
		}
		this._width = this._width || overlayRectangle.width || 300;
		this._left = Math.min(anchorRectangle.left, bodyRectangle.width - this._width);
		if (this.align !== 'left') {
			this._left = Math.max(anchorRectangle.left + anchorRectangle.width - this._width, 0);
		}
		if (isNil(this.container)) {
			this._top = anchorRectangle.bottom;
			this._bottom = undefined;
			return;
		}
		this._containerRect = this._container.getBoundingClientRect();
		const bottomDifference = this._containerRect.bottom - anchorRectangle.bottom - overlayRectangle.height;
		const topDifference = anchorRectangle.top - this._containerRect.top - overlayRectangle.height;
		if (!this.adjustHeight) {
			this._top = anchorRectangle.bottom + window.scrollY;
			this._bottom = undefined;
		} else {
			if (topDifference > bottomDifference) {
				this.position = 'top';
				this._bottom = window.innerHeight - anchorRectangle.top - window.scrollY;
				this._maxHeight = anchorRectangle.top - this._containerRect.top;
				this._top = undefined;
			} else {
				this._top = anchorRectangle.bottom + window.scrollY;
				this._maxHeight = this._containerRect.bottom - anchorRectangle.bottom;
			}
		}
		if (!isNil(this.maxHeight)) {
			this._maxHeight = Math.min(this.maxHeight, this._maxHeight);
		}
		if (bottomDifference > 5) {
			this._top = anchorRectangle.bottom + window.scrollY;
			this._bottom = undefined;
			return;
		}
		if (topDifference > 5) {
			this.position = 'top';
			this._bottom = window.innerHeight - anchorRectangle.top - window.scrollY;
			this._top = undefined;
			return;
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
			if (this._initialStyles.top === '-9999px') {
				this._initialStyles.top = '';
			}
			this._host.nativeElement.style.top = '';
		}
		if (!isNil(this._left) && this._left !== -9999) {
			this._host.nativeElement.style.left = `${this._left}px`;
		} else if (this._left !== -9999) {
			this._host.nativeElement.style.left = this._initialStyles.left;
		}
		if (!isNil(this._bottom)) {
			this._host.nativeElement.style.bottom = `${this._bottom}px`;
		} else {
			this._host.nativeElement.style.bottom = '';
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
