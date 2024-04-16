import React, { Fragment, useEffect } from "react";
import MapIcon from "@mui/icons-material/Map";
import Map from "./Map";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import Keys from "Keys";
import { useSelector, useDispatch } from "react-redux";
import {
  setMapPage,
  setListPage,
  setLiveArr,
  setView,
} from "rtkSlices/AssetViewSlice";
import { resetFilter, setFilter } from "rtkSlices/filterDevicesSlice";
import List from "./List";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { useGetGroupsQuery } from "services/groups";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Button, FormControl } from "@mui/material";
import Typography from "@mui/material/Typography";
import AssetImage from "assets/icons/asset.png";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import InputBase from "@mui/material/InputBase";
import TuneIcon from "@mui/icons-material/Tune";
import Popover from "@mui/material/Popover";
import DeviceFilter from "components/Filters/deviceFilter";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import Zoom from "@mui/material/Zoom";
import { styled } from "@mui/material/styles"
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

let timeout = null;
let tempSearch = "";

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 54,
  height: 30,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 22 22"><path fill="${encodeURIComponent(
          '#fff',
        )}" d="M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3h7zM7 9H4V5h3v4zm10 6h3v4h-3v-4zm0-10h3v4h-3V5z"/></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        // backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    // backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
    width: 26,
    height: 26,
    '&::before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        '#fff',
      )}" d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>')`,
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    // backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
    borderRadius: 20 / 2,
  },
}));

