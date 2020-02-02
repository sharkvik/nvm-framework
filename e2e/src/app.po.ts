import { browser, by, element } from 'protractor';

export class AppPage {
	navigateTo() {
		return browser.get(browser.baseUrl + '/#/controlls') as Promise<any>;
	}

	getTitleText() {
		return element(by.css('nvm-root .content span')).getText() as Promise<string>;
	}

	getAcCount() {
		return element.all(by.css('nvm-autocomplete')).count();
	}

	focus(css: string) {
		return element(by.css(css)).click();
	}
}
