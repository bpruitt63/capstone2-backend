const db = require("../db.js");
const User = require("../models/user");
const Location = require("../models/location");
const Trip = require("../models/trip");
const { createToken } = require("../helpers.js");


const testTrips = [];

async function commonBeforeAll() {
    await db.query("DELETE FROM locations");
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM location_ratings");
    await db.query("DELETE FROM trips");
    await db.query("DELETE FROM trip_locations");
    await db.query("DELETE FROM user_trips");

    await User.register({
        username: 'user1',
        password: 'password1',
        email: 'u1@user.com',
        zipCode: '55555',
        country: 'US',
        units: 'i'
    });
    await User.register({
        username: 'user2',
        password: 'password2',
        email: 'u2@user.com',
        zipCode: '66666',
        country: 'CA',
        units: 'm'
    });
    await User.register({
        username: 'user3',
        password: 'password3',
        email: 'u3@user.com',
        zipCode: '77777',
        country: 'US',
        units: 'i'
    });

    await Location.addLocation({
        id: 'test1',
        title: 'loc1',
        latitude: '50',
        longitude: '35'
    });
    await Location.addLocation({
        id: 'test2',
        title: 'loc2',
        latitude: '40',
        longitude: '55'
    });
    await Location.addLocation({
        id: 'test3',
        title: 'loc3',
        latitude: '15',
        longitude: '45'
    });

    await Location.rateLocation({
        id: 'test1',
        username: 'user1',
        rating: '4'
    });
    await Location.rateLocation({
        id: 'test1',
        username: 'user2',
        rating: '5'
    });
    
    testTrips[0] = (await Trip.addTrip('user1', {name: 't1', distance: 20}));
    testTrips[1] = (await Trip.addTrip('user1', {name: 't2', distance: 35}));

    await Trip.addTripLocation(testTrips[0].id, 'test1', 1);
    await Trip.addTripLocation(testTrips[0].id, 'test2', 2);
    await Trip.addTripLocation(testTrips[1].id, 'test2', 1);
    await Trip.addTripLocation(testTrips[1].id, 'test1', 2);

    await Trip.rateTrip(testTrips[0].id, 'user1', 4);
    await Trip.rateTrip(testTrips[1].id, 'user1', 2);
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

const u1Token = createToken({username: 'user1', zipCode: '55555', country: 'US'});
const u2Token = createToken({username: 'user2', zipCode: '66666', country: 'CA'});

module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token,
    testTrips
  };