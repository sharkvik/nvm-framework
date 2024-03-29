import { Injectable, NgZone } from '@angular/core';
import { NvmOverlayComponent } from './nvm-overlay/nvm-overlay.component';
import { throttle } from 'lodash';

@Injectable({
	providedIn: 'root'
})
export class NvmOverlayService {
	constructor(private _zone: NgZone) {
		this._zone.runOutsideAngular(() => {
			document.addEventListener('scroll', (ev: Event) => this._adjustPosition(ev), true);
			document.addEventListener('mousedown', (ev: Event) => this._hide(ev), true);
		});
	}
	private _overlays: Map<string, NvmOverlayComponent> = new Map<string, NvmOverlayComponent>();

	private _adjustPosition = throttle((ev: Event) => {
		Array.from(this._overlays.entries())
			.filter((o: [string, NvmOverlayComponent]) => o[1].isVisible && this._customContains(ev.target as Element, o[1]))
			.forEach((o: [string, NvmOverlayComponent]) => o[1].adjust());
	}, 100);

	public register = (overlay: NvmOverlayComponent): void => {
		this._overlays.set(overlay.id, overlay);
	}

	public remove = (id: string): void => {
		this._overlays.delete(id);
	}

	private _hide = (ev: Event): void => {
		Array.from(this._overlays.entries())
			.filter((o: [string, NvmOverlayComponent]) => o[1].isVisible && !o[1].contains(ev.target as HTMLElement))
			.forEach((o: [string, NvmOverlayComponent]) => o[1].hide());
	}

	private _customContains = (container: Element, element: NvmOverlayComponent) => {
		return container !== element.nativeElement && (container.contains(element.nativeElement) || container.contains(element.anchorElement));
	}
}
