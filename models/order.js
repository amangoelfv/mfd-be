import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'ManufacturingProduct' },
      quantity: { type: mongoose.Schema.Types.Number },
      company:  { type: mongoose.Schema.Types.ObjectId, ref: 'ManufacturingCompany' },
    }
  ],
  approvedProducts: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'ManufacturingProduct' },
      quantity: { type: mongoose.Schema.Types.Number },
      company:  { type: mongoose.Schema.Types.ObjectId, ref: 'ManufacturingCompany' },
    }
  ],
  plant_head: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  procurement_head: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {type: String}
}, {
  timestamps: true
});

const Order = mongoose.model('Order', OrderSchema);

export default Order;
