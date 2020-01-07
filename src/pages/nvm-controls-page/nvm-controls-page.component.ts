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

	constructor() { }

	public ngOnInit() {
	}

	public showOverlay = (overly: NvmOverlayComponent): void => {
		overly.show();
	}

	public hideOverlay = (overly: NvmOverlayComponent): void => {
		overly.hide();
	}

	public acModel: NvmAutocompleteItem[] = [];
	public acSuggestions: NvmAutocompleteItem[] = [];
	public search = (ev: {query: string, originalEvent: KeyboardEvent}): void => {
		this.acSuggestions = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => new NvmAutocompleteItem(x, ev.query + x, ev.query + x));
	}

	public acModel1: NvmAutocompleteItem;
	public acSuggestions1: NvmAutocompleteItem[] = [];
	public search1 = (ev: { query: string, originalEvent: KeyboardEvent }): void => {
		this.acSuggestions1 = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => new NvmAutocompleteItem(x, ev.query + x, ev.query + x));
	}

	public acModel3: NvmAutocompleteItem;
	public acSuggestions3: NvmAutocompleteItem[] = [];
	public search3 = (ev: { query: string, originalEvent: KeyboardEvent }): void => {
		this.acSuggestions3 = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => new NvmAutocompleteItem(x, ev.query + x, ev.query + x));
	}

	public acModel4: NvmAutocompleteItem;
	public acSuggestions4: NvmAutocompleteItem[] = [];
	public search4 = (ev: { query: string, originalEvent: KeyboardEvent }): void => {
		this.acSuggestions4 = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => new NvmAutocompleteItem(x, ev.query + x, ev.query + x));
	}

	public acModel5: NvmAutocompleteItem;
	public acSuggestions5: NvmAutocompleteItem[] = [];
	public search5 = (ev: { query: string, originalEvent: KeyboardEvent }): void => {
		this.acSuggestions5 = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => new NvmAutocompleteItem(x, ev.query + x, ev.query + x));
	}

	public acModel6: NvmAutocompleteItem;
	public acSuggestions6: NvmAutocompleteItem[] = [];
	public search6 = (ev: { query: string, originalEvent: KeyboardEvent }): void => {
		this.acSuggestions6 = [];
	}
}
