import express from 'express';
import { addProduct, viewProducts } from './utils.js';

const router = express.Router();

// Route to add a product
router.post('/', async (req, res) => {
  try {
    const product = await addProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Route to view all products
router.get('/', async (req, res) => {
  try {
    const products = await viewProducts();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;


