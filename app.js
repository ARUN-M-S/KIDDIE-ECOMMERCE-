var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const dotenv=require('dotenv')
dotenv.config({path:"config/config.env"})



// File Upload
var fileUpload = require('express-fileupload')

// setting ENV 


// express session
var session = require('express-session')

// mongodb
var db = require('./config/connection')

// HBS handlebar
var hbs = require('express-handlebars')

// mongostore
const MongoStore = require('connect-mongo');

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials'}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// File upload Middleware
app.use(fileUpload())

// session middleware
app.use(session({
  secret: 'key',
  cookie: {maxAge: 6000000},
  resave: false,
  saveUninitialized: true,
  
})
)
db.connect((err) => {
  if (err) console.log("connection error" + err);
  else console.log("database connecter to port");
});
// MongoDB connection checking
db.connect((err) => {
  if (err) console.log("Connection error " + err);
  else console.log("Database Connected to port 27017");
});

app.use('/', userRouter);
app.use('/admin', adminRouter);
app.use((req, res, next) => {
  res.status(404).render(
      "../404")
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('user/error');
});

module.exports = app;
