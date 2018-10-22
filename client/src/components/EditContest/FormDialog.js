import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Snackbar from '@material-ui/core/Snackbar';

import EditIcon from '@material-ui/icons/Edit';

import EditContest from './EditContest';

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
      <span style={{margin: '0.5% 0.5%'}}>
        <Button variant="fab" mini color="primary" aria-label="Edit Contest" onClick={this.handleClickOpen}>
            <EditIcon/>
        </Button>
        <Dialog
          open={this.state.open}
          onClose={() => this.handleClose(false, "")}
          aria-labelledby="form-dialog-title"
        >
            <center>
                <DialogTitle id="form-dialog-title">Edit Contest</DialogTitle>
                <DialogContent>
                <EditContest
                    contestID={this.props.contestID}
                    contestName={this.props.contestName}
                    description= {this.props.description}
                    startDate= {this.props.startDate}
                    endDate= {this.props.endDate}
                    status={this.props.status}
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
