import express from 'express';
import uploadHandler from '../middlewares/uploadHandler.js';
import bcrypt from 'bcrypt';
import deleter from '../middlewares/tools/deleter.js';

const uploads = uploadHandler('./media/profiles');

const router = express.Router();

import Clients from '../models/clients.js';
import Shops from '../models/shops.js';
import jarse from '../middlewares/tools/jsonCheckParse.js';



router.post('/:type', uploads.single('profile'), async (req, res) => {

    //if req.file is undefined
    req.file = req.file ?? {filename: null};

    try {

        const type = req.params.type;
        let msg = '' , stat = 200;
        const imgSrc = './media/profiles';

        const item = await Clients.findOne({email: req.body.email}) || await Shops.findOne({email: req.body.email});

        if (item) {
            deleter(imgSrc, req.file.filename);
            return res.status(409).json({msg: 'This email is already taken'});
        }
        
        if (type === 'client') { // for signing new client up

            // hashing password:
            const password = await bcrypt.hash(req.body.password, 10);

            req.body.cart = jarse(req.body.cart) ?? [];
            req.body.favorites = jarse(req.body.favorites) ?? [];


            const client = await Clients.create({
                fullName: req.body.fullName,
                email: req.body.email.toLowerCase(),
                password: password,
                image: req.file.filename,
                cart: req.body.cart,
                favorites: req.body.favorites
            }).then(() => msg = 'Congrats! You signed up!').catch(err => {
                deleter(imgSrc, req.file.filename);
                stat = 500;
                msg = err.message;
            });
            
            return res.status(stat).json({msg: msg});

        } else if (type === 'shop') { // for signing new shop up

            //hashing password:
            const password = await bcrypt.hash(req.body.password, 10);

            const ratings = item.ratings;

            const shop = await Shops.create({
                fullName: req.body.fullName,
                description: req.body.description,
                keywords: jarse(req.body.keywords),
                email: req.body.email.toLowerCase(),
                password: password,
                logo: req.file.filename,
                website: req.body.website,
                ratings: ratings        
            }).then(() => msg = 'Congrats! you have opened a new Shop!')
            .catch(err => {
                deleter(imgSrc, req.file.filename);
                stat = 500;
                msg = err.message;
            });           

            return res.status(stat).json({msg: msg});

        } else {
            deleter(imgSrc, req.file.filename);
            return res.status(404).json({msg : 'Wrong End Point!'});

        }


    } catch (error) {

        deleter(imgSrc, req.file.filename);
        console.log(error);
        return res.status(500).json({msg: 'Server Internal Error'});
    }
});



export default router;