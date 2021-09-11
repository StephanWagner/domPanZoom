/*! domPanZoom | https://github.com/StephanWagner/domPanZoom | MIT License | Copyright Stephan Wagner | https://stephanwagner.me */
var domPanZoom = function (options) {
  // Default options, pass a custom options object to override
  var defaultOptions = {
    // The element to render the map in
    targetElementID: "",

    // Minimum and maximum zoom
    minZoom: 1,
    maxZoom: 25,
  };

  this.options = Object.assign({}, defaultOptions, options || {});

  this.init();
};

// Initialize
domPanZoom.prototype.init = function () {
  console.log(this.options);
};

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

  //domPanZoom.init();

  // attach properties to the exports object to define
  // the exported module properties.
  exports.action = function () {};
}));

//# sourceMappingURL=domPanZoom.js.map
