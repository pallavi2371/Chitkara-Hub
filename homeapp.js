if (process.env.NODE_ENV !== 'production') {   //to load our env variables
  require('dotenv').config()
}

const express=require('express');
const about=require('./routes/about');
const contact=require('./routes/contact');
const articleRouter = require('./routes/articles');
const app=express();   //express object
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const Article = require('./models/article');
const mongoose =require("mongoose");


const users = []  

mongoose.connect("mongodb://localhost/blog",{
  useNewUrlParser:true, useUnifiedTopology:true , useCreateIndex:true})

  const initializePassport = require('./passport-config')
  initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
  )

app.set("view engine","ejs"); //to use ejs
 //app.use(path,callback)
app.use(express.urlencoded({ extended:false }))  //request send to server
app.use(flash())
app.use(session({   //a simple use of express-session and saving the currently logged in user to the session.
  secret: process.env.SESSION_SECRET, //name of the secret key present in our env file which is randomly generated long string which makes it more secure.
  resave: false, //dont want to resave it if nothing is changed
  saveUninitialized: false //dont want to save any empty value
}))
app.use(passport.initialize()) 
app.use(passport.session()) //store our login variables to be persisted
app.use(express.static("views"));
app.use('/css',express.static(__dirname +'/css'));
app.use('/articles',articleRouter)
app.use('/about',about)
app.use('/contact',contact)
app.use(methodOverride('_method'))



app.get("/",checkAuthenticated, async function(req,res){  //if authenticated redirect to the main page
  const articles=await Article.find().sort({ createdAt :'desc' });
res.render("articles/index",{articles:articles,name:req.user.name}); //fetching the articles and name of the user
});


app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  // console.log("checking ");
  successRedirect: '/',
 failureRedirect: '/login',   //redirect to login page on failure
  failureFlash: true   // on failure display the message
}),function(req,res){
  
});

app.get('/register', checkNotAuthenticated, (req, res) => {  //if user is already logged in should not go to register page
  res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 5)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword  
    })
    res.redirect('/login')
  } catch {
    res.redirect('/register')   //incase of failure
  }
})

app.delete('/logout', (req, res) => {  //to logout of the page
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {  //if user is sucessfully logged in then redirect back to main page
  if (req.isAuthenticated()) {
    return next()  
  }
  // console.log("yes authenticated")
 res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {  //if user is not sucessful in logging in then redirect back to login page
  
  if (req.isAuthenticated()) {    
    return res.redirect('/')
  }
  next()              //so that one cannot go back to the login page once authenticated.
}

app.use('/articles',articleRouter)
app.listen(3000,function(err){
  if(err)
  console.log(err);
  else
  console.log("Server is running on port 3000");
});