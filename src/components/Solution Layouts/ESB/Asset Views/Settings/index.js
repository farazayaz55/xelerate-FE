//-----------CORE-----------//
import React, { useState, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { useFormik } from "formik";
import {
  faBoxesStacked,
  faArrowCircleRight,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//-----------MUI-----------//
import SearchIcon from "@mui/icons-material/Search";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
//-----------MUI ICONS-----------//
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
//-----------EXTERNAL-----------//
import { setFilter, resetFilter } from "rtkSlices/filterDevicesSlice";
import { setMapPage, setListPage } from "rtkSlices/AssetViewSlice";
import Groups from "./Groups";
import "app/style.css";
import { styled } from "@mui/system";
import InputBase from "@mui/material/InputBase";
import { setSelectedGroup } from "rtkSlices/metaDataSlice";
import { Tooltip, Zoom } from "@mui/material";

export default function Filter(props) {
  let token = window.localStorage.getItem("token");
  const dispatch = useDispatch();
  const viewState = useSelector((state) => state.assetView.view);
  const filtersValue = useSelector((state) => state.filterDevice);
  const metaDataValue = useSelector((state) => state.metaData);
  const handleChange = (event, newValue) => {
    dispatch(setFilter({ view: newValue }));
  };
  const [allMeta, setAllMeta] = useState(
    metaDataValue.services.find((s) => s.id == props.id)?.metaTags
  );
  const [alarms, setAlarms] = useState(filtersValue.percist.alarms);
  const [connection, setConnection] = useState(filtersValue.percist.connection);
  // const [rightPaneOpen, setRightPaneOpen] = useState(filtersValue.rightPaneOpen)
  const [group, setGroup] = useState(filtersValue.group);
  const [isInputEmpty, setIsInputEmpty] = useState(true);
  const searchString = React.useRef("");

  const filterForm = useFormik({
    initialValues: {
      sensorData: filtersValue.percist.measurement.parameter,
      operator: filtersValue.percist.measurement.operation,
      condition: filtersValue.percist.measurement.value,
      metaValue: filtersValue.percist.metaTags.value,
      metaKey: filtersValue.percist.metaTags.key,
    },
  });
  const Search = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: "10px",
    backgroundColor: "#eeeeee",
    marginLeft: 0,
    marginRight: "8px",
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(1),
      width: "auto",
    },
  }));

  const SearchIconWrapper = styled("div")(({ theme }) => ({
    padding: theme.spacing(0, 1),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }));
  const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: "inherit",
    "& .MuiInputBase-input": {
      padding: theme.spacing(1, 1, 1, 0),
      paddingLeft: `calc(1em + ${theme.spacing(3)}) !important`,
      transition: theme.transitions.create("width"),
      width: "100%",
      [theme.breakpoints.up("sm")]: {
        width: "30ch",
        "&:focus": {
          width: "30ch",
        },
      },
    },
  }));
  const { t } = useTranslation();

  function handleConnection(status) {
    // if (status == "AVAILABLE") {
    //   if (connection == "" || connection == "UNAVAILABLE")
    //     setConnection(status);
    //   else setConnection("");
    // } else {
    //   if (connection == "" || connection == "AVAILABLE") setConnection(status);
    //   else setConnection("");
    // }
    setConnection(connection == status ? "" : status);
  }

  function setSearchString(text) {
    searchString.current = text;
  }

  function handleSearch(searchtext) {
    dispatch(setFilter({ searchString: searchtext }));
    setSearchString(searchtext);
  }

  function handleAlarms(severity) {
    let old = [...alarms];
    if (alarms.indexOf(severity) == -1) {
      old.push(severity);
    } else {
      old.splice(alarms.indexOf(severity), 1);
    }
    setAlarms(old);
  }

  function applyFn() {
    let body = {
      group: group,
      alarms: alarms.length > 0 ? JSON.stringify(alarms) : "",
      connection: connection,
      measurement:
        filterForm.values.sensorData != "" &&
        filterForm.values.operator != "" &&
        filterForm.values.condition != ""
          ? JSON.stringify({
              parameter: filterForm.values.sensorData,
              operation: filterForm.values.operator,
              value: filterForm.values.condition,
            })
          : "",
      metaTags:
        filterForm.values.metaKey != "" && filterForm.values.metaValue != ""
          ? JSON.stringify({
              key: filterForm.values.metaKey,
              value: filterForm.values.metaValue,
            })
          : "",
      percist: {
        alarms: alarms,
        connection: connection,
        metaTags: {
          key: filterForm.values.metaKey,
          value: filterForm.values.metaValue,
        },
        measurement: {
          parameter: filterForm.values.sensorData,
          operation: filterForm.values.operator,
          value: filterForm.values.condition,
        },
      },
    };
    dispatch(setMapPage(1));
    dispatch(setListPage(1));
    dispatch(setFilter(body));
    props.toggleDrawer && props.toggleDrawer();
  }

  function resetFn() {
    dispatch(setMapPage(1));
    dispatch(setListPage(1));
    dispatch(resetFilter());
    setAlarms([]);
    setConnection("");
    filterForm.resetForm();
    props.toggleDrawer && props.toggleDrawer();
  }

  function filterComp() {
    console.log("Filters showing");
    return (
      <div style={{ marginBottom: "20px" }}>
        <span
          style={{
            // display: "flex",
            gap: "20px",
            alignItems: "center",
          }}
        >
          <h4>
            <strong>{t("Alarms")}:</strong>
          </h4>
          {[
            { name: "critical", color: "#bf3535" },
            { name: "major", color: "#844204" },
            { name: "minor", color: "#ffa11e " },
            { name: "warning", color: "#3399ff" },
          ].map((elm) => (
            <Chip
              icon={
                <NotificationsActiveIcon
                  fontSize="small"
                  style={
                    alarms.indexOf(elm.name) != -1
                      ? {
                          color: "white",
                          marginLeft: "10px",
                          
                        }
                      : {
                          marginLeft: "10px",
                          
                        }
                  }
                />
              }
              onClick={() => {
                handleAlarms(elm.name);
              }}
              clickable
              label={
                <span
                  style={{
                    fontSize:
                      window.localStorage.getItem("Language") == "en"
                        ? "13px"
                        : "16px",
                    color: alarms.indexOf(elm.name) != -1 ? "white" : "#555555",
                  }}
                >
                  <b>{t(elm.name)}</b>
                </span>
              }
              style={
                alarms.indexOf(elm.name) != -1
                  ? {
                      color: "white",
                      backgroundColor: elm.color,marginTop:'2px'
                    }
                  : {marginTop:'2px'}
              }
              size="small"
            />
          ))}
        </span>
        <Divider style={{ marginTop: "20px" }} />

        <span
          style={{
            // display: "flex",
            marginTop: "20px",
            gap: "20px",
            alignItems: "center",
          }}
        >
          <h4>
            <strong>{t("Connectivity")}:</strong>
          </h4>
          {[
            { name: "AVAILABLE", color: "#5fb762" },
            { name: "UNAVAILABLE", color: "#555555" },
            // { name: "NEVER", color: "rgb(186,117,216)" },
          ].map((elm) => (
            <Chip
            size="small"
              icon={
                <CompareArrowsIcon
                  fontSize="small"
                  style={
                    connection == elm.name
                      ? {
                          color: "white",
                          marginLeft: "10px",
                          
                        }
                      : {
                          marginLeft: "10px",
                          
                        }
                  }
                />
              }
              onClick={() => {
                handleConnection(elm.name);
              }}
              clickable
              label={
                <span
                  style={{
                    fontSize:
                      window.localStorage.getItem("Language") == "en"
                        ? "13px"
                        : "16px",
                    color: connection == elm.name ? "white" : "#555555",
                  }}
                >
                  <b>
                    {elm.name == "AVAILABLE"
                      ? t("ACTIVE")
                      : elm.name == "UNAVAILABLE"
                      ? t("INACTIVE")
                      : t("NO COMMUNICATION")}
                  </b>
                </span>
              }
              style={
                connection == elm.name
                  ? {
                      color: "white",
                      backgroundColor: elm.color,marginTop:'2px'
                    }
                  : {marginTop:'2px'}
              }
            />
          ))}
        </span>
        <form>
          <Divider style={{ marginTop: "20px" }} />
          <span
            style={{
              // display: "flex",
              gap: "15px",
              marginTop: "20px",
              marginBottom: "20px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h4>
              <strong>{t("measurement")}:</strong>
            </h4>
            <div style={{ gap: "20px", width: "100%" }}>
              <FormControl margin="dense" fullWidth size="small">
                <InputLabel color="secondary">{t("sensorData")}</InputLabel>
                <Select
                  color="secondary"
                  name="sensorData"
                  required
                  label={t("sensorData")}
                  onChange={filterForm.handleChange}
                  value={filterForm.values.sensorData}
                >
                  {props.sensors?.map((elm) => {
                    return (
                      <MenuItem value={elm.name}>{elm.friendlyName}</MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              <div style={{display:'flex'}}>
              <FormControl margin="dense" fullWidth size="small">
                <InputLabel color="secondary">{t("operator")}</InputLabel>
                <Select
                  fullWidth
                  required
                  name="operator"
                  color="secondary"
                  label={t("operator")}
                  onChange={filterForm.handleChange}
                  value={filterForm.values.operator}
                >
                  <MenuItem value="$eq">{t("equal")}</MenuItem>
                  <MenuItem value="$gt">{t("greater")}</MenuItem>
                  <MenuItem value="$gte">{t("greaterEqual")}</MenuItem>
                  <MenuItem value="$lt">{t("less")}</MenuItem>
                  <MenuItem value="$lte">{t("lessEqual")}</MenuItem>
                </Select>
              </FormControl>
              <TextField
                color="secondary"
                id="condition"
                margin="dense"
                label={t("value")}
                type="number"
                fullWidth
                onChange={filterForm.handleChange}
                value={filterForm.values.condition}
                size="small"
              />
              </div>
            </div>
            <HighlightOffIcon
              onClick={() => {
                filterForm.setFieldValue("sensorData", "");
                filterForm.setFieldValue("operator", "");
                filterForm.setFieldValue("condition", "");
              }}
              fontSize="small"
              style={{
                cursor: "pointer",
                color: "#e73e3a",
              }}
            />
          </span>

          {allMeta?.length ? <Divider style={{ marginTop: "20px" }} /> : null}
          {allMeta?.length ? (
            <span
              style={{
                // display: "flex",
                gap: "15px",
                marginTop: "20px",
                marginBottom: "20px",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <h4>
                <strong>Custom Attributes:</strong>
              </h4>
              <div style={{ gap: "20px", width: "100%" }}>
                <FormControl margin="dense" fullWidth size="small">
                  <InputLabel color="secondary">Attribute</InputLabel>
                  <Select
                    id="metaKey"
                    color="secondary"
                    name="metaKey"
                    required
                    label="Attribute"
                    onChange={filterForm.handleChange}
                    value={filterForm.values.metaKey}
                  >
                    {allMeta?.map((elm) => {
                      return <MenuItem value={elm.key}>{elm.key}</MenuItem>;
                    })}
                  </Select>
                </FormControl>
                <div
                  style={{
                    marginTop: 20,
                    color: "grey",
                    fontWeight: "bold",
                    fontSize: 14,
                  }}
                >
                  CONTAINS
                </div>
                <TextField
                  id="metaValue"
                  color="secondary"
                  margin="dense"
                  label={t("value")}
                  type="text"
                  fullWidth
                  onChange={filterForm.handleChange}
                  value={filterForm.values.metaValue}
                  size="small"
                />
              </div>
              <HighlightOffIcon
                onClick={() => {
                  filterForm.setFieldValue("metaKey", "");
                  filterForm.setFieldValue("metaValue", "");
                }}
                fontSize="small"
                style={{
                  cursor: "pointer",
                  color: "#e73e3a",
                }}
              />
            </span>
          ) : null}
        </form>
      </div>
    );
  }

  function chkGroup() {
    let tab;
    let admin = metaDataValue.apps.find((m) => m.name == "Administration");
    if (admin) tab = admin.tabs.find((m) => m.name == "Group Management");
    if (tab) return tab.permission;
    else return false;
  }

  return (
    <Fragment>
      <div
        className="dashboardRightSideInnerWrap"
        style={{
          position: "relative",
          height: "100vh",
          direction:
            window.localStorage.getItem("Language") == "ar" ? "rtl" : "ltr",
        }}
      >
        <Box sx={{ width: "100%", typography: "body1" }}>
          <TabContext value={filtersValue.view}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                margin: "10px 0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Button
                  color="secondary"
                  onClick={() => {
                    dispatch(
                      setFilter({ rightPaneOpen: !filtersValue.rightPaneOpen })
                    );
                  }}
                >
                  <FontAwesomeIcon
                    icon={faArrowCircleRight}
                    style={{
                      width: "22px",
                      height: "22px",
                      color: "#6d6d6d",
                      marginRight: "10px",
                      marginLeft: "10px",
                      cursor: "pointer",
                    }}
                  />
                </Button>

                <TabList
                  onChange={handleChange}
                  aria-label="lab API tabs example"
                >
                  {metaDataValue.groupPermissions[props.group] != "DISABLE" ? (
                    <Tab label="Groups" value="2" />
                  ) : null}
                  {/* <Tab
                    label="Assets Filter(s)"
                    value="1"
                    // className="AssetsFilter"
                  /> */}
                </TabList>
              </div>
              <div>
                <FontAwesomeIcon
                  icon={faSearch}
                  style={{
                    width: "22px",
                    height: "22px",
                    color: "#6d6d6d",
                    marginRight: "15px",
                    cursor: "pointer",
                  }}
                />

                {(chkGroup() == "ALL" || chkGroup() == "READ") &&
                (metaDataValue.groupPermissions[props.id] == "ALL" ||
                  metaDataValue.groupPermissions[props.id] == "READ") ? (
                  <span
                    onClick={() => {
                      dispatch(setSelectedGroup(props.id));
                      props.history.push("/administration/groupManagement");
                    }}
                  >
                    <Tooltip
                      title="Groups Administration"
                      placement="left"
                      arrow
                      TransitionComponent={Zoom}
                    >
                      <FontAwesomeIcon
                        icon={faBoxesStacked}
                        style={{
                          width: "22px",
                          height: "22px",
                          color: "#6d6d6d",
                          marginRight: "10px",
                          cursor: "pointer",
                        }}
                      />
                    </Tooltip>
                  </span>
                ) : null}
              </div>
            </Box>
           
           <TabPanel value="1" style={{padding:'5px 24px'}}>{filterComp()}</TabPanel>
           {/* {metaDataValue.groupPermissions[props.group] != "DISABLE" ? ( */}
            <TabPanel value="1" style={{padding:'5px 24px'}}>{filterComp()}</TabPanel>
            {/* {metaDataValue.groupPermissions[props.group] != "DISABLE" ? ( */}
            <TabPanel value="2">
            <div style={{marginBottom:'15px'}}>
              <Search>
                <SearchIconWrapper>
                  <SearchIcon style={{ color: "#333333" }} />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search…"
                  autoFocus={true}
                  onChange={(e) => {
                    handleSearch(e.target.value);
                  }}
                  onBlur={() => {}}
                  value={filtersValue.searchString}
                  inputProps={{ "aria-label": "search" }}
                />
              </Search>
            </div>
              <Groups
                id={props.id}
                group={group}
                setGroup={setGroup}
                history={props.history}
                link={props.link}
                serviceDashboard={props.serviceDashboard ? true : false}
                // searchString={searchString}
              />
            </TabPanel>
            {/* ) : null} */}
          </TabContext>
        </Box>
        {/* <div style={{ marginBottom: "20px" }}>
          <p style={{ fontSize: "20px" }}>
            <b>{t("filterss")}</b>
          </p>
        </div>
        <Divider /> */}

        <div
          style={{
            position: "absolute",
            width: "100%",
            bottom: "20px",
            height: "100px",
          }}
        >
          <Divider />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "10px",
            }}
          >
            <Button onClick={resetFn} color="secondary">
              {t("reset")}
            </Button>
            <Button onClick={applyFn} color="secondary">
              {t("apply")}
            </Button>
          </div>
        </div>
      </div>
    </Fragment>
  );
}