const User = require('../models/User');

const jwt = require('jsonwebtoken');
//generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
}
// Register a new user
exports.registerUser = async (req, res) => {
    const { fullName, email, password, profilePic } = req.body;
//check if all fields are filled
    if (!fullName || !email || !password) {
        return res.status(400).json({ message: 'Please fill all the fields' });
    }
    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Create a new user
        const user = await User.create({ fullName, email, password, profilePic, });

        res.status(201).json({ id: user._id, user, token: generateToken(user._id), });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }   
};
//login user                                                                                                                                             
exports.loginUser = async(req,res) => {

    const { email, password } = req.body;
    //check if all fields are filled    
    if (!email || !password) {
        
        return res.status(400).json({ message: 'Please fill all the fields' });
    }
    try {
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
           
            return res.status(400).json({ message: 'Invalid email or password' });
        }
         
        res.status(200).json({ id: user._id, user, token: generateToken(user._id), });
    }
    catch (err) {
        
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
// Get user information
exports.getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};