if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express=require('express');
const about=require('./routes/about')
const contact=require('./routes/contact')
const articleRouter = require('./routes/articles')
const app=express();
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
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

app.set("view engine","ejs");

app.use(express.urlencoded({ extended:false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.static("views"));
app.use('/css',express.static(__dirname +'/css'));
app.use('/articles',articleRouter)
app.use('/about',about)
app.use('/contact',contact)
app.use(methodOverride('_method'))



app.get("/",checkAuthenticated, async function(req,res){
  const articles=await Article.find().sort({ createdAt :'desc' });
res.render("articles/index",{articles:articles,name:req.user.name});
});


app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: 'C:\Users\PALLAVI\Desktop\Chitkara Hub\articles\views\articles\index.ejs',
  failureRedirect: '/login',
  failureFlash: true
}),function(req,res){

});

app.get('/register', checkNotAuthenticated, (req, res) => {
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
    res.redirect('/register')
  }
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.use('/articles',articleRouter)
app.listen(3000,function(err){
  if(err)
  console.log(err);
  else
  console.log("Server is running on port 3000");
});