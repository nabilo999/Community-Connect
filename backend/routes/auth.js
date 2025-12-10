//using dependencies express, jsonwebtoken, bcryptjs - JK
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

//helper function for JWT
function createToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

//functionality for the register section
router.post('/register', async (req, res) => 
{
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) 
    {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    //the password needs to be more than 3 characters
    if (password.length < 3) 
    {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    //edge case for when the email is already registered
    const existing = await User.findOne({ email });
    if (existing) 
    {
      return res.status(409).json({ message: 'Email is already registered.' });
    }
    //this will hash password in our db so we dont expose passwords
    const passwordHash = await bcrypt.hash(password, 10);
    //the user is created with their name, email, and password that is encrypted
    const user = await User.create({
      name,
      email,
      passwordHash
    });

    const token = createToken(user);
    //case for it server fails
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) 
  {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

//functionality for the login section
router.post('/login', async (req, res) => 
{
  try {
    const { email, password } = req.body;
    //edge case for when the email OR the password is not filled
    if (!email || !password) 
    {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    //case for when th email is not registered already
    const user = await User.findOne({ email });
    if (!user) 
    {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    //case for when the password and username does not match
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) 
    {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    //create a tplem fpr tje iser tp access website
    const token = createToken(user);
    //edge case for if the user is created but server fails
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) 
  {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;