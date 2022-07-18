/*! domPanZoom | https://github.com/StephanWagner/domPanZoom | MIT License | Copyright Stephan Wagner | https://stephanwagner.me */
// Wrapper function
function domPanZoomWrapper() {
  var domPanZoom = function (options) {
    // Default options, pass a custom options object when initializing domPanZoom to override
    var defaultOptions = {
      // The wrapper and container element
      // You can use an element object or a selector string
      wrapperElement: null,
      panZoomElement: null,

      // Start with a centered position
      // This option overrides options initalPanX and initialPanY
      center: true,

      // Setting the option bounds to 'contain' or 'cover' limits the boundries of the panZoomElement to the wrapperElement
      // This works similar to the CSS property 'background-size: contain / cover'
      // Disable bound by setting this option to 'false'
      // This option might effect the option minZoom
      bounds: 'contain',

      // Minimum and maximum zoom
      minZoom: 0.1,
      maxZoom: 10,

      // How many percent to pan by default with the panning methods panLeft, panRight, panUp and panDown
      panStep: 10,

      // How many percent to zoom by default with the methods zoomIn and zoomOut
      zoomStep: 50,

      // The speed in which to zoom when using mouse wheel
      zoomSpeedWheel: 1,

      // The speed in which to zoom when pinching with touch gestures
      zoomSpeedPinch: 4,

      // Initial zoom
      // Use any zoom value between the options minZoom and maxZoom
      // Use 'cover' or 'contain' to limit the panZoomElement bounds to the wrapperElement
      initialZoom: 'contain',

      // Initial pan in percent
      // The option 'center' has to be 'false' for initial panning to work
      initialPanX: 0,
      initialPanY: 0,

      // Prefer scrolling the page to zooming with mousewheel or panning with touch event
      // TODO how does google do it with tough events (use two fingers) ??
      // TODO
      preferPageScroll: true,

      // The text to show when the option preferPageScroll is enabled
      preferPageScrollText: {
        // TODO
        // Differentiate between mac and windows
      },

      // Transition speed for panning and zooming in milliseconds, higher values are slower
      transitionSpeed: 400,

      // Events
      // TODO test and demo
      onInit: null,
      onChange: null,
      onZoom: null,
      onPan: null
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

    // Cache
    this.evCache = [];
    this.pinchDiffCache = 0;
    this.pinchMoveCache = null;

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

      if (this.options.bounds == 'cover') {
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
    if (this.options.center) {
      this.center(true);
    } else {
      this.panTo(this.options.initialPanX, this.options.initialPanY, true);
    }

    // Trigger event
    this.fireEvent('onInit', this.getPosition());
  };

  // Fire an event from the options
  domPanZoom.prototype.fireEvent = function (event, pass) {
    this.options[event] && this.options[event].bind(this)(pass);
  };

  // Attach events
  domPanZoom.prototype.attachEvents = function () {
    // Event while mouse moving
    var setPositionEvent = function (ev) {
      if (this.blockPan == true) {
        return;
      }

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

      // Trigger event
      this.fireEvent('onPan', this.getPosition());
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

    this.getWrapper().addEventListener('mousedown', mouseDownTouchStartEvent, {
      passive: false
    });
    this.getWrapper().addEventListener('touchstart', mouseDownTouchStartEvent, {
      passive: false
    });

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

    document.addEventListener('mouseup', mouseUpTouchEndEvent, {
      passive: true
    });
    document.addEventListener('touchend', mouseUpTouchEndEvent, {
      passive: true
    });

    // Mouse wheel events
    var mouseWheelEvent = function (ev) {
      ev.preventDefault();

      // Delta
      var delta = ev.deltaY;
      if (ev.deltaMode > 0) {
        delta *= 100;
      }

      // Speed
      var speed = this.options.zoomSpeedWheel;

      // Adjust speed (https://github.com/anvaka/panzoom/blob/master/index.js#L884)
      var sign = Math.sign(delta);
      var deltaAdjustedSpeed = Math.min(0.25, Math.abs((speed * delta) / 128));
      deltaAdjustedSpeed = 1 - sign * deltaAdjustedSpeed;
      var nextZoom = this.sanitizeZoom(this.zoom * deltaAdjustedSpeed);

      // Get offset to center, then adjust
      var offsetToCenter = this.getEventOffsetToCenter(ev);
      this.adjustPositionByZoom(nextZoom, offsetToCenter.x, offsetToCenter.y);

      // Update position
      this.zoom = nextZoom;
      this.setPosition(true);

      // Trigger event
      this.fireEvent('onZoom', this.getPosition());
    }.bind(this);

    this.getWrapper().addEventListener('wheel', mouseWheelEvent, {
      passive: false
    });

    // Pinch events
    var pointerDownEvent = function (ev) {
      this.evCache.push(ev);
      this.zoomCache = this.zoom;
      this.xCache = this.x;
      this.yCache = this.y;
      if (this.evCache.length == 2) {
        this.blockPan = true;
        this.pinchDiffCache = this.getTouchEventsDistance(
          this.evCache[0],
          this.evCache[1]
        );
        this.touchEventsCenterCache = this.getTouchEventsCenter(
          this.evCache[0],
          this.evCache[1]
        );
      }
    }.bind(this);

    this.getWrapper().addEventListener('pointerdown', pointerDownEvent, {
      passive: false
    });

    var pointerMoveEvent = function (ev) {
      for (let i = 0; i < this.evCache.length; i++) {
        if (ev.pointerId == this.evCache[i].pointerId) {
          this.evCache[i] = ev;
          break;
        }
      }

      // Proceed if two touch gestures detected
      if (this.evCache.length == 2) {
        // Calculate distance between fingers
        var pinchDiff = this.getTouchEventsDistance(
          this.evCache[0],
          this.evCache[1]
        );
        pinchDiff -= this.pinchDiffCache;

        var pinchDiffPercent = pinchDiff / this.getContainer().clientWidth;
        pinchDiffPercent *= this.options.zoomSpeedPinch;
        pinchDiffPercent += 1;

        var nextZoom = this.sanitizeZoom(this.zoomCache * pinchDiffPercent);

        // Get offset to center, then adjust
        var touchEventsCenter = this.getTouchEventsCenter(
          this.evCache[0],
          this.evCache[1]
        );
        var offsetToCenter = this.getEventOffsetToCenter({
          target: this.evCache[0].target,
          clientX: touchEventsCenter.clientX,
          clientY: touchEventsCenter.clientY
        });
        this.adjustPositionByZoom(nextZoom, offsetToCenter.x, offsetToCenter.y);

        // Adjust position when moving while pinching
        var touchEventsCenterDiff = {
          x: touchEventsCenter.clientX - this.touchEventsCenterCache.clientX,
          y: touchEventsCenter.clientY - this.touchEventsCenterCache.clientY
        };
        this.x = this.xCache + touchEventsCenterDiff.x;
        this.y = this.yCache + touchEventsCenterDiff.y;

        // Update position
        this.zoom = nextZoom;
        this.setPosition(true);

        // Trigger events
        this.fireEvent('onZoom', this.getPosition());
        this.fireEvent('onPan', this.getPosition());
      }
    }.bind(this);

    this.getWrapper().addEventListener('pointermove', pointerMoveEvent, {
      passive: false
    });

    var pointerUpEvent = function (ev) {
      for (var i = 0; i < this.evCache.length; i++) {
        if (this.evCache[i].pointerId == ev.pointerId) {
          this.evCache.splice(i, 1);
          break;
        }
      }

      if (this.evCache.length < 2) {
        this.blockPan = false;
      }
    }.bind(this);

    ['pointerup', 'pointercancel', 'pointerout', 'pointerleave'].forEach(
      function (event) {
        this.getWrapper().addEventListener(event, pointerUpEvent, {
          passive: false
        });
      }.bind(this)
    );
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

  // Get the event offset to the center
  domPanZoom.prototype.getEventOffsetToCenter = function (ev) {
    var wrapper = this.getWrapper();
    var container = this.getContainer();
    var diffX = wrapper.clientWidth - container.clientWidth;
    var diffY = wrapper.clientHeight - container.clientHeight;
    var centerX = diffX * 0.5;
    var centerY = diffY * 0.5;

    var offsetToCenter = {
      x: 0,
      y: 0
    };

    if (ev) {
      var offsetToParent = this.getEventOffsetToParent(ev);
      offsetToCenter.x =
        (wrapper.clientWidth / 2 - offsetToParent.x - window.scrollX) * -1;
      offsetToCenter.y =
        (wrapper.clientHeight / 2 - offsetToParent.y - window.scrollY) * -1;
    }

    var offsetX = this.x - centerX - offsetToCenter.x;
    var offsetY = this.y - centerY - offsetToCenter.y;

    return {
      x: offsetX,
      y: offsetY
    };
  };

  // Get the distance between two touch events
  domPanZoom.prototype.getTouchEventsDistance = function (ev1, ev2) {
    return Math.abs(Math.hypot(ev1.pageX - ev1.pageX, ev1.pageY - ev2.pageY));
  };

  // Get the center point between two touch events
  domPanZoom.prototype.getTouchEventsCenter = function (ev1, ev2) {
    return {
      pageX: (ev1.pageX + ev2.pageX) / 2,
      pageY: (ev1.pageY + ev2.pageX) / 2,
      clientX: (ev1.clientX + ev2.clientX) / 2,
      clientY: (ev1.clientY + ev2.clientY) / 2
    };
  };

  // Get current position values
  domPanZoom.prototype.getPosition = function () {
    return {
      zoom: this.zoom,
      x: this.x,
      y: this.y
    };
  };

  // Initialize
  domPanZoom.prototype.setPosition = function (instant) {
    this.transition(!instant);

    // Fit to bounds
    if (this.options.bounds) {
      var wrapper = this.getWrapper();
      var container = this.getContainer();
      var wrapperWidth = wrapper.clientWidth;
      var wrapperHeight = wrapper.clientHeight;
      var containerWidth = container.clientWidth;
      var containerHeight = container.clientHeight;
      var containerZoomWidth = containerWidth * this.zoom;
      var containerZoomHeight = containerHeight * this.zoom;

      var upperOffsetX = (containerWidth / 2) * (this.zoom - 1);
      var lowerOffsetX = upperOffsetX * -1 + wrapperWidth - containerWidth;

      if (containerZoomWidth < wrapperWidth) {
        this.x < upperOffsetX && (this.x = upperOffsetX);
        this.x > lowerOffsetX && (this.x = lowerOffsetX);
      } else {
        this.x = Math.min(this.x, upperOffsetX);
        this.x = Math.max(this.x, lowerOffsetX);
      }

      var upperOffsetY = (containerHeight / 2) * (this.zoom - 1);
      var lowerOffsetY = upperOffsetY * -1 + wrapperHeight - containerHeight;

      if (containerZoomHeight < wrapperHeight) {
        this.y < upperOffsetY && (this.y = upperOffsetY);
        this.y > lowerOffsetY && (this.y = lowerOffsetY);
      } else {
        this.y = Math.min(this.y, upperOffsetY);
        this.y = Math.max(this.y, lowerOffsetY);
      }
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

    // Trigger event
    this.fireEvent('onChange', this.getPosition());

    // Return instance
    return this;
  };

  // Sanitize zoom value
  domPanZoom.prototype.sanitizeZoom = function (zoom) {
    // Get values for 'cover' and 'contain'
    if (zoom == 'cover' || zoom == 'contain') {
      var wrapper = this.getWrapper();
      var container = this.getContainer();

      var maxWidth = wrapper.clientWidth;
      var maxHeight = wrapper.clientHeight;

      var panZoomWidth = container.clientWidth;
      var panZoomHeight = container.clientHeight;

      var minZoomX = maxWidth / panZoomWidth;
      var minZoomY = maxHeight / panZoomHeight;

      if (zoom == 'cover') {
        zoom = Math.max(minZoomX, minZoomY);
      } else {
        zoom = Math.min(minZoomX, minZoomY);
      }
    }

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

  // Getter for zoom
  domPanZoom.prototype.getZoom = function () {
    return this.zoom;
  };

  // Zoom to
  domPanZoom.prototype.zoomTo = function (zoom, instant) {
    // Sanitize zoom
    zoom = this.sanitizeZoom(zoom);

    // Get offset to center, then adjust
    var offsetToCenter = this.getEventOffsetToCenter();
    this.adjustPositionByZoom(zoom, offsetToCenter.x, offsetToCenter.y);

    // Set new zoom
    this.zoom = zoom;
    this.setPosition(instant);

    // Trigger event
    this.fireEvent('onZoom', this.getPosition());

    // Return instance
    return this;
  };

  // Zoom in
  domPanZoom.prototype.zoomIn = function (step, instant) {
    return this.zoomInOut(step, instant, 'in');
  };

  // Zoom out
  domPanZoom.prototype.zoomOut = function (step, instant) {
    return this.zoomInOut(step, instant, 'out');
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

    // Update zoom
    return this.zoomTo(nextZoom, instant);
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
    return this.panTo(50, 50, instant);
  };

  // Getters for pan
  domPanZoom.prototype.getPan = function (pixelValues) {
    return {
      x: this.getPanX(pixelValues),
      y: this.getPanY(pixelValues)
    };
  };

  domPanZoom.prototype.getPanX = function (pixelValues) {
    if (pixelValues) {
      return this.x;
    }
    var wrapper = this.getWrapper();
    var container = this.getContainer();
    var panX = wrapper.clientWidth * 0.5 + this.x * -1;
    panX += (this.zoom - 1) * (container.clientWidth * 0.5);
    var percentX = (panX / (container.clientWidth * this.zoom)) * 100;
    return percentX;
  };

  domPanZoom.prototype.getPanY = function (pixelValues) {
    if (pixelValues) {
      return this.y;
    }
    var wrapper = this.getWrapper();
    var container = this.getContainer();
    var panY = wrapper.clientHeight * 0.5 + this.y * -1;
    panY += (this.zoom - 1) * (container.clientHeight * 0.5);
    var percentY = (panY / (container.clientHeight * this.zoom)) * 100;
    return percentY;
  };

  // Pan to position
  domPanZoom.prototype.panTo = function (x, y, instant) {
    var wrapper = this.getWrapper();
    var container = this.getContainer();

    var panX = ((container.clientWidth * this.zoom * x) / 100) * -1;
    panX += (this.zoom - 1) * (container.clientWidth * 0.5);
    panX += wrapper.clientWidth * 0.5;

    var panY = ((container.clientHeight * this.zoom * y) / 100) * -1;
    panY += (this.zoom - 1) * (container.clientHeight * 0.5);
    panY += wrapper.clientHeight * 0.5;

    this.x = panX;
    this.y = panY;

    // Update position
    this.setPosition(instant);

    // Trigger event
    this.fireEvent('onPan', this.getPosition());

    // Return instance
    return this;
  };

  domPanZoom.prototype.panLeft = function (step, instant) {
    return this.pan(step, instant, 'left');
  };

  domPanZoom.prototype.panRight = function (step, instant) {
    return this.pan(step, instant, 'right');
  };

  domPanZoom.prototype.panUp = function (step, instant) {
    return this.pan(step, instant, 'up');
  };

  domPanZoom.prototype.panDown = function (step, instant) {
    return this.pan(step, instant, 'down');
  };

  domPanZoom.prototype.pan = function (step, instant, direction) {
    if (step === true || step === false) {
      instant = step;
      step = null;
    }
    step = step || this.options.panStep;

    var container = this.getContainer();
    panWidth = ((container.clientWidth * step) / 100) * this.zoom;
    panHeight = ((container.clientWidth * step) / 100) * this.zoom;

    direction === 'left' && (this.x += panWidth * -1);
    direction === 'right' && (this.x += panWidth);
    direction === 'up' && (this.y += panHeight * -1);
    direction === 'down' && (this.y += panHeight);

    // Update position
    this.setPosition(instant);

    // Trigger event
    this.fireEvent('onPan', this.getPosition());

    // Return instance
    return this;
  };

  // Get the wrapper element
  domPanZoom.prototype.getWrapper = function () {
    // Return element if it is cached
    if (this.wrapperElement) {
      return this.wrapperElement;
    }

    // Abort if option is empty
    if (!this.options.wrapperElement) {
      console.error('The option wrapperElement is required');
      return null;
    }

    // Find the element if selector provided
    if (typeof this.options.wrapperElement === 'string') {
      this.options.wrapperElement = document.querySelector(
        this.options.wrapperElement
      );
    }

    // Cache element if valid
    if (
      this.options.wrapperElement &&
      this.options.wrapperElement instanceof Element
    ) {
      this.wrapperElement = this.options.wrapperElement;
      return this.options.wrapperElement;
    }

    console.error(
      'The option wrapperElement needs to be a valid selector string or an instance of Element'
    );
    return null;
  };

  // Get the container element
  domPanZoom.prototype.getContainer = function () {
    // Return element if it is cached
    if (this.containerElement) {
      return this.containerElement;
    }

    // Abort if option is empty
    if (!this.options.panZoomElement) {
      console.error('The option panZoomElement is required');
      return null;
    }

    // Find the element if selector provided
    if (typeof this.options.panZoomElement === 'string') {
      this.options.panZoomElement = document.querySelector(
        this.options.panZoomElement
      );
    }

    // Cache element if valid
    if (
      this.options.panZoomElement &&
      this.options.panZoomElement instanceof Element
    ) {
      this.containerElement = this.options.panZoomElement;
      return this.options.panZoomElement;
    }

    console.error(
      'The option panZoomElement needs to be a valid selector string or an instance of Element'
    );
    return null;
  };

  // Enable or disable transitions
  domPanZoom.prototype.transition = function (enabled) {
    this.getContainer().style.transition = enabled
      ? 'transform ' + this.options.transitionSpeed + 'ms'
      : null;
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
