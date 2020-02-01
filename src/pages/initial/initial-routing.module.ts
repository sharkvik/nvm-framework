import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InitialComponent } from './initial.component';

const routes: Routes = [
	{ path: '', component: InitialComponent },
	{ path: '**', redirectTo: '/' }
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class InitialRoutingModule { }
