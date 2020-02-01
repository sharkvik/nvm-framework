import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class NvmAutocompleteService {
	public blured: Subject<Event> = new Subject<Event>();
	constructor(private _zone: NgZone) {
		this._zone.runOutsideAngular(() => {
			document.addEventListener('click', this._blur, true);
			window.addEventListener('blur', this._blur, true);
			document.addEventListener('keydown', (e: KeyboardEvent) => {
				if (e.key !== 'Tab') {
					return;
				}
				this._blur(e);
			}, true);
		});
	}

	private _blur = (ev: Event): void => {
		this.blured.next(ev);
	}
}
