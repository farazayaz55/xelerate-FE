import React, { Fragment, useEffect, useState } from "react";
import Card from "@mui/material/Card";
import Chart from "components/Charts/Streaming Analytics";
import MultilineChartIcon from "@mui/icons-material/MultilineChart";
import Loader from "components/Progress";
import noData from "assets/img/no-data.png";
import { useGetAnalyticsQuery } from "services/analytics";
import { useSelector } from "react-redux";

// const useStyles = makeStyles(styles);

let dateFilters = [
  { mode: "1D", days: 1 },
  { mode: "3D", days: 3 },
  { mode: "7D", days: 7 },
  { mode: "1M", days: 32 },
];

export default function LineChartCard(props) {
  const metaDataValue = useSelector((state) => state.metaData);
  let token = window.localStorage.getItem("token");
  const [loader, setLoader] = useState(true);
  const [mode, setMode] = useState("1D");
  const [data, setData] = useState({});
  const [days, setDays] = useState(1);
  const [datefrom, setDatefrom] = useState(
    new Date(new Date().setDate(new Date().getDate() - days)).toISOString()
  );
  const [dateto, setDateto] = useState(new Date().toISOString());
  const [notFound, setNotFound] = useState(true);
  const [firstTime, setFirstTime] = useState(true);
  const analytics = useGetAnalyticsQuery({
    token,
    id: props.id,
    dataPoint: props.value,
    parameters: `&dateFrom=${datefrom}&dateTo=${dateto}`,
  });

  function ifLoaded(state, component) {
    if (state) return <Loader bottom={"30px"} />;
    else return component();
  }

  function hasDecimal(num) {
    return num % 1 != 0;
  }

  async function fetchAnalytics() {
    if (analytics.isSuccess) {
      if (analytics.data.payload.time) {
        let data = {
          min: [],
          max: [],
          stDivPositive: [],
          stDivNegative: [],
          mean: [],
        };
        let rawData = analytics.data.payload;
        ["min", "max", "stDivPositive", "stDivNegative", "mean"].forEach(
          (frag) => {
            rawData[frag].forEach((elm, i) => {
              let value = parseFloat(elm);
              let body = {};
              body.date = new Date(rawData.time[i]).setSeconds(0);
              body.value = hasDecimal(value)
                ? parseFloat(value.toFixed(2))
                : value;
              data[frag].push(body);
            });
          }
        );
        setData(data);
        setNotFound(false);
      } else {
        setData({});
        setNotFound(true);
      }
      setLoader(false);
    }
    if (analytics.isError) {
      setNotFound(true);
      setLoader(false);
    }
  }

  useEffect(() => {
    fetchAnalytics();
  }, [analytics.isFetching]);

  function analyticsFn() {
    return (
      <Fragment>
        {loader ? (
          <Loader />
        ) : (
          <div>
            <span
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                justifyContent: "flex-end",
                marginRight: "20px",
              }}
            >
              {dateFilters.map((date) => {
                return (
                  <div
                    style={{
                      backgroundColor:
                        mode == date.mode
                          ? metaDataValue.branding.secondaryColor
                          : "#bfbec8",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      if (mode != date.mode) {
                        setMode(date.mode);
                        setDays(date.days);
                        setDatefrom(
                          new Date(
                            new Date().setDate(new Date().getDate() - date.days)
                          ).toISOString()
                        );
                        setDateto(new Date().toISOString());
                        setLoader(true);
                      }
                    }}
                  >
                    <p
                      style={{
                        marginTop: "2px",
                        marginBottom: "2px",
                        fontSize: "10px",
                        marginLeft: "5px",
                        marginRight: "5px",
                        color: "white",
                      }}
                    >
                      <b>{date.mode}</b>
                    </p>
                  </div>
                );
              })}
            </span>

            {notFound ? (
              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "200px",
                    width: "200px",
                  }}
                >
                  <img
                    style={{ maxWidth: "70%", maxHeight: "70%" }}
                    src={noData}
                  />
                </div>
                <p style={{ color: "#c8c8c8" }}>No data found</p>
              </div>
            ) : null}
          </div>
        )}
        <span style={{ display: notFound ? "none" : "" }}>
          <Chart data={data} name={props.value} height={"400px"} />
        </span>
      </Fragment>
    );
  }

  return (
    <Card
      style={{
        height: "370px",
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
              fontSize:
                window.localStorage.getItem("Language") == "en"
                  ? "15px"
                  : "22px",
            }}
          >
            <b>{props.name}</b>
          </p>
          <MultilineChartIcon style={{ color: "#bfbec8" }} />
        </span>
      </div>
      {analyticsFn()}
    </Card>
  );
}
