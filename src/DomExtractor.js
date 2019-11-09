"use strict";

const cheerio = require('cheerio');

const TYPE = 'DOM';

const supports = (type) => {
  return type === TYPE;
};

class DomExtractor
{
  constructor(config) {
    this.config = config;
  }

  getValue(queueItem, responseBuffer, response) {
    if (response && 0 === response.headers['content-type'].indexOf('text/html')) {
      const page = cheerio.load(responseBuffer.toString('utf8'));

      const element = page(this.config.selector);

      if (this.config.text) {
        return element.text();
      }
      else if (this.config.attribute) {
        return element.attr(this.config.attribute);
      }
    }
  }
}

module.exports = {
  supports,
  extractor: DomExtractor
};
