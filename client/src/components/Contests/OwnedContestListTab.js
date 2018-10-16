import React, { Component } from "react";
import {withRouter} from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';

import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';

import Table from "@material-ui/core/Table/Table";
import TableBody from "@material-ui/core/TableBody/TableBody";
import TableRow from "@material-ui/core/TableRow/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import TablePagination from "@material-ui/core/TablePagination/TablePagination";

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
    { id: 'contestName', numeric: false, disablePadding: false, label: 'Name', date: false },
    { id: 'description', numeric: false, disablePadding: false, label: 'Description', date: false },
    { id: 'startDate', numeric: false, disablePadding: false, label: 'Start Date', date: true },
    { id: 'endDate', numeric: false, disablePadding: false, label: 'End Date', date: true },
	{ id: 'contestStatus', numeric: false, disablePadding: false, label: 'Status', date: false }
];

class OwnedContestListTab extends Component {
    constructor(props) {
        super(props)
        this.state = {
            username: '',
            userId: 0,
			order: 'desc',
			orderBy: 'endDate',
            date: true,
			data: [],
			page: 0,
			rowsPerPage: 10
        }

    }
	
	handleChangePage = (event, page) => {
		this.setState({ page });
	};
	 handleChangeRowsPerPage = event => {
		this.setState({ rowsPerPage: event.target.value });
	};
  
	handleRequestSort = (event, property, date) => {
        const orderBy = property;
        let order = 'desc';
         if (this.state.orderBy === property && this.state.order === 'desc') {
            order = 'asc';
        }
         this.setState({ order, orderBy, date });
    };
	
	handleStatusCode = status => {
        switch(status) {
            case 0:
                return (
                    <Chip label="Upcoming" color="secondary" />
                );
            case 1:
                return (
                    <Chip label="Ongoing" color="primary" />
                );
            case 2:
                return (
                    <Chip label="Finished" />
                );
        }
    }

    render() {
        const { classes, data } = this.props;
        const {rowsPerPage, page, order, orderBy, date} = this.state;
		const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);
		return (
			<Paper>
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
                                                    <a href={"/contests/"+ n.contestID}>{n.contestName}</a>
                                                </TableCell>
                                                <TableCell numeric={rows[1].numeric}>{n.description}</TableCell>
                                                <TableCell numeric={rows[2].numeric}>{n.startDate}</TableCell>
                                                <TableCell numeric={rows[3].numeric}>{n.endDate}</TableCell>
                                                <TableCell numeric={rows[4].numeric}>{ this.handleStatusCode(n.status)}</TableCell>
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

export default withRouter(withStyles(styles)(OwnedContestListTab));