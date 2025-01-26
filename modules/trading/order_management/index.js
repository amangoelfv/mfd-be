import express from 'express';
import TradingOrder from "../../../models/trading_order.js";
import { authenticate } from '../../auth/apis.js';

const router = express.Router();

router.post('/vehicleEntry', authenticate(['security_head']), async (req, res) => {

  try {
    const { date, time, vehicleImageUrl, vehicleNumber, weightSlipUrl, plant } = req.body;
    console.log(vehicleImageUrl);
    // Validate body
    if (!date || !time || !vehicleImageUrl || !vehicleNumber || !weightSlipUrl) {
      return res.status(400).json({ message: 'Details are missing' });
    }

    const dateTimeString = `${date}T${time}`;
    const entryTime = new Date(dateTimeString);

    if (isNaN(entryTime.getTime())) {
      return res.status(400).send({ error: "Invalid date or time format" });
    }

    // Create order
    const newOrder = new TradingOrder({
      security_head: req.user.id, // Securityhead is taken from authenticated user
      vehicleNumber,
      vehicleImage: vehicleImageUrl,
      fullLoadWeightImage: weightSlipUrl,
      entryTime,
      plant_head: plant ? plant : undefined
    });

    const savedOrder = await newOrder.save(); // Save to database
    res.status(201).json({ message: 'Order created successfully', order: savedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/vehicleExit', authenticate(['security_head']), async (req, res) => {
  try {
    const { orderId } = req.body;

    // Validate body
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is missing' });
    }
    const exitTime = new Date();

    // Create order
    await TradingOrder.findByIdAndUpdate(orderId, {
      exitTime,
      security_head_exit: req.user.id,
    });

    res.status(201).json({ message: 'Vehicle exited successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/updateQualityReport', authenticate(['plant_head']), async (req, res) => {
  try {
    const { orderId, type, value } = req.body;

    // Validate body
    if (!orderId || !type || !value) {
      return res.status(400).json({ message: 'Params are missing' });
    }

    // Update order
    await TradingOrder.findByIdAndUpdate(orderId, {
      qualityReportTime: new Date(),
      plant_head: req.user.id,
      qualityReport: {
        type,
        value
      },
    });

    res.status(201).json({ message: 'Quality Report Updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', authenticate(['security_head']), async (req, res) => {
  try {

    // fetch orders
    const orders = await TradingOrder.find({}).populate('security_head security_head_exit plant_head') || [];
    res.status(201).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/pending_vehicles', authenticate(['security_head']), async (req, res) => {
  try {

    // fetch orders
    const orders = await TradingOrder.find({
      security_head_exit: { $exists: 0 }
    }).populate('security_head plant_head').sort({ entryTime: -1, qualityReportTime: -1 }) || [];
    res.status(201).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/gate_entry', authenticate(['plant_head']), async (req, res) => {
  try {

    // fetch orders
    const orders = await TradingOrder.find({
      qualityReport: { $exists: 0 },
      plant_head: req.user.id
    }).populate('security_head') || [];
    res.status(201).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/gate_exit', authenticate(['plant_head']), async (req, res) => {
  try {

    // fetch orders
    const orders = await TradingOrder.find({
      qualityReport: { $exists: 1 }
    }).sort({ qualityReportTime: -1 }).populate('security_head plant_head security_head_exit') || [];
    res.status(201).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/completed_vehicles', authenticate(['security_head']), async (req, res) => {
  try {

    // fetch orders
    const orders = await TradingOrder.find({
      security_head_exit: { $exists: 1 }

    })
      .sort({ exitTime: -1 })
      .populate('security_head security_head_exit plant_head') || [];
    res.status(201).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:orderId', authenticate(['security_head']), async (req, res) => {
  try {
    const { orderId } = req.params;
    // fetch orders
    const order = await TradingOrder.findById(orderId).populate('security_head security_head_exit plant_head') || null;
    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
