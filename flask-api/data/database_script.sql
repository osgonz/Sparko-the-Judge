DROP DATABASE CoProManager;

CREATE DATABASE CoProManager;

USE CoProManager;

-- ---- Users table ---- --
-- usertype:
--      0 -> Admin
--      1 -> Regular user
CREATE TABLE Users (
	userID INT NOT NULL AUTO_INCREMENT,
	username VARCHAR(64) NOT NULL,
    fname VARCHAR(32) NOT NULL,
    lname VARCHAR(32) NOT NULL,
	password VARCHAR(255) NOT NULL,
    email VARCHAR(64) UNIQUE NOT NULL,
	usertype INT NOT NULL,
	country INT,
	iduva VARCHAR(64) UNIQUE,
	idicpc VARCHAR(64) UNIQUE,
	PRIMARY KEY (userID)
);

-- ---- Problems table ---- --
CREATE TABLE Problems (
	problemID INT NOT NULL AUTO_INCREMENT,
	judge INT NOT NULL,
	problemName VARCHAR(255) NOT NULL UNIQUE,
	url VARCHAR(255) NOT NULL,
	PRIMARY KEY (problemID)
);

-- ---- Contest table ---- --
-- status:
--      0 -> Not started
--      1 -> Ongoing
--      2 -> Ended
CREATE TABLE Contest (
	contestID INT NOT NULL AUTO_INCREMENT,
	contestName VARCHAR(255) NOT NULL,
	description VARCHAR(255) NOT NULL,
	startDate DATETIME NOT NULL,
	endDate DATETIME NOT NULL,
	status INT NOT NULL,
	ownerID INT NOT NULL,
	FOREIGN KEY (ownerID) REFERENCES Users (userID),
	PRIMARY KEY (contestID)
);

-- ---- Submission table ---- --
-- result:
--      10 -> Submission error
--      15 -> Can't be judged
--      20 -> In queue
--      30 -> Compile error
--      35 -> Restricted function
--      40 -> Runtime error
--      45 -> Output limit
--      50 -> Time limit
--      60 -> Memory limit
--      70 -> Wrong answer
--      80 -> PresentationE
--      90 -> Accepted
CREATE TABLE Submission (
	submissionID INT NOT NULL AUTO_INCREMENT,
	submissionTime TIMESTAMP,
	result INT NOT NULL,
	language VARCHAR(64) NOT NULL,
	score INT NOT NULL,
	problemID INT NOT NULL,
	submitter INT NOT NULL,
	contestID INT NOT NULL,
	FOREIGN KEY (problemID) REFERENCES Problems (problemID),
	FOREIGN KEY (submitter) REFERENCES Users (userID),
	FOREIGN KEY (contestID) REFERENCES Contest (contestID),
	PRIMARY KEY (submissionID)
);

-- ---- Problem in contest table ---- --
CREATE TABLE ContestProblem (
	contestID INT NOT NULL,
	problemID INT NOT NULL,
	FOREIGN KEY (contestID) REFERENCES Contest (contestID),
	FOREIGN KEY (problemID) REFERENCES Problems (problemID),
	PRIMARY KEY (contestID, problemID)
);

-- ---- User enrolled in contest table ---- --
CREATE TABLE ContestUser (
	contestID INT NOT NULL,
	userID INT NOT NULL,
	score INT NOT NULL,
	standing INT NOT NULL,
	FOREIGN KEY (contestID) REFERENCES Contest (contestID),
	FOREIGN KEY (userID) REFERENCES Users (userID),
	PRIMARY KEY (contestID, userID)
);

-- ---- Insert dummy values ---- -

INSERT INTO Users VALUES
	(NULL, "admin", "Admin", "Admin", "admin", "admin@admin.com", 0, NULL, NULL, NULL),
	(NULL, "ggalvez", "Gerardo", "Galvez", "holahola", "ggalvez@hotmail.com", 1, NULL, NULL, NULL),
	(NULL, "osdagoso", "Oscar", "Gonzalez", "osgo2030", "osdagoso@hotmail.com", 1, NULL, NULL, NULL),
	(NULL, "lrojo", "Luis", "Rojo", "holahola", "lrojo@hotmail.com", 1, NULL, NULL, NULL),
	(NULL, "ebustillos", "Edgar", "Bustillos", "holahola", "ebustillos@hotmail.com", 1, NULL, NULL, NULL);

