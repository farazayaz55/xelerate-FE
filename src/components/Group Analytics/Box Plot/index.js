import React, { Fragment, useEffect } from "react";
import Card from "@mui/material/Card";
import { useSelector } from "react-redux";
import Chart from "components/Charts/Box";
import Settings from "../Settings";
import { useGetBoxPlotQuery } from "services/monitoring";
import noData from "assets/img/lineChart.png";
import Loader from "components/Progress";
import { useDispatch } from "react-redux";
import { setBox } from "rtkSlices/GroupAnalyticsSlice";
import { useSnackbar } from "notistack";
import { showSnackbar } from "Utilities/Snackbar";

export default function BoxPlot(props) {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  let token = window.localStorage.getItem("token");
  const metaDataValue = useSelector((state) => state.metaData);
  const groupAnalytics = useSelector((state) => state.groupAnalytics);

  const analyticsRes = useGetBoxPlotQuery(
    {
      token: token,
      parameters: groupAnalytics.Box.filter,
    },
    {
      skip: !groupAnalytics.Box.played,
      refetchOnMountOrArgChange: false,
    }
  );

  useEffect(() => {
    if (groupAnalytics.isError) {
      showSnackbar(
        "Box Plot",
        groupAnalytics.error?.message,
        "error",
        1000,
        enqueueSnackbar
      );
    }
  }, [groupAnalytics.isFetching]);

  return (
    <Card
      style={{
        marginBottom: "20px",
        height: "calc(100vh - 230px)",
        verticalAlign: "middle",
        position: "relative",
      }}
    >
      <Settings type="Box" name="Box Plot Chart" />
      {!groupAnalytics.Box.played ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              borderRadius: "10px",
              height: "40px",
              width: "120px",
              background: metaDataValue.branding.secondaryColor,
              boxShadow: "rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px",
              cursor: "pointer",
              color: "white",
            }}
            onClick={() => {
              dispatch(
                setBox({
                  played: true,
                })
              );
            }}
          >
            Load Chart
          </div>
          <p
            style={{
              color: "#c0c0c0",
            }}
          >
            Load with defaults or change parameters above
          </p>
        </div>
      ) : (
        <Fragment>
          {!analyticsRes.isFetching ? (
            <Fragment>
              {analyticsRes?.data?.payload &&
              analyticsRes?.data?.payload.length > 0 ? (
                <Chart
                  name="Box Plot Chart"
                  data={analyticsRes?.data?.payload.slice(0, 19).map((e, i) => {
                    let newE = { ...e };
                    let time = new Date();
                    newE.date = `${time.getFullYear()}-${
                      time.getMonth() < 9 ? "0" : ""
                    }${time.getMonth() + 1}-${i < 9 ? "0" : ""}${i + 1}`;
                    newE.high = Number(newE.high);
                    newE.low = Number(newE.low);
                    newE.open = Number(newE.open);
                    newE.close = Number(newE.close);
                    newE.mediana = Number(newE.median);
                    newE.device = newE.name;
                    delete newE.dateTo;
                    delete newE.dateFrom;
                    delete newE.sensorId;
                    delete newE.median;
                    delete newE.name;
                    return newE;
                  })}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    marginTop: "30px",
                  }}
                >
                  <img src={noData} height="100px" width="100px" />
                  <p style={{ color: "#c7c7c7" }}>No data found</p>
                </div>
              )}
            </Fragment>
          ) : (
            <Loader />
          )}
        </Fragment>
      )}
      <p
        style={{
          position: "absolute",
          left: "20px",
          bottom: "5px",
          fontSize: "13px",
          color: "grey",
        }}
      >
        <b>Hint:</b> {props.hint}
      </p>
    </Card>
  );
}
