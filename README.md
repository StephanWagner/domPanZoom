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
<script src="https://cdn.jsdelivr.net/npm/dompanzoom@v0.0.4/dist/domPanZoom.min.js"></script>
```

---

## Usage

You need two HTML DOM elements. The panZoom element within a wrapper element:

```html
<div id="my-wrapper">
  <div id="my-container"></div>
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
| `center` | `true` | Start with a centered position. This options overrides options initalPanX and initialPanY |
| `bounds` | `cover` | Set this option to `'contain'` or `'cover'` to limit the boundries of the panZoomElement to the wrapperElement. This works similar to the CSS property background-size: contain / cover. Setting this option might effect the option minZoom |
| `minZoom` | `0.1` | Minimum zoom |
| `maxZoom` | `10` | Maximum zoom |
| `zoomStep` | `50` | How many percent to zoom with the methods zoomIn and zoomOut |
| `zoomWheelSpeed` | `1` | The speed in which to zoom when using mouse wheel |
| `panStep` | `10` | How many percent to pan with the methods panLeft, panRight, panUp and panDown |
| `initialPanX` | `0` | Initial horizontal pan |
| `initialZoom` | `0` | Initial vertical pan |

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
| `.getPan()` | Returns an object with x and y values of current pan position |
| `.getPanX()` | Returns current pan x position |
| `.getPanY()` | Returns current pan y position |
| `.getZoom()` | Returns current zoom level |

| Setters |  |
| --- | --- |
| `.panLeft()`<br>`.panRight()`<br>`.panUp()`<br>`.panDown()` | Pan a aspecific direction. You can pass a number to pan a specific amount (in percent). Pass `true` as first or second argument to pan instantly, e.g. `.panLeft(50)`, `.panRight(true)`, `.panUp(30, true)` |
| `.center()` | Move to centered position. Pass true to center instantly, e.g. `.center(true)` |
| `.zoomTo(2)` | Zoom to a specific zoom level. Pass true as a second argument to zoom instantly, e.g. `.zoomTo(3, true)` |
| `.zoomIn()`<br>`.zoomOut()` | Zoom in and out. You can pass a number to zoom a specific amount (in percent). Pass `true` as first or second argument to zoom instantly, `.zoomIn(20)`, `.zoomIn(true)`, `.zoomIn(50, true)`<br> |

### E.g.

```javascript
new domPanZoom({
  wrapperElementID: 'my-wrapper',
  panZoomElementID: 'my-container'
});

var currentPan = myDomPanZoom.getPan();
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

  onZoom: function (e) {
    console.log(this.getZoom());
  }
});
```

---

## Attribution

This library is heavily inspired by https://github.com/anvaka/panzoom.
