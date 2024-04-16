import * as React from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Grid from "@mui/material/Grid";
import BoxPlot from "./Box Plot";
import ClusteredHorizontalBarChart from "./Clustered Horizontal Bar Chart";
import PreCannedReport from "./Clustered Bar Chart";
import { useSelector } from "react-redux";

export default function LabTabs(props) {
  const [value, setValue] = React.useState("1");
  const msg = {
    "1":
      "This report shows Aggregated statistics of all datapoints for a given Group hierarchy while clustering each top level group separately for comparative analysis. User can select Root group level to start the analysis from, the aggregation method, and timeframe.",
    "2":
      "This report shows a datapoints' Aggregated statistics for a given Group hierarchy while clustering atleast top 2 hierarchical group levels . User can select Root group level to start the analysis from, the datapoint & its aggregation method, and the timeframe.",
    "3":
      "This report shows a box plot chart aggregating a specific datapoint for a given group hierarchy clustered by top level of groups in that hierarchy. User can select Root group level to start analysis from, the datapoint and timeframe to load data from.",
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%", typography: "body1" }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Clustered Bar Chart" value="1" />
            <Tab label="Clustered Horizontal Bar Chart" value="2" />
            <Tab label="Box Plot Chart" value="3" />
          </TabList>
        </Box>
        <TabPanel value="1">
          <PreCannedReport
            permission={props.permission}
            services={props.services}
            hint={msg["1"]}
          />
        </TabPanel>
        <TabPanel value="2">
          <ClusteredHorizontalBarChart
            permission={props.permission}
            services={props.services}
            hint={msg["2"]}
          />
        </TabPanel>
        <TabPanel value="3">
          <BoxPlot
            permission={props.permission}
            services={props.services}
            hint={msg["3"]}
          />
        </TabPanel>
      </TabContext>
    </Box>
  );
}
