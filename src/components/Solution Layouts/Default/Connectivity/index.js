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
import { setFilter } from "rtkSlices/filterDevicesSlice";
import Nodata from "assets/img/pieChart.png";
import Chart from "components/Charts/Semi-Donut";
import Loader from "components/Progress";
import emitter from "Utilities/events";

export default function AssetCard(props) {
  const dispatch = useDispatch();
  const filtersValue = useSelector((state) => state.filterDevice);
  const metaDataValue = useSelector((state) => state.metaData);
  const [legends, setLegends] = React.useState({
    connected: 0,
    disconnected: 0,
    never_connected: 0,
  });
  const [data, setData] = React.useState(null);
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
      connected: payload?.connected ? payload?.connected : 0,
      disconnected: payload?.disconnected ? payload?.disconnected : 0,
      never_connected: payload?.never_connected ? payload?.never_connected : 0,
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

    if (payload?.disconnected && payload?.disconnected > 0)
      data.push({
        value: payload?.disconnected ? payload?.disconnected : 0,
        category: "DOWN",
      });

    if (payload?.never_connected && payload?.never_connected > 0)
      data.push({
        value: payload?.never_connected ? payload?.never_connected : 0,
        category: "NO COMMUNICATION",
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
            <b>Connectivity</b>
          </p>
          <PowerIcon style={{ color: "#bfbec8" }} />
        </span>
        <div
          style={{
            height: "170px",
            width: "100%",
          }}
        >
          {!devicesRes.isLoading && data ? (
            <Fragment>
              {chk > 0 ? (
                <Fragment>
                  <span style={{ position: "relative", top: "15px" }}>
                    <Chart name="Connectivity" data={data} />
                  </span>
                  <span style={{ position: "relative", bottom: "10px" }}>
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
                          label: "INACTIVE",
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
                              {elm.label} {`(${legends[elm.name]})`}
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
                          color: "#ba75d8",
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
                              {elm.label} {`(${legends[elm.name]})`}
                            </b>
                          </p>
                        </div>
                      ))}
                    </div>
                  </span>
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
