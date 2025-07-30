const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost/tododb", {
  useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'));

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/task'));

module.exports = app;
