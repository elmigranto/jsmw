'use strict';

const expect = require('expect.js');
const jsmw = require('./index');

describe('Jsmw', function () {
  describe('Basic chain', function () {
    it('No middlewares', function (done) {
      jsmw().execute(done);
    });

    it('1 sync middleware', function (done) {
      let called = false;

      jsmw()
        .use((ctx, next) => {
          called = true;
          next();
        })
        .execute(err => {
          expect(err).to.be(null);
          expect(called).to.be(true);
          done();
        });
    });

    it('1 async middleware', function (done) {
      let called = false;

      jsmw()
        .use((ctx, next) => {
          called = true;
          setTimeout(next, 5);
        })
        .execute(err => {
          expect(err).to.be(null);
          expect(called).to.be(true);
          done();
        });
    });

    it('Many middlewares', function (done) {
      const called = [];

      jsmw()
        .use((ctx, next) => {
          called.push(true);
          next();
        })
        .use((ctx, next) => {
          setTimeout(() => {called.push(true); next();}, 5);
        })
        .use((ctx, next) => {
          called.push(true);
          process.nextTick(next);
        })
        .execute(err => {
          expect(err).to.be(null);
          expect(called).to.eql([true, true, true]);
          done();
        });
    });
  });

  describe('Context', function () {
    it('preserves context', function (done) {
      const context = {};

      jsmw()
        .use((ctx, next) => {
          expect(ctx).to.be(context);
          next();
        })
        .execute(context, done);
    });
  });

  describe('Errors', function () {
    it('next(err) stops execution', function (done) {
      let called = false;

      jsmw()
        .use((ctx, next) => {
          process.nextTick(next, new Error('Oops!'));
        })
        .use((ctx, next) => {
          called = true;
          next();
        })
        .execute(err => {
          expect(err).to.be.an(Error);
          expect(err.message).to.be('Oops!');
          expect(called).to.be(false);
          done();
        });
    });
  });
});
