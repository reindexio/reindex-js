import fetch from 'isomorphic-fetch';
import fetchWithRetries from './fbjs/fetchWithRetries';
import Promise from 'bluebird';

class ReindexRelayNetworkLayer {

  constructor(uri, timeout, retryDelays, getToken) {
    this._uri = uri;
    this._timeout = timeout;
    this._retryDelays = retryDelays;
    this._getToken = getToken;
  }

  sendMutation(request) {
    return this._sendMutation(request).then(
      result => result.json()
    ).then(payload => {
      if (payload.hasOwnProperty('errors')) {
        const error = new Error(
          'Server request for mutation `' + request.getDebugName() + '` ' +
          'failed for the following reasons:\n\n' +
          formatRequestErrors(request, payload.errors)
        );
        error.source = payload;
        request.reject(error);
      } else {
        request.resolve({response: payload.data});
      }
    }).catch(
      error => request.reject(error)
    );
  }

  sendQueries(requests) {
    return Promise.all(requests.map(request => (
      this._sendQuery(request).then(
        result => result.json()
      ).then(payload => {
        if (payload.hasOwnProperty('errors')) {
          const error = new Error(
            'Server request for query `' + request.getDebugName() + '` ' +
            'failed for the following reasons:\n\n' +
            formatRequestErrors(request, payload.errors)
          );
          error.source = payload;
          request.reject(error);
        } else if (!payload.hasOwnProperty('data')) {
          request.reject(new Error(
            'Server response was missing for query `' + request.getDebugName() +
            '`.'
          ));
        } else {
          request.resolve({response: payload.data});
        }
      }).catch(
        error => request.reject(error)
      )
    )));
  }

  supports(...options) {
    return false;
  }

  _getAuthenticationHeaders() {
    const token = this._getToken();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    } else {
      return null;
    }
  }

  /**
   * Sends a POST request with optional files.
   */
  _sendMutation(request) {
    let init;
    const files = request.getFiles();
    if (files) {
      if (!global.FormData) {
        throw new Error('Uploading files without `FormData` not supported.');
      }
      const formData = new FormData();
      formData.append('query', request.getQueryString());
      formData.append('variables', JSON.stringify(request.getVariables()));
      for (const filename in files) {
        if (files.hasOwnProperty(filename)) {
          formData.append(filename, files[filename]);
        }
      }
      init = {
        body: formData,
        method: 'POST',
      };
    } else {
      init = {
        body: JSON.stringify({
          query: request.getQueryString(),
          variables: request.getVariables(),
        }),
        headers: {
          'Content-Type': 'application/json',
          ...this._getAuthenticationHeaders(),
        },
        method: 'POST',
      };
    }
    return fetch(this._uri, init).then(throwOnServerError);
  }

  /**
   * Sends a POST request and retries if the request fails or times out.
   */
  _sendQuery(request) {
    return fetchWithRetries(this._uri, {
      body: JSON.stringify({
        query: request.getQueryString(),
        variables: request.getVariables(),
      }),
      fetchTimeout: this._timeout,
      headers: {
        'Content-Type': 'application/json',
        ...this._getAuthenticationHeaders(),
      },
      method: 'POST',
      retryDelays: this._retryDelays,
    });
  }
}

/**
 * Rejects HTTP responses with a status code that is not >= 200 and < 300.
 * This is done to follow the internal behavior of `fetchWithRetries`.
 */
function throwOnServerError(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    throw response;
  }
}

/**
 * Formats an error response from GraphQL server request.
 */
function formatRequestErrors(request, errors) {
  const CONTEXT_BEFORE = 20;
  const CONTEXT_LENGTH = 60;

  const queryLines = request.getQueryString().split('\n');
  return errors.map(({locations = [], message}, ii) => {
    const prefix = (ii + 1) + '. ';
    const indent = ' '.repeat(prefix.length);
    return (
      prefix + message + '\n' +
      locations.map(({column, line}) => {
        const queryLine = queryLines[line - 1];
        const offset = Math.min(column - 1, CONTEXT_BEFORE);
        return [
          queryLine.substr(column - 1 - offset, CONTEXT_LENGTH),
          ' '.repeat(offset) + '^^^',
        ].map(messageLine => indent + messageLine).join('\n');
      }).join('\n')
    );
  }).join('\n');
}

export default ReindexRelayNetworkLayer;
