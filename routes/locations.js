const express = require("express");
const jsonschema = require('jsonschema');
const Location = require('../models/location');
const router = new express.Router();
const locationSchema = require('../schemas/location.json');
const locationRatingSchema = require('../schemas/locationRating.json');
const {BadRequestError} = require('../expressError');
const { ensureCorrectUser } = require("../middleware/auth");

/** Puts new location info into database */
router.post('/new_location', async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, locationSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        };
        const location = await Location.addLocation(req.body);
        return res.status(201).json(location);
    } catch(err) {
        return next(err);
    };
});

/** Updates a location's rating.  Must be logged in correctly */
router.patch('/rating/:username', ensureCorrectUser, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, locationRatingSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        };
        const rating = await Location.rateLocation(req.body);
        return res.json(rating);
    } catch(err) {
        return next(err);
    };
});

/** Retrieve rating given for a location by the currently 
 * logged in user
 */
router.get('/:location/:username', ensureCorrectUser, async function(req, res, next) {
    try {
        const ratings = await Location.getLocationRatings(req.params.location, req.params.username);
        return res.json(ratings);
    } catch(err) {
        return next(err);
    };
});

module.exports = router;