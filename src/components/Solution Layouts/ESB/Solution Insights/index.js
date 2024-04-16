import * as React from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
// import Grid from "@mui/material/Grid";
import Alarms from "./Alarms";
import Rules from "./Rules";
import Controls from "./Controls";
import { useSelector } from "react-redux";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import MoreTimeIcon from "@mui/icons-material/MoreTime";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import HandymanIcon from "@mui/icons-material/Handyman";
import {
  setMapPage,
  setListPage,
  setLiveArr,
  setView,
} from "rtkSlices/AssetViewSlice";
import { resetFilter } from "rtkSlices/filterDevicesSlice";

export default function LabTabs(props) {
  const [value, setValue] = React.useState(
    props.alarms ? "1" : props.rules ? "2" : props.controls ? "3" : ""
  );

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  useEffect(() => {
    return () => {
      dispatch(setMapPage(1));
      dispatch(setListPage(1));
      dispatch(resetFilter());
    };
  }, []);
  function GetIcon(value) {
    switch (value) {
      case "1":
        return <NotificationsActiveIcon style={{ color: "#bfbec8" }} />;

      case "2":
        return <HandymanIcon style={{ color: "#bfbec8" }} />;

      case "3":
        return <MoreTimeIcon style={{ color: "#bfbec8" }} />;

      case "4":
        return <ToggleOnIcon style={{ color: "#bfbec8" }} />;

      default:
        break;
    }
  }

  return (
    <div>
      <Card
        style={{
          minHeight: "520px",
          // height: "calc(100vh - 350px)",
          position: "relative",
        }}
      >
        <div
          style={{
            padding: "10px",
            position: "absolute",
            top: "2px",
            right: "2px",
          }}
        >
          {GetIcon(value)}
        </div>
        <Box sx={{ width: "100%", typography: "body1" }}>
          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList
                onChange={handleChange}
                aria-label="lab API tabs example"
              >
                {props.alarms ? <Tab label="Alarms" value="1" /> : null}
                {/* {props.rules ? <Tab label="Rules" value="2" /> : null} */}
                {/* {props?.actuators?.length > 0 && props.controls ? (
                  <Tab label="Automations" value="3" />
                ) : null} */}
              </TabList>
            </Box>
            <TabPanel value="1">
              <Alarms
                id={props.id}
                permission={props.alarms}
                groupId={props.groupId}
              />
            </TabPanel>
            <TabPanel value="2">
              <Rules
                id={props.id}
                fields={props.sensors}
                permission={props.rules}
                controls={props.controls}
              />
            </TabPanel>
            <TabPanel value="3">
              <Controls
                id={props.id}
                actuators={props.actuators}
                permission={props.controls}
                controls={props.controls}
              />
            </TabPanel>
          </TabContext>
        </Box>
      </Card>
    </div>
  );
}
