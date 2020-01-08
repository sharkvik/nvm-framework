import { SimpleChanges, SimpleChange } from "@angular/core";

export function analyzeChanges<T>(changes: SimpleChanges, defValue: () => T): [boolean, T, T] {
	const regExp = new RegExp(".*this\.(.+?)$");
	const match: RegExpExecArray = regExp.exec(defValue.toString());
	if (match.length < 2) {
		throw new Error("Could not find property name");
	}
	const propertyName = match[1];

	const simpleChange: SimpleChange = changes[propertyName];

	if (simpleChange != undefined) {
		return [true, <T>(simpleChange.currentValue), simpleChange.isFirstChange() ? undefined : simpleChange.previousValue];
	}
	return [false, defValue(), defValue()];
}
