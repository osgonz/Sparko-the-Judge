/*******************************************************************************/
/*                                E X P O R T S                                */
/*******************************************************************************/
/*--------------------------------- R E A C T ---------------------------------*/
import React, { Component } from 'react';

/*--------------------------- M A T E R I A L   U I ---------------------------*/
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
/*---------------------------- C O M P O N E N T S ----------------------------*/
import Chart from 'react-google-charts';
/*******************************************************************************/

const colourPalette = ['#4A138C', '#F9C42D', '#EB8133', '#71BCA4', '#3E7449'];
const grey = '#888888';


class Graph extends Component {


	getChartType(chart) {
		switch(chart) {
			case 'column-stacked':
				return 'BarChart';
				break;

			case 'column':
				return 'BarChart';
				break;

			case 'pie':
				return 'PieChart';
				break;

			case 'calendar':
				return 'Calendar';
				break;
		}
	}

	getOptions(chart) {
		switch(chart) {
			case 'pie':
				return {
					title: this.props.options.title,
					colors: colourPalette,
					fontName: 'Roboto',
					titleTextStyle: {
  						fontName: 'Roboto',
  						fontSize: 15,
  						bold: true,
					},
					legend: {
						textStyle: {
							color: grey,
  							fontName: 'Roboto',
						}
					}
				}
				break;

			case 'column-stacked':
				return {
					title: this.props.options.title,
					colors: colourPalette,
					titleTextStyle: {
  						fontName: 'Roboto',
  						fontSize: 15,
  						bold: true,
					},
					legend: {
						textStyle: {
							color: grey,
  							fontName: 'Roboto',
						}
					},
					isStacked: true,
					hAxis: {
			      		title: this.props.options.axisTitles.horizontal,
			      		textStyle: {
							color: grey,
  							fontName: 'Roboto',
						}
				    },
				    vAxis: {
				     	title: this.props.options.axisTitles.vertical,
				     	textStyle: {
							color: grey,
  							fontName: 'Roboto',
						}
				    },
				}
				break;

			case 'calendar':
				return {
					title: this.props.options.title,
					calendar: {
      					monthLabel: {
        					fontName: 'Roboto',
        					color: '#000000'
        				}
        			}
				}
				break;
		}
	}

	setGridSize(chart) {
		switch(chart) {
			case 'calendar':
				return 12;
				break;

			case 'column-stacked':
				return 6;
				break;

			case 'column':
				return 6;
				break;

			case 'pie':
				return 3;
				break;
		}
	}

	render() {
		return(
				<Grid item xs={this.setGridSize(this.props.type)} >
					<Paper style={{'margin': '10px'}} >
						<Chart
						  chartType={this.getChartType(this.props.type)}
						  loader={<div>Loading Chart</div>}
						  data={this.props.data}
						  options={this.getOptions(this.props.type)}
						/>
					</Paper>
				</Grid>
		);
	}
}

export default Graph;