import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NvmChartsComponent } from './nvm-charts.component';
import { NvmChartsRoutingModule } from './nvm-charts-routing.module';
import { NvmChartsModule } from '@nvm/nvm-charts';

@NgModule({
	imports: [
		CommonModule,
		NvmChartsModule,
		NvmChartsRoutingModule
	],
	declarations: [NvmChartsComponent],
	entryComponents: [NvmChartsComponent]
})
export class NvmChartsPageModule { }
