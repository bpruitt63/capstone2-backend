const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const Trip = require("../models/trip.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testTrips
} = require("./testCommonModels");
  
beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe('addTrip', function() {
    test('works', async function() {
        const data = {name: 'newTrip', distance: 99};
        const trip = await Trip.addTrip('u3', data);
        expect(trip).toEqual({id: expect.any(Number), name: 'newTrip', distance: '99'});
        const found = await db.query(`SELECT * FROM user_trips WHERE username = 'u3'`);
        expect(found.rows[0]).toEqual({trip_id: expect.any(Number), username: 'u3', trip_rating: null});
    });
});


describe('addTripLocation', function() {
    test('works', async function() {
        const res = await Trip.addTripLocation(testTrips[2], 'test1', 1);
        expect(res).toEqual({tripId: expect.any(Number), locationId: 'test1',
                                    locationPosition: 1, locationName: 'loc1'});
    });
});


describe('getUserTrips', function() {
    test('works', async function() {
        const trip1 = {tripId: expect.any(Number), tripName: 't1',
                    distance: '20', tripRating: '4', locations: [
                        {locationId: 'test1', locationPosition: 1, locationName: 'loc1'},
                        {locationId: 'test2', locationPosition: 2, locationName: 'loc2'}]};
        const trip2 = {tripId: expect.any(Number), tripName: 't2',
                    distance: '35', tripRating: '2', locations: [
                        {locationId: 'test2', locationPosition: 1, locationName: 'loc2'},
                        {locationId: 'test1', locationPosition: 2, locationName: 'loc1'}]};
        const trips = await Trip.getUserTrips('u1');
        expect(trips).toEqual([trip2, trip1]);
    });

    test('works no user trips', async function() {
        const trips = await Trip.getUserTrips('u2');
        expect(trips.length).toEqual(0);
    });
});


describe('getRecentTrips', function() {
    test('works', async function() {
        const trip1 = {tripId: expect.any(Number), tripName: 't1',
                    distance: '20', tripRating: '4', locations: [
                        {locationId: 'test1', locationPosition: 1, locationName: 'loc1'},
                        {locationId: 'test2', locationPosition: 2, locationName: 'loc2'}]};
        const trip2 = {tripId: expect.any(Number), tripName: 't2',
                    distance: '35', tripRating: '2', locations: [
                        {locationId: 'test2', locationPosition: 1, locationName: 'loc2'},
                        {locationId: 'test1', locationPosition: 2, locationName: 'loc1'}]};
        const trips = await Trip.getRecentTrips();
        expect(trips).toEqual([trip2, trip1]);
    });
});


describe('rateTrip', function() {
    test('works', async function() {
        const rating = await Trip.rateTrip(testTrips[0], 'u1', 1);
        expect(rating).toEqual({tripId: expect.any(Number), username: 'u1', tripRating: '1'});
    });
});


describe('deleteTrip', function() {
    test('works', async function() {
        const found = await db.query(`SELECT * FROM trips WHERE distance BETWEEN '15' AND '50'`);
        const res = await Trip.deleteTrip(testTrips[0]);
        const found2 = await db.query(`SELECT * FROM trips WHERE distance BETWEEN '15' AND '50'`);
        expect(found.rows.length).toEqual(2);
        expect(found2.rows.length).toEqual(1);
        expect(res).toEqual({result: 'Trip deleted'});
    });
});