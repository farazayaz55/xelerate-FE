import React, { useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5plugins_exporting from "@amcharts/amcharts5/plugins/exporting";

var root;
var seriesAdded = [];

function App(props) {
  useEffect(() => {
    // Create root element
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    var root = am5.Root.new(props.name);

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([am5themes_Animated.new(root)]);

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    var chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        layout: root.horizontalLayout,
        // width: am5.percent(props.fullScreen ? 104 : 106)
      })
    );

    // Add legend
    // https://www.amcharts.com/docs/v5/charts/xy-chart/legend-xy-series/
    var legend = chart.children.push(
      am5.Legend.new(root, {
        layout: root.verticalLayout,
        y: am5.percent(50),
        centerY: am5.percent(50),
        // x: am5.percent(props.fullScreen ? 93 : 90),
        height: am5.percent(100),
        maxHeight: 130,
        verticalScrollbar: am5.Scrollbar.new(root, {
          orientation: "vertical"
        })
      })
    );




    var data = props.data;

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    var xRenderer = am5xy.AxisRendererX.new(root, {
      cellStartLocation: 0.1,
      cellEndLocation: 0.9,
    });

    var xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "time",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
        visible: true
      })
    );

    xRenderer.grid.template.setAll({
      location: 1,
    });

    xRenderer.labels.template.setAll({
      fontSize: 11,
    });

    xAxis.data.setAll(data[Object.keys(data)[0]]);

    var yRenderer = am5xy.AxisRendererY.new(root, {
      strokeOpacity: 0.1,
    });

    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        renderer: yRenderer,
      })
    );

    yRenderer.labels.template.setAll({
      fontSize: 11,
    });

    function createRange(value, endValue, color) {
      var rangeDataItem = yAxis.makeDataItem({
        value: value,
        endValue: endValue
      });
      
      var range = yAxis.createAxisRange(rangeDataItem);
      
      if (endValue) {
        range.get("axisFill").setAll({
          fill: color,
          fillOpacity: 0.2
        });
        
        range.get("label").setAll({
          fill: am5.color(0xffffff),
          // text: value + "-" + endValue,
          location: 1,
          inside: true,
          centerX: 0,
          dx: 5,
          // background: am5.RoundedRectangle.new(root, {
          //   fill: color
          // })
        });
      }
      else {
        range.get("label").setAll({
          fill: am5.color(0xffffff),
          // text: value,
          inside: true,
          centerX: 0,
          dx: 5,
          // background: am5.RoundedRectangle.new(root, {
          //   fill: color
          // })
        });
      }
    
      range.get("grid").setAll({
        stroke: color,
        strokeOpacity: 1,
        strokeDasharray: [3,3],
        location: 1
      });
      
      range.get("label").adapters.add("x", (x, target)=>{
        return chart.plotContainer.width();
      });
    
      chart.plotContainer.onPrivate("width", ()=>{
        range.get("label").markDirtyPosition();
      });
      
    }

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    function makeSeries(name, fieldName, stacked, id) {
      var series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          stacked: stacked,
          name: name + " (" + (fieldName == "current" ? "C)" : "H)"),
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: fieldName,
          categoryXField: "time",
        })
      );

      series.columns.template.setAll({
        tooltipText: "{name}, {categoryX}:{valueY}",
        width: am5.percent(90),
        tooltipY: am5.percent(10),
        fontSize: 11,
      });
      series.data.setAll(data[name]);

      // Make stuff animate on load
      // https://www.amcharts.com/docs/v5/concepts/animations/
      series.appear();

      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          locationY: 0.5,
          // sprite: am5.Label.new(root, {
          //   text: "{valueY}",
          //   fill: root.interfaceColors.get("alternativeText"),
          //   centerY: am5.percent(50),
          //   centerX: am5.percent(50),
          //   populateText: true
          // })
        });
      });
      legend.labels.template.setAll({
        fontSize: 11,
        width:20
      });
      legend.data.push(series);
    }

    // makeSeries("Fortune Tower", "europe", false);
    // makeSeries("Dolmen Towers", "namerica", true);

    Object.keys(props.data).forEach((d, i) => {
      makeSeries(d, "historic", !i ? false : true);
    });
    Object.keys(props.data).forEach((d, i) => {
      makeSeries(d, "current", !i ? false : true);
    });

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    chart.appear(1000, 100);

    createRange(props.target, undefined, 'red');

    // end am5.ready()
    return () => {
      seriesAdded = [];
      root?.dispose();
    };
  }, [props]);

  return (
    <div
      style={{
        overflow: "hidden",
        position: "relative",
        height: props.fullScreen ? "100%" : "90%",
      }}
    >
      <div
        id={props.name}
        style={{
          position: "absolute",
          left: "0",
          // top: '-60px',
          height: props.fullScreen ? "100%" : "20vh",
          width: !props.fullScreen ? "103%" : "101%",
        }}
      ></div>
    </div>
  );
}
export default App;
