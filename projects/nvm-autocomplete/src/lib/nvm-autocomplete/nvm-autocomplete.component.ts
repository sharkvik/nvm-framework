import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ViewChild, ElementRef, Input, forwardRef, ChangeDetectorRef, ViewRef, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { NvmAutocompleteItem } from './models/nvm-autocomplete-item';
import { NvmChipsComponent } from './nvm-chips/nvm-chips.component';
import { NvmSuggestionsComponent } from './nvm-suggestions/nvm-suggestions.component';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { debounce, isNil, isEmpty, cloneDeep } from 'lodash';

export const NVM_AUTOCOMPLETE_ACCESSOR = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => NvmAutocompleteComponent),
	multi: true
};

@Component({
	selector: 'nvm-autocomplete',
	templateUrl: './nvm-autocomplete.component.html',
	styleUrls: ['./nvm-autocomplete.component.scss'],
	providers: [NVM_AUTOCOMPLETE_ACCESSOR],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class NvmAutocompleteComponent implements OnInit, ControlValueAccessor, OnChanges {
	@ViewChild(NvmChipsComponent, { static: true }) public chipsControl: NvmChipsComponent;
	@ViewChild(NvmSuggestionsComponent, { static: true }) public suggestionsControl: NvmSuggestionsComponent;
	@ViewChild('acInput', {static: true}) public inputControl: ElementRef<HTMLInputElement>;

	@Input() public multiple: boolean = true;
	@Input() public customSuggestions: NvmAutocompleteItem[] = [];

	@Output() public complete: EventEmitter<{ query: string, originalEvent: KeyboardEvent }> = new EventEmitter<{ query: string, originalEvent: KeyboardEvent }>();
	@Output() public input: EventEmitter<KeyboardEvent> = new EventEmitter<KeyboardEvent>();
	@Output() public suggestionsChange: EventEmitter<NvmAutocompleteItem[]> = new EventEmitter<NvmAutocompleteItem[]>();
	@Output() public selected: EventEmitter<NvmAutocompleteItem> = new EventEmitter<NvmAutocompleteItem>();
	@Output() public deleted: EventEmitter<NvmAutocompleteItem> = new EventEmitter<NvmAutocompleteItem>();

	public suggestionsCollection: NvmAutocompleteItem[] = [];
	public disabled: boolean = false;

	@Input() public set suggestions(val: NvmAutocompleteItem[]) {
		this._suggestions = val;
		this.suggestionsCollection = [...this._suggestions, ...this.customSuggestions];
		this._detectChanges();
	}

	public get anchor(): Element {
		return this._host.nativeElement;
	}

	public get valueIsEmpty(): boolean {
		return isEmpty(this.inputControl.nativeElement.value);
	}

	public get model(): NvmAutocompleteItem[] | NvmAutocompleteItem {
		if (this.multiple) {
			return this.innerModel;
		} else {
			if (this.innerModel.length > 0) {
				this.innerModel = [this.innerModel[this.innerModel.length - 1]];
			}
			return this.innerModel[0];
		}
	}

	public set model(value: NvmAutocompleteItem[] | NvmAutocompleteItem) {
		if (isNil(value)) {
			return;
		}
		if (this.multiple) {
			if (!Array.isArray(value)) {
				throw new Error('model must be array');
			}
			this.innerModel = value;
		} else {
			if (Array.isArray(value)) {
				throw new Error('model must be not array');
			}
			this.innerModel = [value];
		}
	}

	public innerModel: NvmAutocompleteItem[];
	private _suggestions: NvmAutocompleteItem[] = [];
	constructor(private _host: ElementRef<Element>, private _cd: ChangeDetectorRef) {
	}

	public ngOnInit() {
	}

	public ngOnChanges(changes: SimpleChanges): void {
		if (!isNil(changes.customSuggestions) && !changes.customSuggestions.isFirstChange) {
			const csChange = changes.customSuggestions;
			if (JSON.stringify(csChange.previousValue) === JSON.stringify(csChange.currentValue)) {
				return;
			}
			this.suggestionsCollection = [...this._suggestions, ...this.customSuggestions];
			this._detectChanges();
		}
	}

	public onItemDeleted = (item: NvmAutocompleteItem): void => {
		this.deleted.emit(item);
		this.onModelChange(this.model);
	}

	public onItemSelected = (item: NvmAutocompleteItem): void => {
		const newItem = cloneDeep(item);
		newItem.selected = false;
		this.innerModel = [...this.innerModel, newItem];
		this.inputControl.nativeElement.value = '';
		this.selected.emit(item);
		this.onModelChange(this.model);
	}

	public onInput = (ev: KeyboardEvent): void => {
		this._onComplete(ev);
		this.input.emit(ev);
		if (this.valueIsEmpty) {
			setTimeout(() => this.suggestionsControl.overlay.adjust());
		}
	}

	public keyPress = (ev: KeyboardEvent): void => {
		switch(ev.keyCode) {
			case 37: { // left
				if (this.inputControl.nativeElement.selectionStart === this.inputControl.nativeElement.selectionEnd && this.inputControl.nativeElement.selectionEnd === 0) {
					this.chipsControl.selectLeft();
				}
				break;
			}
			case 39: { // right
				if (isEmpty(this.inputControl.nativeElement.value)) {
					this.chipsControl.selectRight();
				}
				break;
			}
			case 38: { // up
				if (isEmpty(this.inputControl.nativeElement.value)) {
					return;
				}
				if (!this.suggestionsControl.overlay.isVisible) {
					this.suggestionsControl.overlay.show();
				}
				this.suggestionsControl.hoverTop();
				break;
			}
			case 40: { // down
				if (isEmpty(this.inputControl.nativeElement.value)) {
					return;
				}
				if (!this.suggestionsControl.overlay.isVisible) {
					this.suggestionsControl.overlay.show();
				}
				this.suggestionsControl.hoverBottom();
				break;
			}
			case 8: { // backspace
				if (this.inputControl.nativeElement.selectionStart === this.inputControl.nativeElement.selectionEnd && this.inputControl.nativeElement.selectionEnd === 0) {
					this.chipsControl.deleteLeft();
				}
				break;
			}
			case 46: { // delete
				this.chipsControl.deleteRight();
				break;
			}
			case 13: { // enter
				this.suggestionsControl.select();
				break;
			}
		}
	}

	public writeValue(value: NvmAutocompleteItem[] | NvmAutocompleteItem): void {
		this.model = value;
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

	private _onComplete = debounce((ev: KeyboardEvent): void => {
		if (isEmpty(this.inputControl.nativeElement.value)) {
			return;
		}
		this.complete.emit({
			query: this.inputControl.nativeElement.value,
			originalEvent: ev
		});
	}, 300)

	private _detectChanges = debounce((): void => {
		if ((this._cd as ViewRef).destroyed) {
			return;
		}
		this._cd.detectChanges();
	}, 100)
}
