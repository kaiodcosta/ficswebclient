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
    $('#resizer').prop('hidden', false);
    ficswrap.emit('command', 'variables');
});

ficswrap.on("result", function(msg) {
    var ficsobj = window.FICSPARSER.parse(msg);
    var showout = false;

    //console.log(ficsobj);
    
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
        //console.log('33333333333333333333');
        //console.log(game.result);
        if (['1-0','0-1','1/2-1/2'].indexOf(game.result) != -1) {
            stopClocks(game_num);
            //console.log('clocks should be stopped');
        }
        showResult(game_num);
    }

    if (ficsobj.observe) {
        var game_num = ficsobj.game_info.game_num;
        gamemap.set(game_num, new Game(ficsobj.s12, ficsobj.game_info));
        ficswrap.emit('command', 'moves ' + game_num);
    } else if (ficsobj.style12) {
        console.log(ficsobj.style12);
        console.log(ficsobj.s12);
        console.log('s12 move_num is ' +ficsobj.s12.move_num);
        console.log('s12 whose_move is ' +ficsobj.s12.whose_move);
        console.log('getMoveIndexFromS12 is ' +getMoveIndexFromS12(ficsobj.s12));
        var game_num = ficsobj.s12.game_num;
        var game = gamemap.get(game_num);

        if (game.chess.history().length != getMoveIndexFromS12(ficsobj.s12)) {
            console.log('chess says '+game.chess.history().length + ' but s12 says ' + getMoveIndexFromS12(ficsobj.s12) +', doing nothing');
            //ficswrap.emit('command', 'moves '+game_num);
        } else {
            var new_move_index = game.chess.history().length;
            
            var move_info = game.chess.move(ficsobj.s12.move_note_short, {sloppy:true});
            if (move_info) {
                game.s12 = ficsobj.s12;
                if (['1-0','0-1','1/2-1/2'].indexOf(game.result) === -1) {
                    runClock(game_num);
                }
                game.movetimes[new_move_index] = ficsobj.s12.move_time;
                game.fens[new_move_index] = game.chess.fen().split(/\s+/)[0];
                appendToMoveList(game_num, new_move_index);
                if (game.current_move_index == new_move_index - 1) {
                    goToMove(game_num, new_move_index, animate=true);
                }
            }

            if (ficsobj.s12.my_rel === '1' && game.premove) {
                var valid_move = game.chess.move({ from: game.premove.from, to: game.premove.to });
                console.log('the attempted premove is ');
                console.log(valid_move);


                //console.log(valid_move);
                game.premove = null;
                highlightSquares($('#board_'+game_num), 'red', clear=true);
                if (valid_move) {
                    game.chess.undo();
                    console.log('actual valid premove, calling it');
                    ficswrap.emit('command',valid_move.san);
                }

            }


        }

        showout = true;
    }

    if (ficsobj.body.length && showout) 
    {
        $('#shellout2').append(ficsobj.fullbody + '\n\n');
        //$('<pre>' + ficsobj.body + '</pre>').appendTo($('#shellout'));
        $('#shellout').scrollTop($('#shellout').prop('scrollHeight'));
    }
});


