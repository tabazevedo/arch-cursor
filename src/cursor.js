/*
  src/shared/cursor.js
  a cursor over immutable data
*/

import { EventEmitter } from 'events';
import oak from 'ancient-oak';
import { getPatchObject, getPathTree } from './cursor-utils';

class Cursor {
  constructor(data, root, path) {
    if (data) { this.data = oak(data); }
    this.root = root || this;
    this.root.events = this.root.events || new EventEmitter();
    this.path = path;
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

    this.root.data = this.root.data.patch(getPatchObject(this.path, val));
    this.emit('change');
  }

  get(path) {
    if (typeof path !== 'undefined') {
      return new Cursor(null, this.root, (this.path ? `${this.path}.${path}` : path));
    } else {
      return this;
    }
  }

  set(value) {
    this.root.data = this.root.data.patch(getPatchObject(this.path, value));
    this.emit('change');
  }

  on(event, action) {
    let eventName = event;
    if (typeof this.path !== 'undefined') { eventName = `${this.path}:${event}`; }

    this.root.events.on(eventName, action);
  }

  emit(event, ...args) {
    getPathTree(this.path)
      .map((path) => {
        return {
          path: path,
          eventName: `${path}:${event}`
        };
      })
      .concat([{ eventName: event }, { eventName: '*' } ])
      .filter((evt) => EventEmitter.listenerCount(this.root.events, evt.eventName) > 0) // Don't perform unnecessary derefs and other ops.
      .map((it) => {
        if (event === 'change') {
          it.payload = [this.root.get(it.path).deref()];
        } else {
          it.payload = args;
        }
        return it;
      })
      .forEach((evt) => {
        this.root.events.emit.apply(this.root.events, [evt.eventName, ...evt.payload]);
      });
  }
}

export default Cursor;
