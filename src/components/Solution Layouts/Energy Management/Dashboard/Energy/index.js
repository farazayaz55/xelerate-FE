//-----------------CORE---------------//
import { Card, CardContent } from "@mui/material";
import React, { useEffect, Fragment, useState } from "react";
import Box from "@mui/material/Box";
import { useSelector, useDispatch } from "react-redux";
import BoltIcon from "@mui/icons-material/Bolt";
import Guage from "./Guage";
import Stack from "@mui/material/Stack";
import EnergyOn from "assets/icons/energy-on.png";
import { useGetAggregatedDatabyGroupIdQuery } from "services/analytics";
import EditIcon from "@mui/icons-material/Edit";
import EditPopup from "./EditPopup";
import Loader from "components/Progress";
import DollarOn from "assets/icons/dollarOn.png";
import Target from "assets/img/target.png";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import Tooltip from "@mui/material/Tooltip";
import InfoIcon from "@mui/icons-material/Info";

export default function Energy({
  unit,
  cost,
  setCost,
  target,
  setTarget,
  days,
  startDate,
  endDate,
  serviceId,
  globalEnergy,
  setGlobalEnergy,
  refetch,
  setRefetch,
  cutoff
}) {
  // console.log({cost, unit})
  const aggMap = {
    sum: "sumOfReadings",
    avg: "mean",
  };
  const [open, setOpen] = useState(false);
  const filtersValue = useSelector((state) => state.filterDevice);

  const utc = Math.abs(new Date().getTimezoneOffset()) / 60;

  const [energyStartTime, setEnergyStartTime] = useState(cutoff
    ? new Date(new Date(new Date(new Date(startDate).setMonth(new Date(startDate).getMonth())).setFullYear(new Date(startDate.getFullYear()))).setHours(new Date(startDate).getHours()))
    : new Date(new Date(new Date(new Date(startDate).setMonth(new Date(startDate).getMonth())).setFullYear(new Date(startDate.getFullYear()))).setHours(new Date(startDate).getHours())))

  const [energyEndTime, setEnergyEndTime] = useState(new Date(new Date(new Date(new Date(endDate).setMonth(new Date(endDate).getMonth())).setFullYear(new Date(endDate.getFullYear()))).setHours(new Date(endDate).getHours())))

  const [startTime, setStartTime] = useState(cutoff
    ? new Date(new Date(new Date(startDate).setDate(new Date(startDate).getDate() - (((Math.ceil(Math.abs(endDate - startDate)/ (1000 * 60 * 60 * 24))))))).setHours(new Date(startDate).getHours()))
    : new Date(new Date(new Date(startDate).setDate(new Date(startDate).getDate() - (((Math.ceil(Math.abs(endDate - startDate)/ (1000 * 60 * 60 * 24))))))).setHours(new Date(startDate).getHours()))
  );
  const [endTime, setEndTime] = useState(cutoff
    ? new Date(new Date(new Date(startDate).setDate(new Date(startDate).getDate()  - 1)).setHours(new Date(endDate).getHours()))
    : new Date(new Date(new Date(startDate).setDate(new Date(startDate).getDate()  - 1)).setHours(new Date(endDate).getHours()))
  );

  const metaDataValue = useSelector((state) => state.metaData);
  const service = metaDataValue.services.find(s=>s.id == serviceId)
  const aggregateAvg = service?.widgetDatapoints?.aggregationType;

  const energyConsumption = useGetAggregatedDatabyGroupIdQuery({
    token: window.localStorage.getItem("token"),
    id: serviceId,
    group_id: filtersValue.group?.id || "",
    params: `?mode=hourly&aggregation=["${
      aggMap[aggregateAvg]
    }"]&dataPoints=${JSON.stringify([
      service?.widgetDatapoints?.energyConsumption?.name || "EnergyConsumption",
    ])}&dateFrom=${new Date(
      new Date(energyStartTime).setSeconds(0)
    ).toISOString()}&dateTo=${new Date(
      new Date(energyEndTime).setSeconds(0)
    ).toISOString()}&aggregationType=${
      // filtersValue.group?.id
      //   ? service?.widgetDatapoints?.aggregationType
      //   : "sum"
      "sum"
    }&aggregate=true${`&cost=${cost}`}`,
  });

  const lastEnergyConsumption = useGetAggregatedDatabyGroupIdQuery({
    token: window.localStorage.getItem("token"),
    id: serviceId,
    group_id: filtersValue.group?.id || "",
    params: `?mode=hourly&aggregation=["${
      aggMap[aggregateAvg]
    }"]&dataPoints=${JSON.stringify([
      service?.widgetDatapoints?.energyConsumption?.name || "EnergyConsumption",
    ])}&dateFrom=${new Date(
      new Date(startTime).setSeconds(0)
    ).toISOString()}&dateTo=${new Date(
      new Date(endTime).setSeconds(0)
    ).toISOString()}&aggregationType=${
      // filtersValue.group?.id
      //   ? service?.widgetDatapoints?.aggregationType
      //   : "sum"
      "sum"
    }&aggregate=true${`&cost=${cost}`}`,
  });

  const [energy, setEnergy] = useState(0);
  const [lastEnergy, setLastEnergy] = useState(0);

  useEffect(() => {
    if (!energyConsumption.isFetching && energyConsumption.isSuccess) {
      if(energyConsumption.data.payload.dataPoints){
        setEnergy(
          Math.floor(
            energyConsumption.data.payload.dataPoints[
              service?.widgetDatapoints?.energyConsumption?.name ||
                "EnergyConsumption"
            ][aggMap[aggregateAvg]]
          )
        );
        setGlobalEnergy({
          energy: Math.floor(
            energyConsumption.data.payload.dataPoints[
              service?.widgetDatapoints?.energyConsumption?.name ||
                "EnergyConsumption"
            ][aggMap[aggregateAvg]]
          ),
          cost: Math.floor(
            energyConsumption.data.payload.dataPoints[
              service?.widgetDatapoints?.energyConsumption?.name ||
                "EnergyConsumption"
            ]?.cost
          ),
        });
      }
    }
  }, [energyConsumption.isFetching]);

  useEffect(() => {
    if (!lastEnergyConsumption.isFetching && lastEnergyConsumption.isSuccess) {
      // console.log("hereeeeeeeee 2", lastEnergyConsumption.data.payload);
      if(lastEnergyConsumption.data.payload.dataPoints){
        // setLastEnergy(
        //   Math.floor(
        //     lastEnergyConsumption.data.payload.dataPoints[service?.widgetDatapoints?.energyConsumption?.name || 'EnergyConsumption']
        // ][service?.widgetDatapoints?.aggregationType || 'sum']
        //   )
        // );
        setLastEnergy({
          energy: Math.floor(
            lastEnergyConsumption.data.payload.dataPoints[
              service?.widgetDatapoints?.energyConsumption?.name ||
                "EnergyConsumption"
            ][aggMap[aggregateAvg]]
          ),
          cost: Math.floor(
            lastEnergyConsumption.data.payload.dataPoints[
              service?.widgetDatapoints?.energyConsumption?.name ||
                "EnergyConsumption"
            ]?.cost
          ),
        });
      }
    }
  }, [lastEnergyConsumption.isFetching]);

  useEffect(() => {

    setEnergyStartTime(cutoff
      ? new Date(new Date(new Date(new Date(startDate).setMonth(new Date(startDate).getMonth())).setFullYear(new Date(startDate.getFullYear()))).setHours(new Date(startDate).getHours()))
      : new Date(new Date(new Date(new Date(startDate).setMonth(new Date(startDate).getMonth())).setFullYear(new Date(startDate.getFullYear()))).setHours(new Date(startDate).getHours())))

    setEnergyEndTime(new Date(new Date(new Date(new Date(endDate).setMonth(new Date(endDate).getMonth())).setFullYear(new Date(endDate.getFullYear()))).setHours(new Date(endDate).getHours())))


    setStartTime(cutoff
      ? new Date(new Date(new Date(startDate).setDate(new Date(startDate).getDate() - (((Math.ceil(Math.abs(endDate - startDate)/ (1000 * 60 * 60 * 24))))))).setHours(new Date(startDate).getHours()))
      : new Date(new Date(new Date(startDate).setDate(new Date(startDate).getDate() - (((Math.ceil(Math.abs(endDate - startDate)/ (1000 * 60 * 60 * 24))))))).setHours(new Date(startDate).getHours())))

    setEndTime(cutoff
      ? new Date(new Date(new Date(startDate).setDate(new Date(startDate).getDate()  - 1)).setHours(new Date(endDate).getHours()))
      : new Date(new Date(new Date(startDate).setDate(new Date(startDate).getDate()  - 1)).setHours(new Date(endDate).getHours())))

  }, [days, startDate, endDate, cutoff]);

  useEffect(() => {
    if (refetch) {
      energyConsumption.refetch();
      lastEnergyConsumption.refetch();
      setRefetch(false);
    }
  }, [refetch, days, startDate, endDate]);

  function calculateTarget(tg, hr) {
    const dayDiff = (Math.ceil(Math.abs(energyEndTime - energyStartTime) / (1000 * 60 * 60 * 24)))
    return (Math.floor((tg / 24) * hr) * dayDiff) ? (Math.floor((tg / 24) * hr) * dayDiff) : 'N/A';
  }

  return (
    <Fragment>
      <Card sx={{ width: "23%", height: "23vh" }}>
        <CardContent sx={{ padding: "6px 16px 24px 16px", height: "100%" }}>
          <p
            style={{
              color: "#bfbec8",
              fontSize: "15px",
              textTransform: "capitalize",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <b>
              Energy Consumption
              <span style={{ position: "relative", top: "4px" }}>
                {(globalEnergy[unit == '$' ? 'cost' : 'energy'] - lastEnergy[unit == '$' ? 'cost' : 'energy']).toFixed(2) > 0 ? (
                  <TrendingUpIcon
                    style={{
                      color: "red",
                      marginLeft: "10px",
                      fontSize: "20px",
                    }}
                  />
                ) : (
                  <TrendingDownIcon
                    style={{
                      color: "green",
                      marginLeft: "10px",
                      fontSize: "20px",
                    }}
                  />
                )}
              </span>
            </b>
            <div>
              <Tooltip
                title={`Target for selected period is ${Math.floor(target[days]).toLocaleString()}. Current hour since midnight is ${new Date().getHours()} and hence prorated target is ${(unit == '$' ? ((calculateTarget(target[days], new Date().getHours())) * cost).toLocaleString() : (calculateTarget(target[days], new Date().getHours())).toLocaleString() ) || 'N/A'}`}
                placement="top"
                arrow
              >
                <InfoIcon style={{marginRight:'8px'}} />
              </Tooltip>
              <Tooltip title="Edit Target and Tariff" placement="top" arrow>
                <EditIcon style={{ cursor: "pointer" }} onClick={setOpen} />
              </Tooltip>
            </div>
          </p>
          {energyConsumption.isFetching || lastEnergyConsumption.isFetching ? (
            <Loader />
          ) : (
            <Box sx={{ flexGrow: 1, padding: "6% 0px 6% 0px" }}>
              <Stack direction="row" spacing={2} style={{ marginBottom: "1%" }}>
                <div style={{ width: "50%" }} className={unit == '$' ? 'cost-div' : 'energy-div'}>
                  <div style={{ display: "flex" }}>
                    <img
                      src={unit == "$" ? DollarOn : EnergyOn}
                      style={{ width: "45px", height: "45px" }}
                    />
                    <div style={{ marginTop: "4px" }}>
                      <div
                        className="energy-value"
                        style={{
                          fontSize: "1.7rem",
                          color: "#444",
                          fontWeight: "bold",
                          marginLeft: unit == "$" ? "5px" : "0px",
                        }}
                      >
                        {globalEnergy[unit == '$' ? 'cost' : 'energy'] ? globalEnergy[unit == '$' ? 'cost' : 'energy'].toLocaleString() : 'N/A'}
                      </div>
                      <div
                      className="energy-unit"
                        style={{
                          color: "#888",
                          fontWeight: "bold",
                          opacity: "0.5",
                          fontSize: "15px",
                          marginTop: "3px",
                          textAlign: "end",
                        }}
                      >
                        {unit}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ width: "50%" }} className="target-div">
                  {/* <Guage value={energy ? (parseFloat(energy)/parseFloat(target[days]))*100 : 0} /> */}
                  {
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginLeft: "-30px",
                        gap: "10px",
                      }}
                    >
                      {/* <span
                        style={{
                          position: "absolute",
                          // marginLeft: "1.5%",
                          marginTop: "6px",
                        }}
                      > */}
                      <img
                        style={{
                          marginTop: "6px",
                          width: "25px",
                          height: "25px",
                          opacity: "0.5",
                        }}
                        src={Target}
                      />
                      {/* </span> */}
                      <div>
                        <div
                        className="energy-target"
                          style={{
                            fontSize: "18px",
                            color: "grey",
                            opacity: "0.5",
                            textAlign: "center",
                            fontWeight: "bold",
                            width:'100%',
                            overflow:'hidden',
                            textOverflow:'ellipsis'
                          }}
                        >
                          {(unit == '$' 
                            // ? ((calculateTarget(target[days], new Date().getHours())) * cost).toLocaleString()
                            ? ((calculateTarget(target[days], new Date().getHours())) * cost).toLocaleString()
                            : (calculateTarget(target[days], new Date().getHours())).toLocaleString() )}
                        </div>
                        <div
                          style={{
                            color: "#555",
                            opacity: "0.5",
                            fontSize: "11px",
                            textAlign: "center",
                          }}
                        >
                          Target {unit}
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </Stack>
              <Stack direction="row" spacing={2} style={{ marginTop: "12px" }}>
                <div className="period-stack" style={{ width: "50%" }}>
                  <div>
                    <div
                    className="energy-last-period"
                      style={{
                        fontSize: "18px",
                        color: "grey",
                        opacity: "0.5",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      {Math.floor(lastEnergy[unit == '$' ? 'cost' : 'energy']) ? Math.floor(lastEnergy[unit == '$' ? 'cost' : 'energy']).toLocaleString() : 'N/A'}
                    </div>
                    <div
                      style={{
                        color: "#555",
                        opacity: "0.5",
                        fontSize: "11px",
                        textAlign: "center",
                      }}
                    >
                      Last period
                    </div>
                  </div>
                </div>
                <div className="period-stack" style={{ width: "50%" }}>
                  <div style={{ textAlign: "center" }}>
                    <span
                      className="energy-target-variance"
                      style={{
                        fontSize: "18px",
                        opacity: "0.7",
                        color:
                            (unit == '$' 
                              ? ((calculateTarget(target[days], new Date().getHours())) * cost) 
                              : (calculateTarget(target[days], new Date().getHours()))) - parseFloat(globalEnergy[unit == '$' ? 'cost' : 'energy'])
                              >= 0
                            ? "green"
                            : "red",
                        fontWeight: "bold",
                      }}
                    >
                      {(unit == '$' ? ((calculateTarget(target[days], new Date().getHours())) * cost): (calculateTarget(target[days], new Date().getHours()))) - parseFloat(globalEnergy[unit == '$' ? 'cost' : 'energy']) >= 0
                        ?  + Math.floor(
                          parseFloat(target[days]) - parseFloat(globalEnergy[unit == '$' ? 'cost' : 'energy'])
                        ) ? 
                        "+" + Math.floor(
                            ((unit == '$'
                              ? ((calculateTarget(target[days], new Date().getHours())) * cost)
                              : (calculateTarget(target[days], new Date().getHours())) ) - globalEnergy[unit == '$' ? 'cost' : 'energy'])
                          ).toLocaleString() : 'N/A'
                        :  Math.floor(
                            parseFloat(target[days]) - parseFloat(globalEnergy[unit == '$' ? 'cost' : 'energy'])
                          ) ? 
                          Math.floor(
                            ((unit == '$' 
                              ? ((calculateTarget(target[days], new Date().getHours())) * cost)
                              : (calculateTarget(target[days], new Date().getHours())) ) - globalEnergy[unit == '$' ? 'cost' : 'energy'])
                          )
                          .toLocaleString() : 'N/A'}
                    </span>
                    <div
                      style={{
                        color: "#555",
                        opacity: "0.5",
                        fontSize: "11px",
                        textAlign: "center",
                      }}
                    >
                      Target Variance
                    </div>
                  </div>
                </div>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
      <EditPopup
        open={open}
        setOpen={setOpen}
        unit={unit}
        cost={cost}
        setCost={setCost}
        target={target}
        setTarget={setTarget}
        serviceId={serviceId}
      />
    </Fragment>
  );
}
