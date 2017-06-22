/*
#define BLK_GAMES 43
#define BLK_MOVES 77
#define BLK_OBSERVE 80
#define BLK_UNOBSERVE 138
#define BLK_SOUGHT 157
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
    let ficsobj = window.FICSPARSER.parse(msg);
    let showout = false;
    
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

                var moves = movesobj.get("moves");
                var movetimes = movesobj.get("movetimes");

                for (var i=0; i<moves.length; i++) {
                    game.chess.move(moves[i]);
                    game.fens[i] = game.chess.fen();
                    game.movetimes[i] = movetimes[i];
                }

                game.current_move_index = game.chess.history().length - 1;

                renderGame(game_num);
                renderMoveList(game_num, moves);

            // observe command result
            } else if (ficsobj.cmd_code === 80) {
                showout = true;
                var game_num = ficsobj.s12.game_num;
                gamemap.set(game_num, new Game(ficsobj.s12));


                ficswrap.emit('command', 'moves ' + game_num);
            } else {
                showout = true;
            }
            
        }
    } else {
        showout = true;
        if (ficsobj.style12) {
            let game_num = ficsobj.s12.game_num;
            let game = gamemap.get(game_num);


            console.log('\n\n\nGame # ' + game_num + ' - Begin Move:\n');
            console.log(game.chess.history().length + '  ' + getMoveIndexFromS12(ficsobj.s12));


            if (game.chess.history().length != getMoveIndexFromS12(ficsobj.s12)) {
                console.log('xxxxxxxxxxxxxxxxxx  -- something wrong, calling moves');
                ficswrap.emit('command', 'moves '+game_num);
            } else {
                console.log('ficsobj.s12.move_note_short is: ' + ficsobj.s12.move_note_short);
                var new_move_index = game.chess.history().length;
                
                var move_info = game.chess.move(ficsobj.s12.move_note_short, {sloppy:true});
                if (move_info) {
                    game.s12 = ficsobj.s12;
                    game.movetimes[new_move_index] = ficsobj.s12.move_time;
                    game.fens[new_move_index] = game.chess.fen().split(' ')[0];
                    appendToMoveList(game_num, new_move_index);
                    if (game.current_move_index == new_move_index - 1) {
                        goToMove(game_num, new_move_index, animate=true);
                    }
                }
            }

            runClock(game_num);


            console.log('game.chess.history().length :  ' + game.chess.history().length);
            console.log(game.chess.history());
            console.log('game.fens.length :  ' + game.fens.length);
            console.log(game.fens);
            console.log('game.movetimes.length :  ' + game.movetimes.length);
            console.log(game.movetimes);

            showout = false;
        }
    }
    
    if (ficsobj.body.length && showout) 
    {
        $('<pre>' + ficsobj.body + '</pre>').appendTo($('#shellout'));
        $('#shellout').scrollTop($('#shellout').prop('scrollHeight'));
    }
});


