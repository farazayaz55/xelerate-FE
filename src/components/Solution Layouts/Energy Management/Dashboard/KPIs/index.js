//-----------------CORE---------------//
import { Card, CardContent } from "@mui/material";
import React, { useState, useEffect, Fragment } from "react";
import { useSelector, useDispatch } from "react-redux";
import Box from "@mui/material/Box";
import GuageIcon from "assets/icons/gauge.png";
import FrequencyIcon from "assets/icons/frequency.png";
import Stack from "@mui/material/Stack";
import { useGetAggregatedDatabyGroupIdQuery } from "services/analytics";
import Loader from "components/Progress";

export default function KPI({ unit, serviceId, selectedDay, startDate, endDate, cutoff }) {
  const filtersValue = useSelector((state) => state.filterDevice);

  const [energyStartTime, setEnergyStartTime] = useState(cutoff
    ? new Date(new Date(new Date(new Date(startDate).setMonth(new Date(startDate).getMonth())).setFullYear(new Date(startDate.getFullYear()))).setHours(new Date(startDate).getHours()))
    : new Date(new Date(new Date(new Date(startDate).setMonth(new Date(startDate).getMonth())).setFullYear(new Date(startDate.getFullYear()))).setHours(new Date(startDate).getHours())))

  const [energyEndTime, setEnergyEndTime] = useState(new Date(new Date(new Date(new Date(endDate).setMonth(new Date(endDate).getMonth())).setFullYear(new Date(endDate.getFullYear()))).setHours(new Date(endDate).getHours())));

  const metaDataValue = useSelector((state) => state.metaData);
  const service = metaDataValue.services.find(s=>s.id == serviceId)
  const pf = service?.widgetDatapoints?.powerFactor?.name;
  const hz = service?.widgetDatapoints?.frequency?.name;
  const [datapoints, setDatapoints] = useState({pf:'', hz:''});
  const energyConsumption = useGetAggregatedDatabyGroupIdQuery({
    token: window.localStorage.getItem("token"),
    id: serviceId,
    group_id: filtersValue.group?.id || "",
    params: `?mode=hourly&aggregation=["mean"]&dataPoints=${JSON.stringify([pf || "PowerFactor", hz || "ACFrequency"])}&dateFrom=${new Date(new Date(energyStartTime).setSeconds(0)).toISOString()}&dateTo=${new Date(new Date(energyEndTime).setSeconds(0)).toISOString()}&aggregationType=avg&aggregate=true`,
  });

  useEffect(() => {
    if (!energyConsumption.isFetching && energyConsumption.isSuccess) {
      if(energyConsumption?.data?.payload?.dataPoints){
        setDatapoints({pf: energyConsumption?.data?.payload?.dataPoints[pf || 'PowerFactor'].mean?.toFixed(2), hz:energyConsumption?.data?.payload?.dataPoints[hz || 'ACFrequency'].mean?.toFixed(2)})
      }
    }
  }, [energyConsumption.isFetching]);

  useEffect(()=>{
    setEnergyStartTime(cutoff
      ? new Date(new Date(new Date(new Date(startDate).setMonth(new Date(startDate).getMonth())).setFullYear(new Date(startDate.getFullYear()))).setHours(new Date(startDate).getHours()))
      : new Date(new Date(new Date(new Date(startDate).setMonth(new Date(startDate).getMonth())).setFullYear(new Date(startDate.getFullYear()))).setHours(new Date(startDate).getHours())))

    setEnergyEndTime(new Date(new Date(new Date(new Date(endDate).setMonth(new Date(endDate).getMonth())).setFullYear(new Date(endDate.getFullYear()))).setHours(new Date(endDate).getHours())))


  },[selectedDay, startDate, endDate, cutoff])

  return (
    <Fragment>
      <Card sx={{ width: "17%", height: "23vh" }}>
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
            <b>KPIs</b>
            <div style={{ fontSize: "10px", color: "grey", opacity: "0.5" }}>
              ( Averages )
            </div>
          </p>
          <div className="kpi-div" style={{ height: "100%" }}>
            {energyConsumption.isFetching ? (
              <Loader />
            ) : (
              <Box sx={{ flexGrow: 1, padding: "6% 0px 6% 0px" }}>
                <Stack direction="row" spacing={2}>
                  <div className="kpi-icons" style={{ width: "50%" }}>
                    <div style={{ textAlign: "center" }}>
                      <img
                        src={GuageIcon}
                        style={{ width: "60px", height: "60px" }}
                      />
                    </div>
                  </div>
                  <div className="kpi-icons" style={{ width: "50%" }}>
                    <div style={{ textAlign: "center" }}>
                      <img
                        src={FrequencyIcon}
                        style={{ width: "60px", height: "60px" }}
                      />
                    </div>
                  </div>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <div style={{ width: "50%" }}>
                    <div>
                      <div
                        className="power-factor"
                        style={{
                          fontSize: "14px",
                          color: "#999",
                          opacity: "0.6",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        Power Factor
                      </div>
                      <div
                        className="power-factor-value"
                        style={{
                          color: "#888",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        {(datapoints?.pf || 'N/A')+" "}
                      </div>
                    </div>
                  </div>
                  <div style={{ width: "50%" }}>
                    <div>
                      <div
                        className="frequency"
                        style={{
                          fontSize: "14px",
                          color: "#999",
                          opacity: "0.6",
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        Frequency
                      </div>
                      <div
                        className="frequency-value"
                        style={{
                          color: "#888",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                         {(datapoints?.hz ? (datapoints?.hz+" Hz") : 'N/A')+" "}
                        
                      </div>
                    </div>
                  </div>
                </Stack>
              </Box>
            )}
          </div>
        </CardContent>
      </Card>
    </Fragment>
  );
}
