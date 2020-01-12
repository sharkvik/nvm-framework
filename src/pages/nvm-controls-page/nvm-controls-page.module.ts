import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NvmControlsPageComponent } from './nvm-controls-page.component';
import { NvmControlsPageRoutingModule } from './nvm-controls-page-routing.module';
import { FormsModule } from '@angular/forms';
import { NvmAutocompleteModule } from 'projects/nvm-autocomplete/src/public-api';
import { NvmOverlayModule } from 'projects/nvm-overlay/src/public-api';

@NgModule({
	imports: [
		CommonModule,
		NvmControlsPageRoutingModule,
		NvmOverlayModule,
		NvmAutocompleteModule,
		FormsModule
	],
	declarations: [NvmControlsPageComponent]
})
export class NvmControlsPageModule { }
