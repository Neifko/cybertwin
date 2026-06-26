const UserRepository = require("../repositories/userRepository");

class UserService {
  async getOrSyncUser(auth0Id, accessToken) {
    let user = await UserRepository.findByAuth0Id(auth0Id);

    if (user) {
      return user;
    }

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

    const newUserId = await UserRepository.createFromAuth0Profile(
      auth0Id,
      auth0Profile,
    );

    return {
      id: newUserId,
      auth0_id: auth0Id,
      email: auth0Profile.email,
    };
  }
}

module.exports = new UserService();
