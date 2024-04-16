import React, { useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
//
import * as am5xy from "@amcharts/amcharts5/xy";
import { useSelector } from "react-redux";

var chart = {};
var series = {};
var circle0 = {};
var circle1 = {};
var easing = {};
var xAxis = {};
var yAxis = {};
var cursor = {};

export default function App(props) {
  const metaDataValue = useSelector((state) => state.metaData);
  let color = parseInt(
    metaDataValue.branding.secondaryColor.replace("#", "0x")
  );

  async function addData(body) {
    if(series[props.name]){

      var lastDataItem = await series[props.name].dataItems[
        series[props.name].dataItems.length - 1
      ];
  
      var lastValue = lastDataItem.get("valueY");
      var newValue = body.value;
      var time = new Date(body.time).valueOf();
  
      series[props.name].data.removeIndex(0);
      series[props.name].data.push({
        date: time,
        value: newValue,
      });
  
      var newDataItem =
        series[props.name].dataItems[series[props.name].dataItems.length - 1];
      newDataItem.animate({
        key: "valueYWorking",
        to: newValue,
        from: lastValue,
        duration: 600,
        easing: easing[props.name],
      });
  
      // use the bullet of last data item so that a new sprite is not created
      newDataItem.bullets = [];
      newDataItem.bullets[0] = lastDataItem.bullets[0];
      newDataItem.bullets[0].get("sprite")._dataItem = newDataItem;
      // reset bullets
      lastDataItem.dataContext.bullet = false;
      lastDataItem.bullets = [];
  
      var animation = newDataItem.animate({
        key: "locationX",
        to: 0.5,
        from: -0.5,
        duration: 600,
      });
    }
  }

  useEffect(() => {
    return () => {
      chart[props.name] = null;
      series[props.name] = null;
      circle0[props.name] = null;
      circle1[props.name] = null;
      easing[props.name] = null;
      xAxis[props.name] = null;
      yAxis[props.name] = null;
      cursor[props.name] = null;
    };
  }, []);

  useEffect(() => {
    if (props.update && series[props.name] && circle0[props.name]) {
      if (series[props.name].dataItems.length > 0) addData(props.update);
      else {
        let body = {
          ...props.update,
          bullet: true,
        };
        series[props.name].data.setAll(body);
      }
      if(circle0[props.name]){
        circle0[props.name].set(
          "fill",
          am5.color(
            parseInt(props.getColor(props.update.value).replace("#", "0x"))
          )
        );
      }
      // circle1[props.name].set(
      //   "fill",
      //   am5.color(
      //     parseInt(props.getColor(props.update.value).replace("#", "0x"))
      //   )
      // );
    }
  }, [props.update]);

  useEffect(() => {
    var root = am5.Root.new(props.name);

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    //

    //---------------------------------------------------CHART LOGIC------------------------------------//

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    chart[props.name] = root.container.children.push(
      am5xy.XYChart.new(root, {
        focusable: true,
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
      })
    );

    easing[props.name] = am5.ease.linear;

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    xAxis[props.name] = chart[props.name].xAxes.push(
      am5xy.DateAxis.new(root, {
        tooltipDateFormat: "yyyy-MM-dd,hh:mm:ss a",
        maxDeviation: 0.5,
        groupData: false,
        extraMax: 0.1, // this adds some space in front
        extraMin: -0.1, // this removes some space form th beginning so that the line would not be cut off
        baseInterval: {
          timeUnit: "millisecond",
          count: 1,
        },
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 50,
        }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    xAxis[props.name].get("dateFormats")["hour"] = "HH:mm";
    xAxis[props.name].get("dateFormats")["second"] = "mm:ss";
    xAxis[props.name].get("periodChangeDateFormats")["second"] =
      "[bold]HH:mm:ss[/]";
    xAxis[props.name].get("dateFormats")["minute"] = "HH:mm";

    yAxis[props.name] = chart[props.name].yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/

    series[props.name] = chart[props.name].series.push(
      am5xy[props.step ? "StepLineSeries" : "SmoothedXLineSeries"].new(root, {
        name: props.name,
        xAxis: xAxis[props.name],
        yAxis: yAxis[props.name],
        valueYField: "value",
        valueXField: "date",
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "horizontal",
          labelText: "{valueY}",
        }),
        stroke: am5.color(
          parseInt(
            props
              .getColor(props.data[props.data.length - 1].value)
              .replace("#", "0x")
          )
        ),
      })
    );

    series[props.name].strokes.template.setAll({
      strokeWidth: 2,
    });

    function getRanges() {
      let sensor;
      if (props.deviceColor) {
        sensor = props.deviceColor;
      } else {
        sensor = props.dataPointThresholds.find(
          (g) => g.dataPoint?._id == props.sensor
        );
      }
      if (sensor) {
        let code = [...sensor.colorArray];
        if (sensor?.ranges && sensor?.ranges.length) {
          code.forEach((color, i) => {
            var rangeDataItem = yAxis[props.name].makeDataItem({
              value:
                i == 0
                  ? Number.NEGATIVE_INFINITY
                  : parseInt(sensor?.ranges[i].min),
              endValue:
                i == code.length - 1
                  ? Number.POSITIVE_INFINITY
                  : parseInt(sensor?.ranges[i + 1].min),
            });

            var range = series[props.name].createAxisRange(rangeDataItem);

            range.strokes.template.setAll({
              stroke: am5.color(parseInt(`0x${color.substring(1)}`)),
              strokeWidth: 2,
            });
          });
        } else {
          if (sensor.reverse) code.reverse();
          let factor = (sensor.max - sensor.min) / code.length;
          code.forEach((color, i) => {
            var rangeDataItem = yAxis[props.name].makeDataItem({
              value:
                i == 0
                  ? Number.NEGATIVE_INFINITY
                  : parseInt(sensor.min) + factor * i,
              endValue:
                i == code.length - 1
                  ? Number.POSITIVE_INFINITY
                  : parseInt(sensor.max) + factor * (i + 1),
            });

            var range = series[props.name].createAxisRange(rangeDataItem);

            range.strokes.template.setAll({
              stroke: am5.color(parseInt(`0x${color.substring(1)}`)),
              strokeWidth: 2,
            });
          });
        }
      }
    }
    getRanges();

    props.data[props.data.length - 1].bullet = true;

    series[props.name].data.setAll(
      !props.data && props.update
        ? [
            {
              date: new Date(props.update.time).setSeconds(
                new Date(props.update.time).getSeconds()
              ),
              value: props.update.value,
              bullet: true,
            },
          ]
        : props.data
    );

    // Create animating bullet by adding two circles in a bullet container and
    // animating radius and opacity of one of them.
    series[props.name].bullets.push(function (root, series, dataItem) {
      // only create sprite if bullet == true in data context
      if (dataItem.dataContext.bullet) {
        var container = am5.Container.new(root, {});
        circle0[props.name] = container.children.push(
          am5.Circle.new(root, {
            radius: 5,
            fill: am5.color(
              parseInt(
                props
                  .getColor(props.data[props.data.length - 1].value)
                  .replace("#", "0x")
              )
            ),
          })
        );

        // circle1[props.name] = container.children.push(
        //   am5.Circle.new(root, {
        //     radius: 5,
        //     fill: am5.color(
        //       parseInt(
        //         props
        //           .getColor(props.data[props.data.length - 1].value)
        //           .replace("#", "0x")
        //       )
        //     ),
        //   })
        // );

        // circle1[props.name].animate({
        //   key: "radius",
        //   to: 20,
        //   duration: 1000,
        //   easing: am5.ease.out(am5.ease.cubic),
        //   loops: Infinity,
        // });
        // circle1[props.name].animate({
        //   key: "opacity",
        //   to: 0,
        //   from: 1,
        //   duration: 1000,
        //   easing: am5.ease.out(am5.ease.cubic),
        //   loops: Infinity,
        // });

        return am5.Bullet.new(root, {
          locationX: undefined,
          sprite: container,
        });
      }
    });

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    cursor[props.name] = chart[props.name].set(
      "cursor",
      am5xy.XYCursor.new(root, {
        xAxis: xAxis[props.name],
      })
    );
    cursor[props.name].lineY.set("visible", false);

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    chart[props.name].appear(1000, 100);

    //---------------------------------------------------CHART LOGIC------------------------------------//
    return () => {
      series[props.name] = null;
      chart[props.name] = null;
      root.dispose();
    };
  }, []);

  return (
    <div
      style={{
        overflow: "hidden",
        paddingBottom: "56.25%",
        position: "relative",
        height: "100%",
      }}
    >
      <div
        id={props.name}
        style={{
          position: "absolute",
          left: "0",
          top: "0",
          height: props.height,
          width: "100%",
        }}
      ></div>
    </div>
  );
}
