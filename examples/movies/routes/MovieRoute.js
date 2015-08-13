import Relay from 'react-relay';

export default class MovieRoute extends Relay.Route {
  static queries = {
    movie: Component => Relay.QL`
      query {
        node(id: $movieID) {
          ${Component.getFragment('movie')}
        }
      }
    `,
  };
  static paramDefinitions = {
    movieID: { required: true },
  };
  static routeName = 'MovieRoute';
}
