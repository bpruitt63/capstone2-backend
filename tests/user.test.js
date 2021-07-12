const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const User = require("../models/user.js");
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

describe("login", function () {
    test("works", async function () {
        const user = await User.login("u1", "password1");
        expect(user).toEqual({
            username: "u1",
            zipCode: "55555",
            country: "US",
            units: "i"
        });
    });
  
    test("unauth if no such user", async function () {
        try {
            await User.login("nope", "password");
            fail();
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });
  
    test("unauth if wrong password", async function () {
        try {
            await User.login("u1", "wrong");
            fail();
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });
});


describe("register", function () {
    const newUser = {
        username: "new",
        zipCode: "12345",
        email: "test@test.com",
        country: 'US',
        units: 'i'
    };
  
    test("works", async function () {
        let user = await User.register({
            ...newUser,
            password: "password",
        });
        expect(user).toEqual({
            username: "new",
            zipCode: "12345",
            country: 'US',
            units: 'i'
        });
        const found = await db.query("SELECT * FROM users WHERE username = 'new'");
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].hashed_pwd.startsWith("$2b$")).toEqual(true);
    });
  
    test("bad request with dup data", async function () {
        try {
            await User.register({
            ...newUser,
            password: "password",
            });
            await User.register({
            ...newUser,
            password: "password",
            });
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});


describe("get", function () {
    test("works", async function () {
        let user = await User.get("u1");
        expect(user).toEqual({
            username: "u1",
            zipCode: "55555",
            country: "US",
            email: "u1@email.com",
            units: 'i'
        });
    });
  
    test("not found if no such user", async function () {
        try {
            await User.get("nope");
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});


describe("update", function () {
    const updateData = {
        zipCode: "98765",
        country: "CA",
        email: "new@email.com",
        units: 'm'
    };
  
    test("works", async function () {
        let res = await User.update("u1", updateData);
        expect(res).toEqual({
            username: "u1",
            ...updateData,
        });
    });
  
    test("works: set password", async function () {
        let res = await User.update("u1", {
            password: "new",
        });
        expect(res).toEqual({
            username: "u1",
            zipCode: "55555",
            country: "US",
            email: "u1@email.com",
            units: 'i',
        });
        const found = await db.query("SELECT * FROM users WHERE username = 'u1'");
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].hashed_pwd.startsWith("$2b$")).toEqual(true);
    });
  
    test("not found if no such user", async function () {
        try {
            await User.update("nope", {
            zipCode: "test",
            });
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});