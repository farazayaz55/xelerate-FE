//-----------------CORE---------------//
import { Card, CardContent } from "@mui/material";
import React, { useState, useEffect, Fragment } from "react";
import { useSelector, useDispatch } from "react-redux";
import Chart from "./Heatmap";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { useGetAggregatedDeviceDatabyGroupIdQuery } from "services/analytics";
import Loader from "components/Progress";

export default function DailyUsage({
  fullScreen,
  setFullScreen,
  unit,
  serviceId,
  selectedDay,
  startDate,
  endDate,
  history,
  cost,
  refetch,
  setRefetch,
  cutoff,
}) {
  let token = localStorage.getItem("token");
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const [error, setError] = useState("No Data found");
  const metaDataValue = useSelector((state) => state.metaData);
  const service = metaDataValue.services.find((s) => s.id == serviceId);
  const [datapoint, setDatapoint] = useState(
    service?.widgetDatapoints?.energyConsumption?.name || "EnergyConsumption"
  );
  const [data, setData] = useState({ chartData: [], devices: [], time: [] });
  const filtersValue = useSelector((state) => state.filterDevice);
  const [energyStartTime, setEnergyStartTime] = useState(
    // cutoff
    //   ? 
    new Date(new Date(new Date(new Date(startDate).setMonth(new Date(startDate).getMonth())).setFullYear(new Date(startDate.getFullYear()))).setHours(new Date(startDate).getHours()))
      // : new Date(new Date().setDate(new Date().getDate() - 1))
  );
  const [energyEndTime, setEnergyEndTime] = useState(new Date(new Date(new Date(new Date(endDate).setMonth(new Date(endDate).getMonth())).setFullYear(new Date(endDate.getFullYear()))).setHours(new Date(endDate).getHours())));
  
  const aggregation = useGetAggregatedDeviceDatabyGroupIdQuery(
    {
      token,
      id: serviceId,
      group_id: filtersValue.group?.id || "",
      params: `?mode=hourly&aggregation=["${
        service?.widgetDatapoints?.aggregationType === "avg"
          ? "mean"
          : "sumOfReadings"
      }"]&aggregationType=${
        // service?.widgetDatapoints?.aggregationType || "sum"
        "sum"
      }&dataPoint=${datapoint}&dateFrom=${new Date(
        new Date(energyStartTime).setSeconds(0)
      ).toISOString()}&dateTo=${new Date(
        new Date(energyEndTime).setSeconds(0)
      ).toISOString()}${unit == "$" ? `&cost=${cost}` : ``}`,
    },
    { skip: !serviceId }
  );

  useEffect(() => {
    setEnergyStartTime(
      // cutoff
      //   ? 
      new Date(new Date(new Date(new Date(startDate).setMonth(new Date(startDate).getMonth())).setFullYear(new Date(startDate.getFullYear()))).setHours(new Date(startDate).getHours()))
        // : new Date(new Date().setDate(new Date().getDate() - 1))
    );
    setEnergyEndTime(new Date(new Date(new Date(new Date(endDate).setMonth(new Date(endDate).getMonth())).setFullYear(new Date(endDate.getFullYear()))).setHours(new Date(endDate).getHours())))
  }, [selectedDay, startDate, endDate]);

  useEffect(() => {
    if (!aggregation.isFetching && aggregation.isSuccess) {
      setData({ chartData: [], devices: [] });
      let temp = aggregation.data.payload.devices;
      if (temp) {
        let result = [];
        let devices = [];
        let time = [];
        let timeAdded = false;
        Object.keys(temp).forEach((device) => {
          devices.push({ device, id: temp[device].deviceId });
          if (time.length) {
            timeAdded = true;
          }
          temp[device].data.forEach((t) => {
            if ((selectedDay == 30 || selectedDay == 14) && !timeAdded) {
              time.push(new Date(t.time).toLocaleDateString());
            }
            let day = new Date(t.time).getDay();
            let hour = getHour(t.time) + ":00:00";
            result.push({
              time:
                selectedDay == 7
                  ? days[day]
                  : selectedDay == 1
                  ? tConvert(hour)
                  : new Date(t.time).toLocaleDateString(),
              device,
              value: parseInt(
                service?.widgetDatapoints?.aggregationType === "avg"
                  ? t.mean.toFixed(2)
                  : t.sumOfReadings.toFixed(2)
              ),
            });
          });
          setData({ chartData: result, devices, time });
          console.log({selectedDay, result, devices, time})
        });
      } else {
        setError(aggregation.data.message);
      }
    }
  }, [aggregation.isFetching]);

  useEffect(() => {
    if (refetch) {
      setEnergyEndTime(new Date());
      // aggregation.refetch();
      setRefetch(false);
    }
  }, [refetch]);

  function getHour(time) {
    return new Date(time).getHours().toString()?.length == 1
      ? "0" + new Date(time).getHours().toString()
      : new Date(time).getHours().toString();
  }

  function tConvert(time) {
    time = time
      .toString()
      .match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

    if (time?.length > 1) {
      // If time format correct
      time = time.slice(1); // Remove full string match value
      time[5] = +time[0] < 12 ? "AM" : "PM"; // Set AM/PM
      time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join("").replaceAll(":00:00", " "); // return adjusted time or original string
  }

  // useEffect(() => {
  //   setChartData([]);
  // }, [filtersValue.group.id]);

  console.log("\n\nInside EMS Layout... Data is : ", data, "\n")
  return (
    <Card
      style={{
        // minHeight: "265px",
        verticalAlign: "middle",
        position: "relative",
        width: fullScreen ? "100%" : "55%",
        height: fullScreen ? "calc(100vh - 170px)" : "56vh",
      }}
    >
      <CardContent style={{ padding: "6px 16px 24px 16px", height: "100%" }}>
        <p
          style={{
            color: "#bfbec8",
            fontSize: "15px",
          }}
        >
          <b>Daily Usage Heatmap</b>
        </p>
        {aggregation.isFetching ? (
          <Loader />
        ) : data.chartData.length ? (
          <Chart
            name="heatmap"
            fullScreen={fullScreen}
            data={data}
            selectedDay={selectedDay}
            history={history}
            serviceId={serviceId}
          />
        ) : (
          <div
            style={{
              fontSize: "18px",
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#999",
            }}
          >
            {error}
          </div>
        )}
      </CardContent>
      {fullScreen ? (
        <FullscreenExitIcon
          style={{
            cursor: "pointer",
            position: "absolute",
            top: "10px",
            right: "10px",
          }}
          onClick={() => setFullScreen("")}
          // onClick={() => setOpen(false)}
        />
      ) : (
        <FullscreenIcon
          style={{
            cursor: "pointer",
            position: "absolute",
            top: "10px",
            right: "10px",
          }}
          onClick={() => setFullScreen(2)}
          // onClick={() => setOpen(true)}
        />
      )}
    </Card>
  );
}
