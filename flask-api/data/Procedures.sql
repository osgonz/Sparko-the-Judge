USE CoProManager;

################################################################################
#                                                                              #
#                             DROP ALL PROCEDURES                              #
#                                                                              #
################################################################################
Drop Procedure If Exists spCreateUser;
Drop Procedure If Exists spAuthentication;
Drop Procedure If Exists spGetUserType;
Drop Procedure If Exists spEditUser;
Drop Procedure If Exists spEditJudgesUsernames;
Drop Procedure If Exists spEditPassword;
Drop Procedure If Exists spGetCountries;
Drop Procedure If Exists spGetOwnedContests;
Drop Procedure If Exists spGetInvitedContests;
Drop Procedure If Exists spGetContestProblems;
Drop Procedure If Exists spGetUserSubmissionsInContest;
Drop Procedure If Exists spGetSubmissionsInContest;
Drop Procedure If Exists spGetContestStandings;
Drop Procedure If Exists spGetContestOwner;
Drop Procedure If Exists spGetUserID;
Drop Procedure If Exists spCreateContest;
Drop Procedure If Exists spGetContestInformation;
Drop Procedure If Exists spGetContestUserUsername;
Drop Procedure If Exists spGetContestScoresPerProblem;
Drop Procedure If Exists spGetUserList;
Drop Procedure If Exists spBanUser;
Drop Procedure If Exists spEditContest;
Drop Procedure If Exists spRemoveUserFromContest;
Drop Procedure If Exists spAddUserToContest;


################################################################################
#                                                                              #
#                             CREATE ALL PROCEDURES                            #
#                                                                              #
################################################################################

-- Create User
DELIMITER //

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

-- Authentication
DELIMITER //

CREATE Procedure spAuthentication (IN p_username varchar(64))
BEGIN
    SELECT * from Users where p_username = username;
END //

---- User Type

DELIMITER //

CREATE Procedure spGetUserType (IN p_username varchar(64))
BEGIN
    SELECT userType from Users where p_username = username;
END //

-- Edit user information
DELIMITER //

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

CREATE PROCEDURE spEditPassword (IN p_username varchar(64), IN p_new_password varchar(255))
BEGIN
  UPDATE Users
  SET password = p_new_password
  WHERE username = p_username;
END //

-- Get Countries
DELIMITER //

CREATE Procedure spGetCountries ()
BEGIN
    SELECT country_name from Countries;
END //

-- Get owned Contests
DELIMITER //

CREATE Procedure spGetOwnedContests (IN p_ownerusername varchar(64))
BEGIN
    SELECT contestID, contestName, description, startDate, endDate, status from Contest where (SELECT userID FROM Users WHERE username = p_ownerusername) = ownerID;
END //

---- Get invited Contests
DELIMITER //

CREATE Procedure spGetInvitedContests (IN p_username varchar(64))
BEGIN
    SELECT contestID, contestName, description, startDate, endDate, status from Contest where contestID in (SELECT contestID from Contestuser where userID = (SELECT userID FROM Users WHERE username = p_username));
END //

-- Get Contest Problems information
DELIMITER //

CREATE PROCEDURE spGetContestProblems (IN p_contestID INT)
BEGIN
	SELECT P.* FROM ContestProblem CP, Problems P WHERE CP.problemID = P.problemID AND CP.contestID = p_contestID;
END //

-- Get User's Submissions in Contest
DELIMITER //

CREATE PROCEDURE spGetUserSubmissionsInContest (IN p_userID INT, IN p_contestID INT)
BEGIN
	SELECT U.username, P.problemName, P.judge, P.url, S.result, S.language, S.submissionTime
	FROM Submission S, Problems P, Users U
	WHERE S.contestID = p_contestID AND S.submitter = p_userID AND S.submitter = U.userID AND S.problemID = P.problemID
	ORDER BY S.submissionTime DESC;
	
END //

-- Get All Submissions in Contest
DELIMITER //

CREATE PROCEDURE spGetSubmissionsInContest (IN p_contestID INT)
BEGIN
	SELECT U.username, P.problemName, P.judge, P.url, S.result, S.language, S.submissionTime
	FROM Submission S, Problems P, Users U
	WHERE S.contestID = p_contestID AND S.submitter = U.userID AND S.problemID = P.problemID
	ORDER BY S.submissionTime DESC;

END //

-- Get Contest Standings
DELIMITER //

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

CREATE PROCEDURE spGetContestOwner (IN p_contestID INT)
BEGIN
	SELECT U.username
	FROM Contest C, Users U
	WHERE C.contestID = p_contestID AND C.ownerID = U.userID;

END //

-- Get User ID
DELIMITER //

CREATE procedure spGetUserID (IN p_username varchar(64))
BEGIN
	SELECT userID FROM users WHERE username = p_username;
END //


-- Create Contest
DELIMITER //

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

-- Get Contest Information
DELIMITER //

CREATE PROCEDURE spGetContestInformation (IN p_contestID INT)
BEGIN
	SELECT *
  FROM Contest
  WHERE contestID = p_contestID;

END //

-- Get Contest User's Username
DELIMITER //

CREATE PROCEDURE spGetContestUserUsername (IN p_userID INT, IN p_contestID INT)
BEGIN
	SELECT U.username
  FROM ContestUser CU, Users U
  WHERE CU.contestID = p_contestID AND CU.userID = p_userID AND CU.userID = U.userID;

END //

-- Get Contest Scores Per Problem
DELIMITER //

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


DELIMITER //

CREATE Procedure spGetUserList (IN p_userType INT)
BEGIN
    IF(p_userType = 0) THEN
        SELECT userID AS id, username, CONCAT(fname, " ",lname) AS fullName, usertype AS userType, iduva AS uvaUsername, idicpc AS icpcUsername 
        FROM Users
        WHERE usertype != 0;
    ELSE
        SELECT userID AS id, username, CONCAT(fname, " ",lname) AS fullName, usertype AS userType, iduva AS uvaUsername, idicpc AS icpcUsername 
        FROM Users
        WHERE usertype = 1;
    END IF;
END //

DELIMITER //

CREATE Procedure spBanUser (IN p_userID varchar(64))
BEGIN
    IF(SELECT exists (SELECT * FROM Users WHERE userID=p_userID AND usertype=0)) THEN
        SELECT 'You cant ban an administrator';
    ELSEIF(SELECT exists (SELECT * FROM Users WHERE userID=p_userID AND usertype=2)) THEN
        SELECT 'User already banned';
    ELSE
        UPDATE Users 
        SET Users.usertype = 2
        WHERE Users.userID = p_userID;
    END IF;
END //

                          
-- Edit contest information
DELIMITER //

CREATE Procedure spEditContest (IN p_contestID INT, IN p_new_contestName varchar(255), IN p_new_description varchar(255), IN p_new_startDate DATETIME, IN p_new_endDate DATETIME, IN p_new_status INT)
BEGIN
    UPDATE contest
    SET contestName = p_new_contestName,
        description = p_new_description,
        startDate = p_new_startDate,
        endDate = p_new_endDate,
        status = p_new_status
    WHERE p_contestID = contestID;
END //

-- Add User to Contest
DELIMITER //

CREATE Procedure spAddUserToContest (IN username varchar(64), IN contestID varchar(64))
BEGIN
    IF(SELECT EXISTS (SELECT ContestUser.userID, ContestUser.contestID from ContestUser INNER JOIN Users ON (SELECT Users.userID FROM Users where Users.username = username) = ContestUser.userID Where ContestUser.contestID = contestID)) THEN
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