INSERT INTO Problems VALUES
	(NULL, 0, "Weather Report", "https://icpcarchive.ecs.baylor.edu/index.php?option=com_onlinejudge&Itemid=8&category=671&page=show_problem&problem=5173"),
	(NULL, 0, "Keyboarding", "https://icpcarchive.ecs.baylor.edu/index.php?option=com_onlinejudge&Itemid=8&category=671&page=show_problem&problem=5167"),
	(NULL, 0, "Cutting Cheese", "https://icpcarchive.ecs.baylor.edu/index.php?option=com_onlinejudge&Itemid=8&category=671&page=show_problem&problem=5165"),
	(NULL, 0, "Tile Cutting", "https://icpcarchive.ecs.baylor.edu/index.php?option=com_onlinejudge&Itemid=8&category=671&page=show_problem&problem=5171");

INSERT INTO Contest VALUES
	(NULL, "Concurso de Gerardo", "Mi primer concurso (Gerardo)", "2018-12-15 13:00:00", "2019-01-22 13:00:00", 0, (SELECT userID FROM Users WHERE email = "ggalvez@hotmail.com")),
	(NULL, "Concurso de Oscar 1", "Mi primer concurso (Oscar)", "2017-09-15 13:00:00", "2019-09-22 13:00:00", 1, (SELECT userID FROM Users WHERE email = "osdagoso@hotmail.com")),
	(NULL, "Concurso de Oscar 2", "Mi segundo concurso (Oscar)", "2017-09-15 13:00:00", "2019-09-22 13:00:00", 1, (SELECT userID FROM Users WHERE email = "osdagoso@hotmail.com")),
	(NULL, "Concurso de Oscar 3", "Mi tercer concurso (Oscar)", "2017-09-15 13:00:00", "2017-12-22 13:00:00", 2, (SELECT userID FROM Users WHERE email = "osdagoso@hotmail.com"));

INSERT INTO Submission VALUES
	(NULL, "2018-09-16 15:25:00", 50, "C++", 0, (SELECT problemID FROM Problems WHERE problemName = "Weather Report"), (SELECT userID FROM Users WHERE email = "ggalvez@hotmail.com"), (SELECT contestID FROM Contest WHERE description = "Mi primer concurso (Oscar)")),
	(NULL, "2018-09-16 15:15:00", 50, "C++", 0, (SELECT problemID FROM Problems WHERE problemName = "Weather Report"), (SELECT userID FROM Users WHERE email = "ebustillos@hotmail.com"), (SELECT contestID FROM Contest WHERE description = "Mi primer concurso (Oscar)")),
	(NULL, "2018-09-16 15:05:00", 50, "C++", 0, (SELECT problemID FROM Problems WHERE problemName = "Weather Report"), (SELECT userID FROM Users WHERE email = "ebustillos@hotmail.com"), (SELECT contestID FROM Contest WHERE description = "Mi primer concurso (Oscar)")),
	(NULL, "2018-09-16 14:25:00", 50, "C++", 0, (SELECT problemID FROM Problems WHERE problemName = "Keyboarding"), (SELECT userID FROM Users WHERE email = "lrojo@hotmail.com"), (SELECT contestID FROM Contest WHERE description = "Mi primer concurso (Oscar)")),
	(NULL, "2018-09-16 14:15:00", 50, "C++", 0, (SELECT problemID FROM Problems WHERE problemName = "Keyboarding"), (SELECT userID FROM Users WHERE email = "lrojo@hotmail.com"), (SELECT contestID FROM Contest WHERE description = "Mi primer concurso (Oscar)")),
	(NULL, "2018-09-16 14:05:00", 50, "C++", 0, (SELECT problemID FROM Problems WHERE problemName = "Keyboarding"), (SELECT userID FROM Users WHERE email = "ggalvez@hotmail.com"), (SELECT contestID FROM Contest WHERE description = "Mi primer concurso (Oscar)")),
	(NULL, "2018-09-16 15:25:00", 50, "C++", 0, (SELECT problemID FROM Problems WHERE problemName = "Cutting Cheese"), (SELECT userID FROM Users WHERE email = "ggalvez@hotmail.com"), (SELECT contestID FROM Contest WHERE description = "Mi segundo concurso (Oscar)")),
	(NULL, "2018-09-16 15:15:00", 50, "C++", 0, (SELECT problemID FROM Problems WHERE problemName = "Weather Report"), (SELECT userID FROM Users WHERE email = "ebustillos@hotmail.com"), (SELECT contestID FROM Contest WHERE description = "Mi segundo concurso (Oscar)")),
	(NULL, "2018-09-16 15:05:00", 50, "C++", 0, (SELECT problemID FROM Problems WHERE problemName = "Cutting Cheese"), (SELECT userID FROM Users WHERE email = "ebustillos@hotmail.com"), (SELECT contestID FROM Contest WHERE description = "Mi segundo concurso (Oscar)")),
	(NULL, "2018-09-16 14:25:00", 50, "C++", 0, (SELECT problemID FROM Problems WHERE problemName = "Tile Cutting"), (SELECT userID FROM Users WHERE email = "ggalvez@hotmail.com"), (SELECT contestID FROM Contest WHERE description = "Mi segundo concurso (Oscar)")),
	(NULL, "2018-09-16 14:15:00", 50, "C++", 0, (SELECT problemID FROM Problems WHERE problemName = "Cutting Cheese"), (SELECT userID FROM Users WHERE email = "lrojo@hotmail.com"), (SELECT contestID FROM Contest WHERE description = "Mi segundo concurso (Oscar)")),
	(NULL, "2018-09-16 14:05:00", 50, "C++", 0, (SELECT problemID FROM Problems WHERE problemName = "Keyboarding"), (SELECT userID FROM Users WHERE email = "lrojo@hotmail.com"), (SELECT contestID FROM Contest WHERE description = "Mi tercer concurso (Oscar)"));

