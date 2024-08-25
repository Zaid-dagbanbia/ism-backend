import { model, Schema } from "mongoose";
import validator from "validator";
import address from './address.schema.js';
import cartItem from './cart.schema.js'


const clientSchema = new Schema({
    fullName: {type: String, required: [true, 'Full Name is required']},
    image: {type: String},
    email: {type: String, required: [true, 'Email is required'], validate: [validator.isEmail, 'Email is not valid']},
    password: {type: String, required: [true, 'Password is required']},
    address: address,
    isActive: {type: Boolean, default: true},
    cart: [{type: cartItem}],
    favorites: [{type: Schema.Types.ObjectId, ref: 'products'}]
}, {timestamps: true});

const Clients = model('clients', clientSchema);

export default Clients;