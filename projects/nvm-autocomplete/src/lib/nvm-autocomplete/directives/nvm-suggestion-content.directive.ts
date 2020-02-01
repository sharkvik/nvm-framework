import { Directive, Optional, TemplateRef } from '@angular/core';
import { NvmAutocompleteItem } from '../models/nvm-autocomplete-item';

@Directive({
	selector: '[nvm-suggestion-content]'
})
export class NvmSuggestionContent {
	constructor(@Optional() public readonly templateRef: TemplateRef<{ $implicit: NvmAutocompleteItem }>) { }
}
