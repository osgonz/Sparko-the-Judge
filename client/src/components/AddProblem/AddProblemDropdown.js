import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Select from 'react-select';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';

import ProblemsTable from './ProblemsTable'

/*******************************************************************************/
/*                                                                             */
/*                         P R O B L E M    D R O P D O W N                    */
/*                                                                             */
/*******************************************************************************/

function parseProblemString(problem){
  var firstHyphen = problem.indexOf("-")
  var secondHyphen = problem.indexOf("-", firstHyphen + 1)
  var lastOpenParen = problem.lastIndexOf("(")
  var problemID = problem.substring(0, firstHyphen - 1)
  var problemNumber = problem.substring(firstHyphen + 2, secondHyphen - 1)
  var problemTitle = problem.substring(secondHyphen + 2, lastOpenParen - 1)
  var onlineJudge = problem.substring(lastOpenParen + 1, problem.length - 1)

  return  {problemID: parseInt(problemID), problemNumber: parseInt(problemNumber), problemTitle: problemTitle, onlineJudge: onlineJudge}
}

class AddProblemDropdown extends React.Component {

  constructor(props){
    super(props)
  }

  state = {
    selectedOption: null,
  }

  handleChange = (selectedOption) => {
    this.setState({ selectedOption });
  }

  handleSelectOption = () => {
    var selectedOptions = this.props.selectedOptionsDict
    var problem = parseProblemString(this.state.selectedOption.value)
    this.props.handleAddProblem(problem)
  }

  render() {
    const { selectedOption } = this.state;

    return (
      <div>
        <Button mini color="primary" disabled={!this.state.selectedOption} aria-label="Add problem" onClick={this.handleSelectOption}> Add problem </Button>
        <Select
          value={selectedOption}
          onChange={this.handleChange}
          options={this.props.problems}
        />
        <ProblemsTable data={this.props.addedProblems}/>
      </div>
    );
  }
}

export default AddProblemDropdown;
