import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NvmChartsComponent } from './nvm-charts.component';

const routes: Routes = [
	{ path: '', component: NvmChartsComponent },
	{ path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NvmChartsRoutingModule { }
