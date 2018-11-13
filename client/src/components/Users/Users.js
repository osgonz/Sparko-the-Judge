/*******************************************************************************/
/*                                E X P O R T S                                */
/*******************************************************************************/
/*--------------------------------- R E A C T ---------------------------------*/
import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import axios from 'axios'
import ReactDOM from 'react-dom'

import AlertDialog from '../AlertDialog/AlertDialog';
import CompareDialog from '../AlertDialog/CompareDialog';

/*--------------------------- M A T E R I A L   U I ---------------------------*/
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import LockIcon from '@material-ui/icons/Lock';
import FilterListIcon from '@material-ui/icons/FilterList';
import { lighten } from '@material-ui/core/styles/colorManipulator';

import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import FaceIcon from '@material-ui/icons/Face';
import BanIcon from '@material-ui/icons/Gavel';
import AdminIcon from '@material-ui/icons/Pets';
import AdminIcon2 from '@material-ui/icons/StarRate';
import CompareIcon from '@material-ui/icons/SupervisedUserCircle';
/*******************************************************************************/

function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
  return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

const rows = [
  { id: 'username', numeric: false, disablePadding: true, label: 'Username' },
  { id: 'userType', numeric: false, disablePadding: false, label: 'User Type' },
  { id: 'fullName', numeric: false, disablePadding: false, label: 'Name' },
  { id: 'uvaUsername', numeric: false, disablePadding: false, label: 'UVa' },
  { id: 'icpcUsername', numeric: false, disablePadding: false, label: 'ICPC' },
];



/*******************************************************************************/
/*                                                                             */
/*                           T A B L E   H E A D E R                           */
/*                                                                             */
/*******************************************************************************/
class UsersTableHead extends Component {
 createSortHandler = property => event => {
    this.props.onRequestSort(event, property);
  };



  render() {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount } = this.props;

    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            {
                //this.props.isAdmin &&
                true && 
                <Checkbox
                  indeterminate={numSelected > 0 && numSelected < rowCount}
                  checked={numSelected === rowCount}
                  onChange={onSelectAllClick}
                />
            }
          </TableCell>
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
                    onClick={this.createSortHandler(row.id)}
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

UsersTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
  isAdmin: PropTypes.bool.isRequired,
};

