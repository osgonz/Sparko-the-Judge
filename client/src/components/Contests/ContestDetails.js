/*******************************************************************************/
/*                                E X P O R T S                                */
/*******************************************************************************/
/*--------------------------------- R E A C T ---------------------------------*/
import React, { Component } from 'react';
import axios from 'axios'

/*--------------------------- M A T E R I A L   U I ---------------------------*/
import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import '../../style/style.css';

/*---------------------------- C O M P O N E N T S ----------------------------*/
import StandingsTab from './StandingsTab';
import ProblemsTab from './ProblemsTab';
import SubmissionsTab from './SubmissionsTab';
import Statistics from './Statistics';
import Error404 from '../Error404/Error404';
import EditContestButton from '../CreateContest/FormDialog';
import EditContest from '../EditContest/EditContest';
import DeleteContestButton from '../CreateContest/FormDialog';
import DeleteContest from '../DeleteContest/DeleteContest';
/*******************************************************************************/


const styles = {
    root: {
        flexGrow: 1,
    },
};

function TabContainer(props) {
    return (
        <Typography component="div" style={{ padding: 8 * 3 }}>
            {props.children}
        </Typography>
    );
}

class ContestDetails extends Component {
    state = {
        tabValue: 0,
        contestName: null,
        description: null,
        startDate: null,
        endDate: null,
        status: null,
        problemsData: [],
        submissionsData: [],
        scoreData: [],
        standingsData: [],
        users: [],
        contestUsers: [],
        isOwner: null,
        isParticipant: null,
        isValidated: null,
        onlineJudgesProblems: []
    };

    componentDidMount(){
        axios.post('http://127.0.0.1:5000/GetContestInfo', {
            contest_id: this.props.match.params.id
        }, {withCredentials: true}).then(response => {
            if (response.data.status == 200){
                this.setState({
                    contestName: response.data.contestInfo.contestName,
                    description: response.data.contestInfo.description,
                    startDate: response.data.contestInfo.startDate,
                    endDate: response.data.contestInfo.endDate,
                    status: response.data.contestInfo.status,
                    isParticipant: response.data.isParticipant
                });

                if (response.data.contestInfo.status == 1) {
                    axios.post('http://127.0.0.1:5000/IsLoggedUserContestOwner', {
                        contest_id: this.props.match.params.id
                    }, {withCredentials: true}).then(response => {
                        if (response.data.status == 200) {
                            console.log("isOwner received!")
                            this.setState({isOwner: true});
                        }
                        this.setState({isValidated: true});
                    }).then(() => {
                        axios.post('http://127.0.0.1:5000/GetContestProblems', {
                            contest_id: this.props.match.params.id
                        }).then(response => {
                            if (response.data.status == 200) {
                                this.setState({problemsData: response.data.problemList});
                                let problemIDList = [];
                                this.state.problemsData.forEach(problem => {
                                    problemIDList.push(problem.problemID.toString());
                                });
                            }
                        });

                        axios.post('http://127.0.0.1:5000/GetOngoingContestIntermediateData', {
                            contest_id: this.props.match.params.id,
                            can_see_all: this.props.isAdmin || this.state.isOwner
                        }, {withCredentials: true}).then(response => {
                           if (response.data.status == 200) {
                               this.setState({
                                   submissionsData: response.data.submissionsList,
                                   scoreData: response.data.scoresList,
                                   standingsData: response.data.standingsList,
                                   isValidated: true,
                               });
                           }
                        });
                    });
                } else {
                    axios.post('http://127.0.0.1:5000/IsLoggedUserContestOwner', {
                        contest_id: this.props.match.params.id
                    }, {withCredentials: true}).then(response => {
                        if (response.data.status == 200) {
                            this.setState({isOwner: true});
                        }
                        this.setState({isValidated: true});
                    }).then(() => {
                        if (this.props.isAdmin || this.state.isOwner) {
                            axios.post('http://127.0.0.1:5000/GetSubmissionsInContest', {
                                contest_id: this.props.match.params.id
                            }).then(response => {
                                if (response.data.status == 200) {
                                    this.setState({submissionsData: response.data.submissionsList});
                                }
                            });
                        } else {
                            axios.post('http://127.0.0.1:5000/GetUserSubmissionsInContest', {
                                contest_id: this.props.match.params.id
                            }, {withCredentials: true}).then(response => {
                                if (response.data.status == 200) {
                                    this.setState({submissionsData: response.data.userSubmissionsList});
                                }
                            });
                        }
                    });

                    axios.post('http://127.0.0.1:5000/GetContestProblems', {
                        contest_id: this.props.match.params.id
                    }, {withCredentials: true}).then(response => {
                        if (response.data.status == 200) {
                            this.setState({problemsData: response.data.problemList});
                            let problemIDList = [];
                            this.state.problemsData.forEach(problem => {
                                problemIDList.push(problem.problemID.toString());
                            });
                            if (problemIDList.length > 0) {
                                axios.post('http://127.0.0.1:5000/GetContestScoresPerProblem', {
                                    contest_id: this.props.match.params.id,
                                    problem_id_list: problemIDList
                                }, {withCredentials: true}).then(response => {
                                    this.setState({scoreData: response.data.scoreList});
                                });
                            }
                        }
                    });
                }

                // Query online judges problems only for upcoming contests
                if (response.data.contestInfo.status == 0) {
                    var onlineJudgesProblems = []

                    axios.get('https://uhunt.onlinejudge.org/api/p').then(response => {
                        var problemsSuggestions = response.data.map(function(problem) {
                            var problemID = problem[0]
                            var problemNumber = problem[1]
                            var problemTitle = problem[2]
                            var str = String(problemID) + " - " + String(problemNumber) + " - " + problemTitle + " (UVa)"
                            return {value: str, label: str}
                        })

                        onlineJudgesProblems = onlineJudgesProblems.concat(problemsSuggestions)
                        this.setState({onlineJudgesProblems: onlineJudgesProblems})
                    })

                    axios.get('https://icpcarchive.ecs.baylor.edu/uhunt/api/p').then(response => {
                        var problemsSuggestions = response.data.map(function(problem) {
                            var problemID = problem[0]
                            var problemNumber = problem[1]
                            var problemTitle = problem[2]
                            var str = String(problemID) + " - " + String(problemNumber) + " - " + problemTitle + " (ICPC Live Archive)"
                            return {value: str, label: str}
                        })

                        onlineJudgesProblems = onlineJudgesProblems.concat(problemsSuggestions)
                        this.setState({onlineJudgesProblems: onlineJudgesProblems})
                    })

                    axios.post('http://127.0.0.1:5000/GetRegularUsers', {
                        contest_id: this.props.match.params.id
                    }).then(response => {
                        if (response.data.StatusCode == 200) {
                            this.setState({users: response.data.users});
                        }
                    });
                }

                axios.post('http://127.0.0.1:5000/GetContestUsers', {
                    contest_id: this.props.match.params.id
                }).then(response => {
                    if (response.data.StatusCode == 200) {
                        this.setState({contestUsers: response.data.users});
                    }
                });

            } else {
                this.setState({ isValidated: true })
            }
        });
    };

