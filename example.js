/* eslint-disable no-console */
'use strict';

// Require a function.
const jsmw = require('./index');

// Create the chain of middlewares.
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
  });

// Execute your chain with different contexts.
const context = {};
chain.execute(context, err => {
  console.log(err || context);
  // { beforeTick: 1451920587070, afterTick: 1451920587073 }
});

// Supports nested chains (context passed from outer one).
const nestingContext = {};
const nestedChain = jsmw()
  .use(chain)
  .use((ctx, next) => {
    ctx.diff = ctx.afterTick - ctx.beforeTick;
    next();
  });

nestedChain.execute(nestingContext, err => {
  console.log(err || nestingContext);
  // { beforeTick: 1451920587072, afterTick: 1451920587123, diff: 51 }
});
