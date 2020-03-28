import { isNil, cloneDeep } from 'lodash';
import { ReplaySubject, Observable, of, Subscriber, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export class NvmSubject<T> extends ReplaySubject<T> {
	private _action: () => Observable<T>;
	private _lastValue: T;
	private _refreshStarted: boolean = false;
	private _subscribers: Array<Subscriber<T>> = [];

	constructor(action: () => Observable<T>) {
		super(1);
		this._action = () => action().pipe(tap((data: T) => this._lastValue = data));
	}

	public refresh(): Observable<T> {
		if (this._refreshStarted) {
			return new Observable((s: Subscriber<T>) => { this._subscribers.push(s); });
		}
		this._refreshStarted = true;
		this._lastValue = undefined;
		return this._onRefresh();
	}

	public reset(): void {
		this._lastValue = undefined;
	}

	public update(data: T): Observable<T> {
		return of(data || this._lastValue).pipe(tap(() => this.next(data)));
	}

	public getOnce(): Observable<T> {
		return !isNil(this._lastValue)
			? of(this._lastValue)
			: this.refresh();
	}

	private _onRefresh = () => {
		return this._action()
			.pipe(
				tap((data: T) => {
					this.next(data);
					this._completeRefreshSubscribers();
				}),
				catchError((err: any) => {
					this._completeRefreshSubscribers();
					console.error(err);
					return throwError(err);
				})
			);
	}

	private _completeRefreshSubscribers(): void {
		const subs = cloneDeep(this._subscribers);
		this._subscribers = [];
		subs.forEach((s: Subscriber<T>) => {
			s.next(this._lastValue);
			s.complete();
		});
		this._refreshStarted = false;
	}
}
