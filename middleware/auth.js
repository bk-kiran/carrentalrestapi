const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1] // extracts the token from the authentication header
        const decoded = jwt.verify(token, 'secret')  // using the verify function to authorize a specific token to ensure protected routes
        req.userData = decoded
        next()
    } catch {
        return res.status(401).json({
            message: 'Authentication Failed'
        })
    }
}