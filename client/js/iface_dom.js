
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
    if (!game) {
        console.log('in runClock and game not found for game_num ' + game_num);
    }
    stopClocks(game_num);

    var whose_move = ['w','b'][game.chess.history().length % 2];
    var not_whose_move = ['b','w'][game.chess.history().length % 2];
    if ( (game.top_is_black && whose_move === 'b') || (!game.top_is_black && whose_move === 'w') ) {
        $('#bottom_time_' + game_num).html(toMinutes(game.s12[not_whose_move+'_clock']));
        $('#bottom_time_' + game_num).css('background-color', '#222222');
        $('#bottom_time_' + game_num).css('color', 'lime');
        $('#top_time_' + game_num).css('background-color', 'darkorange');
        $('#top_time_' + game_num).css('color', 'indigo');
    } else {
        $('#top_time_' + game_num).html(toMinutes(game.s12[not_whose_move+'_clock']));
        $('#top_time_' + game_num).css('background-color', '#222222');
        $('#top_time_' + game_num).css('color', 'lime');
        $('#bottom_time_' + game_num).css('background-color', 'darkorange');
        $('#bottom_time_' + game_num).css('color', 'indigo');
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
        if (game.empty_square) { // piece is hovering
            game.board.position(game.fens[i], animate);
            var pos = game.board.position();
            var piece_there_now = pos[game.empty_square];
            if (piece_there_now === game.empty_piece) {
                delete pos[game.empty_square];
                game.board.position(pos, false);
            } else {
                game.empty_square = null;
                game.empty_piece = null;
            }
        } else {
            game.board.position(game.fens[i], animate);
        }

        var mv = game.chess.history({verbose: true})[i];
        var board_div = $('#board_'+game_num);

        highlightSquares($('#board_'+game_num), 'yellow', move=mv);

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
    } //else {
    //    console.log('game ' + game_num + ' does not exist in showResult');
    //}
}

