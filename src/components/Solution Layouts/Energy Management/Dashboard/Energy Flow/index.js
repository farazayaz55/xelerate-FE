//-----------------CORE---------------//
import { Card, CardContent, CircularProgress } from "@mui/material";
import React, { useState, Fragment, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Chart from "./Sankey";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import PersonIcon from "@mui/icons-material/Person";
import RoofingIcon from "@mui/icons-material/Roofing";
import FunctionsIcon from "@mui/icons-material/Functions";
import Tooltip from "@mui/material/Tooltip";
import { useGetEMAggregationForSankeyQuery } from "services/monitoring";
import Loader from "components/Progress";
import {
  setMapPage,
  setListPage,
  setLiveArr,
  setView,
} from "rtkSlices/AssetViewSlice";
import { resetFilter } from "rtkSlices/filterDevicesSlice";

export default function EnergyFlow({
  fullScreen,
  setFullScreen,
  serviceId,
  unit,
  cost,
  history,
  selectedDay,
  startDate,
  endDate,
  refetch,
  setRefetch,
  cutoff,
}) {
  const aggMap = {
    sum: "sumOfReadings",
    avg: "mean",
  };
  let token = localStorage.getItem("token");
  const filtersValue = useSelector((state) => state.filterDevice);
  const metaDataValue = useSelector((state) => state.metaData);
  const service = metaDataValue.services.find((s) => s.id == serviceId);
  const aggregateAvg = service?.widgetDatapoints?.aggregationType;
  const [divideByPara, setDivideByPara] = useState('none');
  const [datapoint, setDatapoint] = useState(
    service?.widgetDatapoints?.energyConsumption?.name || "EnergyConsumption"
  );
  const dispatch = useDispatch();

  const [energyStartTime, setEnergyStartTime] = useState(cutoff
    ? new Date(new Date(new Date(new Date(startDate).setMonth(new Date(startDate).getMonth())).setFullYear(new Date(startDate.getFullYear()))).setHours(new Date(startDate).getHours()))
    : new Date(new Date(new Date(new Date(startDate).setMonth(new Date(startDate).getMonth())).setFullYear(new Date(startDate.getFullYear()))).setHours(new Date(startDate).getHours())))

  const [energyEndTime, setEnergyEndTime] = useState(new Date(new Date(new Date(new Date(endDate).setMonth(new Date(endDate).getMonth())).setFullYear(new Date(endDate.getFullYear()))).setHours(new Date(endDate).getHours())))

  const aggregation = useGetEMAggregationForSankeyQuery(
    {
      token,
      groupId: serviceId,
      params: `?aggregation=["mean"]&aggregationType=${
        // service?.widgetDatapoints?.aggregationType || "sum"
        "sum"
      }&dataPoint=${datapoint}&mode=hourly${
        filtersValue.group.id && `&groupId=${filtersValue.group.id}`
      }${unit == "$" ? `&cost=${cost}` : ``}&dateFrom=${new Date(
        new Date(energyStartTime).setSeconds(0)
      ).toISOString()}&dateTo=${new Date(
        new Date(energyEndTime).setSeconds(0)
      ).toISOString()}&divideByGroupPara=${divideByPara}`,
    },
    { skip: !serviceId }
  );
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    return () => {
      dispatch(setMapPage(1));
      dispatch(setListPage(1));
      dispatch(resetFilter());
    };
  }, []);
  function setChildrenData(data, temp, start = undefined) {
    data.childGroups.forEach((c) => {
      if (
        (c.data && c.data[datapoint]) ||
        (c.data && c.data[datapoint].length)
      ) {
        if (
          data.data[datapoint] &&
          (data.data[datapoint][aggMap[aggregateAvg]] || data.data[datapoint][aggMap[aggregateAvg]] == 0) &&
          c.data[datapoint] &&
          (c.data[datapoint][aggMap[aggregateAvg]] || c.data[datapoint][aggMap[aggregateAvg]] == 0)
        )
          temp.push({
            from: data.device
              ? data.name
              : `${data.name} ( ${
                  Math.floor(
                    data.data[datapoint][aggMap[aggregateAvg]]
                  ).toLocaleString() ||
                  Math.floor(
                    data.data[datapoint][0][aggMap[aggregateAvg]]
                  ).toLocaleString()
                } ${
                  data.data[datapoint]?.unit || data.data[datapoint][0]?.unit || ""
                } )`,
            deviceId: c.deviceId,
            fromGroupId: data._id,
            toGroupId: c._id,
            to: c.device
              ? c.name
              : `${c.name} ( ${
                  Math.floor(
                    c.data[datapoint][aggMap[aggregateAvg]]
                  ).toLocaleString() ||
                  Math.floor(
                    c.data[datapoint][0][aggMap[aggregateAvg]]
                  ).toLocaleString()
                } ${c.data[datapoint]?.unit || c.data[datapoint][0]?.unit || ""} )`,
            value:
              (Math.floor(c.data[datapoint][aggMap[aggregateAvg]]) ? Math.floor(c.data[datapoint][aggMap[aggregateAvg]]) : 0) 
              // ||
              // Math.floor(c.data[datapoint][0][aggMap[aggregateAvg]]),
          });
      }

      setChildrenData(c, temp);
    });
    return temp;
  }

  useEffect(() => {
       setEnergyStartTime(cutoff
      ? new Date(new Date(new Date(new Date(startDate).setMonth(new Date(startDate).getMonth())).setFullYear(new Date(startDate.getFullYear()))).setHours(new Date(startDate).getHours()))
      : new Date(new Date(new Date(new Date(startDate).setMonth(new Date(startDate).getMonth())).setFullYear(new Date(startDate.getFullYear()))).setHours(new Date(startDate).getHours())))

    setEnergyEndTime(new Date(new Date(new Date(new Date(endDate).setMonth(new Date(endDate).getMonth())).setFullYear(new Date(endDate.getFullYear()))).setHours(new Date(endDate).getHours())))


  }, [selectedDay, startDate, endDate, cutoff]);

  useEffect(() => {
    if (!aggregation.isFetching && aggregation.isSuccess) {
      setChartData([]);
      let data = JSON.parse(JSON.stringify(aggregation.data.payload?.data));
      console.log({ data });
      let temp = [];
      data.forEach((d) => {
        if (d.data && d.data[datapoint]) {
          d.data[datapoint][aggMap[aggregateAvg]] =
            d.data[datapoint] && d.data[datapoint][aggMap[aggregateAvg]]
              ? d.data[datapoint][aggMap[aggregateAvg]].toFixed(2)
              : 0;
          temp = setChildrenData(d, temp, true);
        }
      });
      console.log({ temp });
      setChartData(temp);
    }
  }, [aggregation.isFetching]);

  useEffect(() => {
    setChartData([]);
  }, [filtersValue.group.id]);

  useEffect(() => {
    if (refetch) {
      aggregation.refetch();
      setRefetch(false);
    }
  }, [refetch]);

  return (
    <Card
      style={{
        // minHeight: "265px",
        verticalAlign: "middle",
        position: "relative",
        width: fullScreen ? "100%" : "45%",
        height: fullScreen ? "calc(100vh - 170px)" : "56vh",
      }}
    >
      <CardContent style={{ padding: "16px 16px 24px 16px", height: "100%" }}>
        <p
          style={{
            color: "#bfbec8",
            fontSize: "15px",
            display: "flex",
            alignItems: "center",
            gap: "5px"
          }}
        >
          <b>Energy Flow</b>
          <span>{divideByPara == "perperson" ? "(per occupant)" : divideByPara == "persquaremeter" ? "(per area-m2)" : null}</span>
        </p>
        {aggregation.isFetching ? (
          <Loader />
        ) : chartData.length ? (
          <Chart
            name="sankey"
            fullScreen={fullScreen}
            data={chartData}
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
            No Data found
          </div>
        )}
      </CardContent>

      {(datapoint === "ActivePower" || datapoint === "EnergyConsumption") && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            height: "32px",
            borderRadius: "10px",
            width: "110px",
            border: "1px solid lightgrey",
            position: "absolute",
            top: "6px",
            right: "60px",
          }}
        >
          <Tooltip
            title={"Show per square meter consumption"}
            placement="top"
            arrow
          >
            <RoofingIcon
              sx={{
                cursor: "pointer",
                marginTop: "5px",
                width: "25%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              fontSize="small"
              color={divideByPara === "persquaremeter" ? "success" : "disabled"}
              onClick={() => setDivideByPara("persquaremeter")}
            />
          </Tooltip>
          <Tooltip
            title={"Show per Occupant consumption"}
            placement="top"
            arrow
          >
            <PersonIcon
              sx={{
                cursor: "pointer",
                marginTop: "5px",
                width: "25%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              fontSize="small"
              color={divideByPara === "perperson" ? "primary" : "disabled"}
              onClick={() => setDivideByPara("perperson")}
            />
          </Tooltip>
          <Tooltip title={"Show cumulative usage"} placement="top" arrow>
            <FunctionsIcon
              sx={{
                cursor: "pointer",
                marginTop: "5px",
                width: "25%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              fontSize="small"
              color={divideByPara === "none" ? "primary" : "disabled"}
              onClick={() => setDivideByPara("none")}
            />
          </Tooltip>
        </div>
      )}

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
          onClick={() => setFullScreen(3)}
          // onClick={() => setOpen(true)}
        />
      )}
    </Card>
  );
}
