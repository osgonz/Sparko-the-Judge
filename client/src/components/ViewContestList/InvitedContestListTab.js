import React, { Component } from "react";
import PropTypes from 'prop-types';

import Error404 from '../Error404/Error404';

import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

import Table from "@material-ui/core/Table/Table";
import TableBody from "@material-ui/core/TableBody/TableBody";
import TableHead from "@material-ui/core/TableHead/TableHead";
import TableRow from "@material-ui/core/TableRow/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import TableSortLabel from "@material-ui/core/TableSortLabel/TableSortLabel";
import TablePagination from "@material-ui/core/TablePagination/TablePagination";

import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import axios from 'axios'
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
    { id: 'contestName', numeric: false, disablePadding: false, label: 'Name' },
    { id: 'description', numeric: false, disablePadding: false, label: 'Description' },
    { id: 'startDate', numeric: false, disablePadding: false, label: 'Start Date' },
    { id: 'endDate', numeric: false, disablePadding: false, label: 'End Date' },
	{ id: 'contestStatus', numeric: false, disablePadding: false, label: 'Status' }
];

class InvitedContestListTab extends Component {
    constructor(props) {
        super(props)
        this.state = {
            username: '',
            userId: 0,
			order: 'asc',
			orderBy: 'local_id',
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
  
  handleRequestSort = (event, property) => {
        const orderBy = property;
        let order = 'desc';
         if (this.state.orderBy === property && this.state.order === 'desc') {
            order = 'asc';
        }
         this.setState({ order, orderBy });
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
        const {  username, userId, rowsPerPage, page, order, orderBy} = this.state;
		const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);
		return (
			<Paper>
				<div>
					<Table aria-labelledby="tableTitle">
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
                                    return (
                                        <TableRow
                                            hover
                                            tabIndex={-1}
                                            key={index + 1}
                                        >
                                            <TableCell component="th" scope="row" numeric={rows[0].numeric}>
                                                {n[0]}
                                            </TableCell>
                                            <TableCell numeric={rows[1].numeric}>{n[1]}</TableCell>
                                            <TableCell numeric={rows[2].numeric}>{n[2]}</TableCell>
                                            <TableCell numeric={rows[3].numeric}>{n[3]}</TableCell>
											<TableCell numeric={rows[4].numeric}>{ this.handleStatusCode(n[4])}</TableCell>
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

export default withStyles(styles)(InvitedContestListTab);