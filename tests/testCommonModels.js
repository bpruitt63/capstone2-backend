const bcrypt = require("bcrypt");
const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

const testTrips = [];

async function commonBeforeAll() {
    await db.query("DELETE FROM locations");
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM location_ratings");
    await db.query("DELETE FROM trips");
    await db.query("DELETE FROM trip_locations");
    await db.query("DELETE FROM user_trips");
  
    await db.query(`
          INSERT INTO users(username,
                            hashed_pwd,
                            zip_code,
                            country,
                            units,
                            email)
          VALUES ('u1', $1, '55555', 'US', 'i', 'u1@email.com'),
                 ('u2', $2, '66666', 'CA', 'm', 'u2@email.com'),
                 ('u3', $3, '77777', 'US', 'i', 'u3@email.com')`,
        [
          await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
          await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
          await bcrypt.hash("password3", BCRYPT_WORK_FACTOR)
        ]);

    await db.query(`
        INSERT INTO locations(id, title, latitude, longitude)
        VALUES ('test1', 'loc1', '55', '58'),
              ('test2', 'loc2', '56', '59'),
              ('test3', 'loc3', '57', '60')`);
              
    await db.query(`
        INSERT INTO location_ratings (location_id, username, rating)
        VALUES ('test1', 'u1', 4),
              ('test1', 'u2', 3)`);
  
    const resultsTrips = await db.query(`
        INSERT INTO trips (trip_name, distance)
        VALUES ('t1', 20),
                ('t2', 35),
                ('t3', 0)
        RETURNING id`);
    testTrips.splice(0, 0, ...resultsTrips.rows.map(r => r.id));

    await db.query(`
        INSERT INTO trip_locations (trip_id, location_id, location_position)
        VALUES ($1, 'test1', 1),
                ($1, 'test2', 2),
                ($2, 'test2', 1),
                ($2, 'test1', 2)`,
        [testTrips[0], testTrips[1]]);

    await db.query(`
        INSERT INTO user_trips (trip_id, username, trip_rating)
        VALUES ($1, 'u1', 4),
                ($2, 'u1', 2)`,
        [testTrips[0], testTrips[1]]);
};
  
async function commonBeforeEach() {
    await db.query("BEGIN");
};
  
async function commonAfterEach() {
    await db.query("ROLLBACK");
};
  
async function commonAfterAll() {
    await db.end();
};


module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testTrips
};