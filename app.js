const express = require("express");
const cors = require('cors');

const { NotFoundError } = require("./expressError");
const { authenticateJWT } = require("./middleware/auth");
const usersRoutes = require('./routes/users');
const locationRoutes = require('./routes/locations');
const tripRoutes = require('./routes/trips');

const app = express();

app.use(cors());
app.use(express.json());
app.use(authenticateJWT);

app.use('/users', usersRoutes);
app.use('/locations', locationRoutes);
app.use('/trips', tripRoutes);

app.use(function (req, res, next) {
    return next(new NotFoundError());
  });

app.use(function (err, req, res, next) {
    if (process.env.NODE_ENV !== "test") console.error(err.stack);
    const status = err.status || 500;
    const message = err.message;
  
    return res.status(status).json({
      error: { message, status },
    });
  });
  
  module.exports = app;