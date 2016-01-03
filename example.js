/* eslint-disable no-console */
'use strict';

// Require function.
const jsmw = require('./index');

// Create your chain of middlewares.
const chain = jsmw()
  .use((ctx, next) => {
    ctx.beforeTick = Date.now();
    next();
  })
  .use((ctx, next) => {
    process.nextTick(() => {
      ctx.afterTick = Date.now();
      next();
    });
  })
  .use((ctx, next) => {
    ctx.diff = ctx.afterTick - ctx.beforeTick;
    next();
  });

// Execute your chain with different contexts.
const context = {};
chain.execute(context, err => {
  return err
    ? console.error(err)
    : console.log(JSON.stringify(context, null, 2));
});
