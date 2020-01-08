import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NvmControlsPageComponent } from './nvm-controls-page.component';
import { NvmControlsPageRoutingModule } from './nvm-controls-page-routing.module';
import { NvmAutocompleteModule } from 'nvm-autocomplete';
import { NvmOverlayModule } from 'nvm-overlay';
import { FormsModule } from '@angular/forms';

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
