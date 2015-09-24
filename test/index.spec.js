import expect from 'expect';
import Reindex from '../src';

describe('Reindex', () => {
  it('creates a new Reindex client instance', () => {
    const reindex = new Reindex('http://reindex.example.com');
    expect(reindex).toBeTruthy();
  });
});