const toolbarStyles = theme => ({
  root: {
    paddingRight: theme.spacing.unit,
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  spacer: {
    flex: '1 1 100%',
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  title: {
    flex: '0 0 auto',
  },
});

var EnhancedTableToolbar = props => {
  const { numSelected, classes } = props;

    function dialogBanUser(event, usersBanned) {

      const dialog = (
          <AlertDialog 
            open={true}
            title="Ban users" 
            description="You are about to ban these users. Are you sure you want to proceed?"
            btnAcceptTitle="Accept"
            btnCancelTitle="Cancel"
            acceptFunc={ () => {
                handleBanUser(usersBanned)
              }
            }/>
        );

        ReactDOM.render(dialog, document.getElementById('myDialog'));
    }

    function dialogUnbanUser(event, usersUnbanned) {

      const dialog = (
          <AlertDialog 
            open={true}
            title="Unban users" 
            description="You are about to unban these users. Are you sure you want to proceed?"
            btnAcceptTitle="Accept"
            btnCancelTitle="Cancel"
            acceptFunc={ () => {
                handleUnbanUser(usersUnbanned)
              }
            }/>
        );

        ReactDOM.render(dialog, document.getElementById('myDialog'));
    }

    function dialogCompareUsers(event, usersCompared) {
      
        axios.post('http://127.0.0.1:5000/FindFastestSolution', {
          usernames: usersCompared,
          contestID: 2
        }, {withCredentials: true})
        .then(response => {
            console.log(response)
            if (response.data.status == 200) {
              ejemploDeContests: response.data.contests
          }
        })      

      const ejemploDeContests = [{
                                  id: 2,
                                  name: "Hello There"
                                  },
                                  {
                                  id: 7,
                                  name: "Super Hard Contest"
                                  },
                                  {
                                  id: 19,
                                  name: "2 Easy 4 U contest"
                                  },
                                ];
      
      const dialog = (
          <CompareDialog 
            open={true}
            title="Comparing Users" 
            description="Select a contest to compare the selected users"
            contestList={ejemploDeContests}
            btnAcceptTitle="Compare"
            btnCancelTitle="Cancel"
            acceptFunc={ () => {
                handleCompareUsers(usersCompared)
              }
            }/>
        );

        ReactDOM.render(dialog, document.getElementById('myDialog'));
    }

    function handleBanUser(usersBanned) {
        console.log("BANNED!")
        axios.post('http://127.0.0.1:5000/BanUsers', {
          usernames: usersBanned
        }, {withCredentials: true})
        .then(response => {
            window.location.reload();
        })        
    }

    function handleUnbanUser(usersUnbanned) {
        console.log(usersUnbanned);
        axios.post('http://127.0.0.1:5000/UnbanUsers', {
          usernames: usersUnbanned
        }, {withCredentials: true})
        .then(response => {
            console.log("You just unbanned ", usersUnbanned);
            window.location.reload();
        })
    }

    function handleCompareUsers(usersCompared) {
        console.log("COMPARE!")
        console.log(usersCompared);
    }


  return (

    <Toolbar
      className={classNames(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      <div className={classes.title}>
        {numSelected > 0 ? (
          <Typography color="inherit" variant="subheading">
            {numSelected} selected
          </Typography>
        ) : (
          <Typography variant="title" id="tableTitle">
            User List
          </Typography>
        )}
      </div>
      <div className={classes.spacer} />
      <div className={classes.actions}>
        {numSelected > 0 ? (
          <div style={{display: "flex"}}>
            
            { props.isAdmin &&
              <Tooltip title="Ban Users">
                <IconButton aria-label="Ban" onClick={event => dialogBanUser(event, props.usersSelected)}>
                  <LockIcon />
                </IconButton>
              </Tooltip>
            }

            <div id="myDialog"></div>           

            { props.isAdmin &&
              <Tooltip title="Unban Users">
                <IconButton aria-label="Unban" onClick={event => dialogUnbanUser(event, props.usersSelected)}>
                  <LockOpenIcon />
                </IconButton>
              </Tooltip>
            }

            <Tooltip title="Compare User Stats">
              <IconButton aria-label="Compare" onClick={event => dialogCompareUsers(event, props.usersSelected)}>
                <CompareIcon/>
              </IconButton>
            </Tooltip>

          </div>
        ) : (
          <Tooltip title="Filter list">
            <IconButton aria-label="Filter list">
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  usersSelected: PropTypes.array.isRequired,
  openDialog: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired
};

EnhancedTableToolbar = withStyles(toolbarStyles)(EnhancedTableToolbar);

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

/*******************************************************************************/
/*                                                                             */
/*                         T A B L E   C O N T E N T S                         */
/*                                                                             */
/*******************************************************************************/
class Users extends Component {

  constructor(props) {
      super(props)
      this.state = {
        order: 'asc',
        orderBy: 'fullName',
        selected: [],
        data: [],
        page: 0,
        rowsPerPage: 10,
      }
  }

    componentDidMount(){
      var username = ''
        axios.get('http://127.0.0.1:5000/GetActiveSession', {withCredentials: true})
        .then(response => {
          if (response.data.username != 'Session not found'){
            username = response.data
          }
        })
        .then(response => {
          if(this.props.isAdmin) {
              axios.post('http://127.0.0.1:5000/GetUserList', {usertype: '0'}, {withCredentials: true})
              .then(response => {
                console.log(response)
                  if (response.data.status == 'SUCCESS'){
                      this.setState({ data: response.data.userList });
                  }
              })
          }
          else {
              axios.post('http://127.0.0.1:5000/GetUserList', {usertype: '1'}, {withCredentials: true})
              .then(response => {
                console.log(response)
                  if (response.data.status == 'SUCCESS'){
                      this.setState({ data: response.data.userList });
                  }
              })
          }
        })
    }

  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    this.setState({ order, orderBy });
  };

  handleSelectAllClick = event => {
    if (event.target.checked) {
      this.setState(state => ({ selected: state.data.map(n => n.id) }));
      return;
    }
    this.setState({ selected: [] });
  };

  handleClick = (event, id) => {
    const { selected } = this.state;
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    this.setState({ selected: newSelected });
  };



  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  isSelected = id => this.state.selected.indexOf(id) !== -1;

  handleUserType = (userType) => {
    switch(userType){
        case 0:
            return(
                <Chip style={{cursor: 'pointer'}} label="Administrator" color="primary" avatar={<Avatar><AdminIcon /></Avatar>} />
            );

        case 1:
            return(
                <Chip style={{cursor: 'pointer'}} label="Regular User" avatar={<Avatar><FaceIcon /></Avatar>} />
            );

        case 2:
            return(
                <Chip style={{cursor: 'pointer'}} label="Banned User" color="secondary" avatar={<Avatar><BanIcon /></Avatar>} />
            );
    }
  }

  getTableRowTitle = (isAdmin, username) => {
    if (isAdmin)
      return ""
    else
      return "Compare with " + username
  }

  render() {
    const { classes } = this.props;
    const { data, order, orderBy, selected, rowsPerPage, page } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

    return (
      <Paper className={classes.root}>
        <EnhancedTableToolbar numSelected={selected.length} usersSelected={selected} openDialog={true} isAdmin={this.props.isAdmin} />
        <div className={classes.tableWrapper}>
          <Table className={classes.table} aria-labelledby="tableTitle">
            <UsersTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={this.handleSelectAllClick}
              onRequestSort={this.handleRequestSort}
              rowCount={data.length}
              isAdmin={this.props.isAdmin}
            />
            <TableBody>
              {stableSort(data, getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(n => {
                  const isSelected = this.isSelected(n.id);
                  return (
                    <TableRow
                      hover
                      onClick={event => {
                          if(true) {
                          //if (this.props.isAdmin){
                            this.handleClick(event, n.id)
                          }
                          else{
                            console.log("Comparing with " + n.username)
                          }
                        }
                      }
                      role="checkbox"
                      aria-checked={isSelected}
                      tabIndex={-1}
                      key={n.id}
                      selected={isSelected}
                      style={{cursor: 'pointer'}}
                      title={this.getTableRowTitle(this.props.isAdmin, n.username)}
                    >
                      <TableCell padding="checkbox">
                      { true &&
                        //this.props.isAdmin &&
                              <Checkbox checked={isSelected} />
                      }
                      </TableCell>

                      <TableCell component="th" scope="row" padding="none">
                        {n.username}
                      </TableCell>
                      <TableCell numeric={rows[1].numeric}>{this.handleUserType(n.userType)}</TableCell>
                      <TableCell numeric={rows[2].numeric}>{n.fullName}</TableCell>
                      <TableCell numeric={rows[3].numeric}>{n.uvaUsername}</TableCell>
                      <TableCell numeric={rows[4].numeric}>{n.icpcUsername}</TableCell>
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

Users.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Users);