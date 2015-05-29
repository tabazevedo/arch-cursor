/*
  spec/unit/shared/cursor.js
  spec for src/shared/cursor.js
*/

import Cursor from '../../../src/shared/cursor';
import { assert } from 'chai';

describe('Cursor', () => {
  context('main methods', () => {
    describe('constructor', () => {
      it('returns a cursor upon initialisation', () => {
        let data = { test: true };
        let cursor = new Cursor(data);
        assert.isTrue(cursor instanceof Cursor);
      });
    });

    describe('get subcursor', () => {
      it('returns a subcursor with a reference to the parent cursor', () => {
        let data = { test: true };
        let cursor = new Cursor(data);
        let subCursor = cursor.get('test');
        assert.equal(subCursor.root, cursor);
      });

      context('when passed a string path', () => {
        it('returns a cursor to a key in an object', () => {
          let data = {
            one: {
              two: {
                three: 'four'
              }
            }
          };

          let cursor = new Cursor(data);
          let subCursor = cursor.get('one.two');
          assert.deepEqual(subCursor.deref(), data.one.two);
        });

        it('fails when trying to traverse an array', () => {
          let data = [1, 2, 3, 4, 5];
          let cursor = new Cursor(data).get('one.two');
          assert.throw(cursor.deref, TypeError);
        });

        it('fails when trying to traverse a string', () => {
          let data = 'rainbows';
          let cursor = new Cursor(data).get('one.two');
          assert.throw(cursor.deref, TypeError);
        });

        it('fails when trying to traverse a number', () => {
          let data = 12345;
          let cursor = new Cursor(data).get('one.two');
          assert.throw(cursor.deref, TypeError);
        });
      });

      context('when passed an integer path', () => {
        context('when the structure is an array', () => {
          it('returns a subcursor to an item', () => {
            let data = [ 1, 2, 3, 4, 5 ];

            let cursor = new Cursor(data);
            let key = 3;
            let subCursor = cursor.get(key);
            assert.equal(subCursor.deref(), data[key]);
          });
        });

        context('when the structure is an object', () => {
          it('returns a subcursor to a key in the object', () => {
            let data = {1: true};

            let cursor = new Cursor(data);
            let subCursor = cursor.get(1);
            assert.equal(subCursor.deref(), data[1]);
          });
        });

        context('when the structure is a string', () => {
          it('fails', () => {
            let data = 'rainbows';

            let cursor = new Cursor(data);
            let subCursor = cursor.get(1);
            assert.throw(subCursor.deref, TypeError);
          });
        });

        context('when the structure is an integer', () => {
          it('fails', () => {
            let data = 12345;

            let cursor = new Cursor(data);
            let subCursor = cursor.get(1);
            assert.throw(subCursor.deref, TypeError);
          });
        });
      });
    });

    describe('deref', () => {
      it('supports objects', () => {
        let data = { test: true };
        let cursor = new Cursor(data);
        assert.deepEqual(cursor.deref(), data);
      });

      it('supports arrays', () => {
        let data = [true, 'annoyed', 123];
        let cursor = new Cursor(data);
        assert.deepEqual(cursor.deref(), data);
      });

      it('supports strings', () => {
        let data = 'hello world';
        let cursor = new Cursor(data);
        assert.equal(cursor.deref(), data);
      });

      it('supports integers', () => {
        let data = 147;
        let cursor = new Cursor(data);
        assert.equal(cursor.deref(), data);
      });

      it('supports functions', () => {
        let data = function() { return true; };
        let cursor = new Cursor(data);
        assert.equal(cursor.deref(), data);
      });

      it('supports booleans', () => {
        let data = true;
        let cursor = new Cursor(data);
        assert.equal(cursor.deref(), data);
      });
    });
  });
});
