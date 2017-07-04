
var gamemap = new Map();

class Game {
    constructor(s12, game_info) {
        this.chess = new Chess();
        this.chess.header(
                'Event', game_info.time + "|" + game_info.inc + " " + game_info.runr + " " + game_info.variant,
                'White', game_info.white_player,
                'Black', game_info.black_player, 
                'TimeControl', s12.dur + '+' + s12.inc,
                'WhiteElo', game_info.white_rating,
                'BlackElo', game_info.black_rating,
                );

        this.startfen = this.chess.fen().split(/\s+/)[0];

        this.top_is_black = true;
        this.game_num = s12.game_num;

        this.movetimes = [];
        this.fens = [];

        this.s12 = s12;
        this.game_info = game_info;

        this.current_move_index = -1;
        this.clocks = {w:null, b:null};
    }
}


