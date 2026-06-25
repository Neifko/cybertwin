const UserRepository = require("../repositories/userRepository");

class UserService {
  async getOrSyncUser(auth0Id, accessToken) {
    // 1. On cherche l'utilisateur dans la base de données
    let user = await UserRepository.findByAuth0Id(auth0Id);

    // 2. S'il existe, on le retourne directement
    if (user) {
      return user;
    }

    // 3. S'il n'existe pas, on récupère son profil via l'API Auth0
    const auth0Response = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/userinfo`,
      {
        method: "GET",
        headers: {
          Authorization: accessToken,
        },
      },
    );

    if (!auth0Response.ok) {
      throw new Error("Impossible de récupérer le profil Auth0");
    }

    const auth0Profile = await auth0Response.json();

    // 4. On crée l'utilisateur en base de données
    const newUserId = await UserRepository.createFromAuth0Profile(
      auth0Id,
      auth0Profile,
    );

    // 5. On retourne l'objet utilisateur formaté
    return {
      id: newUserId,
      auth0_id: auth0Id,
      email: auth0Profile.email,
    };
  }
}

module.exports = new UserService();
