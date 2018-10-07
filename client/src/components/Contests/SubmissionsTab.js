import React, { Component } from 'react';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import Table from "@material-ui/core/Table/Table";
import TableBody from "@material-ui/core/TableBody/TableBody";
import TableCell from "@material-ui/core/TableCell/TableCell";
import TablePagination from "@material-ui/core/TablePagination/TablePagination";
import TableRow from "@material-ui/core/TableRow/TableRow";

import '../../style/style.css';
import axios from 'axios'

import ContestTabHeader, {getSorting, stableSort} from './ContestTabHeader';

const styles = theme => ({
    root: {
        width: '100%',
        marginTop: theme.spacing.unit * 3,
    },
    table: {
        minWidth: 1020,
    },
    tableWrapper: {
        overflowX: 'auto',
    },
});

let rows = [
    { id: 'username', numeric: false, disablePadding: false, label: 'Username' },
    { id: 'problemName', numeric: false, disablePadding: false, label: 'Problem Name' },
    { id: 'judge', numeric: false, disablePadding: false, label: 'Judge' },
    { id: 'result', numeric: false, disablePadding: false, label: 'Result' },
    { id: 'language', numeric: false, disablePadding: false, label: 'Language' },
    { id: 'submissionTime', numeric: false, disablePadding: false, label: 'Submission Time' },
];

class SubmissionsTab extends Component {
    state = {
        order: 'desc',
        orderBy: 'submissionTime',
        data: [],
        page: 0,
        rowsPerPage: 10,
    };

    componentDidMount(){
        if (this.props.isAdmin || this.props.isOwner) {
            axios.post('http://127.0.0.1:5000/GetSubmissionsInContest', {
                contest_id: this.props.contest_id
            }).then(response => {
                if (response.data.status == 200){
                    this.setState({ data: response.data.submissionsList });
                }
            });
        } else {
            axios.post('http://127.0.0.1:5000/GetUserSubmissionsInContest', {
                contest_id: this.props.contest_id
            }, {withCredentials: true}).then(response => {
                if (response.data.status == 200){
                    this.setState({ data: response.data.userSubmissionsList });
                }
            });
        }
    };

    handleRequestSort = (event, property) => {
        const orderBy = property;
        let order = 'desc';

        if (this.state.orderBy === property && this.state.order === 'desc') {
            order = 'asc';
        }

        this.setState({ order, orderBy });
    };

    handleChangePage = (event, page) => {
        this.setState({ page });
    };

    handleChangeRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value });
    };

    render() {
        const { classes } = this.props;
        const { data, order, orderBy, rowsPerPage, page } = this.state;
        const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

        return (
            <Paper className={classes.root}>
                <div className={classes.tableWrapper}>
                    <Table className={classes.table} aria-labelledby="tableTitle">
                        <ContestTabHeader
                            order={order}
                            orderBy={orderBy}
                            rows={rows}
                            onRequestSort={this.handleRequestSort}
                        />
                        <TableBody>
                            {stableSort(data, getSorting(order, orderBy))
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((n, index) => {
                                    let result = '';
                                    switch(n.result) {
                                        case 10:
                                            result = 'Submission error';
                                            break;
                                        case 15:
                                            result = "Can't be judged";
                                            break;
                                        case 20:
                                            result = 'In queue';
                                            break;
                                        case 30:
                                            result = 'Compile error';
                                            break;
                                        case 35:
                                            result = 'Restricted function';
                                            break;
                                        case 40:
                                            result = 'Runtime error';
                                            break;
                                        case 45:
                                            result = 'Output limit';
                                            break;
                                        case 50:
                                            result = 'Time limit';
                                            break;
                                        case 60:
                                            result = 'Memory limit';
                                            break;
                                        case 70:
                                            result = 'Wrong answer';
                                            break;
                                        case 80:
                                            result = 'PresentationE';
                                            break;
                                        case 90:
                                            result = 'Accepted';
                                            break;
                                    }

                                    return (
                                        <TableRow
                                            hover
                                            tabIndex={-1}
                                            key={index + 1}
                                        >
                                            <TableCell component="th" scope="row" numeric={rows[0].numeric}>
                                                {n.username}
                                            </TableCell>
                                            <TableCell numeric={rows[1].numeric}><a href={n.url} target="_blank">{n.problemName}</a></TableCell>
                                            <TableCell numeric={rows[1].numeric}>{n.judge}</TableCell>
                                            <TableCell numeric={rows[1].numeric}>
                                                {result}
                                            </TableCell>
                                            <TableCell numeric={rows[1].numeric}>{n.language}</TableCell>
                                            <TableCell numeric={rows[1].numeric}>{n.submissionTime}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            {emptyRows > 0 && (
                                <TableRow style={{ height: 49 * emptyRows }}>
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <TablePagination
                    component="div"
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    backIconButtonProps={{
                        'aria-label': 'Previous Page',
                    }}
                    nextIconButtonProps={{
                        'aria-label': 'Next Page',
                    }}
                    onChangePage={this.handleChangePage}
                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                />
            </Paper>
        );
    }
}

SubmissionsTab.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SubmissionsTab);