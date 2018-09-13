/*******************************************************************************/
/*                                E X P O R T S                                */
/*******************************************************************************/
/*--------------------------------- R E A C T ---------------------------------*/
import React, { Component } from 'react';
import { Link, NavLink } from 'react-router-dom';

/*--------------------------- M A T E R I A L   U I ---------------------------*/
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import IconButton from "@material-ui/core/IconButton/IconButton";
import Menu from "@material-ui/core/Menu/Menu";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import Person from '@material-ui/icons/Person';
import FitnessCenter from '@material-ui/icons/FitnessCenter';
import Group from '@material-ui/icons/Group';

/*---------------------------- C O M P O N E N T S ----------------------------*/
import '../../style/style.css';
/*******************************************************************************/

const styles = {
    header: {
        flexGrow: 1,
    },
    titleFlex: {
        flexGrow: 1,
    },
};


// Header component embodies the site's navigation bar
// Props: isLogged (boolean) and isAdmin (boolean)
class Header extends Component {
    state = {
        anchor: null,
    };

    handleMenuToggle = event => {
        this.setState({
            anchor: event.currentTarget
        });
    };

    handleMenuToggleClose = () => {
        this.setState({
            anchor: null
        });
    };

    render() {
        const { classes } = this.props;

        const isMenuOpen = Boolean(this.state.anchor);

        // If logged in, show dropdown options for 'profile' and 'log out'
        // If not logged in, show options for 'register' and 'log in'
        const menuButtons = this.props.isLogged ? (
            <div className="header-user-menu">
                <NavLink to='/profile' style={{ textDecoration: 'none', color: 'inherit' }}>
                    <MenuItem className="header-user-menu-item" onClick={this.handleMenuToggleClose}>PROFILE</MenuItem>
                </NavLink>
                <MenuItem className="header-user-menu-item" onClick={this.handleMenuToggleClose}>LOG OUT</MenuItem>
            </div>
        ) : (
            <div className="header-user-menu">
                <NavLink to='/login' style={{ textDecoration: 'none', color: 'inherit' }}>
                    <MenuItem className="header-user-menu-item" onClick={this.handleMenuToggleClose}>LOG IN</MenuItem>
                </NavLink>
                <NavLink to='/signup' style={{ textDecoration: 'none', color: 'inherit' }}>
                    <MenuItem className="header-user-menu-item" onClick={this.handleMenuToggleClose}>REGISTER</MenuItem>
                </NavLink>
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
                        { /* If logged in, show user and admin buttons respectively */ }
                        { this.props.isLogged && (
                            <div>
                                <NavLink to='/contests' style={{ textDecoration: 'none', color: 'inherit' }}>
                                <IconButton
                                    aria-label="Contests"
                                    color="inherit"
                                >
                                    <FitnessCenter/>
                                </IconButton>
                                </NavLink>
                                {this.props.isAdmin &&
                                <NavLink to='/users' style={{textDecoration: 'none', color: 'inherit'}}>
                                    <IconButton
                                        aria-label="User List"
                                        color="inherit"
                                    >
                                        <Group/>
                                    </IconButton>
                                </NavLink>
                                }
                            </div>
                            ) }
                        <IconButton
                            aria-owns={isMenuOpen ? 'menu-appbar' : null}
                            aria-haspopup="true"
                            onClick={this.handleMenuToggle}
                            color="inherit"
                        >
                            <Person />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={this.state.anchor}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={isMenuOpen}
                            onClose={this.handleMenuToggleClose}
                        >
                            { menuButtons }
                        </Menu>
                    </Toolbar>
                </AppBar>
            </div>
        );
    }
}

export default withStyles(styles)(Header);