    handleChange = (event, value) => {
        this.setState({
            tabValue: value
        });
    };

    handleStatusCode = status => {
        switch(status) {
            case 0:
                return (
                    <Chip label="Upcoming" color="secondary" />
                );
            case 1:
                return (
                    <Chip label="Ongoing" color="primary" />
                );
            case 2:
                return (
                    <Chip label="Finished" />
                );
        }
    }

    handleJudgeCode = judge => {
        switch(judge) {
            case 0:
                return 'ICPC Live Archive';
            case 1:
                return 'UVa';
        }
    }

    render()
    {
        const { classes } = this.props;
        const { isOwner, isParticipant, isValidated, contestName, description, status, problemsData, standingsData, submissionsData, scoreData, tabValue } = this.state;
        var problemsForEdit = []
        for (let problem in this.state.problemsData) {
            problemsForEdit.push(this.state.problemsData[problem])
        }

        if (isValidated)
            if (isOwner || isParticipant)
                return (
                    <div>
                        <div className="contest-header">
                            { this.handleStatusCode(status) }
                            <h1 className="contest-title">{contestName}</h1>
                            {(this.props.isAdmin || isOwner) && status <= 1 &&
                            <EditContestButton
                                component={
                                    <EditContest
                                        contestID={this.props.match.params.id}
                                        contestName={contestName}
                                        description= {description}
                                        startDate= {this.state.startDate}
                                        endDate= {this.state.endDate}
                                        status = {status}
                                        onlineJudgesProblems = {this.state.onlineJudgesProblems}
                                        addedProblems = {problemsForEdit}
                                        users = {this.state.users}
                                        contestUsers = {this.state.contestUsers}
                                    />
                                }
                                button={
                                    <Button variant="fab" mini color="primary" aria-label="Edit Contest">
                                        <EditIcon/>
                                    </Button>
                                }
                                modalTitle={"Edit contest"}
                            />
                            }
                            {(this.props.isAdmin || isOwner) && status == 0 &&
                            <DeleteContestButton
                                component={
                                    <DeleteContest
                                        contestID={this.props.match.params.id}
                                        contestName={contestName} />
                                }
                                button={
                                    <Button variant="fab" mini color="primary" aria-label="Delete" style={{margin:'10% 10%'}}>
                                        <DeleteIcon/>
                                    </Button>
                                }
                                modalTitle={"Delete contest"}
                            />    
                            }
                        </div>
                        <p className="contest-desc">{description}</p>
                        <Paper className={classes.root}>
                            <Tabs
                                value={tabValue}
                                onChange={this.handleChange}
                                indicatorColor="primary"
                                textColor="primary"
                                centered
                            >
                                <Tab label="Standings" />
                                <Tab label="Problem List" />
                                <Tab label="Submissions" />
                                {(isOwner) && <Tab label="Statistics" />}
                            </Tabs>
                            
                            {tabValue === 0 &&
                            <TabContainer>
                                <StandingsTab
                                    contest_id={this.props.match.params.id}
                                    problemList={problemsData}
                                    scores={scoreData}
                                    standingsData = {standingsData}
                                    status = {status}
                                    isOwner={isOwner}
                                    isAdmin={this.props.isAdmin}
                                />
                            </TabContainer>}
                            
                            {tabValue === 1 &&
                            <TabContainer>
                                <ProblemsTab
                                    data={problemsData}
                                    handleJudgeCode = {this.handleJudgeCode}
                                />
                            </TabContainer>}
                            
                            {this.state.tabValue === 2 &&
                            <TabContainer>
                                <SubmissionsTab
                                    data={submissionsData}
                                    handleJudgeCode = {this.handleJudgeCode}
                                />
                            </TabContainer>}

                            {(isOwner) && tabValue === 3 &&
                            <TabContainer>
                                <Statistics type='contest'>
                                </Statistics>
                            </TabContainer>
                            }
                        </Paper>
                    </div>
                );
            else
                return (
                  <Error404 />
                );
        else {
            return null;
        }
    }
}

export default withStyles(styles)(ContestDetails);