# jsmw

`npm install jsmw` for a simple middleware pattern implementation on top of [`async.series`](https://github.com/caolan/async#series).

``` js
// Require a function.
const jsmw = require('jsmw');

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
```

[Tests](/test.js) have more examples.

## Compatibility

Works with node `>=4` by default, but should run [anywhere async does](https://github.com/caolan/async#in-the-browser), with [transpilation](http://babeljs.io/) being required for some JS environments.
