"use strict";

const args = process.argv.slice(2);

const cheerio = require('cheerio');
const csv = require('csv');
const fs = require('fs');
const Crawler = require('simplecrawler');
const Spinner = require('cli-spinner').Spinner;

const ExtractorManager = require('./src/ExtractorManager');

const config = JSON.parse(fs.readFileSync(args[0], 'utf8'));
const extractor = new ExtractorManager(config);

const spinner = new Spinner({
  text: 'Crawling... %s'
});

spinner.setSpinnerString('|/-\\');
spinner.start();

const incrementAmountResourcesCrawled = () => {
  amountResourcesCrawled++;
  spinner.setSpinnerTitle(`Crawling... %s => ${amountResourcesCrawled}`);
};

const writeStream = fs.createWriteStream(args[2]);

/**
 * Create CSV stringify stream
 * @type {stringify.Stringifier}
 */
const stringifier = csv.stringify({
  columns: Object.keys(config),
  header: true,
});

/**
 * Write to file streaming
 */
stringifier.on('readable', () => {
  let row;
  while((row = stringifier.read())) {
    writeStream.write(row);
  }
});

/**
 * Create Crawler
 * @type {Crawler}
 */
const crawler = new Crawler(args[1]);
let amountResourcesCrawled = 0;

crawler.maxDepth = 5;
crawler.maxConcurrency = 10;
crawler.parseHTMLComments = false;
crawler.parseScriptTags = false;
crawler.respectRobotsTxt = false;

const handleResponse = (queueItem, responseBuffer, response) => {
  const record = extractor.getRecord(queueItem, responseBuffer, response);

  stringifier.write(record);

  incrementAmountResourcesCrawled();
};

/**
 * Extract properties from page when crawled
 */
crawler.on('fetchcomplete', handleResponse);
crawler.on('fetchredirect', handleResponse);
crawler.on('fetch404', handleResponse);
crawler.on('fetch410', handleResponse);
crawler.on('fetcherror', handleResponse);

/**
 * When the crawler completes
 */
crawler.on('complete', () => {
  stringifier.end();
  spinner.stop();
});

/**
 * Override resource discovery method to only follow a[href] links in pages in order to only crawl relevant resources
 *
 * @param buffer
 * @param queueItem
 * @returns {*}
 */
crawler.discoverResources = (buffer, queueItem) => {
  const page = cheerio.load(buffer.toString('utf8'));

  return page('a[href]').map(function () {
    return page(this).attr('href');
  }).get();
};

/**
 * Start crawler
 */
crawler.start();
