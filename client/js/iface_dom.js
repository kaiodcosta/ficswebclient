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

function stopClocks(game_num) {
    var game = gamemap.get(game_num);
    if (game) {
        clearInterval(game.clocks['w']);
        clearInterval(game.clocks['b']);
    } else {
        console.log('in stopClocks and game not found for game_num ' + game_num);
    }
}

function runClock(game_num) {
    var game = gamemap.get(game_num);
    stopClocks(game_num);

    var whose_move = ['w','b'][game.chess.history().length % 2];
    var not_whose_move = ['b','w'][game.chess.history().length % 2];
    if ( (game.top_is_black && whose_move === 'b') || (!game.top_is_black && whose_move === 'w') ) {
        $('#bottom_time_' + game_num).html(toMinutes(game.s12[not_whose_move+'_clock']));
        $('#bottom_time_' + game_num).css('background-color', '#000000');
        $('#top_time_' + game_num).css('background-color', '#555555');
    } else {
        $('#top_time_' + game_num).html(toMinutes(game.s12[not_whose_move+'_clock']));
        $('#top_time_' + game_num).css('background-color', '#000000');
        $('#bottom_time_' + game_num).css('background-color', '#555555');
    }

    if (game.chess.history().length > 1) {
        game.clocks[whose_move] = setInterval( function() {
            if (game.s12[whose_move+'_clock'] <= 0) {
                stopClocks(game_num);
                return;
            }
            game.s12[whose_move+'_clock'] -= 1;
            if ( (game.top_is_black && whose_move === 'b') || (!game.top_is_black && whose_move === 'w') ) {
                $('#top_time_' + game_num).html(toMinutes(game.s12[whose_move+'_clock']));
            } else {
                $('#bottom_time_' + game_num).html(toMinutes(game.s12[whose_move+'_clock']));
            }
        }, 1000);
    }
}


