const { auth } = require("express-oauth2-jwt-bearer");

const checkJwt = auth({
  audience: "https://api.cybertwin.pme",
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: "RS256",
});

module.exports = { checkJwt };
