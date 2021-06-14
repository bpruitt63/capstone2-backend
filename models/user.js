const db = require('../db');
const bcrypt = require('bcrypt');
const {sqlForPartialUpdate} = require('../helpers')
const { BadRequestError, UnauthorizedError, NotFoundError } = require('../expressError');

const { BCRYPT_WORK_FACTOR } = require("../config.js");

class User {

    static async register({username, password, email, zipCode, country, units}) {
        const isDuplicate = await db.query(
            `SELECT username
            FROM users
            WHERE username = $1`,
            [username]
        );
        if (isDuplicate.rows[0]) {
            throw new BadRequestError("Username already taken");
        };

        const hashedPwd = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

        const result = await db.query(
            `INSERT INTO users
                    (username, 
                    hashed_pwd, 
                    email, 
                    zip_code,
                    country,
                    units) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING username, zip_code AS "zipCode", country, units`, 
            [username, hashedPwd, email, zipCode, country, units]
        );

        const user = result.rows[0];
        return user;
    };

    static async login(username, password) {
        const result = await db.query(
            `SELECT username, 
                    hashed_pwd AS "hashedPwd",
                    zip_code AS "zipCode",
                    country,
                    units
            FROM users 
            WHERE username = $1`,
            [username]
        );

        const user = result.rows[0];

        if (user) {
            const isValid = await bcrypt.compare(password, user.hashedPwd);
            if (isValid === true) {
                delete user.hashedPwd;
                return user;
            };
        };

        throw new UnauthorizedError("Invalid username/password");
    };

    static async get(username) {
        const result = await db.query(
            `SELECT username,
                    zip_code AS "zipCode",
                    country,
                    email,
                    units
            FROM users
            WHERE username = $1`,
            [username]
        );

        let user = result.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);

        return user;
    };

    static async update(username, data) {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
        };

        const {setCols, values} = sqlForPartialUpdate(
            data,
            {zipCode: "zip_code",
            password: "hashed_pwd"}
        );
        const usernameVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE users 
                        SET ${setCols} 
                        WHERE username = ${usernameVarIdx} 
                        RETURNING username,
                                    zip_code AS "zipCode",
                                    country,
                                    email,
                                    units`;
        const result = await db.query(querySql, [...values, username]);
        const user = result.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);

        delete user.password;
        return user;
    };
};

module.exports = User;