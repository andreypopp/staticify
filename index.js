var mimer = require('mimer');
var through = require('through');

function transformCSS(data) {
  var code = '';
  code += 'var node = document.createElement(\'style\');\n';
  code += 'node.innerHTML = ' + JSON.stringify(data) + ';\n';
  code += 'document.head.appendChild(node);\n';
  return code;
}

function transformImage(data, filename) {
  var uri = 'data:' + mimer(filename) + ';base64,' + new Buffer(data).toString('base64');
  return 'module.exports = ' + JSON.stringify(uri) + ';\n';
}

function hasExt(filename, exts) {
  for (var i = 0; i < exts.length; i++) {
    if (filename.indexOf(exts[i]) === filename.length - exts[i].length) {
      return true;
    }
  }
  return false;
}

function isImage(filename) {
  return hasExt(filename, ['.png', '.jpg']);
}

function isCSS(filename) {
  return hasExt(filename, ['.css']);
}

module.exports = function(filename) {
  var buf = '';
  return through(function(data) {
    buf += data;
  }, function() {
    if (isImage(filename)) {
      this.queue(transformImage(buf, filename));
    } else if (isCSS(filename)) {
      this.queue(transformCSS(buf));
    } else {
      this.queue(buf);
    }
    this.queue(null);
  });
};