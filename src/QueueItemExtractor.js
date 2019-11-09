"use strict";

const get = require('lodash.get');

const TYPE = 'QueueItem';

const supports = (type) => {
  return type === TYPE;
};

class QueueItemExtractor
{
  constructor(config) {
    this.config = config;
  }

  getValue(queueItem, responseBuffer, response) {
    return get(queueItem, this.config.property);
  }
}

module.exports = {
  supports,
  extractor: QueueItemExtractor
};
