const { createToken, sqlForPartialUpdate } = require("../helpers");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");


describe("sqlForPartialUpdate", function () {
  test("works: 1 item", function () {
    const result = sqlForPartialUpdate(
        { f1: "v1" },
        { f1: "f1", fF2: "f2" });
    expect(result).toEqual({
        setCols: "\"f1\"=$1",
        values: ["v1"],
    });
  });

  test("works: 2 items", function () {
    const result = sqlForPartialUpdate(
        { f1: "v1", jsF2: "v2" },
        { jsF2: "f2" });
    expect(result).toEqual({
        setCols: "\"f1\"=$1, \"f2\"=$2",
        values: ["v1", "v2"],
    });
  });
});


describe("createToken", function () {
    test("works", function () {
        const token = createToken({ username: "test", zipCode: '55555', country: 'US' });
        const payload = jwt.verify(token, SECRET_KEY);
        expect(payload).toEqual({
            iat: expect.any(Number),
            username: "test",
            zipCode: '55555', 
            country: 'US'
        });
    });
});