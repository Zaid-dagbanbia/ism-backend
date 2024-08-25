import { model, Schema } from "mongoose";

// to be used by admin

const catagorySchema = new Schema({
    catagory: {type: String, unique: true, required: [true, 'you Have to set a catagory']},
    subCatagories: [{type: String}]
}, {timestamps: true});

// full text search features:
catagorySchema.index({catagory: 'text', subCatagories: 'text'});

const Catagories = model('catagories', catagorySchema);

export default Catagories;