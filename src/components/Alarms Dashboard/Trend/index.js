import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Loader from "components/Progress";
import Chart from "components/Charts/Stacked Bar Chart";
import Card from "@mui/material/Card";
import Nodata from "assets/img/pieChart.png";
import { useGetAlarmsQuery } from "../../../services/alarms";
import {
  setMapPage,
  setListPage,
  setLiveArr,
  setView,
} from "rtkSlices/AssetViewSlice";
import { resetFilter } from "rtkSlices/filterDevicesSlice";
import {  useDispatch } from "react-redux";

const startTime = new Date().setDate(new Date().getDate() - 14);
const endTime = new Date();

export default function Trend({ sensorIds, loading, serviceId }) {
  let priorities = ["CRITICAL", "MAJOR", "MINOR", "WARNING"];
  let statuses = ["ACTIVE", "ACKNOWLEDGED", "CLEARED"];
  let token = window.localStorage.getItem("token");
  const metaDataValue = useSelector((state) => state.metaData);
  const [alarmsData, setAlarmsData] = useState([]);
  const alarmsFilter = useSelector((state) => state.alarmsFilter);
  const groupIds = []
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(setMapPage(1));
      dispatch(setListPage(1));
      dispatch(resetFilter());
    };
  }, []);
  metaDataValue?.services.forEach(s=>{
    if(s.group?.id){
      groupIds.push(`${s.id}:${s.group?.id}`)
    }
  })
  const chartRes = useGetAlarmsQuery({ 
    token,
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
      new Date(startTime).setSeconds(0)
    ).toISOString()}&dateTo=${new Date(
      new Date(endTime).setSeconds(0)
    ).toISOString()}${
      alarmsFilter.emails ? `emails=${alarmsFilter.emails}&` : ""
    }${alarmsFilter.actuations ? `actuations=${alarmsFilter.actuations}` : ""}${(alarmsFilter.solutions.length && alarmsFilter.solutions[0] != "All" && metaDataValue.services.find(s=>s.name == alarmsFilter.solutions[0]).group?.id) || (serviceId) ? `&groupId=${metaDataValue.services.find(s=> serviceId ? (s.id == serviceId) : (s.name == alarmsFilter.solutions[0])).group?.id}` : groupIds.length ? `&groupId=${JSON.stringify(groupIds)}`: ``}`,
  });

  useEffect(() => {
    if (chartRes.isSuccess) {
      let data = chartRes.data.payload.data;
      if (data && data.length) {
        getChartData(data);
      } else {
        setAlarmsData([]);
      }
    }
  }, [chartRes.isFetching]);

  function getChartData(data) {
    let temp = [];
    data.forEach((d) => {
      let day = new Date(d.creationTime).toLocaleDateString();
      let ind = temp.findIndex((t) => t.time == day);
      if (ind != -1) {
        temp[ind][d.severity] = temp[ind][d.severity]
          ? temp[ind][d.severity] + d.count
          : d.count;
      } else {
        temp.push({
          time: new Date(d.creationTime).toLocaleDateString(),
          [d.severity]: d.count,
        });
      }
    });
    temp.forEach((t) => {
      priorities.forEach((p) => {
        if (!t[p]) {
          t[p] = 0;
        }
      });
    });
    setAlarmsData(temp.reverse());
  }

  return (
    <Card
      style={{
        minHeight: "265px",
        verticalAlign: "middle",
        position: "relative",
        width: "100%",
        padding: "16px",
        margin: "10px 0px 16px 0px",
      }}
    >
      <p
        style={{
          color: "#bfbec8",
          fontSize: "15px",
        }}
      >
        <b>{`Trend ( past two weeks )`}</b>
      </p>
      {chartRes.isFetching || loading ? (
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
      ) : alarmsData.length ? (
        <Chart data={alarmsData} name="Alarms" />
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
    </Card>
  );
}
