//-----------CORE-----------//
import React, { useState, Fragment, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { useFormik } from "formik";
//-----------MUI-----------//
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
import { makeStyles } from "@mui/styles";
//-----------MUI ICONS-----------//
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
//-----------EXTERNAL-----------//
import { setFilter, resetFilter } from "rtkSlices/filterDevicesSlice";
import { setMapPage, setListPage } from "rtkSlices/AssetViewSlice";
import Groups from "components/Groups";
import Pin from "assets/img/location-pin.png";

const useStyles = makeStyles({
  assetCard: {
    borderRadius: "15px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "5px 10px",
    height: "max-content",
    width: "max-content",
    minWidth: "max-content",
    minHeight: "max-content",
    cursor: "pointer",
    // border: "2px solid",
    marginRight: "20px",
    "&:hover": {
      backgroundColor: "#eeeeee",
    },
    "&:active": {
      backgroundColor: "white",
    },
  },
});

export default function Filter(props) {
  let token = window.localStorage.getItem("token");
  const dispatch = useDispatch();
  const styles = useStyles();
  const viewState = useSelector((state) => state.assetView.view);
  const filtersValue = useSelector((state) => state.filterDevice);
  const metaDataValue = useSelector((state) => state.metaData);
  const handleChange = (event, newValue) => {
    dispatch(setFilter({ view: newValue }));
  };
  const [allMeta, setAllMeta] = useState(
    metaDataValue.services.find((s) => s.id == props.id)?.metaTags
  );
  const service = metaDataValue.services.find(s=>s.id == props.id)
  const [alarms, setAlarms] = useState(filtersValue.percist.alarms);
  const [connection, setConnection] = useState(filtersValue.percist.connection);
  const [assetTypes, setAssetTypes] = useState(filtersValue.percist.assetTypes)
  const [group, setGroup] = useState(filtersValue.group);
  const [path, setPath] = React.useState(["0:All assets"])

  const filterForm = useFormik({
    initialValues: {
      sensorData: filtersValue.percist.measurement.parameter,
      operator: filtersValue.percist.measurement.operation,
      condition: filtersValue.percist.measurement.value,
      metaValue: filtersValue.percist.metaTags.value,
      metaKey: filtersValue.percist.metaTags.key,
    },
  });

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

  function handleAlarms(severity) {
    let old = [...alarms];
    if (alarms.indexOf(severity) == -1) {
      old.push(severity);
    } else {
      old.splice(alarms.indexOf(severity), 1);
    }
    setAlarms(old);
  }

  function isSelected(id){
    if(assetTypes !== null){
      if(assetTypes.includes(id)){
        return true
      } else {
        return false
      }
    } else {
      return true
    }
  }

  function generateSensorsList(){
    let sensors = []
    assetTypes.forEach((id) => {
      const assetMap = service.assetMapping.find((am) => am?.assetType?._id == id)
      if(assetMap){
        sensors.push(...assetMap.sensors)
      }
    })
    const uniqueSensors = sensors.reduce((accumulator, current) => {
    if (!accumulator.find((item) => item._id === current._id)) {
      accumulator.push(current);
    }
      return accumulator;
    }, []);

    return uniqueSensors
  }

  function applyFn() {
    let body = {
      group: group,
      open: false,
      alarms: alarms.length > 0 ? JSON.stringify(alarms) : "",
      assetTypes: assetTypes && assetTypes.length ? JSON.stringify(assetTypes) : null,
      sensors: assetTypes && assetTypes.length ? generateSensorsList() : null,
      connection: connection,
      expanded: path,
      measurement:
        filterForm.values.sensorData != "" &&
        filterForm.values.operator != "" &&
        `${filterForm.values.condition}` != ""
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
        assetTypes: assetTypes,
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
    props.toggleDrawer();
  }

  function resetFn() {
    dispatch(setMapPage(1));
    dispatch(setListPage(1));
    dispatch(resetFilter(service ? {...service, filtersValue} : {filtersValue}));
    setAlarms([]);
    setConnection("");
    filterForm.resetForm();
    props.toggleDrawer();
  }

  function filterComp() {
    return (
      <div style={{ marginBottom: "20px" }}>
        {service.assets.length > 1 ? 
          <>
            <span
              style={{
                display: "flex",
                gap: "20px",
                alignItems: "center",
              }}
            >
              <h4>
                <strong>{t("Asset Types")}:</strong>
              </h4>
              <div style={{display: "flex", width: "100%", overflowX: "scroll"}}>
                {service.assets.map((asset, i) => (
                  <div
                    className={styles.assetCard} 
                    key={i}
                    style={{
                      // borderColor: isSelected(asset.id) ? "rgb(121, 195, 124)" : "rgb(85,85,85)",
                      backgroundColor: isSelected(asset.id) ? "rgba(121, 195, 124, 0.1)" : "rgba(85,85,85,0.1)"
                    }}
                    onClick={() => {
                      if(assetTypes == null){
                        setAssetTypes([asset.id])
                      } else{
                        let newAssets = []
                        if(isSelected(asset.id)){
                          newAssets = assetTypes.filter((id) => id !== asset.id)
                        } else {
                          newAssets = [...assetTypes, asset.id]
                        }
                        setAssetTypes(newAssets)
                      }
                    }}
                  >
                    <img src={asset.image || Pin} height={75} width={80}/>
                    <span style={{
                      fontSize: "12px", 
                      paddingBlock: "3px", 
                      fontWeight: "bold",
                      color: isSelected(asset.id) ? "rgb(121, 195, 124)" : "rgb(85,85,85)"
                    }}>
                      {asset.name}
                    </span>
                  </div>
                ))}
              </div>
            </span>
            <Divider style={{ marginTop: "20px", marginBottom: "20px" }} /> 
          </>: null}          
        <span
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
          }}
        >
          <h4>
            <strong>{t("Alarms")}:</strong>
          </h4>
          {[
            { name: "CRITICAL", color: "#bf3535" },
            { name: "MAJOR", color: "#844204" },
            { name: "MINOR", color: "#ffa11e " },
            { name: "WARNING", color: "#3399ff" },
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
                      backgroundColor: elm.color,
                    }
                  : {}
              }
            />
          ))}
        </span>
        <Divider style={{ marginTop: "20px" }} />

        <span
          style={{
            display: "flex",
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
            { name: "NEVER", color: "rgb(186,117,216)" },
          ].map((elm) => (
            <Chip
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
                      backgroundColor: elm.color,
                    }
                  : {}
              }
            />
          ))}
        </span>
        <form>
          <Divider style={{ marginTop: "20px" }} />
          <span
            style={{
              display: "flex",
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
            <div style={{ display: "flex", gap: "20px", width: "100%" }}>
              <FormControl margin="dense" fullWidth>
                <InputLabel color="secondary">{t("sensorData")}</InputLabel>
                <Select
                  color="secondary"
                  name="sensorData"
                  required
                  label={t("sensorData")}
                  onChange={filterForm.handleChange}
                  value={filterForm.values.sensorData}
                >
                  {props.sensors.map((elm) => {
                    return (
                      <MenuItem value={elm.name}>{elm.friendlyName}</MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              <FormControl margin="dense" fullWidth>
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
              />
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

          {allMeta.length ? <Divider style={{ marginTop: "20px" }} /> : null}
          {allMeta.length ? (
            <span
              style={{
                display: "flex",
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
              <div style={{ display: "flex", gap: "20px", width: "100%" }}>
                <FormControl margin="dense" fullWidth>
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
                    {allMeta.map((elm) => {
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



  return (
    <Fragment>
      <div
        style={{
          position: "relative",
          height: "100vh",
          width: "700px",
          margin: "20px 20px 10px 20px",
          direction:
            window.localStorage.getItem("Language") == "ar" ? "rtl" : "ltr",
        }}
      >
        <Box sx={{ width: "100%", typography: "body1" }}>
          <TabContext value={filtersValue.view}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList
                onChange={handleChange}
                aria-label="lab API tabs example"
              >
                <Tab disabled={props.tab == 2} label="Assets Filter(s)" value="1" />

                {metaDataValue.groupPermissions[props.group] != "DISABLE" ? (
                  <Tab disabled={props.tab == 0} label="Groups" value="2" />
                ) : null}
              </TabList>
            </Box>
            <TabPanel value="1">{filterComp()}</TabPanel>
            {metaDataValue.groupPermissions[props.group] != "DISABLE" ? (
              <TabPanel value="2">
                <Groups
                  id={props.id}
                  group={group}
                  setGroup={setGroup}
                  history={props.history}
                  refetch={true}
                  height={"calc(100vh - 175px)"}
                  path={path}
                  setPath={setPath}
                  serviceDashboard={props.serviceDashboard ? true : false}
                />
              </TabPanel>
            ) : null}
          </TabContext>
        </Box>

        <div
          style={{
            position: "absolute",
            width: "100%",
            bottom: "0",
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
