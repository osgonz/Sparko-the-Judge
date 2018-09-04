CREATE TABLE Users (
	username VARCHAR(64) NOT NULL PRIMARY KEY,
    fname VARCHAR(32) NOT NULL,
    lname VARCHAR(32) NOT NULL,
	password VARCHAR(255) NOT NULL,
    email VARCHAR(64) UNIQUE NOT NULL,
	usertype INT NOT NULL,
	country INT,
	iduva VARCHAR(64) UNIQUE,
	idicpc VARCHAR(64) UNIQUE
);

INSERT INTO Users
VALUES ("admin","Admin","Admin","admin","admin@admin.com",0,NULL,NULL,NULL),
	   ("osdagoso","Oscar","Gonzalez","osgo2030","osdagoso@hotmail.com",1,NULL,NULL,NULL);