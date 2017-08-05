const express = require('express');
const router = express.Router();

var jwt = require('jsonwebtoken');
// super secret for creating tokens
var superSecret = 'dotnettricks';
let user;
const appRoutes = {
    publicRoutes: ["/store", "/store/cart", '/store/paymentstatus', "/auth", "/auth/signup", '/file'],
    userRoutes: [],
    adminRoutes: ['/category', '/category/create', '/product', '/product/create']
};

// route middleware to verify a token
router.use(function (req, res, next) {
    var url = req.url;
    console.log(url);
    if (appRoutes.publicRoutes.indexOf(url) >= 0) {
        next();
    } else {
        // check header or url parameters or post parameters for token
        //console.log(req);
        var token = req.headers['authorization'] || req.body.token || req.query.token;
        // console.log("token : ",token);
        // decode token
        if (token) {
            // verifies secret and checks exp
            jwt.verify(token, superSecret, function (err, decoded) {
                if (err) {
                    return res.json({
                        success: false,
                        message: 'Failed to authenticate token.'
                    });
                } else {
                    // save to request for use in other routes
                    user = req.decoded = decoded;
                    console.log(user);
                    if (user.roles.indexOf('Admin') >= 0 && appRoutes.adminRoutes.indexOf(url) >= 0) {
                        next(); // go to the next routes and don't stop here
                    }
                    else {
                        return res.status(403).send({
                            success: false,
                            message: 'you are not authorized.'
                        });
                    }
                }
            });
        } else {
            // if there is no token return an HTTP response
            // of 403 (access forbidden) and an error message
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }
    }
});

//public
router.use('/auth', require('../api/auth.api'));
router.use('/store', require('../api/store.api'));

//admin
router.use('/product', require('../api/product.api'));
router.use('/category', require('../api/category.api'));
router.use('/file', require('../api/file.api'));
router.use('/role', require('../api/role.api'));
router.use('/user', require('../api/user.api'));

module.exports = router;