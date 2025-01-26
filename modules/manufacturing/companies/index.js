import express from 'express';
import { addCompany, viewCompanies } from './utils.js';

const router = express.Router();

// Route to add a trading company
router.post('/', async (req, res) => {
  try {
    const company = await addCompany(req.body);
    res.status(201).json(company);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Route to view all trading companies
router.get('/', async (req, res) => {
  try {
    const companies = await viewCompanies();
    res.status(200).json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
