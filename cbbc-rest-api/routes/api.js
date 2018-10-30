const express = require('express');
const router = express.Router();
/*=======================ROUTES==================================== */
const compoundRoutes = require('./compounds');

router.get('/', (req, res) => {
    res.send('api works');
});

/* set api routes */
router.use('/compound', compoundRoutes);




module.exports = router;
