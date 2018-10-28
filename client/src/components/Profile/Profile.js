import React, { Component } from "react";
import ReactDOM from 'react-dom';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import EditIcon from '@material-ui/icons/Edit';
import Snackbar from '@material-ui/core/Snackbar';
import axios from 'axios'

class Profile extends Component {
  
  constructor(props) {
    super(props)
    this.state = {
        userId: '',
        fname: '',
        lname: '',
        email: '',
        username: '',
        password: 'random_123123',
        new_password: '',
        country: '',
        countryInt: undefined,
        countries: [{value: '', display: '(Select your Country)'}],
        iduva: '',
        idicpc: '',
        openSnackbar: false,
        snackbarMessage: '',
        isEditingPersonalInfo: false,
        isEditingUsernameInfo: false,
        isEditingPassword: false
    }

    this.handleEditingPersonalInfo = this.handleEditingPersonalInfo.bind(this)
    this.handleEditingUsernameInfo = this.handleEditingUsernameInfo.bind(this)
    this.handleEditingPassword = this.handleEditingPassword.bind(this)
    this.handlePersonalInfoUpdate = this.handlePersonalInfoUpdate.bind(this)
    this.handleUsernameInfoUpdate = this.handleUsernameInfoUpdate.bind(this)
    this.handlePasswordUpdate = this.handlePasswordUpdate.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.getData = this.getData.bind(this)
  }

  componentDidMount() {
    this.getData()
  }

  getData () {
    const { userId, username } = this.state;

		axios.post('http://127.0.0.1:5000/GetUser',{}, {withCredentials: true})
		.then(response => {
			if (response.data.status === 200){
        let _countries = response.data.countries.map((country, index)=>{return {value:index, display:country}})
        if (response.data.country == null) response.data.country = ''
        if (response.data.username_uva == null) response.data.username_uva = ''
        if (response.data.username_icpc == null) response.data.username_icpc = ''
				this.setState({username: response.data.username, fname: response.data.fname, lname: response.data.lname, email: response.data.email, country: response.data.country, iduva: response.data.username_uva, idicpc: response.data.username_icpc, countries: _countries})
			}
			else if (response.data.status === 100){
				this.setState({openSnackbar: true, snackbarMessage: response.data.message})
			}
		})
		.catch((error) => {
				console.log(error);
    });
  }

  handleEditingPersonalInfo () {
    this.setState({isEditingPersonalInfo: !this.state.isEditingPersonalInfo})
  }

  handleEditingUsernameInfo () {
    this.setState({isEditingUsernameInfo: !this.state.isEditingUsernameInfo})
  }

  handleEditingPassword () {
    this.setState({isEditingPassword: !this.state.isEditingPassword, password:'random_123123'})
  }

  handleClose () {
    this.setState({openSnackbar: false})
  }

  handlePersonalInfoUpdate () {
    const {username, fname, lname, email, countryInt, country} = this.state;
    axios.post('http://127.0.0.1:5000/EditUser',{
      new_username: username,
      fname: fname,
      lname: lname,
      email: email,
      country: countryInt
    }, {withCredentials: true})
		.then(response => {
      console.log(response.data)
			if (response.data.status === 200){
        this.setState({openSnackbar:true, snackbarMessage:response.data.message, isEditingPersonalInfo:false})
			}
			else if (response.data.status === 100){
				this.setState({openSnackbar: true, snackbarMessage: response.data.message})
			}
		})
		.catch((error) => {
				console.log(error);
		});
  }

  handleUsernameInfoUpdate () {
    const {username, iduva, idicpc} = this.state;
    axios.post('http://127.0.0.1:5000/EditUserJudgesUsernames',{
      username: username,
      username_UVA: iduva,
      username_ICPC: idicpc,
    }, {withCredentials: true})
		.then(response => {
			if (response.data.status === 200){
        this.setState({openSnackbar:true, snackbarMessage:response.data.message, isEditingUsernameInfo:false})
			}
			else if (response.data.status === 100){
				this.setState({openSnackbar: true, snackbarMessage: response.data.message})
			}
		})
		.catch((error) => {
				console.log(error);
		});
  }

  handlePasswordUpdate () {
    const {password, new_password} = this.state;
    axios.post('http://127.0.0.1:5000/EditPassword',{
      newPassword: new_password,
      password: password
    }, {withCredentials: true})
		.then(response => {
			if (response.data.status === 200){
        this.setState({openSnackbar:true, snackbarMessage:response.data.message, isEditingPassword:false})
			}
			else if (response.data.status === 100){
				this.setState({openSnackbar: true, snackbarMessage: response.data.message})
			}
		})
		.catch((error) => {
				console.log(error);
		});
  }
  
