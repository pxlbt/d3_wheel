var express = require('express');
var app = express();

app.set('views', './public');
app.use(express.static('public'));
app.use(express.static('./node_modules/bootstrap/dist'));

app.use(function(req, res){
  res.sendfile('./public/index.html');
});

app.listen(3333, function () {
  console.log('Server started on port 3333!');
});
