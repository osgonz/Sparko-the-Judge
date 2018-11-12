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
	    fetchedData: []	    
  	};

	handleClickLoading = () => {
	    this.setState(state => ({
	    	loading: !state.loading,
	    }));
  	};

  	componentDidMount(){
  		this.fetchData();
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
  		this.setState(state => ({
	    	fetchedData: [
	    		{
	    			// Example of Calendar 
	    			chartType: 'calendar',
	    			options: {
	    				title: 'Number of Submissions Sent per Day'
	    			},
	    			data: [
					    [{ type: 'date', id: 'Date' }, { type: 'number', id: 'Won/Loss' }],
					    [new Date(2018, 11, 9), 7],
					    [new Date(2018, 11, 10), 6],
					    [new Date(2018, 11, 11), 4],
					    [new Date(2018, 11, 12), 10],
					    [new Date(2018, 11, 13), 12]
					]
	    		},
	    		{
	    			// Example of stacked column
	    			chartType: 'column-stacked',
	    			options: {
	    				title: 'Submissions Accepted vs Submissions Denied',
	    				axisTitles: {
	    					vertical: 'Problem name',
	    					horizontal: 'Number of Submissions'
	    				}
	    			},
	    			data: [
					    ['Problem', 'Accepted', 'Denied'],
					    ['Compiler Code Generation', 3, 2],
					    ['Swiss Draw', 2, 9],
					    ['Bobs bingo', 0, 11],
					    ['If it is a javeling, duck!', 5, 7],
				  	]
	    		},
	    		{
	    			// Example of pie chart
	    			chartType: 'pie',
	    			options: {
	    				title: 'Submissions per Problem',
	    			},
	    			data: [
					    ['Problem', 'Submissions per Problem'],
					    ['Compiler Code Generation', 5],
					    ['Swiss Draw', 11],
					    ['Bobs bingo', 11],
					    ['If it is a javeling, duck!', 12],
				  	]
	    		},
	    		{
	    			// Example of pie chart
	    			chartType: 'pie',
	    			options: {
	    				title: 'Programming Languages used',
	    			},
	    			data: [
					    ['Programming Language', 'Submissions per Programming Language'],
					    ['C', 1],
					    ['C++', 29],
					    ['Java', 7],
					    ['Python', 2],
				  	]
	    		}
	    	]
	    }));
  	}

  	fetchUserData(){
  		console.log("Requested to see user stats");
  	}

	render() {
    	const { loading } = this.state;

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
}

export default Statistics;
