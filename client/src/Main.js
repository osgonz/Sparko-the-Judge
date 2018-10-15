/*******************************************************************************/
/*                                E X P O R T S                                */
/*******************************************************************************/
/*--------------------------------- R E A C T ---------------------------------*/
import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom'

/*--------------------------- M A T E R I A L   U I ---------------------------*/


/*---------------------------- C O M P O N E N T S ----------------------------*/
import Error404 from './components/Error404/Error404';
import About from './components/About/About';
import Login from './components/Login/Login';
import SignUp from './components/SignUp/SignUp';
import Profile from './components/Profile/Profile';
import Users from './components/Users/Users';

/*******************************************************************************/

// Main component serves as our main switch and container for general site content
// Props: isLogged (boolean) and isAdmin (boolean)
class Main extends Component {
    constructor(props) {
        super(props)
    }

    render() {

        const LoginComponent = (props) => {
            return (
                <Login loginChanged={this.props.loginChanged}/>
            );
        }

        const SignUpComponent = (props) => {
            return (
                <SignUp loginChanged={this.props.loginChanged}/>
            );
        }

        const ProfileComponent = (props) => {
            return (
                <Profile />
            )
        }

        const UsersComponent = (props) => {
            return (
                <Users isAdmin={this.props.isAdmin} />
            );
        }

        const ProfileRedirect = (props) => {
            return (
                <Redirect to='/profile'/>
            );
        }

        const LoginRedirect = (props) => {
            return (
                <Redirect to='/login'/>
            );
        }

        // Replace Error404 component with the correct one once a specific page is developed
        return(
            <div className="main-container">
                <Switch>
                    <Route exact path='/' component= {About} />
                    { /* If logged and admin, show Users page */ }
                    <Route path='/users' render= {this.props.isLogged ? UsersComponent : LoginRedirect}/>
                    { /* If logged, show Contests page; otherwise show Login page */ }
                    <Route path='/contests' render= {this.props.isLogged ? Error404 : Error404} />
                    { /* If logged, show Profile page; otherwise show Login page */ }
                    <Route exact path='/profile' render= {this.props.isLogged ? ProfileComponent : LoginRedirect} />
                    { /* If logged, show Login page; otherwise show Home page */ }
                    <Route exact path='/login' render= {this.props.isLogged ? ProfileRedirect : LoginComponent} />
                    { /* If logged, show Home page; otherwise show Sign Up page */ }
                    <Route exact path='/signup' render= {this.props.isLogged ? ProfileRedirect : SignUpComponent} />
                    { /* Otherwise show 404 page */ }
                    <Route component= {Error404} />
                </Switch>
            </div>
        );
    }
}

export default Main;

