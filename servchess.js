#! /usr/local/bin/node

// express
var express = require('express');
var app = express();

app.use(express.static('client'));

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
    username: '',
    password: '',
    debug: true,
    maxBufferLength:10000,
};


// socket.io
var io = require('socket.io')(http);

io.on('connection', function(socket) {
    socket.on('login', function(msg) {
        var login = msg[0];
        var password = msg[1];

        fics_telnet_params.username = msg[0];
        fics_telnet_params.password = msg[1];

        fics_telnet.connect(fics_telnet_params).then(function(prompt) { 
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
                            stream.write('77 ' + cmd + '\n');
                        });

                        stream.on("error", (error) => console.log('EERRROOOORRRR:::   '+error));
                    });
                });

            if (prompt) { socket.emit('logged_in') }

        }).catch(e => console.log('e is ' +e));
    });
});
