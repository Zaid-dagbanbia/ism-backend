import express from 'express';
const router = express.Router();
import auth from '../middlewares/authentication.js';
import uploadHandler from '../middlewares/uploadHandler.js'
import Product from '../models/products.js';
import Reviews from '../models/reviews.js';
import deleter from '../middlewares/tools/deleter.js';
import idCheck from '../middlewares/tools/idCheck.js';
import jarse from '../middlewares/tools/jsonCheckParse.js';
import parser from '../middlewares/formDataParser.js';
import tokex from '../middlewares/tokenExtractor.js'
import Orders from '../models/orders.js';
import respond from '../middlewares/tools/httpRes.js'
import clog from '../middlewares/tools/consoleLog.js';

const upload = uploadHandler('./media/products');

// medial address for Product Images:
const imgSrc = './media/products';


// Routes + Controllers : *************************************************************************************************************************

// Getting route
router.get('/:productid', parser, async (req, res) => {
    try {
        const id = req.params.productid;

        if (!idCheck(id)) { clog(id); return res.status(400).json({msg: 'Wrong product Id!'})}

        const product = await Product.findOne({_id: id});

        if (!product) { return res.status(404).json({msg: 'Not found!'})}

        return respond(res, 200, null, product);


    } catch (error) {
        clog(error);
        return respond(res, 500);
    }
});



// Creating a new product!
router.put('/new',auth, upload.array('images'), tokex, async (req, res) => {

        // uploaded images Names:
        req.files = req.files ?? [];
        const images = req.files.map(item => item.filename);

    try {

        // default msg and status code:
        let msg = "Product Added" , stat = 200;

        //Checking if requester is a shop:
        if (!req.body.decoded.isShop) {
            deleter(imgSrc, ...images);
            return respond(res, 401, 'You are not a vendor!');
        }


        //if details are in string format they must be changed intor json Object:
        req.body.details = req.body.details ?? {}; // {color: 'red'; expirDate: ''}
        const details = jarse(req.body.details);

        

        const prodcut = await Product.create({
            name: req.body.name,
            description: req.body.description,
            catagory: req.body.catagory,
            subCatagory: req.body.subCatagory, // this an array of strings
            shop: req.body.decoded.id, // not to be filed by user request:
            brand: req.body.brand,
            images: images,
            stockCode: req.body.stockCode,
            quantity: req.body.quantity,
            price: req.body.price,
            details: details
        })
        .catch(err => {
            deleter(imgSrc, ...images);
            msg = err.message;
            stat = 500;
        });

        return respond(res, stat, msg);


    } catch (error) {
        deleter(imgSrc, ...images);
        clog(error);
        return respond(res, 500);
    }
});



// Updating Current product:
router.patch('/changes/:productId',auth, upload.array('images'), tokex, async (req, res) => {

    // uploaded images Names:
    req.files = req.files ?? [];
    const images = req.files.map(item => item.filename);

    try {

        //Checking if requester is a shop:
        if (!req.body.decoded.isShop) {
            deleter(imgSrc, ...images);
            return respond(res, 401, 'You are not a vendor!');
        }
        
        // taking product id from params and checking it
        const pid = req.params.productId;
        if (!idCheck(pid)) { deleter(imgSrc, ...images) ; return respond(res, 400, 'Wrong product Id!')}; 

        // looking for product if there is a product?
        const product = await Product.findOne({_id: pid}); 

        // if there is no product tell the user there is not such a product
        if (!product) { return respond(res, 404)}; 

        // Does this product belong to user??
        if (product.shop != req.body.decoded.id) { return respond(res, 401, 'This is not your product!')}; 

        // req.body.imgsToDelete is pseudo property wich will handle the complexity of image updates.
        // item in req.body.imgsToDelete will be subracted from product.images and new imagas will be append to current product.images;

        //handling image updates:
        const imgsToDelete = jarse(req.body.imgsToDelete) ?? [];
        const newImages = [...product.images.filter(item => imgsToDelete.indexOf(item) === -1), ...images];

        // setting details-json field:
        req.body.details = jarse(req.body.details);
        const subCatagory =  req.body.subCatagory === undefined ? product.subCatagory : jarse(req.body.subCatagory);


        await Product.findOneAndUpdate({_id: pid}, {...req.body, images: newImages, subCatagory}); 

        // deleting unbounded picture from computer:
        deleter(imgSrc, ...imgsToDelete);


        return respond(res, 200, 'Product updated!'); // always let the client know the result of a request


    } catch (error) {
        deleter(imgSrc, ...images)
        clog(error);
        return respond(res, 500);
    }
});


// Reviews : ***************************************************************************************************************

