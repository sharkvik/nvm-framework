import { Directive, OnChanges, ViewContainerRef, TemplateRef, Input, SimpleChanges } from '@angular/core';
import { analyzeChanges } from '../utils';

@Directive({
	exportAs: 'nvm-dd-button-outlet',
	selector: 'nvm-dd-button-outlet, [nvm-dd-button-outlet]'
})
export class NvmDdButtonOutlet implements OnChanges {
	constructor(private readonly _viewContainer: ViewContainerRef) { }

	@Input() public template: TemplateRef<{ $implicit: (ev: MouseEvent) => void }>;
	@Input() public context: { $implicit: (ev: MouseEvent) => void };

	public ngOnChanges(changes: SimpleChanges): void {
		const [, tmpl] = analyzeChanges(changes, () => this.template);
		const [, ctx] = analyzeChanges(changes, () => this.context);

		if (tmpl && ctx) {
			this._viewContainer.clear();
			this._viewContainer.createEmbeddedView(tmpl, ctx);
		}
	}
}
