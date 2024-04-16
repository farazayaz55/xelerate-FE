import React, { memo, useCallback, useEffect, useState } from "react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import InfoIcon from "@mui/icons-material/Info";
import PowerIcon from "@mui/icons-material/Power";
import SearchIcon from "@mui/icons-material/Search";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import {
  Checkbox,
  Collapse,
  Divider,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import Pagination from "@mui/material/Pagination";
import DriverScore from "Utilities/DriverScorePopup";
import { Fragment } from "react";
import { useSelector } from "react-redux";
import noData from "./../../assets/img/no-data.png";

import PropTypes from "prop-types";
import dayjs from "dayjs";

const EnhancedTableHead=React.memo((props) =>{
  const { order, orderBy, onRequestSort, parentProp,checkForColumns } = props;


  useEffect(()=>{
    console.log("mountENHANCE")
  return ()=>{
    console.log("unmountENHANCE")
  }}
  ,[])
  const Text = ({ content }) => {
    return (
      <p
        style={{
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          overflow: "hidden",
          fontWeight: "600",
          color: "#B3B4B6",
          textTransform: "capitalize",
        }}
      >
        {content}
      </p>
    );
  };

  /**
   * Passes the onclick request to OnRequest sort function received by prop
   */
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {parentProp.columns.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            sortDirection={orderBy === headCell.id ? order : false}
            style={
              headCell.label == "Name" && parentProp.sticky
                ? {
                    position: "sticky",
                    left: 0,
                    background: "white",
                    zIndex: 800,
                  }
                : {}
            }
          >
            {checkForColumns(headCell) ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                onClick={createSortHandler(headCell.id)}
                IconComponent={
                  order === "asc" && orderBy === headCell.id
                    ? () => (
                        <ArrowDropDownIcon
                          sx={{
                            cursor: "pointer",
                            color: "grey",
                          }}
                        />
                      )
                    : order === "desc" && orderBy === headCell.id
                    ? () => (
                        <ArrowDropUpIcon
                          sx={{
                            cursor: "pointer",
                            color: "grey",
                          }}
                        />
                      )
                    : () => (
                        <SwapVertIcon sx={{ color: "#999", fontSize: 13 }} />
                      )
                }
              >
                <Text content={headCell.label} />
              </TableSortLabel>
            ) : (
             headCell.label=="html"? parentProp.htmlLabel() : <Text content={headCell.label} />
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
})

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  parentProp: PropTypes.any.isRequired,
  checkForColumns:PropTypes.func.isRequired
};

const EnhancedTable = ({props})=> {
  useEffect(()=>console.log("Table re render"),[])


  const colouredPillsStyling={
    borderRadius:'15px',
    width:'6vw',
    lineHeight:'4vh',
    height:'4vh'
  }

  const totalPages = props.totalPages;
  const totalDocuments = props.totalDocuments;
  const pageSize = props.pageSize;
  //states
  const [order, setOrder] = useState(null);
  const [orderBy, setOrderBy] = useState("Name");

  const metaDataValue = useSelector((state) => state.metaData);

  const checkboxLabel = { inputProps: { "aria-label": "Checkbox demo" } };
  const [columnLengths, setColumnLengths] = useState({});
  const [priorityIndex,setPriorityIndex]=useState()
  const [statusIndex,setStatusIndex]=useState()

  let priorities = [
    {
      name: "CRITICAL",
      color: "#bf3535",
      fade: "rgb(191,53,53,0.1)",
    },
    {
      name: "MAJOR",
      color: "#844204",
      fade: "rgb(132,66,4,0.1)",
    },
    {
      name: "MINOR",
      color: "#fe9f1b",
      fade: "rgb(254,160,60,0.1)",
    },
    {
      name: "WARNING",
      color: "#3399ff",
      fade: "rgb(66,161,255,0.1)",
    },
  ];
  let statuses = [
    {
      name: "CLEARED",
      color: "#bf3535",
      fade: "rgb(191,53,53,0.1)",
    },
    {
      name: "ACKNOWLEDGED",
      color: "#3399ff",
      fade: "rgb(66,161,255,0.1)",
    },
    {
      name: "ACTIVE",
      color: "#5fb762",
      fade: "rgb(95,183,98,0.1)",
    },
  ];

  useEffect(()=>{
    if(props?.columns){
      props.columns.forEach((column,index)=>{
        if(column.label=='Priority'){
          setPriorityIndex(index)
        }
        if(column.label=='Status'){
          setStatusIndex(index)
        }
      })
    }
  },[props?.columns])

  useEffect(() => {
    let newObj = {};
    props?.expandedDevices &&
      props.expandedDevices.forEach((id) => {
        const found = props.rows.find((row) => row.id == id);
        if (found && found?.childDevices?.length) {
          let columns = props.generateColumns(found.childDevices);
          newObj[id] = columns.length;
        }
      });
    setColumnLengths(newObj);
  }, [props?.expandedDevices]);

  function stableSort(array, comparator) {
    if(order==null){
      const stabilizedThis= array.map((el,index)=>[el,index])
      return stabilizedThis.map((el)=>el[0])
    }
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      //if order is + a will come after b
      console.log('order',a,b,order,'if order is negative a will be place before b')
      if (order !== 0) {
        return order;
      }
      //if order is 0 place it like they were before
      return a[1] - b[1];
    });
    console.log(stabilizedThis)
    console.log('ret',stabilizedThis.map((el)=>el[0]))
    return stabilizedThis.map((el) => el[0]);
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

  const checkForColumns = useCallback((column)=> {
    return (
      column.label == "Name" ||
      column.label == "Serial Number" ||
      column.label == "IMEI" ||
      column.label == "Firmware" ||
      column.label == "Last Updated" ||
      column.label == "connectivity" ||
      column.label == "Last Message" ||
      column.label == "Created At" ||
      column.label == "Updated At" ||
      column.label == "Asset" ||
      column.label == "Repeated"
    );
  },[])


  const sortDate = (label, value) => {
    if (label == 'Created At' || label == 'Updated At' || label=='Last Message') {


      let dateObj = new Date(value);
      if(dateObj=='Invalid Date'){
        //fix the parsing error
        dateObj=dayjs(value, "DD/MM/YYYY-HH:mm:ss").toDate();
      }
      

      // Check if parsing was successful (returns Invalid Date if not)
      if (dateObj instanceof Date && !isNaN(dateObj)) {
        // Format the date object according to the desired format
        return dateObj.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) + ' ' + dateObj.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true // Include AM/PM indicator
        });
      } else {
        alert('Parsing error')
      }
    }
    else {
      return value
    }
  }

  function selectAsset(row) {
    let index = props.assets.findIndex((a) => a.internalId == row.internalId);
    if (index != -1) {
      let temp = [...props.assets];
      temp.splice(index, 1);
      props.setAssets(temp);
    } else {
      props.setAssets([
        ...props.assets,
        {
          ...row,
          _id: props.unattachedDevices.find(
            (d) => d.internalId == row.internalId
          )._id,
        },
      ]);
    }
  }

  function descendingComparator(a, b, orderBy) {
    if (orderBy == 'lastUpdated' ) {
      const formatA = (a[orderBy].includes('A') || a[orderBy].includes('P')) ? 'DD/MM/YYYY HH:mm:ss A' : 'DD/MM/YYYY hh:mm:ss'
      const formatB = (b[orderBy].includes('A') || b[orderBy].includes('P')) ? 'DD/MM/YYYY HH:mm:ss A' : 'DD/MM/YYYY hh:mm:ss'
      let valueA
      let valueB
      if (formatA == 'DD/MM/YYYY HH:mm:ss A') {
        valueA = a[orderBy]
        valueA = valueA.replace('-', ' ')
        console.log(a,'after Dash',valueA)
        const [date, time] = valueA.split(' ')
        const [hour] = time.split(':')
        valueA= valueA.replace(/(\d{2}):([0-5][0-9]):([0-5][0-9]) A?/, (match, hour, minute, second, amPm) => {
          const paddedHour = hour.padStart(2, '0');
          return `${paddedHour}:${minute}:${second} ${amPm}`;
        });
        console.log('before conversion valueA is ',valueA,a)
        valueA = dayjs(valueA, 'DD/MM/YYYY HH:mm:ss A')
        console.log('After conversion valueA is ',valueA,a)

      }
      if (formatB == 'DD/MM/YYYY HH:mm:ss A') {
        valueB = b[orderBy]
        valueB = valueB.replace('-', ' ')
        const [date, time] = valueB.split(' ')
        const [hour] = time.split(':')
        valueB= valueB.replace(/(\d{2}):([0-5][0-9]):([0-5][0-9]) A?/, (match, hour, minute, second, amPm) => {
          const paddedHour = hour.padStart(2, '0');
          return `${paddedHour}:${minute}:${second} ${amPm}`;
        });
        valueB = dayjs(valueB, 'DD/MM/YYYY HH:mm:ss A')
      }
      console.log('ret in descComparator',valueB,valueA,valueB.diff(valueA),b,a,b[orderBy],a[orderBy])
      return valueB.diff(valueA)
    } else {
      const valueA = a[orderBy]?.toString()?.toLowerCase();
      const valueB = b[orderBy]?.toString()?.toLowerCase();
      return valueB?.localeCompare(valueA);
    }
  }



  function getComparator(order, orderBy) {
    console.log('getComparator',order)
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }


  /**
   * This function updates order and orderby states
   * if order is null it will become asc
   * if order is asc it will become desc
   * if order is desc it will become null
   * @param {any} event
   * @param {string} property the id of cell
   *
   */



  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    const isDesc = orderBy === property && order === "desc";

    setOrder(isAsc ? "desc" : isDesc ? null : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    props.handleChange(newPage)
  };

  /**
   * @returns Memoized version of rows, so that rows , does not change unless order or page not change
   */




  const visibleRows = React.useMemo(
    () =>
      stableSort(props.rows, getComparator(order, orderBy)).slice((props.page-1)*pageSize,props.page*pageSize),
    [order, orderBy, props.page, pageSize,props.rows]
  );

  console.log(visibleRows,stableSort(props.rows, getComparator(order, orderBy)),(props.page-1)*pageSize,props.page*pageSize)

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
          {props.search ? (
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
            sx={{
              minHeight: props.minHeight ? props.minHeight : "400px",
              height: props.height,
            }}
          >
            <Table
              stickyHeader
              size="small"
              style={{
                width: "100%",
              }}
            >
              <EnhancedTableHead
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
                parentProp={props}
                checkForColumns={checkForColumns}
              />
              <TableBody>
                {visibleRows.map((row) => {
                  return (
                    <Fragment>
                      <TableRow
                        role="checkbox"
                        tabIndex={-1}
                        sx={{
                          cursor: props.groupAsset && "pointer",
                          backgroundColor:
                            props.groupAsset &&
                            props.assets.find(
                              (a) => a.internalId == row.internalId
                            ) &&
                            metaDataValue.branding.secondaryColor,
                        }}
                        onClick={() => props.groupAsset && selectAsset(row)}
                      >
                        {props.columns.map((column,index) => {
                          const value = row[column.id];
                          if (column.id == "html") {
                            return (
                              <TableCell
                                style={
                                  props.sticky
                                    ? {
                                        position: "sticky",
                                        left: 0,
                                        background: "white",
                                      }
                                    : {}
                                }
                                key={column.id}
                                align={column.align}
                              >
                                {props.html(row)}
                              </TableCell>
                            );
                          } else if (column.id == "html2") {
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {props.html2(row)}
                              </TableCell>
                            );
                          } else if (column.id == "assetType") {
                            return (
                              <TableCell key={column.id} align={column.align}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  {row?.assetImage !== "NA" ? <img
                                    style={{ maxWidth: "2.5rem" }}
                                    src={row?.assetImage}
                                  /> : null}
                                  {row?.assetType !== "NA" ? <span
                                    style={{
                                      whiteSpace: "nowrap",
                                      marginLeft: "0.5rem",
                                    }}
                                  >
                                    {row.assetType}
                                  </span> : <span style={{color: "rgb(85,85,85)", margin: "0 auto", fontWeight: "bold", fontSize: "11px"}}>No Defined Type</span>}
                                </div>
                              </TableCell>
                            );
                          } else if (column.id == "html3") {
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {props.html3(row)}
                              </TableCell>
                            );
                          } 
                          else if (column.id == "isChild") {
                            return (
                              <TableCell
                                key={column.id}
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <Checkbox
                                    checked={row?.isChild}
                                    {...checkboxLabel}
                                    onClick={() => props.selectDevice(row)}
                                  />
                                </div>
                              </TableCell>
                            );
                          } else if (
                            column.id == "email" ||
                            column.id == "actuations"
                          ) 
                          {
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {props.icon(row, column.id)}
                              </TableCell>
                            );
                          } else if(column.id == "heirarchy"){
                            return(
                              <TableCell key={column.id} align={column.align}>
                                <span style={{whiteSpace: "nowrap"}}>
                                  {row?.parentDevice ? `Child of ${row.parentDevice.name}` : row?.childDevices.length ? `${row.childDevices.length} Children` : "No Heirarchy"}
                                </span>
                              </TableCell>
                            )
                          } else {
                            return (
                              <TableCell key={column.id} align={column.align}>
                                <p
                                  style={{
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                    maxWidth: "30vw",
                                    backgroundColor: (index === priorityIndex) ? (
                                      priorities.find((priority) => priority.name === value)?.fade || 'initial'
                                    ) :(index === statusIndex) ? (
                                      statuses.find((status) => status.name === value)?.fade || 'initial'
                                    )  : 'initial',                                      
                                    color: (index === priorityIndex) ? (
                                      priorities.find((priority) => priority.name === value)?.color || 'initial'
                                    ) :(index === statusIndex) ? (
                                      statuses.find((status) => status.name === value)?.color || 'initial'
                                    )  : 'initial',

                                    ...(index === priorityIndex || index === statusIndex) && { ...colouredPillsStyling }

                                    // borderRadius:


                                  }}
                                >
                                  {column.format && typeof value === "number" ?
                                    sortDate(column.label,column.format(
                                      value
                                    ))
                                  : sortDate(column.label,value)}
                                </p>
                              </TableCell>
                            );
                          }
                        })}
                      </TableRow>
                      <TableRow>
                        {props.showHeirarchy && props.expandedDevices && props?.expandedDevices?.includes(row.id) ? (
                          <TableCell
                            style={{ paddingBottom: 0, paddingTop: 0 }}
                            colSpan={columnLengths[row.id] || 20}
                          >
                            <Collapse
                              in={props.expandedDevices ? props?.expandedDevices?.includes(row.id) : false}
                              timeout="auto"
                              unmountOnExit
                            >
                                <Table style={{ margin: 1, marginLeft: "20px" }}>
                                  <TableHead>
                                    <TableRow
                                      sx={{ backgroundColor: "#C0C0C0" }}
                                    >
                                      {props
                                        .generateColumns(row.childDevices)
                                        .map((column) => (
                                          <TableCell
                                            key={column.id}
                                            align={column.align}
                                            sx={
                                              props.sticky
                                                ? {
                                                    backgroundColor:
                                                      "#C0C0C0",
                                                  }
                                                : {}
                                            }
                                            style={
                                              column.label == "Name" &&
                                              props.sticky
                                                ? {
                                                    position: "sticky",
                                                    left: 0,
                                                    zIndex: 800,
                                                  }
                                                : {}
                                            }
                                          >
                                            {column.label ==
                                            "connectivity" ? (
                                              <div
                                                style={{
                                                  display: "flex",
                                                  justifyContent: "center",
                                                  alignItems: "center",
                                                  color: "",
                                                  position: "relative",
                                                  cursor:
                                                    checkForColumns(column) &&
                                                    "pointer",
                                                }}
                                              >
                                                <PowerIcon />
                                              </div>
                                            ) : column.label == "html" ? (
                                              props.htmlLabel()
                                            ) : (
                                              <p
                                                style={{
                                                  whiteSpace: "nowrap",
                                                  textOverflow: "ellipsis",
                                                  overflow: "hidden",
                                                  fontWeight: "600",
                                                  color: "white",
                                                  textTransform: "capitalize",
                                                  cursor:
                                                    checkForColumns(column) &&
                                                    "pointer",
                                                }}
                                              >
                                                {column.label}
                                                {column.label ==
                                                "Driver Score" ? (
                                                  <span
                                                    style={{
                                                      cursor: "pointer",
                                                      margin: "10px",
                                                    }}
                                                    onClick={() =>
                                                      setOpenDriverPopup(true)
                                                    }
                                                  >
                                                    <InfoIcon
                                                      style={{
                                                        width: "15px",
                                                        height: "15px",
                                                        position: "absolute",
                                                        top: "11px",
                                                        color: "grey",
                                                      }}
                                                    />
                                                  </span>
                                                ) : null}
                                              </p>
                                            )}
                                          </TableCell>
                                        ))}
                                    </TableRow>
                                  </TableHead>
                                  <TableBody
                                    sx={{ backgroundColor: "#E5E4E2" }}
                                  >
                                    {row.childDevices.map((device) => {
                                      if (typeof device == "object") {
                                        let formattedDevice = props.formatDevice(
                                          device
                                        );
                                        return (
                                          <TableRow
                                            role="checkbox"
                                            tabIndex={-1}
                                            sx={{
                                              cursor:
                                                props.groupAsset && "pointer",
                                              backgroundColor:
                                                props.groupAsset &&
                                                props.assets.find(
                                                  (a) =>
                                                    a.internalId ==
                                                    formattedDevice.internalId
                                                ) &&
                                                metaDataValue.branding
                                                  .secondaryColor,
                                            }}
                                            onClick={() =>
                                              props.groupAsset &&
                                              selectAsset(formattedDevice)
                                            }
                                          >
                                            {props
                                              .generateColumns(
                                                row.childDevices
                                              )
                                              .map((column) => {
                                                const value =
                                                  formattedDevice[column.id];
                                                if (column.id == "html") {
                                                  return (
                                                    <TableCell
                                                      style={
                                                        props.sticky
                                                          ? {
                                                              position:
                                                                "sticky",
                                                              left: 0,
                                                              background:
                                                                "#E5E4E2",
                                                            }
                                                          : {}
                                                      }
                                                      key={column.id}
                                                      align={column.align}
                                                    >
                                                      {props.html(
                                                        formattedDevice
                                                      )}
                                                    </TableCell>
                                                  );
                                                } else if (
                                                  column.id == "html2"
                                                ) {
                                                  return (
                                                    <TableCell
                                                      key={column.id}
                                                      align={column.align}
                                                    >
                                                      {props.html2(
                                                        formattedDevice
                                                      )}
                                                    </TableCell>
                                                  );
                                                } else if (
                                                  column.id == "assetType"
                                                ) {
                                                  return (
                                                    <TableCell
                                                      key={column.id}
                                                      align={column.align}
                                                    >
                                                      <div
                                                        style={{
                                                          display: "flex",
                                                          alignItems:
                                                            "center",
                                                        }}
                                                      >
                                                        <img
                                                          style={{
                                                            maxWidth:
                                                              "2.5rem",
                                                          }}
                                                          src={
                                                            formattedDevice?.assetImage
                                                          }
                                                        />
                                                        <span
                                                          style={{
                                                            whiteSpace:
                                                              "nowrap",
                                                            marginLeft:
                                                              "0.5rem",
                                                          }}
                                                        >
                                                          {
                                                            formattedDevice.assetType
                                                          }
                                                        </span>
                                                      </div>
                                                    </TableCell>
                                                  );
                                                } else if (
                                                  column.id == "html3"
                                                ) {
                                                  return (
                                                    <TableCell
                                                      key={column.id}
                                                      align={column.align}
                                                    >
                                                      {props.html3(
                                                        formattedDevice
                                                      )}
                                                    </TableCell>
                                                  );
                                                } else if (
                                                  column.id == "email" ||
                                                  column.id == "actuations"
                                                ) {
                                                  return (
                                                    <TableCell
                                                      key={column.id}
                                                      align={column.align}
                                                    >
                                                      {props.icon(
                                                        formattedDevice,
                                                        column.id
                                                      )}
                                                    </TableCell>
                                                  );
                                                } else if(column.id == "heirarchy"){
                                                  return(
                                                    <TableCell key={column.id} align={column.align}>
                                                      <span style={{whiteSpace: "nowrap"}}>
                                                        {`Child of ${row.html}`}
                                                      </span>
                                                    </TableCell>
                                                  )
                                                }else {
                                                  return (
                                                    <TableCell
                                                      key={column.id}
                                                      align={column.align}
                                                    >
                                                      <p
                                                        style={{
                                                          whiteSpace:
                                                            "nowrap",
                                                          textOverflow:
                                                            "ellipsis",
                                                          overflow: "hidden",
                                                          maxWidth: "30vw",
                                                        }}
                                                      >
                                                        {column.format &&
                                                        typeof value ===
                                                          "number"
                                                          ? sortDate(column.label,column.format(
                                                              value
                                                            ))
                                                          : sortDate(column.label,value)}
                                                      </p>
                                                    </TableCell>
                                                  );
                                                }
                                              })}
                                          </TableRow>
                                        );
                                      }
                                    })}
                                  </TableBody>
                                </Table>
                              </Collapse>
                            </TableCell>
                          ) : null}
                        </TableRow>
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
          </TableContainer>
          <Divider />
          <div
            style={{
              margin: props.paginationMargin
                ? props.paginationMargin
                : "2vh 5vw",
              width: "100%",
              display: "flex",
              gap: "2vw",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Pagination
              color="secondary"
              count={totalPages}
              page={props.page}
              onChange={handleChangePage}
            />
            <p style={{color:'#808080'}}>
              {props.page == totalPages
                ? props.page * pageSize +(totalDocuments - props.page * pageSize)
                : props.page * pageSize}{" "}
              - {totalDocuments}
            </p>
          </div>
        </Fragment>
      )}
    </div>
  );
}

function TableParent(props) {
 
  const [open, setOpen] = React.useState(false);
  const [openDriverPopup, setOpenDriverPopup] = React.useState(false);


  console.log("praps",props)



  return (
    <Fragment>
      <Fragment>
        {openDriverPopup ? (
          <DriverScore setOpen={(v) => setOpenDriverPopup(v)} />
        ) : null}
      </Fragment>
      {open ? (
        <Dialog fullScreen open transitionDuration={0.3}>
          <EnhancedTable props={props} />
        </Dialog>
      ) : (
        <EnhancedTable props={props} />
      )}
    </Fragment>
  );
}

export default memo(TableParent);
