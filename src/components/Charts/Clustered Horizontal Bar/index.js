import React, { useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";

import * as am5plugins_exporting from "@amcharts/amcharts5/plugins/exporting";

let temp = "";
let index = 0;
var root;

function App(props) {
  useEffect(() => {
    root = am5.Root.new(props.name);

    root.numberFormatter.set("numberFormat", "#,###.00");

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/

    //---------------------------------------------------CHART LOGIC------------------------------------//
    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    var chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        // panX: false,
        // panY: false,
        // wheelX: "none",
        // wheelY: "none",
        layout: root.horizontalLayout,
        background: am5.Rectangle.new(root, {
          fill: am5.color(0xffffff),
          fillOpacity: 1,
        }),
      })
    );

    // Add legend
    // https://www.amcharts.com/docs/v5/charts/xy-chart/legend-xy-series/
    // var legendData = [];
    // var legend = chart.children.push(
    //   am5.Legend.new(root, {
    //     nameField: "name",
    //     fillField: "color",
    //     strokeField: "color",
    //     //centerY: am5.p50,
    //     marginLeft: 20,
    //     y: 20,
    //     layout: root.verticalLayout,
    //     clickTarget: "none",
    //   })
    // );

    var exporting = am5plugins_exporting.Exporting.new(root, {
      menu: am5plugins_exporting.ExportingMenu.new(root, {
        align: "left",
        // valign: "bottom",
      }),
      dataSource: props.data,
      filePrefix: "Group Analytics - Clustered Horizontal Bar",
    });

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    var yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "childGroup",
        renderer: am5xy.AxisRendererY.new(root, {
          minGridDistance: 10,
        }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    yAxis.get("renderer").labels.template.setAll({
      fontSize: 12,
      location: 0.5,
    });

    yAxis.data.setAll(props.data);

    var xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererX.new(root, {}),
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "right",
        }),
      })
    );

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    var series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        xAxis: xAxis,
        yAxis: yAxis,
        valueXField: "reading",
        categoryYField: "childGroup",
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "left",
        }),
      })
    );

    series.columns.template.setAll({
      tooltipText: "{categoryY}: [bold] {valueX}[/]",
      width: am5.percent(90),
      strokeOpacity: 0,
    });

    series.columns.template.adapters.add("fill", function (fill, target) {
      if (target.dataItem) {
        return chart
          .get("colors")
          .getIndex(
            props.parentGroups.findIndex(
              (e) => e == target.dataItem.dataContext.parentGroup
            )
          );
      } else return fill;
    });

    series.data.setAll(props.data);

    function createRange(label, category, color) {
      var rangeDataItem = yAxis.makeDataItem({
        category: category,
      });

      var range = yAxis.createAxisRange(rangeDataItem);

      rangeDataItem.get("label").setAll({
        fill: color,
        text: label,
        location: 1,
        fontWeight: "bold",
        dx: -130,
      });

      rangeDataItem.get("grid").setAll({
        stroke: color,
        strokeOpacity: 1,
        location: 1,
      });

      rangeDataItem.get("tick").setAll({
        stroke: color,
        strokeOpacity: 1,
        location: 1,
        visible: true,
        length: 130,
      });

      //   legendData.push({ name: label, color: color });
    }

    [...props.data].reverse().forEach((elm, i) => {
      if (elm.parentGroup != temp) {
        createRange(
          elm.parentGroup,
          elm.childGroup,
          chart.get("colors").getIndex(index)
        );
        temp = elm.parentGroup;
        index += 1;
      }
      if (i == props.data.length - 1) {
        temp = "";
        index = 0;
      }
    });

    // legend.data.setAll(legendData);

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    var cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        xAxis: xAxis,
        yAxis: yAxis,
      })
    );

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    series.appear();
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
