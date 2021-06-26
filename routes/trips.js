const express = require("express");
const jsonschema = require('jsonschema');
const Trip = require('../models/trip');
const router = new express.Router();
const tripSchema = require('../schemas/trip.json');
const tripLocationSchema = require('../schemas/tripLocation.json');
const tripRatingSchema = require('../schemas/tripRating.json');
const {BadRequestError} = require('../expressError');
const { ensureCorrectUser } = require("../middleware/auth");

/** Adds new trip to database */
router.post('/:username/new_trip', ensureCorrectUser, async function(req, res, next) {
    
    /** Adds trip to trips table in database and gets trip id */
    try {
        const validator = jsonschema.validate(req.body.trip, tripSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        };
        const trip = await Trip.addTrip(req.params.username, req.body.trip);

        /** Adds each location from trip into trip_locations table in
         * database and adds returned value to locations array
         */
        let tripLocations = [];
        for (let i = 0; i < req.body.locations.length; i++) {
            const location = req.body.locations[i].location;
            const position = i;
            const newLocation = {id: trip.id, location, position};
            const locValidator = jsonschema.validate(newLocation, tripLocationSchema);
            if (!locValidator.valid) {
                const errs = validator.errors.map(e => e.stack);
                throw new BadRequestError(errs);
            };
            const addedLocation = await Trip.addTripLocation(trip.id, location, position);
            tripLocations.push(addedLocation);
        };

        /** Returns new trip and array of locations for trip */
        return res.status(201).json({trip, tripLocations});
    } catch(err) {
        return next(err);
    };
});

/** Retrieves all trips created by the logged in user */
router.get('/:username/trips', ensureCorrectUser, async function(req, res, next) {
    try {
        const trips = await Trip.getUserTrips(req.params.username);
        return res.json(trips);
    } catch(err) {
        return next(err);
    };
});

/** Retrieves last 20 trips entered into database by any user */
router.get('/recent_trips', async function(req, res, next) {
    try {
        const trips = await Trip.getRecentTrips();
        return res.json(trips);
    } catch(err) {
        return next(err);
    };
});

/** Updates rating for a trip.  Only the trip's creator can rate a trip */
router.patch('/:username/:trip_id/rate', ensureCorrectUser, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body.trip, tripRatingSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        };
        const result = await Trip.rateTrip(req.params.trip_id, req.params.username, req.body.rating);
        return res.json(result);
    } catch(err) {
        return next(err);
    };
});

/** Removes trip from database.  Must be trip's creator */
router.delete('/:username/:trip_id/delete', ensureCorrectUser, async function(req, res, next) {
    try {
        const result = await Trip.deleteTrip(req.params.trip_id);
        return res.json(result);
    } catch(err) {
        return next(err);
    };
});

module.exports = router;