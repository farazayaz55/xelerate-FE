//-----------------CORE---------------//
import { Card, CardContent } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import React, { Fragment, useEffect } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import EnergyOn from "assets/icons/energy-on.png";
import EnergyOff from "assets/icons/energy-off.png";
import DollarOn from "assets/icons/dollarOn.png";
import DollarOff from "assets/icons/dollarOff.png";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDollarSign } from "@fortawesome/free-solid-svg-icons";
import { setFilter } from "rtkSlices/filterDevicesSlice";
import UpdateIcon from "@mui/icons-material/Update";
import PersonIcon from "@mui/icons-material/Person";
import RoofingIcon from "@mui/icons-material/Roofing";
import Tooltip from "@mui/material/Tooltip";
import { DatePicker } from "antd";
import dayjs from "dayjs";
const { RangePicker } = DatePicker;

import "./style.css";
import { useSnackbar } from "notistack";

export default function ServiceDashboard({
  setTab,
  setUnit,
  unit,
  days,
  setDays,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  tab,
  lastRefreshed,
  minutes,
  cutoff,
  setCutoff,
  divideByPara,
  setDivideByPara,
  service,
  actuators
}) {

  const dateFormat = "YYYY-MM-DD HH:mm";//hh is 12 hour,HH is 24
  useEffect(()=>console.log(startDate,endDate),[dayjs(startDate,dateFormat),dayjs(endDate,dateFormat)])
  const [value, setValue] = React.useState(tab);
  const [isSnackbarVisible,setSnackbarVisible]=React.useState(false)
  const [dates, setDates] = React.useState(null);
  const [pauseDate, setPauseDate] = React.useState(false);
  const metaDataValue = useSelector((state) => state.metaData);
  const filtersValue = useSelector((state) => state.filterDevice);
  const { enqueueSnackbar } = useSnackbar();
  const startingDate = dayjs(new Date().setHours(0, 0, 0, 0));
  const endingDate = dayjs(new Date());

  const dispatch = useDispatch();
  let expanded = [...filtersValue.expanded];

  const breadcrumbs = (service.group && service.group.id ? (breadcrumbs?.length > 0
    ? expanded.filter(e=>!e.includes('All assets'))
    : expanded.filter(e=>!e.includes('All assets')).reverse()
  ) : (breadcrumbs?.length > 0
    ? expanded
    : expanded.reverse()
  )).map((f, i) => {
    return (
      <Link
        key={i}
        underline="hover"
        style={{ cursor: "pointer" }}
        color="inherit"
        onClick={() => setLevel(f)}
      >
        {f.split(":")[1]}
      </Link>
    );
  });

  useEffect(()=>{
    if(service.group && service.group.id){
      dispatch(
        setFilter({
          expanded: [`${service.group.id}:${service.group.name}`],
          group: service.group,
        })
      );
    }
  },[])

  const handleChange = (event, newValue) => {
    console.log("HANDLING CHANGE",newValue)
    setValue(newValue);
    setTab(newValue);
  };

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  const setLevel = (f) => {
    let temp = JSON.parse(JSON.stringify(filtersValue));
    let ind = temp.expanded.findIndex((e) => e == f);
    dispatch(
      setFilter({
        expanded: temp.expanded.splice(ind),
        group: {
          id: f.split(":")[0] == 0 ? "" : f.split(":")[0],
          name: f.split(":")[1],
        },
      })
    );
  };

  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

  function calcDiffDays(dates){
    const date1 = new Date(dates[0].slice(0,10));
    const date2 = new Date(dates[1].slice(0,10));
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays || 1;
  }

  const handleDateChange = (value, dates) => {
    let start, end;
    if (value) {

      start = value[0].toDate();
      end = value[1].toDate();
      start.setSeconds(0,0)
      end.setSeconds(0,0)
      if(Math.abs(dayjs(start).diff(dayjs(end),'day'))>30){
        if(!isSnackbarVisible){
        showSnackbar(
          "Error",
          "more than 30 days were selected",
          "error",
          1000
        );
        setSnackbarVisible(true)
        setTimeout(()=>setSnackbarVisible(false),1000)
        return
      }
      }
      setDays(calcDiffDays(dates))
    } 
    else {
      start = new Date(new Date().setHours(0, 0, 0, 0));
      end = new Date();
      if(Math.abs(dayjs(start).diff(dayjs(end),'day'))>30){
        if(!isSnackbarVisible){
        showSnackbar(
          "Error",
          "more than 30 days were selected",
          "error",
          1000
        );
        setSnackbarVisible(true)
        setTimeout(()=>setSnackbarVisible(false),1000)
        return
      }
      }
      setDays(1)
    }
    
    setStartDate(start);
    setEndDate(end);

    setDates([start,end])
  };

  const onOpenChange = (open) => {
    if (open) {
      console.log("setting dates to null")
      setDates([null, null]);
    } else {
      console.log("setting dates to null")
      setDates(null);
    }
  };

  const disabledDate = (current) => {
    if (!dates) {
      return false;
    }

    if(dates[0]){
      if(current.diff(dates[0],'day')>30){
        return true
      }
      else{
        return false
      }
    }
    if(dates[1]){
      if(current.diff(dates[1],'day')>30){
        return true
      }
      else{
        return false
      }
    }
  };

  const rangePresets = [
    {
      label: "Last 12 hours",
      value: [dayjs().subtract(12, "h"), dayjs()],
    },
    {
      label: "Last 24 hours",
      value: [dayjs().add(-1, "d"), dayjs()],
    },
    {
      label: "Today",
      value: [dayjs().startOf("day"), dayjs()],
    },
    {
      label: "Last 7 Days",
      value: [dayjs().add(-7, "d"), dayjs()],
    },
    {
      label: "Last 14 Days",
      value: [dayjs().add(-14, "d"), dayjs()],
    },
    {
      label: "Last 30 Days",
      value: [dayjs().add(-30, "d"), dayjs()],
    },
  ];

  return (
    <Fragment>
      <Card sx={{ marginBottom: "15px" }}>
        <CardContent
          sx={{ padding: "0px 10px", paddingBottom: "0px !important" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                aria-label="breadcrumb"
              >
                {breadcrumbs}
              </Breadcrumbs>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
              {value == (actuators.length ? 4 : 3) ? (
                <div style={{ fontSize: "12px", color: "rgb(180,180,180)" }}>
                  Auto refresh in {minutes} minute(s)
                </div>
              ) : null}
              {value == (actuators.length ? 4 : 3) ? (
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "-5px",
                    alignItems: "center",
                  }}
                >
                  {/* <Tooltip
                    title={
                      cutoff
                        ? "Disable midnight cutoff"
                        : "Enable midnight cutoff"
                    }
                    placement="top"
                    arrow
                  >
                    <UpdateIcon
                      sx={{
                        color: cutoff ? "grey" : "lightgrey",
                        cursor: "pointer",
                        marginTop: "5px",
                      }}
                      onClick={() => setCutoff(!cutoff)}
                    />
                  </Tooltip> */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      height: "30px",
                      borderRadius: "10px",
                      width: "80px",
                      border: "1px solid lightgrey",
                      marginTop: "5px",
                    }}
                  >
                    <img
                      src={unit == "kWh" ? EnergyOn : EnergyOff}
                      style={{
                        width: "24px",
                        height: "20px",
                        marginTop: "4px",
                        marginRight: "8px",
                        borderRight: "1px solid lightgrey",
                        cursor: "pointer",
                      }}
                      onClick={() => setUnit("kWh")}
                    />
                    <img
                      src={unit == "$" ? DollarOn : DollarOff}
                      style={{
                        width: "26px",
                        height: "24px",
                        marginTop: "3px",
                        cursor: "pointer",
                      }}
                      onClick={() => setUnit("$")}
                    />
                  </div>
                </div>
              ) : null}
              {value == (actuators.length ? 4 : 3) ? (
                <div
                  style={{
                    display: "block",
                    height: "30px",
                    justifyContent: "center",
                    marginRight: "0px",
            
                  }}
                >
                  <RangePicker
                    onChange={(value, dateString) => {
                      handleDateChange(value, dateString);
                    }}
                    defaultValue={[
                      dayjs(dayjs(startDate), dateFormat),
                      dayjs(dayjs(endDate), dateFormat),
                    ]}
                    value={[
                      dayjs(dayjs(startDate), dateFormat),
                      dayjs(dayjs(endDate), dateFormat),
                    ]}
                    showTime
                    format={dateFormat}
                    disabledDate={disabledDate}
                    onOpenChange={onOpenChange}
                    onCalendarChange={(val) => {
                      setDates(val)}
                    }
                    changeOnBlur
                    presets={rangePresets}
                    size="small"
                    style={{width:"13.5vw",
                  }}

                  />
                </div>
              ) : null}
              <div>
                <Box
                  sx={{ width: "100%", display: "flex", justifyContent: "end" }}
                >
                  <Box
                    sx={{
                      borderBottom: 1,
                      borderColor: "divider",
                      border: "none",
                    }}
                  >
                    <Tabs
                      value={value}
                      onChange={handleChange}
                      aria-label="basic tabs example"
                    >
                      {actuators.length ? <Tab label="Automations" /> : null}
                      <Tab label="Rules" />
                      {metaDataValue.apps.some((app)=>app.name=="Alarms Management") &&<Tab label="Alarms" />}
                      <Tab label="Assets" />
                      <Tab label="Dashboard" />
                    </Tabs>
                  </Box>
                </Box>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Fragment>
  );
}
