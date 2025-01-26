import TradingCompany from '../../models/trading_company.js';

// Function to add a new trading company
export const addTradingCompany = async (companyData) => {
  try {
    const tradingCompany = new TradingCompany(companyData);
    await tradingCompany.save();
    return tradingCompany;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to view all trading companies
export const viewTradingCompanies = async () => {
  try {
    // Populate the trading_products field to fetch related product details
    const companies = await TradingCompany.find().populate('trading_products');
    return companies;
  } catch (error) {
    throw new Error(error.message);
  }
};
