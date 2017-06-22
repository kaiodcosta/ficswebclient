#! /usr/local/bin/node

var fs = require('fs')
var peg = require("pegjs/lib/peg.js");

var grammer_file = process.argv[2];
var text_file = process.argv[3];

fs.readFile(grammer_file, 'ascii', function (err,data) {
    if (err) {
        return console.log(err);
    }
    var parser = peg.generate(data);

    fs.readFile(text_file, 'ascii', function (err2,data2) {
        if (err2) {
            return console.log(err2);
        }
        var parsed = parser.parse(data2);
        console.log(parsed);
    });
});
