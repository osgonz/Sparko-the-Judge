import React, { Component } from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import axios from 'axios'
import Suggestions from  './Suggestions'

const problems = ["hola hola hola", "hola adios", "me llamo gerardo", "me llamo oscar", "oscar web", "problema 1", "problema 2"]

// See: https://dev.to/sage911/how-to-write-a-search-component-with-suggestions-in-react-d20
class AddProblem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            problemQuery: '',
            queryResults: []
        }

        this.handleAddProblem = this.handleAddProblem.bind(this)
        this.problemQueryChanged = this.problemQueryChanged.bind(this)
    }

    handleAddProblem () {
    }

    problemQueryChanged (event) {
        var query = event.target.value
        var queryResults = []
        if (query !== ""){
            queryResults = problems.filter(problem => problem.includes(query))
        }

        console.log(query)
        console.log(queryResults)

        this.setState({problemQuery: query})
        this.setState({queryResults: queryResults})
    }

    render() {
        return (
            <div>
                <input
                    id="problemQuery"
                    label="Search for a problem"
                    margin="none"
                    placeholder="Search for a problem..."
                    ref={input => this.search = input}
                    style = {{width: '90%'}}
                    onChange={this.problemQueryChanged.bind()}
                />
                <Button
                    variant="contained"
                    margin="normal"
                    color="primary"
                    type="submit"
                    style= {{width: '30%', backgroundColor: "#0F2027", titleColor: "#FFFFFF"}}
                    onClick={this.handleAddProblem.bind()}
                >
                Add problem
                </Button>
                <Suggestions results={this.state.queryResults} />
            </div>
        );
      }
}

export default AddProblem
