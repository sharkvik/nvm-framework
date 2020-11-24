import { isNil } from 'lodash';
import { ReplaySubject, Observable, Subject, of, Subscriber } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';

export class NvmSubject<T> extends ReplaySubject<T> {
	private _destroy$: Subject<any> = new Subject<any>();
	private _action: () => Observable<T>;
	private _lastValue: T;
	private _tempSubjects: Subject<T>[] = [];
	private _refreshStarted: boolean = false;
	private _lastRefresh: number;

	constructor(action: () => Observable<T>) {
		super(1);
		this._action = action;
		this
			.pipe(
				takeUntil(this._destroy$),
				tap((data: T) => this._lastValue = data)
			).subscribe((data: T) => {
				this._emitTempSubject();
			});
	}

	public refresh(): Observable<T> {
		if (this._skipRefresh()) {
			return of(this._lastValue);
		}
		const subj = new Subject<T>();
		this._tempSubjects.push(subj);
		if (!this._refreshStarted) {
			this._refreshStarted = true;
			setTimeout(() => this._onRefresh());
		}
		return subj;
	}

	public update(data: T): Observable<T> {
		return new Observable<T>(s => {
			this.next(data);
			this._emit(s);
		});
	}

	public reset = (): void => {
		this._lastValue = undefined;
	}

	public getOnce(): Observable<T> {
		return new Observable<T>(s => {
			if (!isNil(this._lastValue)) {
				this._emit(s);
				return;
			}
			this.refresh().pipe(takeUntil(this._destroy$)).subscribe(() => this._emit(s));
		});
	}

	public complete() {
		this._destroy$.next();
		this._destroy$.complete();
		super.complete();
	}

	private _onRefresh = () => {
		this._action()
			.pipe(takeUntil(this._destroy$))
			.subscribe((data: T) => {
				this._lastRefresh = new Date().getTime();
				this.next(data);
				this._emitTempSubject();
			}, (err) => {
				this._emitTempSubject();
				console.error(err);
			});
	}

	private _emit = (s: Subscriber<T>, data?: T): void => {
		s.next(data || this._lastValue);
		s.complete();
	}

	private _emitTempSubject(): void {
		this._tempSubjects.forEach(s => {
			s.next(this._lastValue);
			s.complete();
		});
		this._refreshStarted = false;
		this._tempSubjects = [];
	}

	private _skipRefresh = (): boolean => {
		return !isNil(this._lastValue)
			&& !isNil(this._lastRefresh)
			&& this._lastRefresh >= new Date().getTime() - 300;
	}
}
