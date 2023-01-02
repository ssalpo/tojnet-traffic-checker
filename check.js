import puppeteer from 'puppeteer';
import fs from 'fs';
import * as dotenv from "dotenv";
import {sendToTelegram, formatBytes} from "./service.js";

dotenv.config();

(async () => {
    const browser = await puppeteer.launch({
        args: [
            '--autoplay-policy=user-gesture-required',
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-breakpad',
            '--disable-client-side-phishing-detection',
            '--disable-component-update',
            '--disable-default-apps',
            '--disable-dev-shm-usage',
            '--disable-domain-reliability',
            '--disable-features=AudioServiceOutOfProcess',
            '--disable-hang-monitor',
            '--disable-ipc-flooding-protection',
            '--disable-notifications',
            '--disable-offer-store-unmasked-wallet-cards',
            '--disable-popup-blocking',
            '--disable-print-preview',
            '--disable-prompt-on-repost',
            '--disable-renderer-backgrounding',
            '--disable-setuid-sandbox',
            '--disable-speech-api',
            '--disable-sync',
            '--hide-scrollbars',
            '--ignore-gpu-blacklist',
            '--metrics-recording-only',
            '--mute-audio',
            '--no-default-browser-check',
            '--no-first-run',
            '--no-pings',
            '--no-sandbox',
            '--no-zygote',
            '--password-store=basic',
            '--use-gl=swiftshader',
            '--use-mock-keychain',
            '--lang=en-US,en;q=0.9',
            '--ignore-certificate-errors'
        ]
    });

    const page = await browser.newPage();

    // goto check page
    await page.goto('http://stat.tojnet.tj/?module=service&slink_id=175921');

    // fill form data
    await page.type('input[name=login]', process.env.USERNAME);
    await page.type('input[name=password]', process.env.PASSWORD);

    // send form
    await page.click('input[class=submit]');

    // wait for page load
    await page.waitForSelector('.formtext');

    const [getXpath] = await page.$x('/html/body/table/tbody/tr/td[2]/table[5]/tbody/tr/td/table/tbody/tr[3]/td[2]');

    // await page.screenshot({
    //     path: "./screenshot.png",
    //     fullPage: true
    // });

    // get info from page
    const total = parseFloat(await page.evaluate(name => name.innerText, getXpath));

    const fileName = './data.json';

    // save last data to json file
    fs.readFile(fileName, 'utf8', (err, data) => {
        let parsedData = JSON.parse(data);

        let lastResult = {
            total,
            today_usage: parsedData.last.total ? parsedData.last.total - total : 0,
            date: (new Date).toISOString()
        }

        parsedData.last = lastResult
        parsedData.all.push(lastResult);

        // here 1048576 is MB converting to Bytes
        let message = `
Остаток за месяц: ${formatBytes(lastResult.total * 1048576)}
За сегодня использовано: ${formatBytes(lastResult.today_usage * 1048576)}
`;

       sendToTelegram(message);

        fs.writeFile(fileName, JSON.stringify(parsedData, null, 2), (err, result) => {
            if (err) console.log('error', err);
        });
    });

    await page.close();
    await browser.close();
})();
