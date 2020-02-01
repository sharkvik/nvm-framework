import { Directive, Optional, TemplateRef } from '@angular/core';

@Directive({
	selector: '[nvm-dd-button]'
})
export class NvmDdButton {
	constructor(@Optional() public readonly templateRef: TemplateRef<{ $implicit: (ev: MouseEvent) => void }>) { }
}
