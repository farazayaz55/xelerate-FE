//-----------------CORE---------------//
import React, { Fragment, useEffect, useState } from "react";
//-----------------MUI---------------//
//-----------------MUI ICON---------------//
import TimelineIcon from "@mui/icons-material/Timeline";

//-----------------EXTERNAL---------------//

//
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import {
  faBoxesStacked,
  faArrowCircleRight,
  faSearch,
  faPencil,
} from "@fortawesome/free-solid-svg-icons";
import {
  setMapPage,
  setListPage,
  setLiveArr,
  setView,
} from "rtkSlices/AssetViewSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import ClusteredColumnChart from "components/Charts/ClusteredColumn";
import TrendMonitor from "../Trend Monitor";
import Analytics from "./../../Default/Trend Monitor";
import StackedArea from "components/Charts/StackedArea";
import { useGetAggregatedDatabyGroupIdQuery } from "services/analytics";
import { useDispatch, useSelector } from "react-redux";
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import Button from "@mui/material/Button";
import { useEditServiceMutation } from "services/services";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { setServices } from "rtkSlices/metaDataSlice";
import DerProduction from "assets/img/der-production.png";
import Injection from "assets/img/injection.png";
import EVCharger from "../../../../assets/icons/evcharger.png";
import SolarPanel from "../../../../assets/icons/solar-panel.png";
import WindEnergy from "assets/img/wind-energy.png";
import Battery from "assets/img/battery-asset.png";
import { useGetDeviceCountWrtGroupAndMetaTagsQuery } from "services/devices";
import Connectivity from "../Connectivity";
import { setFilter } from "rtkSlices/filterDevicesSlice";
import AlarmsChart from "../AlarmsChart";
import DevicesCount from "../DevicesCount";
import { useGetEVChargingLevelsQuery } from "services/devices";
import { useGetPVChargingLevelsQuery } from "services/devices";
import { useGetEsbAssetCountsQuery } from "services/devices";
import { useGetGroupInfoQuery } from "services/analytics";
import { useGetAlarmsCountForEsbQuery } from "services/alarms";
import EVEnergyChart from "../EVEnergyChart";
import PVEnergyChart from "../PVEnergyChart";
import Zoom from "@mui/material/Zoom";
import InfoIcon from "@mui/icons-material/Info";
import { Tooltip } from "@mui/material";
import { tooltipClasses } from "@mui/material/Tooltip";
import { resetFilter } from "rtkSlices/filterDevicesSlice";

//
//

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "rgb(246, 255, 201)",
    color: "rgba(0, 0, 0, 0.87)",
    maxWidth: "100%",
    fontSize: theme.typography.pxToRem(16),
    border: "1px solid #dadde9",
  },
  [`& .${tooltipClasses.arrow}`]: {
    backgroundColor: "rgba(0,0,0,0)",
    color: "#f5f5f9",
  },
}));

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  height: "100%",
}));
function DERcreateData(name, actual, limit, color) {
  return {
    name,
    actual,
    limit,
    color,
  };
}

const DERrows = [
  DERcreateData("Max Voltage [KV]", 7.3, 7.56, "#5FB762"),
  DERcreateData("Min Voltage [KV]", 0.2, 0.21, "#FE9F1B"),
  DERcreateData("Max Active Power [KW]", 0.0, 16.0, "#BF3535"),
  DERcreateData("Min Active Power [KW]", 0.0, 2000.0, "#BF3535"),
  DERcreateData("Max Reactive Power [KVAr]", 0.0, 3.7, "#BF3535"),
  DERcreateData("Min Reactive Power [KVAr]", 0.0, 3.7, "#BF3535"),
  DERcreateData("Max Power Factor", 1.0, 0.0, "#BF3535"),
  DERcreateData("Min Power Factor", 0.0, 0.9, "#BF3535"),
  DERcreateData("Min Capacity level [KWh]", 12.5, 30.0, "#BF3535"),
];
function EnergyResource(name, Total, GenUnits, eStorage, eVehicles) {
  return {
    name,
    Total,
    GenUnits,
    eStorage,
    eVehicles,
  };
}
const Energyrows = [
  EnergyResource("Unit Number", 174, 135, 19, 20),
  EnergyResource("Number Dispatch", 25, 16, 9, 0),
  EnergyResource("Installed Power [KVA]", 150588.7, 143828.7, 6345.0, 415.0),
  EnergyResource("Installed Dispatch [KVA]", 32768.8, 28898.8, 3870.0, 0.0),
];
function GenerationUnit(name, Total, Solar, Wind, Hydro, Biomass, Other) {
  return {
    name,
    Total,
    Solar,
    Wind,
    Hydro,
    Biomass,
    Other,
  };
}
const Generationrows = [
  GenerationUnit("Unit Number", 135, 23, 37, 9, 3, 36),
  GenerationUnit("Number Dispatch", 16, 0, 0, 5, 0, 11),
  GenerationUnit(
    "Installed Power [KVA]",
    143828.7,
    750.3,
    25576.3,
    6440.0,
    14000.0,
    97062.1
  ),
  GenerationUnit(
    "Installed Dispatch [KVA]",
    28898.8,
    0.0,
    0.0,
    5000.0,
    0.0,
    23898.8
  ),
];

