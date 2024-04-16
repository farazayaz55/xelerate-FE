import React, { useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";

let chart = {};
let xAxis = {};
let yAxis = {};
let root = {};
let legend = {};

function App(props) {
  const labelsObj = {
    min: "Min",
    max: "Max",
    mean: "Mean",
    stDivPositive: "Dev +",
    stDivNegative: "Dev -",
  };

  useEffect(() => {
    if (chart[props.name]) {
      while (chart[props.name].series._values.length > 0) {
        chart[props.name].series
          .removeIndex(chart[props.name].series._values.length - 1)
          .dispose();
      }
      Object.keys(props.data).forEach((elm) => {
        var series = chart[props.name].series.push(
          am5xy.LineSeries.new(root[props.name], {
            name: labelsObj[elm],
            xAxis: xAxis[props.name],
            yAxis: yAxis[props.name],
            valueYField: "value",
            valueXField: "date",
            legendValueText: "",
            tooltip: am5.Tooltip.new(root[props.name], {
              pointerOrientation: "horizontal",
              labelText: "{valueY}",
            }),
          })
        );
        series.data.setAll(props.data[elm]);
        series.appear();
        legend[props.name].data.setAll(chart[props.name].series.values);
      });
    }
  }, [props.data]);

  useEffect(() => {
    root[props.name] = am5.Root.new(props.name);

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    // root[props.name].setThemes([am5themes_Animated.new(root[props.name])]);

    //---------------------------------------------------CHART LOGIC------------------------------------//
    chart[props.name] = root[props.name].container.children.push(
      am5xy.XYChart.new(root[props.name], {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        maxTooltipDistance: 0,
        pinchZoomX: true,
      })
    );

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    xAxis[props.name] = chart[props.name].xAxes.push(
      am5xy.DateAxis.new(root[props.name], {
        tooltipDateFormat: "yyyy-MM-dd,hh:mm:ss a",
        maxDeviation: 0.2,
        baseInterval: {
          timeUnit: "hour",
          count: 1,
        },
        renderer: am5xy.AxisRendererX.new(root[props.name], {}),
        tooltip: am5.Tooltip.new(root[props.name], {}),
      })
    );

    xAxis[props.name].get("dateFormats")["hour"] = "hh:mm a";
    xAxis[props.name].get("dateFormats")["second"] = "hh:mm:ss";
    xAxis[props.name].get("dateFormats")["minute"] = "hh:mm";

    yAxis[props.name] = chart[props.name].yAxes.push(
      am5xy.ValueAxis.new(root[props.name], {
        renderer: am5xy.AxisRendererY.new(root[props.name], {}),
      })
    );

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    // Object.keys(props.data).forEach((elm) => {
    //   var series = chart[props.name].series.push(
    //     am5xy.LineSeries.new(root[props.name], {
    //       name: elm,
    //       xAxis: xAxis[props.name],
    //       yAxis: yAxis[props.name],
    //       valueYField: "value",
    //       valueXField: "date",
    //       legendValueText: "{valueY}",
    //       tooltip: am5.Tooltip.new(root[props.name], {
    //         pointerOrientation: "horizontal",
    //         labelText: "{valueY}",
    //       }),
    //     })
    //   );
    // });

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    var cursor = chart[props.name].set(
      "cursor",
      am5xy.XYCursor.new(root[props.name], {
        behavior: "none",
      })
    );
    cursor.lineY.set("visible", false);

    // Add legend
    // https://www.amcharts.com/docs/v5/charts/xy-chart/legend-xy-series/
    legend[props.name] = chart[props.name].rightAxesContainer.children.push(
      am5.Legend.new(root[props.name], {
        width: 85,
        paddingLeft: 15,
        paddingTop: 40,
        height: am5.percent(100),
      })
    );

    // When legend item container is hovered, dim all the series except the hovered one
    legend[props.name].itemContainers.template.events.on(
      "pointerover",
      function (e) {
        var itemContainer = e.target;

        // As series list is data of a legend, dataContext is series
        var series = itemContainer.dataItem.dataContext;

        chart[props.name].series.each(function (chartSeries) {
          if (chartSeries != series) {
            chartSeries.strokes.template.setAll({
              strokeOpacity: 0.15,
              stroke: am5.color(0x000000),
            });
          } else {
            chartSeries.strokes.template.setAll({
              strokeWidth: 3,
            });
          }
        });
      }
    );

    // When legend item container is unhovered, make all series as they are
    legend[props.name].itemContainers.template.events.on(
      "pointerout",
      function (e) {
        var itemContainer = e.target;
        var series = itemContainer.dataItem.dataContext;

        chart[props.name].series.each(function (chartSeries) {
          chartSeries.strokes.template.setAll({
            strokeOpacity: 1,
            strokeWidth: 1,
            stroke: chartSeries.get("fill"),
          });
        });
      }
    );

    legend[props.name].itemContainers.template.set("width", am5.p100);
    legend[props.name].valueLabels.template.setAll({
      width: am5.p100,
      textAlign: "right",
      value: "",
    });

    // It's is important to set legend data after all the events are set on template, otherwise events won't be copied
    legend[props.name].data.setAll(chart[props.name].series.values);

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    chart[props.name].appear(1000, 100);

    //---------------------------------------------------CHART LOGIC------------------------------------//

    return () => {
      root[props.name].dispose();
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
          top: "0",
          height: "100%",
          maxHeight: "300px",
          width: "100%",
        }}
      ></div>
    </div>
  );
}
export default App;
