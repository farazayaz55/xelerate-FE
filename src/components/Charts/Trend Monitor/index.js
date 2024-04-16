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

function App(props) {
  const metaDataValue = useSelector((state) => state.metaData);

  useEffect(() => {
    if (series?.data) {
      series.data.setAll(props.data);
      series.columns.template.adapters.add("fill", function (fill, target) {
        let sensor = props.dataPointThresholds.find(
          (g) => g.dataPoint?.name == props.dataPoint
        );
        return am5.color(
          sensor
            ? parseInt(
                `0x${getColor(target.dataItem.get("valueY"), sensor).substring(
                  1
                )}`
              )
            : parseInt(metaDataValue.branding.secondaryColor.replace("#", "0x"))
        );
      });
      if (props.data.length)
        eventEmitter.emit("updateTooltip", {
          value: props.data[0].value,
          unit: props?.unit?props.unit:"",
        });
    }
  }, [props.data]);

  function hasDecimal(num) {
    return num % 1 != 0;
  }

  function updateChart(payload) {
    series.data.removeIndex(0);
    series.data.push({
      date: new Date(payload.message.data[0].date).setSeconds(0),
      value: hasDecimal(payload.message.data[0].readingPerHour)
        ? parseFloat(payload.message.data[0].readingPerHour.toFixed(2))
        : payload.message.data[0].readingPerHour,
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

  useEffect(() => {
    var root = am5.Root.new(props.name);

    root.dateFormatter.set("dateFormat", "yyyy-MM-dd,hh:mm:ss a");

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/

    //---------------------------------------------------CHART LOGIC------------------------------------//

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
      })
    );

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    var cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        behavior: "zoomX",
      })
    );
    cursor.lineY.set("visible", false);

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    var xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        tooltipDateFormat: "yyyy-MM-dd,hh:00:00 a",
        maxDeviation: 0,
        baseInterval: {
          timeUnit: "hour",
          count: 1,
        },
        renderer: am5xy.AxisRendererX.new(root, {}),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    xAxis.get("dateFormats")["hour"] = "hh:mm a";
    xAxis.get("dateFormats")["second"] = "hh:mm:ss";
    xAxis.get("dateFormats")["minute"] = "hh:mm";

    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Series",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        fill: am5.color(0x000000),
        stroke: am5.color(0xffffff),
        tooltip: am5.Tooltip.new(root, {
          labelText: "{valueY}",
        }),
      })
    );

    series.columns.template.setAll({
      maxWidth: 50,
    });

    eventEmitter.on("updateTooltip", (props) => {
      let tooltip = am5.Tooltip.new(root, {
        autoTextColor: false,
        getFillFromSprite: false,
        labelText: `[bold]{valueY} ${props?.unit?props.unit:""}[/]`,
        pointerOrientation: props.value > 0 ? "down" : "up",
        fill: am5.color(0xffffff),
      });

      tooltip.label.setAll({
        fill: am5.color(0x000000),
      });

      tooltip.get("background").setAll({
        stroke: am5.color(0xeeeeee),
        strokeWidth: 3,
        fill: am5.color(0xffffff),
      });

      series.set("tooltip", tooltip);
    });

    let tooltip = am5.Tooltip.new(root, {
      autoTextColor: false,
      getFillFromSprite: false,
      labelText: `[bold]{valueY} ${props?.unit?props.unit:""}[/]`,
      pointerOrientation: props.data[0].value > 0 ? "down" : "up",
      fill: am5.color(0xffffff),
    });

    tooltip.label.setAll({
      fill: am5.color(0x000000),
    });

    tooltip.get("background").setAll({
      stroke: am5.color(0xeeeeee),
      strokeWidth: 3,
      fill: am5.color(0xffffff),
    });

    series.set("tooltip", tooltip);

    series.columns.template.adapters.add("fill", function (fill, target) {
      let sensor = props.dataPointThresholds.find(
        (g) => g.dataPoint?.name == props.dataPoint
      );
      return am5.color(
        sensor
          ? parseInt(
              `0x${getColor(target.dataItem.get("valueY"), sensor).substring(
                1
              )}`
            )
          : parseInt(metaDataValue.branding.secondaryColor.replace("#", "0x"))
      );
    });

    series.columns.template.setAll({ cornerRadiusTL: 5, cornerRadiusTR: 5 });

    series.data.setAll(props.data);

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    series.appear(1000);
    chart.appear(1000, 100);

    //---------------------------------------------------CHART LOGIC------------------------------------//
    return () => {
      eventEmitter.removeAllListeners("updateTooltip");
      root.dispose();
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
