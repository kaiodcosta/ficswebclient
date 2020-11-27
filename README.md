### This is a web client for the Free Internet Chess Server (FICS)

##### After cloning repository, go into it and then do:
npm install express socket.io telnet-client pegjs

##### Do this once and then anytime pegjs/fics_parser.peg.js or pegjs/moves_parser.peg.js is changed
cd pegjs && ./buildweb

##### Run server
cd .. && ./servchess.js

##### Go to http://host:3008 in your browser
Login as guest with no password or use your FICS account.
