/*******************************************************************************/
/*                                E X P O R T S                                */
/*******************************************************************************/
/*--------------------------------- R E A C T ---------------------------------*/
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios'

/*--------------------------- M A T E R I A L   U I ---------------------------*/
import { withStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import '../../style/style.css';

/*---------------------------- C O M P O N E N T S ----------------------------*/
import Graph from './Graph';
/*******************************************************************************/


class Statistics extends Component {

	state = {
	    loading: false,
	    fetchedData: [],
  	};

	handleClickLoading = () => {
	    this.setState(state => ({
	    	loading: !state.loading,
	    }));
  	};

  	componentDidMount(){
  		console.log(this.props.isContestFinished)
  		if (this.props.isContestFinished){
  			this.fetchData();
  		}
  	}

  	fetchData(){
  		this.setState(state => ({
	    	loading: !state.loading,
	    }));

	    setTimeout(() => {
	    	
	    	switch(this.props.type){
  			case 'contest':
  				this.fetchContestData();
  				break;
  			
  			case 'user':
  				this.fetchUserData();
  				break;
  			}

            this.setState(state => ({
	    		loading: !state.loading,
	    	}));

        }, 3000);
  	}

  	fetchContestData(){
  		console.log("Requested to see contest stats");
  		axios.post('https://copromanager-api.herokuapp.com/GetContestStats', {
  			contestID: this.props.contestID
  		}, {withCredentials: true}).then(response => {
  			if (response.data.status == 200) {
		  		this.setState(state => ({
			    	fetchedData: response.data.charts
			    }));
  			}
  		})
  	}

  	fetchUserData(){
  		console.log("Requested to see user stats");
  	}

	render() {
    	const { loading } = this.state;

    	if (this.props.isContestFinished){
    		return(
				<div>
					<div id='loading-screen'>
			        	<Fade
			            in={loading}
			            style={{
			              transitionDelay: loading ? '100ms' : '0ms',
			            }}
			            unmountOnExit>
				          	<Grid container alignItems='center' justify='center'>
					            <CircularProgress/>				            
					            <Typography>Loading Statistics, please wait. </Typography>
				        	</Grid>
			          	</Fade>
		          	</div>

		          	<Grid id='stats-container' container alignItems='center' justify='center' align='center'>
		          		{
		          			this.state.fetchedData.map((item, i) => {
		          				return (
		          					<Graph 
		          						id={i}
		          						key={i}
		          						type={item.chartType}
		          						options={item.options}
		          						data={item.data}
		          					/>
		          				)
		          			})
		          		}
		          	</Grid>
	          	</div>
			);
    	}
    	else{
    		return (
    			<div justify='center' align='center'>
    				<h2>Statistics are only available for finished contests!</h2>
          		</div>
    		)
    	}
	}
}

export default Statistics;
