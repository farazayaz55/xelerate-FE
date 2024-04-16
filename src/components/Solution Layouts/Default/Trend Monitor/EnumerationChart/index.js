import React, { useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5plugins_exporting from "@amcharts/amcharts5/plugins/exporting";
import { getColor } from "Utilities/Color Spectrum";
import { useSelector } from "react-redux";
// import EventEmitter from "eventemitter3";


// const eventEmitter = new EventEmitter();


var root;
var seriesAdded = [];
let series;


function App(props) {
  console.log({props})

  const metaDataValue = useSelector((state) => state.metaData);

  // useEffect(() => {
  //   if (series?.data) {
  //     series.data.setAll(props.data);
  //     series.columns.template.adapters.add("fill", function (fill, target) {
  //       let sensor = props.dataPointThresholds.find(
  //         (g) => g.dataPoint?.name == props.dataPoint
  //       );
  //       return am5.color(
  //         sensor
  //           ? parseInt(
  //               `0x${getColor(target.dataItem.get("valueY"), sensor).substring(
  //                 1
  //               )}`
  //             )
  //           : parseInt(metaDataValue.branding.secondaryColor.replace("#", "0x"))
  //       );
  //     });
  //   //   if (props.data.length)
  //   //     eventEmitter.emit("updateTooltip", {
  //   //       value: props.data[0].value,
  //   //       unit: props?.unit?props.unit:"",
  //   //     });
  //   }
  // }, [props.data]);



  useEffect(() => {
    // Create root element
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    var root = am5.Root.new(props.name);
    root._logo.dispose();


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
  paddingLeft: 0,
  layout: root.horizontalLayout
}));

// Add scrollbar
// https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
// chart.set("scrollbarX", am5.Scrollbar.new(root, {
//   orientation: "horizontal"
// }));

var data = props.data


// Create axes
// https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
var xRenderer = am5xy.AxisRendererX.new(root, {
  minorGridEnabled: true
});
var xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
  categoryField: "time",
  renderer: xRenderer,
  tooltip: am5.Tooltip.new(root, {})
}));

xRenderer.grid.template.setAll({
  location: 1
})

  xRenderer.labels.template.setAll({
    fontSize: 11,
  });

xAxis.data.setAll(data);

var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
  min: 0,
  renderer: am5xy.AxisRendererY.new(root, {
    strokeOpacity: 0.1
  })
}));

var yRenderer = am5xy.AxisRendererY.new(root, {
    strokeOpacity: 0.1,
  });

  yRenderer.labels.template.setAll({
    fontSize: 8,
    // fill: am5.color(colors ? colors[0] : 0xfffb77)
  });

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

  const hex = (x) => {
    x = x.toString(16);
    return (x.length == 1) ? '0' + x : x;
  }


// Add series
// https://www.amcharts.com/docs/v5/charts/xy-chart/series/
function makeSeries(name, fieldName, value) {
  series = chart.series.push(am5xy.ColumnSeries.new(root, {
    name: `${name} ( ${value ? value : value == 0 ? value : "Other"} )`,
    stacked: true,
    xAxis: xAxis,
    yAxis: yAxis,
    valueYField: fieldName,
    categoryXField: "time"
  }));

  // series.columns.template.adapters.add("fill", function (fill, target) {
  //   let sensor = props.dataPointThresholds.find(
  //     (g) => g.dataPoint?.name == props.dataPoint
  //   );
  //   return am5.color(
  //     sensor
  //       ? parseInt(
  //           `0x${getColor(target.dataItem.get("valueY"), sensor).substring(
  //             1
  //           )}`
  //         )
  //       : parseInt(metaDataValue.branding.secondaryColor.replace("#", "0x"))
  //   );
  // });
  
  series.columns.template.setAll({
    tooltipText: "{categoryX} - {name} : {valueY}",
    tooltipY: am5.percent(10),
    // cornerRadiusTL: 5, cornerRadiusTR: 5
  });

 
  series.data.setAll(data);

  // Make stuff animate on load
  // https://www.amcharts.com/docs/v5/concepts/animations/
  series.appear();

  // series.bullets.push(function () {
  //   return am5.Bullet.new(root, {
  //     sprite: am5.Label.new(root, {
  //       text: "{valueY}",
  //       fill: root.interfaceColors.get("alternativeText"),
  //       centerY: am5.p50,
  //       centerX: am5.p50,
  //       populateText: true
  //     })
  //   });
  // });
  legend.labels.template.setAll({
    fontSize: 11,
    width:18,
  });
  legend.data.push(series);
}

[...props.types, {name: "Other", label:"Other"}].forEach(type=>{
    makeSeries(type.name, type.name, type.value);
})


// makeSeries("North America", "namerica");
// makeSeries("Asia", "asia");
// makeSeries("Latin America", "lamerica");
// makeSeries("Middle East", "meast");
// makeSeries("Africa", "africa");


// Make stuff animate on load
// https://www.amcharts.com/docs/v5/concepts/animations/
chart.appear(1000, 100);
    return () => {
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
          height: props.height,
          width: !props.fullScreen ? "103%" : "101%",
        }}
      ></div>
    </div>
  );
}
export default App;
