# reindex-js

[![Circle CI](https://circleci.com/gh/reindexio/reindex-js.svg?style=svg&circle-token=1f82afd0b2c01310887098f125fa8a9b3980f1ea)](https://circleci.com/gh/reindexio/reindex-js)

`reindex-js` is a client library that makes using Reindex easier. It provides
support for authentication, including social login. It also exposes hooks for
using Reindex with Relay and other libraries.

Some features (like handling Social Login, storing authentication info) only
makes sense in a browser, but otherwise the library can also be used on server
with nodejs.

## Installation

```
npm install reindex-js
```

## Usage

Import the library

```js
import Reindex from 'reindex-js'
```

Create an instance.

```js
const reindex = new Reindex('https://YOUR-REINDEX-URL.reindexio.com');
```

## API

##### `new Reindex(url: String) -> Reindex`

Create a new instance of Reindex. Usually only one instance is needed so you can
create it in one model and export.

```js
import Reindex from 'reindex';

const reindex = new Reindex('https://YOUR-REINDEX-URL.reindexio.com');
export default reindex;
```

In browser environment, if token was stored in `localStorage`, it will be
retrieved and stored inside the instance.

### Authentication

##### `.login(providerName: String) -> Promise`

*Browser only*

Attempt to login with a `providerName`. Currently only Social Login providers
are available (`google`, `facebook`, `twitter`, `github`). Provider should be
set up and enabled in your Reindex app.

Practically, it opens a browser window with provider's login screen, where user
needs to grant your application permissions to read his data. If everything
succeeds promise is resolved with an object of `token` - JSON Web Token for the
user, `user` - information about the user. If anything fails for any reason,
promise rejects with an error as result.

Token is stored inside the instance and inside browser `localStorage`.

Emits `login` and `tokenChange` events.

##### `.logout() -> Promise`

*Browser only*

Clears token from the instance and `localStorage`. Resolve promise with map
of `token` and `user`, both of which are null.

Emits `logout` and `tokenChange` events.

##### `.isLoggedIn() -> Boolean`

Returns true if there is a token stored inside the instance.

##### `.setToken(token: String)`

Set the token manually. Can be used when custom authentication provider is used
or on server.

Emits `tokenChange` event.

### Querying

##### `.query(query: String, variables: Object) -> Promise`

Queries the Reindex backend. Returns Promise that resolves if HTTP request
succeeded, rejects otherwise.

##### `.getAuthenticationHeaders() -> Object`

Returns map of header name to value that need to be used to authenticate request
with Reindex backend.

### Usage with Relay

##### `.getRelayNetworkLayer(timeout: int, retryDelays: int) -> RelayNetworkLayer`

Returns RelayNetworkLayer. Usage:

```js
import Relay from 'react-relay';
import Reindex from 'reindex-js';

const reindex = new Reindex('https://YOUR-REINDEX-URL.reindexio.com');

Relay.injectNetworkLayer(Reindex.getRelayNetworkLayer());
```

### Events

`Reindex` extends [EventEmitter](https://nodejs.org/api/events.html), so it
can be (un)subscribed with `on` and `off`. Here are the possible events:

##### `login (loginResponse: Object)`

When login succeded. `loginResponse` is the response from backend.

##### `logout`

When logout succeded.

##### `tokenChange (token: String)`

When token changes. `token` is the new token.

## Compiling manually

To build UMD bundle:

```
npm run build:umd
```
