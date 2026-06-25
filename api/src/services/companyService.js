const CompanyRepository = require("../repositories/companyRepository");

class CompanyService {
  async getCompany(userId) {
    return await CompanyRepository.findByUserId(userId);
  }

  async saveCompany(data, userId) {
    const existingCompany = await this.getCompany(userId);

    if (existingCompany) {
      await CompanyRepository.update(existingCompany.id, data, userId);
      return existingCompany.id;
    } else {
      return await CompanyRepository.create(data, userId);
    }
  }
}

module.exports = new CompanyService();
