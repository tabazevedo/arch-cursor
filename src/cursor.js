/*
  src/shared/cursor.js
  a cursor over immutable data
*/

import { EventEmitter } from 'events';
import oak from 'ancient-oak';
import { getPatchObject, getPathTree } from './cursor-utils';

class Cursor {
  constructor(data, root, path) {
    if (data) { this._data = oak(data); }
    this._root = root || this;
    this._root._events = this._root._events || new EventEmitter();
    this._path = path;
  }

  deref() {
    let node = this._root._data;

    if (typeof node === 'function' && typeof node.dump === 'function') {
      switch(typeof this._path) {
        case 'string':
          let keys = this._path.split('.');
          keys.forEach((k) => {
            node = node(k);
          });
          break;
        case 'number':
          node = node(this._path);
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

    this._root._data = this._root._data.patch(getPatchObject(this._path, val));
    this.emit('change');
  }

  get(path) {
    if (typeof path !== 'undefined') {
      return new Cursor(null, this._root, (this._path ? `${this._path}.${path}` : path));
    } else {
      return this;
    }
  }

  set(value) {
    this._root._data = this._root._data.patch(getPatchObject(this._path, value));
    this.emit('change');
  }

  on(event, action) {
    let eventName = event;
    if (typeof this._path !== 'undefined') { eventName = `${this._path}:${event}`; }

    this._root._events.on(eventName, action);
  }

  emit(event, ...args) {
    getPathTree(this._path)
      .map((path) => {
        return {
          path: path,
          eventName: `${path}:${event}`
        };
      })
      .concat([{ eventName: event }, { eventName: '*' } ])
      .filter((evt) => EventEmitter.listenerCount(this._root._events, evt.eventName) > 0) // Don't perform unnecessary derefs and other ops.
      .map((it) => {
        if (event === 'change') {
          it.payload = [this._root.get(it.path).deref()];
        } else {
          it.payload = args;
        }
        return it;
      })
      .forEach((evt) => {
        this._root._events.emit.apply(this._root._events, [evt.eventName, ...evt.payload]);
      });
  }
}

export default Cursor;
