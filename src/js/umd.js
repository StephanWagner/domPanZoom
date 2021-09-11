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
