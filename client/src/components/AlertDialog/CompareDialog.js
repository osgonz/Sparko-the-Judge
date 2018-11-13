/*******************************************************************************/
/*                                E X P O R T S                                */
/*******************************************************************************/
/*--------------------------------- R E A C T ---------------------------------*/
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/*--------------------------- M A T E R I A L   U I ---------------------------*/
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
/*******************************************************************************/


class CompareDialog extends Component {
  state = {
    open: this.props.open,
    contest: '',
    selectedContest: false,
    btnAcceptTitle: this.props.btnAcceptTitle

  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleAccept = () => {
    // we are in the compare view
    if (this.state.selectedContest) {
      this.setState({ selectedContest: false, 
                      btnAcceptTitle: "Compare"});  
    } else if(this.state.contest != '') {
      this.setState({ selectedContest: true, 
                      btnAcceptTitle: "Return"});
    }
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  render() {
    return (
      <div>
        
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {this.props.title}
          </DialogTitle>
          
          {
            this.props.contestList.length == 0 &&
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
               Can't compare because there are no contests that these users share in common.
              </DialogContentText>
            </DialogContent>
          }

          { !this.state.selectedContest && this.props.contestList.length != 0 &&
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
               {this.props.description} 
              </DialogContentText>

              <TextField
                id="select-list"
                select
                label="Contests"
                value={this.state.contest}
                onChange={this.handleChange('contest')}
                helperText="Select a contest"
                margin="normal"
              >
                {this.props.contestList.map(contest => (
                  <MenuItem key={contest.id} value={contest.id}>
                    {contest.name}
                  </MenuItem>
                  ))
                }
              </TextField>
            </DialogContent>
          }

          {
            this.state.selectedContest &&
            <h1> Cargando Statistics </h1>
          }

          { this.props.contestList.length != 0 &&
            <DialogActions>
              <Button onClick={this.handleClose} color="primary">
                {this.props.btnCancelTitle}
              </Button>
              <Button onClick={this.handleAccept} color="primary" autoFocus>
                {this.state.btnAcceptTitle}
              </Button>
            </DialogActions>
          }

          {
            this.props.contestList.length == 0 &&
            <Button onClick={this.handleClose} color="primary" autoFocus>
                Close
            </Button>
          }

        </Dialog>

      </div>
    );
  }
}

CompareDialog.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  btnAcceptTitle: PropTypes.string.isRequired,
  btnCancelTitle: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  acceptFunc: PropTypes.func.isRequired,
};

export default CompareDialog;