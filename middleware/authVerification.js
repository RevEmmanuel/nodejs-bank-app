const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const secretKey = process.env.JWT_SECRET || '';
const { tokenBlackList } = require('../app')
const UnauthorizedException = require("../exceptions/UnauthorizedException");
const globalExceptionHandler = require("../exceptions/GlobalExceptionHandler");

const authVerification = async (req, res, next) => {
    const token = extractTokenFromRequest(req);
    if (!token) {
        return res.status(401).json({ message: 'Authorization token required' });
    }
    if (tokenBlackList.has(token)) {
        return res.status(401).json( { message: "Invalid or Expired token" } );
    }

    try {
        jwt.verify(token, secretKey, (error, decoded) => {
            if (error) {
                throw new UnauthorizedException('Invalid or expired token');
            }
            req.user = decoded.user;
            console.log(decoded);
            next();
        });
    } catch (error) {
        await globalExceptionHandler(error, res);
    }
}

function extractTokenFromRequest(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}

module.exports = authVerification;
