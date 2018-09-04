import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import '../../style/style.css';

const styles = {
    header: {
        flexGrow: 1,
    },
    titleFlex: {
        flexGrow: 1,
    },
};

class Header extends Component {
    render() {
        const { classes } = this.props;
        
        const headerButtons = this.props.isLogged ? (
            <div className="header-bar">
                <Link to='/contests' style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Button className="header-button">
                        Contests
                    </Button>
                </Link>
                <Link to='/profile' style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Button className="header-button">
                        Profile
                    </Button>
                </Link>
                <Button className="header-button">
                    Log Out
                </Button>
            </div>
        ) : (
            <div>
                <Button className="header-button">
                    Log In
                </Button>
            </div>
        );

        return (
            <div className={classes.header}>
                <AppBar position="static" className="header-bar">
                    <Toolbar>
                        <Typography variant="title" color="inherit" className={classes.titleFlex}>
                            <Link to='/' style={{ textDecoration: 'none', color: 'inherit' }}>
                                CoProManager
                            </Link>
                        </Typography>
                        { headerButtons }
                    </Toolbar>
                </AppBar>
            </div>
        );
    }
}

export default withStyles(styles)(Header);