/*
  src/shared/cursor.js
  a cursor over immutable data
*/

import EventEmitter from 'events';
import oak from 'ancient-oak';

class Cursor extends EventEmitter {
  constructor(data, root, path) {
    super();
    if (data) { this.data = oak(data); }
    this.root = root || this;
    this.path = path;
  }

  static patchObject(path = '', value) {
    // maps `an.object.path` and a value to { an: { object: { path: value }}}
    console.log(path);
    let val = {};
    switch (typeof path) {
      case 'string':
        return path
          .split('.')
          .reduceRight((prev, cur) => {
            val = {};
            val[cur] = prev;
            return val;
          }, value);
      case 'number':
        val[path] = value;
        return val;
    }
  }

  deref() {
    let node = this.root.data;

    if (typeof node === 'function' && typeof node.dump === 'function') {
      switch(typeof this.path) {
        case 'string':
          let keys = this.path.split('.');
          keys.forEach((k) => {
            node = node(k);
          });
          break;
        case 'number':
          node = node(this.path);
          break;
      }
    }

    if (typeof node === 'function' && typeof node.dump === 'function') {
      return node.dump();
    } else {
      return node;
    }
  }

  update(fn) {
    let val = fn(this.deref());

    this.root.data = this.root.data.patch(Cursor.patchObject(this.path, val));
  }

  get(path) {
    if (typeof path !== 'undefined') {
      return new Cursor(null, this.root, path);
    } else {
      return this;
    }
  }
}

export default Cursor;
