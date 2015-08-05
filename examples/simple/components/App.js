import React, { Component } from 'react';
import Reindex from 'reindex';

const reindex = new Reindex('http://tmdb.localhost.reindexio.com:5000');

export default class App extends Component {
  state = { error: null, user: null }

  handleLogin = (provider) => {
    this.setState({error: null, user: null});
    reindex.login(provider)
      .then((response) => this.setState({user: response.user}))
      .catch((reason) => this.setState({error: reason}));
  }

  handleLogout = () => {
    this.setState({user: null});
  }

  render() {
    let error = null;
    if (this.state.error) {
      error = <p>{this.state.error.message}</p>;
    }
    if (this.state.user) {
      return (
        <div>
          <p>Signed in as {this.state.user.id}</p>
          <button onClick={this.handleLogout}>Sign out</button>
          {error}
        </div>
      );
    }
    return (
      <div>
        <p>Sign in:</p>
        <button onClick={this.handleLogin.bind(this, 'facebook')}>Facebook</button>
        <button onClick={this.handleLogin.bind(this, 'github')}>GitHub</button>
        <button onClick={this.handleLogin.bind(this, 'google')}>Google</button>
        <button onClick={this.handleLogin.bind(this, 'twitter')}>Twitter</button>
        {error}
      </div>
    );
  }
}
