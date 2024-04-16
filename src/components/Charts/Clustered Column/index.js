import React, { useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";

import * as am5plugins_exporting from "@amcharts/amcharts5/plugins/exporting";

var root;

function App(props) {
  useEffect(() => {
    console.log('clustered columnnnnnn',{props})
    root = am5.Root.new(props.name);

    root.numberFormatter.set("numberFormat", "#,###.00");

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/

    //---------------------------------------------------CHART LOGIC------------------------------------//
    var chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        background: am5.Rectangle.new(root, {
          fill: am5.color(0xffffff),
          fillOpacity: 1,
        }),
        // panX: false,
        // panY: false,
        // wheelX: "panX",
        layout: root.verticalLayout,
      })
    );

    // Add legend
    // https://www.amcharts.com/docs/v5/charts/xy-chart/legend-xy-series/
    var legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
      })
    );

    let data = !props.datapoints ? props.data : [];
    props.datapoints?.forEach((sensor) => {
      let obj = {};
      obj.groupName = sensor.friendlyName;
      props.data.forEach((group) => {
        if (group.hasOwnProperty(sensor.friendlyName))
          obj[group.groupName] = group[sensor.friendlyName];
      });
      data.push(obj);
    });

    var exporting = am5plugins_exporting.Exporting.new(root, {
      menu: am5plugins_exporting.ExportingMenu.new(root, {
        align: "left",
        // valign: "bottom",
      }),
      dataSource: data,
      filePrefix: "Group Analytics - Pre-canned Report",
    });

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    var xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "groupName",
        renderer: am5xy.AxisRendererX.new(root, {
          cellStartLocation: 0.1,
          cellEndLocation: 0.9,
        }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    xAxis.data.setAll(data);

    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    function makeSeries(name, fieldName) {
      var series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: name,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: fieldName,
          categoryXField: "groupName",
        })
      );

      series.columns.template.setAll({
        tooltipText: "{name}, {categoryX}: {valueY}",
        width: am5.percent(90),
        tooltipY: 0,
      });

      series.data.setAll(data);

      // Make stuff animate on load
      // https://www.amcharts.com/docs/v5/concepts/animations/
      series.appear();

      legend.data.push(series);
    }

    props.data.forEach((e) => makeSeries(e.groupName, e.groupName));

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    chart.appear(1000, 100);
    //---------------------------------------------------CHART LOGIC------------------------------------//
  }, [props.data]);

  useEffect(() => {
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
