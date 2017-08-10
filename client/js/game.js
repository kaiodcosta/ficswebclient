
var gamemap = new Map();

class Game {
    constructor(s12, game_info) {
        this.s12 = s12;

        this.human_color = 'x';

        this.situ = game_info.situ;
        this.result = game_info.result;
        this.game_num = game_info.game_num;
        this.white_player = game_info.white_player;
        this.black_player = game_info.black_player;
        this.white_rating = game_info.white_rating;
        this.black_rating = game_info.black_rating;
        this.runr = game_info.runr;
        this.variant = game_info.variant;
        this.time = game_info.time;
        this.inc = game_info.inc;

        this.top_is_black = true;

        this.clocks = {w:null, b:null};

        this.pieceTheme = (piece) => {
            if (this.theme) {
                if (piece.search(/w/) !== -1) {
                    return 'img/chesspieces/' + this.theme.white_pieces + '/' + piece + '.png';
                }
                return 'img/chesspieces/' + this.theme.black_pieces + '/' + piece + '.png';
            }
        };
    }

    initMoves(movesobj) {
        this.chess = new Chess();

        this.chess.header(
                'Event', this.time + " + " + this.inc + " " + this.runr + " " + this.variant,
                'White', this.white_player,
                'Black', this.black_player, 
                'TimeControl', this.time + '+' + this.inc,
                'WhiteElo', this.white_rating,
                'BlackElo', this.black_rating
                );

        this.startfen = this.chess.fen().split(/\s+/)[0];

        this.movetimes = [];
        this.fens = [];

        var moves = movesobj.get("moves");
        var movetimes = movesobj.get("movetimes");

        for (var i=0; i<moves.length; i++) {
            this.chess.move(moves[i]);
            this.fens[i] = this.chess.fen().split(/\s+/)[0];
            this.movetimes[i] = movetimes[i];
        }
                                                                  
        this.current_move_index = this.chess.history().length - 1;
    }



    getMoveIndexFromS12() {
        if ( !this.s12 ) return -1;
        return ((this.s12.move_num-1) * 2) - (this.s12.whose_move == 'W' ? 1 : 0);
    }

}


