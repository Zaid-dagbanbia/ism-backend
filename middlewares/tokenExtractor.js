import jwt from 'jsonwebtoken';

const key = process.env.SERVER_SECRET;


const tokex = function(req, res, next) {
    try {
        const token = req.cookies.token;
        const decoded = jwt.verify(token, key);
        req.body.decoded = decoded;

        next();
        
    } catch (error) {

        req.body.decoded = undefined;

        next();
    }


}

export default tokex;