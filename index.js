'use strict';

const async = require('async');

class JSMW {
  constructor () {
    this.stack = [];
  }

  use (middleware) {
    this.stack.push(middleware);
    return this;
  }

  execute (/*context, callback*/) {
    const context = arguments.length === 2 ? arguments[0] : null;
    const callback = arguments[arguments.length - 1];

    async.series(
      this.stack.map(mw => mw.bind(null, context)),
      callback
    );
  }
}

module.exports = function () {
  return new JSMW();
};
