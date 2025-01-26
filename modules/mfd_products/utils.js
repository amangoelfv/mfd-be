import TradingProduct from '../../../models/mfd_product.js';

// Function to add a trading product
export const addTradingProduct = async (productData) => {
  try {
    const tradingProduct = new TradingProduct(productData);
    await tradingProduct.save();
    return tradingProduct;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to view all trading products
export const viewTradingProducts = async () => {
  try {
    const products = await TradingProduct.find();
    return products;
  } catch (error) {
    throw new Error(error.message);
  }
};
