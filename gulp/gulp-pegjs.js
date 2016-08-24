'use strict';

var gutil     = require('gulp-util');
var through   = require('through2');
var assign    = require('object-assign');

var pegjs     = require('pegjs');

module.exports = function (opts) {
    return through.obj(function (file, enc, cb) {

        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            cb(new gutil.PluginError('gulp-pegjs', 'Streaming not supported'));
            return;
        }

        // always generate source code of parser
        var options = assign({ output: 'source', format: "commonjs" }, opts);

        var filePath = file.path;

        try {
            var generatedContent = pegjs.buildParser(file.contents.toString(), options)
            var c = "module.exports = " + generatedContent
            file.contents = new Buffer(c);
            file.path = gutil.replaceExtension(file.path, '.js');
            this.push(file);
        } catch (err) {
            this.emit('error', new gutil.PluginError('gulp-pegjs', err, {fileName: filePath}));
        }

        cb();
    });
};
