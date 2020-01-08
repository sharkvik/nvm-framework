import { NgModule } from '@angular/core';
import { NvmAutocompleteComponent } from './nvm-autocomplete/nvm-autocomplete.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NvmChipsComponent } from './nvm-autocomplete/nvm-chips/nvm-chips.component';
import { NvmAutocompleteItemOutlet } from './nvm-autocomplete/directives/nvm-autocomplete-item-outlet.directive';
import { NvmAutocompleteElement } from './nvm-autocomplete/directives/nvm-autocomplete-element.directive';
import { NvmSuggestionsComponent } from './nvm-autocomplete/nvm-suggestions/nvm-suggestions.component';
import { NvmOverlayModule } from 'nvm-overlay';
import { NvmChipContent } from './nvm-autocomplete/directives/nvm-chip-content.directive';
import { NvmSuggestionContent } from './nvm-autocomplete/directives/nvm-suggestion-content.directive';


@NgModule({
	declarations: [
		NvmAutocompleteComponent,
		NvmChipsComponent,
		NvmAutocompleteItemOutlet,
		NvmAutocompleteElement,
		NvmSuggestionsComponent,
		NvmChipContent,
		NvmSuggestionContent
	],
	imports: [
		CommonModule,
		FormsModule,
		NvmOverlayModule
	],
	exports: [
		NvmAutocompleteComponent,
		NvmChipsComponent,
		NvmAutocompleteItemOutlet,
		NvmAutocompleteElement,
		NvmSuggestionsComponent,
		NvmChipContent,
		NvmSuggestionContent
	]
})
export class NvmAutocompleteModule { }
