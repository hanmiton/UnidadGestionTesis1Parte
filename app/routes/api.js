var User = require('../models/user');
var jwt = require('jsonwebtoken');
var secret = 'harrypotter';
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

module.exports = function(router){



	var options = {
	  auth: {
	    api_user: 'hanmilton',
	    api_key: 'UnidadDeGestion777'
	  }
	}

	var client = nodemailer.createTransport(sgTransport(options));


	// http://localhost:80/api/users
	// www.unidaddegestion.club:80/users
	router.post('/users',function(req,res){
		//res.send('testing users route')
		//console.log(req.body);
		var user = new User();
		user.username = req.body.username;
		user.password = req.body.password;
		user.email = req.body.email;
		user.name = req.body.name;
		user.temporarytoken = jwt.sign({ username: user.username, email: user.email}, secret, {expiresIn: '24h'});
		console.log(req.body);
		if(req.body.username == null || req.body.username == '' || req.body.password == null || req.body.password == '' || req.body.email == null || req.body.email == '' || req.body.name == null || req.body.name == ''){
			//res.send('hola');
			res.json({ success: false, message: 'Asegura tu nombre de usuario, email y contraseña'});
			//res.json({ success: false, messaje: 'hola'});
		}else{
			user.save(function(err){
				if(err){
					if(err.errors != null){
						if(err.errors.name){
							res.json({ success: false, message: err.errors.name.message});	
						} else if (err.errors.email) {
							res.json({ success: false, message: err.errors.email.message});
						} else if (err.errors.username) {
							res.json({ success: false, message: err.errors.username.message});
						} else if (err.errors.password) {
							res.json({ success: false, message: err.errors.password.message});
						} else {
							res.json({ success: false, message: err})
						}
							
					} else if (err){
						if (err.code == 11000) {
							if(err.errmsg[61] == "u"){
								res.json({ success: false, message: 'Usuario ya esta en uso'});
							} else if(err.errmsg[61] == "e"){
								res.json({ success: false, message: 'Este email ya esta en uso '})
							}
							//res.json( { success: false, message : 'Nombre de usuario o email en uso!'})
						} else {
							res.json({ success: false, message: err });	
						}
					}
				} else {

					var email = {
					  from: 'Localhost Staff, staff@localhost.com',
					  to: user.email,
					  subject: 'unidaddegestion.club Enlace de Activación',
					  text: 'Hola' + user.name + ',gracias por registrate en unidaddegestion.club. Porfavor click en el siguiente link para completar la activación.',
					//local
					//html: '<b>Hello <strong>' + user.name + '</strong>,<br><br> Gracias por registrarte en unidaddegestion.club. Porfavor da click de abajo para completar la activación:<br><br><a href="http://localhost:5000/activate/' + user.temporarytoken + '">http://localhost:5000/activate/</a>'
					html: '<b>Hello <strong>' + user.name + '</strong>,<br><br> Gracias por registrarte en unidaddegestion.club. Porfavor da click de abajo para completar la activación:<br><br><a href="https://www.unidaddegestion.club/activate/' + user.temporarytoken + '">https://www.unidaddegestion.club/activate/</a>'
					};

					client.sendMail(email, function(err, info){
					    if (err ){
					      console.log(error);
					    }
					    else {
					      console.log('Mensaje enviado ' + info.response);
					    }	
					});
					
					res.json({ success: true, message: 'Cuenta registrada! Por favor rebiza tu correo para el link de ativacion.'});
				}
			}); 
		}
	});

	router.post('/checkusername', function(req, res){
		User.findOne({ username: req.body.username}).select('username').exec(function(err, user){
			if(err) throw err;
			console.log(user);
			if (user){
				res.json({success:false, message: 'Username en uso'});
				
			}else {
				res.json({success: true, message: 'Username Valido'})
			}
		});
	});

	router.post('/checkemail', function(req, res){
		User.findOne({ email: req.body.email}).select('email').exec(function(err, user){
			if(err) throw err;
			//console.log(user);
			if (user){
				res.json({success:false, message: 'email en uso'});
				
			}else {
				res.json({success: true, message: 'email Valido'})
			}
		});
	});



	//user login route
	// http://localhost:port/api/authenticate
	router.post('/authenticate', function(req, res){
		User.findOne({ username: req.body.username}).select('email username password active').exec(function(err, user){
			if(err) throw err;
			
			if (!user){
				res.json({success:false, message: 'No se puede autenticar usuario'});	
			}else if (user){
				if(req.body.password){
					var validPassword = user.comparePassword(req.body.password);	
					if(!validPassword){
					res.json({success: false, message: 'No puede autentica password'});
					} else if(!user.active){
						res.json({success: false, message: 'Cuenta todavia no activada, Por favor rebiza tu e-mail por el link de ativacion', expired: true});
					}
					else {
					var token = jwt.sign({ username: user.username, email: user.email}, secret, {expiresIn: '30s'});
					res.json({success: true, message: 'User autenticado!', token: token});
				}
				} else {
					res.json({ success: false, message : 'Password no ingresado'});
				}
				
				
			}
		});
	});

	router.put('/activate/:token', function(req,res){
		console.log(req.params.token);
		
		User.findOne({ temporarytoken: req.params.token}, function(err, user){
			if (err) throw err;
			var token = req.params.token;
			//console.log(user);
			jwt.verify(token, secret, function(err, decoded){
				if(err){
					res.json({ success: false, message: 'Enlace de activacion esta expirado.'});
				} else  if(!user){
					res.json({ success: false, message: 'Enlace de activación esta expirado.'})
				} else {
					user.temporarytoken = false;
					user.active = true;
					user.save(function(err){
						if (err) {
							console.log(err);
						}else {
							var email = {
								  from: 'Localhost Staff, staff@localhost.com',
								  to: user.email,
								  subject: 'Cuenta Activada',
								  text: 'Hola' + user.name + ', Tu cuenta ha sido exitosamente activada!',
								  html: 'Hello <strong>' + user.name + '</strong>,<br><br> Tu cuenta ha sido exitosamente activada!'

								};

								client.sendMail(email, function(err, info){
								    if (err ){
								      console.log(error);
								    }
								    else {
								      console.log('Message sent: ' + info.response);
								    }
								});

							res.json({success: true, message: 'Cuenta Activada'});
						}
					});
				}
			});
		});
	});


	router.post('/resend', function(req, res){
		User.findOne({ username: req.body.username}).select('username password active').exec(function(err, user){
			if(err) throw err;
			
			if (!user){
				res.json({success:false, message: 'No se puede autenticar usuario'});	
			}else if (user){
				if(req.body.password){
					var validPassword = user.comparePassword(req.body.password);	
					if(!validPassword){
					res.json({success: false, message: 'No puede autentica password'});
					} else if(user.active){
						res.json({success: false, message: 'Cuenta ya esta activada.'});
					}
					else {
					res.json({ success: true, user: user});
				}
				} else {
					res.json({ success: false, message : 'Password no ingresado'});
				}
				
				
			}
		});
	});


	router.put('/resend', function(req, res){
		User.findOne({ username: req.body.username}).select('username name email temporarytoken').exec( function(err, user){
			if(err) throw err;
			user.temporarytoken = jwt.sign({ username: user.username, email: user.email}, secret, {expiresIn: '24h'});
			user.save(function(err){
				if (err) {
					console.log(err);
				} else {

					var email = {
					  from: 'Localhost Staff, staff@localhost.com',
					  to: user.email,
					  subject: 'unidaddegestion.club Enlace de Activación',
					  text: 'Hola' + user.name + ',gracias por registrate en unidaddegestion.club. Porfavor click en el siguiente link para completar la activación.',
					//local
					//html: '<b>Hello <strong>' + user.name + '</strong>,<br><br> Gracias por registrarte en unidaddegestion.club. Porfavor da click de abajo para completar la activación:<br><br><a href="http://localhost:5000/activate/' + user.temporarytoken + '">http://localhost:5000/activate/</a>'
					html: '<b>Hello <strong>' + user.name + '</strong>,<br><br> Usted a solicitado un reenvio del link de activacion de unidaddegestion.club. Porfavor da click de abajo para completar la activación:<br><br><a href="https://www.unidaddegestion.club/activate/' + user.temporarytoken + '">https://www.unidaddegestion.club/activate/</a>'
					};

					client.sendMail(email, function(err, info){
					    if (err ){
					      console.log(error);
					    }
					    else {
					      console.log('Mensaje enviado ' + info.response);
					    }	
					});
					res.json({ success: true, message: 'Link de activación fue enviado' + user.email + '!'});
				}
			});
	
		})
	});


	router.get('/resetusername/:email', function(req,res) {
		User.findOne({ email: req.params.email }).select('email name username').exec(function(err, user){
			if (err) {
				res.json ({ success : false , message: err });
			} else {
				if(!req.params.email) {
					res.json({ success: false, message : 'Email no llenado'});
				} else {
					if(!user) {
						res.json({ success : false, message: 'E-mail no encontrado'});
					} else {
						var email = {
						  from: 'Localhost Staff, staff@localhost.com',
						  to: user.email,
						  subject: 'unidaddegestion.club Peticion Username',
						  text: 'Hola' + user.name + ', Tu recientemente solicitaste tu username. Porfavor graba este en tus archivos.' + user.username,
						//local
						//html: '<b>Hello <strong>' + user.name + '</strong>,<br><br> Gracias por registrarte en unidaddegestion.club. Porfavor da click de abajo para completar la activación:<br><br><a href="http://localhost:5000/activate/' + user.temporarytoken + '">http://localhost:5000/activate/</a>'
						html: '<b>Hello <strong>' + user.name + '</strong>,<br><br> Tu recientemente solicitaste tu username. Porfavor graba este en tus archivos.' + user.username
						};

						client.sendMail(email, function(err, info){
						    if (err ){
						      console.log(error);
						    }
						    else {
						      console.log('Mensaje enviado ' + info.response);
						    }	
						});
						res.json({ success: true, message : 'Username ha sido enviado a tu e-mail'});
					}
				}
			}
		});
	});


	router.put('/resetpassword', function(req, res) {
		User.findOne( { username : req.body.username }).select('username active email resettoken name').exec(function(err, user) {
			if(err) throw err;
			if(!user) {
				res.json({ success: false, message: 'Username no encontrado'});
			} else if (!user.active) {
				res.json({ success: false, message: 'Account no ha sido todavia activada'}); 
			}else {
				user.resettoken = jwt.sign({ username: user.username, email: user.email}, secret, {expiresIn: '24h'});
				user.save(function(err) {
					if(err) {
						res.json({ success: false, message: err });
					} else {
						var email = {
						  from: 'Localhost Staff, staff@localhost.com',
						  to: user.email,
						  subject: 'unidaddegestion.club Solicitud de restablecer contraseña',
						  text: 'Hola' + user.name + ', Usted recientemente a solicitado un restablecimiento de ocntraseña. Porfavor click en el siguiente link para restablecer la contraseña. <br><br><a href="https://www.unidaddegestion.club/reset/' + user.resettoken,
						//local
						//html: '<b>Hello <strong>' + user.name + '</strong>,<br><br> Gracias por registrarte en unidaddegestion.club. Porfavor da click de abajo para completar la activación:<br><br><a href="http://localhost:5000/activate/' + user.temporarytoken + '">http://localhost:5000/activate/</a>'
					 		html: '<b>Hola <strong>' + user.name + '</strong>,<br><br> Usted recientemente a solicitado un restablecimiento de ocntraseña. Porfavor click en el siguiente link para restablecer la contraseña :<br><br><a href="https://www.unidaddegestion.club/reset/' + user.resettoken + '">https://www.unidaddegestion.club/reset/</a>'
						};

					client.sendMail(email, function(err, info){
					    if (err ){
					      console.log(error);
					    }
					    else {
					      console.log('Mensaje enviado ' + info.response);
					    }	
						});	
						res.json({ success: true, message : 'Porfavor chequea tu e-mail por el link de restablecer contraseña'});
					}
				});

			}
		});
	});

	router.get('/resetpassword/:token', function(req, res) {
		User.findOne({ resettoken : req.params.token }).select().exec(function(err, user) {
			if (err) throw err;
			var token = req.params.token;
			//funcion par averifaicacion del token 
			jwt.verify(token, secret, function(err, decoded){
				if(err){
					res.json({ success: false, message: 'Enlace contraseña ha expirado'});
				} else {
					if (!user) {
						res.json({ success: false, message: 'Enlace de restablecer contraseña ha expirado'}); 	
					} else {
						res.json({ success: true, user: user});
					}
					
				}
			});
		});
	});

	router.put('/savepassword', function(req, res) {
		User.findOne({username: req.body.username }).select('username email name password resettoken').exec(function(err, user) {
			if(err) throw err;
			if(req.body.password == null || req.body.password == "" ) {

				res.json ({ success : false , message : 'Contraseña no proveida'})	
				
			} else {
			
				user.password = req.body.password;
				user.resettoken = false;
				user.save(function(err) {
					if (err) {
						res.json( {success : false , message: err});
					} else {

						var email = {
						  from: 'Localhost Staff, staff@localhost.com',
						  to: user.email,
						  subject: 'unidaddegestion.club Rstablecer contraseña',
						  text: 'Hola' + user.name + ', Este correo es para notificar que tu contraseña fue recientemente restablecida unidaddegestion.club',
						//local
						//html: '<b>Hello <strong>' + user.name + '</strong>,<br><br> Gracias por registrarte en unidaddegestion.club. Porfavor da click de abajo para completar la activación:<br><br><a href="http://localhost:5000/activate/' + user.temporarytoken + '">http://localhost:5000/activate/</a>'
					 		html: '<b>Hola <strong>' + user.name + '</strong>,<br><br> Este correo es para notificar que tu contraseña fue recientemente restablecida unidaddegestion.club'
						};

					client.sendMail(email, function(err, info){
					    if (err ){
					      console.log(error);
					    }
					    else {
					      console.log('Mensaje enviado ' + info.response);
					    }	
						});	
						res.json ( {success: true, message: 'Contraseña ha sido restablecida'});
					}
				});

			}
		});
	});


	router.use(function(req, res, next) {
		var token = req.body.token || req.body.query || req.headers['x-access-token'];

		if(token){
			jwt.verify(token, secret, function(err, decoded){
				if(err){
					res.json({ success: false, message: 'Token invalid'});
				} else {
					req.decoded = decoded;
					next();
				}
			});
		} else {
			res.json({ success: false, message : 'No token provided'});
		}
	});

	// Route to get the currently logged in user
	router.post('/me', function(req,res){
		res.send(req.decoded);
	});

	router.get('/renewToken/:username', function(req, res){
		User.findOne({ username: req.params.username }).select().exec(function(err, user){
			if(err) throw err;
			if(!user) {
				res.json({ success: false, message : 'Usuario no encontrado'});
			} else {
				var newtoken = jwt.sign({ username: user.username, email: user.email}, secret, {expiresIn: '24h'});
				res.json({success: true, token: newtoken});
				
			}
		});
	});

	router.get('/permission', function(req , res) {
		User.findOne({ username: req.decoded.username }, function(err, user) {
			if (err) throw err;
			if (!user) {
				res.json({ success: false, message: 'Usuario no encontrado'});
			} else {
				res.json({ success: true, permission: user.permission });
			}
		});
	});

	router.get('/management', function(req, res){
		User.find({}, function(err, users){
			if(err) throw err;
			User.findOne({ username: req.decoded.username } , function( err, mainUser) {
				if(err) throw err;
				if(!mainUser) {
					res.json({ success: false, message: 'Usuario no encontrado'});
				} else {
					if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
						if (!users) {
							res.json ({ success : false , message: 'Usuarios no encontrados'})
						} else {
							res.json ({ success : true, users: users, permission : mainUser.permission});
						}
					} else {
						res.json({success : false, message : 'Permisos insuficientes'})
					}
				}
			});
		});
	});

	router.delete('/management/:username' , function (req, res){
		var deleteUser = req.params.username;
		User.findOne({ username: req.decoded.username }, function (err, mainUser) {
			if(err) throw err;
			if(!mainUser) {
				res.json({ success: false, message: 'Usuario no encontrado' });
			} else {
				if (mainUser.permission !== 'admin') {
					res.json({success : false, message : 'Permisos insuficientes'});
				} else {
					User.findOneAndRemove({ username: deleteUser }, function (err, user) {
						if(err) throw err;
						res.json({ success : true});
					});
				}
			}
		});
	});

	router.get('/edit/:id', function(req, res) {
		var editUser = req.params.id;
		editUser = editUser.replace(" " , "");
		User.findOne( { username: req.decoded.username }, function (err, mainUser){
			if (err) throw err;
			if (!mainUser) {
				res.json({ success: false, message : 'Usuario no encontrado'});
			} else {
				if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
					User.findOne({ _id : editUser}, function (err, user) {
						console.log(editUser);
						console.log(user);
						if (err) throw err;
						console.log(editUser);
						if (!user) {
							res.json({ success: false, message: 'Usuario no encontrado'});
						} else {

							res.json({ success: true, user : user })
						}
					});
				} else {
					res.json({ success: false, message : 'Permisos Insuficientes'});
				}
			}
		});
	});

	router.put('/edit', function(req, res) {
		var editUser = req.body._id;
		if (req.body.name) var newName = req.body.name;
		if (req.body.username) var newUsername = req.body.username;
		if (req.body.email) var newEmail = req.body.email;
		if (req.body.permission) var newPermission = req.body.permission;
		User.findOne( {username: req.decoded.username }, function( err, mainUser) {
			if (err) throw err;
			if (!mainUser) {
				res.json( { success: false, message: "usuario no encontrado"});
			} else {
				if (newName) {
					if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
						User.findOne({ _id: editUser}, function (err, user) {
							if (err) throw err;
							if (!user) {
								res.json({ success : false , message: 'Usuario no encontrado'});
							} else {
								user.name = newName;
								user.save( function (err) {
									if (err) {
										console.log(err);
									} else {
										res.json( { success: true, message: 'Nombre ha sido actualizado'});
									}
								});
							}
						});
					} else {
						res.json({success: false, message: 'Permisos insufiecientes'});
					}
				}
				if (newUsername) {
					if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
						User.findOne({ _id : editUser}, function( err, user ) {
							if (err) throw err;
							if (!user) {
								res.json({ success: false, message : 'Usurio no encontrado'});
							} else {
								user.username = newUsername;
								user.save(function(err) {
									if (err) {
										console.log(err);
									} else {
										res.json( { success: true, message: 'Nombre de Usuario ha sido actualizado'});
									}
								});
							}
						});
					} else {
						res.json( { success: false, message: 'Permisos Insuficientes'});
					}
				}
				if (newEmail) {
					if (mainUser.permission === 'admin' || mainUser.permission === 'moderator' ) {
						User.findOne({ _id : editUser}, function( err, user ) {
							if (err) throw err;
							if (!user) {
								res.json({ success: false, message : 'Usurio no encontrado'});
							} else {
								user.email = newEmail;
								user.save(function(err) {
									if (err) {
										console.log(err);
									} else {
										res.json( { success: true, message: 'Correo ha sido actualizado'});
									}
								});
							}
						});
					} else {
						res.json({ success : false, message : 'Permisos Insuficientes'})
					}
				}
				if (newPermission) {
					if(mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
						User.findOne({ _id : editUser}, function( err, user ) {
							console.log("estoy camiendo permisos")
							if (err) throw err;
							if (!user) {
								res.json({ success: false, message : 'Usurio no encontrado'});
							} else {
								if (newPermission === 'user') {
									if(user.permission === 'admin') {
										if(mainUser.permission !== 'admin') {
											res.json({success: false, message: 'Permisos Insuficientes. Usted debe ser un administrador para degradar otro administrador'});
										} else {
											user.permission = newPermission;
											user.save(function(err) {
												if (err) {
													console.log(err);
												} else {
													res.json({success: true, message: 'Permisos han sido actualizados'});
												}
											});
										}
									} else {
										user.permission = newPermission;
										user.save(function(err) {
											if (err) {
												console.log(err);
											} else {
												res.json({success : true, message: 'Permisos han sido actualizados'})
											}
										});
									}
								}
								if (newPermission === 'moderator') {
									if (user.permission === 'admin') {
										if(mainUser.permission !== 'admin') {
											res.json({ success: false, message: 'Permisos Insuficientes. Usted debe ser un administrador para degradar otro administrador'});
										} else {
											user.permission = newPermission;
											user.save(function(err) {
												if (err) {
													console.log(err);
												} else {
													res.json({success : true, message: 'Permisos han sido actualizados'})
												}
											});
										}
									} else {
										user.permission = newPermission;
										user.save(function(err) {
											if (err) {
												console.log(err);
											} else {
												res.json({success : true, message: 'Permisos han sido actualizados'});
											}
										});
									}
								}
								if (newPermission === 'admin') {
									if (mainUser.permission === 'admin' ) {
										user.permission = newPermission;
										user.save(function(err) {
											if (err) {
												console.log(err);
											} else {
												res.json({success : true, message: 'Permisos han sido actualizados'});
											}
										});
									} else {
										res.json({success: false, message: 'Permisos Insuficientes. Debe ser un administrador para actualizar a alguien al nivel de administrador '});
									}
								}

							}
						});
					} else {
						res.json({success: false, message: 'Permisos Insuficientes'});
					}
				}
			}
		});
	});

	return router;
}