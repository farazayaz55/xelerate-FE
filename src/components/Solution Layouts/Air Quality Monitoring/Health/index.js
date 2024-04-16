//--------------CORE------------------------//
import React, { Fragment, useEffect } from "react";
import { useSelector } from "react-redux";
//--------------MUI------------------------//
import Card from "@mui/material/Card";
//--------------MUI ICONS------------------------//
import AssetHealthIcon from "assets/icons/health.png";
//--------------EXTERNAL------------------------//
import { useGetHealthQuery } from "services/devices";
import SAPChart from "components/Charts/SAP-Donut";
import Loader from "components/Progress";
import Nodata from "assets/img/pieChart.png";
import emitter from "Utilities/events";

import "./style.css";

export default function AssetCard(props) {
  const filtersValue = useSelector((state) => state.filterDevice);
  const [legends, setLegends] = React.useState(null);
  const [data, setData] = React.useState(null);
  const devicesRes = useGetHealthQuery({
    token: window.localStorage.getItem("token"),
    id: props.id,
    params: `&MeasurementFilter=${filtersValue.measurement}&connected=${
      filtersValue.connection
    }&alarms=${filtersValue.alarms}&groupId=${
      filtersValue.group.id
    }&metaTags=${filtersValue.metaTags}&assetTypes=${filtersValue.assetTypes}`,
  }, {});

  function callbackfn(payload) {
    updateData(payload.message);
  }

  useEffect(() => {
    emitter.on("solution?deviceDashboardHealth", callbackfn);
    return () => {
      emitter.off("solution?deviceDashboardHealth", callbackfn);
    };
  }, []);

  useEffect(() => {
    console.log("props.refetch", props.refetch)
    if(props.refetch){
      devicesRes.refetch()
    }
  }, [props.refetch])

  function updateData(payload) {
    console.log({payload})
    setLegends({
      CRITICAL:
        (payload?.CRITICAL.length > 0 ? payload?.CRITICAL[0].count : 0) +
        (payload?.MAJOR.length > 0 ? payload?.MAJOR[0].count : 0) +
        (payload?.MINOR.length > 0 ? payload?.MINOR[0].count : 0),
      HEALTHY:
        (payload?.HEALTHY.length > 0 ? payload?.HEALTHY[0].count : 0) +
        (payload?.WARNING.length > 0 ? payload?.WARNING[0].count : 0),
      TOTAL:
        (payload?.CRITICAL.length > 0 ? payload?.CRITICAL[0].count : 0) +
        (payload?.MAJOR.length > 0 ? payload?.MAJOR[0].count : 0) +
        (payload?.MINOR.length > 0 ? payload?.MINOR[0].count : 0) +
        (payload?.WARNING.length > 0 ? payload?.WARNING[0].count : 0) +
        (payload?.HEALTHY.length > 0 ? payload?.HEALTHY[0].count : 0),
    });
    let data = [];
    if (
      payload?.CRITICAL.length > 0
        ? payload?.CRITICAL[0].count
        : false || payload?.MAJOR.length > 0
        ? payload?.MAJOR[0].count
        : false || payload?.MINOR.length > 0
        ? payload?.MINOR[0].count
        : false || payload?.WARNING.length > 0
        ? payload?.WARNING[0].count
        : false
    )
    data.push({
      value:
      (payload?.CRITICAL.length > 0 ? payload?.CRITICAL[0].count : 0) +
      (payload?.MAJOR.length > 0 ? payload?.MAJOR[0].count : 0) +
      (payload?.MINOR.length > 0 ? payload?.MINOR[0].count : 0),
      category: "Abnormal",
    });

    data.push({
      value: (payload?.HEALTHY.length > 0 ? payload?.HEALTHY[0].count : 0) +
      (payload?.WARNING.length > 0 ? payload?.WARNING[0].count : 0),
      category: "Healthy",
    });

    setData(data);
  }

  useEffect(() => {
    console.log({legends})
  }, [legends])

  useEffect(() => {
    if (devicesRes.isSuccess) {
      updateData(devicesRes.data?.payload[0]);
      props.setRefetch(false)
    }
  }, [devicesRes.isFetching]);

  return (
    <Card
      style={{
        maxHeight: "240px",
        minHeight: "240px",
        height: "100%",
        maxWidth: "255px",
        minWidth: "255px",
      }}
    >
      <div style={{ padding: "10px" }}>
        <span
          style={{
            display: "flex",
            gap: "15px",
            flex: 1,
            alignItems: "center",
            marginLeft: "5px",
          }}
        >
          <img
            src={AssetHealthIcon}
            style={{ maxHeight: "17px", maxWidth: "20px" }}
          />
          <p
            style={{
              color: "black",
              fontSize: "14px",
              letterSpacing: "1px",
            }}
          >
            <b>ASSET ALERTS</b>
          </p>
        </span>
        <div
          style={{
            height: "170px",
            width: "100%",
          }}
        >
          {!devicesRes.isFetching && data ? (
            <Fragment>
              {legends.TOTAL > 0 ? (
                <Fragment>
                  <SAPChart name="Health" data={data} />
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      width: "100%",
                      marginTop: "2px",
                    }}
                  >
                    {[
                      {
                        name: "With Alerts",
                        id: "CRITICAL",
                        color: "#bf3535",
                        background: "rgb(191,53,53,0.1)",
                      },
                      {
                        name: "Without Alerts",
                        id: "HEALTHY",
                        color: "#79c37c",
                        background: "rgb(121,195,124,0.1)",
                      },
                    ].map((e) => (
                      <span
                        style={{
                          background: e.background,
                          textAlign: "center",
                          width: "50%",
                          borderRadius: "10px",
                          color: e.color,
                          padding: "6px",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "22px",
                            marginBottom: "5px",
                          }}
                        >
                          <b>{legends[e.id]}</b>
                        </p>
                        <p
                          style={{
                            fontSize: "12px",
                          }}
                        >
                          <b>{e.name}</b>
                        </p>
                      </span>
                    ))}
                  </div>
                </Fragment>
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
          ) : (
            <div
              style={{
                marginTop: "30%",
              }}
            >
              <Loader />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