INSERT INTO ContestProblem VALUES
	((SELECT contestID FROM Contest WHERE description = "Mi primer concurso (Oscar)"), (SELECT problemID FROM Problems WHERE problemName = "Weather Report")),
	((SELECT contestID FROM Contest WHERE description = "Mi primer concurso (Oscar)"), (SELECT problemID FROM Problems WHERE problemName = "Keyboarding")),
	((SELECT contestID FROM Contest WHERE description = "Mi segundo concurso (Oscar)"), (SELECT problemID FROM Problems WHERE problemName = "Weather Report")),
	((SELECT contestID FROM Contest WHERE description = "Mi segundo concurso (Oscar)"), (SELECT problemID FROM Problems WHERE problemName = "Cutting Cheese")),
	((SELECT contestID FROM Contest WHERE description = "Mi segundo concurso (Oscar)"), (SELECT problemID FROM Problems WHERE problemName = "Tile Cutting")),
	((SELECT contestID FROM Contest WHERE description = "Mi tercer concurso (Oscar)"), (SELECT problemID FROM Problems WHERE problemName = "Keyboarding"));

INSERT INTO ContestUser VALUES
	((SELECT contestID FROM Contest WHERE description = "Mi primer concurso (Oscar)"), (SELECT userID FROM Users WHERE email = "ggalvez@hotmail.com"), 0, 3),
	((SELECT contestID FROM Contest WHERE description = "Mi primer concurso (Oscar)"), (SELECT userID FROM Users WHERE email = "ebustillos@hotmail.com"), 0, 3),
	((SELECT contestID FROM Contest WHERE description = "Mi primer concurso (Oscar)"), (SELECT userID FROM Users WHERE email = "lrojo@hotmail.com"), 0, 3),
	((SELECT contestID FROM Contest WHERE description = "Mi segundo concurso (Oscar)"), (SELECT userID FROM Users WHERE email = "ggalvez@hotmail.com"), 0, 3),
	((SELECT contestID FROM Contest WHERE description = "Mi segundo concurso (Oscar)"), (SELECT userID FROM Users WHERE email = "ebustillos@hotmail.com"), 0, 3),
	((SELECT contestID FROM Contest WHERE description = "Mi segundo concurso (Oscar)"), (SELECT userID FROM Users WHERE email = "lrojo@hotmail.com"), 0, 3),
	((SELECT contestID FROM Contest WHERE description = "Mi tercer concurso (Oscar)"), (SELECT userID FROM Users WHERE email = "lrojo@hotmail.com"), 0, 1);
