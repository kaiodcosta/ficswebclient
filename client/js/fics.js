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
default_themes = [
    {"name":"cop","light_rgba":{"r":255,"g":255,"b":255,"a":0.09},"dark_rgba":{"r":255,"g":255,"b":255,"a":0},"texture":"brushed-copper.jpg","white_pieces":"alpha","black_pieces":"alpha"},
    {"name":"fire","dark_rgba":{"r":0,"g":0,"b":0,"a":0.74},"light_rgba":{"r":253.57,"g":132.59,"b":33.14,"a":0.72},"texture":"Fire-Flames-Background-11-625x468.jpg","white_pieces":"chesscom","black_pieces":"chesscom"},
    {"name":"hunjies","dark_rgba":{"r":48.43,"g":101.82,"b":21.71,"a":0.81},"light_rgba":{"r":245.46,"g":244.67,"b":241.70,"a":0.79},"texture":"Money-Background-17-625x625.jpg","white_pieces":"uscf","black_pieces":"uscf"},
    {"name":"leaves","dark_rgba":{"r":0,"g":0,"b":0,"a":0.71},"light_rgba":{"r":255,"g":255,"b":255,"a":0.56},"texture":"Nature-Leaves-Background-70-625x500.jpg","white_pieces":"chesscom","black_pieces":"chess24"},
    {"name":"medieval","dark_rgba":{"r":0,"g":0,"b":0,"a":0.55},"light_rgba":{"r":243.98,"g":228.07,"b":195.99,"a":0.64},"texture":"kentmap.jpg","white_pieces":"leipzig","black_pieces":"leipzig"},
    {"name":"metal","dark_rgba":{"r":0,"g":0,"b":0,"a":0},"light_rgba":{"r":226.63,"g":250.002,"b":54.77,"a":0.46},"texture":"metal-plate-texture_1048-2443.jpg","white_pieces":"chesscom_wood","black_pieces":"chesscom"},
    {"name":"royal","dark_rgba":{"r":116.17,"g":38.98,"b":255,"a":0.71},"light_rgba":{"r":242.47,"g":205.57,"b":65.49,"a":0.55},"texture":"Money-Background-19-625x468.jpg","white_pieces":"wikipedia","black_pieces":"alpha"},
    {"name":"stone","dark_rgba":{"r":145.60,"g":2.82,"b":2.82,"a":0.372},"light_rgba":{"r":255,"g":200.7105,"b":200.7105,"a":0.47},"texture":"Stone-Tiles-Background-22-625x625.jpg","white_pieces":"symbol","black_pieces":"chess24"},
    {"name":"warroom","dark_rgba":{"r":0,"g":0,"b":0,"a":0.6},"light_rgba":{"r":46.42,"g":254.39,"b":0,"a":0.63},"texture":"design_digital_map3.jpg","white_pieces":"chesscom","black_pieces":"chess24"},
    {"name":"wawa","dark_rgba":{"r":2.847,"g":0,"b":255,"a":0.43},"light_rgba":{"r":239.01,"g":235.93,"b":224.24,"a":0.07},"texture":"blue-rippled-water-background-in-swimming-pool_1373-193.jpg","white_pieces":"uscf","black_pieces":"chess24"},
    {"name":"wood","dark_rgba":{"r":91.31,"g":28.09,"b":28.09,"a":0.75},"light_rgba":{"r":176.12,"g":238.45,"b":103.1,"a":0.2},"texture":"antique-wooden-planks-texture_1232-824.jpg","white_pieces":"chesscom","black_pieces":"alpha"}]



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
    console.log(msg);
    var ficsobj = window.FICSPARSER.parse(msg);
    console.log(ficsobj);

    var showout = false;
    if ( (ficsobj.cmd_num === 0 || ficsobj.cmd_num === 773450001) && /^123987001/.test(ficsobj.fullbody) === false) {
        showout = true;
    }

    if (ficsobj.cmd_code) {
        cmd_code = ficsobj.cmd_code;
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
    }
    
    //showout = true;

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
        if (gamemap.get(game_num)) {
            removeGame(game_num);
        }
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

        if (game.chess) { 
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
        }

        //showout = false;
    }

    if (ficsobj.fullbody.length && showout && !ficsobj.style12) 
    {
        $('#shellout2').append(ficsobj.fullbody.replace(/^773450001/, '\n<font color="red">fics%</font>') + '\n');
        $('#shellout').scrollTop($('#shellout').prop('scrollHeight'));
    }
});

