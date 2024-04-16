import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Count from "./Count";
import AlarmFilters from "./Filters";
import List from "./List";
import Trend from "./Trend";
import { useGetDevicesQuery } from "services/devices";
import Dragable from "components/Dragable";
import Tooltip from "@mui/material/Tooltip";
import Fab from "@mui/material/Fab";
import Zoom from "@mui/material/Zoom";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import Drawer from "@mui/material/Drawer";
import Reports from "./Reports";
import { useSnackbar } from "notistack";
import { useLocation } from "react-router-dom";
import { setAlarmsFilter } from "rtkSlices/AlarmsFilterSlice";

export default function AlarmsDashboard(props) {
  const location=useLocation()
  const selectedSolution=location.state?.selectedSolution
  let token = window.localStorage.getItem("token");
  let priorities = ["CRITICAL", "MAJOR", "MINOR", "WARNING"];
  let statuses = ["ACTIVE", "ACKNOWLEDGED", "CLEARED"];
  const metaDataValue = useSelector((state) => state.metaData);
  const alarmsFilter = useSelector((state) => state.alarmsFilter);
  console.log({alarmsFilter})
  const [csvData, setCsvData] = React.useState([]);
  const [sensorIds, setSensorIds] = React.useState([]);
  const [allAlarms, setAllAlarms] = React.useState([]);
  const [drawer, setDrawer] = React.useState(false);
  const dispatch=useDispatch()

  useEffect(()=>{
    if(selectedSolution ){
      dispatch(setAlarmsFilter({...alarmsFilter,solutions:[selectedSolution.name]}))
    }
  },[selectedSolution])

  useEffect(()=>{
    //resetting form on page unmount

    const reset=()=>{
      dispatch(setAlarmsFilter({
        date: {
          startTime: new Date().setDate(new Date().getDate() - 7),
          endTime: new Date().setDate(new Date().getDate())
        },
        status: ["ACTIVE","ACKNOWLEDGED"],
        solutions: ['All'],
        priority: [],
        emails: false,
        actuations: false,
        search: {
          asset: "",
          rule: ""
        }
      }))
    }


    return ()=>{
      reset()
    }
  },[])



  const { enqueueSnackbar } = useSnackbar();
  const devices = useGetDevicesQuery(
    {
      token,
      group: "",
      params: `&search=${
        alarmsFilter.search.asset
      }&searchFields=${JSON.stringify(["name"])}`,
    },
    { skip: !alarmsFilter.search.asset }
  );

  useEffect(() => {
    if (
      !devices.isFetching &&
      devices.isSuccess &&
      devices.data?.payload &&
      devices.data?.payload?.data?.length
    ) {
      console.log({devices})
      setSensorIds(devices.data.payload.data.map((d) => d.internalId));
    }
    if (!devices.isFetching && devices.isSuccess && !devices.data?.payload?.data?.length) {
      console.log({devices})
      showSnackbar("Devices", "No devices found", "error", 1000);
    }
  }, [devices.isFetching]);

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar(
      { title, message: message ? message : "Something went wrong", variant },
      { timeOut }
    );
  }

  function generateRows(data) {
    let tempData = JSON.parse(JSON.stringify(data));
    tempData.forEach((r) => {
      r.service =
        alarmsFilter.solutions[0] == "All"
          ? metaDataValue.services.find((s) => s.id == r.serviceId)?.name
          : alarmsFilter.solutions[0];
      r.createdAt =
        new Date(r.createdAt).toLocaleDateString() +
        " " +
        new Date(r.createdAt).toLocaleTimeString();
      r.updatedAt =
        new Date(r.updatedAt).toLocaleDateString() +
        " " +
        new Date(r.updatedAt).toLocaleTimeString();
      if (isJsonString(r.text) != r.text) {
        r.text = isJsonString(r.text);
        r.reason = `${r.text.sensorFriendlyName? r.text.sensorFriendlyName:''} (value: ${r.text.reading}) - is ${r.text.condition} - ${r.text.threshold}`;
        r.email = r.text.emails;
        if (r.text.actions && r.text.actions.length && r.text.actuatorNames) {
          r.actuations = [];
          r.text.actions.forEach((a) => {
            r.actuations.push(
              `${r.text.actuatorNames[a.actuatorId]} → ${a.commandLabel}`
            );
          });
        }
      } else {
        r.reason = r.text;
      }
    });
    return tempData;
  }

  function generateExportData(data) {
    let tempColumns = [
      { id: "service", label: "Solution", align: "center" },
      { id: "deviceName", label: "Asset", align: "center" },
      { id: "severity", label: "Priority", align: "center" },
      { id: "status", label: "Status", align: "center" },
      { id: "count", label: "Count", align: "center" },
      { id: "reason", label: "Reason", align: "center" },
      { id: "email", label: "Emails", align: "center" },
      { id: "actuations", label: "Actuations", align: "center" },
      { id: "type", label: "Type", align: "center" },
      { id: "createdAt", label: "Created At", align: "center" },
      { id: "updatedAt", label: "Updated At", align: "center" },
    ];
    let keys = tempColumns.map((c) => c.id);
    data.forEach((t) => {
      Object.keys(t).forEach((t2) => {
        if (!keys.includes(t2)) {
          delete t[t2];
        }
      });
    });
    let tempCsvData = [];
    tempCsvData.push(tempColumns.map((t) => t.label));
    data.forEach((t1, i) => {
      tempCsvData[0].forEach((t2, j) => {
        if (!tempCsvData[i + 1]) {
          tempCsvData[i + 1] = [];
        }
        tempCsvData[i + 1].push(t1[tempColumns.find((c) => c.label == t2).id]);
      });
    });
    setCsvData(tempCsvData);
  }

  function isJsonString(str) {
    let out;
    try {
      out = JSON.parse(str);
    } catch (e) {
      return str;
    }
    return out;
  }

  const priorityChart = () => {
    return (
      <Count
        type="priorities"
        setAllAlarms={setAllAlarms}
        generateRows={generateRows}
        generateExportData={generateExportData}
        loading={devices.isFetching}
        sensorIds={!alarmsFilter.search.asset ? [] : sensorIds}
        serviceId={props.serviceId}
      />
    );
  };

  const statusChart = () => {
    return (
      <Count
        type="status"
        setAllAlarms={setAllAlarms}
        generateRows={generateRows}
        generateExportData={generateExportData}
        loading={devices.isFetching}
        sensorIds={!alarmsFilter.search.asset ? [] : sensorIds}
        serviceId={props.serviceId}
      />
    );
  };

  const toggleDrawer = () => {
    setDrawer(!drawer);
  };

  return (
    <>
      <Drawer anchor={"right"} open={drawer} onClose={toggleDrawer}>
        <div style={{ margin: "20px 20px 10px 20px", overflow: "hidden" }}>
          <Reports
            solutions={[{ name: "All", id: "All" }, ...metaDataValue.services]}
            sensorIds={!alarmsFilter.search.asset ? [] : sensorIds}
          />
        </div>
      </Drawer>
      <Dragable bottom={"30px"} right={"30px"} name="add-operations">
        <Tooltip
          title="Scheduled Reports"
          placement="left"
          arrow
          TransitionComponent={Zoom}
        >
          <Fab
            style={{ boxShadow: "none" }}
            color="secondary"
            onClick={toggleDrawer}
          >
            <ScheduleOutlinedIcon />
          </Fab>
        </Tooltip>
      </Dragable>
      <div style={{ overflow: "hidden" }}>
        <AlarmFilters
          priorities={priorities}
          statuses={statuses}
          solutions={ selectedSolution? [selectedSolution] : [    { name: "All", id: "All" }, ...metaDataValue.services]}
          filters={ alarmsFilter }
          serviceId={props.serviceId}
        />
        <div style={{ display: "flex" }}>
          {priorityChart()}
          {statusChart()}
          <Trend
            loading={devices.isFetching}
            sensorIds={!alarmsFilter.search.asset ? [] : sensorIds}
            serviceId={props.serviceId}
          />
        </div>
        <div
          style={{
            backgroundColor: "white",
            paddingBottom: "1px",
            height: "calc(100vh - 408px)",
            borderRadius: "20px",
          }}
        >
          <List
            allAlarms={allAlarms}
            generateRows={generateRows}
            csvData={csvData}
            loading={devices.isFetching}
            sensorIds={!alarmsFilter.search.asset ? [] : sensorIds}
            serviceId={props.serviceId}
          />
        </div>
      </div>
    </>
  );
}
