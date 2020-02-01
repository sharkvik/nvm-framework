import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InitialComponent } from './initial.component';
import { InitialRoutingModule } from './initial-routing.module';

@NgModule({
	imports: [
		CommonModule,
		InitialRoutingModule
	],
	declarations: [InitialComponent],
	entryComponents: [InitialComponent]
})
export class InitialModule { }
