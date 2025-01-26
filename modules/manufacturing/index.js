import express from 'express';
import CompaniesRouter from './companies/index.js';
import ProductsRouter from './products/index.js';
import OrdersRouter from './order_management/index.js';
import {getOrderDetails} from './order_management/utils.js';
import { viewProductCompanies } from './products/utils.js';
import User from '../../models/user.js';

const router = express.Router();

// Route to add a trading company
router.get('/productCompanies', async (req, res) => {
  try {
    console.log(req.query.orderId);
    const productCompanies = await viewProductCompanies();
    if(req.query.orderId) {
      const orderDetails = await getOrderDetails(req.query.orderId);
      const defaults = {};
      
      orderDetails.products.forEach((product) => {
        defaults[product.product._id] = {
          quantity: product.quantity,
          company: product?.company?._id,
          companyDetails: product?.company?.toJSON(),
        }
      })

      productCompanies.forEach((product) => {
        const companyDefaults = defaults[product._id]
        if(companyDefaults) {
          product.defaults = companyDefaults;
          if(companyDefaults.companyDetails && product.companies.findIndex((company) => company._id.equals(companyDefaults.company)) === -1) {
            product.companies.unshift(companyDefaults.companyDetails);
          }
        }
      })
    }
    // console.log(productCompanies);
    res.status(201).json({productCompanies});
  } catch (err) {
    console.log(err.message)
    res.status(400).json({ error: err.message });
  }
});


router.get('/plantsList', async (req, res) => {
  try {
    const plantHeads = await User.find({role: 'plant_head'}).select('name plant _id')
    res.status(201).json(plantHeads);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.use('/companies', CompaniesRouter)
router.use('/products', ProductsRouter)
router.use('/order', OrdersRouter)



export default router;
