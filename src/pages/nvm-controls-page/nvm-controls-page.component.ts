import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { NvmOverlayComponent } from 'projects/nvm-overlay/src/public-api';

@Component({
	selector: 'nvm-nvm-controls-page',
	templateUrl: './nvm-controls-page.component.html',
	styleUrls: ['./nvm-controls-page.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class NvmControlsPageComponent implements OnInit {

	constructor() { }

	public ngOnInit() {
	}

	public showOverlay = (overly: NvmOverlayComponent): void => {
		overly.show();
	}

	public hideOverlay = (overly: NvmOverlayComponent): void => {
		overly.hide();
	}

}
