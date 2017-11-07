var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../models/user');
var session = require('express-session');
var jwt = require('jsonwebtoken');
var secret = 'harrypotter';
//var token = jwt.sign({ username: user.username, email: user.email}, secret, {expiresIn: '24h'});
					
module.exports = function(app, passport){

	app.use(passport.initialize());
	app.use(passport.session());
	app.use(session({secret: 'keyboard cat', resave: false, saveUninitialized: true, cookie: { secure: false}}));

	passport.serializeUser(function(user, done){
		
		if(user.active){
			token = jwt.sign({ username: user.username, email: user.email}, secret, {expiresIn: '24h'});			
		} else {
			token = 'inactive/error';
		}

		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user){
			done(err, user);
		});
	});

	passport.use(new FacebookStrategy({
	    clientID: '640883526112072',
	    clientSecret: '4aa8692b6efc199e81b0eb2a75e4211e',
	    //callback local 
	   // callbackURL: "http://localhost:80/auth/facebook/callback",
	    //callback deploy
	    callbackURL: "http://www.unidaddegestion.club/auth/facebook/callback",
	    //callbackURL: "http://www.example.com/auth/facebook/callback",
	    profileFields : ['id', 'displayName', 'photos', 'email']
  	},

  	function(accessToken, refreshToken, profile, done) {

    	console.log(profile._json.name);
  		User.findOne({ username: profile._json.name.toLowerCase()}).select('username active password email').exec(function(err, user){
    		console.log(user);
    		if(err) done(err);

    		if(user && user != null){
    			done(null, user);
    		}else{
    			done(err);
    		}
    	});
    	//User.findOne({ email: profile._json.name}).select()
    	//User.findOne({ email: profile.js})
    //User.findOrCreate(..., function(err, user) {
     // if (err) { return done(err); }
      //done(null, user);
    //});
    	//done(null, profile);
  		}
	));

	  

	passport.use(new TwitterStrategy({
	    consumerKey: 'iPrfwMn1QYy1by3QF0o13xahj',
	    consumerSecret: 'v9wwzm5zecH67q080gSvuI2IDd05W1343FZkqpoNWSyVFN5lU5',
	    //Deploy version Twitter
	    callbackURL: "https://www.unidaddegestion.club/auth/twitter/callback",
	    //callbackURL: "http://localhost:5000/auth/twitter/callback",
	    userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true"
	  },
	  function(token, tokenSecret, profile, done) {
	   console.log(profile.emails[0].value);
	   // User.findOrCreate(..., function(err, user) {
	    //  if (err) { return done(err); }
	     // done(null, user);
	    //});
	    User.findOne({ email: profile.emails[0].value }).select('username active password email').exec(function(err, user){
    		console.log(user);
    		if(err) done(err);

    		if(user && user != null){
    			done(null, user);
    		}else{
    			done(err);
    		}
    	});
	    //done(null, profile);
	  }
	));

	passport.use(new GoogleStrategy({
		clientID: '390328907928-o5vhaagenfe43mqm30gonrbmdvig3bqu.apps.googleusercontent.com',
		clientSecret: '-nGoBmQ4Xt7l3PO6cCjZkEif',
	    callbackURL: "https://www.unidaddegestion.club/auth/google/callback"
	  	//callbackURL: "http://localhost:5000/auth/google/callback"
	  },

	  function(token, tokenSecret, profile, done) {
		console.log(profile.emails[0].value);
		User.findOne({ email: profile.emails[0].value }).select('username active password email').exec(function(err, user){
    	//	console.log(user);
    		if(err) done(err);

    		if(user && user != null){
    			done(null, user);
    		}else{
    			done(err);
    		}
    	});
	     //done(null, profile);
	  }
	));

	app.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login' ,'profile', 'email' ] }));

	app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/googleerror' }), function(req, res) {
	 res.redirect('/google/' + token);
	});  
	

	app.get('/auth/twitter', passport.authenticate('twitter'));

	app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/twittererror' }), function(req, res){
		res.redirect('/twitter/' + token);
	});

	app.get('/auth/facebook/callback', passport.authenticate('facebook', {failureRedirect : '/facebookerror' }), function(req, res){
		res.redirect('/facebook/' + token);
	});

	app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

	return passport;
}

