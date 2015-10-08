const fetch = global.fetch ?
  global.fetch.bind(global) :
  require('isomorphic-fetch');

export default fetch;
