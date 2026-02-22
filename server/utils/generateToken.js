const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign(
    { 
      id, 
      role  // Include role in the token
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    }
  );
};

module.exports = generateToken;