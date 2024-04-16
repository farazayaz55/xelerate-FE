import * as React from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Grid from "@mui/material/Grid";
import Analytics from "./Streaming Analytics";
import Freeform from "components/Freeform Analytics";
import { useSelector } from "react-redux";

export default function LabTabs(props) {
  const [value, setValue] = React.useState("1");
  const device = useSelector((state) => state.asset.device);
  const metaData = useSelector((state) => state.metaData);
  let service = metaData.services.find(s=>s.id == props.group)
  const asset = device.platformDeviceType && service.assetMapping.length ? service.assetMapping.find(a=>a.assetType._id == device.platformDeviceType) : null;
  const sensors = service.esbMetaData && service.esbMetaData.datapoints && service.esbMetaData.datapoints.length ? props.sensors.filter(s=>service.esbMetaData.datapoints.includes(s.name)) : asset && asset.sensors ? asset.sensors.filter((sensor) => !sensor.config) : props.sensors
  const [services, setServices] = React.useState(metaData.services || []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  function StreamingAnalytics() {
    return (
      <Grid container spacing={2}>
        {sensors.map((e) => {
          return (
            <Grid item xs={12} sm={12} md={6}>
              <Analytics value={e.name} name={e.friendlyName} id={props.id} />
            </Grid>
          );
        })}
      </Grid>
    );
  }

  return (
    <Box sx={{ width: "100%", typography: "body1" }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Streaming Analytics" value="1" />
            <Tab label="Self-Service Analytics" value="2" />
          </TabList>
        </Box>
        <TabPanel value="1">
          <div
            style={{
              maxHeight: "calc(100vh - 313px)",
              overflowY: "scroll",
              paddingRight: "10px",
              paddingBottom: "10px",
            }}
          >
            {StreamingAnalytics()}
          </div>
        </TabPanel>
        <TabPanel value="2">
          <Freeform assetView services={services} group={props.group} service={service} deviceId={props.id} />
        </TabPanel>
      </TabContext>
    </Box>
  );
}
