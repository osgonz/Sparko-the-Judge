import React, { Component } from "react";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import axios from 'axios'

function formatDate(date)
{
	var today = date;
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
	var dateFormated = yyyy + '-' + mm + '-' + dd+'T'+ h + ':' + m;
	
	return dateFormated;
}

class CreateContest extends Component {
    //Country is missing from here and the app.py
    constructor(props) {
        super(props)
        var today = new Date();
        var tomorrow = new Date();
        tomorrow = tomorrow.setDate(tomorrow.getDate()+1);
        tomorrow = new Date(tomorrow);

        console.log(today)
        console.log(tomorrow)
        this.state = {
            contestName: '',
            description: '',
            currentDate: today,
            startDate: today,
            endDate: tomorrow,
			ownerID: '',
            attemptedCreate: false
        }

        this.handleCreateContest = this.handleCreateContest.bind(this)
        this.contestNameChange = this.contestNameChange.bind(this)
        this.descriptionChange = this.descriptionChange.bind(this)
        this.startDateChange = this.startDateChange.bind(this)
        this.endDateChange = this.endDateChange.bind(this)
        this.handleModalClose = this.props.handleClose.bind(this)
    }

    handleCreateContest () {
		console.log("GOT IN");

		this.setState({attemptedCreate: true})

        // Removing seconds and milliseconds from dates
        this.state.startDate.setSeconds(0,0);
		this.state.endDate.setSeconds(0,0);
		this.state.currentDate.setSeconds(0,0);

        if(this.state.contestName !== "" && this.state.description !=="" && this.state.startDate < this.state.endDate &&
            this.state.startDate >= this.state.currentDate) {
            // Parsing date times
            const {contestName, description} = this.state;
            let {startDate, endDate} = this.state;
            startDate = formatDate(startDate)
            endDate = formatDate(endDate)

            console.log("CALLING AXIOS")
            axios.post('http://127.0.0.1:5000/CreateContest', {
                contestName: contestName,
                description: description,
                startDate: startDate,
                endDate: endDate,
                status: 0,
            }, {withCredentials: true})
            .then(response => {
                if (response.data.StatusCode == 200) {
                    this.handleModalClose(true, "Contest created successfully")
                    window.location.reload();
                }

                if (response.data.StatusCode == 1000) {
                    //Display error message
                    this.handleModalClose(true, response.data.Message)
                }
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
        this.setState({startDate: new Date(event.target.value)})
    }

    endDateChange (event) {
        this.setState({endDate: new Date(event.target.value)})
    }

    render() {
        const { classes } = this.props;
		let todayDate = this.state.currentDate;
		todayDate.setSeconds(0,0);
		let startDate = this.state.startDate;
        startDate.setSeconds(0,0);
		let endDate = this.state.endDate;
        endDate.setSeconds(0,0);

        let startDateErrorText = "";
        let endDateErrorText = "";

        if (this.state.attemptedCreate) {
            if (isNaN(startDate.getTime()))
                startDateErrorText = "Start date required";
            else if (startDate >= endDate)
                startDateErrorText = "Start date must be before end date";
            else if (startDate < todayDate)
                startDateErrorText = "Start date must be equal to or after current date";

            if (isNaN(endDate.getTime()))
                endDateErrorText = "End date required";
            else if (endDate <= startDate)
                endDateErrorText = "End date must be after start date";
        }

        return (
            <div>
                    <TextField
                        id="contestName"
                        label="Contest Name"
                        margin="none"
                        error={this.state.contestName === "" && this.state.attemptedCreate}
                        helperText={this.state.contestName === "" && this.state.attemptedCreate ? "Name is required" : ""}
                        style = {{width: '92%'}}
                        onChange={this.contestNameChange}
                    />
                    <br/>
                    <TextField
                        id="description"
                        type="description"
                        label="Description"
                        margin="none"
                        error={this.state.description === "" && this.state.attemptedCreate}
                        helperText={this.state.description === "" && this.state.attemptedCreate ? "Description is required" : ""}
                        style = {{width: '92%'}}
                        onChange={this.descriptionChange}
                    />
                    <br/><br/>
                    <div className='contest-form-content'>
                        <TextField
                            id="startDate"
                            label="Start Date"
                            margin="none"
                            type="datetime-local"
                            InputLabelProps={{
                              shrink: true,
                            }}
                            defaultValue={formatDate(this.state.startDate)}
                            error={(isNaN(startDate.getTime()) || startDate >= endDate || startDate < todayDate) && this.state.attemptedCreate}
                            helperText={startDateErrorText}
                            style = {{width: '50%'}}
                            onChange={this.startDateChange}
                        />

                        <TextField
                            id="endDate"
                            label="End Date"
                            margin="none"
                            type="datetime-local"
                            InputLabelProps={{
                              shrink: true,
                            }}
                            defaultValue={formatDate(this.state.endDate)}
                            error={(isNaN(endDate.getTime()) || endDate <= startDate) && this.state.attemptedCreate}
                            helperText={endDateErrorText}
                            //style = {{width: '35%'}}
                            style={{marginLeft: '3%', width:'50%'}}
                            onChange={this.endDateChange}
                        />
                    </div>
                    <br/><br/>
                    <Button
                        variant="contained"
                        margin="normal"
                        color="primary"
                        type="submit"
                        style={{display:'block', width:'100%'}}
                        onClick={this.handleCreateContest.bind()}
                    >
                    Create
                    </Button>

            </div>
        );
      }
}

export default CreateContest