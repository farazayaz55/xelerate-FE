import React, { useLayoutEffect, useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5percent from "@amcharts/amcharts5/percent";

var series = {};

function App(props) {
  function setTheme() {
    let colorObj = {
      Critical: am5.color(0xbf3535),
      Abnormal: am5.color(0xbf3535),
      Healthy: am5.color(0x79c37c),
      Active: am5.color(0x79c37c),
      Down: am5.color(0x696b72),
      Offline: am5.color(0x696b72),
    };
    let output = [];
    props.data.forEach((elm) => {
      output.push(colorObj[elm.category]);
    });
    return output;
  }

  useEffect(() => {
    console.log("DONUT PROPS", props)
    series[props.name].get("colors").set("colors", setTheme());
    series[props.name].data.setAll(props.data);
  }, [props.data]);

  useLayoutEffect(() => {
    var root = am5.Root.new(props.name);

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([am5themes_Animated.new(root)]);

    //---------------------------------------------------CHART LOGIC------------------------------------//

    var chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
        innerRadius: am5.percent(60),
        radius: 55,
      })
    );

    // Create series
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Series
    series[props.name] = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "category",
      })
    );

    let tooltip = am5.Tooltip.new(root, {
      getFillFromSprite: false,
      // getStrokeFromSprite: true,
      autoTextColor: false,
      getLabelFillFromSprite: true,
    });

    tooltip.get("background").setAll({
      fill: am5.color(0xffffff),
      fillOpacity: 1,
      stroke: am5.color(0xeeeeee),
      strokeWidth: 3,
    });

    series[props.name].set("tooltip", tooltip);

    // series[props.name].slices.template.setAll({
    //   cornerRadius: 5,
    // });

    series[props.name].ticks.template.setAll({
      forceHidden: true,
    });

    series[props.name].labels.template.setAll({
      forceHidden: true,
    });

    series[props.name].get("colors").set("colors", setTheme());

    series[props.name].data.setAll(props.data);

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
    series[props.name].appear(1000, 100);

    //---------------------------------------------------CHART LOGIC------------------------------------//
    return () => {
      root.dispose();
    };
  }, []);

  return (
    <div
      id={props.name}
      style={{
        height: "130px",
        width: "100%",
      }}
    ></div>
  );
}
export default App;
