import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import '../../style/style.css';
import axios from 'axios'

import StandingsTab from './StandingsTab';
import ProblemsTab from './ProblemsTab';
import SubmissionsTab from './SubmissionsTab';
import Error404 from '../Error404/Error404';
import EditContestButton from '../EditContest/FormDialog';
import InviteUsersButton from '../InviteUsers/FormDialog';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CreateContest from '../CreateContest/CreateContest';
import TextField from '@material-ui/core/TextField';

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
    constructor(props) {
        super(props)
        this.state = {
            tabValue: 0,
            contestName: null,
            description: null,
            startDate: null,
            endDate: null,
            status: null,
            problemsData: [],
            submissionsData: [],
            scoreData: [],
            isOwner: null,
            isParticipant: null,
            isValidated: null
        };

        this.handleEditContest = this.handleEditContest.bind(this)
        this.contestNameChange = this.contestNameChange.bind(this)
        this.descriptionChange = this.descriptionChange.bind(this)
        this.startDateChange = this.startDateChange.bind(this)
        this.endDateChange = this.endDateChange.bind(this)
        this.handleClose = this.handleClose.bind(this)
    }

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

                axios.post('http://127.0.0.1:5000/IsLoggedUserContestOwner', {
                    contest_id: this.props.match.params.id
                }, {withCredentials: true}).then(response => {
                    if (response.data.status == 200){
                        this.setState({ isOwner: true });
                    }
                    this.setState({ isValidated: true });
                }).then( () => {
                    if (this.props.isAdmin || this.state.isOwner) {
                        axios.post('http://127.0.0.1:5000/GetSubmissionsInContest', {
                            contest_id: this.props.match.params.id
                        }).then(response => {
                            if (response.data.status == 200){
                                this.setState({ submissionsData: response.data.submissionsList });
                            }
                        });
                    } else {
                        axios.post('http://127.0.0.1:5000/GetUserSubmissionsInContest', {
                            contest_id: this.props.match.params.id
                        }, {withCredentials: true}).then(response => {
                            if (response.data.status == 200){
                                this.setState({ submissionsData: response.data.userSubmissionsList });
                            }
                        });
                    }
                });

                axios.post('http://127.0.0.1:5000/GetContestProblems', {
                    contest_id: this.props.match.params.id
                }).then(response => {
                    if (response.data.status == 200){
                        this.setState({ problemsData: response.data.problemList });
                        let problemIDList = [];
                        this.state.problemsData.forEach(problem => {
                            problemIDList.push(problem.problemID.toString());
                        });
                        if (problemIDList.length > 0) {
                            axios.post('http://127.0.0.1:5000/GetContestScoresPerProblem', {
                                contest_id: this.props.match.params.id,
                                problem_id_list: problemIDList
                            }).then(response => {
                                this.setState({scoreData: response.data.scoreList});
                            });
                        }
                    }
                });

            } else {
                this.setState({ isValidated: true })
            }
        });
    };

    contestNameChange (event) {
        this.setState({contestName: event.target.value})
    }

    descriptionChange (event) {
        this.setState({description: event.target.value})
    }

    startDateChange (event) {
        this.setState({startDate: new Date(event.target.value)})
    }

    endDateChange (event) {
        this.setState({endDate: new Date(event.target.value)})
    }

    handleChange = (event, value) => {
        this.setState({
            tabValue: value
        });
    };

    handleClose = (showFeedback, feedbackMessage) => {
        this.setState({ open: false });
        if (showFeedback){
          this.setState({openSnackbar: true, snackbarMessage: feedbackMessage})
        }
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

    handleEditContest= () => {
        this.setState({attemptedRegister: true})
        if(this.state.contestName !== "" && this.state.description !=="" && this.state.startDate !== "" && this.state.endDate !== "" && this.state.email !== "") {
            // Parsing date times
            const {contestName, description, ownerID} = this.state;
            var {startDate, endDate} = this.state;
            startDate = startDate
            endDate = endDate

            axios.post('http://127.0.0.1:5000/EditContest', {
                contestName: contestName,
                description: description,
                startDate: startDate,
                endDate: endDate,
                status: 0,
            }, {withCredentials: true})
            .then(response => {
                console.log(response)
                if (response.status == 200) {
                    //changes user to profile if login is successful
                    this.handleClose(true, "Contest edited successfully")
                }

                if (response.status == 1000) {
                    //Display error message
                    this.handleClose(true, response.data.Message)
                }
            })
            .catch((error) => {
                console.log(error);
            });
        }
    };

    handleClickOpen = () => {
        this.setState({ open: true });
    };

    render()
    {
        const { classes } = this.props;
        const { isOwner, isParticipant, isValidated, contestName, description, status, problemsData, submissionsData, scoreData, tabValue } = this.state;

        if (isValidated)
            if (isOwner || isParticipant)
                return (
                    <div>
                        <div className="contest-header">
                            { this.handleStatusCode(status) }
                            <h1 className="contest-title">{contestName}</h1>
                            {(this.props.isAdmin || isOwner) && status <= 1 &&
                            <EditContestButton
                                contestID={this.props.match.params.id}
                                contestName={contestName}
                                description= {description}
                                startDate= {this.state.startDate}
                                endDate= {this.state.endDate}
                                status = {status}
                            />
                            }
                            {(this.props.isAdmin || isOwner) && status == 0 &&
                            <Button variant="fab" mini color="primary" aria-label="Delete" style={{margin:'0.5% 0.5%'}}>
                                <DeleteIcon />
                            </Button>
                            }
                            {(this.props.isAdmin || isOwner) && status <= 1 &&
                            <InviteUsersButton 
                                contestID={this.props.match.params.id}
                            />
                            }
                            <Dialog
                                open={this.state.open}
                                onClose={() => this.handleClose(false, "")}
                                aria-labelledby="form-dialog-title"
                            >
                            <DialogTitle id="form-dialog-title">Create contest</DialogTitle>
                            <DialogContent>
                            <div>
                                <TextField
                                    id="contestName"
                                    label="Contest Name"
                                    margin="none"
                                    error={this.state.contestName === "" && this.state.attemptedRegister}
                                    helperText={!this.props.error ? "contestName is required" : ""}
                                    style = {{width: '90%'}}
                                    onChange={this.contestNameChange}
                                    value={this.state.contestName}
                                />
                                <br/>
                                <TextField
                                    id="description"
                                    type="description"
                                    label="Description"
                                    margin="none"
                                    error={this.state.description === "" && this.state.attemptedRegister}
                                    helperText={!this.props.error ? "description is required" : ""}
                                    style = {{width: '90%'}}
                                    onChange={this.descriptionChange}
                                    value={this.state.description}
                                />
                                <br/><br/>
                                <TextField
                                    id="startDate"
                                    label="Start Date"
                                    margin="none"
                                    type="datetime-local"
                                    InputLabelProps={{
                                    shrink: true,
                                    }}
                                    defaultValue={this.state.startDate}
                                    error={(this.state.startDate === "" || this.state.startDate > this.state.endDate || this.state.startDate < this.state.currentDate) && this.state.attemptedRegister}
                                    helperText={!this.props.error ? "Start date is required" : ""}
                                    style = {{width: '90%'}}
                                    onChange={this.startDateChange}
                                />
                                <br/><br/>
                                <TextField
                                    id="endDate"
                                    label="End Date"
                                    margin="none"
                                    type="datetime-local"
                                    InputLabelProps={{
                                    shrink: true,
                                    }}
                                    defaultValue={this.state.endDate}
                                    error={(this.state.endDate === "" || this.state.endDate < this.state.startDate || this.state.endDate == this.state.startDate) && this.state.attemptedRegister}
                                    helperText={!this.props.error ? "End date is required" : ""}
                                    style = {{width: '90%'}}
                                    onChange={this.endDateChange}
                                />
                                <br/>
                                <br/>
                                <Button
                                    variant="contained"
                                    margin="normal"
                                    color="primary"
                                    type="submit"
                                    style= {{width: '30%', backgroundColor: "#0F2027", titleColor: "#FFFFFF"}}
                                    onClick={this.handleEditContest.bind()}
                                >
                                Create
                                </Button>
                                </div>
                            </DialogContent>
                            </Dialog>
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
                            </Tabs>
                            {tabValue === 0 &&
                            <TabContainer>
                                <StandingsTab
                                    contest_id={this.props.match.params.id}
                                    problemList={problemsData}
                                    scores={scoreData}
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