const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const moment = require('moment');
const parseDuration = require('parse-duration');
const URL = 'https://clients.mindbodyonline.com/classic/mainclass?studioid=203457';
const DATE_FORMAT = 'MMM DD h:mm A';

class Scraper {
    constructor () {
        this.setupPuppeteer();   
    }

    async setupPuppeteer() {
        const browser = await puppeteer.launch({ headless: false });
        this.page = await browser.newPage();
        await this.page.setViewport({ width: 1920, height: 926 });
        
        this.scrape();
    }

    async scrape() {
        await this.page.goto(URL);

        await this.page.waitForSelector('#ExistingUsersHeader');

        await this.page.click('#tabA7');

        await this.page.waitForSelector('.classScheduleHeader');

        const $ = cheerio.load(await this.page.content());

        let date = null;

        const rows = $('#classSchedule-mainTable tbody tr')
            .map(function () { 
                const cols = $(this).find('td').map(function () {
                    return $(this).text();
                });

                // this is a date row
                if (!cols[3]) {
                    date = moment(cols[0].slice(5, -1))
                    return
                }

                const time = moment(cols[0].trim(), 'h:m a');
                const dateTime = date
                    .hour(time.get('hour'))
                    .minute(time.get('minute'))

                return {
                    timeStart: dateTime.format(DATE_FORMAT),
                    timeEnd: dateTime.add(
                        parseDuration(cols[4].trim())
                    ).format(DATE_FORMAT),
                    className: cols[2].trim(),
                    teacher: cols[3].trim(),

                }
            });

        const classes = Array.from(rows) 
            // get rid of blank rows
            .filter(row => row)
        
            .filter(row => (
                row.className.includes('Acro') &&
                !row.teacher.includes('Cancelled')
            ));;

        console.log(classes)
    }
} 

new Scraper();