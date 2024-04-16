import React, { useState } from "react";
// import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import {
  TableContainer,
  TableHead,
  Table,
  TableRow,
  TableCell,
  TablePagination,
  TableBody,
  TableSortLabel,
  InputAdornment,
  TextField,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HandymanIcon from "@mui/icons-material/Handyman";
import noData from "./../../assets/img/no-data.png";
import { Fragment } from "react";
import Item from "./Item";

// var useStyles = makeStyles(styles);

export default function (props) {
  // const classes = useStyles();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [order, setOrder] = useState();
  const [orderBy, setOrderBy] = useState("");
  const [filterFn, setFilterFn] = useState({
    fn: (items) => {
      return items;
    },
  });

  if (page > Math.trunc((props.rows.length - 1) / rowsPerPage))
    setPage(page - 1);

  const handleSortRequest = (cellId) => {
    const isAsc = orderBy === cellId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(cellId);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const generateOperations = (row) => {
    let operations = [];
    if (row.parameter && row.multipleOperations.length == 0) {
      operations.push({
        parameter: row.parameter,
        operation: row.operation,
        condition: row.condition,
        rollingFlag: row.rollingFlag,
        rollingAvg: row.rollingAvg,
        range: row.range,
        rollingTimeDuration: row.rollingTimeDuration,
      });
    } else if (row.parameter && row.multipleOperations.length > 0) {
      if (
        row.parameter == row.multipleOperations[0].parameter &&
        row.operation == row.multipleOperations[0].operation &&
        row.condition == row.multipleOperations[0].condition &&
        row.rollingFlag == row.multipleOperations[0].rollingFlag &&
        row.rollingAvg == row.multipleOperations[0].rollingAvg &&
        row.range == row.multipleOperations[0].range
      ) {
        operations = row.multipleOperations;
      } else {
        operations.push({
          parameter: row.parameter,
          operation: row.operation,
          condition: row.condition,
          rollingFlag: row.rollingFlag,
          rollingAvg: row.rollingAvg,
          range: row.range,
          rollingTimeDuration: row.rollingTimeDuration,
        });
      }
    } else {
      operations = row.multipleOperations;
    }
    return operations;
  };

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  function getComparator(order, orderBy) {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  function arrayUnique(array) {
    var a = array.concat();
    for (var i = 0; i < a.length; ++i) {
      for (var j = i + 1; j < a.length; ++j) {
        if (a[i] === a[j]) a.splice(j--, 1);
      }
    }
    return a;
  }

  function itemGenerator(array, x = 0, temp = [], end = false) {
    var a = array.concat();
    if (a.length == 1) return a[0];
    for (var i = 1; i < a.length; ++i) {
      if (end) {
        temp = arrayUnique(temp.concat(a[x]));
        i = a.length;
      } else {
        temp = arrayUnique(temp.concat(arrayUnique(a[x].concat(a[x + 1]))));
      }
      x += 2;
      if (x >= a.length - 1) {
        if (a.length % 2 == 0) {
          i = a.length;
        } else {
          end = true;
        }
      }
    }
    return temp;
  }

  const handleSearch = (e) => {
    let target = e.target.value.toLowerCase();
    setFilterFn({
      fn: (items) => {
        if (target == "") return items;
        else {
          var temp = [];
          props.filter.forEach((elm) => {
            temp.push(
              items.filter((x) => x[elm]?.toLowerCase().includes(target))
            );
          });
          return itemGenerator(temp);
        }
      },
    });
  };

  return (
    <div>
      {props.rows.length == 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "200px",
              width: "200px",
            }}
          >
            <img style={{ maxWidth: "70%", maxHeight: "70%" }} src={noData} />
          </div>
          <p style={{ color: "#c8c8c8" }}>No data found</p>
        </div>
      ) : (
        <Fragment>
          {props.search != "off" ? (
            <TextField
              variant="outlined"
              fullWidth
              size="small"
              label="Search"
              onChange={handleSearch}
              style={{ marginBottom: "10px" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon style={{ color: "grey" }} />
                  </InputAdornment>
                ),
              }}
            />
          ) : null}
          <div
            style={{
              minHeight: props.minHeight,
              maxHeight: props.minHeight,
              overflowY: "scroll",
              marginTop: "5px",
              display: "flex",
              flexWrap: "wrap",
              alignContent: "flex-start",
            }}
          >
            <Grid container spacing={2}>
              {stableSort(
                filterFn.fn(props.rows),
                getComparator(order, orderBy)
              )
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, i) => {
                  return (
                    // <div
                    //   style={{
                    //     height: "100%",
                    //     width: "100%",
                    //     paddingLeft: "15px",
                    //   }}
                    //   hover
                    //   role="checkbox"
                    //   tabIndex={-1}
                    //   key={i}
                    // >
                      <Grid item xs={12} sm={6} md={4} key={i}>
                        <Item
                          style={{ padding: "0px" }}
                          row={row}
                          operations={generateOperations(row)}
                          toggleDelete={props.toggleDelete}
                          fields={props.fields}
                          serviceId={props.serviceId}
                          id={props.id}
                          permission={props.permission}
                          rules={props.rules}
                        />
                      </Grid>
                    // </div>
                  );
                })}
            </Grid>
          </div>
          {props.pagination != "off" ? (
            <div style={{ direction: "ltr" }}>
              <TablePagination
                style={{ position: "relative", right: "50px" }}
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={props.rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </div>
          ) : null}
        </Fragment>
      )}
    </div>
  );
}
