#! /usr/local/bin/node

//var varfile = process.argv[2];
var varfile = 'test.txt';

var parser = require("./fics_parser");

fs = require('fs')
fs.readFile(varfile, 'ascii', function (err,data) {
    if (err) {
        return console.log(err);
    }
    console.log(parser.parse(data));
});
