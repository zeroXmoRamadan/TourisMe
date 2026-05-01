
import mongoose from 'mongoose';
const { Schema } = mongoose;

const bookingSchema = new Schema({
  touristId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  bookingDate: { type: Date, default: Date.now },
  serviceDate: { type: Date, required: true },
  numberOfPeople: { type: Number, default: 1 },
  totalPrice: { type: Number },
  specialRequests: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Cancelled'], 
    default: 'Pending' 
  }
}, { timestamps: true });


const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;