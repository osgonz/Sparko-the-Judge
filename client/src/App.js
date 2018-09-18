/*******************************************************************************/
/*                                E X P O R T S                                */
/*******************************************************************************/
/*--------------------------------- R E A C T ---------------------------------*/
import React, { Component } from 'react';

/*---------------------------- C O M P O N E N T S ----------------------------*/
import Header from './components/Header/Header'
import Main from './Main'

/*--------------------------- M A T E R I A L   U I ---------------------------*/
import { AppTheme } from './style/style.js';
import { MuiThemeProvider } from '@material-ui/core/styles';
import './style/style.css';
/*******************************************************************************/
import axios from 'axios'


class App extends Component {

    loginChanged = val => {
      this.setState({
        isLogged: val
      });
    }

    state = {
        isLogged: null,
        isAdmin: null,
        loginChanged: this.loginChanged,
        hasVerifiedSession: null,
    };

    componentDidMount(){
		axios.get('http://127.0.0.1:5000/GetActiveSession', {withCredentials: true})
        .then(response => {
            console.log(response.data);
			if (response.data != 'Session not found')
				this.setState({
					isLogged: true,
				});
			this.setState({
				hasVerifiedSession: true,
			});
        })
		this.loginChanged = this.loginChanged.bind(this)
    };

    handleLogout() {
        if(this.state.isLogged) {
            this.setState({
                isLogged: null,
                isAdmin: null,
            });
        }
    }

	render() {
		if (this.state.hasVerifiedSession)
			return (
				<MuiThemeProvider theme={AppTheme}>
					<div className="App">
					<Header
						isLogged={this.state.isLogged}
						isAdmin={this.state.isAdmin}
            handleLogout={this.handleLogout.bind(this)}
					/>
					<Main
						isLogged={this.state.isLogged}
						isAdmin={this.state.isAdmin}
						loginChanged={this.state.loginChanged}
					/>
					{ /*
					<p className="App-intro">
						To get started, edit <code>src/App.js</code> and save to reload.
					</p>
					<p>
						{this.state.data}
					</p>
					*/ }
					</div>
				</MuiThemeProvider>
			);
		else
			return null;
	}
}

export default App;
