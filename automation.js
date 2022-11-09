// node automation.js --url="https://www.hackerrank.com" --config=config.json 

let minimist = require("minimist");
let fs= require("fs");
let puppeteer = require("puppeteer");
let args = minimist(process.argv);

let configjson = fs.readFileSync(args.config, "utf-8");
let config = JSON.parse(configjson);

async function run(){
    let browser = await puppeteer.launch({
        headless:false,
        args:[
            '--start-maximized'
        ],
        defaultViewport:null
    });
    let page = await browser.newPage();
    await page.goto(args.url);
    
    await page.waitForSelector("a[data-event-action='Login']");
    await page.click("a[data-event-action='Login']");
    
    await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
    await page.click("a[href='https://www.hackerrank.com/login']");
    
    await page.waitForSelector("input[placeholder='Your username or email']")
    await page.type("input[placeholder='Your username or email']", config.userid, {delay:50});

    await page.waitForSelector("input[placeholder='Your password']");
    await page.type("input[placeholder='Your password']", config.password, {delay:50});

    await page.waitForSelector("button[data-analytics='LoginPassword']");
    await page.click("button[data-analytics='LoginPassword']");

    await page.waitForSelector("a[data-analytics='NavBarContests']");
    await page.click("a[data-analytics='NavBarContests']");

    await page.waitForSelector("a[href='/administration/contests/']");
    await page.click("a[href='/administration/contests/']");
    
    await page.waitForSelector("a.backbone.block-center");
    let urls = await page.$$eval("a.backbone.block-center", function(atags){
        
        let myurls = [];
        for(let i=0; i<atags.length; i++)
        {
            let url = atags[i].getAttribute("href");
            myurls.push(url);
        }
        return myurls;
    });

    for(let i=0; i<urls.length; i++)
    {        
        let tab = await browser.newPage();
        await tab.goto(args.url +  urls[i]);
        
        await tab.bringToFront();
        await tab.waitFor(2000);
        await tab.waitForSelector("li[data-tab='moderators']");
        await tab.click("li[data-tab='moderators']");

        await tab.waitForSelector("input#moderator");
        await tab.type("input#moderator", config.moderator, {delay:50});

        await tab.keyboard.press("Enter");

        await tab.close();
        await page.waitFor(2000);

    }
 }
run();