# domPanZoom

Add mobile friendly panning and zooming to any HTML DOM element.

---

## Install

### ES6

```bash
npm install --save dompanzoom
```

```javascript
import domPanZoom from 'dompanzoom';
```

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/dompanzoom@v0.0.5/dist/domPanZoom.min.js"></script>
```

---

## Usage

You need two HTML DOM elements. The panZoom element within a wrapper element:

```html
<div id="my-wrapper">
  <div id="my-container">
    <p>You can add any HTML here<p>
  </div>
</div>
```

Then create a new instance of domPanZoom:

```javascript
new domPanZoom({
  // The ID of the wrapper element (required)
  wrapperElementID: 'my-wrapper',

  // The ID of the container element (required)
  panZoomElementID: 'my-container'
});
```

---

## Options

You can pass the following options into domPanZoom:

| Option | Default |  |
| --- | --- | --- |
| `center` | `true` | Start with a centered position. This option overrides `initalPanX` and `initialPanY` |
| `bounds` | `cover` | Set this option to `'contain'` or `'cover'` to limit the boundries of the panZoomElement to the wrapperElement. This works similar to the CSS property background-size: contain / cover. Setting this option might effect the option minZoom |
| `minZoom` | `0.1` | Minimum zoom, `0.5` would be half the original size |
| `maxZoom` | `10` | Maximum zoom, `2` would be double the original size |
| `panStep` | `10` | How many percent to pan by default with the panning methods panLeft, panRight, panUp and panDown |
| `zoomStep` | `50` | How many percent to zoom by default with the methods zoomIn and zoomOut |
| `zoomWheelSpeed` | `1` | The speed in which to zoom when using the mouse wheel |
| `initialZoom` | `1` | Initial zoom level |
| `initialPanX` | `0` | Initial horizontal pan in percent |
| `initialPanY` | `0` | Initial vertical pan in percent |
| `transitionSpeed` | `400` | Transition speed in milliseconds, higher values are slower |

### E.g.

```javascript
new domPanZoom({
  wrapperElementID: 'my-wrapper',
  panZoomElementID: 'my-container',
  bounds: false,
  minZoom: 1
});
```

---

## Methods

You can use the following methods:

| Getters |  |
| --- | --- |
| `.getPan()` | Returns an object with X and Y values of current pan position. You can pass `true` to get the actual pixel values, e.g. `.getPan(true)` |
| `.getPanX()` | Returns the current horizontal position. You can pass `true` to get the actual pixel values, e.g. `.getPanX(true)` |
| `.getPanY()` | Returns the current vertical position. You can pass `true` to get the actual pixel values, e.g. `.getPanY(true)` |
| `.getZoom()` | Returns the current zoom level |

| Setters |  |
| --- | --- |
| `.panLeft()`<br>`.panRight()`<br>`.panUp()`<br>`.panDown()` | Pan a specific direction. You can pass a number to pan a specific amount (in percent). Pass `true` as first or second argument to pan instantly, e.g. `.panLeft(50)`, `.panRight(true)`, `.panUp(30, true)` |
| `.panTo(x, y)` | Pan to a specific position. The `x` and `y` values are in percent, so `.panTo(50, 50)` will pan to the center. Pass `true` as third argument to pan instantly, e.g. `.panTo(50, 50, true)`
| `.center()` | Pan to centered position. Pass `true` to center instantly, e.g. `.center(true)` |
| `.zoomIn()`<br>`.zoomOut()` | Zoom in and out. You can pass a number to zoom a specific amount (in percent). Pass `true` as first or second argument to zoom instantly, `.zoomIn(20)`, `.zoomIn(true)`, `.zoomIn(50, true)` |
| `.zoomTo(2)` | Zoom to a specific zoom level. Pass `true` as a second argument to zoom instantly, e.g. `.zoomTo(2, true)` |

### E.g.

```javascript
var myDomPanZoom = new domPanZoom({
  wrapperElementID: 'my-wrapper',
  panZoomElementID: 'my-container'
});

myDomPanZoom.panTo(20, 80);
```

---

## Events

| Event |  |
| --- | --- |
| `onInit` | Triggered once domPanZoom is initialized |
| `onChange` | Triggered while panning or zooming |
| `onZoom` | Triggered while zooming |
| `onPan` | Triggered while panning |

### E.g.

```javascript
var myDomPanZoom = new domPanZoom({
  wrapperElementID: 'my-wrapper',
  panZoomElementID: 'my-container',

  onZoom: function () {
    console.log(this.getZoom());
  }
});
```

---

## Attribution

This library is heavily inspired by https://github.com/anvaka/panzoom.
