import { EventEmitter } from 'fbemitter';
import ExecutionEnvironment from 'fbjs/lib/ExecutionEnvironment';
import invariant from 'invariant';
import Promise from 'bluebird';

import fetch from './fetch';

let WinChan;
if (ExecutionEnvironment.canUseDOM) {
  WinChan = require('winchan');
}

import ReindexRelayNetworkLayer from './ReindexRelayNetworkLayer';

const TOKEN_KEY = 'REINDEX_TOKEN';

const SUPPORTED_PROVIDERS = {
  facebook: {
    windowFeatures: { width: 500, height: 467 },
  },
  github: {
    windowFeatures: { width: 1000, height: 600 },
  },
  google: {
    windowFeatures: { width: 500, height: 467 },
  },
  twitter: {
    windowFeatures: { width: 450, height: 635 },
  },
};

function stringifyWindowFeatures(windowFeatures) {
  return Object.keys(windowFeatures)
    .map((key) => `${key}=${windowFeatures[key]}`)
    .join(',');
}

class APIError extends Error {
  constructor(response, responseBody, url) {
    const message = responseBody ?
      responseBody.error || responseBody :
      'Empty response body';
    super('API error: ' + message);
    this.message = message;
    this.statusCode = response.status;
    this.code = responseBody && responseBody.error;
    this.url = url;
  }
}

class Reindex extends EventEmitter {
  /**
   * Constructs a new `Reindex` instance from a Reindex app URL.
   */
  constructor(url) {
    super();
    this._url = url;
    this._token = null;
    if (ExecutionEnvironment.canUseDOM) {
      this._getTokenFromStorage();
    }
  }

  /**
   * Login via given `providerName`.
   */
  login(providerName) {
    invariant(
      ExecutionEnvironment.canUseDOM,
      'login(...) can only be used in a browser. In Node.js, use setToken().'
    );
    const provider = SUPPORTED_PROVIDERS[providerName];
    invariant(
      provider,
      'Reindex.login(...): unknown provider "%s"',
      providerName
    );
    return new Promise((resolve, reject) => {
      WinChan.open({
        url: `${this._url}/auth/${providerName}`,
        relay_url: `${this._url}/auth/channel`,
        window_features: stringifyWindowFeatures(provider.windowFeatures),
      }, (error, response) => {
        if (error) {
          reject({ code: 'LOGIN_FAILED', message: error });
        } else if (response.error) {
          reject(response.error);
        } else {
          this.setToken(response.token);
          this.emit('login', response);
          resolve(response);
        }
      });
    });
  }

  logout() {
    this.setToken(null);
    this.emit('logout');
    return Promise.resolve({
      token: null,
      user: null,
    });
  }

  isLoggedIn() {
    return this._token !== null && this._token !== undefined;
  }

  setToken(token) {
    this._token = token;
    if (ExecutionEnvironment.canUseDOM) {
      if (token) {
        this._saveTokenToStorage();
      } else {
        this._clearTokenFromStorage();
      }
    }
    this.emit('tokenChange', token);
  }

  async query(query, variables) {
    const url = this._url + '/graphql';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthenticationHeaders(),
      },
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    });
    let result;
    try {
      result = await response.json();
    } catch (e) {
      result = null;
    }
    if (response.status < 200 || response.status >= 300 || !result) {
      throw new APIError(response, result, url);
    }
    return result;
  }

  getAuthenticationHeaders() {
    const token = this._token;
    if (token) {
      return { Authorization: `Bearer ${token}` };
    } else {
      return null;
    }
  }

  getRelayNetworkLayer(timeout = null, retryDelays = null) {
    return new ReindexRelayNetworkLayer(
      this._url + '/graphql',
      timeout,
      retryDelays,
      this.getAuthenticationHeaders.bind(this)
    );
  }

  _getTokenFromStorage() {
    this._token = localStorage.getItem(TOKEN_KEY);
  }

  _saveTokenToStorage() {
    localStorage.setItem(TOKEN_KEY, this._token);
  }

  _clearTokenFromStorage() {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export default Reindex;
