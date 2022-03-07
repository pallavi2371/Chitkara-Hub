const LocalStrategy = require('passport-local').Strategy //to display msgs
const bcrypt = require('bcrypt') //to check the password

//login 
// done func called whenever we are done authenticating user
function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    const user = getUserByEmail(email)
    //first check whether the email is present in our database or not.
    if (user == null) {
      return done(null, false, { message: 'No user with that email' })
    }
   //if yes check whether the passwords match
    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user)   //task completed
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      return done(e)  //return the error 
    }
  }

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  //serialize our user in a single id
  passport.serializeUser((user, done) => done(null, user.id))  //store user data into a session
  passport.deserializeUser((id, done) => {     //retrieve user data from that session
    return done(null, getUserById(id))
  })
}

module.exports = initialize