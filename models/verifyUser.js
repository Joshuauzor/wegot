module.exports = // check token for the route
function verifyToken(req, res, next) {
    // get auth header value
    const bearerHeader = req.headers['authorization'];
    // check if bearer is undefined
    if(typeof bearerHeader !== 'undefined'){
        //Split at the space
        const bearer = bearerHeader.split(' ');
        //get token from array
        const bearerToken = bearer[1];
        // set token
        req.token = bearerToken;
        // next middleware
        next()
    }
    else{
        // forbidded
        res.sendStatus(403);
    }
}