const db = require("../db.js");
const Location = require("../models/location.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll
} = require("./testCommonModels");
  
beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe('addLocation', function() {
    const newLocation = {
        id: 'new',
        title: 'newLocation',
        latitude: '25',
        longitude: '30'
    };

    test('works', async function() {
        let new1 = await Location.addLocation(newLocation);
        expect(new1).toEqual({id: 'new'});
        const found = await db.query("SELECT * FROM locations WHERE id = 'new'");
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].title).toEqual('newLocation');
    });

    test("doesn't add duplicate location", async function() {
        let new1 = await Location.addLocation(newLocation);
        let new2 = await Location.addLocation(newLocation);
        expect(new1).toEqual({id: 'new'});
        expect(new2).toEqual({id: 'new'});
        const found = await db.query("SELECT * FROM locations WHERE id = 'new'");
        expect(found.rows.length).toEqual(1);
    });
});

describe('rateLocation', function() {
    test('works', async function() {
        await Location.rateLocation({id: 'test2', username: 'u1', rating: 5});
        const found = await db.query(
                    "SELECT * FROM location_ratings WHERE location_id = 'test2'");
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0]).toEqual({location_id: 'test2', username: 'u1', rating: '5'});
    });

    test('adds rating to location w/ ratings', async function() {
        await Location.rateLocation({id: 'test1', username: 'u3', rating: 1});
        const found = await db.query(
                    "SELECT * FROM location_ratings WHERE location_id = 'test1'");
        expect(found.rows.length).toEqual(3);
    });

    test('updates already rated location', async function() {
        await Location.rateLocation({id: 'test1', username: 'u1', rating: 1});
        const found = await db.query(
                    `SELECT * FROM location_ratings WHERE location_id = 'test1'
                    AND username = 'u1'`);
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0]).toEqual({location_id: 'test1', username: 'u1', rating: '1'});
    });
});

describe('getLocationRatings', function() {
    test('works', async function() {
        const ratings = await Location.getLocationRatings('test1', 'u1');
        expect(ratings.userRating).toEqual('4');
        expect(ratings.overallRating).toEqual('3.50');
    });

    test('works with no ratings', async function() {
        const ratings = await Location.getLocationRatings('test2', 'u1');
        expect(ratings.userRating).toEqual("You haven't rated this location yet.");
        expect(ratings.overallRating).toEqual("No ratings yet.");
    });

    test('works not rated by user', async function() {
        const ratings = await Location.getLocationRatings('test1', 'u3');
        expect(ratings.userRating).toEqual("You haven't rated this location yet.");
        expect(ratings.overallRating).toEqual("3.50");
    });
});