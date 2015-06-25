/*
  spec/unit/cursor-utils.js
  spec for src/cursor-utils.js
*/

import { getPatchObject, getPathTree } from '../../src/cursor-utils';
import oak from 'ancient-oak';
import { assert } from 'chai';

describe('Cursor utils', () => {
  describe('getPatchObject', () => {
    it('returns a correct patch object', () => {
      let data = oak({ a: { b: { c: true }}});
      let patch = getPatchObject('a.b.c', false);
      data = data.patch(patch);
      assert.isFalse(data('a')('b')('c'));
    });
  });

  describe('getPathTree', () => {
    it('returns an array of paths from the bottom to the top', () => {
      let path = 'an.object.path';
      let expectedPaths = ['an.object.path', 'an.object', 'an'];
      assert.deepEqual(expectedPaths, getPathTree(path));
    });
  });
});
