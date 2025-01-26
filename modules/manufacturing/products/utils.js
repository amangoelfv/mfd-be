import Product from '../../../models/mfd_product.js';

// Function to add a trading product
export const addProduct = async (productData) => {
  try {
    const mfdProduct = new Product(productData);
    await mfdProduct.save();
    return mfdProduct;
  } catch (error) {
    throw new Error(error.message);
  }
};
export const updateProductRequirement = async (product_id, addQuantity) => {
  try {
    const product = await Product.findById(product_id);
    product.requirement = product.requirement + addQuantity >= 0 ? product.requirement + addQuantity : 0;
    await product.save();
    return product;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to view all trading products
export const viewProducts = async () => {
  try {
    const products = await Product.find().lean();
    return products;
  } catch (error) {
    throw new Error(error.message);
  }
};
// Function to view all trading products
export const viewProductCompanies = async () => {
  try {
    return await Product.find().lean().populate('companies');
  } catch (error) {
    throw new Error(error.message);
  }
};
