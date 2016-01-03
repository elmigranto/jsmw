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

```

[Tests](/test.js) have more examples.

## Compatibility

Works with node `>=4` by default, but should run [everywhere async works](https://github.com/caolan/async#in-the-browser), with [transpilation](http://babeljs.io/) being required for some JS environments.
