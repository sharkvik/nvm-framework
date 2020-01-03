import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Input, ElementRef, OnDestroy } from '@angular/core';
import { isNil } from 'lodash';
import { Subscription, Subject, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
	selector: 'nvm-overlay',
	templateUrl: './nvm-overlay.component.html',
	styleUrls: ['./nvm-overlay.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class NvmOverlayComponent implements OnInit, OnDestroy {
	@Input() public appendTo: ElementRef<HTMLElement>;
	@Input() public anchor: ElementRef<HTMLElement>;
	@Input() public container: ElementRef<HTMLElement>;
	@Input() public adjustWidth: boolean = false;
	@Input() public adjustHeight: boolean = true;

	public top: number = -9999;
	public left: number = -9999;
	public right: number;
	public bottom: number;
	public maxHeight: number;
	public maxWidth: number;

	public get isVisible() {
		return this.display;
	}

	protected display: boolean = false;

	private _show: Subject<any> = new Subject<any>();
	private _subscriptions: Subscription = new Subscription();
	constructor(private _host: ElementRef<HTMLElement>) { }

	public ngOnInit() {
		this._subscriptions.add(this._show.pipe(switchMap(() => {
			this._displayImpl();
			return of(true);
		})).subscribe());
	}

	public ngOnDestroy(): void {
		this._subscriptions.unsubscribe();
	}

	public show = (): void => {
		this.display = true;
		this._show.next();
	}

	private _adjust = (): void => {
		if (isNil(this.appendTo) || isNil(this.anchor)) {
			return;
		}
		const anchorRectangle = this.anchor.nativeElement.getBoundingClientRect();
		if (isNil(this.container)) {
			this.top = anchorRectangle.bottom;
			this.left = anchorRectangle.left;
			return;
		}
		const containerRect = this.container.nativeElement.getBoundingClientRect();
		const overlayRectangle = this._host.nativeElement.getBoundingClientRect();
		const bottomDifference = containerRect.bottom - anchorRectangle.bottom + overlayRectangle.height;
		const topDifference = containerRect.height - anchorRectangle.top + overlayRectangle.height;

		if (bottomDifference > 0) {
			this.top = anchorRectangle.bottom;
			this.left = anchorRectangle.left;
			return;
		}
		if (topDifference > 0) {
			this.bottom = anchorRectangle.top;
			this.left = anchorRectangle.left;
			return;
		}
		if (!this.adjustHeight) {
			this.top = anchorRectangle.bottom;
			this.left = anchorRectangle.left;
			return;
		}
		if (topDifference > bottomDifference) {
			this.bottom = anchorRectangle.top;
			this.left = anchorRectangle.left;
			this.maxHeight = containerRect.height - anchorRectangle.top;
		} else {
			this.top = anchorRectangle.bottom;
			this.left = anchorRectangle.left;
			this.maxHeight = containerRect.bottom - anchorRectangle.bottom;
		}

	}

	private _displayImpl = (): void => {
		this._adjust();
		this._fillPosition();
		this._append();
	}

	private _fillPosition = (): void => {
		if (!isNil(this.top) && this.top !== -9999) {
			this._host.nativeElement.style.top = `${this.top}px`;
		}
		if (!isNil(this.left) && this.left !== -9999) {
			this._host.nativeElement.style.left = `${this.left}px`;
		}
		if (!isNil(this.bottom)) {
			this._host.nativeElement.style.bottom = `${this.bottom}px`;
		}
		if (!isNil(this.right)) {
			this._host.nativeElement.style.right = `${this.right}px`;
		}
		if (!isNil(this.maxHeight)) {
			this._host.nativeElement.style.maxHeight = `${this.maxHeight}px`;
		}
		if (!isNil(this.maxWidth)) {
			this._host.nativeElement.style.maxWidth = `${this.maxWidth}px`;
		}
	}

	private _append = (): void => {
		if (isNil(this.appendTo)) {
			return;
		}
		this._host.nativeElement.remove();
		this.appendTo.nativeElement.appendChild(this._host.nativeElement);
	}
}
