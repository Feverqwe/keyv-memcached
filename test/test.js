import test from 'ava';
import keyvTestSuite, { keyvOfficialTests } from '@keyv/test-suite';
import Keyv from 'keyv';
import KeyvRedis from 'this';

const KeyvMemcached = require('../src/keyv-memcached');

keyvOfficialTests(test, Keyv, {
  store: new KeyvMemcached('memcached://127.0.0.1:11211', {
    "timeout": 1000,
    "idle": 1000
  })
}, {
  store: new KeyvMemcached('memcached://127.0.0.1:22122', {
    "timeout": 1000,
    "idle": 1000
  })
});

const store = () => new KeyvRedis();
keyvTestSuite(test, Keyv, store);
