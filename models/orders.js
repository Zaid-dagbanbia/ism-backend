import { model, Schema } from "mongoose";
import address from "./address.schema.js";

const orderSchema = new Schema({
    itemes: [{type: Schema.Types.Mixed, required: true}],
    totalAmount: {type: Number , required: true},
    orderBy: {type: Schema.Types.ObjectId, ref: 'clients', required: true},
    deliverAddress: {type: address, required: true},
    isPaid: {type: Boolean, default: false},
    isShipped: {type: Boolean, default: false},
    isDelivered: {type: Boolean, default: false},
    isClosed: {type: Boolean, default: false},
    closingDate: {type: Date},
    isDeleted: {type: Boolean, default: false}
}, {timestamps: true});

const Orders = model('orders', orderSchema);
export default Orders;