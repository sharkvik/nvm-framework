import { Directive, Optional, TemplateRef } from '@angular/core';
import { NvmAutocompleteItem } from '../models/nvm-autocomplete-item';

@Directive({
	selector: '[nvm-autocomplete-element]'
})
export class NvmAutocompleteElement {
	constructor(@Optional() public readonly templateRef: TemplateRef<{$implicit: NvmAutocompleteItem}>) { }
}
