const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

function authenticateJWT(req, res, next) {
    
    try {
      const authHeader = req.headers && req.headers.authorization;
      if (authHeader) {
        const token = authHeader.replace(/^[Bb]earer /, "").trim();
        res.locals.user = jwt.verify(token, SECRET_KEY);
      };
      return next();
    } catch (err) {
      return next();
    };
};

function ensureCorrectUser(req, res, next) {
    try {
      if (!res.locals.user) throw new UnauthorizedError();
      if (res.locals.user.username === req.params.username){
        return next()
      } else {
        throw new UnauthorizedError();
      }
    } catch (err) {
      return next(err);
    };
  };

  module.exports = {authenticateJWT, ensureCorrectUser};