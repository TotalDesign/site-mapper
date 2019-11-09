"use strict";

const TYPE = 'HttpResponseHeader';

const supports = (type) => {
  return type === TYPE;
};

class HttpResponseHeaderExtractor
{
  constructor(config) {
    this.config = config;
  }

  getValue(queueItem, responseBuffer, response) {
    if (response && response.headers && response.headers[this.config.name]) {
      return response.headers[this.config.name];
    }
  }
}

module.exports = {
  supports,
  extractor: HttpResponseHeaderExtractor
};
