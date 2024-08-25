import express from 'express';
import Clients from '../models/clients.js';
import Shops from '../models/shops.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import parser from '../middlewares/formDataParser.js';

const router = express.Router();

router.post('/', parser,  async (req, res) => {
    try {
        const email = req.body.email.toLowerCase();
        const password = req.body.password ;

        const user = await Clients.findOne({email: email, isActive: true}) || await Shops.findOne({email: email, isActive: true});

        if (!user) {
            return res.status(404).json({msg: 'Account not Found!'});
        }


        const isMatched = await bcrypt.compare(password, user.password);


        if (isMatched) {
            // General part:
            const isShop = user.description ? true : false ;
            const payload = {id: user._id, isShop};
            const tokenAge = 30 * 24 * 3600 * 1000;


            const token = jwt.sign(payload, process.env.SERVER_SECRET, {expiresIn: tokenAge});

            res.status(200).cookie('token', token, {httpOnly: true, maxAge: tokenAge});
            return res.status(200).json({isLoggedIn: true});
            // end of General part
        } else {
            return res.status(401).json({msg: 'Wrong Password!'});
        }


    } catch (error) {
        return res.status(500).json({msg: 'Server Internal Error!'});
    }
});

export default router;