export default function AssetViews(props) {
  console.log("Props", props?.layout)
  let token = window.localStorage.getItem("token");
  const dispatch = useDispatch();
  const filtersValue = useSelector((state) => state.filterDevice);
  const [search, setSearch] = React.useState(filtersValue.search);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [color, setColor] = React.useState(false);
  const [filterColumns, setFilterColumns] = React.useState(getSearchParam());
  const [filtering, setFiltering] = React.useState(false);
  const [showHeirarchy, setShowHeirarchy] = React.useState(false)
  const viewState = useSelector((state) => state.assetView.view);
  const metaDataValue = useSelector((state) => state.metaData);
  const service = metaDataValue.services.find((service) => service.id == props.group)
  console.log({ service })
  const groups = useGetGroupsQuery(
    {
      token,
      refetch: true,
      params: `?serviceId=${props.group}&projection={"marker":1}`,
    },
    { refetchOnMountOrArgChange: true }
  );

  function getSearchParam() {
    let searchArr = ["name"];
    let permission = props.layout.map.columns;
    if (permission.includes("metaTags")) {
      searchArr.push("metaTags");
    }
    if (permission.includes("deviceInfo")) {
      searchArr.push("firmware", "serialNo", "imei", "internalId");
    }
    return searchArr;
  }

  const handleSearch = (e) => {
    setSearch(e.target.value);
    tempSearch = e.target.value;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      dispatch(
        setFilter({
          search: tempSearch,
          searching: true,
          searchFields: filterColumns,
        })
      );
    }, 1000);
  };

  function chkGroup() {
    let permission = metaDataValue.groupPermissions[props.group];
    return permission == "DISABLE" ? false : true;
  }

  useEffect(() => {
    dispatch(setView(props.layout.map.default));
    return () => {
      dispatch(setMapPage(1));
      dispatch(setListPage(1));
      dispatch(resetFilter());
    };
  }, []);

  var view = (viewState) => {
    if (chkGroup()) {
      switch (viewState) {
        case "Group":
        case "Table":
          return (
            <List
              layoutPermission={props.layout.map}
              id={props.group}
              listView={viewState}
              link={props.link}
              sensors={props.sensors}
              configSensors={props.configSensors}
              config={props.config}
              history={props.history}
              toggleDrawer={props.toggleDrawer}
              image={`${Keys.baseUrl}/servicecreator/asset/${props.image}`}
              // liveArr={liveArr}
              color={color}
              open={props.open}
              emDashboard={props.emDashboard}
              showHeirarchy={showHeirarchy}
            />
          );

        case "Map":
          return (
            <Map
              layoutPermission={props.layout.map}
              asset={props.asset}
              id={props.group}
              sensors={props.sensors}
              configSensors={props.configSensors}
              config={props.config}
              history={props.history}
              link={props.link}
              toggleDrawer={props.toggleDrawer}
              alarms={props.alarms}
              tracking={props.tracking}
              dataPointThresholds={props.dataPointThresholds}
              groups={groups?.data?.payload}
              open={props.open}
              controls={props.controls}
              height={props.height + 50}
              minHeight={props.minHeight - 50}
              aq={props.aq}
              emDashboard={props.emDashboard}
            />
          );

        default:
          break;
      }
    } else {
      dispatch(setView(viewState));
      switch (viewState) {
        case "Table":
          return (
            <List
              layoutPermission={props.layout.map}
              sensors={props.sensors}
              configSensors={props.configSensors}
              config={props.config}
              id={props.group}
              listView={"Table"}
              link={props.link}
              history={props.history}
              toggleDrawer={props.toggleDrawer}
              image={`${Keys.baseUrl}/servicecreator/asset/${props.image}`}
              // liveArr={liveArr}
              color={color}
              open={props.open}
              emDashboard={props.emDashboard}
              showHeirarchy={showHeirarchy}
            />
          );

        case "Map":
          return (
            <Map
              layoutPermission={props.layout.map}
              asset={props.asset}
              id={props.group}
              sensors={props.sensors}
              configSensors={props.configSensors}
              config={props.config}
              history={props.history}
              link={props.link}
              toggleDrawer={props.toggleDrawer}
              alarms={props.alarms}
              tracking={props.tracking}
              dataPointThresholds={props.dataPointThresholds}
              groups={groups?.data?.payload}
              open={props.open}
              controls={props.controls}
              emDashboard={props.emDashboard}
            />
          );

        default:
          break;
      }
    }
  };

  const handleClick = (view) => {
    // dispatch(setFilter({ searching: false, search: "" }));
    // setSearch("");
    dispatch(setView(view));
  };

  const doneFilter = () => {
    // setFilterColumns(cols)
    setFiltering(false);
    if (tempSearch) {
      dispatch(
        setFilter({
          search: tempSearch,
          searching: true,
          searchFields: filterColumns,
        })
      );
    }
  };

  return (
    <Fragment>
      <Card
        style={{
          width: "100%",
          minHeight: `${props.minHeight}px`,
          minWidth: "805px",
          height: props.open
            ? props.emDashboard
              ? "90%"
              : "100%"
            : `calc(100vh - ${props.height}px)`,
          // height: props.open
          //   ? props.emDashboard
          //     ? "90%"
          //     : "100%"
          //   : "calc(100vh - 350px)"
        }}
      >
        <span>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              direction: "ltr",
              maxHeight: "35px",
              margin: "10px",
            }}
          >
            <span
              style={{
                display: "flex",
                gap: "15px",
                flex: 1,
                margin: "5px",
                alignItems: "center",
              }}
            >
              <span style={{ display: "flex", gap: "10px" }}>
                <p
                  style={{
                    color: "#bfbec8",
                    fontSize: "15px",
                  }}
                >
                  <b>Assets</b>
                </p>
              </span>
            </span>
            {/* <Tooltip
              title="Filter"
              placement="bottom"
              arrow
              TransitionComponent={Zoom}
            >
              <Avatar
                style={{
                  backgroundColor:
                    filtersValue.measurement != "" ||
                    filtersValue.connection != "" ||
                    filtersValue.metaTags != "" ||
                    filtersValue.alarms.length > 0
                      ? metaDataValue.branding.secondaryColor
                      : "white",
                  height: "32px",
                  width: "32px",
                  cursor: "pointer",
                  transition: "0.5s",
                  marginLeft: "10px",
                  border: "1px solid rgb(215, 215, 215)",
                }}
                onClick={() => {
                  dispatch(setFilter({ view: "1", open: true }));
                  props.toggleDrawer();
                }}
              >
                <FontAwesomeIcon
                  icon={faFilter}
                  style={{
                    color:
                      filtersValue.measurement != "" ||
                      filtersValue.connection != "" ||
                      filtersValue.metaTags != "" ||
                      filtersValue.alarms.length > 0
                        ? "white"
                        : "#616161",
                    height: "12px",
                    width: "12px",
                  }}
                />
              </Avatar>
            </Tooltip> */}
            {viewState == "Table" && service.parentChildEnabled ? (
              <div style={{ margin: "0 10px", position: "relative" }}>
                <MaterialUISwitch sx={{
                  m: 1,
                  '& .MuiSwitch-switchBase': {
                    '&.Mui-checked': {
                      '& + .MuiSwitch-track': {
                        backgroundColor: "rgba(85,85,85)"
                      }
                    }
                  },
                  '& .MuiSwitch-thumb': {
                    backgroundColor: metaDataValue.branding.primaryColor
                  },
                  '& .MuiSwitch-track': {
                    backgroundColor: "rgba(85,85,85)"
                  }
                }} value={showHeirarchy} onChange={() => setShowHeirarchy(!showHeirarchy)} />
                {/* <button
                  style={{
                    color: showHeirarchy ? "white" : metaDataValue.branding.primaryColor,
                    backgroundColor: showHeirarchy ? metaDataValue.branding.primaryColor : "white",
                    border: "1px solid",
                    borderColor: showHeirarchy ? "white" : metaDataValue.branding.primaryColor,
                  }}
                  onClick={() => {setShowHeirarchy(!showHeirarchy)}}
                >
                  {showHeirarchy ? "Heirarchy" : "Default"}
                </button> */}
                {/* <FormControl component="fieldset">
                    <FormControlLabel
                      value="start"
                      control={<Switch style={{color: metaDataValue.branding.primaryColor}} value={showHeirarchy} onChange={() => setShowHeirarchy(!showHeirarchy)}/>}
                      label="Start"
                      labelPlacement="start"
                    />
                </FormControl> */}
              </div>
            ) : null}
            {viewState != "Group" ? (
              <div style={{ margin: "0 10px", position: "relative" }}>
                <SearchOutlinedIcon
                  style={{
                    color: "#616161",
                    position: "absolute",
                    left: "8px",
                    top: "5px",
                  }}
                />
                <InputBase
                  placeholder="Search..."
                  id="search-assetDashboard"
                  sx={{
                    border: "1px solid rgb(215, 215, 215)",
                    borderRadius: "10px",
                    padding: "0px 30px",
                    marginLeft: "0px",
                    height: "31px",
                  }}
                  value={search}
                  onChange={handleSearch}
                />{" "}
                {/* {viewState == "Table" ? ( */}
                <TuneIcon
                  sx={{
                    position: "absolute",
                    marginLeft: "-30px",
                    marginTop: "4px",
                    cursor: "pointer",
                    color: "#616161",
                  }}
                  onClick={(e) => {
                    setAnchorEl(e.currentTarget);
                    setFiltering(true);
                  }}
                />
              </div>
            ) : null}
            <span>
              <Popover
                id="assets"
                anchorEl={anchorEl}
                // icon={KeyboardArrowDownIcon}
                open={filtering}
                onClose={doneFilter}
                name="assets"
                // anchorOrigin={{
                //   vertical: "bottom",
                //   horizontal: "left",
                // }}
                style={{ maxHeight: "500px" }}
              >
                <DeviceFilter
                  filterColumns={filterColumns}
                  setFilterColumns={setFilterColumns}
                  layoutPermission={props.layout.map}
                  doneFilter={doneFilter}
                />
              </Popover>
            </span>
            {viewState == "Group" ? (
              <span style={{ marginTop: "-1px" }}>
                <FormControlLabel
                  sx={{ marginLeft: "10px" }}
                  control={
                    <Switch
                      checked={color}
                      onChange={(e) => setColor(e.target.checked)}
                    />
                  }
                  label={
                    <Typography style={{ fontSize: "11px", color: "#999" }}>
                      Color spectrum
                    </Typography>
                  }
                />
              </span>
            ) : null}
            <span
              style={{
                display: "flex",
                gap: "20px",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  direction:
                    window.localStorage.getItem("Language") == "ar"
                      ? "rtl"
                      : "ltr",
                  display: "flex",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    direction:
                      window.localStorage.getItem("Language") == "ar"
                        ? "rtl"
                        : "ltr",
                    display: "flex",
                    gap: "10px",
                    maxHeight: "33px",
                  }}
                >
                  {[
                    {
                      name: "List",
                      value: "Table",
                      icon: FormatListBulletedIcon,
                    },
                    {
                      name: "Groups",
                      value: "Group",
                      icon: AccountTreeIcon,
                    },
                    {
                      name: "Map",
                      value: "Map",
                      icon: MapIcon,
                    },
                  ].map((e) => (
                    <Fragment>
                      {(
                        e.value != "Group"
                          ? true
                          : chkGroup() &&
                          !groups.isFetching &&
                          groups?.data?.payload?.length
                      ) ? (
                        <Chip
                          size="small"
                          label={e.name}
                          id={e.name}
                          icon={
                            <e.icon
                              fontSize="small"
                              style={{
                                marginLeft: "10px",
                                color:
                                  viewState == e.value
                                    ? "White"
                                    : metaDataValue.branding.primaryColor,
                              }}
                            />
                          }
                          color="primary"
                          variant="outlined"
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor:
                              viewState == e.value
                                ? metaDataValue.branding.primaryColor
                                : "",
                            height: "30px",
                            borderRadius: "7px",
                            padding: "6px",
                            fontSize: "16px",
                            minWidth: "60px",
                            color:
                              viewState == e.value
                                ? "White"
                                : metaDataValue.branding.primaryColor,
                          }}
                          onClick={() => {
                            handleClick(e.value);
                          }}
                          clickable
                        />
                      ) : null}
                    </Fragment>
                  ))}
                </div>
              </div>
              {!props.emDashboard ? (
                props.showMapFullScreen != undefined &&
                  !props.showMapFullScreen ? null : props.open ? (
                    <FullscreenExitIcon
                      style={{ cursor: "pointer" }}
                      onClick={() => props.setOpen(false)}
                    />
                  ) : (
                  <FullscreenIcon
                    style={{ cursor: "pointer" }}
                    onClick={() => props.setOpen(true)}
                  />
                )
              ) : null}
            </span>
          </div>
          <div
            style={{
              height: "100%",
              maxHeight: "100%",
              minHeight: "460px",
              overflowY: "hidden",
            }}
          >
            {groups?.isSuccess ? view(viewState) : null}
          </div>
        </span>
      </Card>
    </Fragment>
  );
}
