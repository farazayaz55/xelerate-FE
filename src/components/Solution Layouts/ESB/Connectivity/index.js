//--------------CORE------------------------//
import React, { Fragment, useEffect } from "react";
import { useSelector } from "react-redux";
import hexRgb from "hex-rgb";
//--------------MUI------------------------//
import Card from "@mui/material/Card";
//--------------MUI ICONS------------------------//
import PowerIcon from '@mui/icons-material/Power';
//--------------EXTERNAL------------------------//
import { useGetConnectivityQuery } from "services/devices";
import Nodata from "assets/img/pieChart.png";
import Chart from "components/Charts/Semi-Donut";
import Loader from "components/Progress";

export default function AssetCard(props) {
  const filtersValue = useSelector((state) => state.filterDevice);
  const metaDataValue = useSelector((state) => state.metaData);
  const [data, setData] = React.useState(null);
  const [chk, setChk] = React.useState(0);
  const devicesRes = useGetConnectivityQuery({
    token: window.localStorage.getItem("token"),
    id: props.id,
    group: filtersValue.group.id || props.groupId, 
  });
  const [rgb, setRgb] = React.useState(
    hexRgb(metaDataValue.branding.secondaryColor)
  );

  useEffect(() => {
    if (devicesRes.isSuccess) {
      setChk(
        (devicesRes.data?.payload?.connected
          ? devicesRes.data?.payload?.connected
          : 0) +
          (devicesRes.data?.payload?.disconnected
            ? devicesRes.data?.payload?.disconnected
            : 0) +
          (devicesRes.data?.payload?.never_connected
            ? devicesRes.data?.payload?.never_connected
            : 0)
      );
      let data = [];
      if (
        devicesRes.data?.payload?.connected &&
        devicesRes.data?.payload?.connected > 0
      )
        data.push({
          value: devicesRes.data?.payload?.connected
            ? devicesRes.data?.payload?.connected
            : 0,
          category: "Active",
        });

      if (
        devicesRes.data?.payload?.disconnected &&
        devicesRes.data?.payload?.disconnected > 0
      )
        data.push({
          value: devicesRes.data?.payload?.disconnected
            ? devicesRes.data?.payload?.disconnected
            : 0,
          category: "DOWN",
        });

      if (
        devicesRes.data?.payload?.never_connected &&
        devicesRes.data?.payload?.never_connected > 0
      )
        data.push({
          value: devicesRes.data?.payload?.never_connected
            ? devicesRes.data?.payload?.never_connected
            : 0,
          category: "NO COMMUNICATION",
        });

      setData(data);
      console.log({data})
    }
  }, [devicesRes.isFetching]);

  return (
    <div
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
              color: '#C1C1C1',
              fontSize: '14px'
            }}
          >
            Connectivity
          </p>
          <PowerIcon style={{ color: "#bfbec8" }} />
        </span>
        <div
          style={{
            height: "173px",
          }}
        >
          {!devicesRes.isFetching && data ? (
            <Fragment>
              {chk > 0 ? (
                <Fragment>
                  <span style={{ position: "relative", top: "10px", width:'100%', height:'130px' }}>
                    <Chart name="Connectivity" data={data} />
                  </span>
                  <span id={filtersValue.rightPaneOpen ? 'semiDonut-lbl-rsp' : 'semiDonut-lbl'} style={{ position: "relative", bottom:filtersValue.rightPaneOpen ? '-5px' : '20px' }}>
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
                              fontSize: "10px",
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
                              fontSize: "10px",
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
    </div>
  );
}