function removeGame(game_num) {
    ficswrap.emit('command', 'unobserve ' + game_num);
    if (human_game ==  gamemap.get(game_num)) human_game = null;
    var game = gamemap.get(game_num);
    game.board.destroy();
    clearInterval(game.clocks['w']);
    clearInterval(game.clocks['b']);
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

        $('#board_'+game_num).find('.white-1e1d7').css('background-color', tinycolor(game.theme.light_rgba));
        $('#board_'+game_num).find('.white-1e1d7').css('color', tinycolor(game.theme.dark_rgba));
        $('#board_'+game_num).find('.black-3c85d').css('background-color', tinycolor(game.theme.dark_rgba));
        $('#board_'+game_num).find('.black-3c85d').css('color', tinycolor(game.theme.light_rgba));

        $('#board_'+game_num).find('.board-b72b1').css('background-image', game.theme.texture ? 'url(/textures/' + game.theme.texture + ')' : 'none');
        $('#board_'+game_num).find('.board-b72b1').css('background-repeat', 'no-repeat');
        $('#board_'+game_num).find('.board-b72b1').css('background-position', 'center');
        $('#board_'+game_num).find('.board-b72b1').css('background-size', 'cover');

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




    //resign button
    //rematch button
    //draw button
    //abort button

    if (game === human_game) {
        var resign_button = $('<button type="button" id="resign_' + game_num + '"> Resign </button>');
        resign_button.click(function() {
            ficswrap.emit('command','resign');
        });

        var abort_button = $('<button type="button" id="abort_' + game_num + '"> Abort </button>');
        abort_button.click(function() {
            ficswrap.emit('command','abort');
        });

        var rematch_button = $('<button type="button" id="rematch_' + game_num + '"> Rematch </button>');
        rematch_button.click(function() {
            ficswrap.emit('command','rematch');
        });

        var draw_button = $('<button type="button" id="draw_' + game_num + '"> Draw </button>');
        draw_button.click(function() {
            ficswrap.emit('command','draw');
        });

        resign_button.appendTo(controls_div);
        abort_button.appendTo(controls_div);
        rematch_button.appendTo(controls_div);
        draw_button.appendTo(controls_div);
    }





    controls_div.appendTo(game_container_div);
    flip_button.appendTo(controls_div);
    remove_button.appendTo(controls_div);

    bottom_player_div.appendTo(observe_div);


    observe_div.appendTo($('#games_div'));

    themes = Cookies.get('themes');
    if (themes) { themes = JSON.parse(themes) };
    game.theme = themes[Math.floor(Math.random() * themes.length)];

    game.board = new ChessBoard('board_' + game_num, {
        pieceTheme: game.pieceTheme,
        position: game.chess.fen().split(/\s+/)[0],
        draggable:true,
        onDragStart : function(source, piece, pos, orientation) {
			if (piece[0] === game.human_color) {
                if (game.s12.my_rel === '-1') {
                    game.empty_square = source;
                    game.empty_piece = piece;
                }
                return true;
            }
            return false;
        },
        onDrop : function(source, target, piece, newPos, oldPos, orientation) {
            if (target === game.empty_square) {
                var pos = game.board.position();

                if (!pos[game.empty_square]) {
                    pos[game.empty_square] = game.empty_piece;
                    game.board.position(pos);
                }

                game.empty_square = null;
                game.empty_piece = null;


            } else {
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
                var valid_move = game.chess.move(mv);
                if (valid_move) {
                    game.chess.undo();
                }
                if (game.s12.my_rel === '1') {
                    if (!valid_move) {
                        if (game.empty_square) {
                            var pos = game.board.position();

                            if (!pos[game.empty_square]) {
                                pos[game.empty_square] = game.empty_piece;
                                game.board.position(pos, false);
                            }

                            game.empty_square = null;
                            game.empty_piece = null;
                        }
                        return 'snapback';
                    } else {
                        ficswrap.emit('command', valid_move.from + '-' + valid_move.to);
                    }
                } else if (game.s12.my_rel === '-1') {
                    var mv = {}
                    if (source != target) {
                        if (target === 'offboard') {
                            if (game.premove) {
                                if (game.premove.from === source) {
                                    game.premove = null;
                                    highlightSquares($('#board_'+game_num), 'red', clear=true);
                                }
                            } else { 
                                //do nothing
                            }
                        } else {
                            mv.from = source;
                            mv.to = target;
                            mv.piece = piece;
                            game.premove = mv;
                            highlightSquares($('#board_'+game_num), 'red', clear=true);
                            highlightSquares($('#board_'+game_num), 'red', move=mv);

                            if (game.empty_square) {
                                var pos = game.board.position();

                                if (!pos[game.empty_square]) {
                                    pos[game.empty_square] = game.empty_piece;
                                    game.board.position(pos, false);
                                }

                                game.empty_square = null;
                                game.empty_piece = null;
                            }
                        }
                    }

                    return 'snapback'
                }
            }
        },
    });

    $('#board_'+game_num).find('.white-1e1d7').css('background-color', tinycolor(game.theme.light_rgba));
    $('#board_'+game_num).find('.white-1e1d7').css('color', tinycolor(game.theme.dark_rgba));
    $('#board_'+game_num).find('.black-3c85d').css('background-color', tinycolor(game.theme.dark_rgba));
    $('#board_'+game_num).find('.black-3c85d').css('color', tinycolor(game.theme.light_rgba));

    $('#board_'+game_num).find('.board-b72b1').css('background-image', game.theme.texture ? 'url(/textures/' + game.theme.texture + ')' : 'none');
    $('#board_'+game_num).find('.board-b72b1').css('background-repeat', 'no-repeat');
    $('#board_'+game_num).find('.board-b72b1').css('background-position', 'center');
    $('#board_'+game_num).find('.board-b72b1').css('background-size', 'cover');

    if ( game.human_color === 'b' ) {
        game.board.flip();

        $('#board_'+game_num).find('.white-1e1d7').css('background-color', tinycolor(game.theme.light_rgba));
        $('#board_'+game_num).find('.white-1e1d7').css('color', tinycolor(game.theme.dark_rgba));
        $('#board_'+game_num).find('.black-3c85d').css('background-color', tinycolor(game.theme.dark_rgba));
        $('#board_'+game_num).find('.black-3c85d').css('color', tinycolor(game.theme.light_rgba));

        $('#board_'+game_num).find('.board-b72b1').css('background-image', game.theme.texture ? 'url(/textures/' + game.theme.texture + ')' : 'none');
        $('#board_'+game_num).find('.board-b72b1').css('background-repeat', 'no-repeat');
        $('#board_'+game_num).find('.board-b72b1').css('background-position', 'center');
        $('#board_'+game_num).find('.board-b72b1').css('background-size', 'cover');
            
        game.top_is_black = false;
    }

    renderPlayersDOM(game_num);
}


function renderGameList(lines) {
    if (theme_board) { theme_board.destroy() }
    $('#lists').empty();
    $('<pre id="lists2"></pre>').appendTo($('#lists'));
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
    if (theme_board) { theme_board.destroy() }
    $('#lists').empty();
    $('<pre id="lists2"></pre>').appendTo($('#lists'));
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
    if (theme_board) { theme_board.destroy() }
    $('#lists').empty();
    $('<pre id="lists2"></pre>').appendTo($('#lists'));
    var player_input = $('<input type="text" name="player_name" id="match_player" size="20" />');
    var submit = $('<input type="button" value="challenge" />');
    player_input.appendTo($('#lists2'));
    submit.appendTo($('#lists2'));
    submit.on('click', function() {
        ficswrap.emit('command', 'match ' + player_input.val());
    });
}


