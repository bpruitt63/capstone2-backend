const db = require('../db');

class Location {

    /** Add a single location to database.  Returns location id */
    static async addLocation({id, title, latitude, longitude}) {

        /** Checks if location is already in database */
        const isDuplicate = await db.query(
            `SELECT id 
            FROM locations
            WHERE id = $1`,
            [id]
        );
        if (isDuplicate.rows[0]) {
            return isDuplicate.rows[0];
        };

        /** Inserts location if not already in database */
        const result = await db.query(
            `INSERT INTO locations
                (id,
                title,
                latitude,
                longitude)
            VALUES ($1, $2, $3, $4)
            RETURNING id`,
            [id, title, latitude, longitude]
        );
        const location = result.rows[0];
        return location;
    };

    /** Add a rating to a location.  Returns id, rating */
    static async rateLocation({id, username, rating}) {

        /** Updates rating if already rated */
        const isDuplicate = await db.query(
            `SELECT location_id, username
            FROM location_ratings
            WHERE location_id = $1 AND username = $2`,
            [id, username]
        );
        if (isDuplicate.rows[0]) {
            const result = await db.query(
                `UPDATE location_ratings
                SET rating = $1
                WHERE location_id = $2 and username = $3
                RETURNING location_id AS "id", rating`,
                [rating, id, username]
            );
            const locationRating = result.rows[0];
            return locationRating;
        };

        /** Adds rating if not already rated */
        const result = await db.query(
            `INSERT INTO location_ratings 
                (location_id,
                username,
                rating)
            VALUES ($1, $2, $3)
            RETURNING location_id AS "id", rating`,
            [id, username, rating]
        );
        const locationRating = result.rows[0];
        return locationRating;
    };

    /** Get ratings for location.  Return aggregate rating and
     * rating by specific user.  If no ratings, return message stating that.
     */
    static async getLocationRatings(id, username) {

        let userRating = "You haven't rated this location yet.";

        /** Get aggregate rating for location */
        let overallRating = await db.query(
            `SELECT AVG (rating)
            FROM location_ratings
            WHERE location_id = $1`,
            [id]
        );

        /** If no ratings yet, skip user rating and return messages
         * stating that there are no current ratings
         */
        if (overallRating.rows[0].avg === null) {
            overallRating = "No ratings yet."
            return {userRating, overallRating};
        } else {
            overallRating = overallRating.rows[0].avg.slice(0, 4);
        };

        /** Get rating made by specific user */
        const result = await db.query(
            `SELECT rating
            FROM location_ratings
            WHERE location_id = $1
            AND username = $2`,
            [id, username]
        );
        if (result.rows[0]) {
            userRating = result.rows[0].rating;
        };
        return {userRating, overallRating};
    };
};

module.exports = Location;