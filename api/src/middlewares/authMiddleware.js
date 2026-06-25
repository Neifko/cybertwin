const { auth } = require("express-oauth2-jwt-bearer");

const checkJwt = auth({
  audience: "https://api.cybertwin.pme",
  issuerBaseURL: "https://dev-ton-domaine.auth0.com/",
  tokenSigningAlg: "RS256",
});

module.exports = { checkJwt };
