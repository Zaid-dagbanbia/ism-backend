import { model, Schema } from "mongoose";
import validator from "validator";
import address from './address.schema.js';


const shopSchema = new Schema({
    fullName: {type: String, required: [true, 'Full Name is required']},
    description: {type: String, required: [true, 'Shop Description is required']},
    keywords: [{type: String}],
    email: {type: String, required: [true, 'Email is required'], validate: [validator.isEmail, 'Email is not valid']},
    password: {type: String, required: [true, 'Password is required']},
    logo: {type: String},
    website: {type: String},
    phones: [{type: String}],
    address: address,
    isActive: {type: Boolean, default: true},
    ratings: {type: Number, min: 1 , max: 5}
}, {timestamps: true});

shopSchema.index({fullName: 'text', description: 'text', keywords: 'text'}, {});

const Shops = model('shops', shopSchema);

export default Shops;