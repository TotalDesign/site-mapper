"use strict";

const TYPES = [
  require('./DomExtractor'),
  require('./HttpResponseHeaderExtractor'),
  require('./QueueItemExtractor')
];

class ExtractorManager
{
  constructor(config) {
    this.extractors = {};

    for (const key of Object.keys(config)) {
      let extractor = null;

      if (!config[key].type) {
        throw Error(`No type defined for ${key}`);
      }

      for (let i = 0; i < TYPES.length; i++) {
        if (TYPES[i].supports(config[key].type)) {
          extractor = new TYPES[i].extractor(config[key]);
        }
      }

      if (null === extractor) {
        throw Error(`Type ${config[key].type} is not an available extractor`);
      }

      this.extractors[key] = extractor;
    }
  }

  getRecord(queueItem, responseBuffer, response) {
    const record = {};

    for (const key of Object.keys(this.extractors)) {
      record[key] = this.extractors[key].getValue(queueItem, responseBuffer, response);
    }

    return record;
  }
}

module.exports = ExtractorManager;
