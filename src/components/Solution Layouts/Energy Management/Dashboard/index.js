//-----------------CORE---------------//
import React, { useState, Fragment } from "react";
import Energy from "./Energy";
import KPI from "./KPIs";
import EnergyComparison from "./Energy Comparison";
import DailyUsage from "./DailyUsage";
import EnergyFlow from "./Energy Flow";

export default function Dashboard({
  unit,
  sensors,
  days,
  startDate,
  endDate,
  serviceId,
  cost,
  setCost,
  target,
  setTarget,
  globalEnergy,
  setGlobalEnergy,
  history,
  refetch,
  setRefetch,
  permission,
  configSensors,
  cutoff,
  divideByPara,
  setDivideByPara
}) {
  const [fullScreen, setFullScreen] = useState("");

  return (
    <Fragment>
      <div style={{ display: "flex", gap: "16px" }}>
        {!fullScreen ? (
          <Energy
            unit={unit}
            cost={cost}
            setCost={setCost}
            target={target}
            setTarget={setTarget}
            serviceId={serviceId}
            days={days}
            startDate={startDate}
            endDate={endDate}
            globalEnergy={globalEnergy}
            setGlobalEnergy={setGlobalEnergy}
            refetch={refetch}
            setRefetch={setRefetch}
            cutoff={cutoff}
          />
        ) : null}
        {!fullScreen ? <KPI serviceId={serviceId} selectedDay={days} startDate={startDate} endDate={endDate} cutoff={cutoff} /> : null}
        {!fullScreen || fullScreen == 1 ? (
          <EnergyComparison
            selectedDay={days}
            startDate={startDate}
            endDate={endDate}
            sensors={sensors}
            configSensors={configSensors}
            permission={permission}
            target={target}
            fullScreen={fullScreen}
            setFullScreen={setFullScreen}
            serviceId={serviceId}
            unit={unit}
            cost={cost}
            refetch={refetch}
            setRefetch={setRefetch}
            cutoff={cutoff}
            divideByPara={divideByPara}
            setDivideByPara={setDivideByPara}
          />
        ) : null}
      </div>
      {!fullScreen || fullScreen == 2 || fullScreen == 3 ? (
        <div style={{ display: "flex", gap: "16px", marginTop: !fullScreen && "15px" }}>
          {!fullScreen || fullScreen == 2 ? (
            <DailyUsage
              cost={cost}
              fullScreen={fullScreen}
              setFullScreen={setFullScreen}
              unit={unit}
              serviceId={serviceId}
              selectedDay={days}
              startDate={startDate}
              endDate={endDate}
              history={history}
              refetch={refetch}
              setRefetch={setRefetch}
              cutoff={cutoff}
            />
          ) : null}
          {!fullScreen || fullScreen == 3 ? (
            <EnergyFlow
              history={history}
              selectedDay={days}
              startDate={startDate}
              endDate={endDate}
              sensors={sensors}
              fullScreen={fullScreen}
              setFullScreen={setFullScreen}
              serviceId={serviceId}
              unit={unit}
              cost={cost}
              target={target}
              setTarget={setTarget}
              refetch={refetch}
              setRefetch={setRefetch}
              cutoff={cutoff}
              divideByPara={divideByPara}
            />
          ) : null}
        </div>
      ) : null}
    </Fragment>
  );
}
