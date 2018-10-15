import React, { Component } from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Snackbar from '@material-ui/core/Snackbar';
import axios from 'axios'

function handleTodaysDate()
{
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1;
	var yyyy = today.getFullYear();
	var h = (today.getHours()<10?'0':'') + today.getHours();
	var m = (today.getMinutes()<10?'0':'') + today.getMinutes();

	if(dd<10) {
		dd = '0'+dd
	} 

	if(mm<10) {
		mm = '0'+mm
	} 
	var todayFormated = yyyy + '-' + mm + '-' + dd+'T'+ h + ':' + m;
	
	return todayFormated;
}

class CreateContest extends Component {
    //Country is missing from here and the app.py
    constructor(props) {
        super(props)
        this.state = {
            contestName: '',
            description: '',
            startDate: '',
            endDate: '',
			ownerID: '',
            attemptedCreate: false
        }

        this.handleCreateContest = this.handleCreateContest.bind(this)
        this.contestNameChange = this.contestNameChange.bind(this)
        this.descriptionChange = this.descriptionChange.bind(this)
        this.startDateChange = this.startDateChange.bind(this)
        this.endDateChange = this.endDateChange.bind(this)
    }
	
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
		
	}

    handleCreateContest () {
		console.log("GOT IN");
		const {contestName, description, startDate, endDate, ownerID} = this.state;
		this.setState({attemptedRegister: true})
        if(this.state.contestName !== "" && this.state.description !=="" && this.state.startDate !== "" && this.state.endDate !== "" && this.state.email !== "") {
            axios.post('http://127.0.0.1:5000/CreateContest', {
                contestName: contestName,
                description: description,
                startDate: startDate,
                endDate: endDate,
                status: 0,
                ownerID: 1
            })
                .then(response => {
                    if (response.data.status == 200) {
                        //changes user to profile if login is successful
                        console.log("CREATED SUCCESFULLY");
                    }

                    if (response.data.status == 1000) {
                        //Display error message
                        this.setState({openSnackbar: true, snackbarMessage: response.data.message})
                    }
                    console.log(response)
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }

    contestNameChange (event) {
        this.setState({contestName: event.target.value})
    }

    descriptionChange (event) {
        this.setState({description: event.target.value})
    }

    startDateChange (event) {
        this.setState({startDate: event.target.value})
    }

    endDateChange (event) {
        this.setState({endDate: event.target.value})
    }

    render() {
        const { classes } = this.props;
		var todayDateFormated = handleTodaysDate();
		var today = new Date();
		
        return (
            <center>
            <Card style={{raised: true, width: '25%', margin: '50px'}} >
                <CardHeader
                  //style={{titleColor: "inherit", color: "inherit"}}
                  title="Create Contest"
                />
                <CardContent>
                    <TextField
                        id="contestName"
                        label="Contest Name"
                        margin="none"
                        error={this.state.contestName === "" && this.state.attemptedRegister}
                        helperText={this.state.contestName === "" && this.state.attemptedRegister ? "contestName is required" : ""}
                        style = {{width: '90%'}}
                        onChange={this.contestNameChange}
                    />
                    <br/>
                    <TextField
                        id="description"
                        type="description"
                        label="Description"
                        margin="none"
                        error={this.state.description === "" && this.state.attemptedRegister}
                        helperText={this.state.description === "" && this.state.attemptedRegister ? "description is required" : ""}
                        style = {{width: '90%'}}
                        onChange={this.descriptionChange}
                    />
                    <br/>
                    <TextField
                        id="startDate"
                        label="Start Date"
                        margin="none"
						type="datetime-local"
						InputLabelProps={{
						  shrink: true,
						}}
						defaultValue={todayDateFormated}
                        error={this.state.startDate === "" && this.state.attemptedRegister}
                        helperText={this.state.startDate === "" && this.state.attemptedRegister ? "First name is required" : ""}
                        style = {{width: '90%'}}
                        onChange={this.startDateChange}
                    />
                    <br/>
                    <TextField
                        id="endDate"
                        label="End Date"
                        margin="none"
						type="datetime-local"
						InputLabelProps={{
						  shrink: true,
						}}
						defaultValue={todayDateFormated}
                        error={this.state.endDate === "" && this.state.attemptedRegister}
                        helperText={this.state.endDate === "" && this.state.attemptedRegister ? "Last name is required" : ""}
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
                        onClick={this.handleCreateContest.bind()}
                    >
                    Create
                    </Button>
                </CardContent>
            </Card>
            <Snackbar
                open={this.state.openSnackbar}
                onClose={this.handleClose}
                autoHideDuration={4000}
                ContentProps={{
                    'aria-describedby': 'message-id',
                }}
                message={<span id="message-id">{this.state.snackbarMessage}</span>}
            />
            </center>
        );
      }
}

export default CreateContest