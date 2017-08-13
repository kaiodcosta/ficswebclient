#! /usr/local/bin/node


const fs = require('fs');


// express
var express = require('express');
var app = express();

app.use(express.static('client'));

app.get('/txtlist', function (req, res) {
    var txtlist = [];
    fs.readdir('client/textures', (err, files) => {
        if (files) files.forEach(file => {
            txtlist.push(file);
        });
        res.send(JSON.stringify(txtlist))
    })
})

app.get('/piecelist', function (req, res) {
    var piecelist = [];
    fs.readdir('client/img/chesspieces', (err, files) => {
        if (files) files.forEach(file => {
            piecelist.push(file);
        });
        res.send(JSON.stringify(piecelist))
    })
})

app.get('/soundmap', function (req, res) {
    var obj = {};
    obj.ambience= [];
    obj.gong= [];
    obj.moves = [];
    obj.captures = [];
    obj.checks = [];
    fs.readdir('client/sound/ambience', (err, files) => {
        if (files) files.forEach(file => {
            obj.ambience.push(file);
        });
        fs.readdir('client/sound/gong', (err, files) => {
            if (files) files.forEach(file => {
                obj.gong.push(file);
            });
            fs.readdir('client/sound/moves', (err, files) => {
                if (files) files.forEach(file => {
                    obj.moves.push(file);
                });
                fs.readdir('client/sound/captures', (err, files) => {
                    if (files) files.forEach(file => {
                        obj.captures.push(file);
                    });
                    fs.readdir('client/sound/checks', (err, files) => {
                        if (files) files.forEach(file => {
                            obj.checks.push(file);
                        });
                        res.send(JSON.stringify(obj))
                    })
                })
            })
        })
    })
})

var http = require('http').Server(app);
var port = 3000;

http.listen(port, function() {
    console.log('listening on port ' + port);
});


// telnet
var telnet = require('telnet-client');

var fics_telnet = new telnet();
var fics_telnet_params = {
    host: 'freechess.org',
    port: 5000,
    shellPrompt: 'fics% ',
    timeout: 1500,
    loginPrompt: 'login: ',
    passwordPrompt: 'password: ',
    debug: true,
    maxBufferLength:10000,
};


// socket.io
var io = require('socket.io')(http);

io.on('connection', function(socket) {
    socket.on('login', function(msg) {
        fics_telnet_params.username = msg[0];
        fics_telnet_params.password = msg[1];

        if ( /[Gg]uest/.test(msg[0]) ) {
            fics_telnet_params.passwordPrompt = /Press return to enter the server as .*/;
        }

        fics_telnet.connect(fics_telnet_params).then(function(prompt) { 
            fics_telnet.send('set seek 0',{maxBufferLength:10000});
            fics_telnet.send('style 12',{maxBufferLength:10000});
            fics_telnet.send('iset block 1',{maxBufferLength:10000})
                .then( function() {
                    fics_telnet.shell(function(error, stream) {
                        var cmd_num = 0;
                        var cmd_code = 0;
                        var bufparts = []; 
                        stream.on('data', (data) => {
                            var part = data.toString();

                            var last_part = false;

                            if (part[0] === String.fromCharCode(21)) {
                                start_index = part.lastIndexOf(String.fromCharCode(21));
                                part = part.substring(start_index, part.length);
                                cmd_num = parseInt(part.substring(1, part.indexOf(String.fromCharCode(22))));
                                cmd_code = parseInt(part.substring(part.indexOf(String.fromCharCode(22))+1, part.lastIndexOf(String.fromCharCode(22))));
                            }
                            var end_index = part.indexOf(String.fromCharCode(23));
                            if (end_index != -1) {
                                last_part = true;
                                end_index += 1;
                            }
                            else {
                                end_index = part.length;
                            }

                            var actual_data = part.substring(0, end_index);
                            
                            if (!cmd_num) {
                                actual_data = actual_data.replace(/fics%/g, '').replace(/^[\s\n\r]+|[\s\n\r]+$/g,'');
                                if (actual_data.length) socket.emit('result', actual_data);
                            } else {
                                bufparts.push(actual_data);
                                if (last_part) {
                                    if (bufparts.join('').length) socket.emit('result', bufparts.join(''));
                                    while (bufparts.length) { bufparts.pop(); }
                                    cmd_num = 0;
                                    cmd_code = 0;
                                }
                            }
                        });

                        socket.on('command', function(cmd) {
                            stream.write('123987001 ' + cmd + '\n');
                        });

                        socket.on('command_shell', function(cmd) {
                            stream.write('773450001 ' + cmd + '\n');
                        });

                        stream.on("error", (error) => console.log('EERRROOOORRRR:::   '+error));
                        socket.emit('logged_in');
                    });
                });


        }).catch(e => console.log('e is ' +e));
    });
});
