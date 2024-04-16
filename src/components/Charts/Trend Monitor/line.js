import React, { useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";

import * as am5xy from "@amcharts/amcharts5/xy";
import { useSelector } from "react-redux";
import EventEmitter from "eventemitter3";
import { getColor } from "Utilities/Color Spectrum";
import emitter from "Utilities/events";

const eventEmitter = new EventEmitter();

let chart;
let series;
let yAxis;
let root;

function App(props) {
  console.log({props})
  const metaDataValue = useSelector((state) => state.metaData);

  let color = parseInt(
    metaDataValue.branding.secondaryColor.replace("#", "0x")
  );

  function hasDecimal(num) {
    return num % 1 != 0;
  }

  function updateChart(payload) {
    let sensor = props.dataPointThresholds.find(
      (g) => g.dataPoint?.name == props.dataPoint
    );
    let value = hasDecimal(payload.message.data[0].readingPerHour)
      ? parseFloat(payload.message.data[0].readingPerHour.toFixed(2))
      : payload.message.data[0].readingPerHour;
    series.data.removeIndex(0);
    series.data.push({
      date: new Date(payload.message.data[0].date).setSeconds(0),
      value: value,
      bulletSettings: {
        fill: am5.color(
          sensor
            ? parseInt(`0x${getColor(value, sensor).substring(1)}`)
            : parseInt(metaDataValue.branding.secondaryColor.replace("#", "0x"))
        ),
      },
    });
  }

  function callbackfn(payload) {
    if (series?.data?._values.length) {
      let chk =
        new Date(
          series?.data?._values[series?.data?._values.length - 1].date
        ).getHours() < new Date(payload.message.data[0].date).getHours();
      if (chk) {
        updateChart(payload);
      }
    } else updateChart(payload);
  }

  useEffect(() => {
    emitter.on(`solution?analyticsAggregation-${props.dataPoint}`, callbackfn);
    return () => {
      emitter.off(
        `solution?analyticsAggregation-${props.dataPoint}`,
        callbackfn
      );
    };
  }, []);

  function getRanges() {
    let sensor = props.dataPointThresholds.find(
      (g) => g.dataPoint?.name == props.dataPoint
    );
    if (sensor) {
      let code = [...sensor.colorArray];
      if (sensor?.ranges && sensor?.ranges.length) {
        code.forEach((color, i) => {
          var rangeDataItem = yAxis.makeDataItem({
            value:
              i == 0
                ? Number.NEGATIVE_INFINITY
                : parseInt(sensor?.ranges[i].min),
            endValue:
              i == code.length - 1
                ? Number.POSITIVE_INFINITY
                : parseInt(sensor?.ranges[i + 1].min),
          });

          var range = series.createAxisRange(rangeDataItem);

          range.strokes.template.setAll({
            stroke: am5.color(parseInt(`0x${color.substring(1)}`)),
            strokeWidth: 2,
          });
        });
      } else {
        if (sensor.reverse) code.reverse();
        let factor = (sensor.max - sensor.min) / code.length;
        code.forEach((color, i) => {
          var rangeDataItem = yAxis.makeDataItem({
            value:
              i == 0
                ? Number.NEGATIVE_INFINITY
                : parseInt(sensor.min) + factor * i,
            endValue:
              i == code.length - 1
                ? Number.POSITIVE_INFINITY
                : parseInt(sensor.max) + factor * (i + 1),
          });

          var range = series.createAxisRange(rangeDataItem);

          range.strokes.template.setAll({
            stroke: am5.color(parseInt(`0x${color.substring(1)}`)),
            strokeWidth: 2,
          });
        });
      }
    }

    var bulletTemplate = am5.Template.new({
      fill: series.get("fill"),
    });

    series.bullets.push(function () {
      return am5.Bullet.new(root, {
        locationY: 0,
        locationX: 0,
        sprite: am5.Circle.new(
          root,
          {
            radius: 4,
            stroke: root.interfaceColors.get("background"),
            strokeWidth: 2,
            templateField: "bulletSettings",
          },
          bulletTemplate
        ),
      });
    });
  }

  useEffect(() => {
    if (series?.data) {
      getRanges();
      series.data.setAll(
        props.data.map((e) => {
          let sensor = props.dataPointThresholds.find(
            (g) => g.dataPoint?.name == props.dataPoint
          );
          return {
            ...e,
            bulletSettings: {
              fill: am5.color(
                sensor
                  ? parseInt(`0x${getColor(e.value, sensor).substring(1)}`)
                  : parseInt(
                      metaDataValue.branding.secondaryColor.replace("#", "0x")
                    )
              ),
            },
          };
        })
      );
      if (props.data.length)
        eventEmitter.emit("updateTooltip", {
          value: props.data[0].value,
          unit: props?.unit?props.unit:"",
        });
    }
  }, [props.data]);

  useEffect(() => {
    root = am5.Root.new(props.name);

    root.dateFormatter.set("dateFormat", "yyyy-MM-dd hh:mm:ss a");

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/

    //---------------------------------------------------CHART LOGIC------------------------------------//

    chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
      })
    );

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    var cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        behavior: "none",
      })
    );
    cursor.lineY.set("visible", false);

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    var xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        tooltipDateFormat: "yyyy-MM-dd,hh:00:00 a",
        maxDeviation: 0.5,
        baseInterval: {
          timeUnit: "hour",
          count: 1,
        },
        renderer: am5xy.AxisRendererX.new(root, {
          pan: "zoom",
        }),
        // tooltip: am5.Tooltip.new(root, {}),
      })
    );

    xAxis.get("dateFormats")["hour"] = "hh:mm a";
    xAxis.get("dateFormats")["second"] = "hh:mm:ss";
    xAxis.get("dateFormats")["minute"] = "hh:mm";

    yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        maxDeviation: 1,
        renderer: am5xy.AxisRendererY.new(root, {
          pan: "zoom",
        }),
      })
    );

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    series = chart.series.push(
      am5xy.SmoothedXLineSeries.new(root, {
        name: "Series",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        locationX: 0,
        locationY: 0
      })
    );

    eventEmitter.on("updateTooltip", (props) => {
      let tooltip = am5.Tooltip.new(root, {
        getFillFromSprite: false,
        labelText: `[bold]{date.formatDate()} - {valueY} ${props?.unit?props.unit:""}[/]`,
        pointerOrientation: props.value > 0 ? "down" : "up",
        fill: am5.color(0xffffff),
      });

      tooltip.get("background").setAll({
        stroke: am5.color(0xeeeeee),
        strokeWidth: 2,
        fill: am5.color(0xffffff),
      });

      series.set("tooltip", tooltip);
    });

    let tooltip = am5.Tooltip.new(root, {
      getFillFromSprite: false,
      labelText: `[bold]{date.formatDate()} - {valueY} ${props?.unit?props.unit:""}[/]`,
      pointerOrientation: props.data[0].value > 0 ? "down" : "up",
      fill: am5.color(0xffffff),
    });

    tooltip.get("background").setAll({
      stroke: am5.color(0xeeeeee),
      strokeWidth: 2,
      fill: am5.color(0xffffff),
    });
    
    series.set("tooltip", tooltip);

    // series.get("tooltip").label.adapters.add("text", function(text, target){
    //   text = ""
    //   text = target.dataItem.get("date")
    //   return text
    // })

    // Add scrollbar
    // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
    // chart.set(
    //   "scrollbarX",
    //   am5.Scrollbar.new(root, {
    //     orientation: "horizontal",
    //   })
    // );

    // var data = generateDatas(50);

    getRanges();

    series.data.setAll(
      props.data.map((e) => {
        let sensor = props.dataPointThresholds.find(
          (g) => g.dataPoint?.name == props.dataPoint
        );
        return {
          ...e,
          bulletSettings: {
            fill: am5.color(
              sensor
                ? parseInt(`0x${getColor(e.value, sensor).substring(1)}`)
                : parseInt(
                    metaDataValue.branding.secondaryColor.replace("#", "0x")
                  )
            ),
          },
        };
      })
    );

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    series.appear(1000);
    chart.appear(1000, 100);

    //---------------------------------------------------CHART LOGIC------------------------------------//
    return () => {
      eventEmitter.removeAllListeners("updateTooltip");
      root.dispose();
      chart = null;
      series = null;
      yAxis = null;
      root = null;
    };
  }, []);

  return (
    <div
      id={props.name}
      style={{
        height: props.height,
        width: "100%",
      }}
    ></div>
  );
}
export default App;
