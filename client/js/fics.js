/*
#define BLK_ABORT 10
#define BLK_ACCEPT 11
#define BLK_DECLINE 33
#define BLK_DRAW 34
#define BLK_GAMES 43
#define BLK_MATCH 73
#define BLK_MOVES 77
#define BLK_OBSERVE 80
#define BLK_PENDING 87
#define BLK_RESIGN 103
#define BLK_SEEK 155
#define BLK_SOUGHT 157
#define BLK_UNOBSERVE 138
#define BLK_UNSEEK 156
#define BLK_VARIABLES 143
#define BLK_WITHDRAW 147
*/
default_themes = [{
"name":"cop",
"light_rgba":{"r":255,"g":255,"b":255,"a":0.09},
"dark_rgba":{"r":255,"g":255,"b":255,"a":0},"texture":"brushed-copper.jpg","white_pieces":"alpha","black_pieces":"alpha"},{
"name":"leav",
"dark_rgba":{"r":0,"g":0,"b":0,"a":0.71},
"light_rgba":{"r":255,"g":255,"b":255,"a":0.56},"texture":"Nature-Leaves-Background-70-625x500.jpg","white_pieces":"chesscom","black_pieces":"chess24"},{
"name":"fire",
"dark_rgba":{"r":0,"g":0,"b":0,"a":0.74},
"light_rgba":{"r":253.57199999999997,"g":132.59259171619996,"b":33.141860399999985,"a":0.72},"texture":"Fire-Flames-Background-11-625x468.jpg","white_pieces":"chesscom","black_pieces":"chesscom"},{
"name":"hunjies",
"dark_rgba":{"r":48.432867795674994,"g":101.8215,"b":21.718525949999993,"a":0.81},
"light_rgba":{"r":245.463,"g":244.67996075685002,"b":241.70741610000002,"a":0.79},"texture":"Money-Background-17-625x625.jpg","white_pieces":"uscf","black_pieces":"uscf"},{
"name":"met",
"dark_rgba":{"r":0,"g":0,"b":0,"a":0},
"light_rgba":{"r":226.63988810459998,"g":250.002,"b":54.77543819999999,"a":0.46},"texture":"metal-plate-texture_1048-2443.jpg","white_pieces":"chesscom_wood","black_pieces":"chesscom"},{
"name":"wood",
"dark_rgba":{"r":91.31550000000001,"g":28.09777935,"b":28.09777935,"a":0.75},
"light_rgba":{"r":176.12435600010002,"g":238.4505,"b":103.1059962,"a":0.2},"texture":"antique-wooden-planks-texture_1232-824.jpg","white_pieces":"chesscom","black_pieces":"alpha"},{
"name":"wawa",
"dark_rgba":{"r":2.8474999999998563,"g":0,"b":255,"a":0.43},
"light_rgba":{"r":239.0115,"g":235.93176511905,"b":224.2405893,"a":0.07},"texture":"blue-rippled-water-background-in-swimming-pool_1373-193.jpg","white_pieces":"uscf","black_pieces":"chess24"},{
"name":"map",
"light_rgba":{"r":250.002,"g":242.6519412,"b":242.6519412,"a":0.76},
"dark_rgba":{"r":0,"g":148.49500000000006,"b":255,"a":0.39},"texture":"11.jpg","white_pieces":"alpha","black_pieces":"chess24"}]




function loadThemes() {
    var themes = Cookies.get('themes');
    if (!themes) {
        themes = default_themes;
        Cookies.set('themes', JSON.stringify(themes), {expires: 30000});
    }
}

var ficswrap = io();

ficswrap.on("logged_in", function(msg) {
    $('#login_div').hide();
    $('#shellout').show();
    $('#shellin').show();
    $('#games').prop('hidden', false);
    $('#getgame').prop('hidden', false);
    $('#sought').prop('hidden', false);
    $('#match').prop('hidden', false);
    $('#seek').prop('hidden', false);
    $('#unseek').prop('hidden', false);
    $('#themes').prop('hidden', false);
    $('#resizer').prop('hidden', false);

    loadThemes();

    ficswrap.emit('command', 'variables');
});