function renderSeekForm() {
    if (theme_board) { theme_board.destroy() }
    $('#lists').empty();
    $('<div>QWE</div>').appendTo($('#lists'));
}


function renderThemeConfig(cur_theme=null) {
    if ( !cur_theme ) {
        cur_theme = {
            name: '',
            dark_rgba: {r:202, g:138, b:48, a:1 },
            light_rgba: {r:244, g:234, b:196, a:1},
            texture: '',
            white_pieces: 'wikipedia',
            black_pieces: 'wikipedia'
        };
    }

    function pieceTheme(piece) {
        if (piece.search(/w/) !== -1) {
            return 'img/chesspieces/' + cur_theme.white_pieces + '/' + piece + '.png';
        }
        return 'img/chesspieces/' + cur_theme.black_pieces + '/' + piece + '.png';
    }

    if (theme_board) {
        theme_board.destroy();
    }

    $('#lists').empty();

    $('<div id="theme_board"></div>').appendTo($('#lists'));
    theme_board = new ChessBoard('theme_board', {pieceTheme: pieceTheme, position: 'start'});

    $('#theme_board').find('.white-1e1d7').css('background-color', tinycolor(cur_theme.light_rgba));
    $('#theme_board').find('.white-1e1d7').css('color', tinycolor(cur_theme.dark_rgba));
    $('#theme_board').find('.black-3c85d').css('background-color', tinycolor(cur_theme.dark_rgba));
    $('#theme_board').find('.black-3c85d').css('color', tinycolor(cur_theme.light_rgba));

    $('#theme_board').find('.board-b72b1').css('background-image', cur_theme.texture ? 'url(/textures/' + cur_theme.texture + ')' : 'none');
    $('#theme_board').find('.board-b72b1').css('background-repeat', 'no-repeat');
    $('#theme_board').find('.board-b72b1').css('background-position', 'center');
    $('#theme_board').find('.board-b72b1').css('background-size', 'cover');


    var theme_div = $('<div>theme: </div>');
    var theme_sel = $('<select id="themes"><option value=""></option></select>');
    theme_sel.appendTo(theme_div);

    themes = Cookies.get('themes');
    if (themes) {
        themes = JSON.parse(themes);
        themes.forEach(t => {
            var opt = $('<option>' + t.name + '</option>').appendTo(theme_sel).val(t);
            opt.val(t.name);
            opt.appendTo(theme_sel);
        });
    }
    theme_sel.val(cur_theme.name);

    theme_sel.on('change', function() {
        var theme_name = $(this).val();
        if (theme_name) { 
            for (i=0; i<themes.length; i++) {
                if (themes[i].name == theme_name) {
                    cur_theme = themes[i];
                    break;
                }
            }
        } else { cur_theme.name = '' }
        renderThemeConfig(cur_theme=cur_theme);
    });

    theme_div.appendTo($('#lists'));


    var black_piece_div = $('<div>black pieces: </div>');
    var black_piece_sel = $('<select id="black_pieces"></select>');
    black_piece_sel.appendTo(black_piece_div);

    piece_themes.forEach(txt => {
        $('<option value="' + txt + '">' + txt + '</option>').appendTo(black_piece_sel);
    });
    black_piece_sel.val(cur_theme.black_pieces);

    black_piece_sel.on('change', function() {
        var ptheme = $(this).val();
        cur_theme.black_pieces = ptheme;
        theme_board.start(false);
    });

    black_piece_div.appendTo($('#lists'));


    var white_piece_div = $('<div>white pieces: </div>');
    var white_piece_sel = $('<select id="white_pieces"></select>');
    white_piece_sel.appendTo(white_piece_div);

    piece_themes.forEach(txt => {
        $('<option value="' + txt + '">' + txt + '</option>').appendTo(white_piece_sel);
    });
    white_piece_sel.val(cur_theme.white_pieces);

    white_piece_sel.on('change', function() {
        var ptheme = $(this).val();
        cur_theme.white_pieces = ptheme;
        theme_board.start(false);
    });

    white_piece_div.appendTo($('#lists'));


    var texture_div = $('<div>texture: </div>');
    var texture_sel = $('<select id="textures"></select>');
    texture_sel.appendTo(texture_div);

    $('<option value=""></option>').appendTo(texture_sel);

    board_textures.forEach(txt => {
        $('<option value="' + txt + '">' + txt + '</option>').appendTo(texture_sel);
    });
    texture_sel.val(cur_theme.texture);

    texture_sel.on('change', function() {
        var txt_fname = $(this).val();
        var img = 'none';
        if ( txt_fname ) { img = 'url(/textures/' + txt_fname + ')' }
        cur_theme.texture = txt_fname;    

        $('#theme_board').find('.board-b72b1').css('background-image', img);
        $('#theme_board').find('.board-b72b1').css('background-repeat', 'no-repeat');
        $('#theme_board').find('.board-b72b1').css('background-position', 'center');
        $('#theme_board').find('.board-b72b1').css('background-size', 'cover');
    });

    texture_div.appendTo($('#lists'));


    var colors_div = $('<div>colors: </div>');
    $('<input type="text" id="light_rgba" />').appendTo(colors_div);
    $('<input type="text" id="dark_rgba" />').appendTo(colors_div);
    colors_div.appendTo('#lists');
    $("#light_rgba").spectrum({
            color: tinycolor(cur_theme.light_rgba),
            showAlpha: true,
            showPalette: false,
            preferredFormat: 'rgb',
            move: function(color) {
                $('#theme_board').find('.white-1e1d7').css('background-color',color);
                $('#theme_board').find('.black-3c85d').css('color',color);
                cur_theme.light_rgba = {r: color._r, g:color._g, b:color._b, a:color._a };
            },
    });
    $("#dark_rgba").spectrum({
            color: tinycolor(cur_theme.dark_rgba),
            showAlpha: true,
            showPalette: false,
            preferredFormat: 'rgb',
            move: function(color) {
                $('#theme_board').find('.white-1e1d7').css('color',color);
                $('#theme_board').find('.black-3c85d').css('background-color',color);
                cur_theme.dark_rgba = {r: color._r, g:color._g, b:color._b, a:color._a };
            },
    });


    var newtheme_div = $('<div>new theme name: </div>');

    var newtheme_text = $('<input type="text" id="new_theme" size="20" />');
    newtheme_text.appendTo(newtheme_div);
    
    var save_button = $('<input type="button" id="save_butt" value="save theme" />');
    save_button.appendTo(newtheme_div);

    newtheme_div.appendTo($('#lists'));



    var space_div = $('<div><br/></div>');
    space_div.appendTo($('#lists'));




    var deltheme_div = $('<div></div>');

    var defaults_button = $('<input type="button" id="fault_butt" value="restore default themes" />');
    defaults_button.appendTo(deltheme_div);
    
    var del_button = $('<input type="button" id="del_butt" value="delete theme" />');
    del_button.appendTo(deltheme_div);

    deltheme_div.appendTo($('#lists'));




    $('#save_butt').on('click', function() {
        var the_name = null;
        var newname = $.trim( $('#new_theme').val() );
        
        if ( newname ) { the_name = newname }
        else if ( cur_theme.name ) { the_name = cur_theme.name }
        else { 
            alert('Theme needs a name in order save'); 
            return;
        }
        
        cur_theme.name = the_name;

        if ( themes ) {
            var found = 0;
            for (i=0; i<themes.length; i++) {
                if (themes[i].name == the_name) {
                    themes[i] = cur_theme;
                    found = 1;
                    break;
                }
            }
            if ( !found ) {themes.unshift(cur_theme) }
        }
        else { themes = [cur_theme] }

        Cookies.set('themes', JSON.stringify(themes), {expires: 30000});

        themes = Cookies.get('themes');
        if (themes) { themes = JSON.parse(themes) }
        //console.log(JSON.stringify(themes));

        renderThemeConfig(cur_theme);
    });




    $('#fault_butt').on('click', function() {
        Cookies.remove('themes');
        Cookies.set('themes', JSON.stringify(default_themes), {expires: 30000});

        themes = Cookies.get('themes');
        if (themes) { themes = JSON.parse(themes) }

        renderThemeConfig(cur_theme);
    });




    $('#del_butt').on('click', function() {
        themes = Cookies.get('themes');
        if (themes) { themes = JSON.parse(themes) }
        
        if (!cur_theme.name || !themes) { return; }

        var new_themes = [];

        for (i=0; i<themes.length; i++) {
            if (themes[i].name != cur_theme.name) {
                new_themes.push(themes[i]);
            }
        }

        Cookies.set('themes', JSON.stringify(new_themes), {expires: 30000});

        themes = Cookies.get('themes');
        if (themes) { themes = JSON.parse(themes) }

        cur_theme.name = '';
        renderThemeConfig(cur_theme=cur_theme);
    });
}


var theme_board = null;
var board_textures = [];
var piece_themes = [];
var themes = [];


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

var human_game = null;

$(document).ready(function(){

    themes = Cookies.get('themes');
    if (themes) { themes = JSON.parse(themes) }

    $.ajax({url: "/txtlist", success: function(result){
        board_textures = JSON.parse(result);
        $.ajax({url: "/piecelist", success: function(result){
            piece_themes = JSON.parse(result);
        }});
    }});

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
    $('#themes').prop('hidden', true);
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

    $('#themes').on('click', function(e) {
        renderThemeConfig();
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
                ficswrap.emit('command_shell', $('#shell').val());
                $('#shell').val('');
            }
    });
});
