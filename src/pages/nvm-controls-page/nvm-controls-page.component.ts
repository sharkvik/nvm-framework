import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'nvm-nvm-controls-page',
  templateUrl: './nvm-controls-page.component.html',
  styleUrls: ['./nvm-controls-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NvmControlsPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
