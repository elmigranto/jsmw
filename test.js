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

  describe('Nested chains', function () {
    it('works without context', function (done) {
      const called = {order: 0};

      const inner = jsmw()
        .use((ctx, next) => {
          expect(ctx).to.be(null);
          called.inner = ++called.order;
          next();
        });

      const outer = jsmw()
        .use((ctx, next) => {
          expect(ctx).to.be(null);
          called.outer = ++called.order;
          process.nextTick(next);
        })
        .use(inner);

      outer.execute(err => {
        expect(err).to.be(null);
        expect(called).to.eql({
          outer: 1,
          inner: 2,
          order: 2
        });
        done();
      });
    });

    it('works with context', function (done) {
      const context = {order: 0};

      const inner = jsmw()
        .use((ctx, next) => {
          expect(ctx).to.be(context);
          ctx.inner = ++ctx.order;
          process.nextTick(next);
        });

      const outer = jsmw()
        .use(inner)
        .use((ctx, next) => {
          expect(ctx).to.be(context);
          ctx.outer = ++ctx.order;
          next();
        });

      outer.execute(context, err => {
        expect(err).to.be(null);
        expect(context).to.eql({
          inner: 1,
          outer: 2,
          order: 2
        });
        done();
      });
    });

    it('inner error stops execution', function (done) {
      let called = false;

      const chain = jsmw()
        .use(jsmw()
          .use((ctx, next) => {
            process.nextTick(next, new Error('InnerOops!'));
          })
        )
        .use((ctx, next) => {
          called = true;
          process.nextTick(next, new Error('OuterOops!'));
        });

      chain.execute(err => {
        expect(err).to.be.an(Error);
        expect(err.message).to.be('InnerOops!');
        expect(called).to.be(false);
        done();
      });
    });
  });
});
