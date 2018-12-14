import { Observable, ReplaySubject, Subscriber, Subject } from 'rxjs';
import debounce from 'lodash.debounce';
import { isNullOrUndefined } from 'util';

export class NvmSubject<T> extends ReplaySubject<T> {
	private _action: () => Observable<T>;
	private _lastValue: T;
	private _tempSubjects: Subject<T>[] = [];
	private _refreshStarted: boolean = false;
	private _onRefresh = debounce(() => {
		this._action()
			.subscribe((data: T) => {
				this.next(data);
				this._emitTempSubject();
			}, (err) => {
				this._emitTempSubject();
				console.error(err);
			});
	}, 300);

	constructor(action: () => Observable<T>) {
		super(1);
		this._action = action;
		this.subscribe((data: T) => this._lastValue = data);
	}

	public refresh(): Observable<T> {
		const subj = new Subject<T>();
		this._tempSubjects.push(subj);
		if (!this._refreshStarted) {
			this._refreshStarted = true;
			this._onRefresh();
		}
		return subj;
	}

	public update(data: T): Observable<T> {
		return new Observable<T>(s => {
			this.next(data);
			this._emit(s);
		});
	}

	public getOnce(): Observable<T> {
		return new Observable<T>(s => {
			if (!isNullOrUndefined(this._lastValue)) {
				this._emit(s);
				return;
			}
			this.refresh().subscribe(() => this._emit(s));
		});
	}

	private _emit = (s: Subscriber<T>, data?: T): void => {
		s.next(data || this._lastValue);
		s.complete();
	};

	private _emitTempSubject(): void {
		this._tempSubjects.forEach(s => {
			s.next(this._lastValue);
			s.complete();
		});
		this._refreshStarted = false;
		this._tempSubjects = [];
	}
}
