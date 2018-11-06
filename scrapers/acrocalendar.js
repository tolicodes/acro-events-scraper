const puppeteer = require('puppeteer');

class Scraper {
    constructor () {
        this.setupPuppeteer();   
    }

    async setupPuppeteer() {
        const browser = await puppeteer.launch({ headless: true });
        this.page = await browser.newPage();
        await this.page.setViewport({ width: 1920, height: 926 });
        await this.page.goto('http://acrocalendar.com');

        const links = await this.page.$$eval(
            '.tribe-event-url', 
            links => links.map(l => l.href)
        );
    }
} 

new Scraper();