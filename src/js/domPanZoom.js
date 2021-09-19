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
      minZoom: 0.1,
      maxZoom: 10,

      // How many percent to zoom with zoomIn and zoomOut
      zoomStep: 50,

      // Initial zoom
      initialZoom: 1,

      // Bounds
      bounds: true,
      boundsOffset: 0.1

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
    // Add styles
    this.getWrapper().style.cursor = 'grab';
    this.getWrapper().style.overflow = 'hidden';

    // Attach events
    this.attachEvents();

    // Set initial zoom
    this.zoomTo(this.options.initialZoom, true);

    // Set center position
    this.options.center && this.center(true);
  };

  // Attach events
  domPanZoom.prototype.attachEvents = function () {
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

    this.getWrapper().addEventListener(
      'mousedown',
      function (ev) {
        ev.preventDefault();
        document.body.style.cursor = 'grabbing';
        this.getWrapper().style.cursor = 'grabbing';
        document.addEventListener('mousemove', setPositionEvent, {
          passive: true
        });
      }.bind(this)
    );

    document.addEventListener(
      'mouseup',
      function () {
        this.previousEvent = null;
        document.body.style.cursor = null;
        this.getWrapper().style.cursor = 'grab';
        document.removeEventListener('mousemove', setPositionEvent, {
          passive: true
        });
      }.bind(this)
    );

    this.getWrapper().addEventListener(
      'touchstart',
      function (ev) {
        ev.preventDefault();
        document.body.style.cursor = 'grabbing';
        this.getWrapper().style.cursor = 'grabbing';
        document.addEventListener('touchmove', setPositionEvent, {
          passive: true
        });
      }.bind(this)
    );

    document.addEventListener(
      'touchend',
      function () {
        this.previousEvent = null;
        document.body.style.cursor = null;
        this.getWrapper().style.cursor = 'grab';
        document.removeEventListener('touchmove', setPositionEvent, {
          passive: true
        });
      }.bind(this)
    );
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
    this.zoom = this.sanitizeZoom(zoom);
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
    if (step === true || step === false) {
      instant = step;
      step = null;
    }
    step = step || this.options.zoomStep;

    // Calculate nextZoom
    var currentZoom = this.zoom;
    var zoomStep = (100 + step) / 100;
    var nextZoom = currentZoom * (direction === 'out' ? 1 / zoomStep : zoomStep);
    nextZoom = this.sanitizeZoom(nextZoom);

    // TODO adjust boundings to zoom centered

    // // Get center
    // var wrapper = this.getWrapper();
    // var container = this.getContainer();

    // var diffX = wrapper.clientWidth - container.clientWidth;
    // var diffY = wrapper.clientHeight - container.clientHeight;
    // this.x = diffX * 0.5;
    // this.y = diffY * 0.5;

    //   var currentZoom = this.zoom;
    //   var nextZoom = zoom;
    //   var zoomDiff = nextZoom - currentZoom;

    //   var wrapperBounding = this.getWrapper().getBoundingClientRect();
    //   var panZoomBounding = this.getContainer().getBoundingClientRect();

    //   console.log(panZoomBounding, panZoomBounding);

    //   console.log('zoomDiff', zoomDiff);

    this.zoom = nextZoom;

    this.setPosition(instant);
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
