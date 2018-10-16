import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
 
import '../../style/style.css';
import axios from 'axios'
import OwnedContestListTab from './OwnedContestListTab';
import InvitedContestListTab from './InvitedContestListTab';
import CreateContestButton from '../Dummy/FormDialog';

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
    };

     componentDidMount(){
		axios.get('http://127.0.0.1:5000/GetActiveSession', {withCredentials: true})
        .then(response => {
            console.log(response.data);
			if (response.data != 'Session not found') {
				this.setState({username: response.data.username})
				axios.post('http://127.0.0.1:5000/ViewOwnedContestList', {username: this.state.username}, {withCredentials: true})
				.then(response => {
					console.log(response)
					if (response.status === 200) {
						this.setState({ownedContestData: response.data.ownedContestList})
					}

				})
				.then(() =>{
					axios.post('http://127.0.0.1:5000/ViewInvitedContestList', {username: this.state.username}, {withCredentials: true})
					.then(response => {
						console.log(response)
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
                    <CreateContestButton />
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