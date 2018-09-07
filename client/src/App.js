import React, { Component } from 'react';

import Header from './components/Header/Header'
import Main from './Main'
import './style/style.css';

class App extends Component {
    state = {
        isLogged: true,
        isAdmin: null,
        data: 'NO INFO FROM API'
    };

    componentDidMount(){
        fetch('http://127.0.0.1:5000/users').then(results => {
            return results.json();
        }).then(data => {
            console.log(data.Users[0].email);
            this.setState({data: data.Users[0].email});
        }).catch(error => {
            console.error("Error fetching data from Flask API: ", error);
        });
    };

    handleLogout() {
        if(this.state.isLogged) {
            /* Once the back-end routine is developed, call it here.
             * If routine returns a success message, proceed with the state change */
            this.setState({
                isLogged: null,
                isAdmin: null,
            });
        }
    }

    render() {
        return (
            <div className="App">
                <Header
                  isLogged={this.state.isLogged}
                  isAdmin={this.state.isAdmin}
                  handleLogout={this.handleLogout.bind(this)}
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
        );
    }
}

export default App;
