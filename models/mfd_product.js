import mongoose from 'mongoose';

const MfdProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  customCompanyDisabled: { type: Boolean, default: false},
  requirement:  { type: Number, default: 0},
  companies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ManufacturingCompany' }]
});

const MfdProduct = mongoose.model('ManufacturingProduct', MfdProductSchema);

export default MfdProduct;
