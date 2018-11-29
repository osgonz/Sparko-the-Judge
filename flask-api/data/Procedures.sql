USE CoProManager;

################################################################################
#                                                                              #
#                             DROP ALL PROCEDURES                              #
#                                                                              #
################################################################################
DROP PROCEDURE If Exists spCreateUser;
DROP PROCEDURE If Exists spAuthentication;
DROP PROCEDURE If Exists spGetUserType;
DROP PROCEDURE If Exists spEditUser;
DROP PROCEDURE If Exists spEditJudgesUsernames;
DROP PROCEDURE If Exists spEditPassword;
DROP PROCEDURE If Exists spGetCountries;
DROP PROCEDURE If Exists spGetContests;
DROP PROCEDURE If Exists spGetOwnedContests;
DROP PROCEDURE If Exists spGetInvitedContests;
DROP PROCEDURE If Exists spGetContestProblems;
DROP PROCEDURE If Exists spGetUserSubmissionsInContest;
DROP PROCEDURE If Exists spGetSubmissionsInContest;
DROP PROCEDURE If Exists spGetContestStandings;
DROP PROCEDURE If Exists spGetContestOwner;
DROP PROCEDURE If Exists spGetUserID;
DROP PROCEDURE If Exists spCreateContest;
DROP PROCEDURE If Exists spGetContestInformation;
DROP PROCEDURE If Exists spGetContestUserUsername;
DROP PROCEDURE If Exists spGetContestScoresPerProblem;
DROP PROCEDURE If Exists spCreateProblem;
DROP PROCEDURE If Exists spGetUserList;
DROP PROCEDURE If Exists spAddProblemToContest;
DROP PROCEDURE If Exists spRemoveProblemFromContest;
DROP PROCEDURE If Exists spGetLastInsertedID;
DROP PROCEDURE If Exists spBanUser;
DROP PROCEDURE If Exists spEditContest;
DROP PROCEDURE If Exists spRemoveUserFromContest;
DROP PROCEDURE If Exists spAddUserToContest;
DROP PROCEDURE IF EXISTS spGetOngoingContestInfo;
DROP PROCEDURE If Exists spGetOngoingContestUsersInfo;
DROP PROCEDURE If Exists spUpdateContestUpcomingToOngoing;
DROP PROCEDURE IF EXISTS spGetAlmostFinishedContestInfo;
DROP PROCEDURE If Exists spUpdateContestOngoingToFinished;
DROP PROCEDURE IF EXISTS spInsertSubmission;
DROP PROCEDURE IF EXISTS spUpdateContestUser;
DROP PROCEDURE IF EXISTS spGetRegularUsers;
DROP PROCEDURE IF EXISTS spDeleteContest;
DROP PROCEDURE IF EXISTS spGetSubmissionsCountPerProblemPerResult;
DROP PROCEDURE IF EXISTS spGetSubmissionsCountPerLanguage;

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

CREATE PROCEDURE spAuthentication (IN p_username varchar(64))
BEGIN
    SELECT * from Users where p_username = username;
END //

---- User Type

DELIMITER //

CREATE PROCEDURE spGetUserType (IN p_username varchar(64))
BEGIN
    SELECT userType from Users where p_username = username;
END //

-- Edit user information
DELIMITER //

CREATE PROCEDURE spEditUser (IN p_curr_username varchar(64), IN p_new_username varchar(64), IN p_fname varchar(32), IN p_lname varchar(32), IN p_email varchar(64), IN p_country INT)
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

CREATE PROCEDURE spEditJudgesUsernames (IN p_username varchar(64), IN p_username_uva varchar(64), IN p_username_icpc varchar(64))
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

CREATE PROCEDURE spGetCountries ()
BEGIN
    SELECT country_name from Countries;
END //

-- Get Contests
DELIMITER //

CREATE PROCEDURE spGetContests ()
BEGIN
    SELECT contestID, contestName, description, startDate, endDate, status from Contest;
END //

-- Get owned Contests
DELIMITER //

CREATE PROCEDURE spGetOwnedContests (IN p_ownerusername varchar(64))
BEGIN
    SELECT contestID, contestName, description, startDate, endDate, status from Contest where (SELECT userID FROM Users WHERE username = p_ownerusername) = ownerID;
END //

---- Get invited Contests
DELIMITER //

