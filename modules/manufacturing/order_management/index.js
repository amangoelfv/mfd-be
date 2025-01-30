import express from 'express';
import Order from "../../../models/order.js";
import { authenticate } from '../../auth/apis.js';
import { updateProductRequirement } from '../products/utils.js';
import MfdCompany from '../../../models/mfd_company.js';
import { isValidObjectId } from 'mongoose';

const router = express.Router();

router.post('/create', authenticate(['plant_head']), async (req, res) => {
  try {
    const { products } = req.body;

    // Validate body
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Products are required' });
    }

    // Create order
    const newOrder = new Order({
      products: products.map((product) => ({
        product: product.product_id,
        quantity: product.quantity,
      })),
      plant_head: req.user.id, // Plant head is taken from authenticated user
    });

    const savedOrder = await newOrder.save(); // Save to database
    products.forEach(async (product) => {
      await updateProductRequirement(product.product_id, product.quantity)
    })
    res.status(201).json({ message: 'Order created successfully', order: savedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/createForProdurementHead', authenticate(['procurement_head']), async (req, res) => {
  try {
    const { products, orderId } = req.body;

    // Validate body
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Products are required' });
    }

    if (orderId) {
      const order = await Order.findById(orderId);
      order.products.forEach(async (product) => {
        await updateProductRequirement(product.product, product.quantity)
      })

      await Promise.all(products.map(async (product) => {
        if (!isValidObjectId(product.company) && typeof product.company === 'string') {
          const newCompany = await MfdCompany.create({
            name: product.company,
            isTemp: true
          })
          product.company = newCompany._id;
        }
      }))
      order.products = products.map((product) => ({
        product: product.product_id,
        quantity: product.quantity,
        company: product.company
      }))
      await order.save();
      products.forEach(async (product) => {
        await updateProductRequirement(product.product_id, -1 * product.quantity)
      })
      res.status(201).json({ message: 'Order created successfully', order, });
    } else {

      await Promise.all(products.map(async (product) => {
        if (!isValidObjectId(product.company) && typeof product.company === 'string') {
          const newCompany = await MfdCompany.create({
            name: product.company,
            isTemp: true
          })
          product.company = newCompany._id;
        }
      }))

      // Create order
      const newOrder = new Order({
        products: products.map((product) => ({
          product: product.product_id,
          quantity: product.quantity,
          company: product.company
        })),
        procurement_head: req.user.id, // Plant head is taken from authenticated user
      });

      const savedOrder = await newOrder.save(); // Save to database
      res.status(201).json({ message: 'Order created successfully', order: savedOrder });
    }
    products.forEach(async (product) => {
      await updateProductRequirement(product.product_id, -1 * product.quantity)
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/approveForCEO', authenticate(['ceo']), async (req, res) => {
  try {
    const { products, order_id, rejected } = req.body;

    // Validate body
    if (!order_id) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const order = await Order.findById(order_id);

    if (rejected) {
      order.status = 'rejected';
    } else {
      if (!products || !Array.isArray(products) || products.length === 0 || !order_id) {
        return res.status(400).json({ message: 'Order Products are required' });
      }

      order.approvedProducts = products;
      order.status = 'approved_with_changes';
    }
    await order.save();
    res.status(201).json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/plant_head', authenticate(['plant_head']), async (req, res) => {
  try {

    // fetch orders
    const orders = await Order.find({ plant_head: req.user.id }).sort({createdAt: -1}).populate('products.product') || [];
    res.status(201).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/procurement_head', authenticate(['procurement_head']), async (req, res) => {
  try {
    // fetch orders
    const orders = await Order
      .find({ procurement_head: req.user.id })
      .populate('approvedProducts.product approvedProducts.company products.product products.company')
      .sort({ createdAt: -1 })

      || [];
    const result = orders.map(order => {
      if(["approved_with_changes", "rejected"].includes(order.status)) {

      }
      else if (order.approvedProducts?.length === order.products?.length ) {
        order.status = "approved"
      } else if (order.status !== "rejected") {
        order.status = "pending"
      }
      return order;
    })

    const finalOrders = result.sort((a, b) => a.status - b.status);
    res.status(201).json(finalOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/ceo', authenticate(['ceo']), async (req, res) => {
  try {
    // fetch orders
    const orders = await Order
      .find({ procurement_head: { $exists: 1 } })
      .populate('approvedProducts.product approvedProducts.company products.product products.company procurement_head')
      .sort({ createdAt: -1 })

      || [];
    const result = orders.map(order => {
      if (order.status) return order;
      if (order.approvedProducts?.length === order.products?.length) {
        order.status = "approved"
      } else {
        order.status = "pending"
      }
      return order;
    })

    const finalOrders = result.sort((a, b) => a.status - b.status);
    res.status(201).json(finalOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/aggregatedOrderStatus', authenticate(['ceo', 'plant_head']), async (req, res) => {
  try {
    // fetch orders
    const { timeRange = 'all' } = req.query;
    let $gte = undefined;
    switch (timeRange) {
      case 'all':
        break;
      case 'today':
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        $gte = today;
        break;
      case 'week':
        const weekBeforeDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        weekBeforeDate.setUTCHours(0, 0, 0, 0);
        $gte = weekBeforeDate;
        break;
      default:
        break;
    }

    const conditionalTimeQuery = $gte ? { createdAt: { $gte } } : {}
    const conditionalAuthQuery = { procurement_head: { $exists: 1 } }

    let plantHeadOrders = [];
    if (req.user.role === 'plant_head') {
      plantHeadOrders = await Order
        .find({ plant_head: { $exists: 1 }, ...conditionalTimeQuery })
        .populate('products.product')
        || [];
    }
    const orders = await Order
      .find({ ...conditionalAuthQuery, ...conditionalTimeQuery })
      .populate('approvedProducts.product products.product')

      || [];

    const productStatusMap = {};
    orders.map(order => {
      order.products.map((prod) => {
        if (productStatusMap[prod?.product._id]) {
          productStatusMap[prod?.product._id].requestedQuantity += prod.quantity;
        } else {
          productStatusMap[prod?.product._id] = {
            plantHeadRequestedQuantity: 0,
            requestedQuantity: prod.quantity,
            approvedQuantity: 0,
            details: prod?.product
          }
        }
      })
      order.approvedProducts.map((prod) => {
        if (productStatusMap[prod?.product._id]) {
          productStatusMap[prod?.product._id].approvedQuantity += prod.quantity;
        }
      })
    })
    plantHeadOrders.map(order => {
      order.products.map((prod) => {
        if (productStatusMap[prod?.product._id]) {
          productStatusMap[prod?.product._id].plantHeadRequestedQuantity += prod.quantity;
        } else {
          productStatusMap[prod?.product._id] = {
            plantHeadRequestedQuantity: prod.quantity,
            requestedQuantity: 0,
            approvedQuantity: 0,
            details: prod?.product
          }
        }
      })
    })

    res.status(201).json(productStatusMap);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/:order_id', authenticate(['ceo']), async (req, res) => {
  try {
    // fetch order

    const order = await Order.findById(req.params.order_id).populate('approvedProducts.product approvedProducts.company products.product products.company procurement_head') || [];
    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
