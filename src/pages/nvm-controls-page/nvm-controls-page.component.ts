import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { NvmOverlayComponent } from 'projects/nvm-overlay/src/public-api';
import { NvmAutocompleteItem } from 'projects/nvm-autocomplete/src/public-api';

@Component({
	selector: 'nvm-nvm-controls-page',
	templateUrl: './nvm-controls-page.component.html',
	styleUrls: ['./nvm-controls-page.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class NvmControlsPageComponent implements OnInit {
	public acModel: NvmAutocompleteItem[] = [];
	public acSuggestions: NvmAutocompleteItem[] = [];

	public acModel1: NvmAutocompleteItem;
	public acSuggestions1: NvmAutocompleteItem[] = [];
	constructor() { }

	public ngOnInit() {
	}

	public showOverlay = (overly: NvmOverlayComponent): void => {
		overly.show();
	}

	public hideOverlay = (overly: NvmOverlayComponent): void => {
		overly.hide();
	}

	public search = (ev: {query: string, originalEvent: KeyboardEvent}): void => {
		this.acSuggestions = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => new NvmAutocompleteItem(x, ev.query + x, x.toString()));
	}

	public search1 = (ev: { query: string, originalEvent: KeyboardEvent }): void => {
		this.acSuggestions1 = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => new NvmAutocompleteItem(x, ev.query + x, x.toString()));
	}
}
