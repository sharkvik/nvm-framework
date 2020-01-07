import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, forwardRef, ContentChild, ChangeDetectorRef, ViewRef, Output, EventEmitter, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NvmAutocompleteItem } from '../models/nvm-autocomplete-item';
import { NvmAutocompleteElement } from '../directives/nvm-autocomplete-element.directive';
import { isNil, debounce } from 'lodash';

export const NVM_CHiPS_ACCESSOR = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => NvmChipsComponent),
	multi: true
};

@Component({
	selector: 'nvm-chips',
	templateUrl: './nvm-chips.component.html',
	styleUrls: ['./nvm-chips.component.scss'],
	providers: [NVM_CHiPS_ACCESSOR],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class NvmChipsComponent implements ControlValueAccessor, OnInit {
	@Output() public selected: EventEmitter<{ item: NvmAutocompleteItem, originalEvent: MouseEvent }> = new EventEmitter<{ item: NvmAutocompleteItem, originalEvent: MouseEvent }>();
	@Output() public deleted: EventEmitter<NvmAutocompleteItem> = new EventEmitter<NvmAutocompleteItem>();

	@Input() public allowDelete: boolean;
	@Input() public allowSearch: boolean;

	public disabled: boolean;

	public model: Set<NvmAutocompleteItem>;
	@ContentChild(NvmAutocompleteElement, { static: false }) public templateOutlet: NvmAutocompleteElement;

	private _selectedItem: NvmAutocompleteItem;
	constructor(private _cd: ChangeDetectorRef) { }

	public ngOnInit() {
	}

	public trackByValue = (index: number, item: NvmAutocompleteItem): string => {
		return item.value;
	}

	public delete = (item: NvmAutocompleteItem, ev?: MouseEvent): void => {
		if (!this.allowDelete) {
			return;
		}
		this.model.delete(item);
		this.deleted.emit(item);
		this.onModelChange(Array.from(this.model.values()));
		this._detectChanges();
	}

	public select = (item: NvmAutocompleteItem, ev?: MouseEvent): void => {
		if (isNil(item)) {
			return;
		}
		this.model.forEach((x: NvmAutocompleteItem) => {
			if (x.selected && x.value !== item.value) {
				x.selected = false;
			}
		});
		item.selected = !item.selected;
		this._selectedItem = item.selected ? item : undefined;
		this.selected.next({ item: this._selectedItem, originalEvent: ev || new MouseEvent('click') });
		this._detectChanges();
	}

	public selectLeft = (): void => {
		const model = Array.from(this.model);
		if (isNil(this._selectedItem)) {
			this.select(model[this.model.size - 1]);
			return;
		}
		const selectedIndex = model.indexOf(this._selectedItem);
		if (selectedIndex === 0) {
			return;
		}
		this.select(model[selectedIndex - 1]);
	}

	public selectRight = (): void => {
		const model = Array.from(this.model);
		if (isNil(this._selectedItem)) {
			return;
		}
		const selectedIndex = model.indexOf(this._selectedItem);
		if (selectedIndex === model.length - 1) {
			this.select(this._selectedItem);
			return;
		}
		this.select(model[selectedIndex + 1]);
	}

	public deleteRight = (): void => {
		if (isNil(this._selectedItem)) {
			return;
		}
		const model = Array.from(this.model);
		const selectedIndex = model.indexOf(this._selectedItem);
		if (selectedIndex === model.length - 1) {
			this.delete(this._selectedItem);
			this._selectedItem = undefined;
			return;
		}
		this.delete(model[selectedIndex + 1]);
	}
	public deleteLeft = (): void => {
		if (isNil(this._selectedItem)) {
			this.selectLeft();
			return;
		}
		const model = Array.from(this.model);
		const selectedIndex = model.indexOf(this._selectedItem);
		if (selectedIndex === 0) {
			this.delete(this._selectedItem);
			this._selectedItem = undefined;
			return;
		}
		this.delete(model[selectedIndex - 1]);
	}

	public clearSelection = (): void => {
		this._selectedItem.selected = false;
		this._selectedItem = undefined;
		this._detectChanges();
	}

	public writeValue(value: NvmAutocompleteItem[]): void {
		this.model = new Set<NvmAutocompleteItem>(value);
		this._detectChanges();
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
		this._detectChanges();
	}

	private _detectChanges = debounce((): void => {
		if ((this._cd as ViewRef).destroyed) {
			return;
		}
		this._cd.detectChanges();
	}, 100)
}
