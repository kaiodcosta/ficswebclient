/*
#define BLK_GAMES 43
#define BLK_MOVES 77
#define BLK_OBSERVE 80
#define BLK_UNOBSERVE 138
#define BLK_SOUGHT 157
*/

var ficswrap = io();

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

                game.initMoves(movesobj.get("moves"));
                game.initMoveTimes(movesobj.get("movetimes"));

                move_number = 1;

                for (i=0; i < game.moves.length; i++) {
                    if (i % 2 == 0) {
                        $('#moves_' + game_num).append('<div class="move_number" id="move_' + game_num + '_' + move_number.toString() + '">' + move_number.toString() + '</div><div class="move">' + game.moves[i] + '</div>');
                    } else {
                        $('#moves_' + game_num).append('<div class="move">' + game.moves[i] + '</div>');
                        move_number += 1;
                    }
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


ficswrap.on("logged_in", function(msg) {
    $('#login_div').hide();
    $('#shellout').show();
    $('#shellin').show();
    $('#games').prop('disabled', false);
    $('#sought').prop('disabled', false);
});


function fenFromRanks(ranks) {
    var fen = '';
    for (let r=0; r<8; r++) {
        let rank = ranks[r];
        let empty_count = 0;
        for (let s=0; s<8; s++) {
            if (rank[s] === '-') {
                empty_count++;
                if (s === 7) {
                    fen = fen + empty_count.toString();
                }
            } else {
                if (empty_count) {
                    fen = fen + empty_count.toString();
                }
                fen = fen + rank[s];
                empty_count = 0;
            }
        }
        if (r != 7) { fen = fen + '/'; }
    }
    return fen;
}
