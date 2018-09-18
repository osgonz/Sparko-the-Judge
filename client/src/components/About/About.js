/*******************************************************************************/
/*                                E X P O R T S                                */
/*******************************************************************************/
/*--------------------------------- R E A C T ---------------------------------*/
import React, { Component } from 'react';

/*--------------------------- M A T E R I A L   U I ---------------------------*/
import Typography from '@material-ui/core/Typography';
/*******************************************************************************/

class About extends Component {
	render() {
		return(
			<div>
				<Typography variant="display1">About</Typography>
				<Typography gutterBottom>
			        {`
			        	The following web site was a project developed for the professor Luis Humberto González Guerra. 
			        `}
      			</Typography>
      			<Typography gutterBottom>
			        {`
						This site is aimed for users interested in competitive programming, who want to participate and make their own contests with problems taken from online judges. Users will be able to link their accounts to other online judges and keep track of their performance in each contest they are invited to.
			        `}
      			</Typography>
      			<Typography gutterBottom>
			        {`
						Why don’t you register and hop in to access all the features mentioned above!
			        `}
      			</Typography>      			
			</div>
		);
	}
}

export default About;