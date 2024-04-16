import React, { useRef, useLayoutEffect, useEffect } from "react";
import { useSelector } from "react-redux";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5exporting from "@amcharts/amcharts5/plugins/exporting";

import trendForecastConnector from "components/Freeform Analytics/Trend Forecasting/connector";
import freeformConnector from "components/Freeform Analytics/Freeform Chart/connector";
import { makeStyles } from "@mui/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileExcel,
  faFilePdf,
  faFileImage,
} from "@fortawesome/free-solid-svg-icons";
import EventEmitter from "eventemitter3";

const eventEmitter = new EventEmitter();

let opposite = false;
let loadedIndex;
let cleared = false;
const useStyles = makeStyles({
  button: {
    color: "#6d6d6d",
    width: "40px",
    height: "40px",
    cursor: "pointer",
    opacity: "1",
    "&:hover": {
      opacity: "0.8",
    },
    "&:active": {
      opacity: "1",
    },
  },
});

let chartData = {};
var root = {};
var chart = {};
var xAxis = {};
var yAxis;
var series;
var legend = {};
let lastData;
function App(props) {
  const classes = useStyles();
  const freeformChart = useSelector((state) => state.freeformChart);
  function chkIndex(arr, name) {
    let res = -1;
    arr.forEach((elm, i) => {
      if (elm == name) res = i;
    });
    return res;
  }

  // let exporting;
  let firstTime = true;
  // let datapoints = [];
  // const x = useRef(null);

  function createAxisAndSeries(
    name,
    data,
    opposite,
    type = undefined,
    i = undefined,
    deviceName = undefined
  ) {
    // if (type && type == "actual") {
    //   chart.series.clear();
    //   chart.yAxes.clear();
    // }
    var yRenderer = am5xy.AxisRendererY.new(root[props.name], {
      opposite: opposite,
    });
    yAxis = chart[props.name].yAxes.push(
      am5xy.ValueAxis.new(root[props.name], {
        // maxDeviation: 1,
        renderer: yRenderer,
      })
    );

    if (chart[props.name].yAxes.indexOf(yAxis) > 0) {
      yAxis.set("syncWithAxis", chart[props.name].yAxes.getIndex(0));
    }
    series = chart[props.name].series.push(
      am5xy[type && type == "actuator" ? "StepLineSeries" : "LineSeries"].new(
        root[props.name],
        {
          name: type
            ? type == "actual"
              ? `Actual - ${name} `
              : type == "prediction"
              ? `Prediction - ${name}`
              : deviceName ? `${deviceName} \n ${name}` : name
            : deviceName ? `${deviceName} \n ${name}` : name,
          xAxis: xAxis[props.name],
          yAxis: yAxis,
          valueYField: name,
          valueXField: "date",
          strokeDasharray: [3, 3],
          tooltip: am5.Tooltip.new(root[props.name], {
            pointerOrientation: "horizontal",
            labelText: "{valueY}",
          }),
        }
      )
    );

    series.id = name;

    //series.fills.template.setAll({ fillOpacity: 0.2, visible: true });
    series.strokes.template.setAll({
      strokeWidth: 3,
      strokeDasharray: type ? (type != "prediction" ? [0, 0] : [2, 2]) : null,
    });
    yRenderer.grid.template.set("strokeOpacity", 0.05);
    yRenderer.labels.template.set("fill", series.get("fill"));
    yRenderer.setAll({
      stroke: series.get("fill"),
      strokeOpacity: 1,
      opacity: 1,
    });

    // Set up data processor to parse string dates
    // https://www.amcharts.com/docs/v5/concepts/data/#Pre_processing_data
    series.data.processor = am5.DataProcessor.new(root[props.name], {
      dateFormat: "yyyy-MM-dd",
      dateFields: ["date"],
    });

    series.bullets.push(function () {
      return am5.Bullet.new(root[props.name], {
        locationY: 0,
        // sprite: am5.Circle.new(root[props.name], {
        //   radius: 4,
        //   stroke: root[props.name].interfaceColors.get("background"),
        //   strokeWidth: 4,
        //   fill: 'lightgrey',
        // }),
      });
    });

    let datapoints = [];
    let newChartData = [];
    if (chartData[props.name]?.data)
      newChartData = [...chartData[props.name].data, ...data];
    else newChartData = [...data];
    if (chartData[props.name]?.datapoints)
      datapoints = [...chartData[props.name].datapoints];
    // datapoints.push(name);
    datapoints.splice(i, 0, name);
    chartData[props.name] = { datapoints: datapoints, data: newChartData };
    newChartData.sort(function (a, b) {
      return b.date - a.date;
    });

    series.data.setAll(data);
    legend[props.name].data.setAll(chart[props.name].series.values);
  }

  useEffect(() => {
    root[props.name] = am5.Root.new(props.name);

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    // root[props.name].setThemes([am5themes_Animated.new(root[props.name])]);

    //---------------------------------------------------CHART[props.name] LOGIC------------------------------------//
    chart[props.name] = root[props.name].container.children.push(
      am5xy.XYChart.new(root[props.name], {
        focusable: true,
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
      })
    );

    var easing = am5.ease.linear;
    chart[props.name].get("colors").set("step", 3);

    xAxis[props.name] = chart[props.name].xAxes.push(
      am5xy.DateAxis.new(root[props.name], {
        tooltipDateFormat: "yyyy-MM-dd,hh:mm:ss a",
        groupData: false,
        baseInterval: {
          timeUnit: "second",
          count: 1,
        },
        renderer: am5xy.AxisRendererX.new(root[props.name], {}),
        tooltip: am5.Tooltip.new(root[props.name], {}),
      })
    );

    xAxis[props.name].get("dateFormats")["hour"] = "hh:mm a";
    xAxis[props.name].get("dateFormats")["second"] = "hh:mm:ss";
    xAxis[props.name].get("dateFormats")["minute"] = "hh:mm";

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart[props.name]/cursor/
    var cursor = chart[props.name].set(
      "cursor",
      am5xy.XYCursor.new(root[props.name], {
        xAxis: xAxis[props.name],
        behavior: "none",
      })
    );
    cursor.lineY.set("visible", false);

    // freeformConnector.on("deleteDatapoint", (payload) => {
    //   if (props.name == payload.name) {
    //     let tempData = [...chartData[props.name].data];
    //     let tempDatapoints = [...chartData[props.name].datapoints];
    //     tempDatapoints.splice(tempDatapoints.indexOf(payload.datapoint), 1);
    //     let i;
    //     for (i = tempData.length - 1; i >= 0; i -= 1) {
    //       if (tempData[i][payload.datapoint]) {
    //         tempData.splice(i, 1);
    //       }
    //     }
    //     chartData[props.name] = { data: tempData, datapoints: tempDatapoints };
    //     chart[props.name].series.removeIndex(payload.index).dispose();
    //     chart[props.name].yAxes.removeIndex(payload.index).dispose();
    //     legend[props.name].data.setAll(chart[props.name].series.values);
    //   }
    // });

    // freeformConnector.on("updateFreeform", (payload) => {
    //   if (props.name == payload.name) {
    //     let temp = [...payload.datapoints];
    //     let index = chkIndex(
    //       temp,
    //       payload.oldName != "" ? payload.oldName : payload.data.name
    //     );
    //     if (index != -1 && !firstTime) {
    //       let tempData = [...chartData[props.name].data];
    //       let tempDatapoints = [...chartData[props.name].datapoints];
    //       tempDatapoints.splice(tempDatapoints.indexOf(payload.oldName), 1);
    //       let i;
    //       for (i = tempData.length - 1; i >= 0; i -= 1) {
    //         if (tempData[i][payload.oldName]) {
    //           tempData.splice(i, 1);
    //         }
    //       }
    //       chartData[props.name] = {
    //         data: tempData,
    //         datapoints: tempDatapoints,
    //       };
    //       if (chart[props.name].series.hasIndex(index)) {
    //         chart[props.name].series.removeIndex(index).dispose();
    //         chart[props.name].yAxes.removeIndex(index).dispose();
    //       }
    //     }
    //     createAxisAndSeries(
    //       payload.data.name,
    //       payload.data.data,
    //       opposite,
    //       payload.type
    //     );
    //     opposite = !opposite;
    //     firstTime = false;
    //   }
    // });
    trendForecastConnector.on("updateFreeform", (payload) => {
      if (payload.firstTime) {
        chart[props.name].series.clear();
        chart[props.name].yAxes.clear();
        loadedIndex = null;
        firstTime = true;
        opposite = false;
        chartData = {};
      }
      if (props.name == payload.name) {
        let temp = [...payload.datapoints];
        createAxisAndSeries(
          payload.data.name,
          payload.data.data,
          opposite,
          payload.type
        );
        opposite = !opposite;
        firstTime = false;
      }
    });

    // Add legend[props.name]
    // https://www.amcharts.com/docs/v5/charts/xy-chart[props.name]/legend[props.name]-xy-series/
    legend[props.name] = chart[props.name].rightAxesContainer.children.push(
      am5.Legend.new(root[props.name], {
        // width: 200,
        paddingTop: 20,
        // height: am5.percent(100),
      })
    );

    // When legend item container is hovered, dim all the series except the hovered one
    legend[props.name].itemContainers.template.events.on(
      "pointerover",
      function (e) {
        var itemContainer = e.target;

        // As series list is data of a legend[props.name], dataContext is series
        var series = itemContainer.dataItem.dataContext;

        chart[props.name].series.each(function (chartSeries) {
          if (chartSeries != series) {
            chartSeries.strokes.template.setAll({
              strokeOpacity: 0.15,
              stroke: am5.color(0x000000),
            });
          } else {
            chartSeries.strokes.template.setAll({
              strokeWidth: 5,
            });
          }
        });
      }
    );

    // When legend[props.name] item container is unhovered, make all series as they are
    legend[props.name].itemContainers.template.events.on(
      "pointerout",
      function (e) {
        var itemContainer = e.target;
        var series = itemContainer.dataItem.dataContext;

        chart[props.name].series.each(function (chartSeries) {
          chartSeries.strokes.template.setAll({
            strokeOpacity: 1,
            strokeWidth: 3,
            stroke: chartSeries.get("fill"),
          });
        });
      }
    );

    legend[props.name].itemContainers.template.set("width", am5.p100);
    legend[props.name].valueLabels.template.setAll({
      width: am5.p100,
      textAlign: "right",
    });

    // It's is important to set legend[props.name] data after all the events are set on template, otherwise events won't be copied
    legend[props.name].data.setAll(chart[props.name].series.values);

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    chart[props.name].appear(1000, 100);

    // Generates random data, quite different range

    eventEmitter.on("download", (payload) => {
      let data = chartData[props.name]?.data;
      let dataFields = {};
      chartData[props.name].datapoints.forEach((elm) => {
        dataFields[elm] = elm;
      });
      dataFields.date = "date";

      let exporting = am5exporting.Exporting.new(root[props.name], {
        dataSource: data,
        dataFields: dataFields,
        dateFields: ["date"],
        dateFormat: "yyyy-MM-dd/hh:mm:ss",
        title: props.name,
        pdfOptions: {
          pageSize: "LETTER",
          pageOrientation: "landscape",
          pageMargins: [20, 20, 20, 20],
        },
      });

      exporting.download(payload);
    });

    //---------------------------------------------------CHART[props.name] LOGIC------------------------------------//
    return () => {
      root[props.name].dispose();
    };
  }, []);

  useEffect(() => {
    if (
      freeformChart &&
      freeformChart.length &&
      freeformChart.find((f) => f.name == props.name && f.change)
    ) {
      console.log({freeformChart})
      let payload = JSON.parse(
        JSON.stringify(freeformChart.find((f) => f.name == props.name))
      );
      if (
        lastData &&
        JSON.stringify(lastData) == JSON.stringify(payload.data) &&
        loadedIndex == payload.index
      ) {
        return;
      }
      if (!payload.delete) {
        if (payload.update && payload.data.name == payload.datapoints[0]) {
          chart[props.name].series.clear();
          chart[props.name].yAxes.clear();
          loadedIndex = null;
          firstTime = true;
          opposite = false;
        } else {
          if (loadedIndex == payload.index || loadedIndex > payload.index) {
            if (chart[props.name].series.hasIndex(payload.index)) {
              let tempData = [...chartData[props.name]?.data];
              let tempDatapoints = [...chartData[props.name]?.datapoints];
              let tempName = tempDatapoints[payload.index];
              tempDatapoints.splice(payload.index, 1);
              // tempDatapoints[payload.index] = payload.data.name;
              let i;
              for (i = tempData.length - 1; i >= 0; i -= 1) {
                if (tempData[i][tempName]) {
                  tempData.splice(i, 1);
                }
              }
              chartData[props.name] = {
                data: tempData,
                datapoints: tempDatapoints,
              };
              const tempIndex = chart[props.name].series._values.findIndex(
                (s) => s.id == tempName
              );
              chart[props.name].series.removeIndex(tempIndex).dispose();
              chart[props.name].yAxes.removeIndex(tempIndex).dispose();
            }
          } else {
            loadedIndex = loadedIndex != null ? loadedIndex + 1 : 0;
          }
        }
        createAxisAndSeries(
          payload.data.name,
          payload.data.data,
          opposite,
          payload.type,
          payload.index,
          payload.deviceName
        );
        opposite = !opposite;
        firstTime = false;
      } else {
        if (
          chartData[props.name] &&
          chartData[props.name].datapoints.includes(
            payload.datapoint?.datapoint || payload.datapoint?.actuator.name
          )
        ) {
          loadedIndex = loadedIndex - 1;
          let tempData = [...chartData[props.name]?.data];
          let tempDatapoints = [...chartData[props.name]?.datapoints];
          tempDatapoints.splice(
            tempDatapoints.indexOf(payload.datapoint?.name),
            1
          );
          let i;
          for (i = tempData.length - 1; i >= 0; i -= 1) {
            if (tempData[i][payload.datapoint?.name]) {
              tempData.splice(i, 1);
            }
          }
          chartData[props.name] = {
            data: tempData,
            datapoints: tempDatapoints,
          };
          chart[props.name].series.removeIndex(payload.index).dispose();
          chart[props.name].yAxes.removeIndex(payload.index).dispose();
          legend[props.name].data.setAll(chart[props.name].series.values);
        }
      }
      lastData = payload.data;
    }
  }, [freeformChart]);

  return (
    <div
      style={{
        overflow: "hidden",
        // paddingBottom: "56.25%",
        position: "relative",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "10px",
          zIndex: "1",
          position: "absolute",
          right: "10px",
          top: "0",
        }}
      >
        <FontAwesomeIcon
          icon={faFilePdf}
          size={10}
          style={{ height: 30, width: 30 }}
          onClick={() => eventEmitter.emit("download", "pdf")}
          className={classes.button}
        />
        <FontAwesomeIcon
          icon={faFileExcel}
          size={10}
          style={{ height: 30, width: 30 }}
          onClick={() => eventEmitter.emit("download", "xlsx")}
          className={classes.button}
        />
        <FontAwesomeIcon
          icon={faFileImage}
          size={10}
          style={{ height: 30, width: 30 }}
          onClick={() => eventEmitter.emit("download", "png")}
          className={classes.button}
        />
      </div>

      <div
        id={props.name}
        style={{
          position: "absolute",
          left: "0",
          top: "0",
          height: "100%",
          // maxHeight: "480px",
          width: "100%",
        }}
      ></div>
    </div>
  );
}
export default App;
