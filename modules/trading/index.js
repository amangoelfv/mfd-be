import express from 'express';
import OrdersRouter from './order_management/index.js';

const router = express.Router();

router.use('/order', OrdersRouter)

export default router;
