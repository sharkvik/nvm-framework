import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ViewChild, ElementRef, Input, forwardRef, ChangeDetectorRef, ViewRef, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy, NgZone, ContentChild, Attribute } from '@angular/core';
import { NvmAutocompleteItem } from './models/nvm-autocomplete-item';
import { NvmChipsComponent } from './nvm-chips/nvm-chips.component';
import { NvmSuggestionsComponent } from './nvm-suggestions/nvm-suggestions.component';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { debounce, isNil, isEmpty, cloneDeep } from 'lodash';
import { NvmAutocompleteService } from './nvm-autocomplete.service';
import { Subscription, Observable, of } from 'rxjs';
import { NvmChipContent } from './directives/nvm-chip-content.directive';
import { NvmSuggestionContent } from './directives/nvm-suggestion-content.directive';
import { NvmDdButton } from './directives/nvm-dd-button.directive';

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
export class NvmAutocompleteComponent implements OnInit, ControlValueAccessor, OnChanges, OnDestroy {
	@ViewChild('acInput', { static: true }) public inputControl: ElementRef<HTMLInputElement>;
	@ViewChild(NvmChipsComponent, { static: true }) public chipsControl: NvmChipsComponent;
	@ViewChild(NvmSuggestionsComponent, { static: true }) public suggestionsControl: NvmSuggestionsComponent;
	@ContentChild(NvmChipContent, { static: false }) public chipTemplateOutlet: NvmChipContent;
	@ContentChild(NvmSuggestionContent, { static: false }) public suggestionTemplateOutlet: NvmSuggestionContent;
	@ContentChild(NvmDdButton, { static: false }) public ddTemplateOutlet: NvmDdButton;

	@Input() public multiple: boolean = true;
	@Input() public customSuggestions: NvmAutocompleteItem[] = [];
	@Input() public dropdown: boolean = false;
	@Input() public allowDelete: boolean = true;
	@Input() public allowSearch: boolean = true;
	@Input() public mapToValue: (item: NvmAutocompleteItem) => Observable<NvmAutocompleteItem> = (item: NvmAutocompleteItem) => of(item);

	@Input() public placeholder: string;

	@Output() public complete: EventEmitter<{ query: string, originalEvent: KeyboardEvent }> = new EventEmitter<{ query: string, originalEvent: KeyboardEvent }>();
	@Output() public ddClicked: EventEmitter<{ query: string, originalEvent: MouseEvent }> = new EventEmitter<{ query: string, originalEvent: MouseEvent }>();
	@Output() public input: EventEmitter<KeyboardEvent> = new EventEmitter<KeyboardEvent>();
	@Output() public suggestionsChange: EventEmitter<NvmAutocompleteItem[]> = new EventEmitter<NvmAutocompleteItem[]>();
	@Output() public selected: EventEmitter<NvmAutocompleteItem> = new EventEmitter<NvmAutocompleteItem>();
	@Output() public customSelected: EventEmitter<NvmAutocompleteItem> = new EventEmitter<NvmAutocompleteItem>();
	@Output() public deleted: EventEmitter<NvmAutocompleteItem> = new EventEmitter<NvmAutocompleteItem>();
	@Output() public focus: EventEmitter<Event> = new EventEmitter<Event>();
	@Output() public blur: EventEmitter<Event> = new EventEmitter<Event>();

	public suggestionsCollection: NvmAutocompleteItem[] = [];
	public disabled: boolean = false;
	public isInFocus: boolean = false;

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
	private _subscriptions: Subscription = new Subscription();

	constructor(
		private _host: ElementRef<Element>,
		private _cd: ChangeDetectorRef,
		private _acService: NvmAutocompleteService
	) {
		this._subscriptions.add(this._acService.blured.subscribe(this._blur));
	}

	public ngOnInit(): void {
	}

	public ngOnDestroy(): void {
		this._subscriptions.unsubscribe();
	}

