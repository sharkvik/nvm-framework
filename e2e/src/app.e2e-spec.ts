import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('workspace-project App', () => {
	let page: AppPage;

	beforeEach(() => {
		page = new AppPage();
	});

	it('should display welcome message', async () => {
		await page.navigateTo();
		const count1 = await page.getAcCount();
		browser.call(() => console.log('----------------------------------------------' + count1));
		await page.focus('.autocomplete__6 .nvm-autocomplete__input');
		const count2 = await page.getAcCount();
		browser.call(() => console.log('----------------------------------------------' + count2));
		expect(count1).toEqual(6);
		expect(count2).toEqual(7);
	});

	afterEach(async () => {
		// Assert that there are no errors emitted from the browser
		const logs = await browser.manage().logs().get(logging.Type.BROWSER);
		expect(logs).not.toContain(jasmine.objectContaining({
			level: logging.Level.SEVERE,
		} as logging.Entry));
	});
});
