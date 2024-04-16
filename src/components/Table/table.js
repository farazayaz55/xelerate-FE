import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import noData from "./../../assets/img/no-data.png";
import { Fragment } from "react";

// var useStyles = makeStyles(styles);

export default function (props) {
  // const classes = useStyles();

  const [page, setPage] = useState(0);
  const searchTriggered=React.useRef({
    state:false,//displaying search results?
    numberOfDocuments:0,// number of rows returned by search
    searchPage:0// to store old page where search was triggered
  })
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

  function stableSort(array, comparator) {
    console.log(array)
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
              items.filter((x) => {
                console.log(x[elm]?.toLowerCase().includes(target))
                return x[elm]?.toLowerCase().includes(target)})
            );
          });
          searchTriggered.current.numberOfDocuments=itemGenerator(temp).length
          return itemGenerator(temp);
        }
      },
    });
    if(target!=""){
      searchTriggered.current.searchPage=page
      searchTriggered.current.state=true
      setPage(0)
    }
    else{
      setPage(searchTriggered.current.searchPage)
      searchTriggered.current.state=false
    }
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
          <TableContainer
            style={{ minHeight: props.minHeight, maxHeight: props.minHeight }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {props.columns.map((column) => {
                    return (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        style={{
                          minWidth: column.minWidth,
                          backgroundColor: "#e2e2e2",
                        }}
                        sortDirection={orderBy === column.id ? order : false}
                      >
                        {column.disableSorting ? (
                          column.label
                        ) : (
                          <TableSortLabel
                            active={orderBy === column.id}
                            direction={orderBy === column.id ? order : "asc"}
                            onClick={() => {
                              handleSortRequest(column.id);
                            }}
                          >
                            {column.label}
                          </TableSortLabel>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {stableSort(
                  filterFn.fn(props.rows),
                  getComparator(order, orderBy)
                )
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => {
                    return (
                      <TableRow hover role="checkbox" tabIndex={-1}>
                        {props.columns.map((column) => {
                          const value = row[column.id];
                          if (column.id == "html") {
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {props.html(row)}
                              </TableCell>
                            );
                          } else if (column.id == "html2") {
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {props.html2(row)}
                              </TableCell>
                            );
                          } else if (column.id == "html3") {
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {props.html3(row)}
                              </TableCell>
                            );
                          } else {
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {column.format && typeof value === "number"
                                  ? column.format(value)
                                  : value}
                              </TableCell>
                            );
                          }
                        })}
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          {props.pagination != "off" ? (
            <div style={{ direction: "ltr" }}>
              <TablePagination
                style={{ position: "relative", right: "50px" }}
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={searchTriggered.current.state?searchTriggered.current.numberOfDocuments  :props.rows.length}
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