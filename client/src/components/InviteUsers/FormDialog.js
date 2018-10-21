import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Snackbar from '@material-ui/core/Snackbar';

import AddIcon from '@material-ui/icons/Add';

import InviteUsers from './InviteUsers';

export default class FormDialog extends React.Component {
  state = {
    open: false,
    openSnackbar: false,
    snackbarMessage: '',
  };

  componentWillMount() {
    this.setState({
        contestID: this.props.contestID,
    });
}

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
      <span style={{margin: '0.5% 0.5%'}}>
        <Button variant="fab" mini color="primary" aria-label="Edit Contest" onClick={this.handleClickOpen}>
            <AddIcon/>
        </Button>
        <Dialog
          open={this.state.open}
          onClose={() => this.handleClose(false, "")}
          aria-labelledby="form-dialog-title"
        >
            <center>
                <DialogTitle id="form-dialog-title">Invite Users</DialogTitle>
                <DialogContent>
                <InviteUsers
                    contestID={this.props.contestID}
                    handleClose={this.handleClose} />
                </DialogContent>
            </center>
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
      </span>
    );
  }
}
