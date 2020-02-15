import {
	Component,
	OnInit,
	ViewEncapsulation,
	ChangeDetectionStrategy,
	forwardRef,
	ContentChild,
	ChangeDetectorRef,
	ViewRef,
	Output,
	EventEmitter,
	Input,
	Attribute
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NvmAutocompleteItem } from '../models/nvm-autocomplete-item';
import { NvmAutocompleteElement } from '../directives/nvm-autocomplete-element.directive';
import { isNil, debounce } from 'lodash';
import { NvmChipDelete } from '../directives/nvm-chip-delete.directive';

export const NVM_CHiPS_ACCESSOR = {
	provide: NG_VALUE_ACCESSOR,
	// tslint:disable-next-line: no-use-before-declare
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
	constructor(private _cd: ChangeDetectorRef) { }
	@Output() public selected: EventEmitter<{ item: NvmAutocompleteItem, originalEvent: MouseEvent }>
		= new EventEmitter<{ item: NvmAutocompleteItem, originalEvent: MouseEvent }>();
	@Output() public deleted: EventEmitter<NvmAutocompleteItem> = new EventEmitter<NvmAutocompleteItem>();
	@Output() public itemRemovedLeft: EventEmitter<string> = new EventEmitter<string>();

	@Input() public allowDelete: boolean;
	@Input() public allowSearch: boolean;

	@Attribute('placeholder') public placeholder: string;

	public disabled: boolean;

	public model: Set<NvmAutocompleteItem>;
	@ContentChild(NvmAutocompleteElement, { static: false }) public templateOutlet: NvmAutocompleteElement;
	@ContentChild(NvmChipDelete, { static: false }) public templateDeleteOutlet: NvmChipDelete;

	private _selectedItem: NvmAutocompleteItem;

	private _detectChanges = debounce((): void => {
		if ((this._cd as ViewRef).destroyed) {
			return;
		}
		this._cd.detectChanges();
	}, 100);

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
		this.onModelChange(Array.from(this.model.values()));
		this.deleted.emit(item);
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
			this.itemRemovedLeft.next(this._selectedItem.label);
			this.delete(this._selectedItem);
			this._selectedItem = undefined;
			return;
		}
		const item = model[selectedIndex - 1];
		this.itemRemovedLeft.next(this._selectedItem.label);
		this._selectedItem.selected = false;
		this.delete(this._selectedItem);
		this._selectedItem = item;
		this._selectedItem.selected = true;
	}

	public clearSelection = (): void => {
		if (!isNil(this._selectedItem)) {
			this._selectedItem.selected = false;
		}
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
}
