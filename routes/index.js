import express from 'express';
const router = express.Router();

// Sending React dist:
router.get('/', (req, res) => res.sendFile('./public/index.html'));



// router components: *************************************************************************************************************

// sign Up:
import signUp from './signUp.js';
router.use('/signup', signUp);

// Sign In:
import signIn from './signIn.js';
router.use('/signin', signIn);

// Products:
import product from './product.js';
router.use('/product/', product);

// Search functionallity:
import search from './search.js';
router.use('/search', search);


// Shop managements:
import shops from './shop.js';
router.use('/shops', shops);

// oreders:
import orders from './orders.js';
router.use('/orders', orders);


//user: ??????????????????????????????????????????????????
import users from './user.js'
router.use('/myaccount', users);

//images:
import mediaServer from './mediaService.js'
router.use('/media', mediaServer);



// handling wrong endpoints : ******************************************************************************
router.use('/*', async (req, res) => {
    return res.status(404).json({msg: 'Not Found! Wrong Endpoint!'});
});

export default router;