import express from 'express';
const router = express.Router();

import clog from '../middlewares/tools/consoleLog.js';

import fs from 'fs';
import path from 'path';


// Image directories:
const profiles = './media/profiles';
const products = './media/products';

// Routs : *************************************************

// profile pictures:
router.get('/profile/:pic', async (req, res) => {
    try {
        const pic = req.params.pic;
        const filePath = path.join(profiles, pic);

        const data = fs.readFileSync(filePath);

        res.contentType(`profile/${path.extname(filePath).toLowerCase()}`);
        return res.send(data);
    } catch (error) {
        clog(error);
        return res.sendStatus(404);
    }
});



// product pictures:
router.get('/product/:pic', async (req, res) => {
    try {
        const pic = req.params.pic;
        const filePath = path.join(products, pic);

        const data = fs.readFileSync(filePath);

        res.contentType(`product/${path.extname(filePath).toLowerCase()}`);
        return res.send(data);
    } catch (error) {
        clog(error);
        return res.sendStatus(404);
    }
});


export default router;