  render() {
    const {isEditingPersonalInfo,isEditingUsernameInfo,isEditingPassword}  = this.state;
    return (
      <center>
        <div className='Header'>
          <h1>Profile</h1>
        </div>
        <Divider />
        {/*--------Personal Information!---------*/}
        <div className="PersonalInfo"> 
          <div className='lineContent'>
            {!isEditingPersonalInfo ? (
              <Button variant="fab" mini color="primary" aria-label="Edit" onClick={this.handleEditingPersonalInfo} style={{margin:'1% 1%'}}>
                <EditIcon />
              </Button>) : (
                <div></div>
              )
            }
            <h3 className="subheader">Personal Information</h3>
          </div>
          <div className='lineContent'>
            <TextField
              id="outlined-fname"
              label="First Name"
              value={this.state.fname}
              margin="normal"
              onChange={(e) => this.setState({fname: e.target.value})}
              disabled={!isEditingPersonalInfo}
            />
            <TextField
              id="outlined-lname"
              label="Last Name"
              style={{marginLeft: '3%'}}
              value={this.state.lname}
              margin="normal"
              onChange={(e) => this.setState({lname: e.target.value})}
              disabled={!isEditingPersonalInfo}
            />
            <TextField
              id="outlined-email"
              label="Email"
              value={this.state.email}
              style={{marginLeft: '3%', width:'250px'}}
              margin="normal"
              onChange={(e) => this.setState({email: e.target.value})}
              disabled={!isEditingPersonalInfo}
            />
          </div>
          <div className="lineContent">
            <TextField
              id="outlined-username"
              label="Username"
              value={this.state.username}
              margin="normal"
              onChange={(e) => this.setState({username: e.target.value})}
              disabled={!isEditingPersonalInfo}
            />
            <FormControl className='FormControl' style={{minWidth: '15%', margin:'1.5% 3% 1%'}}>
              <InputLabel htmlFor="country-simple">Country</InputLabel>
              <Select
                value={this.state.country}
                label="Country"
                disabled={!isEditingPersonalInfo}
                onChange={(e) => {
                  console.log(e.target.value)
                  this.setState({country: e.target.value, countryInt: e.target.value})
                }}
                inputProps={{
                  name: 'country',
                  id: 'country-simple',
                }}
              >
                {this.state.countries.map((_country) => <MenuItem key={_country.value} value={_country.value}>{_country.display}</MenuItem>)}
              </Select>
            </FormControl>
          </div>
          {isEditingPersonalInfo ? (
            <div className="Buttons">
              <Button
                onClick={this.handleEditingPersonalInfo}
                variant="outlined"
                color="primary"
                style={{margin:'0% 0% 1%'}}
              >Cancel</Button>
              <Button
                onClick={this.handlePersonalInfoUpdate.bind()}
                variant="contained"
                color="primary"
                style={{margin:'0% 1% 1%'}}
              >Save</Button>
            </div>
          ) : (
            <br/>
          )}
          <Divider />
        </div>
        {/*-------- Password Information ---------*/}
        <div className='UsernameInformation'>
          <div className='lineContent'>
            {!isEditingPassword ? (
              <Button variant="fab" mini color="primary" aria-label="Edit" onClick={this.handleEditingPassword} style={{margin:'1% 1%'}}>
                <EditIcon />
              </Button>) : (
                <div></div>
              )
            }
            <h3 className="subheader">Password</h3>
          </div>
          <div className='lineContent' style={{marginTop:'-10'}}>
            <TextField
              id="outlined-password"
              type='password'
              label="Current Password"
              value={this.state.password}
              margin="normal"
              onChange={(e) => this.setState({password: e.target.value})}
              disabled={!isEditingPassword}
            />
            {isEditingPassword ? (
              <TextField
              id="outlined-newpassword"
              type='password'
              label="New Password"
              value={this.state.new_password}
              margin="normal"
              style={{marginLeft: '3%'}}
              onChange={(e) => this.setState({new_password: e.target.value})}
              disabled={!isEditingPassword}
            />
            ) : (
              <div></div>
          )}
          </div>
          {isEditingPassword ? (
            <div className="Buttons">
              <Button
                onClick={this.handleEditingPassword}
                variant="outlined"
                color="primary"
                style={{margin:'0% 0% 1%'}}
              >Cancel</Button>
              <Button
                onClick={this.handlePasswordUpdate.bind()}
                variant="contained"
                color="primary"
                style={{margin:'0% 1% 1%'}}
              >Save</Button>
            </div>
          ) : (
            <br/>
          )}
        </div>
        <Divider />
        {/*-------- Username Information ---------*/}
        <div className='UsernameInformation'>
          <div className='lineContent'>
            
            {!isEditingUsernameInfo ? (
              <Button variant="fab" mini color="primary" aria-label="Edit" onClick={this.handleEditingUsernameInfo} style={{margin:'1% 1%'}}>
                <EditIcon />
              </Button>) : (
                <div></div>
              )
            }
            <h3 className="subheader">Usernames</h3>
          </div>
          <div className='lineContent'>
            <TextField
              id="outlined-uva"
              label="UVA Username"
              value={this.state.iduva}
              margin="normal"
              onChange={(e) => this.setState({iduva: e.target.value})}
              disabled={!isEditingUsernameInfo}
            />
            <TextField
              id="outlined-icpc"
              label="ICPC Username"
              value={this.state.idicpc}
              style={{marginLeft: '3%'}}
              margin="normal"
              onChange={(e) => this.setState({idicpc: e.target.value})}
              disabled={!isEditingUsernameInfo}
            />
          </div>
          {isEditingUsernameInfo ? (
            <div className="Buttons">
              <Button
                onClick={this.handleEditingUsernameInfo}
                variant="outlined"
                color="primary"
              >Cancel</Button>
              <Button
                onClick={this.handleUsernameInfoUpdate.bind()}
                variant="contained"
                color="primary"
                style={{margin:'0% 1%'}}
              >Save</Button>
            </div>
          ) : (
            <div></div>
          )}
        </div>  
        <Snackbar
                open={this.state.openSnackbar}
                onClose={this.handleClose}
                autoHideDuration={4000}
                ContentProps={{
                  'aria-describedby': 'message-id',
                }}
                message={<span id="message-id">{this.state.snackbarMessage}</span>}
            />
      </center>
    )
  }
}

export default Profile;
