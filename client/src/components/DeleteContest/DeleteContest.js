import React, { Component } from "react";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import axios from 'axios'

class DeleteContest extends Component {
    //Country is missing from here and the app.py
    constructor(props) {
        super(props);
        this.state = {
            contestName: '',
			contestID: -1,
        };
        this.handleDeleteContest = this.handleDeleteContest.bind(this);
    }

    componentWillMount() {
        this.setState({
            contestID: this.props.contestID,
            contestName: this.props.contestName
        });
    }

    handleDeleteContest () {
    const {contestID} = this.state;
    // Delete Contest
    axios.post('https://copromanager-api.herokuapp.com/DeleteContest', {
        contestID: contestID,
    }, {withCredentials: true})
    .then(response => {
        console.log(response);
        if (response.data.status == 200) {
            console.log(200);
            window.location.replace("/contests");
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


    render() {
        const { classes } = this.props;
        const {contestName} = this.state;

        return (
            <div>
                <div>
                Are you sure you want to delete {contestName}?
                </div>
                <br/>
                <Button
                    variant="contained"
                    margin="normal"
                    color="primary"
                    type="submit"
                    style={{display:'block', width:'100%'}}
                    onClick={this.handleDeleteContest.bind()}
                >
                Delete
                </Button>

            </div>
        );
      }
}

export default DeleteContest