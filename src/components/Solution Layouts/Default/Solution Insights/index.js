import * as React from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
// import Grid from "@mui/material/Grid";
import Alarms from "./Alarms";
import Rules from "./Rules";
import Controls from "./Controls";
import { useSelector } from "react-redux";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import MoreTimeIcon from "@mui/icons-material/MoreTime";
import LaunchIcon from '@mui/icons-material/Launch';
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import HandymanIcon from "@mui/icons-material/Handyman";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import DoorbellIcon from '@mui/icons-material/Doorbell';
import { Button, Link, Tooltip, Zoom } from "@mui/material";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove'


export default function LabTabs(props) {
  console.log("Service", props.service)
  const history = useHistory()
  const metaDataValue = useSelector((state) => state.metaData);
  const [value, setValue] = React.useState(
    props.alarms ? "1" : props.rules ? "2" : props.controls ? "3" : ""
  );

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

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
        sx={{
          height: !props.fullScreenModeOpen ? "calc(100vh - 361px)" : "100%",
          position: "relative",
          minHeight: "300px",
          '@media (max-width: 1200px)':{
            width:!props.fullScreenModeOpen?'590px':'100%'
          },
          width:'100%'
        }}
      >
        <Box sx={{ width: "100%", typography: "body1" }}>
          <TabContext value={value}>
            <div style={{ display: "flex", gap: "10px", margin: "10px" }}>
              {[
                {
                  id: "1",
                  icon: NotificationsActiveIcon,
                  label: "Alarms",
                  permission: props.alarms,
                },
                {
                  id: "2",
                  icon: MoreTimeIcon,
                  label: "Rules",
                  permission: props.rules,
                },
                {
                  id: "3",
                  icon: ToggleOnIcon,
                  label: "Automations",
                  permission: props?.actuators?.length > 0 && props.controls,
                },
                // {
                //   id: "4",
                //   icon:  PlaylistRemoveIcon ,
                //   permission: true
                // },
              ].map((e, index) =>
                e.permission ? (
                  // e.id==4?
                  // <span style={{ position: "absolute", right: "15px"}} >
                  //   <Tooltip
                  //     title="Alarms Dashboard"
                  //     placement="bottom"
                  //     arrow
                  //     TransitionComponent={Zoom}>
                  // <Button startIcon={<e.icon />} onClick={() => {
                  //   // Use the history object to navigate to the new page with state
                  //   history.push('/alarms-dashboard', { selectedSolution: props.service });
                  // }} ></Button>
                  // </Tooltip>
                  // </span>
                  // :
                  <Chip
                    size="small"
                    label={e.label}
                    id={e.label}
                    icon={
                      <e.icon
                        fontSize="small"
                        style={{
                          marginLeft: "10px",
                          color:
                            value == e.id
                              ? "White"
                              : metaDataValue.branding.primaryColor,
                        }}
                      />
                    }
                    color="primary"
                    variant="outlined"
                    style={{
                      backgroundColor:
                        value == e.id
                          ? metaDataValue.branding.primaryColor
                          : "",
                      height: "30px",
                      borderRadius: "7px",
                      padding: "6px",
                      fontSize: "16px",
                      minWidth: "60px",
                      color:
                        value == e.id
                          ? "White"
                          : metaDataValue.branding.primaryColor,
                    }}
                    onClick={() => {
                      setValue(e.id);
                    }}
                    clickable
                  />
                ) : null
              )}
              {value == 1 ? (
                <span style={{ position: "absolute", top: "13px", right: "50px" }}>
                  <Tooltip
                    title="Alarms Management Utility"
                    TransitionComponent={Zoom}
                    arrow
                    placement="bottom"
                  >
                    <DoorbellIcon
                      color="primary"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        // Use the history object to navigate to the new page with state
                        history.push('/alarms-dashboard', { selectedSolution: props.service });
                      }}
                    />
                  </Tooltip>
                </span>
              ) : null}
              <span style={{ position: "absolute", top: "13px", right: "15px" }} >
                {props.fullScreenModeOpen ? (
                  <FullscreenExitIcon
                    style={{ cursor: "pointer" }}
                    onClick={() => props.setFullScreenModeOpen(false)}
                  />
                ) : (
                  <FullscreenIcon
                    style={{ cursor: "pointer" }}
                    onClick={() => props.setFullScreenModeOpen(true)}
                  />
                )}
              </span>
            </div>
            <Divider />
            <TabPanel value="1">
              <Alarms id={props.id} permission={props.alarms} fullScreenModeOpen={props.fullScreenModeOpen} setRefetch={props.setRefetch}/>
            </TabPanel>
            <TabPanel value="2">
              <Rules
                id={props.id}
                fields={props.sensors}
                permission={props.rules}
                controls={props.controls}
                fullScreenModeOpen={props.fullScreenModeOpen}
              />
            </TabPanel>
            <TabPanel value="3">
              <Controls
                id={props.id}
                actuators={props.actuators}
                permission={props.controls}
                fullScreenModeOpen={props.fullScreenModeOpen}
              />
            </TabPanel>


          </TabContext>
        </Box>
      </Card>
    </div>
  );
}
