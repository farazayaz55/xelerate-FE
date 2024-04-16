import React, { Fragment, useEffect } from "react";
import Card from "@mui/material/Card";
import { useSelector } from "react-redux";
import Chart from "components/Charts/Clustered Column";
import Settings from "../Settings";
import { useGetGroupAnalyticsQuery } from "services/analytics";
import noData from "assets/img/lineChart.png";
import Loader from "components/Progress";
import { useDispatch } from "react-redux";
import { setPreCanned } from "rtkSlices/GroupAnalyticsSlice";
import { useSnackbar } from "notistack";
import { showSnackbar } from "Utilities/Snackbar";

export default function ClusteredBarChart(props) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  let token = window.localStorage.getItem("token");
  const metaDataValue = useSelector((state) => state.metaData);
  const groupAnalytics = useSelector((state) => state.groupAnalytics);

  const analyticsRes = useGetGroupAnalyticsQuery(
    {
      token: token,
      parameters: groupAnalytics.PreCanned.filter,
    },
    {
      skip: !groupAnalytics.PreCanned.played,
      refetchOnMountOrArgChange: false,
    }
  );

  useEffect(() => {
    if (groupAnalytics.isError) {
      showSnackbar(
        "Clustered Bar Chart",
        groupAnalytics.error?.message,
        "error",
        1000,
        enqueueSnackbar
      );
    }
  }, [groupAnalytics.isFetching]);

  function checkData(data) {
    let no = false;
    if (data) {
      let arr = [...data];
      for (let index = 0; index < arr.length; index++) {
        let elm = arr[index];
        if (Object.keys(elm).length > 2) {
          no = true;
          break;
        }
      }
    }
    return no;
  }

  return (
    <Card
      style={{
        marginBottom: "20px",
        height: "calc(100vh - 230px)",
        verticalAlign: "middle",
        position: "relative",
      }}
    >
      <Settings type="PreCanned" name="Pre-canned Report" />
      {!groupAnalytics.PreCanned.played ? (
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
                setPreCanned({
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
              {checkData(analyticsRes?.data?.payload) ? (
                <Chart
                  name="Pre-canned Report"
                  data={analyticsRes?.data?.payload}
                  datapoints={
                    metaDataValue.services.find(
                      (e) => e.id == groupAnalytics.PreCanned.solution
                    )?.sensors
                  }
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
