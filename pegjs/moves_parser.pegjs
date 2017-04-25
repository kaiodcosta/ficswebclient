{
    var game;
    var moves = [];
    var movetimes = [];
}

start = header chunk+ [\n\r]* {
    return [game,moves.length,movetimes.length,moves,movetimes];
}

header = "Movelist for game " gamenum ":" [\n\r]

gamenum = gn: $([1-9]+) {
  game = gn;
}

chunk = [\n\r]+ _* ch: $(   moveline   /  (!([\n\r]) .)*   ) 

//moveline = $(movenum _+ san _+ clock _+ san _+ clock _+)
moveline = $(movenum _+ (san _+ clock _*)+)  _*

san = mv: $([PNBRQKxO\-=a-h1-9]*[\+#\!\?]?) {
    if (mv.length) moves.push(mv);
}

clock = mt: $("(" ([0-9]+ ":")+ [0-9]+ ")") {
    movetimes.push(mt);
    }


movenum = [0-9]+ "."

_ = " "+
