var express = require('express');
var expstormpath = require('express-stormpath');
var stormpath = require('stormpath');
var bodyParser = require('body-parser');
 
var app = express();
 
//app.set('views', './server/views');
//app.set('view engine', 'jade');
 
app.use(expstormpath.init(app, {
  expand: {
    customData: true
  }
}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

require('./initializeLinkCache')();

app.get('/', expstormpath.getUser, function(req, res) {
  res.end('hello world');
});

/*
for production, you can require login here by using either
app.use('/api', expstormpath.loginRequired, ...);
app.use('/api', expstormpath.groupsRequired(['groupName1, group2']), ...) //requires all groups listed
app.use('/api', expstormpath.groupsRequired(['groupName1, group2'], false), ...) //requires at least one group
*/

app.use('/api', require('./sprouter'));

app.use('/sql', require('./sqlrouter'));

app.on('stormpath.ready',function(){
  console.log('Stormpath Ready');
});
 
app.listen(3000);