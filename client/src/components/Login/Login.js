import React, { Component } from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';


var bgColors = { "Default": "#81b71a",
                    "Blue": "#00B1E1",
                    "Cyan": "#37BC9B",
                    "Green": "#8CC152",
                    "Red": "#E9573F",
                    "Yellow": "#F6BB42",
};

const cardStyle = {
    raised: true,
    width: '25%',
};

const textFieldStyle = {
    width: '90%',
}

const buttonStyle = {
    width: '30%',
    backgroundColor: "#0F2027",
    titleColor: "#FFFFFF"
}

const headerStyle = {
    titleColor: "inherit",
    color: "inherit"
}


class Login extends Component {
    render() {
        const { classes } = this.props;

        return (
            <center>
            <Card style={cardStyle} >
                <CardHeader
                  style={headerStyle}
                  title="Login"
                />
                <CardContent>
                   <form noValidate autoComplete="off">
                           <TextField
                             id="login"
                             label="Username"
                             margin="none"
                             style = {textFieldStyle}
                           />
                           <br/>
                           <TextField
                             id="password"
                             label="Password"
                             margin="none"
                             style = {textFieldStyle}
                           />
                           <br/>
                           <br/>
                           <Button
                             variant="contained"
                             margin="normal"
                             color="primary"
                             style= {buttonStyle}
                           >
                              Login
                           </Button>
                   </form>
                </CardContent>
            </Card>
            </center>
        );
      }
}

export default Login;