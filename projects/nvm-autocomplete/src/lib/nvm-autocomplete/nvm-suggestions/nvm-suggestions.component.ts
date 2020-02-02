import {
	Component,
	OnInit,
	ViewEncapsulation,
	ChangeDetectionStrategy,
	forwardRef,
	ChangeDetectorRef,
	ViewRef,
	Input,
	ElementRef,
	ContentChild,
	ViewChild,
	Output,
	EventEmitter
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { NvmAutocompleteItem } from '../models/nvm-autocomplete-item';
import { debounce, isNil, cloneDeep } from 'lodash';
import { NvmAutocompleteElement } from '../directives/nvm-autocomplete-element.directive';
import { NvmOverlayComponent } from 'projects/nvm-overlay/src/public-api';

export const NVM_SUGGESTIONS_ACCESSOR = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => NvmSuggestionsComponent),
	multi: true
};

@Component({
	selector: 'nvm-suggestions',
	templateUrl: './nvm-suggestions.component.html',
	styleUrls: ['./nvm-suggestions.component.scss'],
	providers: [NVM_SUGGESTIONS_ACCESSOR],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class NvmSuggestionsComponent implements OnInit, ControlValueAccessor {

	constructor(private _cd: ChangeDetectorRef) { }
	@Output() public selected: EventEmitter<{ item: NvmAutocompleteItem, originalEvent: MouseEvent }>
		= new EventEmitter<{ item: NvmAutocompleteItem, originalEvent: MouseEvent }>();

	@Input() public appendTo: ElementRef<HTMLElement> | HTMLElement | string;
	@Input() public anchor: ElementRef<HTMLElement> | HTMLElement;
	@Input() public container: ElementRef<HTMLElement> | HTMLElement;
	@Input() public adjustWidth: boolean = false;
	@Input() public adjustHeight: boolean = true;

	public disabled: boolean = false;
	public model: Set<NvmAutocompleteItem>;
	@ContentChild(NvmAutocompleteElement, { static: false }) public templateOutlet: NvmAutocompleteElement;
	@ViewChild('overlay', { static: false }) public overlay: NvmOverlayComponent;

	private _hoverred: NvmAutocompleteItem;

	private _detectChangesDebounced = debounce(() => this._detectChanges(), 100);

	public ngOnInit() {

	}

	public trackByValue = (index: number, item: NvmAutocompleteItem): string => {
		return item.value;
	}

	public hover = (item: NvmAutocompleteItem): void => {
		this.model.forEach((x: NvmAutocompleteItem) => {
			if (x.selected && x.value !== item.value) {
				x.selected = false;
			}
		});
		item.selected = true;
		this._hoverred = item;
		this._detectChanges();
	}

	public writeValue(value: NvmAutocompleteItem[]): void {
		this.model = new Set<NvmAutocompleteItem>(value || []);
		if (!isNil(this.overlay)) {
			this._detectChanges(); // необходимо до открытия оверлэя пропихнуть элементы внутрь иначе оверлэй не будет иметь размер.
			if (this.model.size > 0) {
				this.overlay.show();
				this.hoverBottom();
			} else {
				this.overlay.hide();
			}
		}
		this._detectChangesDebounced();
	}

	public registerOnChange(fn: (...args: any[]) => void): void {
		this.onModelChange = fn;
	}

	public registerOnTouched(fn: (...args: any[]) => void): void {
		this.onModelTouched = fn;
	}

	public onModelChange: (...args: any[]) => void = () => { };

	public onModelTouched: (...args: any[]) => void = () => { };

	public setDisabledState?(isDisabled: boolean): void {
		this.disabled = isDisabled;
		this._detectChangesDebounced();
	}

	public hoverTop = (): void => {
		const model = Array.from(this.model);
		const selectedIndex = model.indexOf(this._hoverred);
		if (isNil(this._hoverred) || selectedIndex === 0) {
			this.hover(model[this.model.size - 1]);
			return;
		}
		this.hover(model[selectedIndex - 1]);
	}

	public hoverBottom = (): void => {
		const model = Array.from(this.model);
		const selectedIndex = model.indexOf(this._hoverred);
		if (isNil(this._hoverred) || selectedIndex === model.length - 1) {
			this.hover(model[0]);
			return;
		}
		this.hover(model[selectedIndex + 1]);
	}

	public select = (item?: NvmAutocompleteItem, ev?: MouseEvent): void => {
		item = item || this._hoverred;
		if (isNil(item) || item.disabled) {
			return;
		}
		this.selected.emit({ item: item, originalEvent: ev });
		this._hoverred = undefined;
		this.overlay.hide();
	}

	public onClosed = (): void => {
		if (isNil(this._hoverred)) {
			return;
		}
		this._hoverred.selected = false;
		this._hoverred = undefined;
	}

	private _detectChanges(): void {
		if ((this._cd as ViewRef).destroyed) {
			return;
		}
		this._cd.detectChanges();
	}
}
