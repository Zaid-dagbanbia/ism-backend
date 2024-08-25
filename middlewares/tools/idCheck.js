import { Types } from "mongoose"

const idCheck = function(id) {
    return Types.ObjectId.isValid(id);
}

export default idCheck;