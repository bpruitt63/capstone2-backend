const db = require('../db');

class Trip {

    /** Adds trip into database */
    static async addTrip(username, {name, distance}) {
        const result = await db.query(
            `INSERT INTO trips
            (trip_name, distance)
            VALUES ($1, $2)
            RETURNING id, trip_name AS "name", distance`,
            [name, distance]
        );
        const trip = result.rows[0];

        /** Adds trip into user_trips table to store who created the trip */
        await db.query(
            `INSERT INTO user_trips
            (trip_id, username)
            VALUES ($1, $2)`,
            [trip.id, username]
        ); 

        return trip;
    };  

    /** Adds a location from a trip, and the position in order that 
     * location was entered
     */
    static async addTripLocation(id, location, position) {
        const result = await db.query(
            `INSERT INTO trip_locations
            (trip_id, location_id, location_position)
            VALUES ($1, $2, $3)
            RETURNING trip_id AS "tripId", 
                location_id AS "locationId",
                location_position as "locationPosition"`,
            [id, location, position]
        );
        const newLocation = result.rows[0];
        return newLocation;
    };

    /** Gets all trips created by a specific user */
    static async getUserTrips(username) {

        /** Gets user's trips */
        const tripResult = await db.query(
            `SELECT user_trips.trip_id AS "tripId",
                    trip_name AS "tripName",
                    distance,
                    trip_rating AS "tripRating"
            FROM user_trips
            JOIN trips
                ON user_trips.trip_id = trips.id
            WHERE user_trips.username = $1
            ORDER BY trip_id DESC`,
            [username]
        );
        let userTrips;
        if (!tripResult.rows[0]) {
            userTrips = 'You have not created any trips yet';
            return userTrips;
        };

        userTrips = tripResult.rows;

        /** Gets array of locations for each trip retrieved above */
        for (let trip of userTrips) {
            const locationResults = await db.query(
                `SELECT location_id AS "locationId",
                        location_position AS "locationPosition",
                        locations.title AS "locationName"
                FROM user_trips
                JOIN trip_locations
                    ON user_trips.trip_id = trip_locations.trip_id
                JOIN locations
                    ON trip_locations.location_id = locations.id
                WHERE user_trips.trip_id = $1
                ORDER BY location_position`,
                [trip.tripId]
            );
            trip.locations = locationResults.rows;
        };
        
        return userTrips;
    };

    /** Gets the 20 most recent trips entered by anyone into database */
    static async getRecentTrips() {
        const tripResult = await db.query(
            `SELECT id AS "tripId",
                    trip_name AS "tripName",
                    distance,
                    trip_rating AS "tripRating"
            FROM trips
            JOIN user_trips
                ON trips.id = user_trips.trip_id
            ORDER BY trip_id DESC
            LIMIT 20`
        );
        let trips;
        if (!tripResult.rows[0]) {
            trips = 'No trips found';
            return trips;
        };

        trips = tripResult.rows;

        /** Gets array of locations for each trip retrieved above */
        for (let trip of trips) {
            const locationResults = await db.query(
                `SELECT location_id AS "locationId",
                        location_position AS "locationPosition",
                        locations.title AS "locationName"
                FROM trips
                JOIN trip_locations
                    ON trips.id = trip_locations.trip_id
                JOIN locations
                    ON trip_locations.location_id = locations.id
                WHERE trips.id = $1
                ORDER BY location_position`,
                [trip.tripId]
            );
            trip.locations = locationResults.rows;
        };
        
        return trips;
    };

    /** Enters user's rating for a trip */
    static async rateTrip(id, username, rating) {
        const result = await db.query(
            `UPDATE user_trips
            SET trip_rating = $1
            WHERE trip_id = $2
            AND username = $3
            RETURNING trip_id AS "tripId", 
                        username, 
                        trip_rating AS "tripRating"`,
            [rating, id, username]
        );
        return result.rows[0];
    };

    /** Deletes a single trip */
    static async deleteTrip(id) {
        const result = await db.query(
            `DELETE FROM trips
            WHERE id = $1`,
            [id]
        );
        return {result: 'Trip deleted'};
    };
};

module.exports = Trip;