import React, { Fragment, useEffect } from "react";
import Power from "./Widgets/power";
import Thermostat from "./Widgets/thermostat";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
import Touch from "./Widgets/touch";
import Text from "./Widgets/text";
import Numeric from "./Widgets/numeric";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import AvTimerIcon from "@mui/icons-material/AvTimer";
import Fab from "@mui/material/Fab";
import Drawer from "@mui/material/Drawer";
import { controllingSocket, getSocket, eventsSocket } from "Utilities/socket";
import Scheduler from "./Scheduler";
import Operations from "./Operations";
import { useSelector } from "react-redux";
import Dragable from "components/Dragable";
import emitter from "Utilities/events";


let socketInst;

export default function DashboardWidgets(props) {
  console.log(props)
  const device = useSelector((state) => state.asset.device);
  const metaDataValue = useSelector((state) => state.metaData);
  const service = metaDataValue.services.find((s) => s.id == props.service);
  const [drawer, setDrawer] = React.useState(false);
  const [socket, setSocket] = React.useState(null);
  const checkEsbMetaData = () => {
    if (
      service.esbMetaData &&
      service.esbMetaData.actuators &&
      service.esbMetaData.actuators.length
    ) {
      if (
        service.esbMetaData.actuators.length === 1 &&
        service.esbMetaData.actuators[0] === ""
      ) {
        return false;
      }
      return true;
    }
    return false;
  };
  const asset = device.platformDeviceType && service.assetMapping.length ? service.assetMapping.find(a => a.assetType._id == device.platformDeviceType) : null;
  const actuators = props.digitalTwin ? props.actuators : (checkEsbMetaData()
    ? props.actuators.filter((s) =>
      service.esbMetaData.actuators.includes(s.name)
    )
    :
    asset && asset.actuators ? asset.actuators.filter((actuator) => actuator.config == props.config) :
      props.actuators);
  const [store, setStore] = React.useState(initializeStore(props?.actuators));
  const [value, setValue] = React.useState("1");
  function chkGroup() {
    let permission = metaDataValue.services
      .find((s) => s.id == props.service)
      .tabs.find((tab) => tab.name == "Controlling")?.permission;
    return permission || "DISABLE";
  }
  function initializeStore(data) {
    let store = {};
    data.forEach((elm) => {
      store[elm.name] = null;
    });
    return store;
  }

  useEffect(() => {
    console.log("Checking Actuators")
    console.log({ props })
    console.log(checkEsbMetaData())
    console.log({ asset })
  }, [props])

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const toggleDrawer = () => {
    setDrawer(!drawer);
  };

  function switcher(actuator, id, data) {
    switch (actuator.type) {
      case "power":
        return (
          <Power
            actuator={actuator}
            id={id}
            socket={socket}
            service={props.service}
            data={data}
            connectivity={
              device?.packetFromPlatform?.c8y_Availability?.status == "AVAILABLE"
            }
            permission={chkGroup()}
          />
        );

      case "thermostat":
        return (
          <Thermostat
            actuator={actuator}
            id={id}
            socket={socket}
            service={props.service}
            data={data}
            connectivity={
              device?.packetFromPlatform?.c8y_Availability?.status == "AVAILABLE"
            }
            permission={chkGroup()}
          />
        );

      case "touch":
        return (
          <Touch
            actuator={actuator}
            id={id}
            socket={socket}
            service={props.service}
            data={data}
            connectivity={
              device?.packetFromPlatform?.c8y_Availability?.status == "AVAILABLE"
            }
            permission={chkGroup()}
          />
        );

      case "text":
        return (
          <Text
            actuator={actuator}
            id={id}
            socket={socket}
            service={props.service}
            data={data}
            connectivity={
              device?.packetFromPlatform?.c8y_Availability?.status == "AVAILABLE"
            }
            permission={chkGroup()}
          />
        );

      case "numeric":
        return (
          <Numeric
            actuator={actuator}
            id={id}
            socket={socket}
            service={props.service}
            data={data}
            connectivity={
              device?.packetFromPlatform?.c8y_Availability?.status == "AVAILABLE"
            }
            permission={chkGroup()}
          />
        );

      default:
        return null;
    }
  }

  function callbackfn(payload) {
    console.log("CONTROL UPDATE EVENT RECIEVED")
    console.log({ payload })
    setStore((old) => {
      let temp = { ...old };
      if (
        (temp[payload.message.metaData.actuatorName]?.metaData?.status ==
          "SUCCESSFUL" &&
          payload.message.metaData?.operationId &&
          temp[payload.message.metaData.actuatorName]?.metaData?.operationId &&
          payload.message.metaData?.operationId ==
          temp[payload.message.metaData.actuatorName]?.metaData
            ?.operationId) ||
        (temp[payload.message.metaData.actuatorName]?.metaData?.status ==
          "EXECUTING" &&
          payload.message?.metaData?.status == "PENDING" &&
          payload.message.metaData?.operationId &&
          temp[payload.message.metaData.actuatorName]?.metaData?.operationId &&
          payload.message?.metaData?.operationId ==
          temp[payload.message.metaData.actuatorName]?.metaData?.operationId)
      ) {
      } else {
        temp[payload.message.metaData.actuatorName] = payload.message;
      }
      return temp;
    });
  }

  async function initializeSocket(topics) {
    await getSocket(topics);
    emitter.on("asset?events-c8y_ControlUpdate", callbackfn);
    socketInst = await controllingSocket();
    setSocket(socketInst);
  }

  useEffect(() => {
    initializeSocket([
      `devices__${props.service}__${props.id}`,
      `events-c8y_ControlUpdate__${props.service}__${props.id}`,
    ]);
    return () => {
      socketInst.disconnect();
      emitter.off("asset?events-c8y_ControlUpdate", callbackfn);
    };
  }, []);

  return (
    <div
      id='controlling-div'
      style={
        props.full
          ? { paddingRight: "10px" }
          : {
            // height: 'calc(100vh - 238px)',
            // minHeight: 'calc(100vh - 300px)',
            // overflowY: !props.digitalTwin && "scroll",
            paddingRight: !props.digitalTwin && "10px",
          }
      }
    >
      <Drawer anchor={"right"} open={drawer} onClose={toggleDrawer}>
        <div style={{ margin: "20px 20px 10px 20px", overflow: "hidden" }}>
          <Box sx={{ width: "100%", typography: "body1" }}>
            <TabContext value={value}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <TabList
                  onChange={handleChange}
                  aria-label="lab API tabs example"
                >
                  <Tab
                    label="History"
                    value="1"
                    id="History"
                    aria-label="History"
                  />
                  <Tab
                    label="Automations"
                    value="2"
                    id="Automations"
                    aria-label="Automations"
                  />
                </TabList>
              </Box>
              <TabPanel value="1">
                <Operations
                  actuators={actuators}
                  id={props.id}
                  permission={props.permission}
                  service={props.service}
                />
              </TabPanel>
              <TabPanel value="2">
                <Scheduler
                  actuators={actuators}
                  id={props.id}
                  permission={props.permission}
                  service={props.service}
                />
              </TabPanel>
            </TabContext>
          </Box>
        </div>
      </Drawer>
      {!props.digitalTwin ? (
        <Dragable bottom={"30px"} right={"30px"} name="add-operations">
          <Tooltip
            title="Operations"
            placement="left"
            arrow
            TransitionComponent={Zoom}
          >
            <Fab
              style={{ boxShadow: "none" }}
              color="secondary"
              onClick={toggleDrawer}
              id="Operations"
            >
              <AvTimerIcon />
            </Fab>
          </Tooltip>
        </Dragable>
      ) : null}
      <Grid
        sx={{
          margin: props.digitalTwin && "0px",
          width: props.digitalTwin && "100%",
        }}
        container
        spacing={2}
      >
        {actuators.map((elm, i) => {
          {
            return !props.digitalTwin ? (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                style={{ marginBottom: "20px", width: "100%" }}
                key={i}
              >
                <Card
                  style={{
                    borderRadius: "10px",
                    maxHeight: "250px",
                    minHeight: "250px",
                    width: "100%",
                  }}
                >
                  {switcher(elm, props.id, store[elm.name])}
                </Card>
              </Grid>
            ) : (
              <Card
                style={{
                  borderRadius: "10px",
                  maxHeight: "250px",
                  minHeight: "250px",
                  width: "100%",
                }}
              >
                {switcher(elm, props.id, store[elm.name])}
              </Card>
            );
          }
        })}
      </Grid>
    </div>
  );
}