ficswrap.on("result", function(msg) {
    console.log('zxc');
    console.log(msg);
    var ficsobj = window.FICSPARSER.parse(msg);
    var showout = false;
    console.log(ficsobj);

    console.log('zxc2');
    if (ficsobj.cmd_code) {
        cmd_code = ficsobj.cmd_code;
        //if (ficsobj.end_reached) {
            // games command result
            if (ficsobj.cmd_code === 43) {
                renderGameList(ficsobj.body.split('\n'));

            // sought command result
            } else if (ficsobj.cmd_code === 157) {
                renderSoughtList(ficsobj.body.split('\n'));

            // variables command result
            } else if (ficsobj.cmd_code === 143) {
                //console.log(ficsobj.fullbody);

            // moves command result
            } else if (ficsobj.cmd_code === 77) {
                var movesobj = window.MOVESPARSER.parse(ficsobj.body);
                var game_num = movesobj.get("game_num");
                var game = gamemap.get(game_num);

                if (game) { 
                    game.initMoves(movesobj); 

                    renderGame(game_num);
                    renderMoveList(game_num, game.moves);
                }
            }
        //}
    }
    
    showout = true;

    if (ficsobj.unobserve) {

        console.log('remove game nums');
        console.log(ficsobj.remove_game_nums);

        for (i=0; i<ficsobj.remove_game_nums.length; i++) {
            var grdiv = $('#result_'+ficsobj.remove_game_nums[i]);
            if (grdiv && grdiv.html() === 'IN PROGRESS') {
                grdiv.html('NO LONGER OBSERVING');
            }
            stopClocks(ficsobj.remove_game_nums[i]);
        }
    }

    if (ficsobj.game_info.result) {
        var game_num = ficsobj.game_info.game_num;
        var game = gamemap.get(game_num);
        game.result = ficsobj.game_info.result;
        game.situ = ficsobj.game_info.situ;

        if (['1-0','0-1','1/2-1/2'].indexOf(game.result) != -1) {
            soundmap.gong[Math.floor(Math.random() * soundmap.gong.length)].play();
            stopClocks(game_num);
        }
        showResult(game_num);
    }

    if (ficsobj.observe) {
        console.log('qwe');
        var game_num = ficsobj.game_info.game_num;
        gamemap.set(game_num, new Game(ficsobj.s12, ficsobj.game_info));
        if (ficsobj.s12.my_rel === '1' || ficsobj.s12.my_rel === '-1') { 
            human_game = gamemap.get(game_num); 
            human_game.human_color =  (ficsobj.s12.whose_move === 'B' && ficsobj.s12.my_rel === '1') || (ficsobj.s12.whose_move === 'W' && ficsobj.s12.my_rel === '-1') ? 'b' : 'w';
        }
        console.log('qwe2');
        ficswrap.emit('command', 'moves ' + game_num);
    } else if (ficsobj.style12) {
        var game_num = ficsobj.s12.game_num;
        var game = gamemap.get(game_num);

        if (game.chess.history().length != game.getMoveIndexFromS12() + 1) {
            console.log('chess says '+game.chess.history().length + ' but s12 says ' + game.getMoveIndexFromS12() +', doing nothing');
            //ficswrap.emit('command', 'moves '+game_num);
        } else {
            var move_info = game.chess.move(ficsobj.s12.move_note_short, {sloppy:true});
            if (move_info) {
                if (game.chess.in_check()) {
                    soundmap.checks[Math.floor(Math.random() * soundmap.checks.length)].play();
                } else if (['n','b','k','q','p'].includes(move_info.flags)) {
                    soundmap.moves[Math.floor(Math.random() * soundmap.moves.length)].play();
                } else {
                    soundmap.captures[Math.floor(Math.random() * soundmap.captures.length)].play();
                }

                game.s12 = ficsobj.s12;
                if (['1-0','0-1','1/2-1/2'].indexOf(game.result) === -1) {
                    runClock(game_num);
                }

                var new_move_index = game.chess.history().length - 1;
            
                game.movetimes[new_move_index] = ficsobj.s12.move_time;
                game.fens[new_move_index] = game.chess.fen().split(/\s+/)[0];
                appendToMoveList(game_num, new_move_index);


                var whose_move = ['w','b'][new_move_index % 2];

                if (whose_move === game.human_color && !game.premove) { goToMove(game_num, new_move_index, animate=false) }
                else { goToMove(game_num, new_move_index, animate=true); }
            }

            if (ficsobj.s12.my_rel === '1' && game.premove) {
                var source = game.premove.from;
                var target = game.premove.to;
                var piece = game.premove.piece;
                var mv = { from: source, to: target };

                if (/[18]$/.test(target) && /[pP]/.test(piece)) {
                    var choices = game.chess.moves({verbose:true});
                    for (var i=0; i<choices.length; i++) {
                        m = choices[i];
                        if (m.from === source && m.to === target) {
                            mv.promotion = 'q';
                            break;
                        }
                    }
                }

                highlightSquares($('#board_'+game_num), 'red', clear=true);
                game.premove = null;

                var valid_move = game.chess.move(mv);
                if (valid_move) {
                    game.chess.undo();
                    ficswrap.emit('command',valid_move.san);
                }
            }
        }

        showout = true;
    }

    if (ficsobj.body.length && showout) 
    {
        $('#shellout2').append(ficsobj.fullbody + '\n\n');
        $('#shellout').scrollTop($('#shellout').prop('scrollHeight'));
    }
});

