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

class SignUp extends Component {
    //Country is missing from here and the app.py
    constructor(props) {
        super(props)
        this.state = {
            username: '',
            password: '',
            fname: '',
            lname: '',
            email: '',
            //country: '',
            attemptedRegister: false
        }

        this.handleSignUp = this.handleSignUp.bind(this)
        this.handleClose = this.handleClose.bind(this)
        this.usernameChange = this.usernameChange.bind(this)
        this.passwordChange = this.passwordChange.bind(this)
        this.firstNameChange = this.firstNameChange.bind(this)
        this.lastNameChange = this.lastNameChange.bind(this)
        this.emailChange = this.emailChange.bind(this)
        //this.countryChange = this.countryChange.bind(this)
    }

    handleSignUp () {
            const {username, password, fname, lname, email /*country*/} = this.state;
            this.setState({attemptedRegister: true})
        if(this.state.username !== "" && this.state.password !=="" && this.state.fname !== "" && this.state.lname !== "" && this.state.email !== "") {
            axios.post('http://127.0.0.1:5000/CreateUser', {
                username: username,
                password: password,
                fname: fname,
                lname: lname,
                email: email,
                //country: country,
                usertype: 1
            })
                .then(response => {
                    if (response.data.status == 200) {
                        //changes user to profile if login is successful
                        this.props.loginChanged(this.state.userId != '')
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

    usernameChange (event) {
        this.setState({username: event.target.value})
    }

    passwordChange (event) {
        this.setState({password: event.target.value})
    }

    firstNameChange (event) {
        this.setState({fname: event.target.value})
    }

    lastNameChange (event) {
        this.setState({lname: event.target.value})
    }

    emailChange (event) {
        this.setState({email: event.target.value})
    }

    handleClose() {
        this.setState({openSnackbar: false})
    }

    /*
    countryChange (event) {
        this.setState({country: event.target.value})
    }

    <br/>
    <TextField
        id="country"
        label="Country"
        margin="none"
        error={this.state.country === "" && this.state.attemptedRegister}
        helperText={this.state.country === "" && this.state.attemptedRegister ? "Country is required" : ""}
        style = {{width: '90%'}}
        onChange={this.countryChange}
    />

                    */

    //Tried getting a country dropdown but the style doesn't go with the rest of the card.
    //Source of dropdown: https://www.npmjs.com/package/react-country-region-selector-material-ui#es6
    render() {
        const { classes } = this.props;

        return (
            <center>
            <Card style={{raised: true, width: '25%', margin: '50px'}} >
                <CardHeader
                  //style={{titleColor: "inherit", color: "inherit"}}
                  title="Register"
                />
                <CardContent>
                    <TextField
                        id="username"
                        label="Username"
                        margin="none"
                        error={this.state.username === "" && this.state.attemptedRegister}
                        helperText={this.state.username === "" && this.state.attemptedRegister ? "Username is required" : ""}
                        style = {{width: '90%'}}
                        onChange={this.usernameChange}
                    />
                    <br/>
                    <TextField
                        id="password"
                        type="password"
                        label="Password"
                        margin="none"
                        error={this.state.password === "" && this.state.attemptedRegister}
                        helperText={this.state.password === "" && this.state.attemptedRegister ? "Password is required" : ""}
                        style = {{width: '90%'}}
                        onChange={this.passwordChange}
                    />
                    <br/>
                    <TextField
                        id="fname"
                        label="First Name"
                        margin="none"
                        error={this.state.fname === "" && this.state.attemptedRegister}
                        helperText={this.state.fname === "" && this.state.attemptedRegister ? "First name is required" : ""}
                        style = {{width: '90%'}}
                        onChange={this.firstNameChange}
                    />
                    <br/>
                    <TextField
                        id="lname"
                        label="Last Name"
                        margin="none"
                        error={this.state.lname === "" && this.state.attemptedRegister}
                        helperText={this.state.lname === "" && this.state.attemptedRegister ? "Last name is required" : ""}
                        style = {{width: '90%'}}
                        onChange={this.lastNameChange}
                    />
                    <br/>
                    <TextField
                        id="email"
                        type="email"
                        label="Email"
                        margin="none"
                        error={this.state.email === "" && this.state.attemptedRegister}
                        helperText={this.state.email === "" && this.state.attemptedRegister ? "Email is required" : ""}
                        style = {{width: '90%'}}
                        onChange={this.emailChange}
                    />
                    <br/>
                    <br/>
                    <Button
                        variant="contained"
                        margin="normal"
                        color="primary"
                        type="submit"
                        style= {{width: '30%', backgroundColor: "#0F2027", titleColor: "#FFFFFF"}}
                        onClick={this.handleSignUp.bind()}
                    >
                    Sign Up
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

export default SignUp