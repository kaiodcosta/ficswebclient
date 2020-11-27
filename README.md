### After cloning repository, go into it and then do:
npm install express socket.io telnet-client pegjs


### Do this once and then anytime the pegjs/fics_parser.pegjs is changed
cd pegjs && ./buildweb

### run
cd .. && ./servchess.js

### go to http://host:3008
