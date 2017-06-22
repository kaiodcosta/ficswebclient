function getMoveIndexFromS12(s12) {
    return ((s12.move_num-1) * 2) - (s12.whose_move == 'W' ? 1 : 0); 
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


function runClock(game_num) {
    var game = gamemap.get(game_num);
    var whose_move = ['w','b'][game.chess.history().length % 2];
    var not_whose_move = ['b','w'][game.chess.history().length % 2];
    clearInterval(game.clocks[not_whose_move]);
    game.clocks[whose_move] = setInterval( function() {
        if ( (game.top_is_black && whose_move === 'b') || (!game.top_is_black && whose_move === 'w') ) {
            $('#top_time_' + game_num).html(toMinutes(game.s12[whose_move+'_clock']));
        } else {
            $('#bottom_time_' + game_num).html(toMinutes(game.s12[whose_move+'_clock']));
        }
        game.s12[whose_move+'_clock'] -= 1;
    }, 1000);
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
    runClock(game_num);
}			


function renderMoveList(game_num) {
    $('#moves_' + game_num).empty();

    var game = gamemap.get(game_num);

    var range = [];
    for (i=0; i < game.chess.history().length; i++) { range.push(i) }
    
    range.forEach( i => {
        appendToMoveList(game_num, i);
    });

    goToMove( game_num, game.chess.history().length-1 );
}


function appendToMoveList(game_num, i, goto_move = false, animate=false) {
    var movelist_div = $('#moves_' + game_num);
    var move_number = Math.floor(i/2) + 1;

    var game = gamemap.get(game_num);

    if (i % 2 == 0) {
        var move_num_div = $('<div class="move_number">' + move_number.toString() + '</div>');
        move_num_div.appendTo(movelist_div);
    } else {
        move_number += 1;
    }

    var move_div = $('<div class="move move_' + game_num + '">' + game.chess.history()[i] + '</div>');
    move_div.attr('id', 'move_' + game_num + '_' + i);
    move_div.on({click :function() { 
        goToMove(game_num, i);
    }});

    move_div.appendTo(movelist_div);
    if (goto_move) { 
        goToMove(game_num, i, animate=animate);
    }
}


function goToMove(game_num, i, animate=false) {
    var game = gamemap.get(game_num);
    $('.move_'+game_num).removeClass('highlight');
    game.current_move_index = i;
    if (i == -1) {
        game.board.position(game.startfen, animate);
    } else {
        game.board.position(game.fens[i], animate);
        $('#move_' + game_num + '_' + i).addClass('highlight');;
    }
    if (i == game.chess.history().length -1) {
        $('#moves_'+game_num).scrollTop($('#moves_'+focus_game_num).prop('scrollHeight'));
    }
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
    game.board = new ChessBoard('board_' + game_num, {
        position: game.chess.fen(),
        onDrop : function(source, target, piece, newPos, oldPos, orientation) {
            var valid_move = game.chess.move({ from: source, to: target });
            if (!valid_move) {
                return 'snapback';
            }
            game.fens[game.chess.history().length - 1] = game.chess.fen().split(' ')[0];
            appendToMoveList(game_num, game.chess.history().length-1, goto_move=true);
            focus_game_num = game_num;
            runClock(game_num);
        },
        draggable:true
    });
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


function renderMatchForm() {
    $('#lists').empty();
    var player_input = $('<input type="text" name="player_name" id="match_player" size="20" />');
    var submit = $('<input type="button" value="challenge" />');
    player_input.appendTo($('#lists'));
    submit.appendTo($('#lists'));
    submit.on('click', function() {
        ficswrap.emit('command', 'match ' + player_input.val());
    });
}


function renderSeekForm() {
    $('#lists').empty();
    $('<div>QWE</div>').appendTo($('#lists'));
}


var focus_game_num = '';
var mouseY;

function resize(e){
    var dx = e.pageY - mouseY;
    mouseY = e.pageY;

    var newY = $('#resize_container').height() + dx;

    $('#resize_container').css('height', newY + 'px');
    $('#games_div').css('top', newY + 'px');
}


$(document).ready(function(){
    $('#resizer').on('mousedown', function(e) {
        mouseY = e.pageY;
        e.preventDefault();
        $(document).on('mousemove', resize);
    });

    $(document).mouseup(function() { $(document).off('mousemove') });

    $(document).on('mousedown', function(e) { 
        var observe_div = $(e.target).closest('[id^=observe_]');
        if (observe_div[0]) {
            focus_game_num = observe_div.attr('id').split('_')[1];
        } else {
            focus_game_num = '';
        }
    });
    
    $(document).on('keydown', function(e) {
        if (!focus_game_num) return;

        if ( $.inArray(e.which, [37,38,39,40]) == -1 ) return;

        e.preventDefault();           
        
        var game = gamemap.get(focus_game_num);
        if (!game) return;

        if (e.which == 37) {            // left
            if (game.current_move_index > -1) {
                $('#moves_'+focus_game_num).scrollTop($('#move_'+focus_game_num+'_0').height() * Math.floor((game.current_move_index -1) / 2) - 75);
                goToMove(focus_game_num, game.current_move_index - 1);
            } else {
                $('#moves_'+focus_game_num).scrollTop(0);
            }
        } else if (e.which == 39) {     //right
            if (game.current_move_index < game.chess.history().length - 1) {
                $('#moves_'+focus_game_num).scrollTop($('#move_'+focus_game_num+'_0').height() * Math.floor((game.current_move_index -1) / 2) - 75);
                goToMove(focus_game_num, game.current_move_index + 1);
            } else {
                $('#moves_'+focus_game_num).scrollTop($('#moves_'+focus_game_num).prop('scrollHeight'));
            }
        } else if (e.which == 38) {     //up
            $('#moves_'+focus_game_num).scrollTop(0);
            goToMove(focus_game_num, -1);
        } else if (e.which == 40) {     //down
            $('#moves_'+focus_game_num).scrollTop($('#moves_'+focus_game_num).prop('scrollHeight'));
            goToMove(focus_game_num, game.chess.history().length - 1);
        }
    });

    $('#shellout').hide();
    $('#shellin').hide();

    $('#games').prop('hidden', true);
    $('#sought').prop('hidden', true);
    $('#match').prop('hidden', true);
    $('#seek').prop('hidden', true);
    $('#resizer').prop('hidden', true);

    $('#games').on('click', function(e) {
        ficswrap.emit('command', 'games');
    });

    $('#sought').on('click', function(e) {
        ficswrap.emit('command', 'sought');
    });

    $('#match').on('click', function(e) {
        renderMatchForm();
    });

    $('#seek').on('click', function(e) {
        renderSeekForm();
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
