DROP TABLE IF EXISTS pets;

CREATE TABLE pets (
    id serial PRIMARY KEY,
    age integer,
    name varchar(50),
    kind varchar(50)
);