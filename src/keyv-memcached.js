const EventEmitter = require('events');
const Memcached = require('memcached');

const TTL_MAX = 30*24*60*60*1000; // 30 days ms

class KeyvMemcached extends EventEmitter {
  constructor(hosts, options) {
    super();

    if (typeof hosts === 'string') {
      const m = /^memcached:\/\/(.+)/.exec(hosts);
      if (m) {
        hosts = m[1];
      }
    }

    options = Object.assign(
      {},
      (typeof hosts === 'string') ? { hosts: hosts } : hosts,
      options
    );

    if (!options.client) {
      if (!options.hosts) {
        options.hosts = '127.0.0.1:11211';
      }

      if (Array.isArray(options.hosts)) {
        options.hosts = options.hosts.join(',');
      }

      options.client = new Memcached(options.hosts, options);
    }

    const client = options.client;

    this.client = client;

    this.clientMethods = ['get', 'set', 'del', 'flush'].reduce((obj, method) => {
      obj[method] = (...args) => {
        return new Promise((resolve, reject) => {
          args.push((err, result) => err ? reject(err) : resolve(result));
          client[method].apply(client, args);
        });
      };
      return obj;
    }, {});

    client.stats(err => {
      if (err) {
        this.emit('error', err);
      }
    });
  }

  get(key) {
    return this.clientMethods.get(key).then(value => {
      if (value === undefined) {
        return undefined;
      }
      return value.toString();
    });
  }

  set(key, value, ttl) {
    if (typeof value === 'undefined') {
      return Promise.resolve(undefined);
    }

    let expires = 0;
    if (typeof ttl === 'number') {
      if (ttl > TTL_MAX) {
        // REF: https://github.com/memcached/memcached/blob/master/doc/protocol.txt#L79
        // Calculate timestamp
        expires = Math.ceil((Date.now() + ttl) / 1000);
      } else {
        expires = Math.ceil(ttl / 1000);
      }
    }

    return this.clientMethods.set(key, value, expires);
  }

  delete(key) {
    return this.clientMethods.del(key);
  }

  clear() {
    return this.clientMethods.flush().then(() => undefined);
  }
}

module.exports = KeyvMemcached;