import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import '../../style/style.css';
import axios from 'axios'

import StandingsTab from './StandingsTab';
import ProblemsTab from './ProblemsTab';
import SubmissionsTab from './SubmissionsTab';
import Error404 from '../Error404/Error404';


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
        isOwner: null,
        isParticipant: null,
        isValidated: null
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
                    isParticipant: response.data.isParticipant,
                    isValidated: true
                });
            } else {
                this.setState({ isValidated: true })
            }
        });

        axios.post('http://127.0.0.1:5000/IsLoggedUserContestOwner', {
            contest_id: this.props.match.params.id
        }, {withCredentials: true}).then(response => {
            if (response.data.status == 200){
                this.setState({ isOwner: true });
            }
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
                console.log(this.state.problemsData);
                this.state.problemsData.forEach(problem => {
                    problemIDList.push(problem.problemID.toString());
                });
                axios.post('http://127.0.0.1:5000/GetContestScoresPerProblem', {
                    contest_id: this.props.match.params.id,
                    problem_id_list: problemIDList
                }).then(response => {
                    this.setState({ scoreData: response.data.scoreList });
                });
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
                            {(this.props.isAdmin || isOwner) &&
                            <Button variant="fab" mini color="primary" aria-label="Edit" style={{margin: '0.5% 0.5%'}}>
                                <EditIcon/>
                            </Button>
                            }
                            {(this.props.isAdmin || isOwner) &&
                            <Button variant="fab" mini color="primary" aria-label="Delete" style={{margin:'0.5% 0.5%'}}>
                                <DeleteIcon />
                            </Button>
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
                                />
                            </TabContainer>}
                            {this.state.tabValue === 2 &&
                            <TabContainer>
                                <SubmissionsTab
                                    data={submissionsData}
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