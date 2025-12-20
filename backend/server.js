require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require("./routes/users");
const groupRoutes = require("./routes/groups");
const groupEventsRoutes = require("./routes/groupEvents");
const eventsRoutes = require("./routes/events");

const app = express();

const allowedOrigins = 
[
  //for local testing
  'http://localhost:5173',        
  //for render hosting
  process.env.CLIENT_ORIGIN      
  //removes any undefined variables
].filter(Boolean); 

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

//middleware for connecting to db 
app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({limit: "50mb", extended: true}));

//routes used for authentication
app.use('/api/auth', authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/groups/:groupId/events", groupEventsRoutes);
app.use("/api/events", eventsRoutes);

//making sure our API is working good
app.get('/', (req, res) => {
  res.send('Community Connect API is ok');
});

//connect to MongoDB
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI).then(() => 
  {
    console.log('Community Connect is using Mongodb properly');
    app.listen(PORT, () => 
    {
    //supposed to be on 5000
      console.log(`Server is on port ${PORT}`);
    });
  })
  //for case where the db is not working for some reason
  .catch((err) => 
  {
    console.error('Mongodb connection error:', err);
    process.exit(1);
  });