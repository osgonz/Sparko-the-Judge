import React, { Component } from 'react';

import PropTypes from 'prop-types';

import TableHead from "@material-ui/core/TableHead/TableHead";
import TableRow from "@material-ui/core/TableRow/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import TableSortLabel from "@material-ui/core/TableSortLabel/TableSortLabel";

import '../../style/style.css';

function desc(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function descDate(a, b, orderBy) {
    let dateA = new Date(a[orderBy]);
    let dateB = new Date(b[orderBy]);

    if (dateB < dateA) {
        return -1;
    }
    if (dateB > dateA) {
        return 1;
    }
    return 0;
}

export function getSorting(order, orderBy, date) {
    if (date)
        return order === 'desc' ? (a, b) => descDate(a, b, orderBy) : (a, b) => -descDate(a, b, orderBy);
    return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

export function stableSort(array, cmp) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = cmp(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map(el => el[0]);
}

class ContestTabHeader extends Component {
    createSortHandler = (property, date) => event => {
        this.props.onRequestSort(event, property, date);
    };

    render() {
        const {order, orderBy, rows } = this.props;

        return (
            <TableHead>
                <TableRow>
                    {rows.map(row => {
                        return (
                            <TableCell
                                key={row.id}
                                numeric={row.numeric}
                                padding={row.disablePadding ? 'none' : 'default'}
                                sortDirection={orderBy === row.id ? order : false}
                            >
                                <Tooltip
                                    title="Sort"
                                    placement={row.numeric ? 'bottom-end' : 'bottom-start'}
                                    enterDelay={300}
                                >
                                    <TableSortLabel
                                        active={orderBy === row.id}
                                        direction={order}
                                        onClick={this.createSortHandler(row.id, row.date)}
                                    >
                                        {row.label}
                                    </TableSortLabel>
                                </Tooltip>
                            </TableCell>
                        );
                    }, this)}
                </TableRow>
            </TableHead>
        );
    }
}

ContestTabHeader.propTypes = {
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string.isRequired,
};

export default ContestTabHeader;