import express from 'express';
const router = express.Router();

import Products from '../models/products.js';
import Shops from '../models/shops.js';

router.get('/', async (req, res) => {
    try {

        // query pattern: http://host/search/?q=dog+toys&currentPage=1&limit=25&sortBy=ratings&sortDirection=asc;

        const {q = '', currentPage = 1, limit = 70, sortBy='ratings', sortDirection = 'asc' } = req.query;
        const skip = (Number(currentPage) -1) * Number(limit);

        let products = [] , shops = [];

        // if query is empty it must return all data:
        if (q === '') {
            products = await Products.find({ isActive: true, isDeleted: false}, {isActive: false, isDeleted: false}).sort({[sortBy] : sortDirection}).skip(skip).limit(Number(limit));
            shops = await Shops.find({ isActive: true}, {isActive: false}).sort({[sortBy] : sortDirection}).skip(skip).limit(Number(limit));
        } else {
            products = await Products.find( { $text: { $search: q}, isActive: true, isDeleted: false}, {isActive: false, isDeleted: false}).sort({[sortBy] : sortDirection}).skip(skip).limit(Number(limit));
            shops = await Shops.find( { $text: { $search: q}, isActive: true}, {isActive: false}).sort({[sortBy] : sortDirection}).skip(skip).limit(Number(limit));
        }

        const msg = (products.length === 0 && shops.length === 0) ? `No result was found` : `${products.length + shops.length} result(s)`;

        return res.status(200).json({products, shops, msg});
    } catch (error) {
        console.log(error);
        const msg = 'Server Error!';
        return res.status(500).json({msg});
    }
});

export default router;