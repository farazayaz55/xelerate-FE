import React, { useLayoutEffect, useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5percent from "@amcharts/amcharts5/percent";
import * as am5radar from "@amcharts/amcharts5/radar";
import * as am5xy from "@amcharts/amcharts5/xy";

var series;

function App(props) {

  useLayoutEffect(() => {
    var root = am5.Root.new(props.name);

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([
      am5themes_Animated.new(root)
    ]);
    
    // Generate and set data
    // https://www.amcharts.com/docs/v5/charts/radar-chart/#Setting_data
    var cat = -1;
    var value = 10;
    
    function generateData(i, type) {
      console.log({type})
      const obj = Object.keys(props.data[type])[i]
      return {
        category: obj,
        value: props.data[type][obj]
      };
    }
    
    function generateDatas(count, type) {
      cat = -1;
      var data = [];
      for (var i = 0; i < count; ++i) {
        data.push(generateData(i, type));
      }
      console.log({data})
      return data;
    }
    
    // Create chart
    // https://www.amcharts.com/docs/v5/charts/radar-chart/
    var chart = root.container.children.push(
      am5radar.RadarChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        innerRadius: am5.p50,
        layout: root.verticalLayout
      })
    );
    
    // Create axes and their renderers
    // https://www.amcharts.com/docs/v5/charts/radar-chart/#Adding_axes
    var xRenderer = am5radar.AxisRendererCircular.new(root, {});
    xRenderer.labels.template.setAll({
      textType: "circular",
      fontSize: 12,
      visible: false
    });
    
    var xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        maxDeviation: 0,
        categoryField: "category",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {})
      })
    );
    
    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5radar.AxisRendererRadial.new(root, {})
      })
    );
    
    // Create series
    // https://www.amcharts.com/docs/v5/charts/radar-chart/#Adding_series
    const temp = ['alarmsEV', 'alarmsInverter', 'alarmsOther']
    temp.forEach(t=>{
      series = chart.series.push(
        am5radar.RadarColumnSeries.new(root, {
          stacked: true,
          name: t.slice(6),
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "value",
          categoryXField: "category"
        })
      );
    
      series.columns.template.setAll({
        tooltipText: "{name}({categoryX}): {valueY}"
      });
    
      series.data.setAll(generateDatas(props.data[t] ? Object.keys(props.data[t]).length : 0, t));
      series.appear(1000);
    });
    
    // slider
    var slider = chart.children.push(
      am5.Slider.new(root, {
        orientation: "horizontal",
        start: 0.5,
        width: am5.percent(60),
        centerY: am5.p50,
        centerX: am5.p50,
        x: am5.p50,
        visible: false
      })
    );
    slider.events.on("rangechanged", function () {
      var start = slider.get("start");
      var startAngle = 270 - start * 179 - 1;
      var endAngle = 270 + start * 179 + 1;
    
      chart.setAll({ startAngle: startAngle, endAngle: endAngle });
      yAxis.get("renderer").set("axisAngle", startAngle);
    });
    
    var data = generateDatas(props.data?.alarmsEV ? Object.keys(props.data.alarmsEV).length : 0, 'alarmsEV');
    console.log({data})
    xAxis.data.setAll(data);
    
    // Animate chart
    // https://www.amcharts.com/docs/v5/concepts/animations/#Initial_animation
    chart.appear(1000, 100);
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
        // top: "30px",
        height: "0",
      }}
      >
      <div style={{position: "absolute", left: "0", height: "260px", width: "100%"}}>
        <div style={{position: "relative", width: "100%", height: "100%"}}>
          <div style={{position: "absolute", top: "126px", left: "26px", rotate: "-80deg", fontSize: "11px", fontWeight: "bold"}}>Voltage</div>
          <div style={{position: "absolute", top: "56px", left: "55px", rotate: "-53deg", fontSize: "11px", fontWeight: "bold"}}>Current</div>
          <div style={{position: "absolute", top: "11px", left: "113px", rotate: "-25deg", fontSize: "11px", fontWeight: "bold"}}>Power</div>
          <div style={{position: "absolute", top: "-4px", left: "175px", rotate: "0deg", fontSize: "11px", fontWeight: "bold"}}>Frequency</div>
          <div style={{position: "absolute", top: "11px", right: "105px", rotate: "25deg", fontSize: "11px", fontWeight: "bold"}}>Emergency</div>
          <div style={{position: "absolute", top: "58px", right: "45px", rotate: "53deg", fontSize: "11px", fontWeight: "bold"}}>Ph. Rotation</div>
          <div style={{position: "absolute", top: "135px", right: "11px", rotate: "80deg", fontSize: "11px", fontWeight: "bold"}}>Power Factor</div>
        </div>
      </div>
      <div
        id={props.name}
        style={{
          position: "absolute",
          left: "0",
          top: "-20px",
          height: "260px",
          width: "100%",
        }}
      ></div>
      </div>
  );
}
export default App;