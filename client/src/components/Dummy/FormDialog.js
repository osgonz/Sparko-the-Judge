import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Snackbar from '@material-ui/core/Snackbar';
import CreateContest from '../CreateContest/CreateContest';

export default class FormDialog extends React.Component {
  state = {
    open: false,
    openSnackbar: false,
    snackbarMessage: '',
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = (showFeedback, feedbackMessage) => {
    this.setState({ open: false });
    if (showFeedback){
      this.setState({openSnackbar: true, snackbarMessage: feedbackMessage})
    }
  };

  handleSnackbarClose = () => {
    this.setState({ openSnackbar: false });
  }

  render() {
    return (
      <div>
        <Button onClick={this.handleClickOpen}>Create contest</Button>
        <Dialog
          open={this.state.open}
          onClose={() => this.handleClose(false, "")}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Create contest</DialogTitle>
          <DialogContent>
          <CreateContest handleClose={this.handleClose} />
          </DialogContent>
        </Dialog>
        <Snackbar
            open={this.state.openSnackbar}
            onClose={this.handleSnackbarClose}
            autoHideDuration={4000}
            ContentProps={{
                'aria-describedby': 'message-id',
            }}
            message={<span id="message-id">{this.state.snackbarMessage}</span>}
        />
      </div>
    );
  }
}