CREATE PROCEDURE spGetInvitedContests (IN p_username varchar(64))
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
    SELECT SU.username, SU.result, SU.submissionCount, (TIMESTAMPDIFF(SECOND, C.startDate, SU.submissionTime) + SU.penalty) as TimeDifference
  FROM (
      SELECT C.contestID, C.startDate
      FROM Contest C
      WHERE C.contestID = p_contestID
  ) C, (
      SELECT U.userID, S.contestID, U.username, COUNT(S.submissionID) AS submissionCount, MAX(S.result) AS result, MAX(S.submissionTime) AS submissionTime, P.penalty
      FROM (
          SELECT CU.userID, U.username
          FROM ContestUser CU, Users U
          WHERE CU.contestID = p_contestID AND CU.userID = U.userID
      ) U, (
          SELECT S.contestID, S.submissionID, S.result, S.submissionTime, S.submitter
          FROM submission S
          WHERE S.contestID = p_contestID AND S.problemID = p_problemID
      ) S, (
          SELECT userID, IF(penalty, penalty, 0) AS penalty
          FROM contestuser
          LEFT OUTER JOIN (
              SELECT submitter, COUNT(submissionID) * 1200 AS penalty
              FROM submission
              WHERE contestID = p_contestID AND problemID = p_problemID AND result < 90
              GROUP BY submitter
          ) S ON submitter = userID
          WHERE contestID = p_contestID
      ) P
      WHERE U.userID = S.submitter AND S.submitter = P.userID
      GROUP BY U.userID
  ) SU
  WHERE SU.contestID = C.contestID
  ORDER BY SU.userID, TimeDifference DESC;
END //

DELIMITER //

CREATE PROCEDURE spCreateProblem (IN p_judge INT, IN p_judge_problemID INT, IN p_problemName VARCHAR(255), IN p_url VARCHAR(255))
BEGIN
  IF NOT EXISTS (SELECT 1 FROM Problems WHERE problemName = p_problemName) THEN
    INSERT INTO Problems
    (
      judge,
      judgeProblemID,
      problemName,
      url
    )
    VALUES
    (
      p_judge,
      p_judge_problemID,
      p_problemName,
      p_url
    );

  END IF;
END //

DELIMITER //

CREATE PROCEDURE spGetUserList (IN p_userType INT)
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

CREATE PROCEDURE spAddProblemToContest (IN p_contestID INT, IN p_problemName VARCHAR(255))
BEGIN
  IF NOT EXISTS (SELECT 1 FROM ContestProblem WHERE contestID = p_contestID AND problemID = (SELECT problemID FROM Problems WHERE problemName = p_problemName)) THEN
    INSERT INTO ContestProblem
    (
      contestID,
      problemID
    )
    VALUES
    (
      p_contestID,
      (SELECT problemID FROM Problems WHERE problemName = p_problemName)
    );
  END IF;
END //

DELIMITER //

CREATE PROCEDURE spRemoveProblemFromContest (IN p_contestID INT, IN p_problemName VARCHAR(255))
BEGIN
  IF EXISTS (SELECT 1 FROM ContestProblem WHERE contestID = p_contestID AND problemID = (SELECT problemID FROM Problems WHERE problemName = p_problemName)) THEN
    DELETE FROM ContestProblem
    WHERE contestID = p_contestID
    AND problemID = (SELECT problemID FROM Problems WHERE problemName = p_problemName);
  END IF;
END //

-- Get last inserted auto increment ID
DELIMITER //

CREATE PROCEDURE spGetLastInsertedID ()
BEGIN
  SELECT LAST_INSERT_ID();
END //

-- Ban a user
DELIMITER //

CREATE PROCEDURE spBanUser (IN p_userID varchar(64))
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

CREATE PROCEDURE spEditContest (IN p_contestID INT, IN p_new_contestName varchar(255), IN p_new_description varchar(255), IN p_new_startDate DATETIME, IN p_new_endDate DATETIME, IN p_new_status INT)
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

CREATE PROCEDURE spAddUserToContest (IN p_username varchar(64), IN p_contestID varchar(64))
BEGIN
    IF NOT EXISTS (SELECT 1 FROM ContestUser WHERE contestID = p_contestID AND userID = (SELECT userID FROM Users WHERE username = p_username)) THEN
      INSERT INTO ContestUser

      VALUES
      (
        p_contestID,
        (SELECT userID FROM Users WHERE username = p_username),
        0,
        1
      );
    END IF;
