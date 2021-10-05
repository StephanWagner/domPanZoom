/*! domPanZoom | https://github.com/StephanWagner/domPanZoom | MIT License | Copyright Stephan Wagner | https://stephanwagner.me */
// Wrapper function
function domPanZoomWrapper() {
  var domPanZoom = function (options) {
    // Default options, pass a custom options object to override
    var defaultOptions = {
      // The ID of the wrapper element
      wrapperElementID: '',

      // The ID of the container element
      panZoomElementID: '',

      // Start with a centered position
      // This options overrides options initalPanX and initialPanY
      center: true,

      // Set this option to 'contain' or 'cover' to limit the boundries of the panZoomElement to the wrapperElement
      // This works similar to the CSS property background-size: contain / cover
      // Setting this option might effect the option minZoom
      bounds: 'contain',

      // Minimum and maximum zoom
      minZoom: 0.1,
      maxZoom: 10,

      // How many percent to zoom with the methods zoomIn and zoomOut
      zoomStep: 50,

      // The speed in which to zoom when using mouse wheel
      zoomWheelSpeed: 1,

      // Initial zoom
      initialZoom: 1,

      // Initial pan
      initialPanX: 0,
      initialPanY: 0
    };

    // Merge options
    this.options = Object.assign({}, defaultOptions, options || {});

    // Initialize
    this.init();
  };

  // Initialize
  domPanZoom.prototype.init = function () {
    // Init containers
    var wrapper = this.getWrapper();
    var container = this.getContainer();

    // Add styles
    wrapper.style.cursor = 'grab';
    wrapper.style.overflow = 'hidden';

    // Attach events
    this.attachEvents();

    // Adjust minZoom for option bounds
    if (this.options.bounds) {
      var maxWidth = wrapper.clientWidth;
      var maxHeight = wrapper.clientHeight;

      var panZoomWidth = container.clientWidth;
      var panZoomHeight = container.clientHeight;

      var minZoomX = maxWidth / panZoomWidth;
      var minZoomY = maxHeight / panZoomHeight;

      if (this.options.bounds === 'cover') {
        this.options.minZoom = Math.max(
          this.options.minZoom,
          minZoomX,
          minZoomY
        );
      } else {
        this.options.minZoom = Math.max(
          this.options.minZoom,
          Math.min(minZoomX, minZoomY)
        );
      }
    }

    // Set initial zoom
    this.zoom = this.sanitizeZoom(this.options.initialZoom);

    // Set initial pan
    this.x = this.options.initialPanX;
    this.y = this.options.initialPanY;

    // Set position
    this.options.center ? this.center(true) : this.setPosition(true);
  };

  // Attach events
  domPanZoom.prototype.attachEvents = function () {
    // Event while mouse moving
    var setPositionEvent = function (ev) {
      var event = ev;
      if (ev.touches && ev.touches.length) {
        event = ev.touches[0];
      }

      var movementX = 0;
      var movementY = 0;

      if (this.previousEvent) {
        movementX = event.pageX - this.previousEvent.pageX;
        movementY = event.pageY - this.previousEvent.pageY;
      }

      this.x += movementX;
      this.y += movementY;
      this.setPosition(true);

      this.previousEvent = event;
    }.bind(this);

    // Mouse down or touchstart event
    var mouseDownTouchStartEvent = function (ev) {
      ev.preventDefault();
      document.body.style.cursor = 'grabbing';
      this.getWrapper().style.cursor = 'grabbing';
      document.addEventListener('mousemove', setPositionEvent, {
        passive: true
      });
      document.addEventListener('touchmove', setPositionEvent, {
        passive: true
      });
    }.bind(this);

    this.getWrapper().addEventListener('mousedown', mouseDownTouchStartEvent);
    this.getWrapper().addEventListener('touchstart', mouseDownTouchStartEvent);

    var mouseUpTouchEndEvent = function () {
      this.previousEvent = null;
      document.body.style.cursor = null;
      this.getWrapper().style.cursor = 'grab';
      document.removeEventListener('mousemove', setPositionEvent, {
        passive: true
      });
      document.removeEventListener('touchmove', setPositionEvent, {
        passive: true
      });
    }.bind(this);

    document.addEventListener('mouseup', mouseUpTouchEndEvent);
    document.addEventListener('touchend', mouseUpTouchEndEvent);

    // Mouse wheel events
    var mouseWheelEvent = function (ev) {
      ev.preventDefault();

      // Delta
      var delta = ev.deltaY;
      if (ev.deltaMode > 0) {
        delta *= 100;
      }

      // Speed
      var speed = this.options.zoomWheelSpeed;

      // Adjust speed (copied from https://github.com/anvaka/panzoom/blob/master/index.js#L884)
      var sign = Math.sign(delta);
      var deltaAdjustedSpeed = Math.min(0.25, Math.abs((speed * delta) / 128));
      deltaAdjustedSpeed = 1 - sign * deltaAdjustedSpeed;
      var nextZoom = this.sanitizeZoom(this.zoom * deltaAdjustedSpeed);

      // var wrapper = this.getWrapper();
      // var container = this.getContainer();
      // var diffX = wrapper.clientWidth - container.clientWidth;
      // var diffY = wrapper.clientHeight - container.clientHeight;
      // var centerX = diffX * 0.5;
      // var centerY = diffY * 0.5;
      // var offsetX = this.x - centerX;
      // var offsetY = this.y - centerY;

      // var offsetToParent = this.getEventOffsetToParent(ev);

      // // var offsetX = wrapperCenterX; // - offsetToParent.x;
      // // var offsetY = wrapperCenterY; // - offsetToParent.y;

      // console.log('offsetToParent', offsetToParent, offsetX, offsetY);

      // var currentZoom = this.zoom;
      // var zoomGrowth = (nextZoom - currentZoom) / currentZoom;
      // this.x += offsetX * zoomGrowth;
      // this.y += offsetY * zoomGrowth;

      this.zoom = nextZoom;
      this.setPosition(true);
    }.bind(this);

    this.getWrapper().addEventListener('wheel', mouseWheelEvent);
  };

  // https://stackoverflow.com/questions/8389156/what-substitute-should-we-use-for-layerx-layery-since-they-are-deprecated-in-web
  domPanZoom.prototype.getEventOffsetToParent = function (ev) {
    var el = ev.target;
    var x = 0;
    var y = 0;

    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      x += el.offsetLeft - el.scrollLeft;
      y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
    }

    x = ev.clientX - x;
    y = ev.clientY - y;

    return { x: x, y: y };
  };

  // Initialize
  domPanZoom.prototype.setPosition = function (instant) {
    this.transition(!instant);

    // Check bounds
    if (this.options.bounds) {
      console.log(this.x, this.y);
    }

    // Set position
    this.getContainer().style.transform =
      'matrix(' +
      this.zoom +
      ', 0, 0, ' +
      this.zoom +
      ', ' +
      this.x +
      ', ' +
      this.y +
      ')';
  };

  // Sanitize zoom value
  domPanZoom.prototype.sanitizeZoom = function (zoom) {
    // Adjust for minZoom
    if (zoom < this.options.minZoom) {
      zoom = this.options.minZoom;
    }

    // Adjust for maxZoom
    if (zoom > this.options.maxZoom) {
      zoom = this.options.maxZoom;
    }

    return zoom;
  };

  // Zoom to
  domPanZoom.prototype.zoomTo = function (zoom, instant) {
    // Sanitize zoom
    zoom = this.sanitizeZoom(zoom);

    // Get offset from center, then adjust
    var wrapper = this.getWrapper();
    var container = this.getContainer();
    var diffX = wrapper.clientWidth - container.clientWidth;
    var diffY = wrapper.clientHeight - container.clientHeight;
    var centerX = diffX * 0.5;
    var centerY = diffY * 0.5;
    var offsetX = this.x - centerX;
    var offsetY = this.y - centerY;
    this.adjustPositionByZoom(zoom, offsetX, offsetY);

    // Set new zoom
    this.zoom = zoom;
    this.setPosition(instant);
  };

  // Zoom in
  domPanZoom.prototype.zoomIn = function (step, instant) {
    this.zoomInOut(step, instant, 'in');
  };

  // Zoom out
  domPanZoom.prototype.zoomOut = function (step, instant) {
    this.zoomInOut(step, instant, 'out');
  };

  // Zoom in or out
  domPanZoom.prototype.zoomInOut = function (step, instant, direction) {
    // Step is an optional attribute
    if (step === true || step === false) {
      instant = step;
      step = null;
    }
    step = step || this.options.zoomStep;

    // Calculate nextZoom
    var currentZoom = this.zoom;
    var zoomStep = (100 + step) / 100;
    if (direction === 'out') {
      zoomStep = 1 / zoomStep;
    }
    var nextZoom = currentZoom * zoomStep;

    // Set zoom
    this.zoomTo(nextZoom);
  };

  // Adjust position when zooming
  domPanZoom.prototype.adjustPositionByZoom = function (zoom, x, y) {
    var currentZoom = this.zoom;
    var zoomGrowth = (zoom - currentZoom) / currentZoom;

    var container = this.getContainer();
    var maxOffsetX = container.clientWidth * 0.5 * currentZoom;
    var maxOffsetY = container.clientHeight * 0.5 * currentZoom;

    x > maxOffsetX && (x = Math.min(x, maxOffsetX));
    x < maxOffsetX * -1 && (x = Math.max(x, maxOffsetX * -1));

    y > maxOffsetY && (y = Math.min(y, maxOffsetY));
    y < maxOffsetY * -1 && (y = Math.max(y, maxOffsetY * -1));

    this.x += x * zoomGrowth;
    this.y += y * zoomGrowth;
  };

  // Center container within wrapper
  domPanZoom.prototype.center = function (instant) {
    var wrapper = this.getWrapper();
    var container = this.getContainer();

    var diffX = wrapper.clientWidth - container.clientWidth;
    var diffY = wrapper.clientHeight - container.clientHeight;
    this.x = diffX * 0.5;
    this.y = diffY * 0.5;

    this.setPosition(instant);
  };

  // Get the wrapper element
  domPanZoom.prototype.getWrapper = function () {
    // Return element if it is cached
    if (this.wrapperElement) {
      return this.wrapperElement;
    }

    // Abort if no ID provided
    if (!this.options.wrapperElementID) {
      console.error('wrapperElementID is a required option');
      return null;
    }

    // Find the element
    var wrapperElement = document.querySelector(
      '#' + this.options.wrapperElementID
    );

    // Cache element
    if (wrapperElement) {
      this.wrapperElement = wrapperElement;
      return wrapperElement;
    }

    return null;
  };

  // Get the container element
  domPanZoom.prototype.getContainer = function () {
    // Return element if it is cached
    if (this.containerElement) {
      return this.containerElement;
    }

    // Abort if no ID provided
    if (!this.options.panZoomElementID) {
      console.error('panZoomElementID is a required option');
      return null;
    }

    // Find the element
    var containerElement = document.querySelector(
      '#' + this.options.panZoomElementID
    );

    // Cache element
    if (containerElement) {
      this.containerElement = containerElement;
      return containerElement;
    }

    return null;
  };

  // Enable or disable transitions
  domPanZoom.prototype.transition = function (enabled) {
    this.getContainer().style.transition = enabled ? 'transform 400ms' : null;
  };

  return domPanZoom;
}

