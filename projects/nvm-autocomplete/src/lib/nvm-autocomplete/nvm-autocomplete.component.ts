import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { NvmAutocompleteItem } from './models/nvm-autocomplete-item';
import { NvmChipsComponent } from './nvm-chips/nvm-chips.component';
import { switchMap } from 'rxjs/operators';
import { NvmSuggestionsComponent } from './nvm-suggestions/nvm-suggestions.component';

@Component({
	selector: 'nvm-autocomplete',
	templateUrl: './nvm-autocomplete.component.html',
	styleUrls: ['./nvm-autocomplete.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class NvmAutocompleteComponent implements OnInit {
	@ViewChild(NvmChipsComponent, { static: true }) public chipsControl: NvmChipsComponent;
	@ViewChild(NvmSuggestionsComponent, { static: true }) public suggestionsControl: NvmSuggestionsComponent;

	public chips: NvmAutocompleteItem[];

	public get anchor(): Element {
		return this._host.nativeElement;
	}

	constructor(private _host: ElementRef<Element>) {
		this.chips = [
			new NvmAutocompleteItem({}, 'chip 1', 'chip1'),
			new NvmAutocompleteItem({}, 'chip 2', 'chip2'),
			new NvmAutocompleteItem({}, 'chip 3', 'chip3'),
			new NvmAutocompleteItem({}, 'chip 4', 'chip4'),
			new NvmAutocompleteItem({}, 'chip 5', 'chip5'),
		]
	}

	public ngOnInit() {
	}

	public keyPress = (ev: KeyboardEvent): void => {
		switch(ev.keyCode) {
			case 37: { // left
				this.chipsControl.selectLeft();
				break;
			}
			case 39: { // right
				this.chipsControl.selectRight();
				break;
			}
			case 38: { // up
				if (!this.suggestionsControl.overlay.isVisible) {
					this.suggestionsControl.overlay.show();
				}
				this.suggestionsControl.hoverTop();
				break;
			}
			case 40: { // down
				if (!this.suggestionsControl.overlay.isVisible) {
					this.suggestionsControl.overlay.show();
				}
				this.suggestionsControl.hoverBottom();
				break;
			}
			case 8: { // backspace
				this.chipsControl.deleteLeft();
				break;
			}
			case 46: { // delete
				this.chipsControl.deleteRight();
				break;
			}
			case 13: { // enter
				this.suggestionsControl.select();
				break;
			}
		}
	}
}
