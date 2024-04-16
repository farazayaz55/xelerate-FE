import React, { useEffect, memo } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5plugins_exporting from "@amcharts/amcharts5/plugins/exporting";

var root;

function App(props) {
  useEffect(() => {
    let colorObj = {
      Critical: am5.color(0xbf3535),
      Major: am5.color(0x844204),
      Minor: am5.color(0xfe9f1b),
      Warning: am5.color(0x3399ff),
      Healthy: am5.color(0x5fb762),
      Active: am5.color(0x5fb762),
      Acknowledged: am5.color(0x3399ff),
      Clear: am5.color(0xbf3535),
    };
    // Create root element
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    root = am5.Root.new(props.name);

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([am5themes_Animated.new(root)]);

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    var chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        // wheelX: "panX",
        // wheelY: "zoomX",
        layout: root.verticalLayout,
      })
    );

    // Add scrollbar
    // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
    // chart.set("scrollbarX", am5.Scrollbar.new(root, {
    // orientation: "horizontal"
    // }));

    var data = props.data;
      console.log({data})
    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    var xRenderer = am5xy.AxisRendererX.new(root, {});
    var xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "time",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    xRenderer.grid.template.setAll({
      location: 1,
    });

    xAxis.data.setAll(data);

    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        renderer: am5xy.AxisRendererY.new(root, {
          strokeOpacity: 0.1,
        }),
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

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    function makeSeries(name, fieldName) {
      var series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: name,
          stacked: true,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: fieldName,
          categoryXField: "time",
          fill: am5.color(colorObj[name]),
        })
      );

      series.columns.template.setAll({
        tooltipText: "{name}, {categoryX}: {valueY}",
        tooltipY: am5.percent(10),
        maxWidth: 50,
      });
      series.data.setAll(data);

      // Make stuff animate on load
      // https://www.amcharts.com/docs/v5/concepts/animations/
      series.appear();

      // series.bullets.push(function() {
      //     return am5.Bullet.new(root, {
      //     sprite: am5.Label.new(root, {
      //         text: "{valueY}",
      //         fill: root.interfaceColors.get("alternativeText"),
      //         centerY: am5.p50,
      //         centerX: am5.p50,
      //         populateText: true
      //     })
      //     });
      // });

      legend.data.push(series);
    }

    makeSeries("Critical", "CRITICAL");
    makeSeries("Major", "MAJOR");
    makeSeries("Minor", "MINOR");
    makeSeries("Warning", "WARNING");
    // makeSeries("Healthy", "HEALTHY");

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  });

  // useEffect(() => {
  //   return () => {
  //     root.dispose();
  //   };
  // }, []);

  return (
    <div
      style={{
        overflow: "hidden",
        position: "relative",
        height: "90%",
      }}
    >
      <div
        id={props.name}
        style={{
          position: "absolute",
          left: "0",
          // top: '-60px',
          height: "100%",
          width: "100%",
        }}
      ></div>
    </div>
  );
}
export default memo(App);
