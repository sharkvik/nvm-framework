import {
	Component,
	OnInit,
	ViewEncapsulation,
	ChangeDetectionStrategy,
	ViewChild,
	ElementRef,
	Input,
	forwardRef,
	ChangeDetectorRef,
	ViewRef,
	Output,
	EventEmitter,
	OnChanges,
	SimpleChanges,
	OnDestroy,
	ContentChild
} from '@angular/core';
import { NvmAutocompleteItem } from './models/nvm-autocomplete-item';
import { NvmChipsComponent } from './nvm-chips/nvm-chips.component';
import { NvmSuggestionsComponent } from './nvm-suggestions/nvm-suggestions.component';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { debounce, isNil, isEmpty } from 'lodash';
import { NvmAutocompleteService } from './nvm-autocomplete.service';
import { Subscription, Observable, of } from 'rxjs';
import { NvmChipContent } from './directives/nvm-chip-content.directive';
import { NvmSuggestionContent } from './directives/nvm-suggestion-content.directive';
import { NvmDdButton } from './directives/nvm-dd-button.directive';
import { NvmChipDelete } from './directives/nvm-chip-delete.directive';
import { DeletionMode } from './models/deletion-mode.enum';

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

	@ViewChild('acInput', { static: true }) public inputControl: ElementRef<HTMLInputElement>;
	@ViewChild(NvmChipsComponent, { static: true }) public chipsControl: NvmChipsComponent;
	@ViewChild(NvmSuggestionsComponent, { static: true }) public suggestionsControl: NvmSuggestionsComponent;

	@ContentChild(NvmChipContent, { static: false }) public chipTemplateOutlet: NvmChipContent;
	@ContentChild(NvmChipDelete, { static: false }) public chipDeleteTemplateOutlet: NvmChipDelete;
	@ContentChild(NvmSuggestionContent, { static: false }) public suggestionTemplateOutlet: NvmSuggestionContent;
	@ContentChild(NvmDdButton, { static: false }) public ddTemplateOutlet: NvmDdButton;

	@Input() public deletionMode: DeletionMode = DeletionMode.Object;
	@Input() public multiple: boolean = true;
	@Input() public customSuggestions: NvmAutocompleteItem[] = [];
	@Input() public dropdown: boolean = false;
	@Input() public allowDelete: boolean = true;
	@Input() public allowSearch: boolean = true;
	@Input() public singleRow: boolean = false;
	@Input() public distinct: boolean = true;
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

	public innerModel: NvmAutocompleteItem[];

	private _suggestions: NvmAutocompleteItem[] = [];
	private _subscriptions: Subscription = new Subscription();

	constructor(
		private _host: ElementRef<Element>,
		private _cd: ChangeDetectorRef,
		private _acService: NvmAutocompleteService
	) {
		this._subscriptions.add(this._acService.blured.subscribe(this._blur));
		this._subscriptions.add(this._acService.keyPressed.subscribe(this._globalKeyPressed));
	}

	private _onComplete = debounce((ev: KeyboardEvent): void => {
		if (isEmpty(this.inputControl.nativeElement.value)) {
			return;
		}
		this.complete.emit({
			query: this.inputControl.nativeElement.value,
			originalEvent: ev
		});
	}, 500);

	private _detectChanges = debounce((): void => {
		if ((this._cd as ViewRef).destroyed) {
			return;
		}
		this._cd.detectChanges();
	}, 100);

	@Input() public mapToValue: (item: NvmAutocompleteItem) => Observable<NvmAutocompleteItem> = (item: NvmAutocompleteItem) => of(item);

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
			let collection = [...this.customSuggestions || [], ...this._suggestions || []];
			if (this.distinct) {
				collection = collection.filter(x => !(this.innerModel || []).some(y => y.value === x.value));
			}
			if (isEmpty(collection)) {
				const el = new NvmAutocompleteItem(null, 'Ничего не найдено', '');
				el.isCustom = true;
				el.isTemporary = true;
				el.disabled = true;
				this.customSuggestions = [el];
				this.suggestionsCollection = [el];
			} else if (collection.some(x => !x.isTemporary)) {
				this.customSuggestions = this.customSuggestions.filter(x => !x.isTemporary && x.isCustom);
				this.suggestionsCollection = [...this._suggestions || [], ...this.customSuggestions];
				if (this.distinct) {
					this.suggestionsCollection = this.suggestionsCollection.filter(x => !(this.innerModel || []).some(y => y.value === x.value));
				}
			} else {
				this.suggestionsCollection = collection;
			}
		}
		if (!isNil(changes.customSuggestions) && !changes.customSuggestions.firstChange) {
			const csChange = changes.customSuggestions;
			const prev = csChange.previousValue.map((x: NvmAutocompleteItem) => x.value);
			const cur = csChange.currentValue.map((x: NvmAutocompleteItem) => x.value);
			if (JSON.stringify(prev) === JSON.stringify(cur)) {
				return;
			}
			this.customSuggestions.forEach(x => x.isCustom = true);
			this.suggestionsCollection = [...this._suggestions, ...this.customSuggestions];
			if (this.distinct) {
				this.suggestionsCollection = this.suggestionsCollection.filter(x => !(this.innerModel || []).some(y => y.value === x.value));
			}
		}
		this._detectChanges();
	}

	public onChipMouseDown = (ev: MouseEvent): void => {
		if (this.dropdown && !this.multiple || (ev.target as Element).tagName === 'INPUT') {
			this.focused(ev);
		} else {
			this.inputControl.nativeElement.focus();
		}
	}

	public onChipSelected = (ev: { item: NvmAutocompleteItem, originalEvent: MouseEvent }): void => {
		if (isNil(ev.item)) {
			this.inputControl.nativeElement.focus();
		}
		this.isInFocus = true;
	}

	public onItemDeleted = (item: NvmAutocompleteItem): void => {
		this.deleted.emit(item);
		if (this.suggestionsControl.overlay.isVisible && this.distinct) {
			setTimeout(() => {
				this.suggestionsCollection = [...this._suggestions, ...this.customSuggestions]
					.filter(x => !(this.innerModel || []).some(y => y.value === x.value));
				this._detectChanges();
			});
		}
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
				this.chipsControl.clearSelection();
				this._detectChanges();
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
		if (this.valueIsEmpty && this.isInFocus) {
			setTimeout(this._showSuggestions);
		}
	}

	public keyPress = (ev: KeyboardEvent): void => {
		switch (ev.key) {
			case 'ArrowLeft': {
				if (this.inputControl.nativeElement.selectionStart === this.inputControl.nativeElement.selectionEnd && this.inputControl.nativeElement.selectionEnd === 0) {
					this.chipsControl.selectLeft();
				}
				break;
			}
			case 'ArrowRight': {
				if (isEmpty(this.inputControl.nativeElement.value)) {
					this.chipsControl.selectRight();
				}
				break;
			}
			case 'ArrowUp': {
				if (isEmpty(this.inputControl.nativeElement.value) && !this.dropdown) {
					return;
				}
				if (!this.suggestionsControl.overlay.isVisible && this.distinct) {
					this.suggestionsCollection = [...this._suggestions, ...this.customSuggestions]
						.filter(x => !(this.innerModel || []).some(y => y.value === x.value));
					this._detectChanges();
				} else {
					if (!this.suggestionsControl.overlay.isVisible) {
						this.suggestionsControl.overlay.show();
					}
					this.suggestionsControl.hoverTop();
				}
				break;
			}
			case 'ArrowDown': {
				if (isEmpty(this.inputControl.nativeElement.value) && !this.dropdown) {
					return;
				}
				if (!this.suggestionsControl.overlay.isVisible && this.distinct) {
					this.suggestionsCollection = [...this._suggestions, ...this.customSuggestions]
						.filter(x => !(this.innerModel || []).some(y => y.value === x.value));
					this._detectChanges();
				} else {
					if (!this.suggestionsControl.overlay.isVisible) {
						this.suggestionsControl.overlay.show();
					}
					this.suggestionsControl.hoverBottom();
				}
				break;
			}
			case 'Backspace': {
				if (this.inputControl.nativeElement.selectionStart === this.inputControl.nativeElement.selectionEnd && this.inputControl.nativeElement.selectionEnd === 0) {
					this.chipsControl.deleteLeft();
					if (this.suggestionsControl.overlay.isVisible) {
						this.suggestionsControl.overlay.adjust();
						setTimeout(() => {
							this.suggestionsControl.clearSelection();
							this.suggestionsControl.hoverBottom();
						}, 200);
					}
				}
				break;
			}
			case 'Delete': {
				this.chipsControl.deleteRight();
				if (this.suggestionsControl.overlay.isVisible) {
					this.suggestionsControl.overlay.adjust();
					setTimeout(() => {
						this.suggestionsControl.clearSelection();
						this.suggestionsControl.hoverBottom();
					}, 200);
				}
				break;
			}
			case 'Enter': {
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

	public onItemLeftRemoved = (label: string): void => {
		this.inputControl.nativeElement.value = label.substring(0, label.length);
	}

	private _globalKeyPressed = (ev: KeyboardEvent): void => {
		if (ev.target === window || !this.isInFocus || ev.type.toUpperCase() !== 'KEYDOWN') {
			return;
		}
		this.keyPress(ev);
	}

	private _onDDClick = (ev: MouseEvent): void => {
		if (this.suggestionsControl.overlay.isVisible) {
			this.blured(new FocusEvent('blur', ev));
			setTimeout(() => this.suggestionsControl.overlay.hide());
			return;
		}
		this.focused(ev);
	}

	private _blur = (ev: Event): void => {
		if (ev.target !== window && this._host.nativeElement.contains(ev.target as Element)) {
			return;
		}
		if (ev.type.toUpperCase() !== 'KEYDOWN') {
			this.chipsControl.clearSelection();
			this.isInFocus = false;
		}
		this.chipsControl.clearSelection();
		this.blured(new FocusEvent('blur', ev));
	}

	private _showSuggestions = () => {
		if (!this.suggestionsControl.overlay.isVisible) {
			this.suggestionsControl.overlay.show();
		}
	}
}
