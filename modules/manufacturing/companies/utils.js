import MfdCompany from "../../../models/mfd_company.js";

// Function to add a new Mfd company
export const addCompany = async (companyData) => {
  try {
    const company = new MfdCompany(companyData);
    await company.save();
    return company;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to view all Mfd companies
export const viewCompanies = async () => {
  try {
    const companies = await MfdCompany.find().lean();
    return companies;
  } catch (error) {
    throw new Error(error.message);
  }
};
