
var gamemap = new Map();

class Game {
    constructor(s12) {
        this.top_is_black = true;

        this.game_num = s12.game_num;

        this.w_name = s12.w_name;
        this.b_name = s12.b_name;

        this.dur = s12.dur;
        this.inc = s12.inc;

        this.moves = [];
        this.movetimes = [];
        this.fens = [];

        this.chess = new Chess();

        this.updateWithS12(s12);

    }

    updateWithS12(s12) {
        this.ranks = s12.ranks;

        this.whose_move = s12.whose_move;
        this.epfile = s12.epfile;

        this.w_kcast = s12.w_kcast;
        this.w_qcast = s12.w_qcast;
        this.b_kcast = s12.b_kcast;
        this.b_qcast = s12.b_qcast;

        this.moves_since_ir = s12.moves_since_ir;

        this.my_rel = s12.my_rel;

        this.w_mat = s12.w_mat;
        this.b_mat = s12.b_mat;

        this.w_clock = s12.w_clock;
        this.b_clock = s12.b_clock;

        this.move_num = s12.move_num;
        //this.setMoveIndex();
        this.move_index = getMoveIndexFromS12(s12);

        this.move_piece = s12.move_piece;
        this.move_note = s12.move_note;
        this.move_time = s12.move_time;
        this.move_note_short = s12.move_note_short;

        //this.chess.move(this.move_note_short);
        this.fens.push(this.chess.fen());
        this.movetimes[this.move_index] = this.move_time;

        console.log('game.chess.history().length :  ' + this.chess.history().length);
        console.log('game.fens.length :  ' + this.fens.length);
        console.log('game.movetimes.length :  ' + this.movetimes.length);

        this.board_flip = s12.board_flip;
    }

    setMoveIndex() {
        this.move_index = ((this.move_num-1) * 2) - (this.whose_move == 'W' ? 1 : 0); 
        console.log('move_index is ' + this.move_index.toString());
    }

    initGameBoard(board) {
        this.board = board;
    }
}


