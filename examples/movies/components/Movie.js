import React, {Component} from 'react';

import Relay from 'react-relay';

const fontFamily = 'Helvetica Neue, sans-serif';

const style = {
  movie: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.25em',
  },
  poster: {
    display: 'block',
    width: 92,
    height: 92,
    objectFit: 'cover',
    borderRadius: '50%',
    marginRight: '1em',
  },
  text: {
    flex: 1,
  },
  link: {
    fontSize: 18,
    fontFamily,
    fontWeight: 500,
    color: '#2980b9',
    textDecoration: 'none',
  },
  tagline: {
    fontSize: 16,
    fontFamily,
  },
  votes: {
    fontSize: 13,
    fontFamily,
    marginBottom: '1em',
  },
};

function getYear(isoDate) {
  return (new Date(isoDate)).getFullYear();
}

class Movie extends Component {
  render() {
    const {movie} = this.props;
    if (!movie) return null;
    const imdbURI = `http://www.imdb.com/title/${movie.imdb_id}/`;
    const imageURI = `http://image.tmdb.org/t/p/w92/${movie.poster_path}`;
    return (
      <div style={style.movie}>
        <img style={style.poster} src={imageURI} />
        <div style={style.text}>
          <a style={style.link} href={imdbURI}>
            {movie.title} ({getYear(movie.release_date)})
          </a>
          <div style={style.votes}>
            {movie.vote_average}/10
            ({movie.vote_count} votes)
          </div>
          <div style={style.tagline}>{movie.tagline}</div>
        </div>
      </div>
    );
  }
}

module.exports = Relay.createContainer(Movie, {
  fragments: {
    movie: () => Relay.QL`
      fragment on Movie {
        id,
        imdb_id,
        poster_path,
        title,
        release_date,
        tagline,
        vote_average,
        vote_count
      }
    `,
  },
});
