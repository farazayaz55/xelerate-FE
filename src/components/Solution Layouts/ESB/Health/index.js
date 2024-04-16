//--------------CORE------------------------//
import React, { Fragment, useEffect } from "react";
import { useSelector } from "react-redux";
//--------------MUI------------------------//
import Card from "@mui/material/Card";
//--------------MUI ICONS------------------------//
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
//--------------EXTERNAL------------------------//
import { useGetHealthQuery } from "services/devices";
import Chart from "components/Charts/Donut";
import Loader from "components/Progress";
import Nodata from "assets/img/pieChart.png";
import "./style.css";

export default function AssetCard(props) {
  const filtersValue = useSelector((state) => state.filterDevice);
  const [legends, setLegends] = React.useState(null);
  const [data, setData] = React.useState(null);

  const devicesRes = useGetHealthQuery({
    token: window.localStorage.getItem("token"),
    id: props.id,
    group: filtersValue.group.id,
  });

  useEffect(() => {
    if (devicesRes.isSuccess) {
      setLegends({
        CRITICAL:
          devicesRes.data?.payload[0].CRITICAL.length > 0
            ? devicesRes.data?.payload[0].CRITICAL[0].count
            : 0,
        MAJOR:
          devicesRes.data?.payload[0].MAJOR.length > 0
            ? devicesRes.data?.payload[0].MAJOR[0].count
            : 0,
        MINOR:
          devicesRes.data?.payload[0].MINOR.length > 0
            ? devicesRes.data?.payload[0].MINOR[0].count
            : 0,
        WARNING:
          devicesRes.data?.payload[0].WARNING.length > 0
            ? devicesRes.data?.payload[0].WARNING[0].count
            : 0,
        HEALTHY:
          devicesRes.data?.payload[0].HEALTHY.length > 0
            ? devicesRes.data?.payload[0].HEALTHY[0].count
            : 0,
        TOTAL:
          (devicesRes.data?.payload[0].CRITICAL.length > 0
            ? devicesRes.data?.payload[0].CRITICAL[0].count
            : 0) +
          (devicesRes.data?.payload[0].MAJOR.length > 0
            ? devicesRes.data?.payload[0].MAJOR[0].count
            : 0) +
          (devicesRes.data?.payload[0].MINOR.length > 0
            ? devicesRes.data?.payload[0].MINOR[0].count
            : 0) +
          (devicesRes.data?.payload[0].WARNING.length > 0
            ? devicesRes.data?.payload[0].WARNING[0].count
            : 0) +
          (devicesRes.data?.payload[0].HEALTHY.length > 0
            ? devicesRes.data?.payload[0].HEALTHY[0].count
            : 0),
      });
      let data = [];
      if (
        devicesRes.data?.payload[0].CRITICAL.length > 0
          ? devicesRes.data?.payload[0].CRITICAL[0].count
          : 0 > 0
      )
        data.push({
          value:
            devicesRes.data?.payload[0].CRITICAL.length > 0
              ? devicesRes.data?.payload[0].CRITICAL[0].count
              : 0,
          category: "Critical",
        });

      if (
        devicesRes.data?.payload[0].MAJOR.length > 0
          ? devicesRes.data?.payload[0].MAJOR[0].count
          : 0 > 0
      )
        data.push({
          value:
            devicesRes.data?.payload[0].MAJOR.length > 0
              ? devicesRes.data?.payload[0].MAJOR[0].count
              : 0,
          category: "Major",
        });

      if (
        devicesRes.data?.payload[0].MINOR.length > 0
          ? devicesRes.data?.payload[0].MINOR[0].count
          : 0 > 0
      )
        data.push({
          value:
            devicesRes.data?.payload[0].MINOR.length > 0
              ? devicesRes.data?.payload[0].MINOR[0].count
              : 0,
          category: "Minor",
        });

      if (
        devicesRes.data?.payload[0].WARNING.length > 0
          ? devicesRes.data?.payload[0].WARNING[0].count
          : 0 > 0
      )
        data.push({
          value:
            devicesRes.data?.payload[0].WARNING.length > 0
              ? devicesRes.data?.payload[0].WARNING[0].count
              : 0,
          category: "Warning",
        });

      if (
        devicesRes.data?.payload[0].HEALTHY.length > 0
          ? devicesRes.data?.payload[0].HEALTHY[0].count
          : 0 > 0
      )
        data.push({
          value:
            devicesRes.data?.payload[0].HEALTHY.length > 0
              ? devicesRes.data?.payload[0].HEALTHY[0].count
              : 0,
          category: "Healthy",
        });
      setData(data);
    }
  }, [devicesRes.isFetching]);

  return (
    <Card
      style={{
        maxHeight: "220px",
        minHeight: "155px",
        maxWidth: "255px",
        minWidth: "255px",
      }}
    >
      <div style={{ paddingTop: "10px" }}>
        <span
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <p
            style={{
              color: "#bfbec8",
              fontSize: "15px",
            }}
          >
            <b>Asset Health</b>
          </p>
          <HealthAndSafetyIcon style={{ color: "#bfbec8" }} />
        </span>
        <div
          style={{
            height: "130px",
            width: "100%",
            position: 'relative'
          }}
        >
          {!devicesRes.isLoading && data ? (
            <Fragment>
              {legends.TOTAL > 0 ? (
                <div>
                  <Chart name="Health" data={data} />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      position: 'absolute',
                      justifyContent: "center",
                      margin: "0px 10px 0px 10px",
                      right: -10,
                      top: 0,
                      bottom: 0,
                    }}
                  >
                    {[
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
                      {
                        name: "HEALTHY",
                        color: "#5fb762",
                        fade: "rgb(95,183,98,0.1)",
                      },
                    ].map((elm) => (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "3.5px",
                          backgroundColor: elm.fade,
                          padding: "0px 6px 0px 6px",
                          borderRadius: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: "7px",
                            height: "7px",
                            backgroundColor: elm.color,
                            borderRadius: "50%",
                          }}
                        />
                        <p style={{ fontSize: "11px", color: elm.color }}>
                          <b>
                            {elm.name == "HEALTHY"
                              ? `Healthy ${legends[elm.name]} `
                              : legends[elm.name]}
                          </b>
                        </p>
                      </div>
                    ))}
                    {/* <span
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "50%",
                        marginRight: "10px",
                        gap: "5px",
                      }}
                    >
                      {[
                        {
                          name: "CRITICAL",
                          color: "#bf3535",
                          fade: "rgb(191,53,53,0.1)",
                        },
                        {
                          name: "MINOR",
                          color: "#fe9f1b",
                          fade: "rgb(254,160,60,0.1)",
                        },
                      ].map((elm) => (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: elm.fade,
                              padding: "0px 6px 0px 6px",
                              borderRadius: "10px",
                            }}
                          >
                            <p
                              style={{
                                color: elm.color,
                                fontSize: "11px",
                              }}
                            >
                              <b>{elm.name}</b>
                            </p>
                          </div>
                          <p style={{ fontSize: "12px", color: "#555555" }}>
                            <b>{`${parseInt(
                              (legends[elm.name] / legends.TOTAL) * 100
                            )}%`}</b>
                          </p>
                        </span>
                      ))}
                    </span>

                    <span
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "50%",
                        marginLeft: "10px",
                        gap: "5px",
                      }}
                    >
                      {[
                        {
                          name: "MAJOR",
                          color: "#844204",
                          fade: "rgb(132,66,4,0.1)",
                        },
                        {
                          name: "WARNING",
                          color: "#3399ff",
                          fade: "rgb(66,161,255,0.1)",
                        },
                      ].map((elm) => (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: elm.fade,
                              padding: "0px 6px 0px 6px",
                              borderRadius: "10px",
                            }}
                          >
                            <p
                              style={{
                                color: elm.color,
                                fontSize: "11px",
                              }}
                            >
                              <b>{elm.name}</b>
                            </p>
                          </div>
                          <p style={{ fontSize: "12px", color: "#555555" }}>
                            <b>{`${parseInt(
                              (legends[elm.name] / legends.TOTAL) * 100
                            )}%`}</b>
                          </p>
                        </span>
                      ))}
                    </span> */}
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
          ) : (
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
          )}
        </div>
      </div>
    </Card>
  );
}
