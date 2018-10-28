/*******************************************************************************/
/*                                E X P O R T S                                */
/*******************************************************************************/
/*--------------------------------- R E A C T ---------------------------------*/
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/*--------------------------- M A T E R I A L   U I ---------------------------*/
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
/*******************************************************************************/


class AlertDialog extends Component {
  state = {
    open: this.props.open,
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
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
          
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
             {this.props.description} 
            </DialogContentText>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              {this.props.btnCancelTitle}
            </Button>
            <Button onClick={this.props.acceptFunc} color="primary" autoFocus>
              {this.props.btnAcceptTitle}
            </Button>
          </DialogActions>
        </Dialog>

      </div>
    );
  }
}

AlertDialog.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  btnAcceptTitle: PropTypes.string.isRequired,
  btnCancelTitle: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  acceptFunc: PropTypes.func.isRequired,
};

export default AlertDialog;