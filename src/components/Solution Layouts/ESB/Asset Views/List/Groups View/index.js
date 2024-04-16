import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import Table from "@mui/material/Table";
import hexRgb from "hex-rgb";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useGetGroupsQuery } from "services/groups";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import { useGetDevicesQuery } from "services/devices";
import CircularProgress from "@mui/material/CircularProgress";
import PowerIcon from "@mui/icons-material/Power";
import { useGetGroupAnalyticsQuery } from "services/analytics";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import Chip from "@mui/material/Chip";
import { getColor } from "Utilities/Color Spectrum";

export default function GroupsView(props) {
  let currentGroup;
  let allGroups = [];
  let lastTime = false;
  const [color, setColor] = React.useState(false);
  const [childAggregate, setChildAggregate] = React.useState(false);
  let token = window.localStorage.getItem("token");
  let permission = props.layoutPermission.columns;
  const [rows, setRowState] = React.useState([]);
  const [tempRows, setTempRows] = React.useState([]);
  const [allGroupsState, setAllGroupsState] = React.useState([]);
  const [allDevices, setAllDevices] = React.useState([]);
  const [expandedGroup, setExpandedGroup] = React.useState("");
  const [expandedChild, setExpandedChild] = React.useState([]);
  // const [currentGroup, setCurrentGroup] = React.useState("");
  const [otherDevices, setOtherDevices] = React.useState([]);
  const [datapointAggregations, setDatapointAggregations] = React.useState({});
  const [expandedOtherGroup, setExpandedOtherGroup] = React.useState(false);
  const metaDataValue = useSelector((state) => state.metaData);
  const filterDevice = useSelector((state) => state.filterDevice);
  const [rgb, setRgb] = React.useState(
    hexRgb(metaDataValue.branding.primaryColor)
  );
  let service = metaDataValue.services.find((s) => s.id == props.serviceId);
  let sensors = props.sensors;
  const groups = useGetGroupsQuery(
    {
      token,
      refetch: false,
      params: !filterDevice.group.id
        ? `?serviceId=${props.serviceId}`
        : `?serviceId=${props.serviceId}&groupId=${filterDevice.group.id}`,
    },
    { refetchOnMountOrArgChange: false }
    // { skip: filterDevice.group.id }
  );

  const filteredGroups = useGetGroupsQuery(
    {
      token,
      refetch: false,
      params: filterDevice.group.id
        ? `?serviceId=${props.serviceId}${getDeviceFilters()}&groupId=${
            filterDevice.group.id
          }`
        : `?serviceId=${props.serviceId}${getDeviceFilters()}`,
    },
    { skip: !getDeviceFilters() }
  );

  const singleGroup = useGetGroupsQuery(
    {
      token,
      params: `?groupId=${expandedChild[expandedChild.length - 1]?._id || ""}`,
    },
    { skip: !expandedChild.length }
  );

  const singleFilteredGroup = useGetGroupsQuery(
    {
      token,
      params: `?groupId=${
        filterDevice?.group?.id
          ? filterDevice.group.id
          : expandedChild[expandedChild.length - 1]?._id || ""
      }${getDeviceFilters()}`,
    },
    { skip: !expandedChild.length || !getDeviceFilters() }
  );

  const devices = useGetDevicesQuery(
    {
      token,
      group: props.serviceId,
      params: ``,
    },
    { skip: !rows.length && !expandedChild.length }
  );

  const aggregation = useGetGroupAnalyticsQuery(
    {
      token,
      parameters: !expandedGroup
        ? `${props.serviceId}?aggregation=mean`
        : !expandedChild.length
        ? `${props.serviceId}?aggregation=mean&groupId=${expandedGroup.groupId}`
        : `${props.serviceId}?aggregation=mean&groupId=${
            expandedChild[expandedChild.length - 1]?._id
          }`,
      refetch: true,
    },
    { skip: !tempRows.length && !expandedGroup }
  );

  const childAggregation = useGetGroupAnalyticsQuery(
    {
      token,
      parameters: `${props.serviceId}?aggregation=mean&groupId=${
        expandedChild[expandedChild.length - 1]?._id || ""
      }`,
      refetch: true,
    },
    { skip: !childAggregate || !expandedChild[expandedChild.length - 1]?._id }
  );

  function getDeviceFilters() {
    if (
      filterDevice.measurement ||
      filterDevice.connection ||
      filterDevice.alarms.length ||
      filterDevice.metaTags
    ) {
      let arr = [
        { value: "measurement", key: "MeasurementFilter" },
        { value: "connection", key: "connected" },
        { value: "alarms", key: "alarms" },
        { value: "metaTags", key: "metaTags" },
      ];
      let obj = {};
      arr.forEach((a) => {
        if (filterDevice[a.value]) {
          obj[a.key] =
            a.value == "connection"
              ? filterDevice[a.value]
              : JSON.parse(filterDevice[a.value]);
        }
      });
      obj = JSON.stringify(obj);
      return `&deviceFilters=${obj}`;
    } else {
      return "";
    }
  }

  useEffect(() => {
    setColor(props.color);
  }, [props]);

  useEffect(() => {
    if (!filterDevice.open) {
      setExpandedChild([])
      setExpandedGroup("")
      groups.refetch();
      aggregation.refetch();
    }
  }, [JSON.stringify(filterDevice)]);

  useEffect(() => {
    if (!aggregation.isFetching && aggregation.isSuccess) {
      let temp = JSON.parse(JSON.stringify(rows));
      aggregation.data.payload.forEach((agg) => {
        if (
          !expandedGroup
            ? temp.find((r) => r.groupId == agg.groupId)
            : temp.find((r) => r.groupId == expandedGroup.groupId)
        ) {
          sensors.forEach((sensor) => {
            let tempColor;
            service.dataPointThresholds.forEach((dp) => {
              if (sensor.name == dp.datapoint?.name) {
                tempColor = getColor(agg[sensor.friendlyName], dp);
              }
            });

            if (!expandedGroup) {
              temp.find((r) => r.groupId == agg.groupId)[sensor.name] = {
                value: agg[sensor.friendlyName],
                color: tempColor,
              };
            }
            if (expandedGroup && !expandedChild.length) {
              if (
                temp
                  .find((r) => r.groupId == expandedGroup.groupId)
                  .children.find((child) => child._id == agg.groupId)
              ) {
                temp
                  .find((r) => r.groupId == expandedGroup.groupId)
                  .children.find((child) => child._id == agg.groupId)[
                  sensor.name
                ] = { value: agg[sensor.friendlyName], color: tempColor };
              }
            }
          });
        }
      });

      setRowState(temp);
      setTempRows(temp);
    }
  }, [aggregation.isFetching]);

  useEffect(() => {
    if (!childAggregation.isFetching && childAggregation.isSuccess) {
      let temp = JSON.parse(JSON.stringify(rows));
      let tempGroup;
      childAggregation.data.payload.forEach((agg) => {
        sensors.forEach((sensor) => {
          if (expandedGroup && expandedChild.length) {
            let parentChain = [
              ...expandedChild[expandedChild.length - 1].parentChain,
              expandedChild[expandedChild.length - 1]._id,
            ];
            parentChain.forEach((parent, ind) => {
              if (ind == 0) {
                tempGroup = temp.find((t) => t.groupId == parent);
              } else {
                tempGroup = tempGroup.children.find((ch) => ch._id == parent);

                if (ind + 1 == parentChain.length) {
                  tempGroup.children.find((ch) => ch._id == agg.groupId)[
                    sensor.name
                  ] = agg[sensor.friendlyName];
                  temp[parentChain[0]] = tempGroup;
                  setRowState(temp);
                }
              }
            });
          }
        });
      });
      setRowState(temp);
      setTempRows(temp);
    }
  }, [childAggregation.isFetching]);

  useEffect(() => {
    if (!singleGroup.isFetching && singleGroup.isSuccess) {
      let temp = [];
      // if (filterDevice.group?.id) {
      //   allGroups = singleGroup.data.payload;
      //   setAllGroupsState(singleGroup.data.payload);
      //   setRowState([]);
      //   setTempRows([]);
      //   singleGroup.data.payload.forEach((group) => {
      //     temp.push({
      //       name: group.name,
      //       assets: [],
      //       children: group.childGroups,
      //       groupId: group._id,
      //     });
      //   });
      //   currentGroup = singleGroup.data.payload[0];
      //   setTimeout(() => {
      //     setAssetsRow(singleGroup.data.payload[0].devices, temp);
      //   }, 100);
      // } else {
      temp = JSON.parse(JSON.stringify(rows));
      singleGroup.data.payload.forEach((group) => {
        if (group.parentChain.length) {
          if (group.parentChain.length == 1) {
            temp
              .find((t) => t.groupId == group.parentChain[0])
              .children.find((ch) => ch._id == group._id).devices = [];
            group.devices.forEach((elm) => {
              temp
                .find((t) => t.groupId == group.parentChain[0])
                .children.find((ch) => ch._id == group._id)
                ?.devices.push({
                  html: elm.name,
                  id: elm.internalId,
                  ...getDatapointValues(elm),
                  html3: elm?.packetFromPlatform?.c8y_Availability
                    ? elm?.packetFromPlatform?.c8y_Availability?.status
                    : "",
                });
            });
            temp
              .find((t) => t.groupId == group.parentChain[0])
              .children.find((ch) => ch._id == group._id).children =
              group.childGroups;
            setRowState(temp);
            setTempRows(temp);
          } else {
            let tempGroup;
            group.parentChain.forEach((parent, ind) => {
              if (ind == 0) {
                tempGroup = temp.find((t) => t.groupId == parent);
              } else {
                tempGroup = tempGroup.children.find((ch) => ch._id == parent);

                if (ind + 1 == group.parentChain.length) {
                  tempGroup.children.find((ch) => ch._id == group._id).devices =
                    group.devices;
                  tempGroup.children.find(
                    (ch) => ch._id == group._id
                  ).children = group.childGroups;
                  temp[group.parentChain[0]] = tempGroup;
                  setRowState(temp);
                  setTempRows(temp);
                }
              }
            });
          }
        }
      });
      // }
      currentGroup = singleGroup.data.payload[0];
      setChildAggregate(true);
    }
  }, [singleGroup.isFetching]);

  // useEffect(()=>{
  //   if(filterDevice.group.id){

  //   }
  // },[filterDevice.group])

  useEffect(() => {
    if (!singleFilteredGroup.isFetching && singleFilteredGroup.isSuccess) {
      let temp = [];
      if (filterDevice.group?.id) {
        allGroups = [];
        setAllGroupsState([]);
      } else {
        temp = JSON.parse(JSON.stringify(rows));
      }
      singleFilteredGroup.data.payload.forEach((group) => {
        if (group.parentChain.length) {
          if (group.parentChain.length == 1) {
            if (temp.find((t) => t.groupId == group.parentChain[0])) {
              temp
                .find((t) => t.groupId == group.parentChain[0])
                .children.find((ch) => ch._id == group._id).devices = [];
              group.devices.forEach((elm) => {
                temp
                  .find((t) => t.groupId == group.parentChain[0])
                  .children.find((ch) => ch._id == group._id)
                  ?.devices.push({
                    html: elm.name,
                    id: elm.internalId,
                    ...getDatapointValues(elm),
                    html3: elm?.packetFromPlatform?.c8y_Availability
                      ? elm?.packetFromPlatform?.c8y_Availability?.status
                      : "",
                  });
              });
              temp
                .find((t) => t.groupId == group.parentChain[0])
                .children.find((ch) => ch._id == group._id).children =
                group.childGroups;
              setRowState(temp);
              setTempRows(temp);
            }
          } else {
            let tempGroup;
            group.parentChain.forEach((parent, ind) => {
              if (ind == 0) {
                tempGroup = temp.find((t) => t.groupId == parent);
              } else {
                tempGroup = tempGroup.children.find((ch) => ch._id == parent);

                if (ind + 1 == group.parentChain.length) {
                  tempGroup.children.find((ch) => ch._id == group._id).devices =
                    group.devices;
                  tempGroup.children.find(
                    (ch) => ch._id == group._id
                  ).children = group.childGroups;
                  temp[group.parentChain[0]] = tempGroup;
                  setRowState(temp);
                  setTempRows(temp);
                }
              }
            });
          }
        }
      });
      currentGroup = singleFilteredGroup.data.payload[0];
      setChildAggregate(true);
    }
  }, [singleFilteredGroup.isFetching]);

  useEffect(() => {
    if (!groups.isFetching && groups.isSuccess) {
      let temp = [];
      if (groups.data.payload.length) {
        allGroups = groups.data.payload;
        setAllGroupsState(groups.data.payload);
        groups.data.payload.forEach((group) => {
          temp.push({
            name: group.name,
            assets: [],
            children: group.childGroups,
            groupId: group._id,
          });
        });
        currentGroup = groups.data.payload[0];
        setTimeout(() => {
          setAssetsRow(groups.data.payload[0].devices, temp);
        }, 100);
      }
    }
    if (!groups.isFetching && groups.isError) {
    }
  }, [groups.isFetching]);

  useEffect(() => {
    if (!filteredGroups.isFetching && filteredGroups.isSuccess) {
      let temp = [];
      if (filteredGroups.data.payload.length) {
        aggregation?.refetch();
        allGroups = filteredGroups.data.payload;
        setAllGroupsState(filteredGroups.data.payload);
        filteredGroups.data.payload.forEach((group) => {
          temp.push({
            name: group.name,
            assets: [],
            children: group.childGroups,
            groupId: group._id,
          });
        });
        currentGroup = filteredGroups.data.payload[0];
        setTimeout(() => {
          setAssetsRow(filteredGroups.data.payload[0].devices, temp);
        }, 100);
      } else {
        setRowState([]);
        setTempRows([]);
      }
    }
    if (!filteredGroups.isFetching && filteredGroups.isError) {
    }
  }, [filteredGroups.isFetching]);

  function setAssetsRow(data, tRows) {
    let avgs = {};
    let tempGroups = JSON.parse(JSON.stringify(tRows));
    let ind = tempGroups.findIndex((t) => t.groupId == currentGroup?._id);
    // if (!data.length) {
    //   if (
    //     tempGroups[ind] &&
    //     !tempGroups[ind].assets.find((t) => t.id == elm.internalId)
    //   ) {
    //     tempGroups.splice(ind, 1);
    //   }
    // }
    if (ind != -1) {
      data.forEach((elm) => {
        if (!tempGroups[ind].assets.find((t) => t.id == elm.internalId)) {
          tempGroups[ind].assets.push({
            html: elm.name,
            id: elm.internalId,
            ...getDatapointValues(elm),
            html3: elm?.packetFromPlatform?.c8y_Availability
              ? elm?.packetFromPlatform?.c8y_Availability?.status
              : "",
          });
        }
      });
      let tempAllGroups = JSON.parse(JSON.stringify(allGroups));
      let tempInd = tempAllGroups.findIndex((g) => g._id == currentGroup._id);
      if (tempAllGroups[tempInd + 1]) {
        currentGroup = tempAllGroups[tempInd + 1];
        setAssetsRow(tempAllGroups[tempInd + 1].devices, tempGroups);
        lastTime = false;
      } else {
        lastTime = true;
        currentGroup = "";
      }
      if (lastTime) {
        setRowState(tempGroups);
        setTempRows(tempGroups);
        aggregation.refetch();
      }
    }
  }

  useEffect(() => {
    if (devices.isSuccess && devices.data?.payload?.data) {
      let data = devices.data.payload?.data;
      if (!currentGroup) {
        let tempDevices = [...allDevices, ...data].filter(
          (d) => !d.associatedGroups.length
        );
        let otherRows = [];
        tempDevices.forEach((elm) => {
          if (
            !otherRows.find((o) => o.html2 == elm.internalId) &&
            elm.latestMeasurement
          ) {
            otherRows.push({
              html: elm.name,
              id: elm.internalId,
              ...getDatapointValues(elm),
              html3: elm?.packetFromPlatform?.c8y_Availability
                ? elm?.packetFromPlatform?.c8y_Availability?.status
                : "",
            });
          }
        });
        setOtherDevices(otherRows);
      }
    }
  }, [devices.isFetching]);

  function getServiceDatapointValues() {
    let datapoints = {};
    let serviceDatapoints = sensors;
    serviceDatapoints.forEach((s) => {
      datapoints[s.name] = s;
    });
    return datapoints;
  }

  function getMetaValues(elm) {
    let perm = props.layoutPermission.columns.includes("metaTags");
    let meta = {};
    elm.metaTags.forEach((m) => {
      meta[m.key] = m.value;
    });
    return perm ? meta : [];
  }

  function createData(html, id) {
    return {
      html,
      id,
    };
  }

  function getDatapointValues(elm) {
    let perm = props.layoutPermission.columns.includes("datapoints");
    let datapoints = {};
    if (elm.latestMeasurement) {
      Object.keys(elm.latestMeasurement).forEach((l) => {
        if (service.dataPointThresholds && service.dataPointThresholds.length) {
          service.dataPointThresholds.forEach((dp) => {
            if (elm.latestMeasurement[dp.datapoint?.name]) {
              datapoints[l] = {
                value:
                  elm.latestMeasurement[l].value +
                  " " +
                  elm.latestMeasurement[l].unit,
                color: getColor(elm.latestMeasurement[l].value, dp),
              };
            }
          });
        }
        if (elm.dataPointThresholds && elm.dataPointThresholds.length) {
          datapoints[l] = {
            value:
              elm.latestMeasurement[l].value +
              " " +
              elm.latestMeasurement[l].unit,
            color:
              elm.dataPointThresholds && elm.dataPointThresholds.length
                ? getColor(
                    elm.latestMeasurement[l].value,
                    elm.dataPointThresholds[0]
                  )
                : "#777",
          };
        }
        // if (sensors.find((s) => s.name == l)) {
        //   let name = sensors.find((s) => s.name == l).name;

        //   if (datapointAggregations && currentGroup) {
        //     if (datapointAggregations[currentGroup._id]) {
        //       if (datapointAggregations[currentGroup._id][name]) {
        //         datapointAggregations[currentGroup._id][name] =
        //           datapointAggregations[currentGroup._id][name] +
        //           "," +
        //           elm.latestMeasurement[l].value;
        //       } else {
        //         datapointAggregations[currentGroup._id][name] =
        //           elm.latestMeasurement[l].value;
        //       }
        //     } else {
        //       datapointAggregations[currentGroup._id] = {
        //         [name]: elm.latestMeasurement[l].value,
        //       };
        //     }
        //   }
        // }
      });
      return perm ? datapoints : [];
    }
  }

  function getDeviceInfo(elm) {
    let perm = props.layoutPermission.columns.includes("deviceInfo");
    return perm
      ? {
          firmware: elm.packetFromPlatform?.c8y_Hardware
            ? elm.packetFromPlatform.c8y_Hardware.firmwareVersion
            : "",
          serialNumber: elm.packetFromPlatform?.c8y_Hardware
            ? elm.packetFromPlatform.c8y_Hardware.serialNumber
            : "",
          imei: elm?.packetFromPlatform?.c8y_Mobile
            ? elm?.packetFromPlatform?.c8y_Mobile?.imei
            : "",
        }
      : [];
  }

  var status = (row) => {
    let connectivity =
      row.html3 ||
      devices?.data?.payload?.data?.find((d) => d.internalId == row.id)
        ?.packetFromPlatform?.c8y_Availability?.status;
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor:
              connectivity == "AVAILABLE"
                ? "#4caf50"
                : connectivity == "UNAVAILABLE"
                ? "#555555"
                : "#ba75d8",
          }}
        />
      </div>
    );
  };

  const getParentName = (row, child) => {
    if (child.parentChain.length) {
      if (child.parentChain.length == 1) {
        return row.name;
      } else {
        let tempGroup;
        let name;
        child.parentChain.forEach((parent, ind) => {
          if (ind == 0) {
            tempGroup = JSON.parse(JSON.stringify(row));
          } else {
            tempGroup = tempGroup.children.find((ch) => ch._id == parent);
            if (ind + 1 == child.parentChain.length) {
              name = tempGroup.name;
            }
          }
        });
        return name;
      }
    }
  };

  var more = (row, child = undefined) => {
    function moreDetails() {
      props.history.push(`/solutions/${props.link}/${row.id}/0`);
    }
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "max-content",
        }}
      >
        <div
          style={{
            backgroundColor: `rgb(${rgb.red}, ${rgb.green}, ${rgb.blue},0.1)`,
            padding: "4px 6px 4px 6px",
            borderRadius: "10px",
            cursor: "pointer",
            width: "max-content",
          }}
          id={`device-${row.id}`}
          onClick={moreDetails}
        >
          <p
            style={{
              color: metaDataValue.branding.primaryColor,
              fontSize: "12px",
            }}
          >
            <b>{row[child ? "name" : "html"] || row["html"]}</b>
          </p>
        </div>
      </div>
    );
  };

  function bgColor(i) {
    let num = 210 + i * 12;
    return "rgb(" + num + "," + num + "," + num + ")";
  }

  function ChildRow(props) {
    const { child, row, ind } = props;
    let len = expandedChild.length - 1;
    return (
      <React.Fragment>
        <TableRow
          style={{ backgroundColor: bgColor(ind + 1), cursor: "pointer" }}
          onClick={() => {
            if (expandedChild[len] && child._id == expandedChild[len]._id) {
              setChildAggregate(false);
              let tempChildren = JSON.parse(JSON.stringify(expandedChild));
              tempChildren[
                expandedChild.findIndex((c) => c._id == child._id)
              ].remove = true;
              setExpandedChild(tempChildren.filter((t) => !t.remove));
            } else {
              setChildAggregate(true);
              setExpandedChild(
                expandedChild.length ? [...expandedChild, child] : [child]
              );
            }
          }}
        >
          <TableCell align="center" component="th">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginRight: "14%",
                gap: 15,
              }}
            >
              <div
                style={{
                  color: "grey",
                  fontSize: 12,
                  display: "flex",
                  flex: 6,
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                {getParentName(row, child)}
                <div style={{ marginTop: 4, marginLeft: 10 }}>
                  <KeyboardArrowRightIcon
                    sx={{ color: "grey", fontSize: 15 }}
                  />
                </div>
              </div>
              <div style={{ flex: 5, textAlign: "start" }}>{child.name}</div>
            </div>
          </TableCell>
          {permission.includes("datapoints")
            ? sensors &&
              sensors.map((s, index) => (
                <TableCell sx={{ height: "15%" }} align="center" component="th">
                  {
                    // childAggregation.isFetching ? (
                    //   index == 0 ? (
                    //     <CircularProgress size={30} color="secondary" />
                    //   ) : null
                    // ) :
                    // child[s.name] ? (
                    //   child[s.name].toFixed(2)
                    // ) : (
                    //   "N/A"
                    // )
                    color ? (
                      // <Chip
                      //   label={
                      //     child[s.name]
                      //       ? parseFloat(child[s.name].value).toFixed(2)
                      //       : "N/A"
                      //   }
                      //   style={{
                      //     background: child[s.name]
                      //       ? child[s.name].color
                      //       : "#777",
                      //     color: "white",
                      //   }}
                      // />
                      //     <span style={{backgroundColor: child[s.name]
                      //       ? child[s.name].color
                      //       : "#777", color:'white', padding: '3px', borderRadius:'2px', fontWeight:'bold'}}>
                      //       {  child[s.name]
                      //           ? parseFloat(child[s.name].value).toFixed(2)
                      //           : "N/A"}
                      //     </span>
                      //   ) : child[s.name] && child[s.name].value ? (
                      //     parseFloat(child[s.name].value).toFixed(2)
                      //   ) : (
                      //     "N/A"
                      //   )
                      // }

                      <div
                        style={{
                          margin: "0px 30px",
                          width: "50px",
                          backgroundColor: child[s.name]
                            ? child[s.name].color || "#777"
                            : "#777",
                          color: "white",
                          borderRadius: "5px",
                          fontWeight: "bold",
                        }}
                      >
                        {child[s.name]
                          ? parseFloat(child[s.name].value).toFixed(2)
                          : "N/A"}
                      </div>
                    ) : child[s.name] && child[s.name].value ? (
                      <div style={{ margin: "0px 30px", width: "50px" }}>
                        {parseFloat(child[s.name].value).toFixed(2)}
                      </div>
                    ) : (
                      <div style={{ margin: "0px 30px", width: "50px" }}>
                        N/A
                      </div>
                    )
                  }
                </TableCell>
              ))
            : null}
        </TableRow>
        {expandedChild.length ? (
          <React.Fragment>
            <TableRow>
              <TableCell
                style={{ paddingBottom: 0, paddingTop: 0 }}
                colSpan={20}
              >
                <Collapse
                  in={
                    expandedChild?.length &&
                    // child.devices?.length &&
                    expandedChild?.find((e) => e._id == child._id)
                  }
                  timeout="auto"
                  unmountOnExit
                >
                  {child.devices.length ||
                  child.children?.find((c) => c.devices.length) ? (
                    <Box sx={{ margin: 1 }}>
                      <Typography variant="h6" gutterBottom component="div">
                        <div
                          style={{
                            display: "flex",
                            gap: 20,
                            alignItems: "center",
                          }}
                        >
                          <p>Assets ( {child.name} )</p>
                          <p style={{ fontSize: "11px", color: "lightgrey" }}>
                            Asset rows show last reading where as Group rows
                            show hourly aggregates
                          </p>
                        </div>
                      </Typography>
                      <Table stickyHeader aria-label="collapsible table">
                        <TableHead>
                          <TableRow>
                            <TableCell align="center">
                              <PowerIcon sx={{ color: "#666" }} />
                            </TableCell>
                            <TableCell align="center">Name</TableCell>
                            {permission.includes("datapoints")
                              ? sensors &&
                                sensors.map((s) => {
                                  return (
                                    <TableCell align="center">
                                      {s.friendlyName}
                                    </TableCell>
                                  );
                                })
                              : null}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {child.devices?.map((asset, assetInd) =>
                            expandedChild[expandedChild.length - 1]._id ==
                              child._id &&
                            (singleGroup.isFetching ||
                              singleFilteredGroup.isFetching) ? (
                              assetInd == 0 ? (
                                <div
                                  style={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                  }}
                                >
                                  <CircularProgress
                                    size={30}
                                    sx={{ margin: "20px 0px" }}
                                    color="secondary"
                                  />{" "}
                                </div>
                              ) : null
                            ) : (
                              <TableRow>
                                <TableCell
                                  align="center"
                                  component="th"
                                  scope="row"
                                  sx={{
                                    borderBottom:
                                      assetInd == child.devices - 1
                                        ? "none"
                                        : "1px solid rgba(224,224,224,1)",
                                  }}
                                >
                                  {status(asset)}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    width: "20% !important",
                                    borderBottom:
                                      assetInd == child.devices - 1
                                        ? "none"
                                        : "1px solid rgba(224,224,224,1)",
                                  }}
                                >
                                  {more(asset, "child")}
                                </TableCell>
                                {permission.includes("datapoints")
                                  ? sensors &&
                                    sensors.map((s) => {
                                      return (
                                        <TableCell
                                          sx={{
                                            borderBottom:
                                              assetInd == child.devices - 1
                                                ? "none"
                                                : "1px solid rgba(224,224,224,1)",
                                          }}
                                          align="center"
                                        >
                                          {color ? (
                                            // <Chip
                                            //   label={
                                            //     asset[s.name]
                                            //       ? parseFloat(
                                            //           asset[s.name].value
                                            //         ).toFixed(2)
                                            //       : "N/A"
                                            //   }
                                            //   style={{
                                            //     background: asset[s.name]
                                            //       ? asset[s.name].color
                                            //       : "#777",
                                            //     color: "white",
                                            //   }}
                                            // />
                                            //   <span style={{backgroundColor: asset[s.name]
                                            //     ? asset[s.name].color
                                            //     : "#777", color:'white', padding: '3px', borderRadius:'2px', fontWeight:'bold'}}>
                                            //     { asset[s.name]
                                            //         ? parseFloat(
                                            //             asset[s.name].value
                                            //           ).toFixed(2)
                                            //         : "N/A"}
                                            //   </span>
                                            // ) : asset[s.name] ? (
                                            //   parseFloat(
                                            //     asset[s.name].value
                                            //   ).toFixed(2)
                                            // ) : (
                                            //   "N/A"
                                            // )}
                                            <div
                                              style={{
                                                margin: "0px 30px",
                                                width: "50px",
                                                backgroundColor: asset[s.name]
                                                  ? asset[s.name].color ||
                                                    "#777"
                                                  : "#777",
                                                color: "white",
                                                borderRadius: "5px",
                                                fontWeight: "bold",
                                              }}
                                            >
                                              {asset[s.name]
                                                ? parseFloat(
                                                    asset[s.name].value
                                                  ).toFixed(2)
                                                : "N/A"}
                                            </div>
                                          ) : asset[s.name] ? (
                                            <div
                                              style={{
                                                margin: "0px 30px",
                                                width: "50px",
                                              }}
                                            >
                                              {parseFloat(
                                                asset[s.name].value
                                              ).toFixed(2)}
                                            </div>
                                          ) : (
                                            <div
                                              style={{
                                                margin: "0px 30px",
                                                width: "50px",
                                              }}
                                            >
                                              N/A
                                            </div>
                                          )}
                                        </TableCell>
                                      );
                                    })
                                  : null}
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </Box>
                  ) : (
                    <div
                      style={{
                        fontSize: 14,
                        textAlign: "center",
                        color: "#888",
                        margin: "15px 0px",
                      }}
                    >
                      No Assets
                    </div>
                  )}
                </Collapse>
              </TableCell>
            </TableRow>
            {child.children?.map((newChild) => {
              return <ChildRow row={row} ind={ind + 1} child={newChild} />;
            })}
          </React.Fragment>
        ) : null}
      </React.Fragment>
    );
  }

  function DeviceRow(props) {
    const { row } = props;
    return (
      <React.Fragment>
        <TableRow
          style={{ background: `${"rgb(210, 210, 210)"}`, cursor: "pointer" }}
          onClick={() => {
            if (expandedGroup && row.groupId == expandedGroup.groupId) {
              setTempRows([]);
              setExpandedGroup("");
              // setTempRows([]);
            } else {
              setExpandedGroup(row);
            }
          }}
        >
          <TableCell align="center">{row.name}</TableCell>

          {permission.includes("datapoints")
            ? sensors &&
              sensors.map((s, index) => (
                <TableCell sx={{ height: "15%" }} align="center">
                  {aggregation.isFetching && !expandedGroup ? (
                    index == 0 ? (
                      <CircularProgress size={30} color="secondary" />
                    ) : null
                  ) : // row[s.name] ? (
                  //   row[s.name].toFixed(2)
                  // ) : (
                  //   "N/A"
                  // )
                  color ? (
                    // <Chip
                    //   label={
                    //     row[s.name]
                    //       ? parseFloat(row[s.name].value).toFixed(2)
                    //       : "N/A"
                    //   }
                    //   style={{
                    //     background: row[s.name] ? row[s.name].color : "#777",
                    //     color: "white",
                    //   }}
                    // />
                    <div
                      style={{
                        margin: "0px 30px",
                        width: "50px",
                        backgroundColor: row[s.name]
                          ? row[s.name].color || "#777"
                          : "#777",
                        color: "white",
                        borderRadius: "5px",
                        fontWeight: "bold",
                      }}
                    >
                      {row[s.name]
                        ? parseFloat(row[s.name].value).toFixed(2)
                        : "N/A"}
                    </div>
                  ) : row[s.name] && row[s.name].value ? (
                    <div style={{ margin: "0px 30px", width: "50px" }}>
                      {parseFloat(row[s.name].value).toFixed(2)}
                    </div>
                  ) : (
                    <div style={{ margin: "0px 30px", width: "50px" }}>N/A</div>
                  )}
                </TableCell>
              ))
            : null}
        </TableRow>
        {expandedGroup &&
        // row.assets?.length &&
        row.groupId == expandedGroup.groupId ? (
          <TableRow
            sx={{
              visibility:
                expandedGroup &&
                // row.assets?.length &&
                row.groupId == expandedGroup.groupId
                  ? "inherit"
                  : "hidden",
            }}
          >
            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={20}>
              <Collapse
                in={
                  expandedGroup &&
                  // row.assets?.length &&
                  row.groupId == expandedGroup.groupId
                }
                timeout="auto"
                unmountOnExit
              >
                {row.assets.length ||
                row.children.find((c) => c.devices.length) ? (
                  <Box sx={{ margin: 1 }}>
                    <Typography variant="h6" gutterBottom component="div">
                      <div
                        style={{
                          display: "flex",
                          gap: 20,
                          alignItems: "center",
                        }}
                      >
                        <p>Assets ( {row.name} )</p>
                        <p style={{ fontSize: "11px", color: "lightgrey" }}>
                          Asset rows show last reading where as Group rows show
                          hourly aggregates
                        </p>
                      </div>
                    </Typography>
                    <Table stickyHeader aria-label="collapsible table">
                      <TableHead>
                        <TableRow>
                          <TableCell align="center">
                            <PowerIcon sx={{ color: "#666" }} />
                          </TableCell>
                          <TableCell align="center">Name</TableCell>
                          {permission.includes("datapoints")
                            ? sensors &&
                              sensors.map((s) => {
                                return (
                                  <TableCell align="center">
                                    {s.friendlyName}
                                  </TableCell>
                                );
                              })
                            : null}
                        </TableRow>
                      </TableHead>
                      <TableBody id="abcdef">
                        {row.assets?.map((asset, assetInd) => (
                          <TableRow>
                            <TableCell
                              sx={{
                                borderBottom:
                                  assetInd == row.assets.length - 1
                                    ? "none"
                                    : "1px solid rgba(224,224,224,1)",
                              }}
                              align="center"
                              component="th"
                              scope="row"
                            >
                              {status(asset)}
                            </TableCell>
                            <TableCell
                              sx={{
                                width: "20% !important",
                                borderBottom:
                                  assetInd == row.assets.length - 1
                                    ? "none"
                                    : "1px solid rgba(224,224,224,1)",
                              }}
                              align="center"
                            >
                              {more(asset)}
                            </TableCell>
                            {permission.includes("datapoints")
                              ? sensors &&
                                sensors.map((s) => {
                                  return (
                                    <TableCell
                                      sx={{
                                        borderBottom:
                                          assetInd == row.assets.length - 1
                                            ? "none"
                                            : "1px solid rgba(224,224,224,1)",
                                      }}
                                      align="center"
                                    >
                                      {color ? (
                                        // <Chip
                                        //   label={
                                        //     asset[s.name]
                                        //       ? parseFloat(
                                        //           asset[s.name].value
                                        //         ).toFixed(2)
                                        //       : "N/A"
                                        //   }
                                        //   style={{
                                        //     background: asset[s.name]
                                        //       ? asset[s.name].color
                                        //       : "#777",
                                        //     color: "white",
                                        //   }}
                                        // />
                                        //   <span style={{backgroundColor: asset[s.name]
                                        //     ? asset[s.name].color
                                        //     : "#777", color:'white', padding: '3px', borderRadius:'2px', fontWeight:'bold' }}>
                                        //     { asset[s.name]
                                        //         ? parseFloat(
                                        //             asset[s.name].value
                                        //           ).toFixed(2)
                                        //         : "N/A"}
                                        //   </span>
                                        // ) : asset[s.name] ? (
                                        //   parseFloat(asset[s.name].value).toFixed(
                                        //     2
                                        //   )
                                        // ) : (
                                        //   "N/A"
                                        // )}
                                        <div
                                          style={{
                                            margin: "0px 30px",
                                            width: "50px",
                                            backgroundColor: asset[s.name]
                                              ? asset[s.name].color || "#777"
                                              : "#777",
                                            color: "white",
                                            borderRadius: "5px",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          {asset[s.name]
                                            ? parseFloat(
                                                asset[s.name].value
                                              ).toFixed(2)
                                            : "N/A"}
                                        </div>
                                      ) : asset[s.name] ? (
                                        <div
                                          style={{
                                            margin: "0px 30px",
                                            width: "50px",
                                          }}
                                        >
                                          {parseFloat(
                                            asset[s.name].value
                                          ).toFixed(2)}
                                        </div>
                                      ) : (
                                        <div
                                          style={{
                                            margin: "0px 30px",
                                            width: "50px",
                                          }}
                                        >
                                          N/A
                                        </div>
                                      )}
                                    </TableCell>
                                  );
                                })
                              : null}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                ) : (
                  <div
                    style={{
                      fontSize: 14,
                      color: "#888",
                      textAlign: "center",
                      margin: "15px 0px",
                    }}
                  >
                    No Assets
                  </div>
                )}
              </Collapse>
            </TableCell>
          </TableRow>
        ) : null}
      </React.Fragment>
    );
  }

  function OtherDeviceRow(props) {
    const { row } = props;
    return (
      <React.Fragment>
        <TableRow
          sx={{
            "& > *": { borderBottom: "unset" },
            cursor: "pointer",
            height: "15%",
          }}
          style={{ backgroundColor: "rgb(210, 210, 210)" }}
          onClick={() => {
            setExpandedGroup("");
            setExpandedOtherGroup(!expandedOtherGroup);
          }}
        >
          <TableCell sx={{ whiteSpace: "nowrap" }} align="center">
            Other Assets
          </TableCell>

          {permission.includes("datapoints")
            ? sensors &&
              sensors.map((s, index) => <TableCell align="center"></TableCell>)
            : null}
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={20}>
            <Collapse in={expandedOtherGroup} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1, width: "100%" }}>
                <Typography variant="h6" gutterBottom component="div">
                  Assets
                </Typography>
                <Table stickyHeader aria-label="collapsible table">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <PowerIcon sx={{ color: "#666" }} />
                      </TableCell>
                      <TableCell>Name</TableCell>
                      {permission.includes("datapoints")
                        ? sensors &&
                          sensors.map((s) => {
                            return (
                              <TableCell align="center">{s.name}</TableCell>
                            );
                          })
                        : null}
                    </TableRow>
                  </TableHead>
                  <TableBody id="abcdef">
                    {row?.map((asset) => (
                      <TableRow>
                        <TableCell align="center" component="th" scope="row">
                          {status(asset)}
                        </TableCell>
                        <TableCell sx={{ width: "20% !important" }}>
                          {more(asset)}
                        </TableCell>
                        {permission.includes("datapoints")
                          ? sensors &&
                            sensors.map((s) => {
                              return (
                                <TableCell align="center">
                                  {parseFloat(asset[s.name]?.value).toFixed(2)}
                                </TableCell>
                              );
                            })
                          : null}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }

  return groups.isSuccess ||
    allGroupsState?.length ||
    singleGroup?.data?.payload?.length ||
    singleFilteredGroup?.data?.payload?.length ? (
    rows.length ? (
      !aggregation.isFetching &&
      filterDevice.group?.id &&
      !rows.find((a) => a.groupId == filterDevice.group?.id) ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <h1 style={{ color: "lightgrey", fontSize: 20 }}>
            Cannot construct hierarchical list view from given groups
          </h1>
        </div>
      ) : (
        <Paper
          sx={{
            width: "100%",
            overflow: "scroll",
            // height: props.open ? "calc(100vh - 150px)" : "100%",
            height: props.open ? ( props.emDashboard ? "calc(100vh - 20px)" : "calc(100vh - 150px)") : "100%",
          }}
        >
          <TableContainer sx={{ overflowX: "overlay", height: "100%" }}>
            <Table stickyHeader aria-label="collapsible table">
              <TableHead sx={{ height: "15%" }}>
                <TableRow>
                  {/* <TableCell></TableCell> */}
                  <TableCell sx={{ whiteSpace: "nowrap" }} align="center">
                    Group name
                  </TableCell>
                  {permission.includes("datapoints")
                    ? sensors &&
                      sensors.map((s) => {
                        return (
                          <TableCell align="center">{s.friendlyName}</TableCell>
                        );
                      })
                    : null}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <React.Fragment>
                    <DeviceRow key={row.name} row={row} />
                    {expandedGroup &&
                      // row.assets?.length &&
                      row.groupId == expandedGroup.groupId &&
                      row.children?.map((child) => {
                        return <ChildRow row={row} ind={0} child={child} />;
                      })}
                  </React.Fragment>
                ))}
                {otherDevices.length ? (
                  <OtherDeviceRow key={"device"} row={otherDevices} />
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )
    ) : (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <h1 style={{ color: "lightgrey", fontSize: 20 }}>
          Cannot construct hierarchical list view from given groups
        </h1>
      </div>
    )
  ) : !aggregation.isFetching &&
    filterDevice.group?.id &&
    !rows.find((a) => a.groupId == filterDevice.group?.id) ? (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <h1 style={{ color: "lightgrey", fontSize: 20 }}>
        Cannot construct hierarchical list view from given groups
      </h1>
    </div>
  ) : (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress size={60} color="secondary" />
    </div>
  );
}
