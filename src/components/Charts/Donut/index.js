import React, { useLayoutEffect, useEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";

import * as am5percent from "@amcharts/amcharts5/percent";


function App(props) {
  var seriesRef=useRef(null);
  function setTheme() {
    let colorObj = {
      Critical: am5.color(0xbf3535),
      Major: am5.color(0x844204),
      Minor: am5.color(0xfe9f1b),
      Warning: am5.color(0x3399ff),
      Healthy: am5.color(0x5fb762),
      Active: am5.color(0x5fb762),
      Acknowledged: am5.color(0x3399ff),
      Cleared: am5.color(0xbf3535),
    };
    let output = [];
    props.data.forEach((elm) => {
      output.push(colorObj[elm.category]);
    });
    return output;
  }

  useEffect(() => {
    if(seriesRef.current){
      seriesRef.current.get("colors").set("colors", setTheme());
      seriesRef.current.data.setAll(props.data);
  }
  }, [props.data]);

  useLayoutEffect(() => {
    var root = am5.Root.new(props.name);

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/

    //---------------------------------------------------CHART LOGIC------------------------------------//

    var chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
        innerRadius: am5.percent(50),
        radius: 55,
      })
    );

    // Create series
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Series
    let series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "category",
      })
    );

    series.slices.template.setAll({
      cornerRadius: 5,
    });

    series.ticks.template.setAll({
      forceHidden: true,
    });

    series.labels.template.setAll({
      forceHidden: true,
    });

    series.get("colors").set("colors", setTheme());
    series.data.setAll(props.data);

    // Set data
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data

    // Create legend
    // https://www.amcharts.com/docs/v5/charts/percent-charts/legend-percent-series/
    // var legend = chart.children.push(
    //   am5.Legend.new(root, {
    //     centerX: am5.percent(50),
    //     x: am5.percent(50),
    //     marginTop: 15,
    //     marginBottom: 15,
    //   })
    // );

    // legend.data.setAll(series.dataItems);

    // Play initial series animation
    // https://www.amcharts.com/docs/v5/concepts/animations/#Animation_of_series
    series.appear(1000, 100);

    seriesRef.current=series


    //---------------------------------------------------CHART LOGIC------------------------------------//
    return () => {
      root.dispose();
      seriesRef.current=null
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
          height: "120px",
          width: "100%",
        }}
      ></div>
    </div>
  );
}
export default App;
