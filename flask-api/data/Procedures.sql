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

---- User Type

DELIMITER //

Drop Procedure If Exists spGetUserType;

CREATE Procedure spAuthentication (IN p_username varchar(64))
BEGIN
    SELECT userType from Users where p_username = username;
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

-- Add User to Contest
DELIMITER //

Drop Procedure If Exists spAddUserToContest;

CREATE Procedure spAddUserToContest (IN username varchar(64), IN contestID varchar(64))
BEGIN
    IF(SELECT exists (SELECT ContestUser.userID, ContestUser.contestID, Users.username from ContestUser INNER JOIN Users ON Users.userID=ContestUser.userID 
                      WHERE contestID=ContestUser.contestID AND username=Users.username)) THEN
        SELECT CONCAT(username, ' already registered to Contest');
    ELSE 
        INSERT ContestUser VALUES(contestID,(SELECT userID FROM Users Where username = Users.username),0,0);
    END IF;
END

-- Remove User From Contest
DELIMITER //

CREATE Procedure spRemoveUserFromContest (IN username varchar(64), IN contestID varchar(64))
BEGIN
    IF(SELECT exists (SELECT ContestUser.userID, ContestUser.contestID, Users.username from ContestUser INNER JOIN Users ON Users.userID=ContestUser.userID WHERE contestID=ContestUser.contestID AND username=Users.username)) THEN
        DELETE FROM ContestUser WHERE ContestUser.userID IN (SELECT Users.userID FROM Users WHERE username = Users.username) AND contestID = ContestUser.contestID;
    ELSE 
    	SELECT CONCAT(username, ' not registered to Contest');
    END IF;
END

-- Get owned Contests

DELIMITER //

Drop Procedure If Exists spGetOwnedContests;

CREATE Procedure spGetOwnedContests (IN p_ownerusername varchar(64))
BEGIN
    SELECT contestName, description, startDate, endDate, status, contestID from Contest where (SELECT userID FROM Users WHERE username = p_ownerusername) = ownerID;
END //

---- Get invited Contests

DELIMITER //

Drop Procedure If Exists spGetInvitedContests;

CREATE Procedure spGetInvitedContests (IN p_username varchar(64))
BEGIN
    SELECT contestName, description, startDate, endDate, status from Contest where contestID = (SELECT contestID from Contestuser where userID = (SELECT userID FROM Users WHERE username = p_username));
END //

-- Get Contest Problems information

DELIMITER //

Drop Procedure If Exists spGetContestProblems;

CREATE PROCEDURE spGetContestProblems (IN p_contestID INT)
BEGIN
	SELECT P.* FROM ContestProblem CP, Problems P WHERE CP.problemID = P.problemID AND CP.contestID = p_contestID;
END //

-- Get User's Submissions in Contest

DELIMITER //

Drop Procedure If Exists spGetUserSubmissionsInContest;

CREATE PROCEDURE spGetUserSubmissionsInContest (IN p_userID INT, IN p_contestID INT)
BEGIN
	SELECT U.username, P.problemName, P.judge, P.url, S.result, S.language, S.submissionTime
	FROM Submission S, Problems P, Users U
	WHERE S.contestID = p_contestID AND S.submitter = p_userID AND S.submitter = U.userID AND S.problemID = P.problemID
	ORDER BY S.submissionTime DESC;
	
END //

-- Get All Submissions in Contest

DELIMITER //

Drop Procedure If Exists spGetSubmissionsInContest;

CREATE PROCEDURE spGetSubmissionsInContest (IN p_contestID INT)
BEGIN
	SELECT U.username, P.problemName, P.judge, P.url, S.result, S.language, S.submissionTime
	FROM Submission S, Problems P, Users U
	WHERE S.contestID = p_contestID AND S.submitter = U.userID AND S.problemID = P.problemID
	ORDER BY S.submissionTime DESC;

END //

-- Get Contest Standings

DELIMITER //

Drop Procedure If Exists spGetContestStandings;

CREATE PROCEDURE spGetContestStandings (IN p_contestID INT)
BEGIN
	SELECT CU.userID, CU.standing, U.username, C.country_name, CU.score
	FROM ContestUser CU, Users U
  LEFT OUTER JOIN Countries C ON U.country = C.id
	WHERE CU.contestID = p_contestID AND CU.userID = U.userID
	ORDER BY CU.standing;
	
END //

-- Get Contest Owner

DELIMITER //

Drop Procedure If Exists spGetContestOwner;

CREATE PROCEDURE spGetContestOwner (IN p_contestID INT)
BEGIN
	SELECT U.username
	FROM Contest C, Users U
	WHERE C.contestID = p_contestID AND C.ownerID = U.userID;

END //

-- Get User ID

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

-- Edit Contest
DELIMITER //

Drop Procedure If Exists spEditContest;

CREATE PROCEDURE spEditContest (IN contestName varchar(255), IN description varchar(255), IN startDate DATETIME, IN endDate DATETIME, IN status INT, in p_username varchar(64))
BEGIN
    Update contest
    (
        contestName,
        description,
        startDate,
        endDate,
    )
    VALUES
    (
        contestName,
        description,
        startDate,
        endDate,
    )
    WHERE
    Contest.contestName == contestName;
END //

-- Get Contest Information

DELIMITER //

Drop Procedure If Exists spGetContestInformation;

CREATE PROCEDURE spGetContestInformation (IN p_contestID INT)
BEGIN
	SELECT *
  FROM Contest
  WHERE contestID = p_contestID;

END //

-- Get Contest User's Username

DELIMITER //

Drop Procedure If Exists spGetContestUserUsername;

CREATE PROCEDURE spGetContestUserUsername (IN p_userID INT, IN p_contestID INT)
BEGIN
	SELECT U.username
  FROM ContestUser CU, Users U
  WHERE CU.contestID = p_contestID AND CU.userID = p_userID AND CU.userID = U.userID;

END //

-- Get Contest Scores Per Problem

DELIMITER //

Drop Procedure If Exists spGetContestScoresPerProblem;

CREATE PROCEDURE spGetContestScoresPerProblem (IN p_problemID INT, IN p_contestID INT)
BEGIN
  SELECT SU.username, SU.result, SU.submissionCount, TIMESTAMPDIFF(SECOND, C.startDate, SU.submissionTime) as TimeDifference
  FROM (
      SELECT C.contestID, C.startDate
      FROM Contest C
      WHERE C.contestID = p_contestID
  ) C, (
      SELECT U.userID, S.contestID, U.username, COUNT(S.submissionID) AS submissionCount, MAX(S.result) AS result, MAX(S.submissionTime) AS submissionTime
      FROM (
          SELECT CU.userID, U.username
          FROM ContestUser CU, Users U
          WHERE CU.contestID = p_contestID AND CU.userID = U.userID
      ) U, (
          SELECT S.contestID, S.submissionID, S.result, S.submissionTime, S.submitter
          FROM submission S
          WHERE S.contestID = p_contestID AND S.problemID = p_problemID
      ) S
      WHERE U.userID = S.submitter
      GROUP BY U.userID
  ) SU
  WHERE SU.contestID = C.contestID
  ORDER BY SU.userID, SU.submissionTime DESC;
END //
