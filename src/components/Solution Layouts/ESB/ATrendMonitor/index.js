import React, { useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";
import { useSelector } from "react-redux";
import EventEmitter from "eventemitter3";

const eventEmitter = new EventEmitter();

let chart;
let series;

function getColor(val, sensor) {
  let code = [...sensor.colorArray];
  if (sensor.reverse) code.reverse();
  let perc = ((sensor.min - val) / (sensor.min - sensor.max)) * 100;
  if (perc > 100) perc = 100;
  if (perc < 0) perc = 0;
  let range = Math.round(100 / code.length);
  let index = Math.trunc(perc / range);
  index = index >= code.length ? index - 1 : index;
  let res = code[index];
  return res.substring(1);
}

function App(props) {
  const metaDataValue = useSelector((state) => state.metaData);
  let color = parseInt(
    metaDataValue.branding.secondaryColor.replace("#", "0x")
  );

  useEffect(() => {
    if (series?.data) {
      series.data.setAll(props.data);
      series.columns.template.adapters.add("fill", function (fill, target) {
        let sensor = props.dataPointThresholds.find(
          (g) => g.dataPoint?.name == props.dataPoint
        );
        return am5.color(
          sensor
            ? parseInt(`0x${getColor(target.dataItem.get("valueY"), sensor)}`)
            : parseInt(metaDataValue.branding.secondaryColor.replace("#", "0x"))
        );
      });
      eventEmitter.emit("updateTooltip", props.unit);
    }
  }, [props.data]);

  useEffect(() => {
    var root = am5.Root.new(props.name);

    root.dateFormatter.set("dateFormat", "yyyy-MM-dd,hh:mm:ss a");

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([am5themes_Animated.new(root)]);

    root.dateFormatter.set("dateFormat", "yyyy-MM-dd,hh:mm:ss a");

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
        tooltipDateFormat: "yyyy-MM-dd,hh:mm:ss a",
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

    eventEmitter.on("updateTooltip", (payload) => {
      let tooltip = am5.Tooltip.new(root, {
        getFillFromSprite: true,
        getStrokeFromSprite: true,
        autoTextColor: false,
        getLabelFillFromSprite: true,
        labelText: `[bold]{valueY} ${payload}[/]`,
      });

      tooltip.get("background").setAll({
        fill: am5.color(color),
        fillOpacity: 0.1,
      });

      series.set("tooltip", tooltip);
    });

    let tooltip = am5.Tooltip.new(root, {
      getFillFromSprite: true,
      getStrokeFromSprite: true,
      autoTextColor: false,
      getLabelFillFromSprite: true,
      labelText: `[bold]{valueY} ${props.unit}[/]`,
    });

    tooltip.get("background").setAll({
      fill: am5.color(color),
      fillOpacity: 0.1,
    });

    series.set("tooltip", tooltip);

    series.columns.template.adapters.add("fill", function (fill, target) {
      let sensor = props.dataPointThresholds.find(
        (g) => g.dataPoint?.name == props.dataPoint
      );
      return am5.color(
        sensor
          ? parseInt(`0x${getColor(target.dataItem.get("valueY"), sensor)}`)
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
    };
  }, []);

  return (
    <div
      style={{
        overflow: "hidden",
        // paddingBottom: "56.25%",
        position: "relative",
        height: '100%'
        // height: "0",
      }}
    >
      <div
        id={props.name}
        style={{
          position: "absolute",
          left: "0",
          top: "0",
          height: "100%",
          width: "100%",
        }}
      ></div>
    </div>
  );
}
export default App;
