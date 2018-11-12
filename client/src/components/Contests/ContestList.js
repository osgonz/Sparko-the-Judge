import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
 
import '../../style/style.css';
import axios from 'axios'
import OwnedContestListTab from './OwnedContestListTab';
import InvitedContestListTab from './InvitedContestListTab';
import CreateContest from '../CreateContest/CreateContest';
import CreateContestButton from '../CreateContest/FormDialog';

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
 class ContestList extends Component {
	state = {
		tabValue: 0,
		userId: 0,
		username: '',
		ownedContestData: [],
		invitedContestData: [],
		onlineJudgesProblems: [],
		users: []
	};

	 componentDidMount(){
		var onlineJudgesProblems = []
		axios.get('https://copromanager-api.herokuapp.com/GetActiveSession', {withCredentials: true})
		.then(response => {
			if (response.data != 'Session not found') {
				this.setState({username: response.data.username})
				axios.post('https://copromanager-api.herokuapp.com/ViewOwnedContestList', {username: this.state.username}, {withCredentials: true})
				.then(response => {
					if (response.status === 200) {
						this.setState({ownedContestData: response.data.ownedContestList})
					}
				})
				.then(() =>{
					axios.post('https://copromanager-api.herokuapp.com/ViewInvitedContestList', {username: response.data.username}, {withCredentials: true})
					.then(response => {
						if (response.status === 200) {
							this.setState({invitedContestData: response.data.invitedContestList})
						}

					})
					.catch((error) => {
						console.log(error);
					});
				})
				.catch((error) => {
					console.log(error);
				});
			}
		})
		.then(() => {
			axios.get('https://uhunt.onlinejudge.org/api/p').then(response => {
				var problemsSuggestions = response.data.map(function(problem) {
					var problemID = problem[0]
					var problemNumber = problem[1]
					var problemTitle = problem[2]
					var str = String(problemID) + " - " + String(problemNumber) + " - " + problemTitle + " (UVa)"
					return {value: str, label: str}
				});

				onlineJudgesProblems = onlineJudgesProblems.concat(problemsSuggestions);
				this.setState({onlineJudgesProblems: onlineJudgesProblems})
			});

			axios.get('https://icpcarchive.ecs.baylor.edu/uhunt/api/p').then(response => {
				var problemsSuggestions = response.data.map(function(problem) {
					var problemID = problem[0]
					var problemNumber = problem[1]
					var problemTitle = problem[2]
					var str = String(problemID) + " - " + String(problemNumber) + " - " + problemTitle + " (ICPC Live Archive)"
					return {value: str, label: str}
				});

				onlineJudgesProblems = onlineJudgesProblems.concat(problemsSuggestions);
				this.setState({onlineJudgesProblems: onlineJudgesProblems})
			});

            axios.post('https://copromanager-api.herokuapp.com/GetRegularUsers', {
                contest_id: this.props.match.params.id
            }, {withCredentials: true}).then(response => {
                if (response.data.StatusCode == 200) {
                    this.setState({users: response.data.users});
                }
            });
		})
	}

	handleChange = (event, value) => {
		this.setState({
			tabValue: value
		});
	}

	 render()
	{
		const { classes } = this.props;
		const {  invitedContestData, ownedContestData, tabValue } = this.state;
		return (
			<div>
				<div className="contest-list-header">
					<h1 className="contest-title">Contest List</h1>
					<CreateContestButton
						component={
							<CreateContest
								onlineJudgesProblems={this.state.onlineJudgesProblems}
								users={this.state.users}
							/>
						}
						button={
							<Button variant="fab" mini color="primary" aria-label={"Create Contest"} style={{margin: '0.5% 0.5%'}}>
								<AddIcon/>
							</Button>
						}
						modalTitle={"Create Contest"} />
				</div>
				<Paper className={classes.root}>
					<Tabs
						value={tabValue}
						onChange={this.handleChange}
						indicatorColor="primary"
						textColor="primary"
						centered
					>
						<Tab label="Owned" />
						<Tab label="Invited" />
					</Tabs>
					{tabValue === 0 &&
					<TabContainer>
						<OwnedContestListTab
							data={ownedContestData}
						/>
					</TabContainer>}
					{tabValue === 1 &&
					<TabContainer>
						<InvitedContestListTab
							data={invitedContestData}
						/>
					</TabContainer>}
				</Paper>
			</div>
		);
	}
}

export default withStyles(styles)(ContestList); 
