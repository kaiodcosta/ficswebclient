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

var game_num = '12';
var game = {};
game.chess = new Chess();
game.fens = []

function getMoveIndexFromS12(s12) {
    return ((s12.move_num-1) * 2) - (s12.whose_move == 'W' ? 1 : 0);
}

var s12 = {};

s12.my_rel = '1';



function humanColor() {
	return 'w';
}

function M(san) {
    console.log('qwe');
    console.log(game.chess.history());

    
    var move_info = game.chess.move(san, {sloppy:true});
    if (move_info) {

		var new_move_index = game.chess.history().length - 1;
		var whose_move = ['w','b'][new_move_index % 2];

        game.fens.push(game.chess.fen().split(/\s+/)[0]);
        console.log('premove is');
        console.log(game.premove);

        if (whose_move === humanColor() && !game.premove) { goToMove(game_num, new_move_index, animate=false) }
        else { console.log('qqqqqqqqqqqqqq'); goToMove(game_num, new_move_index, animate=true); }
		
        if (s12.my_rel == '1') { s12.my_rel = '-1' }
        else { s12.my_rel = '1' }

    }

    if (s12.my_rel === '1' && game.premove) {
        var source = game.premove.from;
        var target = game.premove.to;
        var piece = game.premove.piece;
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

        highlightSquares($('#board_'+game_num), 'red', clear=true);
        game.premove = null;

        var valid_move = game.chess.move(mv);
        if (valid_move) {
            game.chess.undo();
            console.log('actual valid premove, calling it');
            //ficswrap.emit('command',valid_move.san);
            M(valid_move.san);
        }

        console.log('the attempted premove is ');
        console.log(source);
        console.log(target);
        console.log(piece);
        console.log(mv);
        console.log('result is: ')
        console.log(valid_move);

    }
    console.log(game.chess.history());
    return 'M run';
}

function highlightSquares(board_div, color, move=null, clear=false) {
    board_div.find('.square-55d63').removeClass('highlight-square-'+color);
    if (move && !clear) {
        board_div.find('.square-' + move.to).addClass('highlight-square-'+color);
        board_div.find('.square-' + move.from).addClass('highlight-square-'+color);
    }
}

function goToMove(game_num, i, animate=false) {
    game.board.position(game.fens[i], animate);
    
    var mv = game.chess.history({verbose: true})[i];
    var board_div = $('#board_'+game_num);

    highlightSquares(board_div, 'cyan', move=mv);
}

                
$(document).ready(function(){
    game.board = new ChessBoard('board_12', {
        //pieceTheme: game.pieceTheme,
        //position: game.chess.fen().split(/\s+/)[0],
        position: 'start',
        draggable:true,
        onDragStart : function(source, piece, pos, orientation) {
            console.log(source);
            console.log(piece);
            console.log(pos);
            console.log(orientation);
            //if (s12.my_rel === '1') return true;
			if (piece[0] === humanColor()) return true;
            return false;
        },
        onDrop : function(source, target, piece, newPos, oldPos, orientation) {
            console.log('IN ONDROP!!!!!!!!!!!!!!!');
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
            if (s12.my_rel === '1') {
                if (!valid_move) {
                    return 'snapback';
                } else {
                    //ficswrap.emit('command',valid_move.san);
                    M(valid_move.san);
                }
            } else if (s12.my_rel === '-1') {
                if (source && target && source != target) {
                    console.log('source is ' + source);
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
});