	public ngOnChanges(changes: SimpleChanges): void {
		if (
			!isNil(changes.customSuggestions) && !changes.customSuggestions.firstChange
			|| !isNil(changes.suggestions) && !changes.suggestions.firstChange
		) {
			const collection = [...this.customSuggestions || [], ...this._suggestions || []];
			if (isEmpty(collection)) {
				const el = new NvmAutocompleteItem(null, 'Ничего не найдено', '');
				el.isCustom = true;
				el.isTemporary = true;
				el.disabled = true;
				this.customSuggestions = [el];
				this.suggestionsCollection = [...this.customSuggestions, ...this._suggestions || []];
			} else if (collection.some(x => !x.isTemporary)) {
				this.customSuggestions = this.customSuggestions.filter(x => !x.isTemporary && x.isCustom);
				this.suggestionsCollection = [...this.customSuggestions, ...this._suggestions || []];
			}
		}
		if (!isNil(changes.customSuggestions) && !changes.customSuggestions.firstChange) {
			const csChange = changes.customSuggestions;
			if (JSON.stringify(csChange.previousValue) === JSON.stringify(csChange.currentValue)) {
				return;
			}
			this.customSuggestions.forEach(x => x.isCustom = true);
			this.suggestionsCollection = [...this._suggestions, ...this.customSuggestions];
			this._detectChanges();
		}
		if (!isNil(changes.placeholder)) {
			this._detectChanges();
		}
	}

	public onItemDeleted = (item: NvmAutocompleteItem): void => {
		this.deleted.emit(item);
		this.onModelChange(this.model);
	}

	public onItemSelected = (item: { item: NvmAutocompleteItem, originalEvent: MouseEvent }): void => {
		this.disabled = true;
		this.mapToValue(item.item)
			.subscribe((newItem: NvmAutocompleteItem) => {
				this.disabled = false;
				newItem.selected = false;
				this.innerModel = [...(this.innerModel || []), newItem];
				this.inputControl.nativeElement.value = '';
				if (!newItem.isCustom) {
					this.selected.emit(newItem);
				} else if (!newItem.disabled) {
					this.customSelected.emit(newItem);
				}
				this.onModelChange(this.model);
				if (this.dropdown) {
					this.inputControl.nativeElement.focus();
				}
			}, () => this.disabled = false);
	}

	public onInput = (ev: KeyboardEvent): void => {
		this._onComplete(ev);
		this.input.emit(ev);
		if (this.valueIsEmpty && this.dropdown) {
			setTimeout(this._showSuggestions);
		} else if (this.valueIsEmpty) {
			this.suggestionsControl.overlay.hide();
		}
	}

	public dropDownClicked = (ev?: MouseEvent): void => {
		this._onDDClick(ev);
		if (this.valueIsEmpty) {
			setTimeout(this._showSuggestions);
		}
	}

	public keyPress = (ev: KeyboardEvent): void => {
		switch (ev.keyCode) {
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
				if (isEmpty(this.inputControl.nativeElement.value) && !this.dropdown) {
					return;
				}
				if (!this.suggestionsControl.overlay.isVisible) {
					this.suggestionsControl.overlay.show();
				}
				this.suggestionsControl.hoverTop();
				break;
			}
			case 40: { // down
				if (isEmpty(this.inputControl.nativeElement.value) && !this.dropdown) {
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

	public focused = (ev?: MouseEvent): void => {
		if (this.dropdown) {
			this.ddClicked.emit({
				query: this.inputControl.nativeElement.value,
				originalEvent: ev || new MouseEvent('click')
			});
		}
		this.inputControl.nativeElement.focus();
		if (this.isInFocus) {
			return;
		}
		this.isInFocus = true;
		this.focus.emit(new FocusEvent('focus', ev));
	}

	public blured = (ev: FocusEvent): void => {
		this.isInFocus = false;
		setTimeout(() => {
			if (!this.isInFocus) {
				this.blur.emit(ev);
			}
		});
	}

	private _onDDClick = (ev: MouseEvent): void => {
		if (this.suggestionsControl.overlay.isVisible) {
			setTimeout(() => this.suggestionsControl.overlay.hide());
			return;
		}
		this.focused(ev);
	}

	private _onComplete = debounce((ev: KeyboardEvent): void => {
		if (isEmpty(this.inputControl.nativeElement.value)) {
			return;
		}
		this.complete.emit({
			query: this.inputControl.nativeElement.value,
			originalEvent: ev
		});
	}, 300);

	private _blur = (ev: Event): void => {
		if (ev.target !== window && this._host.nativeElement.contains(ev.target as Element) && ev.type.toUpperCase() !== 'KEYDOWN') {
			return;
		}
		this.blured(new FocusEvent('blur', ev))
	}

	private _showSuggestions = () => {
		if (this.suggestionsControl.overlay.isVisible) {
			this.suggestionsControl.overlay.adjust();
		} else {
			this.suggestionsControl.overlay.show();
		}
	}

	private _detectChanges = debounce((): void => {
		if ((this._cd as ViewRef).destroyed) {
			return;
		}
		this._cd.detectChanges();
	}, 100)
}
