import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  subject: { type: String, required: true },
  message: {type: String,required:true}
});

export default mongoose.model('Problem', problemSchema);
