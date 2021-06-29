CREATE TABLE users (
    username TEXT PRIMARY KEY,
    hashed_pwd TEXT NOT NULL,
    email TEXT NOT NULL,
    zip_code VARCHAR(12) NOT NULL,
    country CHAR(2) NOT NULL,
    units CHAR(1) NOT NULL
);

CREATE TABLE locations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    latitude TEXT NOT NULL,
    longitude TEXT NOT NULL
);

CREATE TABLE location_ratings (
    location_id TEXT
        REFERENCES locations ON DELETE CASCADE,
    username TEXT
        REFERENCES users ON DELETE CASCADE,
    rating NUMERIC NOT NULL,
    PRIMARY KEY (location_id, username)
);

CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    trip_name VARCHAR(30) NOT NULL,
    distance NUMERIC NOT NULL
);

CREATE TABLE trip_locations (
    trip_id INTEGER
        REFERENCES trips ON DELETE CASCADE,
    location_id TEXT
        REFERENCES locations ON DELETE CASCADE,
    location_position INTEGER NOT NULL,
    PRIMARY KEY (trip_id, location_id, location_position)
);

CREATE TABLE user_trips (
    trip_id INTEGER
        REFERENCES trips ON DELETE CASCADE,
    username TEXT
        REFERENCES users ON DELETE CASCADE,
    trip_rating NUMERIC,
    PRIMARY KEY (trip_id, username)
);