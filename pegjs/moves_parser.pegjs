{
    var mappy = new Map();
    mappy.set("moves",[]);
    mappy.set("movetimes",[]);
}

start = header chunk+ [\n\r]* {
    //return [game,moves.length,movetimes.length,moves,movetimes];
    return mappy
}

header = [\n\r]* "Movelist for game " gamenum ":" [\n\r]

gamenum = gn: $([1-9]+) {
    mappy.set("game_num", gn);
}

chunk = [\n\r]+ _* ch: $(   moveline   /  (!([\n\r]) .)*   )

//moveline = $(movenum _+ san _+ clock _+ san _+ clock _+)
moveline = $(movenum _+ (san _+ clock _*)+)  _*

san = mv: $([PNBRQKxO\-=a-h1-9]*[\+#\!\?]?) {
    if (mv.length) mappy.get("moves").push(mv);
}

clock = mt: $("(" ([0-9]+ ":")+ [0-9]+ ")") {
    mappy.get("movetimes").push(mt);
}


movenum = [0-9]+ "."

_ = " "+

