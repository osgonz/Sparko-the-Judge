import React, { Component } from 'react';

import Header from './components/Header/Header'
import Main from './Main'
import './style/style.css';

class App extends Component {
    state = {
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
  render() {
    return (
      <div className="App">
          <Header
              isLogged={false}
              isAdmin={false}
          />
          <Main
              isLogged={false}
              isAdmin={false}
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
