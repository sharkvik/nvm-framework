import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@NgModule({
	imports: [CommonModule, HttpClientModule],
	providers: [HttpClient]
})
export class NvmSettingsModule {
	static forRoot(): ModuleWithProviders<NvmSettingsModule> {
		return {
			ngModule: NvmSettingsModule,
			providers: [NvmSettingsModule]
		};
	}
}
