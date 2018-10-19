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

function formatUTCDate(date)
{
	var today = date;
	var dd = today.getUTCDate();
	var mm = today.getUTCMonth()+1;
	var yyyy = today.getUTCFullYear();
	var h = (today.getUTCHours()<10?'0':'') + today.getUTCHours();
	var m = (today.getUTCMinutes()<10?'0':'') + today.getUTCMinutes();

	if(dd<10) {
		dd = '0'+dd
	} 

	if(mm<10) {
		mm = '0'+mm
	} 
	var dateFormated = yyyy + '-' + mm + '-' + dd+'T'+ h + ':' + m;
	
	return dateFormated;
}

class EditContest extends Component {
    //Country is missing from here and the app.py
    constructor(props) {
        super(props);
        let today = new Date();
        today.setSeconds(0,0);
        let tomorrow = new Date();
        tomorrow = tomorrow.setDate(tomorrow.getDate()+1);
        tomorrow = new Date(tomorrow);

        this.state = {
            contestName: '',
            description: '',
            currentDate: today,
            startDate: today,
            endDate: tomorrow,
			contestID: -1,
            status: -1,
            attemptedEdit: false
        };

        this.handleEditContest = this.handleEditContest.bind(this);
        this.contestNameChange = this.contestNameChange.bind(this);
        this.descriptionChange = this.descriptionChange.bind(this);
        this.startDateChange = this.startDateChange.bind(this);
        this.endDateChange = this.endDateChange.bind(this);
        this.handleModalClose = this.props.handleClose.bind(this);
    }

    componentWillMount() {
        let startDate = new Date(this.props.startDate);
        startDate = new Date(formatUTCDate(startDate));
        let endDate = new Date(this.props.endDate);
        endDate = new Date(formatUTCDate(endDate));

        startDate.setSeconds(0,0);
        endDate.setSeconds(0,0);

        this.setState({
            contestID: this.props.contestID,
            contestName: this.props.contestName,
            description: this.props.description,
            startDate: startDate,
            endDate: endDate,
            status: this.props.status,
        });
    }

    handleEditContest () {
		console.log("GOT IN");

		this.setState({attemptedEdit: true})

        // Removing seconds and milliseconds from dates
        this.state.startDate.setSeconds(0,0);
		this.state.endDate.setSeconds(0,0);
		this.state.currentDate.setSeconds(0,0);

        if(this.state.contestName !== "" && this.state.description !=="" && this.state.startDate < this.state.endDate &&
            (this.state.startDate >= this.state.currentDate || this.state.status == 1)) {
            // Parsing date times
            const {contestName, description, contestID, status} = this.state;
            let {startDate, endDate} = this.state;
            startDate = formatDate(startDate)
            endDate = formatDate(endDate)

            console.log("CALLING AXIOS")
            axios.post('http://127.0.0.1:5000/EditContest', {
                contestID: contestID,
                contestName: contestName,
                description: description,
                startDate: startDate,
                endDate: endDate,
                status: status,
            }, {withCredentials: true})
            .then(response => {
                if (response.data.status == 200) {
                    console.log(200);
                    this.handleModalClose(true, "Contest edited successfully")
                    window.location.reload();
                }

                if (response.data.status == 100) {
                    //Display error message
                    console.log(100);
                    this.handleModalClose(true, response.data.message)
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

        return (
            <div>
                    <TextField
                        id="contestName"
                        label="Contest Name"
                        margin="none"
                        defaultValue={this.state.contestName}
                        error={this.state.contestName === "" && this.state.attemptedEdit}
                        helperText={this.state.contestName === "" && this.state.attemptedEdit ? "Name is required" : ""}
                        style = {{width: '92%'}}
                        onChange={this.contestNameChange}
                    />
                    <br/>
                    <TextField
                        id="description"
                        type="description"
                        label="Description"
                        margin="none"
                        defaultValue={this.state.description}
                        error={this.state.description === "" && this.state.attemptedEdit}
                        helperText={this.state.description === "" && this.state.attemptedEdit ? "Description is required" : ""}
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
                            disabled={this.state.status > 0}
                            error={this.state.status == 0 && (isNaN(startDate.getTime()) || startDate >= endDate || startDate < todayDate) && this.state.attemptedEdit}
                            helperText={this.state.status == 0 && (isNaN(startDate.getTime()) || startDate >= endDate || startDate < todayDate) && this.state.attemptedEdit ? "Valid start date is required" : ""}
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
                            disabled={this.state.status > 0}
                            error={(isNaN(endDate.getTime()) || endDate <= startDate) && this.state.attemptedEdit}
                            helperText={(isNaN(endDate.getTime()) || endDate <= startDate) && this.state.attemptedEdit ? "Valid end date is required" : ""}
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
                        onClick={this.handleEditContest.bind()}
                    >
                    Edit
                    </Button>

            </div>
        );
      }
}

export default EditContest