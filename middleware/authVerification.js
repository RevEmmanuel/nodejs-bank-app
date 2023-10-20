const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const secretKey = process.env.JWT_SECRET || '';
const { tokenBlackList } = require('../app');
const globalExceptionHandler = require("../utils/globalExceptionHandler");

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
                throw new Error('Invalid or expired token');
            }
            req.user = decoded.user;
            console.log('User: ', req.user);
            console.log('User - user: ', req.user.user);
            console.log(decoded);
            next();
        });
    } catch (error) {
        await globalExceptionHandler(error, res);
    }
}

const adminVerification = async (req, res, next) => {
    const token = extractTokenFromRequest(req);
    if (!token) {
        res.status(401).json({ message: 'Authorization token required' });
        return;
    }
    try {
        jwt.verify(token, secretKey, (error, decoded) => {
            if (error) {
                throw new Error('Invalid or expired token');
            }
            req.user = decoded.user;
        });
        const user = req.user;
        if (user.is_admin) {
            next();
        } else {
            throw new Error('Permission denied');
        }
    }
    catch (error) {
        await globalExceptionHandler(error, req, res, next);
    }
};

function extractTokenFromRequest(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}

module.exports = {
    authVerification,
    adminVerification
};
