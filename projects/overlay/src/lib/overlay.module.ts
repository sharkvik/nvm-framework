import { NgModule } from '@angular/core';

import { OverlayRoutingModule } from './overlay-routing.module';
import { OverlayComponent } from './overlay.component';


@NgModule({
  declarations: [OverlayComponent],
  imports: [
    OverlayRoutingModule
  ],
  exports: [OverlayComponent]
})
export class OverlayModule { }
