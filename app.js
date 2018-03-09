var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fileupload = require('express-fileupload');
var cors = require('cors');
var Admin = require('./service/admin');
var infusionHooks = require('./api/infusionHooks')


var user = require('./api/user');
var interest = require('./api/interest');
var feed = require('./api/feed');
var reservation = require('./api/reservation');
var credit = require('./api/credit');
var saved = require('./api/saved');
var payment = require('./api/payment');
var admin = require('./api/admin');
var redeemCode = require('./api/redeemCode');
var dashBoard = require('./api/dashBoard');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '5mb' }));
app.use(cookieParser());
app.use(cors({
    exposedHeaders: ["Link"]
}));
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileupload());

//config api routers
app.use('/api/user', user);
app.use('/api/interest', interest);
app.use('/api/feed', feed);
app.use('/api/reservation', reservation);
app.use('/api/credit', credit);
app.use('/api/saved', saved);
app.use('/api/payment', payment);
app.use('/api/admin', admin);
app.use('/api/RedeemCode', redeemCode);
app.use('/api/infusionHooks', infusionHooks);
app.use('/api/dashBoard', dashBoard);

app.get('/', function(req, res) {
    return res.json({ 'result': 'server started' });
})
//config mongodb
var mDBConfig = require('./constants/mongo');
var mongodb = require('mongoose');
var Interests = require('./models/interest');
var InterestValues = require('./constants/interests');

mongodb.connect(mDBConfig.pub_url, { useMongoClient: true }).then(function() {
    console.log("mongodb is connected...");
    Admin.defaultAdmin();
    Interests.find({}, function(err, interests) {
        if (interests.length == 0) {
            //init interests collections
            InterestValues.map(function(value, index) {
                var newInterest = new Interests;
                newInterest.name = value.name;
                newInterest.description = value.description;
                newInterest.save();
            });
        }
    });

}, function(err) {

});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;