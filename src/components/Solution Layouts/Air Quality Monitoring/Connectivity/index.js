//--------------CORE------------------------//
import React, { Fragment, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import hexRgb from "hex-rgb";
//--------------MUI------------------------//
import Card from "@mui/material/Card";
//--------------MUI ICONS------------------------//
import PowerIcon from "@mui/icons-material/Power";
//--------------EXTERNAL------------------------//
import { useGetConnectivityQuery } from "services/devices";
import Nodata from "assets/img/pieChart.png";
import SAPChart from "components/Charts/SAP-Donut";
import Loader from "components/Progress";
import AssetConnectivityImage from "assets/icons/connectivity.png";
import { setFilter } from "rtkSlices/filterDevicesSlice";
import emitter from "Utilities/events";

export default function AssetCard(props) {
  const dispatch = useDispatch();
  const filtersValue = useSelector((state) => state.filterDevice);
  const metaDataValue = useSelector((state) => state.metaData);
  const [data, setData] = React.useState(null);
  const [legends, setLegends] = React.useState({
    Active: 0,
    Offline: 0,
  });
  const [chk, setChk] = React.useState(0);
  const devicesRes = useGetConnectivityQuery({
    token: window.localStorage.getItem("token"),
    id: props.id,
    params: `&MeasurementFilter=${filtersValue.measurement}&connected=${
      filtersValue.connection
    }&alarms=${filtersValue.alarms}&groupId=${
      filtersValue.group.id
    }&metaTags=${filtersValue.metaTags}&assetTypes=${filtersValue.assetTypes}`,
  });
  const [rgb, setRgb] = React.useState(
    hexRgb(metaDataValue.branding.secondaryColor)
  );

  function callbackfn(payload) {
    updateData(payload.message.result);
  }

  useEffect(() => {
    emitter.on("solution?deviceDashboardConnectivity", callbackfn);
    return () => {
      emitter.off("solution?deviceDashboardConnectivity", callbackfn);
    };
  }, []);

  function updateData(payload) {
    dispatch(
      setFilter({
        connectedDevices: payload?.connected ? payload?.connected : 0,
      })
    );
    setLegends({
      Active: payload?.connected ? payload?.connected : 0,
      Offline:
        (payload?.disconnected ? payload?.disconnected : 0) +
        (payload?.never_connected ? payload?.never_connected : 0),
    });
    setChk(
      (payload?.connected ? payload?.connected : 0) +
        (payload?.disconnected ? payload?.disconnected : 0) +
        (payload?.never_connected ? payload?.never_connected : 0)
    );
    let data = [];
    if (payload?.connected && payload?.connected > 0)
      data.push({
        value: payload?.connected ? payload?.connected : 0,
        category: "Active",
      });

    if (
      (payload?.disconnected && payload?.disconnected > 0) ||
      (payload?.never_connected && payload?.never_connected > 0)
    )
      data.push({
        value:
          (payload?.disconnected ? payload?.disconnected : 0) +
          (payload?.never_connected ? payload?.never_connected : 0),
        category: "Offline",
      });

    setData(data);
  }

  useEffect(() => {
    if (devicesRes.isSuccess) {
      updateData(devicesRes.data?.payload);
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
            src={AssetConnectivityImage}
            style={{ maxHeight: "14px", maxWidth: "20px" }}
          />
          <p
            style={{
              color: "black",
              fontSize: "14px",
              letterSpacing: "1px",
            }}
          >
            <b>CONNECTIVITY</b>
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
              {chk > 0 ? (
                <Fragment>
                  <SAPChart name="Connectivity" data={data} />
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
                        name: "Offline",
                        id: "Offline",
                        color: "#696b72",
                        background: "rgb(105,107,114,0.1)",
                      },
                      {
                        name: "Active",
                        id: "Active",
                        color: "#79c37c",
                        background: "rgb(121,195,124,0.1)",
                      },
                    ].map((elm) => (
                      <span
                        style={{
                          background: elm.background,
                          textAlign: "center",
                          width: "50%",
                          borderRadius: "10px",
                          color: elm.color,
                          padding: "6px",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "22px",
                            marginBottom: "5px",
                          }}
                        >
                          <b>{legends[elm.name]}</b>
                        </p>
                        <p
                          style={{
                            fontSize: "12px",
                          }}
                        >
                          <b>{elm.name}</b>
                        </p>
                      </span>
                    ))}
                  </div>
                  {/* <span style={{ position: "relative", bottom: "10px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        margin: "0px 10px 0px 10px",
                        gap: "5px",
                      }}
                    >
                      {[
                        {
                          name: "connected",
                          label: "ACTIVE",
                          color: "#5fb762",
                          fade: "rgb(95,183,98,0.1)",
                        },
                        {
                          name: "disconnected",
                          fade: "rgb(85,85,85,0.1)",
                          color: "#555555",
                          label: "DOWN",
                        },
                      ].map((elm) => (
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
                            <b>
                              {elm.label}{" "}
                              {`(${
                                devicesRes.data?.payload[elm.name]
                                  ? devicesRes.data?.payload[elm.name]
                                  : 0
                              })`}
                            </b>
                          </p>
                        </div>
                      ))}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        margin: "5px 10px 0px 10px",
                        gap: "5px",
                      }}
                    >
                      {[
                        {
                          name: "never_connected",
                          fade: "rgb(186,117,216,0.1)",
                          color: "#555555",
                          label: "No Communication",
                        },
                      ].map((elm) => (
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
                            <b id="connectivity_1">
                              {elm.label}{" "}
                              {`(${
                                devicesRes.data?.payload[elm.name]
                                  ? devicesRes.data?.payload[elm.name]
                                  : 0
                              })`}
                            </b>
                          </p>
                        </div>
                      ))}
                    </div>
                  </span> */}
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
                  <p>No Devices Found</p>
                </div>
              )}
            </Fragment>
          ) : (
            <span
              style={{
                position: "relative",
                top: "10px",
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
