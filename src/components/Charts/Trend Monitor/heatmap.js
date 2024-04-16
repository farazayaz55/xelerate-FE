import React, { useEffect, memo } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5plugins_exporting from "@amcharts/amcharts5/plugins/exporting";
import { useSelector } from "react-redux";

var root;

function Heatmap(props) {
  const weekDays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  const prevDay = new Date(props.date).getDay() + 1
  const weekDaysList = weekDays.slice(prevDay).concat(weekDays.slice(0, prevDay))

  console.log({weekDaysList})

  const formatAMPM = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0'+minutes : minutes;
    let strTime = hours + ' ' + ampm;
    return strTime;
  }

  const getWeekDayFromTimestamp = (timestamp) => {
    let d = new Date(timestamp);
    let dayOfWeek = weekDays[d.getDay()]
    return dayOfWeek
  }

  const getformattedDate = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0'+minutes : minutes;
    return hours
  }

  const  getAMPMFormat = (h) => {
    let ampm = h == 24 ? "AM" : h >= 12 ? 'PM' : 'AM';
    let hours = (h == 24 || h == 12) ? 12 : h % 12;
    let strTime = hours + ' ' + ampm;
    return strTime;
  }

  const onlyUnique = (value, index, array) => {
    return array.indexOf(value) === index;
  }

  const getOrderTimeArray = () => {
    //Getting Current Time
    let currentTime = new Date(props.date)
    //Formatting to get integer value of hours
    let currentFormattedTime = getformattedDate(currentTime)
    //Creating placeholder array
    let placeholderTime = [currentFormattedTime]
    //Looping to get the previous 23 hours
    for(let i=1; i<24; i++){
      let time = currentFormattedTime - i
      if(time < 0){
        time = 24 + time
      }
      placeholderTime.push(time)
    }
    //Formatting the time to AM/PM format
    let timeArray = placeholderTime.map((time) => {
      let t = getAMPMFormat(time)
      return t;
    })
    //Replacing 0AM with 12AM
    let TimeFormattedArray = timeArray.map((time) => {
      if(time === "0 AM"){
        return "12 AM"
      } else {
        return time
      }
    })
    //Reversing the array to get the time in descending order
    let timeOrderArray = TimeFormattedArray.reverse()

    return timeOrderArray

    /*let placeholderTime = []

    for (let i = 0; i < 24; i++) {
      placeholderTime[i] = i+1
    }
    let currentTime = new Date()
    let currentFormattedTime = getformattedDate(currentTime)

    let unique = placeholderTime.filter(onlyUnique);

    let timeOrderArray = []
    timeOrderArray[23] = currentFormattedTime
    let key = 0

    let timeFilterArray = unique.map((val) => parseInt(val))
    timeFilterArray = timeFilterArray.sort((a, b) => b - a)

    let index = timeFilterArray.indexOf(currentFormattedTime)
    delete timeFilterArray[index]

    timeFilterArray = timeFilterArray.filter((n) => n != undefined && n)

    timeFilterArray.map((time, idx) => {
      if (time == undefined) return;
      if (time != currentFormattedTime && currentFormattedTime < time) {
        timeOrderArray[(time % currentFormattedTime)-1] = time
        key++;
        delete timeFilterArray[timeFilterArray.indexOf(time)]
      }
    })

    timeFilterArray = timeFilterArray.filter((n) => n != undefined && n).sort((a, b) => a - b)
    timeFilterArray.map((n) => (
      timeOrderArray[key++] = n
    ))

    let timeArray = timeOrderArray.map((time) => {
      let t = getAMPMFormat(time)
      return t;
    })
    return timeArray;*/
  }

  const metaDataValue = useSelector((state) => state.metaData);

  useEffect(() => {
    root = am5.Root.new("Trend-Monitor");

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([am5themes_Animated.new(root)]);

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    let chart = root.container.children.push(
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
      fontSize: 9,
      maxWidth: "100%",
      truncate: true,
      opacity: 0.5,
      fontStyle: "normal",
      cursorOverStyle: "pointer",
    });

    let colors = props.dataPointThresholds.find(element => element.dataPoint?.name == props.dataPoint)?.colorArray;
    let found = props.dataPointThresholds.find(element => element.dataPoint?.name == props.dataPoint);

    yRenderer.labels.template.setup = function (target) {
      target.set(
        "background",
        am5.Rectangle.new(root, {
          fill: am5.color(colors ? colors[0] : 0xfffb77),
          fillOpacity: 0,
        })
      );
    };

    let yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        maxDeviation: 0,
        renderer: yRenderer,
        categoryField: "weekday",
      })
    );

    var xRenderer = am5xy.AxisRendererX.new(root, {
      visible: false,
      minGridDistance: 30,
      opposite: true,
    });

    xRenderer.grid.template.set("visible", false);
    xRenderer.labels.template.setAll({
      fontSize: 9,
      opacity: 0.5,
      maxWidth: 120,
      truncate: true,
    });

    var xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        renderer: xRenderer,
        categoryField: "date",
      })
    );

    // Create series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/#Adding_series
   
    var series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        calculateAggregates: true,
        stroke: am5.color("#d3d3d3"),
        clustered: false,
        xAxis: xAxis,
        yAxis: yAxis,
        categoryXField: "date",
        categoryYField: "weekday",
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
      // if (di) {
      //   heatLegend.showValue(di.get("value", 0));
      // }
    });

    series.events.on("datavalidated", function () {
      // heatLegend.set("startValue", series.getPrivate("valueHigh"));
      // heatLegend.set("endValue", series.getPrivate("valueLow"));
    });

    // Set up heat rules
    // https://www.amcharts.com/docs/v5/concepts/settings/heat-rules/
    
    // series.set("heatRules", [
    //   {
    //     target: series.columns.template,
    //     min: am5.color(colors ? colors[0] : "#FF0000"),
    //     max: am5.color(colors ? colors[colors.length-1] : "#008000"),
    //     // customFunction: function (sprite, value){
    //     //   const found = props.dataPointThresholds.find(element => element.dataPoint.name == props.dataPoint);
    //     //   if(found){
    //     //     let colorArray = found.colorArray;
    //     //     if(found.ranges.length > 0){
    //     //       found.ranges.forEach((range, idx) => {
    //     //         if(value >= range.min && value <= range.max){
    //     //           return sprite.set("fill", am5.color(colorArray[idx]));
    //     //         }
    //     //       })
    //     //     } else {
    //     //       if(value <= found.max/2){
    //     //         return sprite.set("fill", am5.color(colorArray[0]));
    //     //       } else {
    //     //         return sprite.set("fill", am5.color(colorArray[colorArray.length-1]));
    //     //       }
    //     //     }
    //     //   } else {
    //     //     if(value <= found.max/2){
    //     //         return sprite.set("fill", am5.color(colors[0]));
    //     //       } else {
    //     //         return sprite.set("fill", am5.color(colors[colors.length-1]));
    //     //       }
    //     //   }
    //     // },
    //     minValue: props.min,
    //     maxValue: props.max,
    //     dataField: "value",
    //     key: "fill",
    //   },
    // ]);

  //   const hex2 = function (c) {
  //     c = Math.round(c);
  //     if (c < 0) c = 0;
  //     if (c > 255) c = 255;
  
  //     var s = c.toString(16);
  //     if (s.length < 2) s = "0" + s;
  
  //     return s;
  // }
  
  // const color = function (r, g, b) {
  //     return "#" + hex2(r) + hex2(g) + hex2(b);
  // }
  
  // const shade = function (col, light) {
  
  //     // TODO: Assert that col is good and that -1 < light < 1
  
  //     var r = parseInt(col.substr(1, 2), 16);
  //     var g = parseInt(col.substr(3, 2), 16);
  //     var b = parseInt(col.substr(5, 2), 16);
  
  //     if (light < 0) {
  //         r = (1 + light) * r;
  //         g = (1 + light) * g;
  //         b = (1 + light) * b;
  //     } else {
  //         r = (1 - light) * r + light * 255;
  //         g = (1 - light) * g + light * 255;
  //         b = (1 - light) * b + light * 255;
  //     }
  
  //     return color(r, g, b);
  // }

    const hex = (x) => {
      x = x.toString(16);
      return (x.length == 1) ? '0' + x : x;
    }

    const getColorInBetween = (cmax, cmin, ratio) => {
      let color1 = cmax.replace("#", "")
      let color2 = cmin.replace("#", "")
      const r = Math.ceil(parseInt(color1.substring(0,2), 16) * ratio + parseInt(color2.substring(0,2), 16) * (1-ratio));
      const g = Math.ceil(parseInt(color1.substring(2,4), 16) * ratio + parseInt(color2.substring(2,4), 16) * (1-ratio));
      const b = Math.ceil(parseInt(color1.substring(4,6), 16) * ratio + parseInt(color2.substring(4,6), 16) * (1-ratio));
      return ("#" + hex(r) + hex(g) + hex(b))
    }

    const colorFound = props.dataPointThresholds.find(element => element.dataPoint?.name == props.dataPoint);
    if(colorFound){
      series.columns.template.adapters.add("fill", function(fill, target){
        let colorArray = found.colorArray
        if(found?.reverse){
          colorArray = Array.from(found.colorArray).reverse()
        }
        if(found.ranges.length > 0) {
          if(target.dataItem.get("value") <= found?.ranges[0]?.min){
            return am5.color(colorArray[i])
          }
          if(target.dataItem.get("value") >= found?.ranges[found.ranges.length - 1]?.max){
            return am5.color(colorArray[found.ranges.length - 1])
          }
          for(let i=0; i<found.ranges.length-1; i++){
            if(target.dataItem.get("value") >= found.ranges[i].min && target.dataItem.get("value") < found.ranges[i+1].max){
              // let amount = (0.5 - (target.dataItem.get("value") - found.ranges[i].min) / (found.ranges[i].max - found.ranges[i].min))/2 
              // return am5.color(shade(colorArray[i], amount))

              let ratio = (target.dataItem.get("value") - found.ranges[i].min) / (found.ranges[i+1].max - found.ranges[i].min)
              return am5.color(getColorInBetween(colorArray[i+1], colorArray[i], ratio))
            }
          }
        }else {
            const increments = (found.max-found.min)/(found.colorArray.length-1)
            if(target.dataItem.get("value") >= found.max){
              return am5.color(colorArray[colorArray.length-1])
            }
            if(target.dataItem.get("value") <= found.min){
              return am5.color(colorArray[0])
            }
            for(let i=0; i<found.colorArray.length-1; i++){
              if(target.dataItem.get("value") >= found.min + i*increments && target.dataItem.get("value") < found.min + (i+2)*increments){
                let ratio = ((target.dataItem.get("value") - (found.min + (i)*increments)) / (2*increments))
                return am5.color(getColorInBetween(colorArray[i+1], colorArray[i], ratio))
              } 
            }
          } 
        })
    } else {
      series.set("heatRules", [
        {
          target: series.columns.template,
          max: am5.color("#FF0000"),
          min: am5.color("#FFBF00"),
          minValue: props.min,
          maxValue: props.max,
          dataField: "value",
          key: "fill" 
        }
      ])
    }

    // series.columns.template.adapters.remove("fill");

    // Add heat legend
    // https://www.amcharts.com/docs/v5/concepts/legend/heat-legend/
    var heatLegend = chart.bottomAxesContainer.children.push(
      am5.HeatLegend.new(root, {
        orientation: "horizontal",
    //     // endColor: am5.color(colors[1] ? colors[1] : 0xfffb77),
    //     // startColor: am5.color(colors[2] ? colors[2] : 0xfe131a),
      })
    );

    // Set data
    // https://www.amcharts.com/docs/v5/charts/xy-chart/#Setting_data
    let chartData = props?.data.map((obj, idx) => {
      let formattedDate = new Date(obj?.date)
      let weekDay = weekDays[new Date(obj?.date).getDay()]
      let dateFormat = formatAMPM(formattedDate)
      return { date: dateFormat, value: obj?.value, weekday: weekDay };
    })

    console.log({chartData})

    const monday = chartData.filter((data) => data.weekday == "Monday")
    console.log({monday})


    const tuesday = chartData.filter((data) => data.weekday == "Tuesday")
    console.log({tuesday})

    const Wednesday = chartData.filter((data) => data.weekday == "Wednesday")
    console.log({Wednesday})

    const Thursday = chartData.filter((data) => data.weekday == "Thursday")
    console.log({Thursday})

    const Friday = chartData.filter((data) => data.weekday == "Friday")
    console.log({Friday})

    const Saturday = chartData.filter((data) => data.weekday == "Saturday")
    console.log({Saturday})

    const Sunday = chartData.filter((data) => data.weekday == "Sunday")
    console.log({Sunday})



    let timeArray = getOrderTimeArray();
  
    series.data.setAll(chartData);

    yAxis.data.setAll(
      weekDaysList.map((wd) => {
        return { weekday: wd };
      })
    );
    
    const fixedTimeArray = ["12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM",]

    xAxis.data.setAll(
        (fixedTimeArray.map(t=>{
          return { date: t }
        }))
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
      root = null;
    };
  }, []);

  return (
    <div
      style={{
        overflow: "hidden",
        position: "relative",
        height: "98%",
      }}
    >
      <div
        id={props.name}
        style={{
          position: "absolute",
          left: "0",
          height: "100%",
          width: "100%",
        }}
      ></div>
    </div>
  );
}
export default memo(Heatmap);
