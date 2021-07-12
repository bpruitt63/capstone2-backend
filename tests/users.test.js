const request = require("supertest");
const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token
} = require("./testCommonRoutes");
const { createToken } = require("../helpers.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe('POST /register', function() {
    test('works', async function() {
        const res = await request(app).post('/users/register')
            .send({
                username: 'newUser',
                password: 'newpassword',
                email: 'newtest@email.com',
                zipCode: '12345',
                country: 'US',
                units: 'i'
            })
        const user = {username: 'newUser',
                    zipCode: '12345',
                    country: 'US'}
        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({token: createToken(user)});
    });

    test("won't register duplicate", async function() {
        const res = await request(app).post('/users/register')
            .send({
                username: 'user1',
                password: 'newpassword',
                email: 'newtest@email.com',
                zipCode: '12345',
                country: 'US',
                units: 'i'
            })
        expect(res.statusCode).toEqual(400);
    });
});


describe('POST /login', function() {
    test('works', async function() {
        const res = await request(app).post('/users/login')
            .send({username: 'user1', password: 'password1'})
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({token: expect.any(String),
            location: {
                zipCode: '55555',
                country: 'US'
            }, 
            units: 'i'});
    });

    test('fails wrong password', async function() {
        const res = await request(app).post('/users/login')
            .send({username: 'user1', password: 'wrong'})
        expect(res.statusCode).toEqual(401);
    });
});


describe("GET /:username", function() {
    test('works', async function() {
        const res = await request(app).get('/users/user1')
            .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({user: {
            username: 'user1',
            zipCode: '55555',
            country: 'US',
            email: 'u1@user.com',
            units: 'i'
        }});
    });

    test("doesn't work w/ bad token", async function() {
        const res = await request(app).get('/users/user1')
            .set("authorization", `Bearer notatoken`);
        expect(res.statusCode).toEqual(401);
    });

    test("doesn't work w/ wrong user", async function() {
        const res = await request(app).get('/users/user2')
            .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toEqual(401);
    });
});


describe("PATCH /:username", function() {
    test('works', async function() {
        const res = await request(app).patch('/users/user1')
            .send({
                zipCode: '11111',
                country: 'CA',
                email: 'different@email.com',
                password: 'newpwd',
                units: 'm'
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({user: {
                                    username: 'user1',
                                    zipCode: '11111',
                                    country: 'CA',
                                    email: 'different@email.com',
                                    units: 'm'
        }});
    });

    test('works w/ partial update', async function() {
        const res = await request(app).patch('/users/user1')
            .send({
                zipCode: '11111',
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({user: {
                                    username: 'user1',
                                    zipCode: '11111',
                                    country: 'US',
                                    email: 'u1@user.com',
                                    units: 'i'
        }});
    });

    test("doesn't work bad token", async function() {
        const res = await request(app).patch('/users/user1')
            .send({
                zipCode: '11111',
                country: 'CA',
                email: 'different@email.com',
                password: 'newpwd',
                units: 'm'
            });
        expect(res.statusCode).toEqual(401);
    });

    test("doesn't work wrong user", async function() {
        const res = await request(app).patch('/users/user2')
            .send({
                zipCode: '11111',
                country: 'CA',
                email: 'different@email.com',
                password: 'newpwd',
                units: 'm'
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(res.statusCode).toEqual(401);
    });
});