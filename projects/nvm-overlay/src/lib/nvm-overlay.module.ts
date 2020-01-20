import { NgModule } from '@angular/core';
import { NvmOverlayComponent } from './nvm-overlay/nvm-overlay.component';
import { CommonModule } from '@angular/common';


@NgModule({
	declarations: [NvmOverlayComponent],
	imports: [
		CommonModule
	],
	exports: [NvmOverlayComponent]
})
export class NvmOverlayModule { }
