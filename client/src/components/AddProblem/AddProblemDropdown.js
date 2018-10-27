import React from 'react';
import Select from 'react-select';
import IconButton from "@material-ui/core/IconButton";
import AddIcon from '@material-ui/icons/Add';

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

  return  {problemID: parseInt(problemID), problemNumber: parseInt(problemNumber), problemName: problemTitle, judge: onlineJudge}
}

class AddProblemDropdown extends React.Component {

  constructor(props){
    super(props)
    console.log(props)
  }

  state = {
    selectedOption: null,
  }

  handleChange = (selectedOption) => {
    this.setState({ selectedOption });
  }

  handleSelectOption = () => {
    var selectedOptions = this.props.addedProblems
    var problem = parseProblemString(this.state.selectedOption.value)
    this.props.handleAddProblem(problem)
  }

  render() {
    const { selectedOption } = this.state;

    return (
      <div style={{marginRight: '1%', width:'49%'}}>
        {this.props.isEditable &&
          <div className="contest-form-dropdown-button">
              <div style={{marginRight: '1%', width:'91%'}}>
                <Select
                  value={selectedOption}
                  onChange={this.handleChange}
                  options={this.props.problems}
                />
              </div>
              <div style={{width:'8%'}}>
                  <IconButton disabled={!this.state.selectedOption} aria-label="Add Problem" onClick={this.handleSelectOption}>
                      <AddIcon />
                  </IconButton>
              </div>
          </div>
        }
        <ProblemsTable isEditable={this.props.isEditable} data={this.props.addedProblems} handleRemoveProblem={this.props.handleRemoveProblem}/>
      </div>
    );
  }
}

export default AddProblemDropdown;
