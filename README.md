

# first make sure to install for node:  express socket.io telnet-client pegjs
npm install express socket.io telnet-client pegjs

# do this once
wget http://chessboardjs.com/releases/0.3.0/chessboardjs-0.3.0.zip && mkdir -p client/chessboardjs-0.3.0 && unzip chessboardjs-0.3.0.zip -d client/chessboardjs-0.3.0 && mv client/chessboardjs-0.3.0/img client/
wget https://github.com/jhlywa/chess.js/archive/master.zip && mkdir -p client/chess.js-master && unzip master.zip -d client/chess.js-master/

# do this once and then anytime the pegjs/fics_parser.pegjs is changed
cd pegjs && ./buildweb

# Guest logins do not work yet

# run
./servchess.js


# go to http://host:3000
