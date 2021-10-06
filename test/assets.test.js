var fs = require('fs');

// Check if asset exists
function checkForAsset(path) {
  var pathFound = true;
  try {
    fs.accessSync(path);
  } catch (e) {
    pathFound = false;
  }
  return pathFound;
}

// Check for default files
for (let extension of ['.js', '.min.js']) {
  test('Asset domPanZoom' + extension + ' exists', () => {
    expect(checkForAsset('./dist/domPanZoom' + extension)).toBe(true);
  });
}
