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
		 axios.post('http://127.0.0.1:5000/GetUser',{}/*, {withCredentials: true}*/)
			.then(response => {
				if (response.data.status == 200){
					this.setState({username: response.data.username})
					axios.post('http://127.0.0.1:5000/GetUserID',{}/*, {withCredentials: true}*/)
						.then(response => {
							if (response.data.status == 200){
								this.setState({userId: response.data.userID})
							}
						})
						.catch((error) => {
								console.log(error);
					});
				}
			})
			.catch((error) => {
					console.log(error);
		});
		
		axios.post('http://127.0.0.1:5000/ViewOwnedContestList', {
			ownerID: 3
		}/*, {withCredentials: true}*/)
			.then(response => {
				if (response.status === 200) {
					this.setState({ownedContestData: response.data.ownedContestList})
				}

			})
			.catch((error) => {
				console.log(error);
			});
			
		axios.post('http://127.0.0.1:5000/ViewInvitedContestList', {
		userID: 3
		}/*, {withCredentials: true}*/)
			.then(response => {
				if (response.status === 200) {
					this.setState({invitedContestData: response.data.invitedContestList})
				}

			})
			.catch((error) => {
				console.log(error);
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
        const {  invitedContestData, ownedContestData, tabValue } = this.state;
		return (
			<div>
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