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
