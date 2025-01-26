import mongoose from 'mongoose';

const TradingOrderSchema = new mongoose.Schema({
  // products: [
  //   {
  //     product: { type: mongoose.Schema.Types.ObjectId, ref: 'ManufacturingProduct' },
  //     quantity: { type: mongoose.Schema.Types.Number },
  //     company:  { type: mongoose.Schema.Types.ObjectId, ref: 'ManufacturingCompany' },
  //   }
  // ],
  // approvedProducts: [
  //   {
  //     product: { type: mongoose.Schema.Types.ObjectId, ref: 'ManufacturingProduct' },
  //     quantity: { type: mongoose.Schema.Types.Number },
  //     company:  { type: mongoose.Schema.Types.ObjectId, ref: 'ManufacturingCompany' },
  //   }
  // ],
  security_head: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  security_head_exit: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  plant_head: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  qualityReport: {
    type: { type: String },
    value: { type: String },
  },
  qualityReportTime: { type: Date },
  vehicleImage: { type: String },
  fullLoadWeightImage: { type: String },
  entryTime: { type: Date },
  exitTime: { type: Date },
  vehicleNumber: { type: String },
}, {
  timestamps: true
});

const TradingOrder = mongoose.model('TradingOrder', TradingOrderSchema);

export default TradingOrder;
