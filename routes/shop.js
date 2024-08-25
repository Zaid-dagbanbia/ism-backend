import express from 'express';
const router = express.Router();
import auth from '../middlewares/authentication.js';
import uploadHandler from '../middlewares/uploadHandler.js'
import Product from '../models/products.js';
import deleter from '../middlewares/tools/deleter.js';
import idCheck from '../middlewares/tools/idCheck.js';
import jarse from '../middlewares/tools/jsonCheckParse.js';
import { boolParse } from '../middlewares/tools/textTools.js';
import Shops from '../models/shops.js';
import tokex from '../middlewares/tokenExtractor.js';
import parser from '../middlewares/formDataParser.js';
import bcrypt from 'bcrypt';
import Clients from '../models/clients.js';

const upload = uploadHandler('./media/profiles');

// medial address for Product Images:
const imgSrc = './media/profiles';

// Routes + Controllers : *************************************************************************************************************************



// Listing shop product for everyone!:
router.get('/products/:shopid', async (req, res) => {
    try {
        // Example Qurey: http://host/shops/prdocts/?sortBy=createdAt&sortDirection=asc&currentPage=1&limit=75

        const shopid = req.params.shopid;
        // checing shop id
        if (!idCheck(shopid)) {return res.status(400).json({msg: 'Wrong Shop Id'})}

        const shop = await Shops.findOne({_id: shopid, isActive:true});

        if (!shop) {return res.status(404).json({msg: 'The shop is not in bussiness!'})}

        const {limit = 70 , currentPage = 1, sortDirection = 'desc', sortBy = 'createdAt'} = req.query;
        const skip = (Number(currentPage) - 1) * Number(limit) ;
        const query = Product.find({shop: shopid, isActive: true, isDeleted: false}, {isActive: false, isDeleted: false});
    
        query.sort({[sortBy] : sortDirection}).skip(skip).limit(Number(limit));

        const products = await query.exec();

        return res.status(200).json(products);

    } catch (error) {
        console.log(error);
        const msg = 'Server Error during listing the products';
        return res.status(500).json({msg});
    }    
});



// Listing shop product for shop owner!:
router.get('/myshop/', auth, async (req, res) => {
    try {
        // Example Qurey: http://host/shops/myshop/?isActive=true&isDeleted=true&sortBy=createdAt&sortDirection=asc&currentPage=1&limit=75

        const shopid = req.body.decoded.id;

        const isActive = req.query.isActive === undefined ? true : boolParse(req.query.isActive);
        const isDeleted = req.query.isDeleted === undefined ? false : boolParse(req.query.isDeleted);

        const {limit = 70 , currentPage = 1, sortDirection = 'desc', sortBy = 'createdAt'} = req.query;
        const skip = (Number(currentPage) - 1) * Number(limit) ;
        const query = Product.find({shop: shopid, isDeleted: isDeleted, isActive: isActive});
    
        query.sort({[sortBy] : sortDirection}).skip(skip).limit(Number(limit));

        const products = await query.exec();
        const shop = await Shops.findOne({_id: shopid});

        return res.status(200).json({myShop: shop , products});

    } catch (error) {
        console.log(error);
        const msg = 'Server Error during listing the products';
        return res.status(500).json({msg});
    }    
});


//updating my shop details
router.patch('/myshop', auth, upload.single('profile'), tokex, async (req, res) => {

    let profile = req.file && req.file.filename ? req.file.filename : '' ;

    try {
        const id = req.body.decoded.id && req.body.decoded.isShop ? req.body.decoded.id : false;

        if (!id) {
            deleter(imgSrc, profile);
            return res.status(401).json({msg: 'You are a shop owner!'});
        }


        const shop = await Shops.findOne({_id: id});

        const keywords = req.body.keywords === undefined ? shop.keywords : jarse(req.body.keywords);
        const logo = profile ? profile : shop.logo;
        const phones = req.body.phones === undefined ? shop.phones : jarse(req.body.phones);
        const address = req.body.address === undefined ? shop.address : jarse(req.body.address);
        const isActive = shop.isActive ;
        const password = shop.password;
        
        await Shops.findOneAndUpdate({_id: id}, {
            ...req.body,
            keywords,
            logo,
            phones,
            address,
            isActive,
            password
        });
        
        if (logo != shop.logo) { deleter(imgSrc, shop.logo)}

        return res.status(200).json({msg: 'Shop detail was updated!'});

    } catch (error) {
        deleter(imgSrc, profile);
        console.log(error);
        return res.status(500).json({msg: 'Server Error!'});
    }
});

//changing password
router.patch('/myshop/changepassword', parser, auth, async (req, res) => {

    let profile = req.file && req.file.filename ? req.file.filename : '' ;

    try {
        const id = req.body.decoded.id && req.body.decoded.isShop ? req.body.decoded.id : false;

        if (!id) {
            deleter(imgSrc, profile);
            return res.status(401).json({msg: 'You are a shop owner!'});
        }


        const shop = await Shops.findOne({_id: id}, {password: true});


        const isMatched = bcrypt.compare(req.body.password, shop.password);

        if (isMatched) {

            const newPassword = bcrypt.hash(req.body.newPassword, 10);
            
            await Clients.findOneAndUpdate({_id: id}, {password: newPassword});
            

        } else {
            return res.status(401).json({msg: 'Wrong Password!'});
        }



        return res.status(200).json({msg: 'Password was updated!'});

    } catch (error) {
        deleter(imgSrc, profile);
        console.log(error);
        return res.status(500).json({msg: 'Server Error!'});
    }
});

export default router;