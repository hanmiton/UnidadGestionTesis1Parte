var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var titlize = require('mongoose-title-case');
var validate = require('mongoose-validator');

var nameValidator = [
	validate({
		validator: 'matches',
		arguments: /^(([a-zA-Z]{3,20})+[ ]+([a-zA-Z]{3,20})+)+$/,
		message: ' NOmbre debe tener por lo menos 3 caracteres, maximo 30,no especial character, tener espacio entre nombre'
	}),
	validate({
		validator: 'isLength',
		arguments: [3, 20],
		message: 'Nombre debe estar entre {ARGS[0]} AND {ARGS[1]} caracteres'
	})
];

var emailValidator = [
	validate({
		validator: 'isEmail',
		message: 'Is not a valid e-mail.'
	}),
	validate({
		validator: 'isLength',
		arguments: [3, 25],
		message: 'Email debe estar entre {ARGS[0]} y {ARGS[1]} caracteres'
	})
];

var usernameValidator = [
	validate({
		validator: 'isLength',
		arguments: [3, 25],
		message: 'Username debe estar entre {ARGS[0]} y {ARGS[1]} caracteres'
	}),
	validate({
		validator: 'isAlphanumeric',
		message: 'Username deberia contener letra y numeros solamente'
	})
];

var passwordValidator = [
	validate({
		validator: 'matches',
		arguments: /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,35}$/,
		message: ' Password debe tener por lo menos una letra minuscula, un numero, un caracter especial y por lo menos 8 caracteres'
	}),
	validate({
		validator: 'isLength',
		arguments: [8, 35],
		message: 'Password debe estar entre {ARGS[0]} y {ARGS[1]} caracteres'
	})
];



var UserSchema = new Schema({
	name: { type: String, required: true, validate: nameValidator},
	username: { type: String, lowercase: true, required: true, unique: true, validate: usernameValidator},
	password: { type: String, required: true, validate: passwordValidator, select: false},
	email: { type: String, required: true, lowercase: true, unique: true, validate: emailValidator },
	active: { type: Boolean, required: true, default: false},
	temporarytoken: { type: String, required: true},
	resettoken: {type: String, required: false},
	permission: {type: String, required: true, default: 'user' }

});

UserSchema.pre('save', function(next){
	var user = this;

	if (!user.isModified('password')) return next();
	
	bcrypt.hash(user.password, null, null, function(err, hash){
		if(err) return next(err);
		user.password = hash;
		next();
	});
});

UserSchema.plugin(titlize, {
	paths : [ 'name']
});

UserSchema.methods.comparePassword = function(password){
	return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);