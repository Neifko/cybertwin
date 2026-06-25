const BaseRepository = require("./BaseRepository");
const db = require("../config/database");

class CompanyRepository extends BaseRepository {
  constructor() {
    super("companies");
  }

  async findByUserId(userId) {
    const [rows] = await db.query(
      `SELECT * FROM ${this.tableName} WHERE user_id = ?`,
      [userId],
    );
    return rows[0];
  }

  async create(data, userId) {
    const {
      name,
      sector,
      employees_count,
      servers_count,
      workstations_count,
      exposed_services,
    } = data;
    const [result] = await db.query(
      `INSERT INTO ${this.tableName} (user_id, name, sector, employees_count, servers_count, workstations_count, exposed_services) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name,
        sector,
        employees_count || 1,
        servers_count || 0,
        workstations_count || 0,
        exposed_services || "",
      ],
    );
    return result.insertId;
  }

  async update(id, data, userId) {
    const {
      name,
      sector,
      employees_count,
      servers_count,
      workstations_count,
      exposed_services,
    } = data;
    const [result] = await db.query(
      `UPDATE ${this.tableName} 
       SET name = ?, sector = ?, employees_count = ?, servers_count = ?, workstations_count = ?, exposed_services = ? 
       WHERE id = ? AND user_id = ?`,
      [
        name,
        sector,
        employees_count,
        servers_count,
        workstations_count,
        exposed_services,
        id,
        userId,
      ],
    );
    return result.affectedRows > 0;
  }
}

module.exports = new CompanyRepository();
