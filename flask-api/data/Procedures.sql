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

-- Register judges usernames

DELIMITER //

Drop Procedure If Exists spEditUser;

CREATE Procedure spEditUser (IN p_curr_username varchar(64), IN p_new_username varchar(64), IN p_fname varchar(32), IN p_lname varchar(32), IN p_email varchar(64), IN p_country INT, IN p_username_uva varchar(64), IN p_username_icpc varchar(64))
BEGIN
IF(SELECT exists (SELECT username from Users where p_new_username = username) AND p_curr_username != p_new_username) THEN
    SELECT CONCAT(p_new_username, ' already registered');
ELSEIF(p_curr_username != (SELECT username from Users where p_email = email)) THEN
    SELECT CONCAT(p_email, ' already registered');
ELSEIF(p_curr_username != (SELECT username from Users where p_username_uva = iduva)) THEN
    SELECT CONCAT(p_username_uva, ' already registered');
ELSEIF(p_curr_username != (SELECT username from Users where p_username_icpc = idicpc)) THEN
    SELECT CONCAT(p_username_icpc, ' already registered');
ELSE
    UPDATE Users
    SET username = p_new_username,
        fname = p_fname,
        lname = p_lname,
        email = p_email,
        country = p_country,
        iduva = p_username_uva,
        idicpc = p_username_icpc
    WHERE p_curr_username = username;
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
