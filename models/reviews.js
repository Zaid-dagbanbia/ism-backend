import { model, Schema } from "mongoose";

const reviewSchema = new Schema({
    product: {type: Schema.Types.ObjectId, ref: 'products', required: true, unique: true},
    reviewer: {type: Schema.Types.ObjectId, ref: 'clients', required: true},
    star: {type: Number, min: 1, max: 5},
    comment: {type: String}
}, {timestamps: true});

const Reviews = model('reviews', reviewSchema);
export default Reviews;