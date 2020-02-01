import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'nvm-initial',
	templateUrl: './initial.component.html',
	styleUrls: ['./initial.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class InitialComponent implements OnInit {

	constructor() { }

	ngOnInit() {
	}

}