//       var containerElement = document.querySelector('#prototype__container');

//       containerElement.addEventListener('mousedown', function (ev) {
//         ev.preventDefault();
//         console.log('0');
//           containerElement.addEventListener('mousemove', theEvent, { passive: true });
//       });

//       document.addEventListener('mouseup', function () {
//         console.log('1');
//           containerElement.removeEventListener('mousemove', theEvent, { passive: true });
//       });

// view.addEventListener('mousedown', tap);
// view.addEventListener('mousemove', drag);
// view.addEventListener('mouseup', release);

// function kinetic(getPoint, scroll, settings) {
//   if (typeof settings !== 'object') {
//     // setting could come as boolean, we should ignore it, and use an object.
//     settings = {};
//   }

//   var minVelocity =
//     typeof settings.minVelocity === 'number' ? settings.minVelocity : 5;
//   var amplitude =
//     typeof settings.amplitude === 'number' ? settings.amplitude : 0.25;
//   var cancelAnimationFrame =
//     typeof settings.cancelAnimationFrame === 'function'
//       ? settings.cancelAnimationFrame
//       : cancelAnimationFrame();
//   var requestAnimationFrame =
//     typeof settings.requestAnimationFrame === 'function'
//       ? settings.requestAnimationFrame
//       : requestAnimationFrame();

