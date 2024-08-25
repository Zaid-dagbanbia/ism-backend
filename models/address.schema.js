import { Schema } from "mongoose";

const address = new Schema({
    streetName: {type: String},
    houseNumber: {type: Number, min: [1, 'The house number must be greater than 0!']},
    postalCode: {type: Number, min: [10000, 'the postal code must be greater than 10000!'], max : [99999, 'the postal code must be less than 99999!']},
    venue: {type: String}
});

export default address;