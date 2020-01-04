import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NvmControlsPageComponent } from './nvm-controls-page.component';
import { NvmControlsPageRoutingModule } from './nvm-controls-page-routing.module';
import { NvmOverlayModule } from 'projects/nvm-overlay/src/public-api';

@NgModule({
	imports: [
		CommonModule,
		NvmControlsPageRoutingModule,
		NvmOverlayModule
	],
	declarations: [NvmControlsPageComponent]
})
export class NvmControlsPageModule { }
