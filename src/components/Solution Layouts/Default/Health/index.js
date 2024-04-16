//--------------CORE------------------------//
import React, { Fragment, useEffect } from "react";
import { useSelector } from "react-redux";
//--------------MUI------------------------//
import Card from "@mui/material/Card";
import Tooltip from "@mui/material/Tooltip";
import { tooltipClasses} from "@mui/material/Tooltip";
import {styled} from "@mui/material/styles";
import { Zoom } from "@mui/material";
//--------------MUI ICONS------------------------//
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
//--------------EXTERNAL------------------------//
import { useGetHealthQuery } from "services/devices";
import Chart from "components/Charts/Donut";
import Loader from "components/Progress";
import Nodata from "assets/img/pieChart.png";
import emitter from "Utilities/events";
import "./style.css";

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: "100%",
    fontSize: theme.typography.pxToRem(16),
    border: '1px solid #dadde9',
  },
    [`& .${tooltipClasses.arrow}`]: {
    backgroundColor: 'rgba(0,0,0,0)',
    color: "#f5f5f9"
  }
}));


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
  });

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
    setLegends({
      CRITICAL: payload?.CRITICAL.length > 0 ? payload?.CRITICAL[0].count : 0,
      MAJOR: payload?.MAJOR.length > 0 ? payload?.MAJOR[0].count : 0,
      MINOR: payload?.MINOR.length > 0 ? payload?.MINOR[0].count : 0,
      WARNING: payload?.WARNING.length > 0 ? payload?.WARNING[0].count : 0,
      HEALTHY: payload?.HEALTHY.length > 0 ? payload?.HEALTHY[0].count : 0,
      TOTAL:
        (payload?.CRITICAL.length > 0 ? payload?.CRITICAL[0].count : 0) +
        (payload?.MAJOR.length > 0 ? payload?.MAJOR[0].count : 0) +
        (payload?.MINOR.length > 0 ? payload?.MINOR[0].count : 0) +
        (payload?.WARNING.length > 0 ? payload?.WARNING[0].count : 0) +
        (payload?.HEALTHY.length > 0 ? payload?.HEALTHY[0].count : 0),
    });
    let data = [];
    if (payload?.CRITICAL.length > 0 ? payload?.CRITICAL[0].count : 0 > 0)
      data.push({
        value: payload?.CRITICAL.length > 0 ? payload?.CRITICAL[0].count : 0,
        category: "Critical",
      });

    if (payload?.MAJOR.length > 0 ? payload?.MAJOR[0].count : 0 > 0)
      data.push({
        value: payload?.MAJOR.length > 0 ? payload?.MAJOR[0].count : 0,
        category: "Major",
      });

    if (payload?.MINOR.length > 0 ? payload?.MINOR[0].count : 0 > 0)
      data.push({
        value: payload?.MINOR.length > 0 ? payload?.MINOR[0].count : 0,
        category: "Minor",
      });

    if (payload?.WARNING.length > 0 ? payload?.WARNING[0].count : 0 > 0)
      data.push({
        value: payload?.WARNING.length > 0 ? payload?.WARNING[0].count : 0,
        category: "Warning",
      });

    if (payload?.HEALTHY.length > 0 ? payload?.HEALTHY[0].count : 0 > 0)
      data.push({
        value: payload?.HEALTHY.length > 0 ? payload?.HEALTHY[0].count : 0,
        category: "Healthy",
      });
    setData(data);
  }

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
        maxWidth: "255px",
        minWidth: "255px",
      }}
    >
      <div style={{ padding: "10px" }}>
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
          <HtmlTooltip
            title={
              <Fragment>
                <p style={{fontSize: "12px", fontWeight: "bold"}}>This is a split of assets based on their alarm state</p>
                <div style={{display: "flex", flexDirection: "column", gap:"3px", marginLeft: "3px", marginTop: "5px", fontSize: "11px"}}>
                  <p style={{display: "flex", gap: "1px", alignItems: "center"}}>
                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        backgroundColor: "#bf3535",
                        borderRadius: "50%",
                      }}
                    />
                    [red pill or circle] assets that have atleast a critical alarm active. They may have multiple critical alarms or alarms from other lower priorties
                  </p>
                  <p style={{display: "flex", gap: "1px", alignItems: "center"}}>
                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        backgroundColor: "#844204",
                        borderRadius: "50%",
                      }}
                    />
                    [maroon pill/or cirlcle] assets that have atleast a major alarm active. They may have multiple Major alarms or alarms from other lower priorities
                  </p>
                  <p style={{display: "flex", gap: "1px", alignItems: "center"}}>
                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        backgroundColor: "#fe9f1b",
                        borderRadius: "50%",
                      }}
                    />
                    [Amber pill/or cirlcle] assets that have atleast a minor alarm active. They may have multiple Minor alarms or alarms from other lower priorities
                  </p>
                  <p style={{display: "flex", gap: "1px", alignItems: "center"}}>
                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        backgroundColor: "#3399ff",
                        borderRadius: "50%",
                      }}
                    />
                    [Blue pill/or cirlcle] assets that have atleast a warning. They may have multiple Warnings
                  </p>
                  <p style={{display: "flex", gap: "1px", alignItems: "center"}}>
                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        backgroundColor: "#5fb762",
                        borderRadius: "50%",
                      }}
                    />
                    [green] assets that have no active/acknowledged alarm
                  </p>
                </div>
              </Fragment>
            }
            placement="right"
            arrow
            transitionComponent={Zoom}
          >
            <PrivacyTipIcon style={{ color: "#bfbec8", cursor: "pointer" }} />
          </HtmlTooltip>
        </span>
        <div
          style={{
            height: "170px",
            width: "100%",
          }}
        >
          {!devicesRes.isLoading && data ? (
            <Fragment>
              {legends.TOTAL > 0 ? (
                <div style={{marginTop: "10px"}}>
                  <Chart name="Health" data={data} />
                  <div
                    style={{
                      display: "flex",
                      height: "60px",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0px 10px 0px 10px",
                    }}
                  >
                    <div className="grid">
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
                          name: "NO ALARMS",
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
                              {elm.name == "NO ALARMS"
                                ? `NO ALARMS ${legends["HEALTHY"]} `
                                : legends[elm.name]}
                            </b>
                          </p>
                        </div>
                      ))}
                    </div>
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
