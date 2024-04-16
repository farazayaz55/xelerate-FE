import React, { useRef, useLayoutEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

function ClusteredColumnChart(props) {
  useLayoutEffect(() => {
    console.log('clustered columnnnnnn',{props})
    // Create root element
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    var root = am5.Root.new(props.name);


    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([
      am5themes_Animated.new(root)
    ]);


    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    var chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "panX",
      wheelY: "zoomX",
      layout: root.horizontalLayout,
    }));




    // Add legend
    // https://www.amcharts.com/docs/v5/charts/xy-chart/legend-xy-series/
    var legend = chart.children.push(
      am5.Legend.new(root, {
        // // centerY: am5.p50,
        // y: am5.percent(50),
        // // centerX: am5.percent(50),
        // x: am5.percent(70),
        marginRight: 20,
        layout: root.verticalLayout
      })
    );


    var data = props.datapoints ? props.datapoints : []


    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    var xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      categoryField: "day",
      renderer: am5xy.AxisRendererX.new(root, {
        cellStartLocation: 0.1,
        cellEndLocation: 0.9
      }),
      tooltip: am5.Tooltip.new(root, {})
    }));

    xAxis.data.setAll(data);

    var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {})
    }));


    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    function makeSeries(name, fieldName) {
      var series = chart.series.push(am5xy.ColumnSeries.new(root, {
        name: name,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: fieldName,
        categoryXField: "day",

      }));

      series.columns.template.setAll({
        tooltipText: "{name}, {categoryX}:{valueY}",
        width: am5.percent(90),
        tooltipY: 0,
      });

      series.data.setAll(data);

      // Make stuff animate on load
      // https://www.amcharts.com/docs/v5/concepts/animations/
      series.appear();

      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          locationY: 0,
          sprite: am5.Label.new(root, {
            text: "{valueY}",
            fill: root.interfaceColors.get("alternativeText"),
            centerY: 0,
            centerX: am5.p50,
            populateText: true,
          })
        });
      });

      legend.data.push(series);
    }

    makeSeries("Dispatch", "W");
    makeSeries("Installed", "WRtg");


    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    // chart.appear(1000, 100);

    //---------------------------------------------------CHART LOGIC------------------------------------//
  }, []);

  return (
    <div
      style={{
        overflow: "hidden",
        // paddingBottom: "56.25%",
        position: "relative",
        height: "165px",

      }}
    >
      <div
        id={props.name}
        style={{
          // position: "absolute",
          // left: "0",
          // top: "0",
          height: "100%",
          maxHeight: "500px",
          ...props.style
        }}
      ></div>
    </div>
  );
}
export default ClusteredColumnChart;
