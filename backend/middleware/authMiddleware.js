const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Token decoded:", decoded);
        req.user = await User.findById(decoded.id).select('-password');
        console.log("✅ User fetched:", req.user);
        next();
    } catch (err) {
        console.error("❌ Token error:", err.message);
        return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
};
