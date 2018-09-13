import React, { Component } from 'react';

import Header from './components/Header/Header'
import Main from './Main'
import './style/style.css';

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
      <div className="App">
          <Header
              isLogged={this.state.isLogged}
              isAdmin={this.state.isAdmin}
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
    );
  }
}

export default App;
