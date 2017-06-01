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
            game.updateWithS12(ficsobj.s12);
            game.board.move(ficsobj.s12.move_note);
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


