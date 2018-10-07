import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
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
        });

        axios.post('http://127.0.0.1:5000/GetContestProblems', {
            contest_id: this.props.match.params.id
        }).then(response => {
            if (response.data.status == 200){
                this.setState({ problemsData: response.data.problemList });
            }
        });
    };

    handleChange = (event, value) => {
        this.setState({
            tabValue: value
        });
    };

    render()
    {
        const { classes } = this.props;
        const { isOwner, isParticipant, isValidated, contestName, problemsData, tabValue } = this.state;

        if (isValidated)
            if (isOwner || isParticipant)
                return (
                    <div>
                        <div className="contest-header">
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
                                    contest_id={this.props.match.params.id}
                                    isAdmin={this.props.isAdmin}
                                    isOwner={isOwner}
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