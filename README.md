# tiny-fetch

tiny-fetch is an isomorphic class-based means of extending fetch, either window.fetch or global.fetch in NodeJS.

tiny-fetch enhances fetch with interceptors without polluting fetch itself. It does so by embracing a class-based approach. Interceptors consist of objects that include one or more functions which are processed in order. Functions that can be included in interceptor objects include request, requestError, response and/or responseError. Interceptors are simple to write and share. This repo includes standard interceptors for making JSON requests, handling response errors and receiving JSON responses.

## Benefits of Approach

tiny-fetch has the following benefits over plain fetch and other approaches to wrap fetch:

- tiny - it is 2.2KB unminified.
- it has method shortcuts, such as fc.get(), fc.post(), etc.
- it automatically dedupes requests and caches responses
- global fetch, whether window.fetch or node-fetch remains untouched. It is not monkey patched.
- class based - You can create more than one instance if necessary to accommodate different APIs. Naturally, instances are isolated.
- interceptors can be swapped on the fly.
- interceptors can be overloaded.
- interceptors can be shared.
- you can build complex solutions.

## Dependencies

Global fetch is required. tiny-fetch has been tested against window.fetch, node-fetch and isomorphic-fetch. NodeJS 6x or greater is required.

tiny-fetch has been developed with modern Javascript. Your project must be able to consume EcmaScript modules or CommonJS in node.

## Installation

tiny-fetch can be installed with either npm or yarn.

```shell
yarn add @savvagent-os/tiny-fetch
```

or

```shell
npm i @savvagent-os/tiny-fetch -S
```

## Use

Here are some ways of using tiny-fetch.

You can use some interceptors included with tiny-fetch.

```Javascript
import { TinyFetch, jsonRequest, jsonResponse } from '@savvagent/tiny-fetch';
const interceptors = [jsonRequest, jsonResponse];
const client = new TinyFetch(interceptors);

const resp = await client.request('http://some.url/', fetchOptions = {});
```

You can create your own interceptors and add and remove them dynamically.

```Javascript
import { TinyFetch } from '@savvagent-os/tiny-fetch';
import { interceptor, interceptor1, interceptor2 } from '../interceptors';

const client = new TinyFetch();

client register(interceptor);

//register interceptor1 ahead of interceptor
client.register(interceptor1, 0);

// register interceptor2 at the end of the interceptor chain
client.register(interceptor2)

// get the current interceptors
const interceptors = client.getInterceptors();

// remove an interceptor
client.unregister(interceptorId)

// remove all the interceptors - useful for testing
client.clear();

// make requests
const url = 'https://gitlab.com/projects';

client.get(url)
  .then(response => console.log('response', response))
  .catch(error => console.log('error', error))

```

## API

TinyFetch

fc.clear()
fc.delete(url, options)
fc.get(url, options)
fc.head(url, options)
fc.patch(url, options)
fc.post(url, options)
fc.put(url, options)
fc.register(interceptor or array of interceptors)
fc.request(url, options)
fc.unregister(interceptorId)

# Interceptors

Interceptors are objects that must have at least one of the following functions: request, requestError, response, responseError. Hopefully, the purpose of the functions is clear from the names.

Interceptors run in order. So if I had an interceptor designed to catch network errors, I would want that interceptor to the first interceptor in the interceptor chain.

### Interceptor Internals

An interceptor is an object that has a unique id and includes one or more permitted functions.

```Javascript
export default {
  request(url, config = {}) {
    Object.assign(config, {headers: {Accept: 'application/json'}});
    return [url, config];
  },
  requestError(error) {
    return Promise.reject(error);
  },
  response(response) {
    // modify the response
    return response;
  },
  responseError(error) {
    return Promise.reject(error);
  }
  id: 'JSON_REQUEST'
};
```

You can create interceptors for various needs. For example, here's an audio interceptor:

```JavaScript
export const audioInterceptor = {
  const source = audioCtx.createBufferSource();
  response(response) {
    return response.arrayBuffer()
      .then(buffer => audioCtx.decodeAudioData(buffer, decodedData => {
        source.buffer = decodedData;
        source.connect(audioCtx.destination);
      }))
      .then(() => source);
  }
  id: 'AUDIO_INTERCEPTOR'
}
```

Interceptor methods (request, requestError, response, responseError) can incorporate promises.

```JavaScript
const url = 'http://dummy.restapiexample.com/api/v1/employees';
const p = Promise.resolve({session: '124-64-74-311157-537524-7453-8889-19-11886119-5-2512148-7874-6612768-86-9052812935'});

const interceptor = {
  async request(url = "", config = {}) {
    const prom = await p;
    const u = `${url}?session=${prom.session}`
    return [u, config];
  },
  id: 'PROMISE_REQUEST'
}

const client = new TinyFetch([interceptor]);
const response = await client.request(url);
console.log(response.url.includes(session)) // true
```

```JavaScript
const url = 'http://dummy.restapiexample.com/api/v1/employees';
const p = Promise.resolve({thingy: 'foo'});

const interceptor = {
  async response(response) {
    if (response.status === 204 || response.status === 201) return {};
    const text = await response.text();
    const json = JSON.parse(text);
    const { data } = json;
    const resolvedPromise = await p;
    const arr = data.map(datum => ({
      ...datum,
      ...resolvedPromise
    }))
    return arr;
  },
  id: 'PROMISE_RESPONSE'
}
client = new TinyFetch([interceptor]);
const response = await client.request(url);
response.forEach(item => expect(item.thingy).to.equal('foo'))
```
