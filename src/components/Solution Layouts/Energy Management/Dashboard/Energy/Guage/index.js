import React, { useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5radar from "@amcharts/amcharts5/radar";

var axisDataItem;

export default function App(props) {
  console.log(props.value)
  useEffect(() => {
    var root = am5.Root.new(`chartdiv`);

    let gradient = {
      inverse: [
        { color: am5.color(0xfb7116) },
        { color: am5.color(0xf6d32b) },
        { color: am5.color(0xf4fb16) },
        { color: am5.color(0x19d228) },
      ],
      normal: [
        { color: am5.color(0x19d228) },
        { color: am5.color(0xf4fb16) },
        { color: am5.color(0xf6d32b) },
        { color: am5.color(0xfb7116) },
      ],
    };

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/radar-chart/
    var chart = root.container.children.push(
      am5radar.RadarChart.new(root, {
        panX: false,
        panY: false,
        startAngle: 180,
        endAngle: 360,
      })
    );

    // Create axis and its renderer
    // https://www.amcharts.com/docs/v5/charts/radar-chart/gauge-charts/#Axes
    var axisRenderer = am5radar.AxisRendererCircular.new(root, {
      innerRadius: -10,
      strokeOpacity: 1,
      strokeWidth: 15,
      strokeGradient: am5.LinearGradient.new(root, {
        rotation: 0,
        stops: gradient["normal"],
      }),
    });

    var xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        maxDeviation: 0,
        min: parseInt(0),
        max: parseInt(100),
        strictMinMax: true,
        renderer: axisRenderer,
      })
    );

    // Add clock hand
    // https://www.amcharts.com/docs/v5/charts/radar-chart/gauge-charts/#Clock_hands
    axisDataItem = xAxis.makeDataItem({});
    axisDataItem.set("value", 0);

    var bullet = axisDataItem.set(
      "bullet",
      am5xy.AxisBullet.new(root, {
        sprite: am5radar.ClockHand.new(root, {
          radius: am5.percent(99),
        }),
      })
    );

    xAxis.createAxisRange(axisDataItem);

    axisDataItem.get("grid").set("visible", false);

    axisDataItem.animate({
        key: "value",
        to: parseInt(props.value),
        duration: 500,
        easing: am5.ease.out(am5.ease.cubic)
      });

    // Make stuff animate on load
    chart.appear(1000, 100);

    //---------------------------------------------------CHART LOGIC------------------------------------//
    return () => {
      root.dispose();
    };
  }, [props]);

  return (
    // <div
    //   style={{
    //     overflow: "hidden",
    //     paddingBottom: "56.25%",
    //     position: "relative",
    //     height: "0",
    //   }}
    // >
      <div
        id={`chartdiv`}
        style={{
          height:'70px'
        }}
      ></div>
    // </div>
  );
}
