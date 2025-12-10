require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();

//middleware for connecting to db 
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

//routes used for authentication
app.use('/api/auth', authRoutes);

//making sure our API is working good
app.get('/', (req, res) => {
  res.send('Community Connect API is ok');
});

//connect to MongoDB
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Community Connect is using Mongodb properly');
    app.listen(PORT, () => {
    //supposed to be on 5000
      console.log(`Server is on port ${PORT}`);
    });
  })
  //for case where the db is not working for some reason
  .catch((err) => {
    console.error('Mongodb connection error:', err);
    process.exit(1);
  });