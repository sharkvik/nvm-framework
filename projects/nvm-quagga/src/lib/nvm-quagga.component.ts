import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter, OnDestroy } from '@angular/core';
import quagga from 'quagga';
import * as _ from 'lodash';
import { Observable, Subscriber } from 'rxjs';


@Component({
	selector: 'nvm-quagga',
	templateUrl: 'nvm-quagga.component.html',
	styleUrls: ['nvm-quagga.component.scss']
})
export class NvmQuaggaComponent implements OnInit, OnDestroy {
	@Input() public dimentions: { width: number, height: number } = { width: 100, height: 100 };
	@Output() public codeParsed: EventEmitter<string> = new EventEmitter<string>();
	@Output() public readerReady: EventEmitter<boolean> = new EventEmitter<boolean>();

	@ViewChild('video') public video: ElementRef;
	@ViewChild('canvas') public canvas: ElementRef;
	@ViewChild('canvasBarCode') public canvasBarCode: ElementRef;
	public errors: string[] = [];
	public mirrow: boolean = false;
	public reset: boolean = true;

	private _videoEl: HTMLVideoElement;
	private _context: CanvasRenderingContext2D;
	private _canvasBarCodeConext: CanvasRenderingContext2D;
	private _temer: any;

	private readonly _defaultTriesCount: number = 100;
	private readonly _maxTriesCount: number = 500;
	private _triesCount: number = this._defaultTriesCount;
	private _codesTries: string[] = [];
	private _readers: string[] = [
		'code_128_reader',
		'ean_reader',
		'ean_8_reader',
		'code_39_reader',
		'code_39_vin_reader',
		'codabar_reader',
		'upc_reader',
		'upc_e_reader',
		'i2of5_reader'
	];

	private get _isToManyTries(): boolean {
		return this._triesCount >= this._maxTriesCount;
	}

	private get _sufficientResult(): number {
		return this._codesTries.length * 2 / 3;
	}

	constructor() { }

	public ngOnInit() {
		this._videoEl = this.video.nativeElement;
		this._initCamera({ video: { facingMode: { exact: 'environment' } }, audio: false });
		this._initQuagga();
	}

	public ngOnDestroy(): void {
		clearInterval(this._temer);
	}

	public getPhoto(): Observable<string> {
		return new Observable<string>((s) => {
			s.next(this.canvas.nativeElement.toDataURL('image/png'));
			s.complete();
		});
	}

	public decodeFromPic(src: string): Observable<string> {
		const settings = {
			decoder: {
				readers: this._readers
			},
			locate: true,
			src: src
		};
		return new Observable((s) => quagga.decodeSingle(settings, (result) => this._onDecoded(result, s)));
	}

	public readPhoto(ev): void {
		const target = ev.target || ev.srcElement;
		if (!_.isEmpty(target.files)) {
			const file: File = target.files[0];
			const reader = new FileReader();
			reader.onloadend = () => {
				this.decodeFromPic(reader.result.toString())
					.subscribe((code: string) => this.codeParsed.emit(code));
				this.reset = false;
				setTimeout(() => this.reset = true);
			};
			reader.readAsDataURL(file);
		}
	}

	private _onDecoded(result: any, s: Subscriber<string>) {
		const code = !_.isNil(result) && !_.isNil(result.codeResult)
			? result.codeResult.code
			: null;

		s.next(code);
		s.complete();
		this._initQuagga();
	}

	private _initCamera(config: { video: any, audio: boolean }): void {
		const browser = <any>navigator;
		browser.getUserMedia = browser.getUserMedia
			|| browser.webkitGetUserMedia
			|| browser.mozGetUserMedia
			|| browser.msGetUserMedia;

		browser.mediaDevices
			.getUserMedia(config)
			.catch(() => {
				config.video = true;
				this.mirrow = true;
				browser.mediaDevices
					.getUserMedia(config)
					.catch((err) => {
						this.errors.push(err);
						console.error(err);
					})
					.then(this._startPlay);
			})
			.then(this._startPlay);
	}