END //

-- Remove User From Contest
DELIMITER //

CREATE PROCEDURE spRemoveUserFromContest (IN p_username varchar(64), IN p_contestID varchar(64))
BEGIN
    IF EXISTS (SELECT 1 FROM ContestUser WHERE contestID = p_contestID AND userID = (SELECT userID FROM Users WHERE username = p_username)) THEN
      DELETE FROM ContestUser
      WHERE contestID = p_contestID
      AND userID = (SELECT userID FROM Users WHERE username = p_username);
    END IF;
END //

-- Get Ongoing Contest Info
DELIMITER //

CREATE PROCEDURE spGetOngoingContestInfo()
BEGIN
	SELECT contestID, startDate, endDate
	FROM Contest
	WHERE status = 1;
END //

-- Get Ongoing Contest Users Info
DELIMITER //

CREATE PROCEDURE spGetOngoingContestUsersInfo (IN p_contestID INT)
BEGIN
	SELECT CU.userID, U.username, U.iduva, U.idicpc, C.country_name
	FROM ContestUser CU, Users U
	LEFT OUTER JOIN Countries C ON U.country = C.id
	WHERE CU.contestID = p_contestID AND CU.userID = U.userID
	ORDER BY CU.userID;

END //

-- Contest Update Upcoming to Ongoing
DELIMITER //

CREATE PROCEDURE spUpdateContestUpcomingToOngoing()
BEGIN
	UPDATE Contest
	SET status = 1
	WHERE status = 0 AND startDate < CURRENT_TIMESTAMP AND endDate > CURRENT_TIMESTAMP;

END //

-- Get Almost Finished Contest Info
DELIMITER //

CREATE PROCEDURE spGetAlmostFinishedContestInfo()
BEGIN
	SELECT contestID, startDate, endDate, CURRENT_TIMESTAMP AS currentDate
	FROM Contest
	WHERE status = 1 AND endDate <= CURRENT_TIMESTAMP;
END //

-- Contest Update Ongoing to Finished
DELIMITER //

CREATE PROCEDURE spUpdateContestOngoingToFinished(IN p_updateDate DATETIME)
BEGIN
	UPDATE Contest
	SET status = 2
	WHERE status = 1 AND endDate <= p_updateDate;

END //

-- Insert Finished Contest Submission
DELIMITER //

CREATE PROCEDURE spInsertSubmission(IN p_subDate DATETIME, IN p_result INT, IN p_language VARCHAR(64), IN p_problemID INT, IN p_submitter INT, IN p_contestID INT)
BEGIN
  INSERT INTO Submission VALUES
	(NULL, p_subDate, p_result, p_language, 0, p_problemID, p_submitter, p_contestID);
END //

-- Update Contest User Info
DELIMITER //

CREATE PROCEDURE spUpdateContestUser(IN p_score INT, IN p_standing INT, IN p_contestID INT, IN p_userID INT)
BEGIN
  UPDATE ContestUser
  SET score = p_score, standing = p_standing
  WHERE contestID = p_contestID AND userID = p_userID;

END //

-- Delete Contest 
DELIMITER //

CREATE PROCEDURE spDeleteContest(IN p_contestID INT)
BEGIN
  DELETE FROM Contest
  Where contestID = p_contestID;
END //

-- Get all regular users
DELIMITER //

CREATE PROCEDURE spGetRegularUsers(IN p_contest INT)
BEGIN
      SELECT username
      FROM Users
      WHERE usertype = 1 AND userID NOT IN (
        SELECT ownerID
        FROM Contest
        WHERE contestID = p_contest
      );
END //

-- Get count of submissions for each problem for each result in a contest
DELIMITER //

CREATE PROCEDURE spGetSubmissionsCountPerProblemPerResult(IN p_contestID INT)
BEGIN
  SELECT problemName, result, COUNT(*) AS resultCount FROM Problems, submission WHERE contestID = p_contestID AND Problems.problemID = submission.problemID GROUP BY problemName, result;
END //

-- Get count of submissions for each language in a contest
DELIMITER //

CREATE PROCEDURE spGetSubmissionsCountPerLanguage(IN p_contestID INT)
BEGIN
  SELECT language, COUNT(*) AS languageCount FROM Problems, submission WHERE contestID = p_contestID AND Problems.problemID = submission.problemID GROUP BY language;
END //
