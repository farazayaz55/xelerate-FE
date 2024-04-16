import React, { useEffect, memo } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5flow from "@amcharts/amcharts5/flow";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5plugins_exporting from "@amcharts/amcharts5/plugins/exporting";
import { useSelector, useDispatch } from "react-redux";

import { setFilter, resetFilter } from "rtkSlices/filterDevicesSlice";

var root;

function Sankey(props) {
  let expanded = [];
  const dispatch = useDispatch();

  function recursePreviousGroups(obj) {
    console.log({ props, obj });
    let tempObj = props.data.find((d) => d.to == obj.from);
    if (tempObj) {
      expanded.push(
        `${tempObj.fromGroupId}:${tempObj.from.slice(
          0,
          tempObj.from.indexOf(" (")
        )}`
      );
      recursePreviousGroups(tempObj);
    } else {
      expanded.push("0:All assets");
    }
  }

  useEffect(() => {
    root = am5.Root.new("sankey");

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([am5themes_Animated.new(root)]);

    // Create series
    // https://www.amcharts.com/docs/v5/charts/flow-charts/
    var series = root.container.children.push(
      am5flow.Sankey.new(root, {
        sourceIdField: "from",
        targetIdField: "to",
        valueField: "value",
        paddingRight: 85,
      })
    );

    series.nodes.get("colors").set("step", 2);
    series.nodes.labels.template.setAll({
      fontSize: 11,
      cursorOverStyle: "pointer",
    });

    series.nodes.labels.template.setup = function (target) {
      target.set(
        "background",
        am5.Rectangle.new(root, {
          fill: am5.color(0xff0000),
          fillOpacity: 0,
        })
      );
    };

    series.nodes.labels.template.events.on("click", function (ev) {
      let deviceName = ev.target._dataItem.dataContext.id;
      if (props.data.find((d) => d.deviceId && d.to == deviceName)) {
        let deviceId = props.data.find((d) => d.deviceId && d.to == deviceName)
          .deviceId;
        props.history.push(`/solutions/${props.serviceId}/${deviceId}/0`);
      } else {
        console.log(
          props.data.find((d) => d.fromGroupId && d.from == deviceName)
        );
        // console.log(props.data)
        let fromGroupId = props.data.find(
          (d) => d.fromGroupId && d.from == deviceName
        ).fromGroupId;
        let groupName = props.data
          .find((d) => d.fromGroupId && d.from == deviceName)
          .from.slice(
            0,
            props.data
              .find((d) => d.fromGroupId && d.from == deviceName)
              .from.indexOf(" (")
          );
        expanded.push(`${fromGroupId}:${groupName}`);
        recursePreviousGroups(
          props.data.find((d) => d.fromGroupId && d.from == deviceName)
        );
        console.log({ expanded, groupName, fromGroupId });
        dispatch(
          setFilter({ group: { name: groupName, id: fromGroupId }, expanded })
        );
      }
    });

    series.links.template.setAll({
      disabled: true
    })




    series.links.template.setAll({
      tooltipText: "From: {sourceId}   [/]\nTo: {targetId}     \nValue: {value}      [/]",
    });


    // Set data
    // https://www.amcharts.com/docs/v5/charts/flow-charts/#Setting_data
    console.log({ props })
    series.data.setAll(props.data);

    // Make stuff animate on load
    series.appear(1000, 100);
    return () => {
      series = null;
      root?.dispose();
    };
  }, [props]);

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
export default memo(Sankey);
