> Memcached storage adapter for Keyv

Memcached storage adapter for [Keyv](https://github.com/lukechilds/keyv).

Important! Method .clear don't support namespace.

## Usage

```js
const Keyv = require('keyv');
const KeyvMemcached = require('./keyv-memcached');

const keyv = new Keyv({store: new KeyvMemcached('127.0.0.1:11211')});
keyv.on('error', handleConnectionError);
```

See source code for more information.
