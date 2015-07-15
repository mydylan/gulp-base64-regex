'use strict';

var through = require('through2');
var rs = require('replacestream');
var istextorbinary = require('istextorbinary');
var path = require('path');
var mime = require('mime');
var fs = require('fs');

module.exports = function() {


  var doReplace = function(file, enc, callback) {
    var search = /"[^"]*.(.png|jpg|jpeg)"|'[^']*.(.png|jpg|jpeg)'|\([^\(]*.(.png|jpg|jpeg)\)/g,
      base64Code;
        
    function toBase64(str) {
      var isdata = str.indexOf("data");
      if (str != "" && typeof str != 'undefined' && isdata !== 0) {
        var type = str.slice(0, 1);
        str = str.slice(1, -1);
        var spath = path.join(file.base, str);
        var mtype = mime.lookup(spath);
        if (mtype != 'application/octet-stream') {
          var sfile = fs.readFileSync(spath);
          var simg64 = new Buffer(sfile).toString('base64');

          if (type === "'" || type === '"') {
            return '"' + 'data:' + mtype + ';base64,' + simg64 + '"'
          }
          else {
            return '(' + 'data:' + mtype + ';base64,' + simg64 + ')'
          }
        }
      }
    }
    function doReplace() {
      var str,
          matchArray;
      if (file.isBuffer()) {
        if (search instanceof RegExp) {
          str = String(file.contents);
          matchArray = str.match(search);
          if (matchArray !== null && matchArray !== undefined) {
            for(var i = 0; i < matchArray.length; i++) {
              base64Code = toBase64(matchArray[i]);
              file.contents = new Buffer(String(file.contents).replace(matchArray[i], base64Code));
            }            
          }
        }
        return callback(null, file);
      }

      callback(null, file);
    } 

    doReplace();
  };

  return through.obj(doReplace);
};