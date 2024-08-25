import express from 'express';
const router = express.Router();
import auth from '../middlewares/authentication.js';
import uploadHandler from '../middlewares/uploadHandler.js';
import tokex from '../middlewares/tokenExtractor.js';
const imgSrc = './media/profiles';
const upload = uploadHandler(imgSrc);
import respond from '../middlewares/tools/httpRes.js';
import clog from '../middlewares/tools/consoleLog.js'
import bcrypt from 'bcrypt';

import Clients from '../models/clients.js';
import parser from '../middlewares/formDataParser.js';


// not Tested: ******************************************

router.get('/', auth, async (req, res) => {
    try {

        const id = req.body.encoded.id;

        const user = await Clients.findOne({_id: id, isActive: true}, {isActive: false, password: false});

        if (!user) {
            return res.status(404).json({msg: 'User not found!'});
        }

        return res.status(200).json(user);
        
    } catch (error) {
        clog(error);
        return res.status(500).json({msg: 'Server Error!'});
    }
});



// updating user
router.patch('/', auth, upload.single('profile'), tokex, async (req, res) => {

    // check if file is not uploaded than defines req.file in order to avoid conflict;
    req.file = req.file ?? {fieldname: null};
    try {

        const id = req.body.encoded.id;

        const user = await Clients.findOne({_id: id, isActive: true}, {isActive: false});

        if (!user) {
            return res.status(404).json({msg: 'User not found!'});
        }

        // checking and correcting inputs:
        const password = user.password;

        await Clients.findOneAndUpdate({_id: id}, {...req.body, password: password});
        
        
    } catch (error) {
        clog(error);
        return res.status(500).json({msg: 'Server Error!'});
    }
});


router.patch('/changepassword', parser, auth, async (req, res) => {
     try {

        const id = req.body.decoded.id;

        const user = await Clients.findOne({_id: id, isActive: true});

        if (!user) {
            return respond(res, 404, 'User not Found!');
        }

        const isMatch = bcrypt.compareSync(req.body.password, user.password);

        if(!isMatch) { return respond(res, 401, 'Wrong Password')}

        const password = bcrypt.hashSync(req.body.newPassword, 10);

        await Clients.findOneAndUpdate({_id: id}, {password: password});

        return respond(res, 200);
        
     } catch (error) {
        clog(error);
        return respond(res, 500);
     }
});



export default router;