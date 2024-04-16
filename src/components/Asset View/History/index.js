import React, { useEffect, useState, Fragment } from "react";
import Card from "@mui/material/Card";
import Table from "components/Table/newTable";
import Loader from "components/Progress";
import HistoryIcon from "@mui/icons-material/History";
import { useGetReadingsQuery } from "services/monitoring";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { useSnackbar } from "notistack";
import TextField from "@mui/material/TextField";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import { getMonitoringValues } from "Utilities/Monitoring Widgets";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { CSVLink, CSVDownload } from "react-csv";
import DownloadIcon from "@mui/icons-material/Download";
import Button from "@mui/material/Button";
import { CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";

export default function History(props) {
  let token = window.localStorage.getItem("token");
  const device = useSelector((state) => state.asset.device);
  const metaDataValue = useSelector((state) => state.metaData);
  const service = metaDataValue.services.find((s) => s.id == props.service);
  const asset = device.platformDeviceType && service.assetMapping.length ? service.assetMapping.find(a=>a.assetType._id == device.platformDeviceType) : null;
  const sensors = device.esbMetaData && device.esbMetaData.datapoints && device.esbMetaData.datapoints.length ? props.sensors.filter(s=>device.esbMetaData.datapoints.includes(s.name)) : (asset && asset.sensors) ? (asset.sensors) : (props.sensors);
  const { enqueueSnackbar } = useSnackbar();
  const [value, setValue] = React.useState(new Date());
  const [rows, setRowState] = useState([]);
  const [columns, setColumns] = useState(generateColumns());
  const [totalPages, setTotalPages] = useState();
  const [totalDocuments, setTotalDocuments] = useState(null);
  const [dateTo, setDateTo] = React.useState(new Date());
  const [dateFrom, setDateFrom] = React.useState(new Date());
  const [pageSize, setPageSize] = React.useState(1);
  const [limit, setLimit] = React.useState("&limit=1");
  const [page, setPage] = React.useState(1);
  const [csvData, setCsvData] = React.useState([]);
  const [exportParams, setExportParams] = React.useState({});
  const [exportCsv, setExportCsv] = React.useState(null);
  const [disabled, setDisabled] = React.useState(chkError());
  const [datapointName, setDatapointName] = React.useState(
    sensors.map((elm) => elm.name)
  );

  const [loader,setLoader]=React.useState(tru)

  const handleStart = (newValue) => {
    if (Object.prototype.toString.call(newValue) === "[object Date]") {
      if (!isNaN(newValue)) {
        setPage(1);
        setDateFrom(new Date(newValue).toISOString());
      }
    }
    setDisabled(chkError(new Date(newValue).toISOString(), ""));
  };

  const handleEnd = (newValue) => {
    if (Object.prototype.toString.call(newValue) === "[object Date]") {
      if (!isNaN(newValue)) {
        setPage(1);
        setDateTo(new Date(newValue).toISOString());
      }
    }
    setDisabled(chkError("", new Date(newValue).toISOString()));
  };

  function updateColumns(datapoint) {
    let newColumns = [...columns];
    datapoint.forEach((elm) => {
      if (columns.findIndex((e) => elm == e.id) == -1) {
        let sensor = sensors.find((k) => k.name == elm);
        newColumns.push({
          id: sensor.name,
          label: sensor.friendlyName,
          align: "center",
        });
      }
    });
    newColumns = newColumns.filter(
      (elm) => datapoint.findIndex((e) => e == elm.id) != -1
    );
    newColumns.push({ id: "date", label: "Date", align: "center" });
    newColumns.push({ id: "time", label: "Time", align: "center" });
    setColumns(newColumns);
  }

  function generateColumns() {
    let columns = [];
    sensors.forEach((elm) => {
      columns.push({
        id: elm.name,
        label: elm.friendlyName,
        align: "center",
      });
    });
    columns.push({ id: "date", label: "Date", align: "center" });
    columns.push({ id: "time", label: "Time", align: "center" });
    return columns;
  }

  const handleDatapoint = (event) => {
    const {
      target: { value },
    } = event;
    if (value.length > 0) {
      setPage(1);
      updateColumns(typeof value === "string" ? value.split(",") : value);
      setDatapointName(typeof value === "string" ? value.split(",") : value);
    } else {
      showSnackbar(
        "History",
        "Atleast one datapoint is required",
        "info",
        1000
      );
    }
  };

  const readings = useGetReadingsQuery({
    id: props.id,
    parameter: `?currentPage=${page}&pageSize=${pageSize}&dataPoints=${JSON.stringify(
      datapointName
    )}${
      limit == ""
        ? `&withTotalPages=true&dateTo=${dateTo}&dateFrom=${dateFrom}`
        : ""
    }`,
  });

  const allReadings = useGetReadingsQuery({
    id: props.id,
    parameter: `?currentPage=1&pageSize=${totalDocuments==0? 10:totalDocuments}&dataPoints=${JSON.stringify(
      datapointName
    )}${
      limit == ""
        ? `&withTotalPages=true&dateTo=${dateTo}&dateFrom=${dateFrom}`
        : ""
    }`,
  },{skip: readings.isFetching || totalDocuments==null })

  const csvReadings = useGetReadingsQuery(
    {
      id: props.id,
      parameter: `?currentPage=1&pageSize=${totalDocuments}&dataPoints=${JSON.stringify(datapointName)}${
        limit == ""
          ? `&withTotalPages=true&dateTo=${dateTo}&dateFrom=${dateFrom}`
          : ""
      }`,
    },
    { skip: !exportCsv }
  );

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  useEffect(() => {
    if (readings.isSuccess && readings.data.payload.data.length > 0) {
      if (pageSize == 1) {
        handleFirstLoad(readings.data.payload.data[0].time);
      } else {
        setTotalPages(readings.data.payload.totalPages);
        setTotalDocuments(readings.data.payload.totalDocuments);
      }
    } 
    if (readings.isError) {
      showSnackbar("History", readings.error.data?.message, "error", 1000);
    }
  }, [readings.isFetching]);

  useEffect(() => {
    if (allReadings.isSuccess && allReadings.data.payload.data.length > 0) {
      if (pageSize != 1) {
        let tempData = [];
        allReadings.data.payload.data.forEach((elm) => {
          let time = new Date(elm.time);
          let tempObj = {};
          let res;

          sensors.forEach((field) => {
            if (elm.reading.hasOwnProperty(field.name)) {
              res = getMonitoringValues(
                field.type,
                field.metaData,
                elm.reading[field.name].value,
                elm.reading[field.name].unit
              );
              tempObj[field.name] = res.value + " " + res.unit;
            }
          });
          tempObj.date = time.toLocaleDateString("en-GB");
          tempObj.time = time.toLocaleTimeString();
          tempData.push(tempObj);
        });
        setRowState(tempData);
        setLoader(false)
      } 
    } else if (allReadings.isSuccess) {
      setLoader(false)
      setRowState([]);
    }

  }, [allReadings.isFetching]);

  useEffect(() => {
    if (csvReadings.isSuccess && csvReadings.data.payload.data.length > 0) {
      let params = {
        dateFrom,
        dateTo,
        datapointName: JSON.stringify(datapointName),
      };
      setExportParams(params);
      let tempData = [];
      csvReadings.data.payload.data.forEach((elm) => {
        let time = new Date(elm.time);
        let tempObj = {};
        let res;

        sensors.forEach((field) => {
          if (elm.reading.hasOwnProperty(field.name)) {
            res = getMonitoringValues(
              field.type,
              field.metaData,
              elm.reading[field.name].value,
              elm.reading[field.name].unit
            );
            tempObj[field.friendlyName] = res.value + " " + res.unit;
          } else {
            tempObj[field.friendlyName] = "";
          }
        });
        tempObj.date = time.toLocaleDateString("en-GB");
        tempObj.time = time.toLocaleTimeString();
        tempData.push(tempObj);
      });
      let keys = columns.map((c) => c.label);
      tempData.forEach((t) => {
        Object.keys(t).forEach((t2) => {
          if (t2 != "date" && t2 != "time" && !keys.includes(t2)) {
            delete t[t2];
          }
        });
      });
      let tempCsvData = [];
      tempCsvData.push(Object.keys(tempData[0]));
      tempData.forEach((t1, i) => {
        tempCsvData[0].forEach((t2, j) => {
          if (!tempCsvData[i + 1]) {
            tempCsvData[i + 1] = [];
          }
          tempCsvData[i + 1].push(t1[t2]);
        });
      });
      tempCsvData.forEach((t) => {
        t.unshift(t[t.length - 1]);
        t.unshift(t[t.length - 2]);
        t.splice(t.length - 1, 1);
        t.splice(t.length - 1, 1);
      });
      setCsvData(tempCsvData);
      setTimeout(() => {
        if (exportCsv) {
          document.getElementById("export-csv").click();
          setTimeout(() => {
            setCsvData([]);
          }, 500);
        }
      }, 100);
      setExportCsv(false);
    }
    if (csvReadings.isError) {
      setExportCsv(false);
      showSnackbar(
        "History",
        csvReadings?.error?.data?.message || "Failed",
        "error",
        1000
      );
    }
  }, [csvReadings.isFetching]);

  const handleFirstLoad = (newValue) => {
    let day = new Date(newValue);
    let temp = new Date(day.setMinutes(0));
    temp = new Date(temp.setSeconds(0));
    temp = new Date(temp.setHours(0));
    let from = temp.toISOString();
    let to = new Date(temp.setDate(temp.getDate() + 1)).toISOString();
    setDateFrom(from);
    setDateTo(to);
    setPageSize(25);
    setLimit("");
    setValue(newValue);
  };

  function ifLoaded(state, component) {
    if (state) return <Loader top={"100px"} />;
    else return component();
  }

  function handlePageChange(page) {
    setPage(page);
  }

  function chkError(start, end) {
    var one_day = 1000 * 60 * 60 * 24;
    var startDate = new Date(start || dateFrom);
    var endDate = new Date(end || dateTo);
    var diff = Math.ceil((endDate.getTime() - startDate.getTime()) / one_day);
    if (diff > 30) {
      return true;
    } else {
      return false;
    }
  }

  const chkParamsDisable = () => {
    let params = {
      dateFrom,
      dateTo,
      datapointName: JSON.stringify(datapointName),
    };
    return JSON.stringify(params) == JSON.stringify(exportParams);
  };

  function history() {
    return (
      <Fragment>
        <Table
          columns={columns}
          rows={rows}
          page={page}
          totalPages={totalPages}
          totalDocuments={totalDocuments}
          handleChange={handlePageChange}
          height="calc(100vh - 440px)"
          pageSize={25}
        />
      </Fragment>
    );
  }

  return (
    <Fragment>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginBottom: "5px",
        }}
      >
        <div style={{ flex: 1 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            disabled={
              disabled ||
              readings.isFetching ||
              !rows.length ||
              chkParamsDisable()
            }
            onClick={() => {
              setExportCsv(true);
            }}
          >
            <div
              style={{
                width: "115px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "30px",
              }}
            >
              {exportCsv && !csvData.length ? (
                // <CircularProgress size={18} color="secondary" />
                <CircularProgress size={23} color="secondary" />
              ) : (
                "Export to CSV"
              )}
            </div>
          </Button>
          {csvData.length ? (
            <CSVLink
              id="export-csv"
              data={csvData}
              asyncOnClick={true}
              filename={`${props.device?.name}_History`}
            ></CSVLink>
          ) : null}
        </div>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            label="Start Time"
            value={dateFrom}
            onChange={handleStart}
            inputFormat="dd/MM/yyyy h:mm:ss aaa"
            use12Hours
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                style={{ maxWidth: "300px", margin: "5px" }}
              />
            )}
          />
        </LocalizationProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            label="End Time"
            value={dateTo}
            onChange={handleEnd}
            inputFormat="dd/MM/yyyy h:mm:ss aaa"
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                style={{ maxWidth: "300px", margin: "5px" }}
              />
            )}
          />
        </LocalizationProvider>
        <FormControl sx={{ m: 1, width: 300, margin: "5px" }}>
          <InputLabel id="demo-multiple-checkbox-label">Datapoints</InputLabel>
          <Select
            labelId="demo-multiple-checkbox-label"
            id="demo-multiple-checkbox"
            multiple
            value={datapointName}
            onChange={handleDatapoint}
            input={<OutlinedInput label="Datapoints" />}
            renderValue={(selected) => selected.join(", ")}
          >
            {sensors.map((elm) => (
              <MenuItem key={elm.name} value={elm.name}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <ListItemText primary={elm.friendlyName} />
                  {datapointName.indexOf(elm.name) > -1 ? (
                    <CheckCircleIcon
                      color="secondary"
                      style={{ height: "15px", width: "15px", margin: "10px" }}
                    />
                  ) : null}
                </div>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <Card style={{ minHeight: "300px", position: "relative" }}>
        <span
          style={{
            display: "flex",
            justifyContent: "space-between",
            margin: "10px",
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
            <b>History</b>
            <span style={{ marginLeft: "5px", fontSize: "12px" }}>
              (sorted by date time:descending)
            </span>
          </p>
          <HistoryIcon style={{ color: "#bfbec8" }} />
        </span>

        {ifLoaded( loader, history)}
      </Card>
    </Fragment>
  );
}
