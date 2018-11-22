import {
  Component,
  OnInit,
  ViewChild,
  ViewContainerRef,
  SystemJsNgModuleLoader,
  Injector,
  NgModuleFactory,
  Input
} from '@angular/core';

@Component({
  selector: 'nvm-loader',
  template: `<ng-container #container></ng-container>`,
  styles: []
})
export class NvmLoaderComponent implements OnInit {
  @Input() route: string;

  @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;

  constructor(private loader: SystemJsNgModuleLoader, private inj: Injector) { }

  ngOnInit() {
    if (!this.route || !this.route.length) {
      return;
    }
    this.loader.load(this.route).then((moduleFactory: NgModuleFactory<any>) => {
      const entryComponent = (<any>moduleFactory.moduleType).entry;
      const moduleRef = moduleFactory.create(this.inj);
      const compFactory = moduleRef.componentFactoryResolver.resolveComponentFactory(entryComponent);
      this.container.createComponent(compFactory);
    });
  }
}
