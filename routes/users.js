const express = require("express");
const jsonschema = require('jsonschema');
const User = require('../models/user');
const router = new express.Router();
const registerSchema = require('../schemas/register.json');
const loginSchema = require('../schemas/login.json');
const userUpdateSchema = require('../schemas/userUpdate.json');
const {createToken} = require('../helpers');
const {BadRequestError} = require('../expressError');
const { ensureCorrectUser } = require("../middleware/auth");

/** Registers new user.  Creates and returns token */
router.post('/register', async function(req, res, next) {
    try{
        const validator = jsonschema.validate(req.body, registerSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        };
        const user = await User.register({...req.body});
        const token = createToken(user);
        return res.status(201).json({token});
    } catch(err) {
        return next(err);
    };
});

/** Logs in user.  Creates token.  Returns token along with user info */
router.post('/login', async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, loginSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        };

        const {username, password} = req.body;
        const user = await User.login(username, password);
        const location = {zipCode: user.zipCode, country: user.country};
        const token = createToken(user);
        const units = user.units;
        return res.json({token, location, units});

    } catch(err) {
        return next(err);
    };
});

/** Retrieves info on logged in user */
router.get("/:username", ensureCorrectUser, async function (req, res, next) {
    try {
      const user = await User.get(req.params.username);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
});

/** Updates info on logged in user */
router.patch('/:username', ensureCorrectUser, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        };

        const user = await User.update(req.params.username, req.body);
        return res.json({user});
    } catch (err) {
        return next(err);
    };
});

module.exports = router;