//   var lastPoint;
//   var timestamp;
//   var timeConstant = 342;

//   var ticker;
//   var vx, targetX, ax;
//   var vy, targetY, ay;

//   var raf;

//   return {
//     start: start,
//     stop: stop,
//     cancel: dispose
//   };

//   function dispose() {
//     cancelAnimationFrame(ticker);
//     cancelAnimationFrame(raf);
//   }

//   function start() {
//     lastPoint = getPoint();

//     ax = ay = vx = vy = 0;
//     timestamp = new Date();

//     cancelAnimationFrame(ticker);
//     cancelAnimationFrame(raf);

//     // we start polling the point position to accumulate velocity
//     // Once we stop(), we will use accumulated velocity to keep scrolling
//     // an object.
//     ticker = requestAnimationFrame(track);
//   }

//   function track() {
//     var now = Date.now();
//     var elapsed = now - timestamp;
//     timestamp = now;

//     var currentPoint = getPoint();

//     var dx = currentPoint.x - lastPoint.x;
//     var dy = currentPoint.y - lastPoint.y;

//     lastPoint = currentPoint;

//     var dt = 1000 / (1 + elapsed);

//     // moving average
//     vx = 0.8 * dx * dt + 0.2 * vx;
//     vy = 0.8 * dy * dt + 0.2 * vy;

