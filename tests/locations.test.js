const request = require("supertest");
const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token
} = require("./testCommonRoutes");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe("POST /new_location", function() {
    test('works', async function() {
        const res = await request(app).post('/locations/new_location')
            .send({
                id: 'newloc',
                title: 'newtitle',
                latitude: 12,
                longitude: 32
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({id: 'newloc'});
    });

    test('works for duplicate location', async function() {
        const res = await request(app).post('/locations/new_location')
            .send({
                id: 'test1',
                title: 'loc1',
                latitude: 50,
                longitude: 35
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({id: 'test1'});
    });
});


describe("PATCH /rating/:username", function() {
    test('works, location already rated', async function() {
        const res = await request(app).patch('/locations/rating/user1')
            .send({
                id: 'test1',
                username: 'user1',
                rating: 1
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({id: 'test1', rating: '1'});
    });

    test('works, location not rated', async function() {
        const res = await request(app).patch('/locations/rating/user1')
            .send({
                id: 'test2',
                username: 'user1',
                rating: 1
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({id: 'test2', rating: '1'});
    });

    test('fails wrong user', async function() {
        const res = await request(app).patch('/locations/rating/user2')
            .send({
                id: 'test1',
                username: 'user2',
                rating: 1
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toEqual(401);
    });

    test('fails not logged in', async function() {
        const res = await request(app).patch('/locations/rating/user1')
            .send({
                id: 'test1',
                username: 'user1',
                rating: 1
            });
        expect(res.statusCode).toEqual(401);
    });
});


describe("GET /:location/:username", function() {
    test('works', async function() {
        const res = await request(app).get('/locations/test1/user1')
            .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({userRating: '4', overallRating: '4.50'});
    });

    test('works location not rated', async function() {
        const res = await request(app).get('/locations/test2/user1')
            .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({userRating: "You haven't rated this location yet.",
                                    overallRating: "No ratings yet."})
    })

    test('fails wrong user', async function() {
        const res = await request(app).get('/locations/test1/user2')
            .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toEqual(401);
    });

    test('fails not logged in', async function() {
        const res = await request(app).get('/locations/test1/user1');
        expect(res.statusCode).toEqual(401);
    });
});