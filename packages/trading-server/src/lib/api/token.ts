const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

function getToken() {
  const payload = {
    access_key: process.env.UPBIT_API_KEY,
    nonce: uuidv4(),
  };

  const jwtToken = jwt.sign(payload, process.env.UPBIT_API_SECRET);
  const authorizationToken = `Bearer ${jwtToken}`;
  return authorizationToken;
}

module.exports = {
  getToken
}