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
#define BLK_WITHDRAW 147
*/

var ficswrap = io();

ficswrap.on("logged_in", function(msg) {
    $('#login_div').hide();
    $('#shellout').show();
    $('#shellin').show();
    $('#games').prop('hidden', false);
    $('#sought').prop('hidden', false);
    $('#match').prop('hidden', false);
    $('#seek').prop('hidden', false);
    $('#resizer').prop('hidden', false);
});

ficswrap.on("result", function(msg) {
    var ficsobj = window.FICSPARSER.parse(msg);
    var showout = false;

    console.log(ficsobj);
    
    if (ficsobj.cmd_code) {
        cmd_code = ficsobj.cmd_code;
        if (ficsobj.end_reached) {
            // games command result
            if (ficsobj.cmd_code === 43) {
                renderGameList(ficsobj.body.split('\n'));

            // sought command result
            } else if (ficsobj.cmd_code === 157) {
                renderSoughtList(ficsobj.body.split('\n'));

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
        showResult(game_num);
    }

    if (ficsobj.observe) {
        var game_num = ficsobj.game_info.game_num;
        gamemap.set(game_num, new Game(ficsobj.s12, ficsobj.game_info));
        ficswrap.emit('command', 'moves ' + game_num);
    } else if (ficsobj.style12) {
        var game_num = ficsobj.s12.game_num;
        var game = gamemap.get(game_num);

        if (game.chess.history().length != getMoveIndexFromS12(ficsobj.s12)) {
            console.log('xxxxxxxxxxxxxxxxxx  -- something wrong, calling moves');
            ficswrap.emit('command', 'moves '+game_num);
        } else {
            var new_move_index = game.chess.history().length;
            
            var move_info = game.chess.move(ficsobj.s12.move_note_short, {sloppy:true});
            if (move_info) {
                game.s12 = ficsobj.s12;
                runClock(game_num);
                game.movetimes[new_move_index] = ficsobj.s12.move_time;
                game.fens[new_move_index] = game.chess.fen().split(/\s+/)[0];
                appendToMoveList(game_num, new_move_index);
                if (game.current_move_index == new_move_index - 1) {
                    goToMove(game_num, new_move_index, animate=true);
                }
            }
        }

        showout = false;
    }

    if (ficsobj.body.length && showout) 
    {
        $('<pre>' + ficsobj.body + '</pre>').appendTo($('#shellout'));
        $('#shellout').scrollTop($('#shellout').prop('scrollHeight'));
    }
});


