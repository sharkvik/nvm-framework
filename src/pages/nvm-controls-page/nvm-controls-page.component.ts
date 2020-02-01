import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { NvmAutocompleteItem } from 'projects/nvm-autocomplete/src/public-api';
import { NvmOverlayComponent } from 'projects/nvm-overlay/src/public-api';

@Component({
	selector: 'nvm-controls-page',
	templateUrl: './nvm-controls-page.component.html',
	styleUrls: ['./nvm-controls-page.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class NvmControlsPageComponent implements OnInit {
	constructor() { }
	public acModels: {
		acModel: NvmAutocompleteItem[],
		acSuggestions: NvmAutocompleteItem[],
		search: (ev: { query: string, originalEvent: KeyboardEvent
	}) => void }[] = [];

	public acModel: NvmAutocompleteItem[] = [];
	public acSuggestions: NvmAutocompleteItem[] = [];

	public acModel1: NvmAutocompleteItem;
	public acSuggestions1: NvmAutocompleteItem[] = [];

	public acModel3: NvmAutocompleteItem;
	public acSuggestions3: NvmAutocompleteItem[] = [];

	public acModel4: NvmAutocompleteItem;
	public acSuggestions4: NvmAutocompleteItem[] = [];

	public acModel5: NvmAutocompleteItem;
	public acSuggestions5: NvmAutocompleteItem[] = [];

	public acModel6: NvmAutocompleteItem;
	public acSuggestions6: NvmAutocompleteItem[] = [];


	public acModel7: NvmAutocompleteItem;
	public acSuggestions7: NvmAutocompleteItem[] = [];

	public ngOnInit() {
		for (let i = 0; i < 1000; i++) {
			this.acModels.push({
				acModel: [],
				acSuggestions: [],
				search: (ev: { query: string, originalEvent: KeyboardEvent }): void => {
					this.acModels[i].acSuggestions = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => new NvmAutocompleteItem(x, ev.query + x, ev.query + x));
				}
			});
		}
	}

	public call = (func: (ev: MouseEvent) => void, ev: MouseEvent) => {
		func(ev);
	}

	public showOverlay = (overly: NvmOverlayComponent): void => {
		overly.show();
	}

	public hideOverlay = (overly: NvmOverlayComponent): void => {
		overly.hide();
	}
	public search = (ev: { query: string, originalEvent: KeyboardEvent }): void => {
		this.acSuggestions = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => new NvmAutocompleteItem(x, ev.query + x, ev.query + x));
	}
	public search1 = (ev: { query: string, originalEvent: KeyboardEvent }): void => {
		this.acSuggestions1 = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => new NvmAutocompleteItem(x, ev.query + x, ev.query + x));
	}
	public search3 = (ev: { query: string, originalEvent: KeyboardEvent }): void => {
		this.acSuggestions3 = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => new NvmAutocompleteItem(x, ev.query + x, ev.query + x));
	}
	public search4 = (ev: { query: string, originalEvent: KeyboardEvent }): void => {
		this.acSuggestions4 = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => new NvmAutocompleteItem(x, ev.query + x, ev.query + x));
	}
	public search5 = (ev: { query: string, originalEvent: KeyboardEvent }): void => {
		this.acSuggestions5 = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => new NvmAutocompleteItem(x, ev.query + x, ev.query + x));
	}
	public search6 = (ev: { query: string, originalEvent: KeyboardEvent }): void => {
		this.acSuggestions6 = [];
	}
	public search7 = (ev: { query: string, originalEvent: KeyboardEvent }): void => {
		this.acSuggestions7 = [];
	}
	public onfocus6 = (ov: NvmOverlayComponent) => {
		ov.show();
	}
}
