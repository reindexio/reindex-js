import invariant from 'invariant';
import Promise from 'bluebird';
import WinChan from 'winchan';

const SUPPORTED_PROVIDERS = {
  facebook: true,
  github: true,
  google: true,
  twitter: true,
};

class Reindex {
  /**
   * Constructs a new `Reindex` instance from a Reindex app URL.
   */
  constructor(url) {
    this._url = url;
  }

  /**
   * Login via given `provider`.
   */
  login(provider) {
    invariant(
      SUPPORTED_PROVIDERS[provider],
      'Reindex.login(...): unknown provider "%s"'
    );
    return new Promise((resolve, reject) => {
      WinChan.open({
        url: `${this._url}/auth/${provider}`,
        relay_url: `${this._url}/auth/channel`,
        window_features: 'width=950,height=850',
      }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }
}

export default Reindex;
