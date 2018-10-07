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
    { id: 'standing', numeric: true, disablePadding: true, label: 'Rank' },
    { id: 'username', numeric: false, disablePadding: false, label: 'Username' },
    { id: 'country_name', numeric: false, disablePadding: false, label: 'Country' },
    { id: 'score', numeric: true, disablePadding: false, label: 'Score' },
];

class StandingsTab extends Component {
    state = {
        order: 'asc',
        orderBy: 'standing',
        data: [],
        page: 0,
        rowsPerPage: 10,
    };

    componentDidMount(){
        axios.post('http://127.0.0.1:5000/GetContestStandings', {
            contest_id: this.props.contest_id
        }).then(response => {
            if (response.data.status == 200){
                this.setState({ data: response.data.standingsList });
            }
        });
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
        /*
        const problemCant = this.props.problemList.length;
        let newRows = rows.splice();
        for (let i=0; i < problemCant; i++) {
            newRows.push({ id: 'P' + i, numeric: true, disablePadding: false, label: 'P' + i});
            console.log(i);
        }
        console.log("Wowser");*/

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
                                .map(n => {
                                    return (
                                        <TableRow
                                            hover
                                            tabIndex={-1}
                                            key={n.userID}
                                        >
                                            <TableCell component="th" scope="row" padding="none" numeric={rows[0].numeric}>
                                                {n.standing}
                                            </TableCell>
                                            <TableCell numeric={rows[1].numeric}>{n.username}</TableCell>
                                            <TableCell numeric={rows[2].numeric}>
                                                {n.country_name? n.country_name : 'N/A'}
                                            </TableCell>
                                            <TableCell numeric={rows[3].numeric}>{n.score}</TableCell>
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

StandingsTab.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(StandingsTab);