import { model, Schema } from "mongoose";

const productSchema = new Schema({
    name: {type: String, required: [true, "The name for prodcut is mandatory"]},
    description: {type: String, required: [true, "Description for product is mandatory"]},
    catagory: {type: String},
    subCatagory: [{type: String}],
    shop: {type: Schema.Types.ObjectId, ref: 'shops'},
    brand: {type: String},
    images: [{type: String}],
    stockCode: {type: String},
    quantity: {type: Number},
    price: {type: Number},
    details: {type: Schema.Types.Mixed, default: {}},
    ratings: {type: Number}, // That must be tested
    numberOfReviews: {type: Number},
    isDeleted: {type: Boolean, default: false},
    isActive: {type: Boolean, default: true}
}, {timestamps: true});

// Full text search features:
productSchema.index({name: 'text', description: 'text', brand: 'text', catagory: 'text', subCatagory: 'text', details: 'text'});


const Products  = model('products', productSchema);
export default Products;
