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

class InviteUsers extends Component {
    //Country is missing from here and the app.py
    constructor(props) {
        super(props);

        this.state = {
          contestID: -1,
          usernames: ""
        };

        this.handleInviteUsers = this.handleInviteUsers.bind(this);
        this.UsernamesChange = this.UsernamesChange.bind(this);
        this.handleModalClose = this.props.handleClose.bind(this);
    }

    componentWillMount() {
      this.setState({
          contestID: this.props.contestID,
      });
  }

    handleInviteUsers () {
      console.log(this.state.contestID)
        if(this.state.usernames !== "")
            var usernames = this.state.usernames.split(', ')
            axios.post('http://127.0.0.1:5000/AddUsersToContest', {
                contestID: this.state.contestID,
                usernames: usernames
            }, {withCredentials: true})
            .then(response => {
              console.log(response)
                if (response.data.StatusCode == 200) {
                    console.log(200);
                    this.handleModalClose(true, response.data.Message)
                    //window.location.reload();
                }

                if (response.data.StatusCode == 100) {
                    //Display error message
                    console.log(100);
                    this.handleModalClose(true, response.data.Message)
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

    UsernamesChange (event) {
        this.setState({usernames: event.target.value})
    }

    render() {
        return (
            <div>
                    <TextField
                        id="usernames"
                        label="Usernames"
                        placeholder="Enter usernames"
                        margin="none"
                        style = {{width: '92%'}}
                        onChange={this.UsernamesChange}
                    />
                    <br/><br/>
                    <Button
                        variant="contained"
                        margin="normal"
                        color="primary"
                        type="submit"
                        style={{display:'block', width:'100%'}}
                        onClick={this.handleInviteUsers.bind()}
                    >
                    Invite
                    </Button>

            </div>
        );
      }
}

export default InviteUsers