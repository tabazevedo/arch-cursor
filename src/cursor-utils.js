/*
  spec/unit/shared/cursor-utils.js
  spec for src/shared/cursor-utils.js
*/

export function getPatchObject(path, value) {
  // maps `an.object.path` and a value to { an: { object: { path: value }}}
  // for use with ancient-oak.patch(object)
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
    case 'undefined':
      return value;
  }
}

export function getPathTree(path) {
  // takes 'an.object.path' and return a bottom-up array of each node path in the tree
  // e.g. getPathTree('an.object.path') => ['an.object.path', 'an.object', 'an']

  let tree = [];
  switch (typeof path) {
    case 'string':
      let spath = path.split('.');
      while (spath.length > 0) {
        tree.push(spath.join('.'));
        spath.pop();
      }
      break;
    case 'number':
      tree.push(path);
      break;
  }
  return tree;
}
