USE CoProManager;

-- Create User
DELIMITER //

Drop Procedure If Exists spCreateUser;

CREATE PROCEDURE spCreateUser (IN p_username varchar(64),IN password varchar(255), IN fname varchar(32), IN lname varchar(32),IN p_email varchar(64), IN usertype INT)
BEGIN
IF(SELECT exists (SELECT * from Users where p_username = username)) THEN
    SELECT 'User already exists';
ELSEIF(SELECT exists (SELECT * from Users where p_email = email)) THEN
    SELECT 'Email already exists';
ELSE
    INSERT into Users
    (
        username,
        password,
        fname,
        lname,
        email,
        usertype
    )
    VALUES
    (
        p_username,
        password,
        fname,
        lname,
        p_email,
        usertype
    );
END IF;

END //

---- Authentication

DELIMITER //

Drop Procedure If Exists spAuthentication;

CREATE Procedure spAuthentication (IN p_username varchar(64))
BEGIN
    SELECT * from Users where p_username = username;
END //

-- Edit user information

DELIMITER //

Drop Procedure If Exists spEditUser;

CREATE Procedure spEditUser (IN p_curr_username varchar(64), IN p_new_username varchar(64), IN p_fname varchar(32), IN p_lname varchar(32), IN p_email varchar(64), IN p_country INT)
BEGIN
IF(SELECT exists (SELECT username from Users where p_new_username = username) AND p_curr_username != p_new_username) THEN
    SELECT CONCAT(p_new_username, ' already registered');
ELSEIF(p_curr_username != (SELECT username from Users where p_email = email)) THEN
    SELECT CONCAT(p_email, ' already registered');
ELSE
    UPDATE Users
    SET username = p_new_username,
        fname = p_fname,
        lname = p_lname,
        email = p_email,
        country = p_country
    WHERE p_curr_username = username;
END IF;

END //

-- Edit user online judges usernames

DELIMITER //

Drop Procedure If Exists spEditJudgesUsernames;

CREATE Procedure spEditJudgesUsernames (IN p_username varchar(64), IN p_username_uva varchar(64), IN p_username_icpc varchar(64))
BEGIN
IF(p_username != (SELECT username from Users where p_username_uva = iduva)) THEN
    SELECT CONCAT(p_username_uva, ' already registered (UVA)');
ELSEIF(p_username != (SELECT username from Users where p_username_icpc = idicpc)) THEN
    SELECT CONCAT(p_username_icpc, ' already registered (ICPC Live Archive)');
ELSE
    UPDATE Users
    SET iduva = p_username_uva,
        idicpc = p_username_icpc
    WHERE p_username = username;
END IF;

END //

-- Edit password

DELIMITER //

Drop Procedure If Exists spEditPassword;

CREATE PROCEDURE spEditPassword (IN p_username varchar(64), IN p_new_password varchar(255))
BEGIN
UPDATE Users
SET password = p_new_password
WHERE username = p_username;

END //

-- Get Countries

DELIMITER //

Drop Procedure If Exists spGetCountries;

CREATE Procedure spGetCountries ()
BEGIN
    SELECT country_name from Countries;
END //

-- Get owned Contests

DELIMITER //

Drop Procedure If Exists spGetOwnedContests;

CREATE Procedure spGetOwnedContests (IN p_ownerusername varchar(64))
BEGIN
    SELECT contestName, description, startDate, endDate, status from Contest where (SELECT userID FROM Users WHERE username = p_ownerusername) = ownerID;
END //

---- Get invited Contests

DELIMITER //

Drop Procedure If Exists spGetInvitedContests;

CREATE Procedure spGetInvitedContests (IN p_username varchar(64))
BEGIN
    SELECT contestName, description, startDate, endDate, status from Contest where contestID = (SELECT contestID from Contestuser where userID = (SELECT userID FROM Users WHERE username = p_username));
END //

-- Get userID

DELIMITER //

Drop Procedure If Exists spGetUserID;

CREATE procedure spGetUserID (IN p_username varchar(64))
BEGIN
	SELECT userID FROM users WHERE username = p_username;
END //


-- Create Contest
DELIMITER //

Drop Procedure If Exists spCreateContest;

CREATE PROCEDURE spCreateContest (IN contestName varchar(255), IN description varchar(255), IN startDate DATETIME, IN endDate DATETIME, IN status INT, in p_username varchar(64))
BEGIN
    INSERT into contest
    (
        contestName,
        description,
        startDate,
        endDate,
        status,
        ownerID
    )
    VALUES
    (
        contestName,
        description,
        startDate,
        endDate,
        status,
        (SELECT userID FROM Users WHERE username = p_username)
    );
END //

-- Edit contest information

DELIMITER //

Drop Procedure If Exists spEditContest;

CREATE Procedure spEditContest (IN p_ownerID INT, IN p_new_contestName varchar(255), IN p_new_description varchar(255), IN p_new_startDate DATETIME, IN p_new_endDate DATETIME, IN p_new_status INT)
BEGIN
    UPDATE contest
    SET contestName = p_new_contestName,
        description = p_new_description,
        startDate = p_new_startDate,
        endDate = p_new_endDate,
        status = p_new_status
    WHERE p_ownerID = ownerID;
END //
