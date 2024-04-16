import React, { useEffect, memo } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5plugins_exporting from "@amcharts/amcharts5/plugins/exporting";

var root;

function Heatmap(props) {

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Number of devices displayed per page


  useEffect(() => {
    root = am5.Root.new("heatmap");

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([am5themes_Animated.new(root)]);

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    var chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        layout: root.verticalLayout,
      })
    );

    // Create axes and their renderers
    var yRenderer = am5xy.AxisRendererY.new(root, {
      visible: false,
      minGridDistance: 20,
      inversed: true,
    });

    yRenderer.grid.template.set("visible", false);
    yRenderer.labels.template.setAll({
      fontSize: 10,
      maxWidth: 40,
      truncate: true,
      cursorOverStyle: "pointer",
    });

    yRenderer.labels.template.setup = function (target) {
      target.set(
        "background",
        am5.Rectangle.new(root, {
          fill: am5.color(0xff0000),
          fillOpacity: 0,
        })
      );
    };

    yRenderer.labels.template.events.on("click", function (ev) {
      let deviceName = ev.target._dataItem.dataContext.device;
      let deviceId = props.data.devices.find((d) => d.device == deviceName).id;
      props.history.push(`/solutions/${props.serviceId}/${deviceId}/0`);
    });

    var yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        maxDeviation: 0,
        renderer: yRenderer,
        categoryField: "device",
      })
    );

    var xRenderer = am5xy.AxisRendererX.new(root, {
      visible: false,
      minGridDistance: props.selectedDay == 30 ? 60 : 30,
      opposite: true,
    });

    xRenderer.grid.template.set("visible", false);
    xRenderer.labels.template.setAll({
      fontSize: 10,
      opacity: 0.5,
      maxWidth: 120,
      truncate: true,
    });

    var xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        renderer: xRenderer,
        categoryField: "time",
      })
    );

    // Create series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/#Adding_series
    var series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        calculateAggregates: true,
        stroke: am5.color(0xffffff),
        clustered: false,
        xAxis: xAxis,
        yAxis: yAxis,
        categoryXField: "time",
        categoryYField: "device",
        valueField: "value",
      })
    );

    series.columns.template.setAll({
      tooltipText: "{value}",
      strokeOpacity: 1,
      strokeWidth: 2,
      width: am5.percent(100),
      height: am5.percent(100),
    });

    series.columns.template.events.on("pointerover", function (event) {
      var di = event.target.dataItem;
      if (di) {
        heatLegend.showValue(di.get("value", 0));
      }
    });

    series.events.on("datavalidated", function () {
      heatLegend.set("startValue", series.getPrivate("valueHigh"));
      heatLegend.set("endValue", series.getPrivate("valueLow"));
    });

    // Set up heat rules
    // https://www.amcharts.com/docs/v5/concepts/settings/heat-rules/
    series.set("heatRules", [
      {
        target: series.columns.template,
        min: am5.color(0xfffb77),
        max: am5.color(0xfe131a),
        dataField: "value",
        key: "fill",
      },
    ]);

    // Add heat legend
    // https://www.amcharts.com/docs/v5/concepts/legend/heat-legend/
    var heatLegend = chart.bottomAxesContainer.children.push(
      am5.HeatLegend.new(root, {
        orientation: "horizontal",
        endColor: am5.color(0xfffb77),
        startColor: am5.color(0xfe131a),
      })
    );

    // Set data
    // https://www.amcharts.com/docs/v5/charts/xy-chart/#Setting_data

    series.data.setAll(props.data.chartData);

    yAxis.data.setAll(
      props.data.devices.map((d) => {
        return { device: d.device };
      })
    );
    const allDevices = [...new Set(props.data.chartData.map((c) => c.device))];
    let device;
    const lengths = allDevices.map(dev=>{
      return {device: dev, length: props.data.chartData.filter(d=>d.device == dev).length}
    })
    const tempLength = Math.max(...lengths.map(l=>l.length))
    device = lengths.find(l=>l.length == tempLength).device;
    let len = props.data.chartData.filter((d) => d.device == device).length;
    let ind = props.data.chartData.findIndex((d) => d.device == device)
    let initialTime = props.data.chartData[ind + len-1].time.split(" ")[0];
    let format = props.data.chartData[ind + len-1].time.split(" ")[1];
    let time = [];
    let allTime = [...new Set(props.data.chartData.map((c) => c.time))];
    for (let i = parseInt(initialTime) + parseInt(1); i <= 11; i++) {
      time.push(`${i} ${format}`);
    }
    time.push(`12 ${format == "PM" ? "AM" : "PM"}`);
    for (let i = 1; i <= 11; i++) {
      time.push(`${i} ${format == "PM" ? "AM" : "PM"}`);
    }
    time.push(`12 ${format}`);
    for (let i = 1; i <= initialTime; i++) {
      time.push(`${i} ${format}`);
    }

    xAxis.data.setAll(
      props.selectedDay == 1
        ? [...new Set(time.filter((t) => allTime.includes(t)))].map((t) => {
            return { time: t };
          })
        :
        props.data.chartData.slice(0, props.selectedDay).map((c) => {
          return { time: c.time };
        })
    );
    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/#Initial_animation
    chart.appear(1000, 100);

    return () => {
      root?.dispose();
    };
  }, [props]);

  useEffect(() => {
    return () => {
      root?.dispose();
    };
  }, []);

  return (
    <div
      style={{
        overflow: "hidden",
        position: "relative",
        height: "100%",
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
export default memo(Heatmap);
