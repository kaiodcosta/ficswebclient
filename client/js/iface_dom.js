function getMoveIndexFromS12(s12) {
    return ((s12.move_num-1) * 2) - (s12.whose_move == 'W' ? 1 : 0); 
}



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


function toMinutes(seconds) {
	var seconds = parseInt(seconds);
	var minutes = Math.floor(seconds / 60).toString();
	var remaining_seconds = seconds - minutes * 60;
	
	if ( remaining_seconds.toString().length == 1 ) {
		remaining_seconds = '0' + remaining_seconds.toString();
	}
	else {
		remaining_seconds = remaining_seconds.toString();
	}
	return minutes + ':' + remaining_seconds
}

function renderPlayersDOM(game_num) {
	var game = gamemap.get(game_num);
    if (game.top_is_black) {
        $('#top_player_' + game_num).html(game.chess.header().Black);
        $('#top_time_' + game_num).html(toMinutes(game.s12.b_clock));
        $('#bottom_player_' + game_num).html(game.chess.header().White);
        $('#bottom_time_' + game_num).html(toMinutes(game.s12.w_clock));
    } else {
        $('#top_player_' + game_num).html(game.chess.header().White);
        $('#top_time_' + game_num).html(toMinutes(game.s12.w_clock));
        $('#bottom_player_' + game_num).html(game.chess.header().Black);
        $('#bottom_time_' + game_num).html(toMinutes(game.s12.b_clock));
    }
}			

function renderGameList(lines) {
    $('#lists').empty();
    lines.forEach(x => {
        if (x.replace(/[\s\n\t\r\x07]*/g,'')) {
            var gamenum = x.replace(/^\s+|\s+$/g, '').split(/\s+/)[0];
            $('<a href="#" style="text-decoration: none">'+x+'</a><br />').on({
                click: function() {
                    ficswrap.emit('command', 'observe ' + gamenum); 
                    return false;
                }
            }).appendTo($('#lists'))
        }
    });
}


function renderSoughtList(lines) {
    $('#lists').empty();
    lines.forEach(x => {
        if (x.replace(/[\s\n\t\r\x07]*/g,'')) {
            var gamenum = x.replace(/^\s+|\s+$/g, '').split(/\s+/)[0];
            $('<a href="#" style="text-decoration: none">'+x+'</a><br />').on({
                click: function() {
                    //ficswrap.emit('command', 'play ' + gamenum); 
                    return false;
                }
            }).appendTo($('#lists'))
        }
    });
}

function renderMoveList(game_num, moves) {
    var move_number = 1;

    $('#moves_' + game_num).empty();

    for (i=0; i < moves.length; i++) {
        if (i % 2 == 0) {
            var move_num_div = $('<div class="move_number">' + move_number.toString() + '</div>');
            move_num_div.appendTo($('#moves_' + game_num));
        } else {
            move_number += 1;
        }

        var move_div = $('<div class="move">' + moves[i] + '</div>');
        move_div.appendTo($('#moves_' + game_num));
    }
}


function appendMove(game_num, movestr, i) {
    move_number = Math.floor(i/2) + 1;

    if (i % 2 == 0) {
        var move_num_div = $('<div class="move_number">' + move_number.toString() + '</div>');
        move_num_div.appendTo($('#moves_' + game_num));
    }

    var move_div = $('<div class="move">' + movestr + '</div>');
    move_div.appendTo($('#moves_' + game_num));
}


function renderGame(game_num) {
    var game = gamemap.get(game_num);

    var observe_div = $('<div id="observe_' + game_num + '" class="clearfix observe"></div>');
    var top_player_div = $('<div id="top_player_' + game_num + '" class="player_name"></div>');
    var board_container_div = $('<div class="board_info_container"></div>');
    var board_div = $('<div id="board_' + game_num + '" class="board"></div>');
    var game_container_div = $('<div class="game_info_container"></div>');
    var ginfo_div = $('<div id="ginfo_' + game_num + '" class="game_info"></div>');
    var top_time_div = $('<div id="top_time_' + game_num + '" class="top_time"></div>');
    var moves_div = $('<div id="moves_' + game_num + '" class="move_list clearfix"></div>');
    var bottom_time_div = $('<div id="bottom_time_' + game_num + '" class="bottom_time"></div>');
    var controls_div = $('<div id="controls_' + game_num + '" class="controls"></div>');
    var flip_button = $('<button type="button" id="flip_' + game_num + '"> Flip </button>');
    flip_button.click(function() {
        game.top_is_black = game.top_is_black ? false : true;
        game.board.flip();
        renderPlayersDOM(game_num);
    });
    var bottom_player_div = $('<div id="bottom_player_' + game_num + '" class="player_name"></div>');

    top_player_div.appendTo(observe_div);

    board_container_div.appendTo(observe_div);
    board_div.appendTo(board_container_div);

    game_container_div.appendTo(observe_div);
    ginfo_div.appendTo(game_container_div);

    top_time_div.appendTo(ginfo_div);
    moves_div.appendTo(ginfo_div);
    bottom_time_div.appendTo(ginfo_div);

    controls_div.appendTo(game_container_div);
    flip_button.appendTo(controls_div);

    bottom_player_div.appendTo(observe_div);


    observe_div.appendTo($('#games_div'));

    renderPlayersDOM(game_num);
    game.board = new ChessBoard('board_' + game_num, {position: fenFromRanks(game.s12.ranks)});
}



$(document).ready(function(){
    
    $('#shellout').hide();
    $('#shellin').hide();

    $('#games').prop('disabled', true);
    $('#sought').prop('disabled', true);

    $('#games').on('click', function(e) {
        ficswrap.emit('command', 'games');
    });

    $('#sought').on('click', function(e) {
        ficswrap.emit('command', 'sought');
    });

    $('#login').keypress(function(e) {
            if (e.which == 13) { ficswrap.emit('login', [$('#login').val(), $('#password').val()]); }
    });
    
    $('#password').keypress(function(e) {
            if (e.which == 13) { ficswrap.emit('login', [$('#login').val(), $('#password').val()]); }
    });
    
    $('#login_button').on('click', function(e) { 
            ficswrap.emit('login', [$('#login').val(), $('#password').val()]);
    });


    $('#shellin').keypress(function(e) {
            if (e.which == 13) {
                ficswrap.emit('command', $('#shell').val());
                $('#shell').val('');
            }
    });
});
