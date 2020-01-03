import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NvmControlsPageComponent } from './nvm-controls-page.component';

const routes: Routes = [
	{ path: '', component: NvmControlsPageComponent },
	{ path: '**', redirectTo: '/' }
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class NvmControlsPageRoutingModule { }
