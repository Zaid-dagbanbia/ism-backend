import { Schema } from "mongoose";

const cartItemSchema = new Schema({
    item: {type: Schema.Types.ObjectId, ref: 'products', required: true},
    quantity: {type: Number, min: 1}
});

export default cartItemSchema;