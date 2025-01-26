import mongoose from 'mongoose';

const MfdCompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  isTemp: {type: Boolean, default: false}
});

const MfdCompany = mongoose.model('ManufacturingCompany', MfdCompanySchema);

export default MfdCompany;
