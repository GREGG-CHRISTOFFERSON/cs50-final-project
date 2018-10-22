CREATE TABLE businesses (
    id VARCHAR NOT NULL PRIMARY KEY,
    name VARCHAR,
    url VARCHAR,
    price VARCHAR,
    rating REAL,
    review_count INTEGER,
    phone VARCHAR,
    photos VARCHAR,
    categories VARCHAR,
    coordinates VARCHAR,
    location VARCHAR,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE location_businesses (
    location VARCHAR NOT NULL PRIMARY KEY,
    businesses VARCHAR,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);