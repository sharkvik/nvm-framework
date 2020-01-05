import { Directive, ViewContainerRef, Input, TemplateRef, SimpleChanges, OnChanges } from '@angular/core';
import { analyzeChanges } from '../utils';
import { NvmAutocompleteItem } from '../models/nvm-autocomplete-item';

@Directive({
	exportAs: 'nvm-autocomplete-item-outlet',
	selector: 'nvm-autocomplete-item-outlet, [nvm-autocomplete-item-outlet]'
})
export class NvmAutocompleteItemOutlet implements OnChanges {
	constructor(private readonly _viewContainer: ViewContainerRef) { }

	@Input() public template: TemplateRef<{ $implicit: NvmAutocompleteItem }>;
	@Input() public context: { $implicit: NvmAutocompleteItem };

	public ngOnChanges(changes: SimpleChanges): void {
		const [, tmpl] = analyzeChanges(changes, () => this.template);
		const [, ctx] = analyzeChanges(changes, () => this.context);

		if (tmpl && ctx) {
			this._viewContainer.createEmbeddedView(tmpl, ctx);
		}
	}
}
