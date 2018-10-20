import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Snackbar from '@material-ui/core/Snackbar';

import AddIcon from '@material-ui/icons/Add';

export default class FormDialog extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      open: false,
      openSnackbar: false,
      snackbarMessage: '',
      component: null
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({component: React.cloneElement(nextProps.component, {handleClose: this.handleClose})})
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
      <span>
        <Button variant="fab" mini color="primary" aria-label={this.props.modalTitle} style={{margin: '0.5% 0.5%'}} onClick={this.handleClickOpen}>
            <AddIcon/>
        </Button>
        <Dialog
          open={this.state.open}
          onClose={() => this.handleClose(false, "")}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">{this.props.modalTitle}</DialogTitle>
          <DialogContent>
          {this.state.component}
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
      </span>
    );
  }
}
