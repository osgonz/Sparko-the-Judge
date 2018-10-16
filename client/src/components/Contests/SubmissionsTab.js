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
    { id: 'username', numeric: false, disablePadding: false, label: 'Username', date: false },
    { id: 'problemName', numeric: false, disablePadding: false, label: 'Problem Name', date: false },
    { id: 'judge', numeric: false, disablePadding: false, label: 'Judge', date: false },
    { id: 'result', numeric: false, disablePadding: false, label: 'Result', date: false },
    { id: 'language', numeric: false, disablePadding: false, label: 'Language', date: false },
    { id: 'submissionTime', numeric: false, disablePadding: false, label: 'Submission Time', date: true },
];

class SubmissionsTab extends Component {
    state = {
        order: 'desc',
        orderBy: 'submissionTime',
        date: true,
        page: 0,
        rowsPerPage: 10,
    };

    handleRequestSort = (event, property, date) => {
        const orderBy = property;
        let order = 'desc';

        if (this.state.orderBy === property && this.state.order === 'desc') {
            order = 'asc';
        }

        this.setState({ order, orderBy, date });
    };

    handleChangePage = (event, page) => {
        this.setState({ page });
    };

    handleChangeRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value });
    };

    handleResultCode = code => {
        switch(code) {
            case 10:
                return 'Submission error';
            case 15:
                return "Can't be judged";
            case 20:
                return 'In queue';
            case 30:
                return 'Compile error';
            case 35:
                return 'Restricted function';
            case 40:
                return 'Runtime error';
            case 45:
                return 'Output limit';
            case 50:
                return 'Time limit';
            case 60:
                return 'Memory limit';
            case 70:
                return 'Wrong answer';
            case 80:
                return 'PresentationE';
            case 90:
                return 'Accepted';
        }
    }

    render() {
        const { classes, data } = this.props;
        const { order, orderBy, date, rowsPerPage, page } = this.state;
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
                            {stableSort(data, getSorting(order, orderBy, date))
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((n, index) => {
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
                                            <TableCell numeric={rows[1].numeric}>{this.props.handleJudgeCode(n.judge)}</TableCell>
                                            <TableCell numeric={rows[1].numeric}>{this.handleResultCode(n.result)}</TableCell>
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