export default function AggregatorControlCenter(props) {
  const [date, setDate] = useState(
    `dateFrom=${new Date(
      new Date().setDate(new Date().getDate() - 3)
    ).toISOString()}&dateTo=${new Date().toISOString()}`
  );
  const [evDatapoints, setEvDatapoints] = useState(null);
  const [evApDatapoints, setEvApDatapoints] = useState(null);

  const [pvDatapoints, setPvDatapoints] = useState(null);
  const [pvACDatapoints, setPvACDatapoints] = useState(null);

  const [numberOfDevices, setNumberOfDevices] = React.useState("");
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const filtersValue = useSelector((state) => state.filterDevice);
  const [groupId, setGroupId] = useState("");
  const [alarmsCount, setAlarmsCount] = useState(null);
  const [pvParams, setPvParams] = useState(null);
  const [evParams, setEvParams] = useState(null);
  const [assetCounts, setAssetCounts] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [disposed, setDisposed] = useState(false);
  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar(
      { title, message: message ? message : "Something went wrong", variant },
      { timeOut }
    );
  }
  const services = useSelector((state) => state.metaData?.services);
  const service = services?.find((x) => x.id == props?.group);
  const dataPointsNamesFromMetaData = service?.dataPointThresholds?.map(
    (x) => x?.dataPoint?.name
  );
  const pvChargingLevels = useGetPVChargingLevelsQuery({
    token: window.localStorage.getItem("token"),
    params: `?serviceId=${props.group}&esbDeviceType=Inverter${
      groupId ? `&groupId=${groupId}` : ``
    }`,
  });
  const evChargingLevels = useGetEVChargingLevelsQuery({
    token: window.localStorage.getItem("token"),
    params: `?serviceId=${props.group}&esbDeviceType=EVCharger${
      groupId ? `&groupId=${groupId}` : ``
    }`,
  });
  const esbAssetCounts = useGetEsbAssetCountsQuery({
    token: window.localStorage.getItem("token"),
    params: `?serviceId=${props.group}${groupId ? `&groupId=${groupId}` : ``}`,
  });
  let dataPoints = [
    "BatteryStatus",
    "BatteryPercentage",
    "BatteryCapacity",
    "W",
    "VA",
    "VAr",
    "DCW",
    "DCV",
    "2_DCV",
    "2_DCW",
    "PF",
    "Hz",
    "StateOfChargeStatus",
  ];
  dataPoints = [...dataPoints, ...dataPointsNamesFromMetaData];
  dataPoints = Array.from(new Set(dataPoints));

  const getDeviceCountWrtGroupAndMetaTagsQuery = useGetDeviceCountWrtGroupAndMetaTagsQuery(
    {
      token: window.localStorage.getItem("token"),
      id: props.group,
      group_id: "",
      body: [
        { deviceType: "Generation" },
        { deviceType: "Storage" },
        { deviceType: "Vehicles" },
      ],
    }
  );

  const derRes = useGetDeviceCountWrtGroupAndMetaTagsQuery(
    {
      token: window.localStorage.getItem("token"),
      id: props.group,
      group_id: groupId || "",
      body: [
        { deviceType: "Generation", subType: "Solar" },
        { deviceType: "Generation", deviceSubType: "Wind" },
        { deviceType: "Generation", deviceSubType: "Hydro" },
        { deviceType: "Generation", deviceSubType: "Biosmass" },
        { deviceType: "Generation", deviceSubType: "Other" },
      ],
    },
    { refetchOnMountOrArgChange: true }
  );

  const getAggregatedDatabyGroupIdBody = [
    { deviceType: "Generation", deviceSubType: "Solar", dispatching: true },
    { deviceType: "Generation", deviceSubType: "Wind", dispatching: true },
    { deviceType: "Generation", deviceSubType: "Hydro", dispatching: true },
    { deviceType: "Generation", deviceSubType: "Biomass", dispatching: true },
    { deviceType: "Generation", deviceSubType: "Other", dispatching: true },
  ];
  const getAggregatedDatabyGroupIdRes = useGetAggregatedDatabyGroupIdQuery(
    {
      token: window.localStorage.getItem("token"),
      id: props.group,
      group_id: groupId || "",
      params: `?mode=hourly&aggregate=true&aggregation=["mean"]&dataPoints=["WRtg","W"]&aggregationType=sum&tags=${JSON.stringify(
        getAggregatedDatabyGroupIdBody
      )}`,
    },
    { refetchOnMountOrArgChange: true }
  );

  let getAggregatedDatabyGroupIdBodyForDER = [
    { deviceType: "Generation", dispatching: true },
    { deviceType: "Storage", dispatching: true },
    { deviceType: "Vehicles", dispatching: true },
  ];
  const getAggregatedDatabyGroupIdResForDER = useGetAggregatedDatabyGroupIdQuery(
    {
      token: window.localStorage.getItem("token"),
      id: props.group,
      group_id: groupId || "",
      params: `?mode=hourly&aggregate=true&aggregation=["mean"]&dataPoints=["WRtg","W"]&tags=${JSON.stringify(
        getAggregatedDatabyGroupIdBodyForDER
      )}`,
    },
    { refetchOnMountOrArgChange: true }
  );

  const evAggregation = useGetGroupInfoQuery({
    token: window.localStorage.getItem("token"),
    id: props.group,
    parameters: `?mode=hourly&esbDeviceType=EVCharger&aggregate=true&aggregation=[%22sumOfReadings%22,%22mean%22]&dataPoints=["StateOfChargeStatus","W"]&aggregationType=avg${
      groupId != "" ? `&groupId=${groupId}` : ""
    }`,
  });

  const evApAggregation = useGetGroupInfoQuery({
    token: window.localStorage.getItem("token"),
    id: props.group,
    parameters: `?mode=hourly&esbDeviceType=EVCharger&aggregate=true&aggregation=[%22sumOfReadings%22,%22mean%22]&dataPoints=["StateOfChargeStatus","W"]&aggregationType=sum${
      groupId != "" ? `&groupId=${groupId}` : ""
    }`,
  });

  const pvAggregation = useGetGroupInfoQuery({
    token: window.localStorage.getItem("token"),
    id: props.group,
    parameters: `?mode=hourly&esbDeviceType=Inverter&aggregate=true&aggregation=[%22sumOfReadings%22,%22mean%22]&dataPoints=["StateOfChargeStatus","W", "V","BatteryCapacity"]&aggregationType=sum${
      groupId != "" ? `&groupId=${groupId}` : ""
    }`,
  });

  const pvVCAggregation = useGetGroupInfoQuery({
    token: window.localStorage.getItem("token"),
    id: props.group,
    parameters: `?mode=hourly&esbDeviceType=Inverter&aggregate=true&aggregation=[%22sumOfReadings%22,%22mean%22]&dataPoints=["StateOfChargeStatus","W", "V","BatteryCapacity"]&aggregationType=avg${
      groupId != "" ? `&groupId=${groupId}` : ""
    }`,
  });

  const esbAlarmsCount = useGetAlarmsCountForEsbQuery({
    token: window.localStorage.getItem("token"),
    params: `?status=[%22ACTIVE%22,%22ACKNOWLEDGED%22]&severity=["CRITICAL", "MAJOR", "MINOR", "WARNING"]&serviceId=${
      props.group
    }&sensors=["DerFaultPhaseRotation", "DerFaultOverCurrent", "DerFaultCurrentImbalance", "DerFaultUnderVoltage", "DerFaultOverVoltage", "DerFaultVoltageImbalance", "DerFaultUnderFrequency", "DerFaultOverFrequency", "DerFaultEmergencyLocal", "DerFaultEmergencyRemote", "DerFaultLowPowerInput", "PF", "V", "A", "AMax", "Hz", "VA", "DCW", "VAr", "W", "WMax", "VAMax", "VARMaxQ1", "VARMaxQ4", "SetWMaxPerSec"]${
      groupId != "" ? `&groupId=${groupId}` : ""
    }`,
  });

  const getAggregatedDatabyGroupIdResForDERChart = useGetAggregatedDatabyGroupIdQuery(
    {
      token: window.localStorage.getItem("token"),
      id: props.group,
      group_id: groupId || "",
      params: `?mode=daily&aggregation=["mean"]&dataPoints=["WRtg","W"]&aggregationType=sum&tags=${JSON.stringify(
        getAggregatedDatabyGroupIdBodyForDER
      )}&${date}`,
    },
    { refetchOnMountOrArgChange: true }
  );

  const genChartBody = [
    { deviceType: "Generation", deviceSubType: "Solar", dispatching: true },
    { deviceType: "Generation", deviceSubType: "Wind", dispatching: true },
    { deviceType: "Generation", deviceSubType: "Hydro", dispatching: true },
    { deviceType: "Generation", deviceSubType: "Biomass", dispatching: true },
    { deviceType: "Generation", deviceSubType: "Others", dispatching: true },
  ];
  const getAggregatedDatabyGroupIdResForGENChart = useGetAggregatedDatabyGroupIdQuery(
    {
      token: window.localStorage.getItem("token"),
      id: props.group,
      group_id:
        (service?.group && service?.group?.id ? service?.group?.id : groupId) ||
        "",
      params: `?mode=daily&aggregation=["mean"]&dataPoints=["WRtg","W"]&aggregationType=sum&tags=${JSON.stringify(
        genChartBody
      )}&${date}`,
    },
    { refetchOnMountOrArgChange: true }
  );

  const getAggregatedDatabyGroupIdForBatteryCapacity = useGetAggregatedDatabyGroupIdQuery(
    {
      token: window.localStorage.getItem("token"),
      id: props.group,
      group_id:
        (service?.group && service?.group?.id ? service?.group?.id : groupId) ||
        "",
      params: `?mode=daily&aggregation=["mean", "min", "max"]&dataPoints=["BatteryCapacity"]&aggregationType=sum&${date}`,
    },
    { refetchOnMountOrArgChange: true }
  );

  const res = useGetAggregatedDatabyGroupIdQuery(
    {
      token: window.localStorage.getItem("token"),
      id: props.group,
      group_id:
        (service?.group && service?.group?.id ? service?.group?.id : groupId) ||
        "",
      params: `?mode=hourly&aggregation=["mean","min","max"]&dataPoints=${JSON.stringify(
        dataPoints
      )}&aggregationType=sum&aggregate=true`,
    },
    { refetchOnMountOrArgChange: true }
  );

  const derRes2 = useGetAggregatedDatabyGroupIdQuery(
    {
      token: window.localStorage.getItem("token"),
      id: props.group,
      group_id:
        (service?.group && service.group.id ? service?.group?.id : groupId) ||
        "",
      params: `?mode=hourly&aggregation=["min","max"]&dataPoints=${JSON.stringify(
        dataPoints
      )}&aggregate=true`,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [aggregatedDatabyGroupId, setAggregatedDatabyGroupId] = useState({});
  const [aggregatedDerDatabyGroupId, setAggregatedDerDatabyGroupId] = useState(
    {}
  );

  const [intervalRef, setIntervalRef] = useState(null);
  const [derDataPoints, setDerDataPoints] = useState(null);
  const dispatch = useDispatch();

  const [selectedSERCriticalPoint, setSelectedSERCriticalPoint] = useState(
    null
  );
  const [initialLoad, setInitialLoad] = useState(true);
  const [initialLoadDerRes, setInitialLoadDerRes] = useState(true);

  const [editService, editServiceResult] = useEditServiceMutation();
  useEffect(() => {
    if (initialLoad && res.isSuccess) {
      setInitialLoad(false);
    }
  }, [res]);
  useEffect(() => {
    if (initialLoadDerRes && derRes2.isSuccess) {
      setInitialLoadDerRes(false);
    }
  }, [derRes2]);

  useEffect(() => {
    if (
      !getDeviceCountWrtGroupAndMetaTagsQuery.isFetching &&
      getDeviceCountWrtGroupAndMetaTagsQuery.isSuccess
    ) {
      let tempObj = derDataPoints
        ? JSON.parse(JSON.stringify(derDataPoints))
        : {};
      tempObj["der_unit_numbers"] =
        getDeviceCountWrtGroupAndMetaTagsQuery?.data?.payload;
      setDerDataPoints(tempObj);
    }
  }, [getDeviceCountWrtGroupAndMetaTagsQuery.isFetching]);

  useEffect(() => {
    if (!pvChargingLevels.isFetching && pvChargingLevels.isSuccess) {
      setPvParams(pvChargingLevels.data.payload.chargingMetrics);
    }
  }, [pvChargingLevels.isFetching]);

  useEffect(() => {
    if (!evChargingLevels.isFetching && evChargingLevels.isSuccess) {
      setEvParams(evChargingLevels.data.payload.chargingMetrics);
      if (
        evChargingLevels.data.payload.chargingMetrics.charging ||
        evChargingLevels.data.payload.chargingMetrics.idle ||
        evChargingLevels.data.payload.chargingMetrics.malfunction
      ) {
        setDisposed(false);
      }
    }
  }, [evChargingLevels.isFetching]);

  useEffect(() => {
    if (!esbAssetCounts.isFetching && esbAssetCounts.isSuccess) {
      setAssetCounts(esbAssetCounts.data.payload);
    }
  }, [esbAssetCounts.isFetching]);

  useEffect(() => {
    if (!evAggregation.isFetching && evAggregation.isSuccess) {
      setEvDatapoints(evAggregation.data.payload.dataPoints);
    }
  }, [evAggregation.isFetching]);

  useEffect(() => {
    if (!evApAggregation.isFetching && evApAggregation.isSuccess) {
      setEvApDatapoints(evApAggregation.data.payload.dataPoints);
    }
  }, [evApAggregation.isFetching]);

  useEffect(() => {
    if (!pvAggregation.isFetching && pvAggregation.isSuccess) {
      setPvDatapoints(pvAggregation.data.payload.dataPoints);
    }
  }, [pvAggregation.isFetching]);

  useEffect(() => {
    if (!pvVCAggregation.isFetching && pvVCAggregation.isSuccess) {
      setPvACDatapoints(pvVCAggregation.data.payload.dataPoints);
    }
  }, [pvVCAggregation.isFetching]);

  useEffect(() => {
    if (!esbAlarmsCount.isFetching && esbAlarmsCount.isSuccess) {
      let data = esbAlarmsCount.data.payload?.alarmsEV
        ? {
            alarmsEV: {
              Voltage:
                esbAlarmsCount.data.payload.alarmsEV.DerFaultOverVoltage +
                esbAlarmsCount.data.payload.alarmsEV.DerFaultUnderVoltage +
                esbAlarmsCount.data.payload.alarmsEV.DerFaultVoltageImbalance +
                esbAlarmsCount.data.payload.alarmsEV.V,
              Current:
                esbAlarmsCount.data.payload.alarmsEV.DerFaultOverCurrent +
                esbAlarmsCount.data.payload.alarmsEV.DerFaultCurrentImbalance +
                esbAlarmsCount.data.payload.alarmsEV.A +
                esbAlarmsCount.data.payload.alarmsEV.AMax,
              Power:
                esbAlarmsCount.data.payload.alarmsEV.DerFaultLowPowerInput +
                esbAlarmsCount.data.payload.alarmsEV.VA +
                esbAlarmsCount.data.payload.alarmsEV.DCW +
                esbAlarmsCount.data.payload.alarmsEV.VAR +
                esbAlarmsCount.data.payload.alarmsEV.W +
                esbAlarmsCount.data.payload.alarmsEV.WMax +
                esbAlarmsCount.data.payload.alarmsEV.VAMax +
                esbAlarmsCount.data.payload.alarmsEV.VARMaxQ1 +
                esbAlarmsCount.data.payload.alarmsEV.VARMaxQ4 +
                esbAlarmsCount.data.payload.alarmsEV.SetWMaxPerSec,
              Frequency:
                esbAlarmsCount.data.payload.alarmsEV.DerFaultOverFrequency +
                esbAlarmsCount.data.payload.alarmsEV.DerFaultUnderFrequency +
                esbAlarmsCount.data.payload.alarmsEV.Hz,
              Emergency:
                esbAlarmsCount.data.payload.alarmsEV.DerFaultEmergencyLocal +
                esbAlarmsCount.data.payload.alarmsEV.DerFaultEmergencyRemote,
              "Phase Rotation":
                esbAlarmsCount.data.payload.alarmsEV.DerFaultPhaseRotation,
              "Power Factor": esbAlarmsCount.data.payload.alarmsEV.PF,
            },
            alarmsInverter: {
              Voltage:
                esbAlarmsCount.data.payload.alarmsInverter.DerFaultOverVoltage +
                esbAlarmsCount.data.payload.alarmsInverter
                  .DerFaultUnderVoltage +
                esbAlarmsCount.data.payload.alarmsInverter
                  .DerFaultVoltageImbalance,
              Current:
                esbAlarmsCount.data.payload.alarmsInverter.DerFaultOverCurrent +
                esbAlarmsCount.data.payload.alarmsInverter
                  .DerFaultCurrentImbalance,
              Power:
                esbAlarmsCount.data.payload.alarmsInverter
                  .DerFaultLowPowerInput,
              Frequency:
                esbAlarmsCount.data.payload.alarmsInverter
                  .DerFaultOverFrequency +
                esbAlarmsCount.data.payload.alarmsInverter
                  .DerFaultUnderFrequency,
              Emergency:
                esbAlarmsCount.data.payload.alarmsInverter
                  .DerFaultEmergencyLocal +
                esbAlarmsCount.data.payload.alarmsInverter
                  .DerFaultEmergencyRemote,
              "Phase Rotation":
                esbAlarmsCount.data.payload.alarmsInverter
                  .DerFaultPhaseRotation,
              "Power Factor": esbAlarmsCount.data.payload.alarmsInverter.PF,
            },
            alarmsOther: {
              Voltage:
                esbAlarmsCount.data.payload.alarmsOther.DerFaultOverVoltage +
                esbAlarmsCount.data.payload.alarmsOther.DerFaultUnderVoltage +
                esbAlarmsCount.data.payload.alarmsOther
                  .DerFaultVoltageImbalance,
              Current:
                esbAlarmsCount.data.payload.alarmsOther.DerFaultOverCurrent +
                esbAlarmsCount.data.payload.alarmsOther
                  .DerFaultCurrentImbalance,
              Power:
                esbAlarmsCount.data.payload.alarmsOther.DerFaultLowPowerInput,
              Frequency:
                esbAlarmsCount.data.payload.alarmsOther.DerFaultOverFrequency +
                esbAlarmsCount.data.payload.alarmsOther.DerFaultUnderFrequency,
              Emergency:
                esbAlarmsCount.data.payload.alarmsOther.DerFaultEmergencyLocal +
                esbAlarmsCount.data.payload.alarmsOther.DerFaultEmergencyRemote,
              "Phase Rotation":
                esbAlarmsCount.data.payload.alarmsOther.DerFaultPhaseRotation,
              "Power Factor": esbAlarmsCount.data.payload.alarmsOther.PF,
            },
          }
        : {
            alarmsEV: {
              Voltage: 0,
              Current: 0,
              Power: 0,
              Frequency: 0,
              Emergency: 0,
              "Phase Rotation": 0,
              "Power Factor": 0,
            },
            alarmsInverter: {
              Voltage: 0,
              Current: 0,
              Power: 0,
              Frequency: 0,
              Emergency: 0,
              "Phase Rotation": 0,
              "Power Factor": 0,
            },
            alarmsOther: {
              Voltage: 0,
              Current: 0,
              Power: 0,
              Frequency: 0,
              Emergency: 0,
              "Phase Rotation": 0,
              "Power Factor": 0,
            },
          };
      setAlarmsCount(data);
    }
  }, [esbAlarmsCount.isFetching]);

  useEffect(() => {
    if (!derRes.isFetching && derRes.isSuccess) {
      let tempObj = derDataPoints
        ? JSON.parse(JSON.stringify(derDataPoints))
        : {};
      tempObj["der_data_points"] = derRes?.data?.payload;
      setDerDataPoints(tempObj);
    }
  }, [derRes.isFetching]);

  useEffect(() => {
    if (
      !getAggregatedDatabyGroupIdRes.isFetching &&
      getAggregatedDatabyGroupIdRes.isSuccess
    ) {
      let tempObj = derDataPoints
        ? JSON.parse(JSON.stringify(derDataPoints))
        : {};
      tempObj["gen_unit_data_points"] =
        getAggregatedDatabyGroupIdRes?.data?.payload;
      setDerDataPoints(tempObj);
    }
  }, [getAggregatedDatabyGroupIdRes.isFetching]);

  useEffect(() => {
    if (
      !getAggregatedDatabyGroupIdResForDER.isFetching &&
      getAggregatedDatabyGroupIdResForDER.isSuccess
    ) {
      let tempObj = derDataPoints
        ? JSON.parse(JSON.stringify(derDataPoints))
        : {};
      tempObj["der_points"] =
        getAggregatedDatabyGroupIdResForDER?.data?.payload;
      setDerDataPoints(tempObj);
    }
  }, [getAggregatedDatabyGroupIdResForDER.isFetching]);

  useEffect(() => {
    if (
      !getAggregatedDatabyGroupIdResForDERChart.isFetching &&
      getAggregatedDatabyGroupIdResForDERChart.isSuccess
    ) {
      let tempObj = derDataPoints
        ? JSON.parse(JSON.stringify(derDataPoints))
        : {};

      let normalizeDERDataPointsForBarChart = [];
      if (getAggregatedDatabyGroupIdResForDERChart.isSuccess) {
        let dataPoints =
          getAggregatedDatabyGroupIdResForDERChart?.data?.payload?.dataPoints;
        normalizeDERDataPointsForBarChart = dataPoints?.W?.map((x, index) => {
          return {
            day: new Date(x.time).toLocaleDateString("en-GB"),
            W: x.mean,
            WRtg: dataPoints?.WRtg[index].mean,
          };
        });
      }
      tempObj[
        "DERDataPointsForBarChart"
      ] = normalizeDERDataPointsForBarChart.reverse();
      setDerDataPoints(tempObj);
    }
  }, [getAggregatedDatabyGroupIdResForDERChart.isFetching]);

  useEffect(() => {
    if (
      !getAggregatedDatabyGroupIdResForGENChart.isFetching &&
      getAggregatedDatabyGroupIdResForGENChart.isSuccess
    ) {
      let tempObj = derDataPoints
        ? JSON.parse(JSON.stringify(derDataPoints))
        : {};
      let normalizeGENDataPointsForBarChart = [];
      if (getAggregatedDatabyGroupIdResForGENChart.isSuccess) {
        let dataPoints =
          getAggregatedDatabyGroupIdResForGENChart?.data?.payload?.dataPoints;
        normalizeGENDataPointsForBarChart = dataPoints?.W?.map((x, index) => {
          return {
            day: new Date(x.time).toLocaleDateString("en-GB"),
            W: x.mean,
            WRtg: dataPoints?.WRtg[index].mean,
          };
        });
      }
      tempObj[
        "GENDataPointsForBarChart"
      ] = normalizeGENDataPointsForBarChart.reverse();
      setDerDataPoints(tempObj);
    }
  }, [getAggregatedDatabyGroupIdResForGENChart.isFetching]);

  useEffect(() => {
    if (
      !getAggregatedDatabyGroupIdForBatteryCapacity.isFetching &&
      getAggregatedDatabyGroupIdForBatteryCapacity.isSuccess
    ) {
      let tempObj = derDataPoints
        ? JSON.parse(JSON.stringify(derDataPoints))
        : {};
      let normalizeGENDataPointsForBarBatteryCapacity = [];
      let BatteryCapacityUnitDataPointsForBarChart = "";
      if (getAggregatedDatabyGroupIdForBatteryCapacity.isSuccess) {
        let dataPoints =
          getAggregatedDatabyGroupIdForBatteryCapacity?.data?.payload
            ?.dataPoints;
        normalizeGENDataPointsForBarBatteryCapacity = dataPoints?.BatteryCapacity?.map(
          (x, index) => {
            BatteryCapacityUnitDataPointsForBarChart = x.unit;
            return {
              year: new Date(x.time).toLocaleDateString("en-GB"),
              mean: x.mean,
              min: x.min,
              max: x.max,
            };
          }
        );
      }
      setDerDataPoints({
        ...tempObj,
        BatteryCapacityDataPointsForBarChart: normalizeGENDataPointsForBarBatteryCapacity
          ? normalizeGENDataPointsForBarBatteryCapacity.reverse()
          : normalizeGENDataPointsForBarBatteryCapacity,
        BatteryCapacityUnitDataPointsForBarChart: BatteryCapacityUnitDataPointsForBarChart,
      });
    }
  }, [getAggregatedDatabyGroupIdForBatteryCapacity.isFetching]);

  useEffect(() => {
    if (!res.isFetching && res.isSuccess) {
      let payload = { ...res.data?.payload?.dataPoints };
      setNumberOfDevices(res.data?.payload?.numberOfDevices);
      if (res?.data?.payload?.lastUpdated) {
        setLastUpdated(
          new Date(res?.data?.payload?.lastUpdated).toLocaleDateString("en-GB") +
            " " +
            new Date(res?.data?.payload?.lastUpdated).toLocaleTimeString()
        );
      }
      let tempaggregatedDatabyGroupId = JSON.parse(
        JSON.stringify(aggregatedDatabyGroupId)
      );
      for (const datapoint in payload) {
        if (Object.hasOwnProperty.call(payload, datapoint)) {
          const element = payload[datapoint];
          if (element.mean || element.mean == 0) {
            tempaggregatedDatabyGroupId[datapoint] = element;
          }
        }
      }
      setAggregatedDatabyGroupId(tempaggregatedDatabyGroupId);
    }
  }, [res.isFetching]);

  useEffect(() => {
    if (!derRes2.isFetching && derRes2.isSuccess) {
      let payloadDer = { ...derRes2.data?.payload?.dataPoints };
      let tempaggregatedDatabyGroupId = JSON.parse(
        JSON.stringify(aggregatedDatabyGroupId)
      );
      for (const datapoint in payloadDer) {
        if (Object.hasOwnProperty.call(payloadDer, datapoint)) {
          const element = payloadDer[datapoint];
          // if (element.mean) {
          tempaggregatedDatabyGroupId[datapoint] = element;
          // }
        }
      }
      setAggregatedDerDatabyGroupId(tempaggregatedDatabyGroupId);
    }
  }, [derRes2.isFetching]);

  function refetchAll() {
    derRes.refetch();
    getAggregatedDatabyGroupIdRes.refetch();
    getAggregatedDatabyGroupIdResForDER.refetch();
    getAggregatedDatabyGroupIdResForDERChart.refetch();
    getAggregatedDatabyGroupIdResForGENChart.refetch();
    getAggregatedDatabyGroupIdForBatteryCapacity.refetch();
    res.refetch();
    derRes2.refetch();
  }

  useEffect(() => {
    dispatch(setView(props.layout.map.default));
    return () => {
      dispatch(setMapPage(1));
      dispatch(setListPage(1));
      dispatch(resetFilter());
    };
  }, []);
  useEffect(() => {
    if (filtersValue.expanded.length > 0) {
      let id = filtersValue.selectedNodeChain[
        filtersValue.selectedNodeChain.length - 1
      ].split(":")[0];
      if (id && groupId != id && parseInt(id) != 0) {
        setDisposed(true);
        setGroupId(id);
        setAggregatedDatabyGroupId({});
        setAggregatedDerDatabyGroupId({});
        setDerDataPoints({});
        refetchAll();
      }
      if (
        filtersValue.selectedNodeChain.length == 1 &&
        filtersValue.selectedNodeChain[0] == "0:All assets"
      ) {
        setGroupId("");
        refetchAll();
      }
    } else {
      setGroupId("");
      refetchAll();
    }
  }, [filtersValue]);

  useEffect(() => {
    if (editServiceResult.isSuccess) {
      showSnackbar(
        "Solution",
        editServiceResult.data?.message,
        "success",
        1000
      );
      setSelectedSERCriticalPoint(null);
    }
    if (editServiceResult.isError) {
      showSnackbar(
        "Solution",
        editServiceResult.error?.data?.message,
        "error",
        1000
      );
    }
  }, [editServiceResult]);

  useEffect(() => {
    initiateAggregatorInterval();
    if (service.group && service.group?.id) {
      dispatch(setFilter({ group: service.group }));
    }
    return () => {
      clearInterval(intervalRef);
    };
  }, []);

  // useEffect(() => {
  //     if (filtersValue.selectedNodeChain.length && (filtersValue.selectedNodeChain[filtersValue.selectedNodeChain.length - 1].split(':')).length > 0) {
  //         let group_id = filtersValue.selectedNodeChain[filtersValue.selectedNodeChain.length - 1].split(':')[0]
  //         if (group_id && group_id !== '0' && group_id !== ' ') {
  //             // group_id = ''
  //             initiateAggregatorInterval(group_id)
  //         }
  //     }
  // }, [filtersValue.selectedNodeChain])

  const handleDisposed = () => {
    setDisposed(true);
  };

  const initiateAggregatorInterval = (group_id = "") => {
    intervalRef && clearInterval(intervalRef);
    refetchAll();
    // getAggregatedDatabyGroupIdFunc(group_id)
    // getGERAndGUCount(group_id)
    const timerRef = setInterval(() => {
      refetchAll();
      // getAggregatedDatabyGroupIdFunc(group_id)
      // getGERAndGUCount(group_id)
    }, 60000);
    setIntervalRef(timerRef);
  };

  const getColorMin = (val, sensor) => {
    console.log({val, sensor})
    let code = [...sensor.colorArray];
    if (sensor.reverse) code.reverse();

    if (sensor?.ranges?.length) {
      if (val < sensor.ranges[0].min) {
        return code[0];
      }
      if (val >= sensor.ranges[sensor.ranges.length - 1].max) {
        return code[code.length - 1];
      }
      for (let i = 0; i < sensor.ranges.length; i++) {
        if (val >= sensor.ranges[i].min && val < sensor.ranges[i].max) {
          return code[i];
        }
      }
    }

    if (val <= sensor.min) {
      return code[0];
    } else {
      let perc = ((sensor.min - val) / (sensor.min - sensor.max)) * 100;
      if (perc < 0) perc = 0;
      if (perc > 50) perc = 50;
      let range = Math.round(100 / code.length);
      let index = Math.trunc(perc / range);
      index = index >= code.length ? index - 1 : index;
      let res = code[index];
      return res;
    }
  };

  const getColorMax = (val, sensor) => {
    console.log({val, sensor})
    let code = [...sensor.colorArray];
    if (sensor.reverse) code.reverse();

    if (sensor?.ranges?.length) {
      if (val < sensor.ranges[0].min) {
        return code[0];
      }
      if (val >= sensor.ranges[sensor.ranges.length - 1].max) {
        return code[code.length - 1];
      }
      for (let i = 0; i < sensor.ranges.length; i++) {
        if (val >= sensor.ranges[i].min && val < sensor.ranges[i].max) {
          return code[i];
        }
      }
    }

    if (val >= sensor.max) {
      return code[code.length - 1];
    } else {
      let perc = ((sensor.min - val) / (sensor.min - sensor.max)) * 100;
      if (perc < 0) perc = 0;
      if (perc < 50) perc = 50;
      let range = Math.round(100 / code.length);
      let index = Math.trunc(perc / range);
      index = index >= code.length ? index - 1 : index;
      let res = code[index];
      return res;
    }
  };

  const InjectionDetails = {
    activePowerMean: aggregatedDatabyGroupId?.W?.mean * 0.3,
    apparentPowerMean: aggregatedDatabyGroupId?.VAr?.mean * 0.6,
    activePowerPercentage: (
      ((Number(aggregatedDatabyGroupId?.W?.mean) * 0.3) /
        Number(aggregatedDatabyGroupId?.VAr?.mean)) *
      0.7 *
      10
    ).toFixed(1),
  };

  const onChangeLimit = (e) => {
    let number = e.target.value;
    let copySelectedSERCriticalPoint = JSON.parse(
      JSON.stringify(selectedSERCriticalPoint)
    );
    copySelectedSERCriticalPoint.onePoint[
      copySelectedSERCriticalPoint.minOrMax
    ] = Number(number);
    setSelectedSERCriticalPoint({ ...copySelectedSERCriticalPoint });
  };
  const renderEditLimitModal = () => {
    if (selectedSERCriticalPoint?.onePoint) {
    }
    return (
      <Dialog
        open={selectedSERCriticalPoint ? true : false}
        onClose={() => {}}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle>{"Update Limit"}</DialogTitle>
        {selectedSERCriticalPoint && (
          <DialogContent>
            <p>
              {selectedSERCriticalPoint.minOrMax[0].toUpperCase() +
                selectedSERCriticalPoint.minOrMax.substring(1)}{" "}
              {selectedSERCriticalPoint.onePoint?.dataPoint?.friendlyName}
            </p>
            <TextField
              required
              margin="dense"
              label="limit"
              fullWidth
              type="number"
              value={
                selectedSERCriticalPoint?.onePoint.ranges.length
                  ? selectedSERCriticalPoint.onePoint.ranges[
                      selectedSERCriticalPoint.minOrMax == "min"
                        ? 0
                        : selectedSERCriticalPoint.onePoint.ranges.length - 1
                    ][selectedSERCriticalPoint.minOrMax]
                  : selectedSERCriticalPoint.onePoint[
                      selectedSERCriticalPoint.minOrMax
                    ]
              }
              onChange={onChangeLimit}
            />
          </DialogContent>
        )}
        <DialogActions>
          <Button
            onClick={() => {
              setSelectedSERCriticalPoint(null);
            }}
            color="error"
          >
            Cancel
          </Button>

          {editServiceResult?.isLoading ? (
            <CircularProgress
              color="secondary"
              size={20}
              style={{ position: "relative", right: "20px", bottom: "5px" }}
            />
          ) : (
            <Button
              type="submit"
              color="secondary"
              onClick={onClickUpdateLimit}
            >
              <span>{"Update Limit"}</span>
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  };

  const onClickUpdateLimit = async () => {
    let dataPoints = structuredClone(service?.dataPointThresholds);
    const updateDataPointIndex = dataPoints.findIndex(
      (x) => x._id === selectedSERCriticalPoint?.onePoint._id
    );
    if (dataPoints[updateDataPointIndex].ranges.length) {
      dataPoints[updateDataPointIndex].ranges[
        selectedSERCriticalPoint.minOrMax == "min"
          ? 0
          : dataPoints[updateDataPointIndex].ranges.length - 1
      ][selectedSERCriticalPoint.minOrMax] = selectedSERCriticalPoint.onePoint[
        selectedSERCriticalPoint.minOrMax
      ].toString();
    } else {
      dataPoints[updateDataPointIndex] = structuredClone(
        selectedSERCriticalPoint?.onePoint
      );
    }
    let fd = new FormData();
    fd.append("dataPointThresholds", JSON.stringify(dataPoints));
    const res = await editService({
      token: window.localStorage.getItem("token"),
      id: props.group,
      body: {
        dataPointThresholds: dataPoints,
      },
    });

    const copyServices = structuredClone(services);
    const serviceIndex = copyServices.findIndex((x) => x.id === props.group);
    copyServices[serviceIndex].dataPointThresholds =
      res.data.payload.dataPointThresholds;
    dispatch(setServices(structuredClone(copyServices)));
  };

  const renderDERtable = () => {
    const genUnit = derDataPoints?.der_unit_numbers?.find(
      (x) => x.deviceType === "Generation"
    );
    const storageUnit = derDataPoints?.der_unit_numbers?.find(
      (x) => x.deviceType === "Storage"
    );
    const vehiclesUnit = derDataPoints?.der_unit_numbers?.find(
      (x) => x.deviceType === "Vehicles"
    );
    let total = 0;
    genUnit ? (total += genUnit?.count) : null;
    storageUnit ? (total += storageUnit?.count) : null;
    vehiclesUnit ? (total += vehiclesUnit?.count) : null;

    /** For Number Dispatch */
    const genND = derDataPoints?.der_points?.find(
      (x) => x.deviceType === "Generation"
    );
    const storageND = derDataPoints?.der_points?.find(
      (x) => x.deviceType === "Storage"
    );
    const vehicleND = derDataPoints?.der_points?.find(
      (x) => x.deviceType === "Vehicles"
    );

    /** Total Number of Devices */
    let totalNoOfDevices = 0;
    genND ? (totalNoOfDevices += genND?.numberOfDevices) : null;
    storageND ? (totalNoOfDevices += storageND?.numberOfDevices) : null;
    vehicleND ? (totalNoOfDevices += vehicleND?.numberOfDevices) : null;

    /** Total WRtg */
    let totalInstalledPower = 0;
    genND ? (totalInstalledPower += genND?.dataPoints?.WRtg?.mean) : null;
    storageND
      ? (totalInstalledPower += storageND?.dataPoints?.WRtg?.mean)
      : null;
    vehicleND
      ? (totalInstalledPower += vehicleND?.dataPoints?.WRtg?.mean)
      : null;
    totalInstalledPower = totalInstalledPower.toFixed(2);

    /** Total WRtg */
    let totalIDispatchPower = 0;
    genND ? (totalIDispatchPower += genND?.dataPoints?.W?.mean) : null;
    storageND ? (totalIDispatchPower += storageND?.dataPoints?.W?.mean) : null;
    vehicleND ? (totalIDispatchPower += vehicleND?.dataPoints?.W?.mean) : null;
    totalIDispatchPower = totalIDispatchPower.toFixed(2);

    return (
      <>
        <TableRow
          key={"Units Count"}
          sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
        >
          <TableCell component="th" scope="row">
            {"Units Count"}
          </TableCell>
          <TableCell>{total ? total : "--"}</TableCell>
          <TableCell>{genUnit ? genUnit?.count : "--"}</TableCell>
          <TableCell>{storageUnit ? storageUnit?.count : "--"}</TableCell>
          <TableCell>{vehiclesUnit ? vehiclesUnit?.count : "--"}</TableCell>
        </TableRow>
        <TableRow
          key={"Dispatch Count"}
          sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
        >
          <TableCell component="th" scope="row">
            {"Dispatch Count"}
          </TableCell>
          <TableCell>{totalNoOfDevices ? totalNoOfDevices : "--"}</TableCell>
          <TableCell>{genND ? genND?.numberOfDevices : "--"}</TableCell>
          <TableCell>{storageND ? storageND?.numberOfDevices : "--"}</TableCell>
          <TableCell>{vehicleND ? vehicleND?.numberOfDevices : "--"}</TableCell>
        </TableRow>
        <TableRow
          key={"Installed Power"}
          sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
        >
          <TableCell component="th" scope="row">
            {`Installed Power ${
              genND?.dataPoints?.WRtg?.unit
                ? `[${genND?.dataPoints?.WRtg?.unit}]`
                : ""
            }`}
          </TableCell>
          <TableCell>
            {totalInstalledPower ? totalInstalledPower : "--"}
          </TableCell>
          <TableCell>
            {genND ? Number(genND?.dataPoints?.WRtg?.mean).toFixed(2) : "--"}
          </TableCell>
          <TableCell>
            {storageND
              ? Number(storageND?.dataPoints?.WRtg?.mean).toFixed(2)
              : "--"}
          </TableCell>
          <TableCell>
            {vehicleND
              ? Number(vehicleND?.dataPoints?.WRtg?.mean).toFixed(2)
              : "--"}
          </TableCell>
        </TableRow>
        <TableRow
          key={"Dispatched Power"}
          sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
        >
          <TableCell component="th" scope="row">
            {`Dispatched Power ${
              genND?.dataPoints?.W?.unit
                ? `[${genND?.dataPoints?.W?.unit}]`
                : ""
            }`}
          </TableCell>
          <TableCell>
            {totalIDispatchPower ? totalIDispatchPower : "--"}
          </TableCell>
          <TableCell>
            {genND ? Number(genND?.dataPoints?.W?.mean).toFixed(2) : "--"}
          </TableCell>
          <TableCell>
            {storageND
              ? Number(storageND?.dataPoints?.W?.mean).toFixed(2)
              : "--"}
          </TableCell>
          <TableCell>
            {vehicleND
              ? Number(vehicleND?.dataPoints?.W?.mean).toFixed(2)
              : "--"}
          </TableCell>
        </TableRow>
      </>
    );
  };
  const renderDERGentable = () => {
    /** For Unit Number */
    const solar = derDataPoints?.der_data_points?.find(
      (x) => x.deviceSubType === "Solar"
    );
    const wind = derDataPoints?.der_data_points?.find(
      (x) => x.deviceSubType === "Wind"
    );
    const hydro = derDataPoints?.der_data_points?.find(
      (x) => x.deviceSubType === "Hydro"
    );
    const biosmass = derDataPoints?.der_data_points?.find(
      (x) => x.deviceSubType === "Biosmass"
    );
    const other = derDataPoints?.der_data_points?.find(
      (x) => x.deviceSubType === "Other"
    );

    let total = 0;
    solar ? (total += solar?.count) : null;
    wind ? (total += wind?.count) : null;
    hydro ? (total += hydro?.count) : null;
    biosmass ? (total += biosmass?.count) : null;
    other ? (total += other?.count) : null;

    /** For Number Dispatch */
    const solarND = derDataPoints?.gen_unit_data_points?.find(
      (x) => x.deviceSubType === "Solar"
    );
    const windND = derDataPoints?.gen_unit_data_points?.find(
      (x) => x.deviceSubType === "Wind"
    );
    const hydroND = derDataPoints?.gen_unit_data_points?.find(
      (x) => x.deviceSubType === "Hydro"
    );
    const biosmassND = derDataPoints?.gen_unit_data_points?.find(
      (x) => x.deviceSubType === "Biomass"
    );
    const otherND = derDataPoints?.gen_unit_data_points?.find(
      (x) => x.deviceSubType === "Other"
    );

    /** Total Number of Devices */
    let totalNoOfDevices = 0;
    solarND ? (totalNoOfDevices += solarND?.numberOfDevices) : null;
    windND ? (totalNoOfDevices += windND?.numberOfDevices) : null;
    hydroND ? (totalNoOfDevices += hydroND?.numberOfDevices) : null;
    biosmassND ? (totalNoOfDevices += biosmassND?.numberOfDevices) : null;
    otherND ? (totalNoOfDevices += otherND?.numberOfDevices) : null;

    /** Total WRtg */
    let totalInstalledPower = 0;
    solarND ? (totalInstalledPower += solarND?.dataPoints?.WRtg?.mean) : null;
    windND ? (totalInstalledPower += windND?.dataPoints?.WRtg?.mean) : null;
    hydroND ? (totalInstalledPower += hydroND?.dataPoints?.WRtg?.mean) : null;
    biosmassND
      ? (totalInstalledPower += biosmassND?.dataPoints?.WRtg?.mean)
      : null;
    otherND ? (totalInstalledPower += otherND?.dataPoints?.WRtg?.mean) : null;
    totalInstalledPower = totalInstalledPower.toFixed(2);

    /** Total WRtg */
    let totalIDispatchPower = 0;
    solarND ? (totalIDispatchPower += solarND?.dataPoints?.W?.mean) : null;
    windND ? (totalIDispatchPower += windND?.dataPoints?.W?.mean) : null;
    hydroND ? (totalIDispatchPower += hydroND?.dataPoints?.W?.mean) : null;
    biosmassND
      ? (totalIDispatchPower += biosmassND?.dataPoints?.W?.mean)
      : null;
    otherND ? (totalIDispatchPower += otherND?.dataPoints?.W?.mean) : null;
    totalIDispatchPower = totalIDispatchPower.toFixed(2);

    return (
      <>
        <TableRow
          key={"Unit Number"}
          sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
        >
          <TableCell component="th" scope="row">
            {"Units Count"}
          </TableCell>
          <TableCell>{total ? total : "--"}</TableCell>
          <TableCell>{solar ? solar?.count : "--"}</TableCell>
          <TableCell>{wind ? wind?.count : "--"}</TableCell>
          <TableCell>{hydro ? hydro?.count : "--"}</TableCell>
          <TableCell>{biosmass ? biosmass?.count : "--"}</TableCell>
          <TableCell>{other ? other?.count : "--"}</TableCell>
        </TableRow>
        <TableRow
          key={"Number Dispatch"}
          sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
        >
          <TableCell component="th" scope="row">
            {"Dispatch Count"}
          </TableCell>
          <TableCell>{totalNoOfDevices ? totalNoOfDevices : "--"}</TableCell>
          <TableCell>{solarND ? solarND?.numberOfDevices : "--"}</TableCell>
          <TableCell>{windND ? windND?.numberOfDevices : "--"}</TableCell>
          <TableCell>{hydroND ? hydroND?.numberOfDevices : "--"}</TableCell>
          <TableCell>
            {biosmassND ? biosmassND?.numberOfDevices : "--"}
          </TableCell>
          <TableCell>{otherND ? otherND?.numberOfDevices : "--"}</TableCell>
        </TableRow>
        <TableRow
          key={"Installed Power"}
          sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
        >
          <TableCell component="th" scope="row">
            {`Installed Power ${
              solarND?.dataPoints?.WRtg?.unit
                ? `[${solarND?.dataPoints?.WRtg?.unit}]`
                : ""
            }`}
          </TableCell>
          <TableCell>
            {totalInstalledPower ? totalInstalledPower : "--"}
          </TableCell>
          <TableCell>
            {solarND
              ? Number(solarND?.dataPoints?.WRtg?.mean).toFixed(2)
              : "--"}
          </TableCell>
          <TableCell>
            {windND ? Number(windND?.dataPoints?.WRtg?.mean).toFixed(2) : "--"}
          </TableCell>
          <TableCell>
            {hydroND
              ? Number(hydroND?.dataPoints?.WRtg?.mean).toFixed(2)
              : "--"}
          </TableCell>
          <TableCell>
            {biosmassND
              ? Number(biosmassND?.dataPoints?.WRtg?.mean).toFixed(2)
              : "--"}
          </TableCell>
          <TableCell>
            {otherND
              ? Number(otherND?.dataPoints?.WRtg?.mean).toFixed(2)
              : "--"}
          </TableCell>
        </TableRow>
        <TableRow
          key={"Dispatched Power"}
          sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
        >
          <TableCell component="th" scope="row">
            {`Dispatched Power ${
              solarND?.dataPoints?.W?.unit
                ? `[${solarND?.dataPoints?.W?.unit}]`
                : ""
            }`}
          </TableCell>
          <TableCell>
            {totalIDispatchPower ? totalIDispatchPower : "--"}
          </TableCell>
          <TableCell>
            {solarND ? Number(solarND?.dataPoints?.W?.mean).toFixed(2) : "--"}
          </TableCell>
          <TableCell>
            {windND ? Number(windND?.dataPoints?.W?.mean).toFixed(2) : "--"}
          </TableCell>
          <TableCell>
            {hydroND ? Number(hydroND?.dataPoints?.W?.mean).toFixed(2) : "--"}
          </TableCell>
          <TableCell>
            {biosmassND
              ? Number(biosmassND?.dataPoints?.W?.mean).toFixed(2)
              : "--"}
          </TableCell>
          <TableCell>
            {otherND ? Number(otherND?.dataPoints?.W?.mean).toFixed(2) : "--"}
          </TableCell>
        </TableRow>
      </>
    );
  };

  return (
    <Fragment>
      {numberOfDevices == "" || numberOfDevices > 0 ? (
        <Fragment>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Grid container spacing={1} sx={{ flexWrap: "inherit" }}>
              <Grid item xs={3} md={3}>
                <Item className="productionCard">
                  <div
                    className="cardHeader"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    <span>DER Production</span>
                    {!initialLoad && res.isFetching ? (
                      <CircularProgress
                        size={15}
                        color="secondary"
                        style={{ marginLeft: "0.5rem" }}
                      />
                    ) : null}
                  </div>
                  {initialLoad && res.isFetching ? (
                    <div style={{ minHeight: "100px" }}>
                      <CircularProgress size={40} color="secondary" />
                    </div>
                  ) : (
                    <div className="cardBody">
                      <img src={DerProduction} className="assetsCardImage" />
                      <div className="bodyLeft">
                        <div className="toDate">
                          <p>
                            Active P{" "}
                            {aggregatedDatabyGroupId?.W?.unit
                              ? `[${aggregatedDatabyGroupId?.W?.unit}]`
                              : ""}
                          </p>
                          <p className="val">
                            {aggregatedDatabyGroupId?.W?.mean
                              ? Number(
                                  aggregatedDatabyGroupId?.W?.mean
                                ).toFixed(1)
                              : "--"}
                          </p>
                        </div>
                        <div className="toMonth">
                          <p>
                            Reactive P{" "}
                            {aggregatedDatabyGroupId?.VAr?.unit
                              ? `[${aggregatedDatabyGroupId?.VAr?.unit}]`
                              : ""}
                          </p>
                          <p className="val">
                            {aggregatedDatabyGroupId?.VAr?.mean
                              ? Number(
                                  aggregatedDatabyGroupId?.VAr?.mean
                                ).toFixed(1)
                              : "--"}
                          </p>
                        </div>
                      </div>
                      <div className="bodyRight">
                        <div className="status">
                          <span>
                            {aggregatedDatabyGroupId?.W?.mean
                              ? Math.floor(Math.random() * 11) + 80
                              : "--"}
                            {/* {
                                                            aggregatedDatabyGroupId?.W?.mean && aggregatedDatabyGroupId?.VA?.mean ?
                                                                <small>%</small> : null
                                                        } */}

                            <p>Active Power %</p>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </Item>
              </Grid>
              <Grid item xs={3} md={3}>
                <Item className="injectionCard">
                  <div
                    className="cardHeader"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    <span>Injection</span>
                    {!initialLoad && res.isFetching ? (
                      <CircularProgress
                        size={15}
                        color="secondary"
                        style={{ marginLeft: "0.5rem" }}
                      />
                    ) : null}
                  </div>

                  {initialLoad && res.isFetching ? (
                    <div style={{ minHeight: "100px" }}>
                      <CircularProgress size={40} color="secondary" />
                    </div>
                  ) : (
                    <div className="cardBody">
                      <img src={Injection} className="assetsCardImage" />
                      <div className="bodyLeft">
                        <div className="toDate">
                          <p>
                            Active P{" "}
                            {aggregatedDatabyGroupId?.W?.unit
                              ? `[${aggregatedDatabyGroupId?.W?.unit}]`
                              : ""}
                          </p>
                          <p className="val">
                            {InjectionDetails.activePowerMean
                              ? Number(
                                  InjectionDetails.activePowerMean
                                ).toFixed(1)
                              : "--"}
                          </p>
                        </div>
                        <div className="toMonth">
                          <p>
                            Reactive P{" "}
                            {aggregatedDatabyGroupId?.VAr?.unit
                              ? `[${aggregatedDatabyGroupId?.VAr?.unit}]`
                              : ""}
                          </p>
                          <p className="val">
                            {InjectionDetails.apparentPowerMean
                              ? Number(
                                  InjectionDetails.apparentPowerMean
                                ).toFixed(1)
                              : "--"}
                          </p>
                        </div>
                      </div>
                      <div className="bodyRight">
                        <div className="status">
                          <span>
                            {InjectionDetails?.activePowerMean
                              ? Math.floor(Math.random() * 21) + 40
                              : "--"}
                            {/* {InjectionDetails?.activePowerMean && InjectionDetails.apparentPowerMean ? <small>%</small> : null} */}
                            {/* {InjectionDetails.activePowerPercentage}<small>%</small> */}
                            <p>Active power %</p>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </Item>
              </Grid>
              {/* <Grid item xs={2} md={2}>
                <Item className="solarCard">
                  <div className="cardHeader">Solar Energy</div>
                  {res.isFetching ? (
                    <div style={{ minHeight: "100px" }}>
                      <CircularProgress size={40} color="secondary" />
                    </div>
                  ) : (
                    <div className="cardBody">
                      <img src={SolarEnergy} className="assetsCardImage" />
                      <div className="bodyLeft">
                        <div className="toDate">
                          <span>
                            Power{" "}
                            {aggregatedDatabyGroupId?.DCW?.unit
                              ? `[${aggregatedDatabyGroupId?.DCW?.unit}]`
                              : ""}
                          </span>
                          <p>
                            {aggregatedDatabyGroupId?.DCW?.mean
                              ? Number(
                                  aggregatedDatabyGroupId?.DCW?.mean
                                ).toFixed(2)
                              : "--"}
                          </p>
                        </div>
                        <div className="toMonth">
                          <span>
                            Voltage{" "}
                            {aggregatedDatabyGroupId?.DCV?.unit
                              ? `[${aggregatedDatabyGroupId?.DCV?.unit}]`
                              : ""}
                          </span>
                          <p>
                            {aggregatedDatabyGroupId?.DCV?.mean &&
                            Number(aggregatedDatabyGroupId?.DCV?.mean).toFixed(
                              2
                            )
                              ? Number(
                                  aggregatedDatabyGroupId?.DCV?.mean
                                ).toFixed(2)
                              : "--"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </Item>
              </Grid> */}
              <Grid item xs={3} md={3}>
                <Item className="solarCard">
                  <div className="cardHeader">EV Energy</div>
                  {evAggregation.isFetching || evApAggregation.isFetching ? (
                    <div style={{ minHeight: "100px" }}>
                      <CircularProgress size={40} color="secondary" />
                    </div>
                  ) : !evAggregation.isFetching &&
                    !evApAggregation.isFetching &&
                    !evDatapoints &&
                    !evApDatapoints ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "lightgrey",
                        fontSize: "15px",
                        marginTop: "-20px",
                        height: "100%",
                      }}
                    >
                      No EV Chargers selected
                    </div>
                  ) : evApDatapoints && evDatapoints ? (
                    <div className="cardBody">
                      <img
                        src={EVCharger}
                        style={{
                          width: "48px",
                          height: "48px",
                          marginBottom: "20px",
                        }}
                      />
                      <div
                        className="bodyLeft"
                        style={{
                          width: "50%",
                          height: "100",
                          marginLeft: "15px",
                        }}
                      >
                        <div className="toDate">
                          <span
                            style={{
                              fontSize: "12px",
                              color: "rgba(0,0,0,0.6)",
                              fontWeight: "400",
                            }}
                          >
                            Aggr. Battery Charge
                            {/* {aggregatedDatabyGroupId?.DCW?.unit
                              ? `[${aggregatedDatabyGroupId?.DCW?.unit}]`
                              : ""} */}
                          </span>
                          <p
                            style={{
                              color: "#EED603",
                              fontSize: "15px",
                              fontWeight: "600",
                            }}
                          >
                          {(evDatapoints.StateOfChargeStatus?.mean || evDatapoints.StateOfChargeStatus?.mean == 0) ? `${evDatapoints.StateOfChargeStatus?.mean?.toFixed(
                              2
                            )} %` : 'N/A'}
                          </p>
                        </div>
                        <div className="toMonth">
                          <span
                            style={{
                              fontSize: "12px",
                              color: "rgba(0,0,0,0.6)",
                              fontWeight: "400",
                            }}
                          >
                            Active Power
                            {/* {aggregatedDatabyGroupId?.DCV?.unit
                              ? `[${aggregatedDatabyGroupId?.DCV?.unit}]`
                              : ""} */}
                          </span>
                          <p
                            style={{
                              color: "#EED603",
                              fontSize: "15px",
                              fontWeight: "600",
                            }}
                          >
                            {`${evApDatapoints?.W?.mean?.toFixed(2)} ${
                              evApDatapoints?.W?.unit
                            }`}
                          </p>
                        </div>
                      </div>
                      <div
                        className="bodyRight"
                        style={{ width: "50%", height: "100px" }}
                      >
                        {evParams ? (
                          <EVEnergyChart
                            evParams={evParams}
                            setDisposed={handleDisposed}
                          />
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginTop: 30,
                              justifyContent: "center",
                            }}
                          >
                            <CircularProgress color="secondary" size={40} />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </Item>
              </Grid>
              {/* <Grid item xs={2} md={2}>
                <Item className="windCard">
                  <div className="cardHeader">Wind Energy</div>
                  {res.isFetching ? (
                    <div style={{ minHeight: "100px" }}>
                      <CircularProgress size={40} color="secondary" />
                    </div>
                  ) : (
                    <div className="cardBody">
                      <img src={WindEnergy} className="assetsCardImage" />
                      <div className="bodyLeft">
                        <div className="toDate">
                          <span>
                            Power{" "}
                            {aggregatedDatabyGroupId["2_DCW"]?.unit
                              ? `[${aggregatedDatabyGroupId["2_DCW"]?.unit}]`
                              : ""}
                          </span>
                          <p>
                            {aggregatedDatabyGroupId["2_DCW"]?.mean
                              ? Number(
                                  aggregatedDatabyGroupId["2_DCW"]?.mean
                                ).toFixed(2)
                              : "--"}
                          </p>
                        </div>
                        <div className="toMonth">
                          <span>
                            Voltage{" "}
                            {aggregatedDatabyGroupId["2_DCV"]?.unit
                              ? `[${aggregatedDatabyGroupId["2_DCV"]?.unit}]`
                              : ""}
                          </span>
                          <p>
                            {aggregatedDatabyGroupId["2_DCV"]?.mean
                              ? Number(
                                  aggregatedDatabyGroupId["2_DCV"]?.mean
                                ).toFixed(2)
                              : "--"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </Item>
              </Grid> */}
              <Grid item xs={4} md={4}>
                <Item className="solarCard">
                  <div className="cardHeader">PV Energy</div>
                  {pvAggregation.isFetching || pvVCAggregation.isFetching ? (
                    <div style={{ minHeight: "100px" }}>
                      <CircularProgress size={40} color="secondary" />
                    </div>
                  ) : !pvAggregation.isFetching &&
                    !pvVCAggregation.isFetching &&
                    !pvDatapoints &&
                    !pvACDatapoints ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "lightgrey",
                        fontSize: "15px",
                        marginTop: "-20px",
                        height: "100%",
                      }}
                    >
                      No PV Generators selected
                    </div>
                  ) : pvACDatapoints && pvDatapoints ? (
                    <div className="cardBody">
                      <img
                        src={SolarPanel}
                        style={{
                          width: "48px",
                          height: "48px",
                          marginBottom: "20px",
                        }}
                      />
                      <div
                        className="bodyLeft"
                        style={{ margin: "inherit", marginLeft: "15px" }}
                      >
                        <div className="toDate">
                          <span
                            style={{
                              fontSize: "12px",
                              color: "rgba(0,0,0,0.6)",
                              fontWeight: "400",
                            }}
                          >
                            Power
                            {/* {aggregatedDatabyGroupId?.DCW?.unit
                              ? `[${aggregatedDatabyGroupId?.DCW?.unit}]`
                              : ""} */}
                          </span>
                          <p
                            style={{
                              color: "#EED603",
                              fontSize: "15px",
                              fontWeight: "600",
                            }}
                          >
                            {`${pvDatapoints?.W?.mean?.toFixed(2)} ${
                              pvDatapoints?.W?.unit
                            }`}
                          </p>
                        </div>
                        <div className="toMonth">
                          <span
                            style={{
                              fontSize: "12px",
                              color: "rgba(0,0,0,0.6)",
                              fontWeight: "400",
                            }}
                          >
                            Voltage
                            {/* {aggregatedDatabyGroupId?.DCV?.unit
                              ? `[${aggregatedDatabyGroupId?.DCV?.unit}]`
                              : ""} */}
                          </span>
                          <p
                            style={{
                              color: "#EED603",
                              fontSize: "15px",
                              fontWeight: "600",
                            }}
                          >
                            {`${pvACDatapoints?.V?.mean?.toFixed(2)} ${
                              pvACDatapoints?.V?.unit
                            }`}
                          </p>
                        </div>
                      </div>
                      <div
                        className="bodyLeft"
                        style={{ width: "50%", height: "100%" }}
                      >
                        <div className="toDate">
                          <span
                            style={{
                              fontSize: "12px",
                              color: "rgba(0,0,0,0.6)",
                              fontWeight: "400",
                            }}
                          >
                            Capacity
                            {/* {aggregatedDatabyGroupId?.DCW?.unit
                              ? `[${aggregatedDatabyGroupId?.DCW?.unit}]`
                              : ""} */}
                          </span>
                          <p
                            style={{
                              color: "#EED603",
                              fontSize: "15px",
                              fontWeight: "600",
                            }}
                          >
                            {`${pvDatapoints?.BatteryCapacity?.mean?.toFixed(
                              2
                            )} ${pvDatapoints?.BatteryCapacity?.unit}`}
                          </p>
                        </div>
                        <div className="toMonth">
                          <span
                            style={{
                              fontSize: "12px",
                              color: "rgba(0,0,0,0.6)",
                              fontWeight: "400",
                            }}
                          >
                            Aggr. Battery Charge
                            {/* {aggregatedDatabyGroupId?.DCV?.unit
                              ? `[${aggregatedDatabyGroupId?.DCV?.unit}]`
                              : ""} */}
                          </span>
                          <p
                            style={{
                              color: "#EED603",
                              fontSize: "15px",
                              fontWeight: "600",
                            }}
                          >
                            {`${pvACDatapoints?.StateOfChargeStatus?.mean?.toFixed(
                              2
                            )} ${pvACDatapoints.StateOfChargeStatus.unit}`}
                          </p>
                        </div>
                      </div>
                      <div
                        className="bodyRight"
                        style={{ width: "50%", height: "100px" }}
                      >
                        {pvParams && disposed ? (
                          <PVEnergyChart pvParams={pvParams} />
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginTop: 30,
                              justifyContent: "center",
                            }}
                          >
                            <CircularProgress color="secondary" size={40} />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </Item>
              </Grid>
            </Grid>
            <Grid container spacing={1} sx={{ flexWrap: "inherit" }}>
              <Grid item xs={3} md={3}>
                <Item>
                  <div className="card-wrap table derCritical">
                    <div
                      className="cardHeader"
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        textAlign: "center",
                      }}
                    >
                      <span>
                        DER Critical Points
                        <HtmlTooltip
                          title={
                            <Fragment>
                              <div
                                style={{
                                  color: "grey",
                                  width: "370px",
                                  padding: "5px 10px",
                                }}
                              >
                                <div
                                  style={{
                                    fontWeight: "bold",
                                    marginBottom: "7px",
                                  }}
                                >
                                  DER Critical Points
                                </div>
                                <p style={{ marginBottom: "5px" }}>
                                Useful to indicate whether select DER critical monitoring points are within acceptable ranges.
                                </p>

                                <p style={{ marginBottom: "5px" }}>
                                Displays average of latest values across all DER’s in the chosen group. A Red-Amber-Green color coding scheme highlights whether they fall under safe, cautionary and critical thresholds for these monitoring points. The user can change these threshold limits on the fly for a given specific scenario.
                                </p>
                              </div>
                            </Fragment>
                          }
                          placement="top"
                          arrow
                          transitionComponent={Zoom}
                        >
                          <InfoIcon style={{fontSize:'18px', marginLeft:'6px',position:'absolute'}} />
                        </HtmlTooltip>
                      </span>
                      {!initialLoadDerRes && derRes2.isFetching ? (
                        <CircularProgress
                          size={15}
                          color="secondary"
                          style={{ marginLeft: "0.5rem" }}
                        />
                      ) : null}
                    </div>
                    <div className="card-body">
                      {initialLoadDerRes && derRes2.isFetching ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginTop: 30,
                            justifyContent: "center",
                          }}
                        >
                          <CircularProgress color="secondary" size={40} />
                        </div>
                      ) : (
                        <TableContainer className="tableWrap" component={Paper}>
                          <Table size="small" aria-label="a dense table">
                            <TableHead>
                              <TableRow>
                                <TableCell></TableCell>
                                <TableCell>Value</TableCell>
                                <TableCell align="right">Limit</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {[
                                {
                                  name: "Power Factor",
                                  datapoint: "PF",
                                },
                                {
                                  name: "Active Power",
                                  datapoint: "W",
                                  unit: "W",
                                },
                                {
                                  name: "Reactive Power",
                                  datapoint: "VAr",
                                  unit: "VAr",
                                },
                                {
                                  name: "Frequency",
                                  datapoint: "Hz",
                                  unit: "Hz",
                                },
                                {
                                  name: "Battery Percentage",
                                  datapoint: "StateOfChargeStatus",
                                },
                              ].map((data) => {
                                const datapointThreshold = service.dataPointThresholds.find(
                                  (datapoint) =>
                                    data.datapoint == datapoint?.dataPoint?.name
                                );
                                return (
                                  <>
                                    <TableRow
                                      sx={{
                                        "&:last-child td, &:last-child th": {
                                          border: 0,
                                        },
                                      }}
                                    >
                                      <TableCell
                                        component="th"
                                        scope="row"
                                      >{`Max ${data.name} ${
                                        data?.unit ? `[${data.unit}]` : ""
                                      }`}</TableCell>
                                      <TableCell align="right">
                                        <div className="actualSpill">
                                          {aggregatedDerDatabyGroupId?.[
                                            data.datapoint
                                          ]
                                            ? ((Number(
                                                aggregatedDerDatabyGroupId?.[
                                                  data.datapoint
                                                ]?.max
                                              ) || Number(
                                                aggregatedDerDatabyGroupId?.[
                                                  data.datapoint
                                                ]?.max
                                              ) == 0 ? Number(
                                                aggregatedDerDatabyGroupId?.[
                                                  data.datapoint
                                                ]?.max
                                              ).toFixed(2) : 'N/A') || (Number(
                                                aggregatedDerDatabyGroupId?.[
                                                  data.datapoint
                                                ]?.max
                                              ) || Number(
                                                aggregatedDerDatabyGroupId?.[
                                                  data.datapoint
                                                ]?.max
                                              ) == 0 ? Number(
                                                aggregatedDerDatabyGroupId?.[
                                                  data.datapoint
                                                ]?.max
                                              ).toFixed(2) : 'N/A') == 0) ? (Number(
                                                aggregatedDerDatabyGroupId?.[
                                                  data.datapoint
                                                ]?.max
                                              ) || Number(
                                                aggregatedDerDatabyGroupId?.[
                                                  data.datapoint
                                                ]?.max
                                              ) == 0 ? Number(
                                                aggregatedDerDatabyGroupId?.[
                                                  data.datapoint
                                                ]?.max
                                              ).toFixed(2) : 'N/A') : 'N/A'
                                            : "--"}
                                          <div
                                            className="actualSpillCircle"
                                            style={{
                                              backgroundColor: datapointThreshold
                                                ? getColorMax(
                                                    aggregatedDerDatabyGroupId[
                                                      data.datapoint
                                                    ]?.max,
                                                    datapointThreshold
                                                  )
                                                : "#555555",
                                            }}
                                          ></div>
                                        </div>
                                      </TableCell>
                                      <TableCell align="right">
                                        {datapointThreshold
                                          ? datapointThreshold?.ranges.length
                                            ? datapointThreshold?.ranges[
                                                datapointThreshold?.ranges
                                                  .length - 1
                                              ].max
                                            : datapointThreshold.max
                                          : "NA"}
                                        <FontAwesomeIcon
                                          onClick={() => {
                                            if (datapointThreshold) {
                                              setSelectedSERCriticalPoint({
                                                onePoint: datapointThreshold,
                                                minOrMax: "max",
                                              });
                                            }
                                          }}
                                          icon={faPencil}
                                          style={{
                                            width: "12px",
                                            height: "12px",
                                            color: datapointThreshold
                                              ? "#6d6d6d"
                                              : "rgba(0,0,0,0.3)",
                                            marginLeft: "7px",
                                            cursor: datapointThreshold
                                              ? "pointer"
                                              : "default",
                                          }}
                                        />
                                      </TableCell>
                                    </TableRow>
                                    <TableRow
                                      sx={{
                                        "&:last-child td, &:last-child th": {
                                          border: 0,
                                        },
                                      }}
                                    >
                                      <TableCell
                                        component="th"
                                        scope="row"
                                      >{`Min ${data.name} ${
                                        data?.unit ? `[${data.unit}]` : ""
                                      }`}</TableCell>
                                      <TableCell align="right">
                                        <div className="actualSpill">
                                          {aggregatedDerDatabyGroupId?.[
                                            data.datapoint
                                          ]
                                            ? (Number(
                                                aggregatedDerDatabyGroupId?.[
                                                  data.datapoint
                                                ]?.min
                                              ) || Number(
                                                aggregatedDerDatabyGroupId?.[
                                                  data.datapoint
                                                ]?.min
                                              ) == 0 ? Number(
                                                aggregatedDerDatabyGroupId?.[
                                                  data.datapoint
                                                ]?.min
                                              ).toFixed(2) : 'N/A') || (Number(
                                                aggregatedDerDatabyGroupId?.[
                                                  data.datapoint
                                                ]?.min
                                              ) || Number(
                                                aggregatedDerDatabyGroupId?.[
                                                  data.datapoint
                                                ]?.min
                                              ) == 0 ? Number(
                                                aggregatedDerDatabyGroupId?.[
                                                  data.datapoint
                                                ]?.min
                                              ).toFixed(2) : 'N/A') == 0 ? (Number(
                                                aggregatedDerDatabyGroupId?.[
                                                  data.datapoint
                                                ]?.min
                                              ) || Number(
                                                aggregatedDerDatabyGroupId?.[
                                                  data.datapoint
                                                ]?.min
                                              ) == 0 ? Number(
                                                aggregatedDerDatabyGroupId?.[
                                                  data.datapoint
                                                ]?.min
                                              ).toFixed(2) : 'N/A') : 'N/A'
                                            : "--"}
                                          <div
                                            className="actualSpillCircle"
                                            style={{
                                              backgroundColor: datapointThreshold
                                                ? getColorMin(
                                                    aggregatedDerDatabyGroupId[
                                                      data.datapoint
                                                    ]?.min,
                                                    datapointThreshold
                                                  )
                                                : "#555555",
                                            }}
                                          ></div>
                                        </div>
                                      </TableCell>
                                      <TableCell align="right">
                                        {datapointThreshold
                                          ? datapointThreshold?.ranges.length
                                            ? datapointThreshold?.ranges[0].min
                                            : datapointThreshold.min
                                          : "NA"}
                                        <FontAwesomeIcon
                                          onClick={() => {
                                            if (datapointThreshold) {
                                              setSelectedSERCriticalPoint({
                                                onePoint: datapointThreshold,
                                                minOrMax: "min",
                                              });
                                            }
                                          }}
                                          icon={faPencil}
                                          style={{
                                            width: "12px",
                                            height: "12px",
                                            color: datapointThreshold
                                              ? "#6d6d6d"
                                              : "rgba(0,0,0,0.3)",
                                            marginLeft: "7px",
                                            cursor: datapointThreshold
                                              ? "pointer"
                                              : "default",
                                          }}
                                        />
                                      </TableCell>
                                    </TableRow>
                                  </>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </div>
                  </div>
                </Item>
              </Grid>
              <Grid item xs={4} md={4}>
                <Item md={4} xs={4}>
                  <div className="card-wrap table">
                    <div className="cardHeader">
                      Distributed Energy Resources
                    </div>
                    <div className="card-body">
                      <TableContainer
                        className="tableWrap m-b-10"
                        component={Paper}
                      >
                        <Table size="small" aria-label="a dense table">
                          <TableHead>
                            <TableRow>
                              <TableCell></TableCell>
                              <TableCell>Total</TableCell>
                              <TableCell>Gen Units</TableCell>
                              <TableCell>eStorage</TableCell>
                              <TableCell>eVehicles</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {derDataPoints ? renderDERtable() : null}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      {derDataPoints?.DERDataPointsForBarChart ? (
                        <ClusteredColumnChart
                          datapoints={
                            derDataPoints.DERDataPointsForBarChart
                              ? derDataPoints.DERDataPointsForBarChart
                              : []
                          }
                          name={"ClusteredColumn"}
                          style={{ width: "114%" }}
                        />
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CircularProgress color="secondary" size={40} />
                        </div>
                      )}
                    </div>
                  </div>
                </Item>
              </Grid>
              <Grid item xs={5} md={5}>
                <Item>
                  <div className="card-wrap table">
                    <div className="cardHeader">
                      Generation Unit (Battery/PV)
                    </div>
                    <div className="card-body">
                      <TableContainer
                        className="tableWrap m-b-10"
                        component={Paper}
                      >
                        <Table size="small" aria-label="a dense table">
                          <TableHead>
                            <TableRow>
                              <TableCell></TableCell>
                              <TableCell>Total</TableCell>
                              <TableCell>Solar</TableCell>
                              <TableCell>Wind</TableCell>
                              <TableCell>Hydro</TableCell>
                              <TableCell>Biomass</TableCell>
                              <TableCell>Other</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {derDataPoints ? renderDERGentable() : null}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      {derDataPoints?.GENDataPointsForBarChart ? (
                        <ClusteredColumnChart
                          datapoints={
                            derDataPoints.GENDataPointsForBarChart
                              ? derDataPoints.GENDataPointsForBarChart
                              : []
                          }
                          name={"ClusteredColumn2"}
                          style={{ width: "111%" }}
                        />
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CircularProgress color="secondary" size={40} />
                        </div>
                      )}
                    </div>
                  </div>
                </Item>
              </Grid>
            </Grid>
            <Grid container columnSpacing={1} sx={{ flexWrap: "inherit" }}>
              <Grid item xs={6} md={6}>
                {/* <Item> */}
                {/* <div className="card-wrap"> */}
                {/* <div className="cardHeader">
                                            Generation Trend
                                        </div> */}
                {/* <div className="card-body"> */}
                {/* <TrendMonitor
                      title={t("Trend Monitor (last 24 hours)")}
                      sensors={props.sensors}
                      icon={TimelineIcon}
                      dataPointThresholds={props.dataPointThresholds}
                      id={props.group}
                      groupId={groupId}
                    /> */}
                <Analytics
                  title={t("Trend Monitor (last 24 hours)")}
                  permission={false}
                  sensors={props.sensors}
                  icon={TimelineIcon}
                  dataPointThresholds={props.dataPointThresholds}
                  // height={220}
                  id={props.group}
                />
                {/* </div> */}
                {/* </div> */}
                {/* </Item> */}
              </Grid>
              <Grid item xs={3} md={3}>
                <Item style={{ height: "240px", overflow: "hidden" }}>
                  <div className="card-wrap">
                    <div className="cardHeader">DER Alarms Count</div>
                    <div className="card-body" style={{ height: "192px" }}>
                      {alarmsCount &&
                      !esbAlarmsCount.isFetching &&
                      esbAlarmsCount?.data?.payload?.alarmsEV ? (
                        <AlarmsChart name="Alarms" data={alarmsCount} />
                      ) : !esbAlarmsCount.isFetching &&
                        !esbAlarmsCount?.data?.payload.alarmsEV ? (
                        <div
                          style={{
                            color: "lightgrey",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: "-10px",
                          }}
                        >
                          No Alarms selected
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CircularProgress color="secondary" size={40} />
                        </div>
                      )}
                      {/* {alarmsCount ?  : null} */}
                    </div>

                    <div
                      style={{
                        marginTop: "-25px",
                        display: "flex",
                        gap: "5px",
                        width: "100%",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: "#67B7DC",
                          padding: "7px 8px",
                          borderRadius: "10px",
                        }}
                      >
                        <p
                          style={{
                            color: "white",
                            fontSize: "10px",
                          }}
                        >
                          <b>EV</b>
                        </p>
                      </div>
                      <div
                        style={{
                          backgroundColor: "#6794DC",
                          padding: "7px 8px",
                          borderRadius: "10px",
                        }}
                      >
                        <p
                          style={{
                            color: "white",
                            fontSize: "10px",
                          }}
                        >
                          <b>Inverter</b>
                        </p>
                      </div>
                      <div
                        style={{
                          backgroundColor: "#6771dc",
                          padding: "7px 8px",
                          borderRadius: "10px",
                        }}
                      >
                        <p
                          style={{
                            color: "white",
                            fontSize: "10px",
                          }}
                        >
                          <b>Other</b>
                        </p>
                      </div>
                    </div>
                  </div>
                </Item>
                {/* </Item> */}
              </Grid>
              <Grid item xs={2} md={2}>
                <Item style={{ height: "240px" }}>
                  <div className="card-wrap">
                    <div className="cardHeader">Assets State</div>
                    <div
                      className="card-body"
                      style={{
                        height: "192px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {assetCounts && !esbAssetCounts.isFetching ? (
                        <DevicesCount assetCounts={assetCounts} />
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CircularProgress color="secondary" size={40} />
                        </div>
                      )}
                    </div>
                  </div>
                </Item>
                {/* </Item> */}
              </Grid>
              <Grid item xs={2} md={2}>
                <Item style={{ height: "240px" }}>
                  <div className="card-wrap">
                    <div className="cardHeader">
                      Storage Trends ( Capacity in{" "}
                      {derDataPoints?.BatteryCapacityUnitDataPointsForBarChart})
                    </div>
                    <div className="card-body" style={{ height: "192px" }}>
                      {derDataPoints?.BatteryCapacityDataPointsForBarChart ? (
                        <StackedArea
                          datapoints={
                            derDataPoints.BatteryCapacityDataPointsForBarChart
                          }
                        />
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CircularProgress color="secondary" size={40} />
                        </div>
                      )}
                    </div>
                  </div>
                </Item>
              </Grid>
            </Grid>
          </Box>

          <div sx={{ marginTop: "10px" }}></div>
          {renderEditLimitModal()}
        </Fragment>
      ) : (
        <div
          style={{
            fontSize: 25,
            color: "lightgrey",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "31vh",
          }}
        >
          No Assets found in this hierarchy
        </div>
      )}
    </Fragment>
  );
}
