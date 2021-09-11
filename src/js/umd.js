(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define(['exports', 'dom-pan-zoom'], factory);
  } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
      // CommonJS
      factory(exports, require('dom-pan-zoom'));
  } else {
      // Browser globals
      factory((root.commonJsStrict = {}), root.domPanZoom);
  }
}(typeof self !== 'undefined' ? self : this, function (exports, domPanZoom) {
  return domPanZoom;

  // attach properties to the exports object to define
  // the exported module properties.
  exports.action = function () {};
}));
