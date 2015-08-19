import ExecutionEnvironment from 'fbjs/lib/ExecutionEnvironment';
import invariant from 'invariant';
import Promise from 'bluebird';

let WinChan;
if (ExecutionEnvironment.canUseDOM) {
  WinChan = require('winchan');
}

import ReindexRelayNetworkLayer from './ReindexRelayNetworkLayer';

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

class Reindex {
  /**
   * Constructs a new `Reindex` instance from a Reindex app URL.
   */
  constructor(url) {
    this._url = url;
    this._token = null;
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
          resolve(response);
        }
      });
    });
  }

  setToken(token) {
    this._token = token;
  }

  getRelayNetworkLayer(timeout = null, retryDelays = null) {
    return new ReindexRelayNetworkLayer(
      this._url + '/graphql',
      timeout,
      retryDelays,
      () => this._token,
    );
  }
}

export default Reindex;
