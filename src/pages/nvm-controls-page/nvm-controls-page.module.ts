import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NvmControlsPageComponent } from './nvm-controls-page.component';
import { NvmControlsPageRoutingModule } from './nvm-controls-page-routing.module';

@NgModule({
	imports: [
		CommonModule,
		NvmControlsPageRoutingModule
	],
	declarations: [NvmControlsPageComponent]
})
export class NvmControlsPageModule { }
