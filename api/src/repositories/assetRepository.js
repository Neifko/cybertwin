const BaseRepository = require("./BaseRepository");
const db = require("../config/database");

class AssetRepository extends BaseRepository {
  constructor() {
    super("assets");
  }

  async findAllByUserId(userId) {
    const [rows] = await db.query(
      `SELECT a.*, c.name as company_name 
       FROM assets a 
       JOIN companies c ON a.company_id = c.id 
       WHERE c.user_id = ?`,
      [userId],
    );
    return rows;
  }

  async create(data, userId) {
    const { company_id, name, type, description, is_exposed } = data;

    const [companies] = await db.query(
      "SELECT id FROM companies WHERE id = ? AND user_id = ?",
      [company_id, userId],
    );
    if (companies.length === 0) {
      throw new Error(
        "L'entreprise spécifiée n'existe pas ou ne vous appartient pas.",
      );
    }

    const [result] = await db.query(
      `INSERT INTO assets (company_id, name, type, description, is_exposed) VALUES (?, ?, ?, ?, ?)`,
      [company_id, name, type, description, is_exposed || 0],
    );
    return result.insertId;
  }

  async update(id, data, userId) {
    const { name, type, description, is_exposed } = data;

    const [result] = await db.query(
      `UPDATE assets a
       JOIN companies c ON a.company_id = c.id
       SET a.name = ?, a.type = ?, a.description = ?, a.is_exposed = ?
       WHERE a.id = ? AND c.user_id = ?`,
      [name, type, description, is_exposed || 0, id, userId],
    );
    return result.affectedRows > 0;
  }
}

module.exports = new AssetRepository();
