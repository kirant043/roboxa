var config = require('config');
var jwt = require('jsonwebtoken');

function generateAuthToken(obj) { 
  return token = jwt.sign(obj, config.get('jwtPrivateKey'));
}

exports.generateToken = generateAuthToken; 