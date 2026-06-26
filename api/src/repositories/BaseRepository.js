const db = require("../config/database");

class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async findAllByUserId(userId) {
    const [rows] = await db.query(
      `SELECT * FROM ${this.tableName} WHERE user_id = ?`,
      [userId],
    );
    return rows;
  }

  async findByIdAndUserId(id, userId) {
    const [rows] = await db.query(
      `SELECT * FROM ${this.tableName} WHERE id = ? AND user_id = ?`,
      [id, userId],
    );
    return rows[0];
  }

  async delete(id, userId) {
    const [result] = await db.query(
      `DELETE FROM ${this.tableName} WHERE id = ? AND user_id = ?`,
      [id, userId],
    );
    return result.affectedRows > 0;
  }
}

module.exports = BaseRepository;