//     ticker = requestAnimationFrame(track);
//   }

//   function stop() {
//     cancelAnimationFrame(ticker);
//     cancelAnimationFrame(raf);

//     var currentPoint = getPoint();

//     targetX = currentPoint.x;
//     targetY = currentPoint.y;
//     timestamp = Date.now();

//     if (vx < -minVelocity || vx > minVelocity) {
//       ax = amplitude * vx;
//       targetX += ax;
//     }

//     if (vy < -minVelocity || vy > minVelocity) {
//       ay = amplitude * vy;
//       targetY += ay;
//     }

//     raf = requestAnimationFrame(autoScroll);
//   }

//   function autoScroll() {
//     var elapsed = Date.now() - timestamp;

//     var moving = false;
//     var dx = 0;
//     var dy = 0;

//     if (ax) {
//       dx = -ax * Math.exp(-elapsed / timeConstant);

//       if (dx > 0.5 || dx < -0.5) {
//         moving = true;
//       } else {
//          dx = ax = 0;
//       }
//     }

//     if (ay) {
//       dy = -ay * Math.exp(-elapsed / timeConstant);

//       if (dy > 0.5 || dy < -0.5) {
//         moving = true;
//       } else {
//         dy = ay = 0;
//       }
//     }

//     if (moving) {
//       scroll(targetX + dx, targetY + dy);
//       raf = requestAnimationFrame(autoScroll);
//     }
//   }
// }

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
