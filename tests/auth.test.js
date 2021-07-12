const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const {
  authenticateJWT,
  ensureCorrectUser
} = require("../middleware/auth");
const { SECRET_KEY } = require("../config");

const testJwt = jwt.sign({ username: "test", zipCode: '55555', country: 'US' }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", zipCode: '55555', country: 'US' }, "wrong");


describe("authenticateJWT", function () {
    test("works: via header", function () {
        expect.assertions(2);
        const req = { headers: { authorization: `Bearer ${testJwt}` } };
        const res = { locals: {} };
        const next = function (err) {
            expect(err).toBeFalsy();
        };
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({
            user: {
            iat: expect.any(Number),
            username: "test",
            zipCode: '55555',
            country: 'US'
            },
        });
    });
  
    test("works: no header", function () {
        expect.assertions(2);
        const req = {};
        const res = { locals: {} };
        const next = function (err) {
            expect(err).toBeFalsy();
        };
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({});
    });
  
    test("works: invalid token", function () {
        expect.assertions(2);
        const req = { headers: { authorization: `Bearer ${badJwt}` } };
        const res = { locals: {} };
        const next = function (err) {
            expect(err).toBeFalsy();
        };
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({});
    });
});
  

describe("ensureCorrectUser", function () {
    test("works: correct user", function () {
        expect.assertions(1);
        const req = { params: { username: "test" } };
        const res = { locals: { user: { username: "test", zipCode: '55555', country: 'US' } } };
        const next = function (err) {
            expect(err).toBeFalsy();
        };
        ensureCorrectUser(req, res, next);
    });
  
    test("unauth: wrong user", function () {
        expect.assertions(1);
        const req = { params: { username: "wrong" } };
        const res = { locals: { user: { username: "test", zipCode: '55555', country: 'US' } } };
        const next = function (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        };
        ensureCorrectUser(req, res, next);
    });
  
    test("unauth: no user", function () {
        expect.assertions(1);
        const req = { params: { username: "test" } };
        const res = { locals: {} };
        const next = function (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        };
        ensureCorrectUser(req, res, next);
    });
});
  