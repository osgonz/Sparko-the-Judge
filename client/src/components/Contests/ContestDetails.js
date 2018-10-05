import React, { Component } from 'react';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import '../../style/style.css';

const styles = {
    root: {
        flexGrow: 1,
    },
};

function TabContainer(props) {
    return (
        <Typography component="div" style={{ padding: 8 * 3 }}>
            {props.children}
        </Typography>
    );
}

class ContestDetails extends Component {
    state = {
        tabValue: 0,
    };

    handleChange = (event, value) => {
        this.setState({
            tabValue: value
        });
    };

    render()
    {
        const { classes } = this.props;

        return (
            <div>
                <div className="contest-header">
                    <h1 className="contest-title">Mi primer concurso</h1>
                    {!this.props.isAdmin &&
                    <Button variant="fab" mini color="primary" aria-label="Edit" style={{margin: '0.5% 0.5%'}}>
                        <EditIcon/>
                    </Button>
                    }
                    {!this.props.isAdmin &&
                    <Button variant="fab" mini color="primary" aria-label="Delete" style={{margin:'0.5% 0.5%'}}>
                        <DeleteIcon />
                    </Button>
                    }
                </div>
                <Paper className={classes.root}>
                    <Tabs
                        value={this.state.tabValue}
                        onChange={this.handleChange}
                        indicatorColor="primary"
                        textColor="primary"
                        centered
                    >
                        <Tab label="Standings" />
                        <Tab label="Problem List" />
                        <Tab label="Submissions" />
                    </Tabs>
                    {this.state.tabValue === 0 && <TabContainer>Item One</TabContainer>}
                    {this.state.tabValue === 1 && <TabContainer>Item Two</TabContainer>}
                    {this.state.tabValue === 2 && <TabContainer>Item Three</TabContainer>}
                </Paper>
            </div>
        );
    }
}

export default withStyles(styles)(ContestDetails);