function renderPlayersDOM(game_num, runclock=true) {
	var game = gamemap.get(game_num);
    if (game.top_is_black) {
        $('#top_player_' + game_num).html(game.chess.header().Black + ' (' + game.chess.header().BlackElo + ')');
        $('#top_time_' + game_num).html(toMinutes(game.s12.b_clock));
        $('#bottom_player_' + game_num).html(game.chess.header().White + ' (' + game.chess.header().WhiteElo + ')');
        $('#bottom_time_' + game_num).html(toMinutes(game.s12.w_clock));
    } else {
        $('#top_player_' + game_num).html(game.chess.header().White + ' (' + game.chess.header().WhiteElo + ')');
        $('#top_time_' + game_num).html(toMinutes(game.s12.w_clock));
        $('#bottom_player_' + game_num).html(game.chess.header().Black + ' (' + game.chess.header().BlackElo + ')');
        $('#bottom_time_' + game_num).html(toMinutes(game.s12.b_clock));
    }
    if (runclock) {
        runClock(game_num);
    }
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

function highlightSquares(board_div, color, move=null, clear=false) {
    board_div.find('.square-55d63').removeClass('highlight-square-'+color);
    if (move && !clear) {
        board_div.find('.square-' + move.to).addClass('highlight-square-'+color);
        board_div.find('.square-' + move.from).addClass('highlight-square-'+color);
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
        
        var mv = game.chess.history({verbose: true})[i];
        var board_div = $('#board_'+game_num);

        highlightSquares(board_div, 'cyan', move=mv);

        $('#move_' + game_num + '_' + i).addClass('highlight');;
    }
    if (i == game.chess.history().length -1) {
        $('#moves_'+game_num).scrollTop($('#moves_'+game_num).prop('scrollHeight'));
    }
}

function showResult(game_num) {
    var game = gamemap.get(game_num);

    if (game) {
        $('#result_'+game_num).html(game.situ + ' ' + game.result);
    } else {
        console.log('game ' + game_num + ' does not exist in showResult');
    }
}

function removeGame(game_num) {
    gamemap.get(game_num).board.destroy();
    gamemap.delete(game_num);
    $('#observe_'+game_num).remove();
}

function renderGame(game_num) {
    var game = gamemap.get(game_num);

    var observe_div = $('<div id="observe_' + game_num + '" class="clearfix observe"></div>');
    var top_player_div = $('<div id="top_player_' + game_num + '" class="player_name"></div>');
    var board_container_div = $('<div class="board_info_container"></div>');
    var board_div = $('<div id="board_' + game_num + '" class="board"></div>');
    var game_container_div = $('<div class="game_info_container"></div>');
    var ginfo_div = $('<div id="ginfo_' + game_num + '" class="game_info"></div>');
    var gnum_div = $('<div id="gnum_' + game_num + '" class="game_info"></div>');
    var event_div = $('<div id="event_' + game_num + '" class="game_info"></div>');
    var top_time_div = $('<div id="top_time_' + game_num + '" class="top_time"></div>');
    var moves_div = $('<div id="moves_' + game_num + '" class="move_list clearfix"></div>');
    var bottom_time_div = $('<div id="bottom_time_' + game_num + '" class="bottom_time"></div>');
    var result_div = $('<div id="result_' + game_num + '" class="game_info">IN PROGRESS</div>');
    var controls_div = $('<div id="controls_' + game_num + '" class="controls"></div>');
    var flip_button = $('<button type="button" id="flip_' + game_num + '"> Flip </button>');
    flip_button.click(function() {
        game.top_is_black = game.top_is_black ? false : true;
        game.board.flip();
        renderPlayersDOM(game_num);
    });
    var remove_button = $('<button type="button" id="remove_' + game_num + '"> Remove </button>');
    remove_button.click(function() {
        removeGame(game_num);
    });
    var bottom_player_div = $('<div id="bottom_player_' + game_num + '" class="player_name"></div>');

    top_player_div.appendTo(observe_div);

    board_container_div.appendTo(observe_div);
    board_div.appendTo(board_container_div);

    game_container_div.appendTo(observe_div);
    ginfo_div.appendTo(game_container_div);
    
    gnum_div.html('game number ' + game_num);
    gnum_div.appendTo(ginfo_div);
    event_div.html(game.chess.header().Event);
    event_div.appendTo(ginfo_div);
    top_time_div.appendTo(ginfo_div);
    moves_div.appendTo(ginfo_div);
    bottom_time_div.appendTo(ginfo_div);
    result_div.appendTo(ginfo_div);

    controls_div.appendTo(game_container_div);
    flip_button.appendTo(controls_div);
    remove_button.appendTo(controls_div);

    bottom_player_div.appendTo(observe_div);


    observe_div.appendTo($('#games_div'));

    game.board = new ChessBoard('board_' + game_num, {
        position: game.chess.fen().split(/\s+/)[0],
        draggable:true,
        onDragStart : function(source, piece, pos, orientation) {
            if (['-1','1'].indexOf(game.s12.my_rel) != -1) {
                return true;
            }
            return false;
        },
        onDrop : function(source, target, piece, newPos, oldPos, orientation) {
            var mv = { from: source, to: target };
            console.log('piece is ' +piece);
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
            var valid_move = game.chess.move(mv);
            console.log('onDrop: ');
            console.log(valid_move);
            if (valid_move) {
                game.chess.undo();
            }
            if (game.s12.my_rel === '1') {
                if (!valid_move) {
                    return 'snapback';
                } else {
                    ficswrap.emit('command',valid_move.san);
                }
            } else if (game.s12.my_rel === '-1') {
                if (source && target && source != target) {
                    var mv = {}
                    mv.from = source;
                    mv.to = target;
                    mv.piece = piece;
                    console.log('premove set:');
                    console.log(mv);
                    game.premove = mv;
                    highlightSquares($('#board_'+game_num), 'red', move=mv);
                    return 'snapback'
                }
            }
        },
    });

    if ( (game.s12.whose_move === 'B' && game.s12.my_rel === '1') || (game.s12.whose_move === 'W' && game.s12.my_rel === '-1') ) {
        game.board.flip();
        game.top_is_black = false;
    }

    renderPlayersDOM(game_num);
}


function renderGameList(lines) {
    $('#lists2').empty();
    lines.forEach(x => {
        if (x.replace(/[\s\n\t\r\x07]*/g,'')) {
            var gamenum = x.replace(/^\s+|\s+$/g, '').split(/\s+/)[0];
            var li = $('<a href="#" class="list-item">'+x+'</a>');
            li.css('color', 'orange');
            li.on({
                click: function() {
                    li.css('color', 'cyan');
                    ficswrap.emit('command', 'observe ' + gamenum); 
                    return false;
                }
            }).appendTo('#lists2');
        }
    });
}


function renderSoughtList(lines) {
    $('#lists2').empty();
    lines.forEach(x => {
        if (x.replace(/[\s\n\t\r\x07]*/g,'')) {
            var gamenum = x.replace(/^\s+|\s+$/g, '').split(/\s+/)[0];
            var li = $('<a href="#" class="list-item">'+x+'</a>');
            li.css('color', 'orange');
            li.on({
                click: function() {
                    li.css('color', 'cyan');
                    ficswrap.emit('command', 'play ' + gamenum); 
                    return false;
                }
            }).appendTo($('#lists2'))
        }
    });
}


function renderMatchForm() {
    $('#lists2').empty();
    var player_input = $('<input type="text" name="player_name" id="match_player" size="20" />');
    var submit = $('<input type="button" value="challenge" />');
    player_input.appendTo($('#lists2'));
    submit.appendTo($('#lists2'));
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


var soundmap = {
    ambience: [],
    gong: [],
    moves: [],
    captures: [],
    checks: []
};


$(document).ready(function(){
    $.ajax({url: "/soundmap", success: function(result){
        result = JSON.parse(result);
        for (i=0; i<result.ambience.length; i++) {
            soundmap.ambience.push( new Howl({ src: ['/sound/ambience/' + result.ambience[i]] }) );
        }
        for (i=0; i<result.gong.length; i++) {
            soundmap.gong.push( new Howl({ src: ['/sound/gong/' + result.gong[i]] }) );
        }
        for (i=0; i<result.moves.length; i++) {
            soundmap.moves.push( new Howl({ src: ['/sound/moves/' + result.moves[i]] }) );
        }
        for (i=0; i<result.captures.length; i++) {
            soundmap.captures.push( new Howl({ src: ['/sound/captures/' + result.captures[i]] }) );
        }
        for (i=0; i<result.checks.length; i++) {
            soundmap.checks.push( new Howl({ src: ['/sound/checks/' + result.checks[i]] }) );
        }
    }});

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
    $('#unseek').prop('hidden', true);
    $('#getgame').prop('hidden', true);
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

    $('#getgame').on('click', function(e) {
        ficswrap.emit('command', 'getgame');
    });

    $('#seek').on('click', function(e) {
        ficswrap.emit('command', 'seek');
        //renderSeekForm();
    });

    $('#unseek').on('click', function(e) {
        ficswrap.emit('command', 'unseek');
    });

    function loginFICS() {
        ficswrap.emit('login', [$('#login').val(), $('#password').val()]);
    }

    $('#login').keypress(function(e) {
        if (e.which == 13) { loginFICS(); }
    });
    
    $('#password').keypress(function(e) {
        if (e.which == 13) { loginFICS(); }
    });
    
    $('#login_button').on('click', function(e) { 
        loginFICS();
    });


    $('#shellin').keypress(function(e) {
            if (e.which == 13) {
                ficswrap.emit('command', $('#shell').val());
                $('#shell').val('');
            }
    });
});
