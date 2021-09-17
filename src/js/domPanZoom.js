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
      center: true,

      // Minimum and maximum zoom
      minZoom: 1,
      maxZoom: 10,

      // TODO The size of the panZoomElement in percent when zoom is at maxZoom value
      maxZoomPercent: 500,

      // Initial zoom
      initialZoom: 0

      // TODO Initial panX
      // TODO Initial panY
    };

    // Merge options
    this.options = Object.assign({}, defaultOptions, options || {});

    // Initialize
    this.init();
  };

  // Initialize
  domPanZoom.prototype.init = function () {
    // Set center position
    this.options.center && this.center(true);

    var theEvent = function (ev) {
      this.x += ev.movementX;
      this.y += ev.movementY;
      this.setPosition(true);
    }.bind(this);

    this.getWrapper().addEventListener('mousedown', function (ev) {
      ev.preventDefault();
      this.getWrapper().addEventListener('mousemove', theEvent, {
        passive: true
      });
    }.bind(this));

    document.addEventListener('mouseup', function () {
      this.getWrapper().removeEventListener('mousemove', theEvent, {
        passive: true
      });
    }.bind(this));
  };

  // Initialize
  domPanZoom.prototype.setPosition = function (instant) {
    this.transition(!instant);

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

  // Zoom in
  domPanZoom.prototype.zoomIn = function (zoom, instant) {
    this.zoom = 2;
    this.setPosition(instant);
  };

  // Center container within wrapper
  domPanZoom.prototype.center = function (instant) {
    var diffX = this.getWrapper().clientWidth - this.getContainer().clientWidth;
    var diffY =
      this.getWrapper().clientHeight - this.getContainer().clientHeight;

    this.zoom = 1;
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
    this.getContainer().style.transition = enabled ? 'transform 400ms' : 'none';
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
