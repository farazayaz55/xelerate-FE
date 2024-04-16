import React, { useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";

import * as am5plugins_exporting from "@amcharts/amcharts5/plugins/exporting";

var root;
var series;

function App(props) {
  useEffect(() => {
    if (props.data && series) series.data.setAll(props.data);
  }, [props.data]);

  useEffect(() => {
    root = am5.Root.new(props.name);

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/

    //---------------------------------------------------CHART LOGIC------------------------------------//
    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    var chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        // focusable: true,
        // panX: true,
        // panY: true,
        // wheelX: "panX",
        // wheelY: "zoomX",
      })
    );

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    var xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "day", count: 1 },
        renderer: am5xy.AxisRendererX.new(root, {}),
      })
    );

    let xRenderer = xAxis.get("renderer");
    xRenderer.labels.template.setAll({
      fill: am5.color(0xffffff),
    });

    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    var color = root.interfaceColors.get("background");

    var tooltip = am5.Tooltip.new(root, {
      pointerOrientation: "down",
      labelText:
        "[bold]{device}[/]\nHigh: {highValueY}\nClose: {valueY}\nMedian: {mediana}\nOpen: {openValueY}\nLow: {lowValueY}",
    });

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    series = chart.series.push(
      am5xy.CandlestickSeries.new(root, {
        fill: color,
        stroke: color,
        name: "MDXI",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "close",
        openValueYField: "open",
        lowValueYField: "low",
        highValueYField: "high",
        valueXField: "date",
        tooltip: tooltip,
      })
    );

    tooltip.get("background").setAll({
      stroke: am5.color(0x757575),
      strokeWidth: 2,
    });

    // mediana series
    var medianaSeries = chart.series.push(
      am5xy.StepLineSeries.new(root, {
        stroke: root.interfaceColors.get("background"),
        strokeWidth: 2,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "mediana",
        valueXField: "date",
        noRisers: true,
      })
    );

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    var cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        xAxis: xAxis,
      })
    );
    cursor.lineY.set("visible", false);

    var data = props.data;

    series.bullets.push(function (root) {
      return am5.Bullet.new(root, {
        locationX: 0.5,
        locationY: 0.5,
        sprite: am5.Label.new(root, {
          text: "{device}",
          centerX: am5.percent(50),
          centerY: am5.percent(50),
          populateText: true,
        }),
      });
    });

    series.data.processor = am5.DataProcessor.new(root, {
      dateFields: ["date"],
      dateFormat: "yyyy-MM-dd",
    });

    series.data.setAll(data);
    medianaSeries.data.setAll(data);

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    series.appear(1000, 100);
    medianaSeries.appear(1000, 100);
    chart.appear(1000, 100);

    var exporting = am5plugins_exporting.Exporting.new(root, {
      menu: am5plugins_exporting.ExportingMenu.new(root, {
        align: "left",
      }),
      dataSource: props.data,
      filePrefix: "Group Analytics - Box Plot",
    });

    return () => {
      root.dispose();
    };
  }, []);

  return (
    <div
      style={{
        overflow: "hidden",
        paddingBottom: "56.25%",
        position: "relative",
        height: "0",
      }}
    >
      <div
        id={props.name}
        style={{
          position: "absolute",
          left: "0",
          top: "3vh",
          height: "calc(100vh - 300px)",
          width: "100%",
        }}
      ></div>
    </div>
  );
}
export default App;
