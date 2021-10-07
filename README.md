# domPanZoom

Add mobile friendly panning and zooming to any DOM element.

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

```javascript
new domPanZoom({
  // The ID of the wrapper element (required)
  wrapperElementID: 'prototype__wrapper',

  // The ID of the container element (required)
  panZoomElementID: 'prototype__container'
});
```

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
| `initialPanX` | `0` | Initial horizontal pan |
| `initialZoom` | `0` | Initial vertical pan |

---

## Methods

You can use the following methods:

| Method |  |
| --- | --- |
| `.zoomTo(2)`<br>`.zoomTo(2, true)` | Zoom to a specific zoom level. Pass true as a second argument to zoom instantly |
| `.zoomIn()`<br>`.zoomIn(20)`<br>`.zoomIn(true)`<br>`.zoomIn(50, true)`<br>`.zoomOut()` | Zoom in and out. You can pass a number to zoom a specific amount (in percent). Pass true as first or second argument to zoom instantly |
| `.center()`<br>`.center(true)` | Move to centered position. Pass true to center instantly |

---

## Attribution

This library is heavily inspired by https://github.com/anvaka/panzoom.
