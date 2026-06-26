const CompanyRepository = require("../repositories/companyRepository");

class CompanyService {
  async getCompanies(userId) {
    return await CompanyRepository.findAllByUserId(userId);
  }

  async getCompany(userId) {
    return await CompanyRepository.findByUserId(userId);
  }

  async getCompanyById(id, userId) {
    return await CompanyRepository.findByIdAndUserId(id, userId);
  }

  async createCompany(data, userId) {
    if (!data.name || !data.sector) {
      throw new Error("Le nom et le secteur sont obligatoires.");
    }
    return await CompanyRepository.create(data, userId);
  }

  async updateCompany(id, data, userId) {
    const company = await CompanyRepository.findByIdAndUserId(id, userId);
    if (!company) return false;
    return await CompanyRepository.update(id, data, userId);
  }

  async deleteCompany(id, userId) {
    return await CompanyRepository.delete(id, userId);
  }
}

module.exports = new CompanyService();