// getting reviews over a product:
router.get('/reviews/:productid',tokex, async (req, res) => {

    try {

        const {currentPage = 1, limit = 75, sortBy= 'createdAt', sortDirection = 'desc'} = req.query ;

        const pid = req.params.productid;

        if (!idCheck(pid)) {
            return res.status(400).json({msg: 'Wrong id Format'});
        }
        const product = await Product.findOne({_id: pid, isActive: true, isDeleted: false}, {isActive: false, isDeleted: false});

        if (!product) {
            return res.status(404).json({msg: 'Product Not found!'});
        }
        const reviews = await Reviews.find({product: pid}).sort({[sortBy] : sortDirection}).skip((Number(currentPage) -1) * Number(limit)).limit(Number(limit));

        // Have to pin my own review about this product on the top
        // my id in case of login with client accout
        const id = req.body.decoded && req.body.decoded.id && !req.body.decoded.isShop? req.body.decoded.id : false ;
        // pining my review to the top
        if (id) {
            const myReview = await Reviews.findOne({reviewer: id, product: pid});
            if (myReview) reviews.unshift(myReview);
        }

        return res.status(200).json({product, reviews, msg: 'Success!'});
    
    } catch (error) {
        clog(error);
        return res.status(500).json({msg: 'Server Error!'});
    }
});

// not tested ******************************************************************S
// adding a review for a product
router.put('/reviews/:productid', parser, auth, async (req, res) => {
    try {

        const pid = req.params.productid;

        const id = req.body.decoded.id && !req.body.decoded.isShop ? req.body.decoded.id : false ;

        if (!idCheck(pid)) {
            return res.status(400).json({msg: 'Wrong product id'});
        }  

        if(!id) {
            return res.status(401).json({msg: 'You are not a client!'});
        }

        const prodcut = await Product.findOne({_id: pid, isActive: true, isDeleted: false});

        if (!prodcut) {
            return res.status(404).json({msg: 'Product Not Found'});
        }

        // if user already reviewed this product he/she will not be able to make new review
        const review = await Reviews.findOne({product: pid, reviewer: id});
        if(review) { return res.status(401).json({msg: 'You already have made a review on this product!'})}


        // the user can make review if he/she has already ordered, paid and recieved the product (order table);
        const order = Orders.findOne({orderBy: id, itemes: {$elemMatch: {item: {$in: [pid]}}}});
        if (!order) { return res.status(401).json({msg: 'You have not ordered this product and you can not make a review for it!'})}


        // all conditions met

        await Reviews.create({
            product: pid,
            reviewer: id,
            star: req.body.star,
            comment: req.body.comment
        });

        // updating ratings for the product
        const reviews = await Reviews.find({product: pid});
        const allStars = reviews.reduce((acd, item) => acd += item.star, 0);
        const ratings = reviews.length !== 0 ? allStars / reviews.length : undefined;
        await Product.findOneAndUpdate({_id: pid}, {ratings: ratings, numberOfReviews: reviews.length});

        return res.status(200).json({msg: 'Your Riew has been added!'});
        
    } catch (error) {
        clog(error);
        const msg = error.message || 'Server Error!';
        return res.status(500).json({msg});       
    }
});


// updating a review for a product
router.patch('/reviews/:productid', parser, auth, async (req, res) => {
    try {

        const pid = req.params.productid;

        const id = req.body.decoded.id && !req.body.decoded.isShop ? req.body.decoded.id : false ;

        if (!idCheck(pid)) {
            return res.status(400).json({msg: 'Wrong product id'});
        }  

        if(!id) {
            return res.status(401).json({msg: 'You are not a client!'});
        }
        
        // looking the reivew if already exist
        const review = await Reviews.findOne({product: pid, reviewer: id});
        if (!review) { return res.status(404).json({msg: 'Review not found!'})}

        await Reviews.findOneAndUpdate({_id: review._id}, {
            star: req.body.star,
            comment: req.body.comment
        });

        // updating ratings for the product
        const reviews = await Reviews.find({product: pid});
        const allStars = reviews.reduce((acd, item) => acd += item.star, 0);
        const ratings = reviews.length !== 0 ? allStars / reviews.length : undefined;
        await Product.findOneAndUpdate({_id: pid}, {ratings: ratings, numberOfReviews: reviews.length});

        return res.status(200).json({msg: 'review updated!'});

    } catch (error) {
        clog(error);
        const msg = 'Server Error!';
        return res.status(500).json({msg});          
    }
});


// deleting a review fro a product
router.delete('/reviews/:productid', parser, auth, async (req, res) => {
    try {

        const pid = req.params.productid;

        const id = req.body.decoded.id && !req.body.decoded.isShop ? req.body.decoded.id : false ;

        if (!idCheck(pid)) {
            return res.status(400).json({msg: 'Wrong product id'});
        }  

        if(!id) {
            return res.status(401).json({msg: 'You are not a client!'});
        }

        // looking the reivew if already exist
        const review = await Reviews.findOne({product: pid, reviewer: id});
        if (!review) { return res.status(404).json({msg: 'Review not found!'})}

        await Reviews.findOneAndDelete({_id: review._id});
        
        // updating ratings for the product
        const reviews = await Reviews.find({product: pid});
        const allStars = reviews.reduce((acd, item) => acd += item.star, 0);
        const ratings = reviews.length !== 0 ? allStars / reviews.length : undefined;
        await Product.findOneAndUpdate({_id: pid}, {ratings: ratings, numberOfReviews: reviews.length});

        return res.status(200).json({msg: 'review updated!'});

    } catch (error) {
        clog(error);
        const msg ='Server Error!';
        return res.status(500).json({msg});          
    }
});

export default router;