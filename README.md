# reindex-js

[![Circle CI](https://circleci.com/gh/reindexio/reindex-js.svg?style=svg&circle-token=1f82afd0b2c01310887098f125fa8a9b3980f1ea)](https://circleci.com/gh/reindexio/reindex-js)

`reindex-js` is a client library that makes using Reindex
([https://www.reindex.io](https://www.reindex.io)) easier. It provides
support for authentication, including social login. It also exposes hooks for
using Reindex with Relay and other libraries.

`reindex-js` is a universal JavaScript library, so it works in the browser,
React Native and Node.js. However, log in with social providers (the `login()`
method) is only available in the browser. Log in with Auth0 (`loginWithToken()`)
is also supported on React Native.

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
const reindex = new Reindex('https://YOUR-REINDEX-URL.myreindex.com');
```

## API

##### `new Reindex(url: String) -> Reindex`

Create a new instance of Reindex. Usually only one instance is needed so you can
create it in one model and export.

```js
import Reindex from 'reindex';

const reindex = new Reindex('https://YOUR-REINDEX-URL.myreindex.com');
export default reindex;
```

In browser environment, if token was stored in `localStorage`, it will be
retrieved and stored inside the instance.

### Authentication

##### `.login(providerName: String) -> Promise`

*Browser only*

Attempt to login with a `providerName` (`google`, `facebook`, `twitter` or
`github`). The provider should be set up and enabled in your Reindex app.

Opens a browser window with provider's login screen, where the user needs to
grant your application permissions to read their data. If everything succeeds
the promise returned is resolved with an object with following properties:
* `token` - JSON Web Token for the user,
* `user` - information about the user.

If the log in fails, the promise is reject with an error.

The token is stored in the `Reindex` instance and in `localStorage` of the browser.

Emits `login` and `tokenChange` events.

##### `.loginWithToken(providerName: String, loginToken: String)`

Attempt to login to Reindex with an [Auth0
`id_token`](https://auth0.com/docs/tokens/id_token). Reindex validates the token
on the backend side and logs the user in. Like `login`, sets token in the
`Reindex` object and stores it in `localStorage` (if available). 

Emits `login` and `tokenChange` events.

Example usage with Auth0 Lock:

```js
const reindex = new Reindex(reindexURL);
const lock = new Auth0Lock(auth0ClientID, auth0Domain);
lock.show((error, profile, id_token) => {
  reindex.loginWithToken('auth0', id_token);
});
```

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

const reindex = new Reindex('https://YOUR-REINDEX-URL.myreindex.com');

Relay.injectNetworkLayer(reindex.getRelayNetworkLayer());
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
