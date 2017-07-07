/*
{Game 183 (GuestHKBG vs. GuestDMHB) GuestDMHB resigns} 1-0
{Game 100 (Serlok vs. GuestYCMD) GuestYCMD forfeits by disconnection} 1-0
{Game 79 (xandor vs. eyestiger) eyestiger checkmated} 1-0
{Game 134 (dmacblu vs. prawngrabber) prawngrabber resigns} 1-0
{Game 158 (robotvinik vs. CheckJohnson) Creating unrated standard match.}
{Game 158 (robotvinik vs. CheckJohnson) Creating unrated standard match.}
{Game 158 (robotvinik vs. CheckJohnson) Game aborted by mutual agreement} *
{Game 116 (robotvinik vs. CheckJohnson) Creating unrated standard match.}
{Game 116 (robotvinik vs. CheckJohnson) Creating unrated standard match.}
{Game 116 (robotvinik vs. CheckJohnson) Game aborted on move 1} *
{Game 116 (robotvinik vs. CheckJohnson) Game aborted on move 1} *
{Game 240 (robotvinik vs. CheckJohnson) Game drawn by mutual agreement} 1/2-1/2
*/


{
    var res = {
        observe: false,
        unobserve: false,
        end_reached: false,
        cmd_num: 0,
        cmd_code: 0,
        body: '',
        fullbody: '',
        style12: '',
        s12: { ranks: [] },
        game_info: {},
        };
}

start =  header? body ender? {
  return res;
  }

header = $("\x15" cmdnum "\x16" cmdcode "\x16")

body = fb: $(neither? something? neither? something? neither? something? neither?) {
    res.fullbody = fb;
}

something = observe / game_situ / style12 / unobserve / creating

neither = bod: $( (!(something / "\x17") .)* )  {  
  res.body = res.body + bod; }


unobserve = "Removing game " + game_num + " from observation list." {
    res.unobserve = true;
}


game_situ = "{Game " game_num " (" player " vs. " player ") " situ: $((!"}".)*) "}" _? r: $(result)? {
    if (/^Creating /.test(situ)) {
        res.observe = true;
    }
    res.game_info.situ = situ;
    res.game_info.result = r;
}

result = "1-0" / "0-1" / "\*" / "1/2-1/2"

ender = "\x17" {
  res.end_reached=true; }

cmdnum = cnum: $([0-9]+) {
 res.cmd_num = parseInt(cnum); }

cmdcode = ccode: $([0-9]+) {
  res.cmd_code = parseInt(ccode); }

observe = "You are now observing game" _ game_num "." newl "Game" _ game_num ":" _ game_info {
  res.observe = true;
  }

creating = "Creating: " game_info 

game_num = gn:$([1-9][0-9]*) {
    res.game_num = gn;
    res.game_info.game_num = gn;
  }

game_info = white_player _ "(" white_rating ")" _ black_player _ "(" black_rating ")" _ runr _ variant _ time _ inc 

player = p:$([A-z]+)

white_player = p:$(player) {
  res.game_info.white_player = p;
  }

black_player = p:$(player) {
  res.game_info.black_player = p;
  }

rating = r:$([1-9-+ ][0-9-+ ]*)

white_rating = r:$(rating) {
  res.game_info.white_rating = r;
  }
  
black_rating = r:$(rating) {
  res.game_info.black_rating = r;
  }
  
runr = r:$("rated" / "unrated") {
  res.game_info.runr = r;
  }

variant = v:$("blitz" / "standard" / "suicide" / "lightning") {
  res.game_info.variant = v;
}

time = t:number {
  res.game_info.time = t;
  }

inc = i:number {
  res.game_info.inc = i;
  }

number = $([0-9]+)

_ = " "+

newl = [\n\r]+




style12 = x: $("<12>" _ s12_rank _ s12_rank _ s12_rank _ s12_rank 
                 _ s12_rank _ s12_rank _ s12_rank _ s12_rank 
                 _ s12_whose_move _ s12_epfile 
                 _ s12_w_kcast _ s12_w_qcast _ s12_b_kcast _ s12_b_qcast 
                 _ s12_moves_since_ir _ s12_game_num 
                 _ s12_w_name _ s12_b_name 
                 _ s12_my_rel 
                 _ s12_dur _ s12_inc _ s12_w_mat _ s12_b_mat 
                 _ s12_w_clock _ s12_b_clock _ s12_move_num 
                 _ s12_move_note _ s12_move_time _ s12_move_note_short 
                 _ s12_board_flip
                 (!"\n" .)*)  { res.style12 = x }


s12_rank = x: $([\-PpRrNnBbQqKk][\-PpRrNnBbQqKk][\-PpRrNnBbQqKk][\-PpRrNnBbQqKk]
            [\-PpRrNnBbQqKk][\-PpRrNnBbQqKk][\-PpRrNnBbQqKk][\-PpRrNnBbQqKk])  { if (res.s12.ranks.length < 8) res.s12.ranks.push(x); }

s12_whose_move = x: [BW]  { res.s12.whose_move = x; }
s12_epfile = x: $([\-0-7]+)  { res.s12.epfile = parseInt(x); }

s12_w_kcast = x: [01]  { res.s12.w_kcast = parseInt(x); }
s12_w_qcast = x: [01]  { res.s12.w_qcast = parseInt(x); }
s12_b_kcast = x: [01]  { res.s12.b_kcast = parseInt(x); }
s12_b_qcast = x: [01]  { res.s12.b_qcast = parseInt(x); }

s12_moves_since_ir = x: $([0-9]+)  { res.s12.moves_since_ir = parseInt(x); }

s12_game_num = x: $(game_num)  { res.s12.game_num = x; }

s12_w_name = x: $( [^ ]+ )  { res.s12.w_name = x; }
s12_b_name = x: $( [^ ]+ )  { res.s12.b_name = x; }

s12_my_rel = x: $([\-0-7]+)  { res.s12.my_rel = x; }

s12_dur = x: $([0-9]+)  { res.s12.dur = parseInt(x); }
s12_inc = x: $([0-9]+)  { res.s12.inc = parseInt(x); }

s12_w_mat = x: $([0-9]+)  { res.s12.w_mat = parseInt(x); }
s12_b_mat = x: $([0-9]+)  { res.s12.b_mat = parseInt(x); }

s12_w_clock = x: $([0-9]+)  { res.s12.w_clock = parseInt(x); }
s12_b_clock = x: $([0-9]+)  { res.s12.b_clock = parseInt(x); }

s12_move_num = x: $([0-9]+)  { res.s12.move_num = parseInt(x); }

s12_move_note = x: $( [^ ]+ )  { let movs = x.split('/'); res.s12.move_piece = movs[0]; res.s12.move_note = movs[1]; }
s12_move_time = x: $( [^ ]+ )  { res.s12.move_time = x; }
s12_move_note_short = x: $( [^ ]+ )  { res.s12.move_note_short = x; }

s12_board_flip = x: [01]  { res.s12.board_flip = parseInt(x); }

