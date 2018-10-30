import React from 'react';
import Select from 'react-select';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';

import UsersTable from './UsersTable'

/*******************************************************************************/
/*                                                                             */
/*                         U S E R    D R O P D O W N                          */
/*                                                                             */
/*******************************************************************************/

class AddUserDropdown extends React.Component {

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
    var user = this.state.selectedOption.user
    this.props.handleAddUser(user)
  }

  render() {
    const { selectedOption } = this.state;
    let users = [];
    console.log(this.props.users);
    this.props.users.forEach(user => {
        users.push({'value': user.username, 'label': user.username, 'user': user});
    });

    return (
      <div style={{marginLeft: '1%', width:'49%'}}>
        {this.props.isEditable &&
        <div className="contest-form-dropdown-button">
            <div style={{marginRight: '1%', width:'91%'}}>
                <Select
                  value={selectedOption}
                  onChange={this.handleChange}
                  options={users}
                />
            </div>
            <div style={{width:'8%'}}>
                <IconButton disabled={!this.state.selectedOption} aria-label="Add User" onClick={this.handleSelectOption}>
                    <AddIcon />
                </IconButton>
            </div>
        </div>
        }
        <UsersTable isEditable={this.props.isEditable} data={this.props.addedUsers} handleRemoveUser={this.props.handleRemoveUser}/>
      </div>
    );
  }
}

export default AddUserDropdown;
