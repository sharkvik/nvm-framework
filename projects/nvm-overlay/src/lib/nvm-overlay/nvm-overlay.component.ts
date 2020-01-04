import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Input, ElementRef, OnDestroy, ChangeDetectorRef, ViewRef, HostBinding } from '@angular/core';
import { isNil } from 'lodash';
import { Subscription, Subject, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';

@Component({
	selector: 'nvm-overlay',
	templateUrl: './nvm-overlay.component.html',
	styleUrls: ['./nvm-overlay.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations: [
		trigger("apear", [
			state('hidden', style({opacity: '0.0'})),
			state('visible', style({opacity: '1.0'})),
			transition('hidden <=> visible', [animate('0.5s', keyframes([
				style({ opacity: '0.2', offset: 0.1 }),
				style({ opacity: '0.4', offset: 0.2 }),
				style({ opacity: '0.6', offset: 0.3 }),
				style({ opacity: '0.8', offset: 0.4 })
			]))])
		])
	]
})
export class NvmOverlayComponent implements OnInit, OnDestroy {
	@Input() public appendTo: ElementRef<HTMLElement> | HTMLElement | string;
	@Input() public anchor: ElementRef<HTMLElement> | HTMLElement;
	@Input() public container: ElementRef<HTMLElement> | HTMLElement;
	@Input() public adjustWidth: boolean = false;
	@Input() public adjustHeight: boolean = true;

	public get isVisible() {
		return this._display;
	}

	private _appendTo: HTMLElement;
	private _anchor: HTMLElement;
	private _container: HTMLElement;
	@HostBinding('@apear')
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

	constructor(private _host: ElementRef<HTMLElement>, private _cd: ChangeDetectorRef) { }

	public ngOnInit() {
		this._host.nativeElement.remove();
		this._subscriptions.add(this._show.pipe(switchMap(() => {
			this._displayImpl();
			return of(true);
		})).subscribe());
		this._appendTo = this.appendTo === 'body' ? document.body : (this.appendTo as ElementRef<HTMLElement>).nativeElement || (this.appendTo as HTMLElement);
		this._anchor = (this.anchor as ElementRef<HTMLElement>).nativeElement || (this.anchor as HTMLElement);
		this._container = (this.container as ElementRef<HTMLElement>).nativeElement || (this.container as HTMLElement);
	}

	public ngOnDestroy(): void {
		this._subscriptions.unsubscribe();
	}

	public show = (): void => {
		this._display = true;
		this.apear = 'visible';
		this._detectChanges();
		this._show.next();
	}

	public hide = (): void => {
		this.apear = 'hidden';
		this._display = false;
		this._host.nativeElement.remove();
		this._detectChanges();
	}

	private _calculatePosition = (): void => {
		if (isNil(this._appendTo) || isNil(this._anchor)) {
			return;
		}
		const anchorRectangle = this._anchor.getBoundingClientRect();
		if (isNil(this.container)) {
			this._top = anchorRectangle.bottom;
			this._left = anchorRectangle.left;
			return;
		}
		const containerRect = this._container.getBoundingClientRect();
		const overlayRectangle = this._host.nativeElement.getBoundingClientRect();
		const bottomDifference = containerRect.bottom - anchorRectangle.bottom + overlayRectangle.height;
		const topDifference = containerRect.height - anchorRectangle.top + overlayRectangle.height;
		if (this.adjustWidth) {
			this._width = anchorRectangle.width;
		}

		if (bottomDifference > 0) {
			this._top = anchorRectangle.bottom;
			this._left = anchorRectangle.left;
			return;
		}
		if (topDifference > 0) {
			this._bottom = anchorRectangle.top;
			this._left = anchorRectangle.left;
			return;
		}
		if (!this.adjustHeight) {
			this._top = anchorRectangle.bottom;
			this._left = anchorRectangle.left;
			return;
		}
		if (topDifference > bottomDifference) {
			this._bottom = anchorRectangle.top;
			this._left = anchorRectangle.left;
			this._maxHeight = containerRect.height - anchorRectangle.top;
		} else {
			this._top = anchorRectangle.bottom;
			this._left = anchorRectangle.left;
			this._maxHeight = containerRect.bottom - anchorRectangle.bottom;
		}
	}

	private _displayImpl = (): void => {
		this._adjust();
		this._append();
		this._detectChanges();
	}

	private _adjust = (): void => {
		this._calculatePosition();
		this._fillPosition();
	}

	private _fillPosition = (): void => {
		if (!isNil(this._top) && this._top !== -9999) {
			this._host.nativeElement.style.top = `${this._top}px`;
		}
		if (!isNil(this._left) && this._left !== -9999) {
			this._host.nativeElement.style.left = `${this._left}px`;
		}
		if (!isNil(this._bottom)) {
			this._host.nativeElement.style.bottom = `${this._bottom}px`;
		}
		if (!isNil(this._right)) {
			this._host.nativeElement.style.right = `${this._right}px`;
		}
		if (!isNil(this._maxHeight)) {
			this._host.nativeElement.style.maxHeight = `${this._maxHeight}px`;
		}
		if (!isNil(this._width)) {
			this._host.nativeElement.style.width = `${this._width}px`;
		}
	}

	private _append = (): void => {
		if (isNil(this._appendTo)) {
			return;
		}
		this._appendTo.appendChild(this._host.nativeElement);
		this._host.nativeElement.style.position = 'absolute';
	}

	private _detectChanges = (): void => {
		if ((this._cd as ViewRef).destroyed) {
			return;
		}
		this._cd.detectChanges();
	}
}
