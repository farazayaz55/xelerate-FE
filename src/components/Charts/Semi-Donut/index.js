import React, { useLayoutEffect, useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";

import * as am5percent from "@amcharts/amcharts5/percent";

var series;
var data = [];

function App(props) {

  useEffect(() => {
    if(props?.data){
      data = props.data
    } else if(props?.evdata){
      data = props?.evdata
    } else if(props?.pvdata){
      data = props?.pvdata
    }
  }, [props])
  const setTheme = () => {
    let colorObj = !props.esb ? {
      Active: am5.color(0x5fb762),
      DOWN: am5.color(0x555555),
      "NO COMMUNICATION": am5.color(0xba75d8)
    } :
    props?.ev ?
    {
      Idle: am5.color(0x555555),
      Charging: am5.color(0x5fb762),
      Malfunctioned: am5.color(0xbf3535)
    } :
    {
      Idle: am5.color(0x555555),
      Charging: am5.color(0x5fb762),
      Discharging: am5.color(0xba75d8)
    } 
    // colorObj["NO COMMUNICATION"] = am5.color(0xba75d8);
    let output = [];
    data.forEach((elm) => {
      output.push(colorObj[elm.category]);
    });
    return output;
  }

  useEffect(() => {
    series.get("colors").set("colors", setTheme());
    series.data.setAll(data);
  }, [data]);

  useEffect(() => {
    if(props?.setDisposed){
      props.setDisposed()
    }
  }, [data])

  useLayoutEffect(() => {
    var root = am5.Root.new(props.name);
    root._logo.dispose();

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/

    //---------------------------------------------------CHART LOGIC------------------------------------//

    var chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        startAngle: 180,
        endAngle: 360,
        layout: root.verticalLayout,
        innerRadius: am5.percent(50),
      })
    );

    // Create series
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Series
    // start and end angle must be set both for chart and series
    series = chart.series.push(
      am5percent.PieSeries.new(root, {
        startAngle: 180,
        endAngle: 360,
        valueField: "value",
        categoryField: "category",
      })
    );

    series.states.create("hidden", {
      startAngle: 180,
      endAngle: 180,
    });

    series.slices.template.setAll({
      cornerRadius: 5,
    });

    series.labels.template.setAll({
      visible: false
    })

    series.ticks.template.setAll({
      forceHidden: true,
    });

    // series.labels.template.setAll({
    //   forceHidden: true,
    // });

    series.get("colors").set("colors", setTheme());

    // Set data
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data
    series.data.setAll(data);

    series.appear(1000, 100);

    //---------------------------------------------------CHART LOGIC------------------------------------//
    return () => {
      root.dispose();
    };
  }, []);

  return (
    <div
      style={{
        overflow: "hidden",
        paddingBottom: props?.padding ||"56.25%",
        position: "relative",
        // top: "30px",
        height: "0",
      }}
    >
      <div
        id={props.name}
        style={{
          position: "absolute",
          left: props?.left || "0",
          top: props?.top || "0",
          height: props?.height || "100px",
          width: "100%",
          maxWidth: props?.width || "100%"
        }}
      ></div>
    </div>
  );
}
export default App;
