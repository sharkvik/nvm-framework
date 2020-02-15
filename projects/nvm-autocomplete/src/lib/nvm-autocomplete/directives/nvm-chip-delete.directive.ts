import { Directive, Optional, TemplateRef } from '@angular/core';
import { NvmAutocompleteItem } from '../models/nvm-autocomplete-item';

@Directive({
	selector: '[nvm-chip-delete]'
})
export class NvmChipDelete {
	constructor(@Optional() public readonly templateRef: TemplateRef<{ $implicit: NvmAutocompleteItem }>) { }
}
