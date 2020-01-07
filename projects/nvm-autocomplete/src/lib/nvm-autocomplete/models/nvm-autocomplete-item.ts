export class NvmAutocompleteItem {
	public selected: boolean;
	public isCustom: boolean;
	public isTemporary: boolean;
	public disabled: boolean;
	constructor(public data: any, public label: string, public value: string) {}
}
