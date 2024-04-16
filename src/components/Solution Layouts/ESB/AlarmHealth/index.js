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
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

import { useGetNumOfAlarmsQuery } from "services/devices";
import { useGetAlarmsCountQuery } from "services/alarms";

export default function AlarmHealth(props) {
  const filtersValue = useSelector((state) => state.filterDevice);
  const [legends, setLegends] = React.useState(null);
  const [data, setData] = React.useState(null);

  const alarmsCounts = useGetAlarmsCountQuery({
    token: window.localStorage.getItem("token"),
    status: '["ACTIVE","ACKNOWLEDGED"]',
    severity: '["CRITICAL","MAJOR","MINOR","WARNING"]',
    serviceId: props.id
  });



  useEffect(() => {
    if (alarmsCounts.isSuccess) {
      let data = []
      let legendObj = {}
      let totalAlarms = 0

      Object.keys(alarmsCounts.data?.payload).map((x, i) => {
        let category = x.charAt(0).toUpperCase() + x.slice(1).toLocaleLowerCase();
        let alarmsCount = alarmsCounts.data?.payload[x];
        let totalAlarmsCount = alarmsCount.ACKNOWLEDGED + alarmsCount.ACTIVE
        legendObj[x] = totalAlarmsCount
        totalAlarms += totalAlarmsCount
        data.push({ value: totalAlarmsCount, category: category })

        if (Object.keys(alarmsCounts.data?.payload).length - 1 == i) {
          legendObj.TOTAL = totalAlarms
          setData(data);
          setLegends(legendObj)

        }
      })

    }
  }, [alarmsCounts.isFetching]);

  return (
    <Card
      style={{
        maxHeight: "220px",
        minHeight: "155px",
        maxWidth: "100%",
        // minWidth: "255px",
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
            <b>Overview</b>
          </p>
          <NotificationsActiveIcon style={{ color: "#bfbec8" }} />
        </span>
        <div
          style={{
            height: "130px",
            width: "100%",
            position: 'relative'
          }}
        >
          {!alarmsCounts.isLoading && data ? (
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
                      justifyContent: "space-evenly",
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
                      // {
                      //     name: "HEALTHY",
                      //     color: "#5fb762",
                      //     fade: "rgb(95,183,98,0.1)",
                      // },
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
                        {elm.name !== "HEALTHY" ? <p style={{ fontSize: "11px", color: elm.color }}>
                          <b>
                            {elm.name.charAt(0).toUpperCase() + elm.name.slice(1).toLocaleLowerCase() + ' ' + legends[elm.name]}
                          </b>
                        </p> : null}
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
