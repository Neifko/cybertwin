const BaseRepository = require("./BaseRepository");
const db = require("../config/database");

class UserRepository extends BaseRepository {
  constructor() {
    super("users");
  }

  async findByAuth0Id(auth0Id) {
    const [rows] = await db.query(
      `SELECT * FROM ${this.tableName} WHERE auth0_id = ?`,
      [auth0Id],
    );
    return rows[0]; // Retourne l'utilisateur ou undefined
  }

  async createFromAuth0Profile(auth0Id, profile) {
    const [result] = await db.query(
      `INSERT INTO ${this.tableName} (auth0_id, email, email_verified, first_name, last_name, nickname, picture_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        auth0Id,
        profile.email,
        profile.email_verified || false,
        profile.given_name || null,
        profile.family_name || null,
        profile.nickname || null,
        profile.picture || null,
      ],
    );

    return result.insertId;
  }
}

module.exports = new UserRepository();