	private _startPlay = (stream) => {
		if (!_.isNil(stream)) {
			const videoSettings = stream.getVideoTracks()[0].getSettings();
			this.dimentions.height = videoSettings.height;
			this.dimentions.width = videoSettings.width;
			if (!this.mirrow) {
				this.dimentions.height = videoSettings.width;
				this.dimentions.width = videoSettings.height;
			}
		}
		this._videoEl.srcObject = stream;
		this._videoEl.muted = true;
		this._videoEl.play()
			.catch((err) => {
				this.errors.push(err);
				console.error(err);
			})
			.then(() => {
				this._context = this.canvas.nativeElement.getContext('2d');
				this._canvasBarCodeConext = this.canvasBarCode.nativeElement.getContext('2d');
				this._temer = setInterval(() => {
					this._context.drawImage(this._videoEl, 0, 0, this.dimentions.width, this.dimentions.height);
				}, 40);
			});
	}

	private _initQuagga(): void {
		const inputStream = {
			name: 'Live',
			type: 'LiveStream',
			target: this._videoEl
		};
		const debugSettings = {
			showCanvas: true,
			showPatches: true,
			showFoundPatches: true,
			showSkeleton: true,
			showLabels: true,
			showPatchLabels: true,
			showRemainingPatchLabels: true,
			boxFromPatches: {
				showTransformed: true,
				showTransformedBox: true,
				showBB: true
			}
		};
		const settings = {
			inputStream: inputStream,
			decoder: {
				readers: this._readers,
				debug: debugSettings
			}
		};
		quagga.init(settings, this._onQuaggaInitialised);
		quagga.onProcessed(this._onQuaggaProcessed);
		quagga.onDetected(this._onQuaggaDetected);
	}

	private _onQuaggaInitialised = (err: any): void => {
		if (!_.isNil(err)) {
			console.error(err);
			this.readerReady.emit(false);
			return;
		}
		quagga.start();
		this.readerReady.emit(true);
	}

	private _onQuaggaProcessed = (result: any): void => {
		if (_.isNil(result)) {
			return;
		}

		if (!_.isEmpty(result.boxes)) {
			this._canvasBarCodeConext.clearRect(0, 0, this.dimentions.width, this.dimentions.height);

			result.boxes
				.filter((box) => box !== result.box)
				.forEach((box) => {
					quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, this._canvasBarCodeConext, { color: 'green', lineWidth: 2 });
				});
		}

		if (!_.isNil(result.box)) {
			quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, this._canvasBarCodeConext, { color: '#00F', lineWidth: 2 });
		}

		if (!_.isNil(result.codeResult) && !_.isEmpty(result.codeResult.code)) {
			quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, this._canvasBarCodeConext, { color: 'red', lineWidth: 3 });
		}
	}

	private _onQuaggaDetected = (result): void => {
		if (_.isNil(result.box) || _.isNil(result.codeResult) || _.isEmpty(result.codeResult.code)) {
			return;
		}
		this._codesTries.push(result.codeResult.code);
		if (this._codesTries.length < this._triesCount) {
			return;
		}
		const bestGroup = this._getBestCodeGroup();
		this._estimateCode(bestGroup);
	}

	private _getBestCodeGroup(): { key: string, value: any } {
		const groups = _.groupBy(this._codesTries, (x) => x);
		const groupsArray = Object.keys(groups).map((key) => ({ key: key, value: groups[key] }));
		return _.orderBy(groupsArray, (item) => item.value.length, 'desc')[0];
	}

	private _estimateCode(group: { key: string, value: any }): void {
		if (this._isPoorResult(group)) {
			this._triesCount += Math.round(this._triesCount / 2);
			return;
		}
		this._resetData();
		if (!this._isToManyTries) {
			this.codeParsed.emit(group.key);
		}
	}

	private _isPoorResult(group: { key: string, value: any }): boolean {
		return group.value.length < this._sufficientResult
			&& !this._isToManyTries;
	}

	private _resetData(): void {
		this._triesCount = this._defaultTriesCount;
		this._codesTries = [];
	}
}
