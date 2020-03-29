
import { NgModule, SystemJsNgModuleLoader, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideRoutes, Route } from '@angular/router';
import { NvmLoaderComponent } from './nvm-loader.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [NvmLoaderComponent],
  exports: [NvmLoaderComponent]
})
export class NvmLoaderModule {
  static forRoot(lazyRoutes: Route[]): ModuleWithProviders<NvmLoaderModule> {
    return {
      ngModule: NvmLoaderModule,
      providers: [
        SystemJsNgModuleLoader,
        provideRoutes(lazyRoutes),
      ]
    };
  }
  static forChild(lazyRoutes: Route[]): ModuleWithProviders<NvmLoaderModule> {
    return {
      ngModule: NvmLoaderModule,
      providers: [
        SystemJsNgModuleLoader,
        provideRoutes(lazyRoutes),
      ]
    };
  }
}

