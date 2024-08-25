import jwt from 'jsonwebtoken';
import clog from './tools/consoleLog.js';

const key = process.env.SERVER_SECRET;


const authentication = function(req, res, next) {
    try {
        const token = req.cookies.token;
        const decoded = jwt.verify(token, key);
        req.body.decoded = decoded;

        next();
    } catch (error) {
        clog(error);
        return res.status(401).json({msg: 'Unauthorized!'});
    }


}

export default authentication;