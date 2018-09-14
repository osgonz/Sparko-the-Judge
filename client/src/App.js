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
        data: 'NO INFO FROM API'
    };

    componentDidMount(){
      this.loginChanged = this.loginChanged.bind(this)
    };

  render() {
    return (
      <MuiThemeProvider theme={AppTheme}>
        <div className="App">
            <Header
                isLogged={this.state.isLogged}
                isAdmin={this.state.isAdmin}
            />
            <Main
                isLogged={this.state.isLogged}
                isAdmin={this.state.isAdmin}
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
  }
}

export default App;
