const UserService = require("../services/userService");

const resolveLocalUser = async (req, res, next) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const accessToken = req.headers.authorization;

    const user = await UserService.getOrSyncUser(auth0Id, accessToken);

    req.user = user;

    next();
  } catch (error) {
    console.error("Erreur de résolution utilisateur:", error);
    res.status(500).json({ message: "Erreur d'authentification interne" });
  }
};

module.exports = { resolveLocalUser };
