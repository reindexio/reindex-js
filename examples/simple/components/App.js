import React, { Component } from 'react';
import Reindex from 'reindex';

const reindex = new Reindex('http://tmdb.localhost.reindexio.com:5000');

export default class App extends Component {
  state = { user: null }

  handleLogin = (provider) => {
    reindex.login(provider).then((response) => {
      this.setState({user: response.user});
    });
  }

  handleLogout = () => {
    this.setState({user: null});
  }

  render() {
    if (this.state.user) {
      return (
        <div>
          <p>Signed in as {this.state.user.id}</p>
          <button onClick={this.handleLogout}>Sign out</button>
        </div>
      );
    }
    return (
      <div>
        Sign in:
        <button onClick={this.handleLogin.bind(this, 'facebook')}>Facebook</button>
        <button onClick={this.handleLogin.bind(this, 'github')}>GitHub</button>
        <button onClick={this.handleLogin.bind(this, 'google')}>Google</button>
        <button onClick={this.handleLogin.bind(this, 'twitter')}>Twitter</button>
      </div>
    );
  }
}
