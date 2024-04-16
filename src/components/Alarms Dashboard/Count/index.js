import React, { useState, Fragment, useEffect, memo } from "react";
import Loader from "components/Progress";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import Card from "@mui/material/Card";
import { useSelector, useDispatch } from "react-redux";
import Chart from "components/Charts/Donut";
import Nodata from "assets/img/pieChart.png";
import { useGetAlarmsQuery } from "../../../services/alarms";

function Count({
  type,
  setAllAlarms,
  generateRows,
  generateExportData,
  loading,
  sensorIds,
  serviceId
}) {
  const metaDataValue = useSelector((state) => state.metaData);
  const [totalDocuments,setTotalDocuments]=useState(null)
  let priorities = ["CRITICAL", "MAJOR", "MINOR", "WARNING"];
  let statuses = ["ACTIVE", "ACKNOWLEDGED", "CLEARED"];
  const [legends, setLegends] = useState({ priorities: [], status: [] });
  const [alarmsCount, setAlarmsCount] = useState({
    priorities: [],
    status: [],
  });
  const alarmsFilter = useSelector((state) => state.alarmsFilter);
  const groupIds = []
  metaDataValue?.services.forEach(s=>{
    if(s.group?.id){
      groupIds.push(`${s.id}:${s.group?.id}`)
    }
  })
  const alarmsRes = useGetAlarmsQuery({
    token: window.localStorage.getItem("token"),
    params: `?dashboard=true&${
      alarmsFilter.priority.length
        ? `priority=${JSON.stringify(alarmsFilter.priority)}&`
        : ""
    }${
      (alarmsFilter.solutions.length && alarmsFilter.solutions[0] != "All") || (serviceId)
        ? `serviceId=${
          serviceId || metaDataValue.services.find(
              (s) => s.name == alarmsFilter.solutions[0]
            ).id
          }&`
        : ""
    }${
      alarmsFilter.status.length
        ? `status=${JSON.stringify(alarmsFilter.status)}&`
        : ""
    }${alarmsFilter.search.rule ? `type=${alarmsFilter.search.rule}&` : ""}${
      sensorIds.length ? `source=${JSON.stringify(sensorIds)}&` : ""
    }dateFrom=${new Date(
      new Date(alarmsFilter.date.startTime).setSeconds(0)
    ).toISOString()}&dateTo=${new Date(
      new Date(alarmsFilter.date.endTime).setSeconds(0)
    ).toISOString()}${
      alarmsFilter.emails ? `emails=${alarmsFilter.emails}&` : ""
    }${alarmsFilter.actuations ? `actuations=${alarmsFilter.actuations}` : ""}${(alarmsFilter.solutions.length && alarmsFilter.solutions[0] != "All" && metaDataValue.services.find(s=>s.name == alarmsFilter.solutions[0]).group?.id) || (serviceId) ? `&groupId=${metaDataValue.services.find(s=> serviceId ? (s.id == serviceId) : (s.name == alarmsFilter.solutions[0])).group?.id}` : groupIds.length ? `&groupId=${JSON.stringify(groupIds)}`
    : ``}${`&pageSize=10&withTotalPages=true&currentPage=1`}
            `,
  },
  {
    skip:totalDocuments!=null
  }); //just calling this api to get totalDocuments


  const allAlarmsRes = useGetAlarmsQuery(
    {
    token: window.localStorage.getItem("token"),
    params: `?dashboard=true&${
      alarmsFilter.priority.length
        ? `priority=${JSON.stringify(alarmsFilter.priority)}&`
        : ""
    }${
      (alarmsFilter.solutions.length && alarmsFilter.solutions[0] != "All") || (serviceId)
        ? `serviceId=${
          serviceId || metaDataValue.services.find(
              (s) => s.name == alarmsFilter.solutions[0]
            ).id
          }&`
        : ""
    }${
      alarmsFilter.status.length
        ? `status=${JSON.stringify(alarmsFilter.status)}&`
        : ""
    }${alarmsFilter.search.rule ? `type=${alarmsFilter.search.rule}&` : ""}${
      sensorIds.length ? `source=${JSON.stringify(sensorIds)}&` : ""
    }dateFrom=${new Date(
      new Date(alarmsFilter.date.startTime).setSeconds(0)
    ).toISOString()}&dateTo=${new Date(
      new Date(alarmsFilter.date.endTime).setSeconds(0)
    ).toISOString()}${
      alarmsFilter.emails ? `emails=${alarmsFilter.emails}&` : ""
    }${alarmsFilter.actuations ? `actuations=${alarmsFilter.actuations}` : ""}${(alarmsFilter.solutions.length && alarmsFilter.solutions[0] != "All" && metaDataValue.services.find(s=>s.name == alarmsFilter.solutions[0]).group?.id) || (serviceId) ? `&groupId=${metaDataValue.services.find(s=> serviceId ? (s.id == serviceId) : (s.name == alarmsFilter.solutions[0])).group?.id}` : groupIds.length ? `&groupId=${JSON.stringify(groupIds)}`: ``}&pageSize=${totalDocuments==0?10:totalDocuments}&withTotalPages=true&currentPage=1
            `,
  },
  {skip:alarmsRes.isFetching || totalDocuments==null}//conditioanl fetch
  );

  function getCountsBy(type, count) {
    let tempCounts = [];
    for (let a in count) {
      tempCounts.push({
        value: count[a],
        category: a[0] + a.toLowerCase().slice(1),
      });
    }
    (type == "priorities" ? priorities : statuses).forEach((s) => {
      if (!count[s]) {
        count[s] = 0;
      }
    });
    return tempCounts;
  }

  useEffect(() => {
    if (!alarmsRes.isFetching && alarmsRes.isSuccess ) {
      console.log(alarmsRes.data.payload.totalDocuments)
      setTotalDocuments(alarmsRes.data.payload.totalDocuments)
    }
  }, [alarmsRes.isFetching]);

  useEffect(()=>{
    if (!allAlarmsRes.isFetching && allAlarmsRes.isSuccess) {
      let data = allAlarmsRes.data.payload.data;
      console.log("data",data)
      let exportData;
      if (data ) {
        exportData = generateRows(data);
        if (exportData && exportData.length) {
          generateExportData(exportData);
        }
        let tempPriorities = {};
        let tempStatus = {};
        let total = 0;
        let tempLegends = {};
        setAllAlarms(data);
        data.forEach((d) => {
          tempPriorities[d.severity] = tempPriorities[d.severity]
            ? tempPriorities[d.severity] + 1
            : 1;
          tempStatus[d.status] = tempStatus[d.status]
            ? tempStatus[d.status] + 1
            : 1;
          total = total + 1;
        });
        Object.keys(tempPriorities).forEach((t) => {
          if (tempPriorities[t] == 0) {
            delete tempPriorities[t];
          }
        });
        Object.keys(tempStatus).forEach((t) => {
          if (tempStatus[t] == 0) {
            delete tempStatus[t];
          }
        });

        setAlarmsCount({
          priorities: getCountsBy("priorities", tempPriorities),
          status: getCountsBy("status", tempStatus),
        });
        tempLegends = {
          priorities: { ...tempPriorities, TOTAL: total },
          status: { ...tempStatus, TOTAL: total },
        };
        setLegends(tempLegends);
      } else {
        setAllAlarms([]);
        setLegends({ priorities: [], status: [] });
        setAlarmsCount({ priorities: [], status: [] });
      }
    }
  },[allAlarmsRes.isFetching])

  function getLegendsByChart() {
    let priorities = [
      {
        name: "CRITICAL",
        color: "#bf3535",
        fade: "rgb(191,53,53,0.1)",
      },
      {
        name: "MAJOR",
        color: "#844204",
        fade: "rgb(132,66,4,0.1)",
      },
      {
        name: "MINOR",
        color: "#fe9f1b",
        fade: "rgb(254,160,60,0.1)",
      },
      {
        name: "WARNING",
        color: "#3399ff",
        fade: "rgb(66,161,255,0.1)",
      },
    ];
    let statuses = [
      {
        name: "CLEARED",
        color: "#bf3535",
        fade: "rgb(191,53,53,0.1)",
      },
      {
        name: "ACKNOWLEDGED",
        color: "#3399ff",
        fade: "rgb(66,161,255,0.1)",
      },
      {
        name: "ACTIVE",
        color: "#5fb762",
        fade: "rgb(95,183,98,0.1)",
      },
    ];
    return (type == "priorities" ? priorities : statuses).map((elm) => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "3.5px",
          backgroundColor: elm.fade,
          padding: "5px 15px",
          borderRadius: "10px",
        }}
      >
        <span
          style={{ color: elm.color, fontWeight: "bold", fontSize: "11px" }}
        >
          {elm.name}
        </span>
        <p style={{ fontSize: "11px", color: elm.color }}>
          <b>
            {type == "priorities" && elm.name == "HEALTHY"
              ? `${legends[type][elm.name]} `
              : legends[type][elm.name]}
          </b>
        </p>
      </div>
    ));
  }

  return (
    <Card
      style={{
        maxHeight: "220px",
        minHeight: "265px",
        maxWidth: "255px",
        minWidth: "255px",
        margin: "10px 16px 16px 0px",
      }}
    >
      <div>
        <span
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 10px 0px 10px",
          }}
        >
          <p
            style={{
              color: "#bfbec8",
              fontSize: "15px",
              textTransform: "capitalize",
            }}
          >
            <b>{`${type == "priorities" ? "Priority" : type}`}</b>
          </p>
          <NotificationsActiveOutlinedIcon style={{ color: "#bfbec8" }} />
        </span>
        <div
          style={{
            height: "170px",
            width: "100%",
          }}
        >
          {alarmsRes.isFetching || loading ? (
            <span
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                width: "100%",
              }}
            >
              <Loader />
            </span>
          ) : (
            <Fragment>
              {alarmsCount[type].length ? (
                <div>
                  <Chart
                    name={type == "priorities" ? "priority" : type}
                    data={alarmsCount[type]}
                  />
                  <div
                    style={{
                      display: "flex",
                      height: "60px",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "20px 10px 20px 10px",
                    }}
                  >
                    <div className="grid" style={{ bottom: "0px !important" }}>
                      {getLegendsByChart()}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    display: "flex",
                    flexDirection: "column",
                    color: "#c8c8c8",
                  }}
                >
                  <img src={Nodata} height="100px" width="100px" />
                  <p>No Alarms Found</p>
                </div>
              )}
            </Fragment>
          )}
        </div>
      </div>
    </Card>
  );
}
export default memo(Count);
