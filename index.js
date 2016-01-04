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
    const bound = this.stack.map(mw => {
      return mw instanceof JSMW
        ? mw.execute.bind(mw, context)
        : mw.bind(null, context);
    });

    async.series(bound, callback);
  }
}

module.exports = function () {
  return new JSMW();
};
