import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

const appRoutes: Routes = [
	{ path: 'charts', loadChildren: () => import('src/pages/nvm-charts/nvm-charts-page.module').then(mod => mod.NvmChartsPageModule) },
	{ path: 'controlls', loadChildren: () => import('src/pages/nvm-controls-page/nvm-controls-page.module').then(mod => mod.NvmControlsPageModule) },
	{ path: '', loadChildren: () => import('src/pages/initial/initial.module').then(mod => mod.InitialModule) },
	{ path: '**', redirectTo: '/' }
];

@NgModule({
	imports: [
		RouterModule.forRoot(
			appRoutes,
			{
				enableTracing: true,
				useHash: true,
				urlUpdateStrategy: 'eager'
			}
		)
	]
})
export class AppRoutingModule { }
