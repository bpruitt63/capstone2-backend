const request = require("supertest");
const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token,
    testTrips
} = require("./testCommonRoutes");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe('POST /:username/new_trip', function() {
    test('works', async function() {
        const res = await request(app).post('/trips/user1/new_trip')
            .send({trip: {
                        name: 'newTrip',
                        distance: 99
                },
                locations: [{location: 'test3'}, 
                            {location: 'test1'}]})
            .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({trip: {
                                        id: expect.any(Number),
                                        name: 'newTrip',
                                        distance: '99'
                                        },
                                    tripLocations: [{
                                        tripId: expect.any(Number),
                                        locationId: 'test3',
                                        locationPosition: 0,
                                        locationName: 'loc3'
                                    },
                                    {
                                        tripId: expect.any(Number),
                                        locationId: 'test1',
                                        locationPosition: 1,
                                        locationName: 'loc1'
                                    }]});
    });

    test("doesn't work wrong user", async function() {
        const res = await request(app).post('/trips/user2/new_trip')
            .send({trip: {
                        name: 'newTrip',
                        distance: 99
                },
                locations: [{location: 'test3'}, 
                            {location: 'test1'}]})
            .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toEqual(401);
    });

    test("doesn't work not logged in", async function() {
        const res = await request(app).post('/trips/user1/new_trip')
            .send({trip: {
                        name: 'newTrip',
                        distance: 99
                },
                locations: [{location: 'test3'}, 
                            {location: 'test1'}]});
        expect(res.statusCode).toEqual(401);
    });
});


describe("GET /:username/trips", function() {
    test('works', async function() {
        const res = await request(app).get('/trips/user1/trips')
            .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual([{tripId: expect.any(Number),
                                    tripName: 't2',
                                    distance: '35',
                                    tripRating: '2',
                                    locations: [{
                                        locationId: 'test2',
                                        locationPosition: 1,
                                        locationName: 'loc2'
                                    },
                                    {
                                        locationId: 'test1',
                                        locationPosition: 2,
                                        locationName: 'loc1'
                                    }]},
                                {tripId: expect.any(Number),
                                    tripName: 't1',
                                    distance: '20',
                                    tripRating: '4',
                                    locations: [{
                                        locationId: 'test1',
                                        locationPosition: 1,
                                        locationName: 'loc1'
                                    },
                                    {
                                        locationId: 'test2',
                                        locationPosition: 2,
                                        locationName: 'loc2'
                                    }]},]);
    });

    test('works, no trips', async function() {
        const res = await request(app).get('/trips/user2/trips')
            .set("authorization", `Bearer ${u2Token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual([]);
    });

    test('fails wrong user', async function() {
        const res = await request(app).get('/trips/user2/trips')
            .set("authorization", `Bearer ${u1Token}`)
        expect(res.statusCode).toEqual(401);
    });

    test('fails not logged in', async function() {
        const res = await request(app).get('/trips/user1/trips')
        expect(res.statusCode).toEqual(401);
    });
});


describe("GET /recent_trips", async function() {
    test('works', async function() {
        const res = await request(app).get('/trips/recent_trips');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual([{tripId: expect.any(Number),
                                    tripName: 't2',
                                    distance: '35',
                                    tripRating: '2',
                                    locations: [{
                                        locationId: 'test2',
                                        locationPosition: 1,
                                        locationName: 'loc2'
                                    },
                                    {
                                        locationId: 'test1',
                                        locationPosition: 2,
                                        locationName: 'loc1'
                                    }]},
                                {tripId: expect.any(Number),
                                    tripName: 't1',
                                    distance: '20',
                                    tripRating: '4',
                                    locations: [{
                                        locationId: 'test1',
                                        locationPosition: 1,
                                        locationName: 'loc1'
                                    },
                                    {
                                        locationId: 'test2',
                                        locationPosition: 2,
                                        locationName: 'loc2'
                                    }]},]);
    });
});


describe("PATCH /:username/:trip_id/rate", function() {
    test('works', async function() {
        const res = await request(app).patch(`/trips/user1/${testTrips[0].id}/rate`)
            .send({rating: 1})
            .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({tripId: testTrips[0].id,
                                    username: 'user1',
                                    tripRating: '1'});
    });

    test('fails wrong user', async function() {
        const res = await request(app).patch(`/trips/user1/${testTrips[0].id}/rate`)
            .send({rating: 1})
            .set("authorization", `Bearer ${u2Token}`);
        expect(res.statusCode).toEqual(401);
    });

    test('fails not logged in', async function() {
        const res = await request(app).patch(`/trips/user1/${testTrips[0].id}/rate`)
            .send({rating: 1})
        expect(res.statusCode).toEqual(401);
    });
});


describe("DELETE /:username/:trip_id/delete", function() {
    test('works', async function() {
        const res = await request(app).delete(`/trips/user1/${testTrips[0].id}/delete`)
            .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({result: 'Trip deleted'});
        const trips = await request(app).get('/trips/recent_trips');
        expect(trips.body).toEqual([{tripId: expect.any(Number),
            tripName: 't2',
            distance: '35',
            tripRating: '2',
            locations: [{
                locationId: 'test2',
                locationPosition: 1,
                locationName: 'loc2'
            },
            {
                locationId: 'test1',
                locationPosition: 2,
                locationName: 'loc1'
            }]}]);
    });

    test('fails wrong user', async function() {
        const res = await request(app).delete(`/trips/user1/${testTrips[0].id}/delete`)
            .set("authorization", `Bearer ${u2Token}`);
        expect(res.statusCode).toEqual(401);
    });

    test('fails not logged in', async function() {
        const res = await request(app).delete(`/trips/user1/${testTrips[0].id}/delete`);
        expect(res.statusCode).toEqual(401);
    });
});