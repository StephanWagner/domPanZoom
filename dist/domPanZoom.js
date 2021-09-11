/*! domPanZoom | https://github.com/StephanWagner/domPanZoom | MIT License | Copyright Stephan Wagner | https://stephanwagner.me */
// Wrapper function
function domPanZoomWrapper() {
  var domPanZoom = function (options) {
    // Default options, pass a custom options object to override
    var defaultOptions = {
      // The element to render the map in
      targetElementID: '',

      // Minimum and maximum zoom
      minZoom: 1,
      maxZoom: 25
    };

    this.options = Object.assign({}, defaultOptions, options || {});

    this.init();
  };

  // Initialize
  domPanZoom.prototype.init = function () {
    console.log(this.options);
  };

  return domPanZoom;
}

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['dompanzoom'], function () {
      return (root.domPanZoom = factory());
    });
  } else if (typeof module === 'object' && module.exports) {
    module.exports = root.domPanZoom = factory();
  } else {
    root.domPanZoom = factory();
  }
})(this, function () {
  var domPanZoom = domPanZoomWrapper();
  return domPanZoom;
});

//# sourceMappingURL=domPanZoom.js.map
