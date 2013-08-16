var express = require('express')
  , path = require('path')
  , app = express();

app.configure(function(){
  // serve css and js folders as static files
  app.use('/css', express.static(path.join(__dirname, 'css')));
  app.use('/js', express.static(path.join(__dirname, 'js')));
});

app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.listen(3000);
console.log('Listening on port 3000');