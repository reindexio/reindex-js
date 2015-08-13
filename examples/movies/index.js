import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import Reindex from 'reindex';

import Movie from './components/Movie';
import MovieRoute from './routes/MovieRoute';

const reindex = new Reindex('http://localhost.reindexio.com:5000');
Relay.injectNetworkLayer(reindex.getRelayNetworkLayer());

ReactDOM.render(
  <Relay.RootContainer
    Component={Movie}
    route={new MovieRoute({ movieID: 'TW92aWU6NzYzNDE='})}
  />,
  document.getElementById('root')
);
