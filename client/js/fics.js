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
    ficswrap.emit('command', 'variables');
});

ficswrap.on("result", function(msg) {
    var ficsobj = window.FICSPARSER.parse(msg);
    var showout = false;

    if (ficsobj.cmd_code) {
        cmd_code = ficsobj.cmd_code;
        if (ficsobj.end_reached) {
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
                    var moves = movesobj.get("moves");
                    var movetimes = movesobj.get("movetimes");

                    for (var i=0; i<moves.length; i++) {
                        game.chess.move(moves[i]);
                        game.fens[i] = game.chess.fen().split(/\s+/)[0];
                        game.movetimes[i] = movetimes[i];
                    }

                    game.current_move_index = game.chess.history().length - 1;
                    game.human_color =  (game.s12.whose_move === 'B' && game.s12.my_rel === '1') || (game.s12.whose_move === 'W' && game.s12.my_rel === '-1') ? 'b' : 'w';
                    if (game.s12.my_rel != '1' && game.s12.my_rel != '-1') game.human_color = 'x';

                    renderGame(game_num);
                    renderMoveList(game_num, moves);
                }
            }
        }
    }
    
    showout = true;

    if (ficsobj.unobserve) {
        var grdiv = $('#result_'+ficsobj.game_num);
        if (grdiv && grdiv.html() === 'IN PROGRESS') {
            grdiv.html('NO LONGER OBSERVING');
        }
        stopClocks(ficsobj.game_num);
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
        var game_num = ficsobj.game_info.game_num;
        gamemap.set(game_num, new Game(ficsobj.s12, ficsobj.game_info));
        if (ficsobj.s12.my_rel === '1' || ficsobj.s12.my_rel === '-1') { human_game = gamemap.get(game_num); }
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

