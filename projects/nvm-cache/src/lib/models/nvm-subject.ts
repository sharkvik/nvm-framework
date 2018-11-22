import { Observable, ReplaySubject, Subscriber, Subject } from 'rxjs';
import debounce from 'lodash.debounce';
import isNil from 'lodash/isNil';

export class NvmSubject<T> extends ReplaySubject<T> {
	private _action: () => Observable<T>;
	private _lastValue: T;
	private _tempSubject: Subject<T>;
	private _onRefresh = debounce(() => {
		this._action()
			.subscribe((data: T) => {
				this.next(data);
				this._emitTempSubject();
			});
	}, 300);

	constructor(action: () => Observable<T>) {
		super(1);
		this._action = action;
		this.subscribe((data: T) => this._lastValue = data);
	}

	public refresh(): Observable<T> {
		if (isNil(this._tempSubject)) {
			this._tempSubject = new Subject<T>();
		}
		this._onRefresh();
		return this._tempSubject;
	}

	public update(data: T): Observable<T> {
		return new Observable<T>((s) => {
			this.next(data);
			this._emit(s);
		});
	}

	public getOnce(): Observable<T> {
		return new Observable<T>((s) => {
			if (!isNil(this._lastValue)) {
				this._emit(s);
				return;
			}
			const subs = this.asObservable()
				.subscribe(() => {
					this._emit(s);
					if (!subs.closed) {
						subs.unsubscribe();
					}
				});
		});
	}

	private _emit = (s: Subscriber<T>, data?: T): void => {
		s.next(data || this._lastValue);
		s.complete();
	}

	private _emitTempSubject(): void {
		this._tempSubject.next(this._lastValue);
		this._tempSubject.complete();
		this._tempSubject = null;
	}
}
