import express from 'express';
const router = express.Router();

import Orders from '../models/orders.js';
import auth from '../middlewares/authentication.js';
import jarse from '../middlewares/tools/jsonCheckParse.js';
import Clients from '../models/clients.js';
import parser from '../middlewares/formDataParser.js';
import idCheck from '../middlewares/tools/idCheck.js';


// not tested : *********************************************************************
// Getting orders:
router.get('/myorders',parser, auth, async (req, res) => {
    try {
        const id = req.body.decoded.id;

        const {currentPage = 1, limit = 75, sortBy= 'createdAt', sortDirection = 'desc'} = req.query ;

        const skip = (Number(currentPage) - 1) * Number(limit);

        let data = [];
    
        if (req.body.decoded.isShop) {
            data = await Orders.find({itemes: { $in: [id]}, isDeleted: false}).skip(skip).limit(Number(limit)).sort({ [sortBy] : sortDirection});
        } else {
            data = await Orders.find({orderBy: id, isDeleted: false}).skip(skip).limit(Number(limit)).sort({ [sortBy] : sortDirection});;
        }

        return res.status(200).json({msg: '' , data});
    } catch (error) {
        deleter(imgSrc, ...images)
        console.log(error);
        return res.status(500).json({msg: 'Server Error!'});        
    }
});


//creating orders:
router.put('/new',parser, auth, async (req, res) => {
    try {
        
        const id = req.body.decoded.id && !req.body.decoded.isShop ? req.body.decoded.id : false ;

        if (!id) { return res.status(401).json({msg: 'You are not a buyer!'})}

        // Getting the cart Item from client
        const cart = await Clients.find({_id: id}, {cart: true}).populate({path: 'cart', populate: { path: 'item'}});

        // parsing cart and calculating the total amount:
        const totalAmount = cart.reduce((total, item) => total += (item.item.price * item.quantity), 0);

        await Orders.create({
            itemes: cart,
            totalAmount: totalAmount,
            orderBy: id,
            deliverAddress: jarse(req.body.deliverAddress),
        });

        return res.status(200).json({msg: 'Your oreder was recieved and waiting to be paid and process!'});

    } catch (error) {
        deleter(imgSrc, ...images)
        console.log(error);
        return res.status(500).json({msg: 'Server Error!'});
    }
});


// updating orders
router.patch('/changes/:orderid', auth, parser, async (req, res) => {
    try {
        
        const id = req.body.decoded.id ;
        

        const oid = req.params.orderid;

        if(!idCheck(oid)) { return res.status(400).json({msg: 'Wrong product id!'})}

        const order = await Orders.findOne({_id: oid});

        if(!order) { return res.status(404).json({msg: 'Order not found!'})}

        if(!req.body.decoded.isShop) {
            // if user can change the cart, close, and isDeleted if order is not closed
            if (order.isClosed || order.isDeleted) { return res.status(400).json({msg: 'Unfortunately the order is closed and you can not change it!'})}

            const isClosed = req.body.isClosed || false;
            const isDeleted = req.body.isDeleted || false;
            const cart = jarse(req.body.cart) || order.itemes;

            await Orders.findOneAndUpdate({_id: oid}, { isClosed: isClosed, isDeleted: isDeleted, itemes: cart});
        } else {
            // if shop only can change isPaid => isShipped => isDelivered in shown order if order is closed
            if (!order.isClosed || order.isClosed) { return res.status(400).json({msg: 'Unfortunately the order is not closed and you have to wait for it!'})}

            const isPaid = req.body.isPaid || order.isPaid;
            const isShipped = req.body.isShipped || order.isShipped;
            const isDelivered = req.body.isDelivered || order.isDelivered;

            if (order.isDeleted) {

            }
            if (isPaid && isShipped && isDelivered) {
                return res.status(400).json({msg: 'This order is done and you can not change anything about it!'});
            } else if (isPaid && isShipped) {
                await Orders.findOneAndUpdate({_id: oid}, {isDelivered: isDelivered});
            } else if (isPaid) {
                await Orders.findOneAndUpdate({_id: oid}, {isShipped: isShipped});
            } else {
                await Orders.findOneAndUpdate({_id: oid}, {isPaid: isPaid});
            }
        }

        return res.status(200).json({msg: 'update is done!'});

        
    } catch (error) {
        
        deleter(imgSrc, ...images)
        console.log(error);
        return res.status(500).json({msg: 'Server Error!'});
    }
});





export default router;