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
    $('#games').prop('disabled', false);
    $('#sought').prop('disabled', false);
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

                renderMoveList(game_num, moves);

                for (var i=0; i<moves.length; i++) {
                    game.chess.move(moves[i]);
                    game.fens[i] = game.chess.fen();
                    game.movetimes[i] = movetimes[i];
                }

            // observe command result
            } else if (ficsobj.cmd_code === 80) {
                showout = true;
                var game_num = ficsobj.s12.game_num;
                gamemap.set(game_num, new Game(ficsobj.s12));

                renderGame(game_num);

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
                /*
                { color: 'w',
                  from: 'e1',
                  to: 'g1',
                  flags: 'k',
                  piece: 'k',
                  san: 'O-O' 
                }
                */
                console.log('ficsobj.s12.move_note_short is: ' + ficsobj.s12.move_note_short);
                var new_move_index = game.chess.history().length;
                
                var move_info = game.chess.move(ficsobj.s12.move_note_short);
                if (move_info) {
                    var board_moves = [];
                    if (move_info.flags === 'k') {
                        if (move_info.color === 'w') {
                            board_moves.push('e1-g1');
                            board_moves.push('h1-f1');
                        } else {
                            board_moves.push('e8-g8');
                            board_moves.push('h8-f8');
                        }
                    } else if (move_info.flags === 'q') {
                        if (move_info.color === 'w') {
                            board_moves.push('e1-c1');
                            board_moves.push('a1-d1');
                        } else {
                            board_moves.push('e8-c8');
                            board_moves.push('a8-d8');
                        }
                    } else {
                        board_moves.push(move_info.from + '-' + move_info.to);
                    }
                    for (i=0; i<board_moves.length; i++) {
                        console.log('board_move: ' + board_moves[i]);
                        game.board.move(board_moves[i]);
                    }
                    game.movetimes[new_move_index] = ficsobj.s12.move_time;
                    game.fens[new_move_index] = game.chess.fen();
                    game.s12 = ficsobj.s12;
                    appendMove(game_num, ficsobj.s12.move_note_short, new_move_index);
                }
            }
            console.log('game.chess.history().length :  ' + game.chess.history().length);
            console.log(game.chess.history());
            console.log('game.fens.length :  ' + game.fens.length);
            console.log(game.fens);
            console.log('game.movetimes.length :  ' + game.movetimes.length);
            console.log(game.movetimes);

            renderPlayersDOM(game_num);
            showout = false;
        }
    }
    
    if (ficsobj.body.length && showout) 
    {
        $('<pre>' + ficsobj.body + '</pre>').appendTo($('#shellout'));
        $('#shellout').scrollTop($('#shellout').prop('scrollHeight'));
    }
});


