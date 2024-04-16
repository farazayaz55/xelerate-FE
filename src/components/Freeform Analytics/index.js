import React, { Fragment, useEffect, useRef } from "react";
import { makeStyles } from "@mui/styles";
import Chart from "./Freeform Chart/index";
import TrendforecastChart from "./Trend Forecasting/index";
import AddIcon from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";
import Dragable from "components/Dragable";

export default function VideoAnalytics(props) {
  const [charts, setCharts] = React.useState([
    props.predictive ? "Trend Forecast" : "Self-Service Chart",
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    // messagesEndRef.current.scrollIntoView();
  };

  useEffect(() => {
    scrollToBottom();
  }, [charts]);

  function handleDelete(i) {
    let old = [...charts];
    old.splice(i, 1);
    setCharts(old);
  }

  function addChart() {
    let old = [...charts];
    if (old.indexOf("Self-Service Chart") == -1) old.push("Self-Service Chart");
    else {
      let i = 1;
      while (old.indexOf(`Self-Service Chart ${i}`) != -1) {
        i++;
      }
      old.push(`Self-Service Chart ${i}`);
    }
    setCharts(old);
    setTimeout(() => {
      document.getElementById("analytics-chart").scrollTop = document.getElementById("analytics-chart").scrollHeight
    }, 0);
  }

  return (
    <Fragment>
      {!props.predictive ? (
        <Dragable bottom={"30px"} right={"30px"} name="ff-add">
          <Fab
            style={{ boxShadow: "none" }}
            color="secondary"
            // style={{
            //   position: "fixed",
            //   bottom: "30px",
            //   right: "30px",
            //   zIndex: 20,
            // }}
            onClick={addChart}
          >
            <AddIcon />
          </Fab>
        </Dragable>
      ) : null}
      <div id="analytics-chart" style={{overflow:'scroll',height: props.assetView ? 'calc(100vh - 300px)' : 'calc(100vh - 100px)'}}>
        {!props.predictive ? (
          charts.map((elm, i) => {
            return (
              <Chart
                assetView={props.assetView}
                predictive={props.predictive}
                key={i}
                services={props.services}
                name={elm}
                length={charts.length}
                handleDelete={() => handleDelete(i)}
                group={props.group}
                deviceId={props.deviceId}
                service={props.service}
              />
            );
          })
        ) : (
          <TrendforecastChart
            name="TrendForecast"
            predictive={props.predictive}
            services={props.services}
          />
        )}
      </div>
      <div ref={messagesEndRef} />
    </Fragment>
  );
}
