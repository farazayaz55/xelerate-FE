import React, { useState, Fragment, useEffect } from "react";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";
import Loader from "components/Progress";
import Card from "@mui/material/Card";
import Table from "components/Table/newTable";
import Checkbox from "@mui/material/Checkbox";
import { CardContent } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import DeleteAlert from "components/Alerts/Delete";
import Button from "@mui/material/Button";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import Tooltip from "@mui/material/Tooltip";
import { CSVLink } from "react-csv";
import DownloadIcon from "@mui/icons-material/Download";
import {
  useBatchUpdateAlarmMutation,
  useGetAlarmsQuery,
} from "../../../services/alarms";
import hexRgb from "hex-rgb";
import { useGetDevicesQuery } from "services/devices";

export default function List({
  generateRows,
  allAlarms,
  csvData,
  loading,
  sensorIds,
  serviceId
}) {
  let keys = [
    { name: "createdAt", key: "createdAt" },
    {
      name: "updatedAt",
      key: "updatedAt",
    },
    {
      name: "deviceName",
      key: "deviceName",
    },
    {
      name: "count",
      key: "count",
    },
  ];
  let token = window.localStorage.getItem("token");
  const { enqueueSnackbar } = useSnackbar();
  const alarmsFilter = useSelector((state) => state.alarmsFilter);
  const metaDataValue = useSelector((state) => state.metaData);
  let permission = metaDataValue.apps.find((a) => a.name == "Alarms Management")?.tabs[0]?.permission;
  const [rgb, setRgb] = React.useState(
    hexRgb(metaDataValue.branding.secondaryColor)
  );
  const [columns, setColumns] = React.useState(generateColumns());
  const [sort, setSort] = useState({
    createdAt: 1,
    updatedAt: 1,
    deviceName: 1,
    service: 1,
    count: 1,
  });
  const [sortedFields, setSortedFields] = useState({ updatedAt: -1 });
  const [checked, setChecked] = useState([]);
  const [status, setStatus] = React.useState("");
  const [all, setAll] = React.useState(false);
  const [rows, setRows] = React.useState([]);
  const [totalDocumentRows,setTotalDocumentRows]=useState([])
  const [totalPages, setTotalPages] = React.useState(0);
  const [totalDocuments, setTotalDocuments] = React.useState(null);
  const [page, setPage] = React.useState(1);
  const [updateBatchAlarm, result] = useBatchUpdateAlarmMutation();
  const groupIds = []
  metaDataValue?.services.forEach(s=>{
    if(s.group?.id){
      groupIds.push(`${s.id}:${s.group?.id}`)
    }
  })
  const paginatedAlarms = 
  useGetAlarmsQuery({
    token: window.localStorage.getItem("token"),
    params: `?dashboard=true&${
      Object.keys(sortedFields).length
        ? `sort=${JSON.stringify(sortedFields)}&`
        : ``
    }${
      alarmsFilter.priority.length
        ? `priority=${JSON.stringify(alarmsFilter.priority)}&`
        : ""
    }${
      (alarmsFilter.solutions.length && alarmsFilter.solutions[0] != "All") || (serviceId)
        ? `serviceId=${
            serviceId || metaDataValue.services.find(
              (s) => s.name == alarmsFilter.solutions[0]
            ).id
          }&`
        : ""
    }${
      alarmsFilter.status.length
        ? `status=${JSON.stringify(alarmsFilter.status)}&`
        : ""
    }${alarmsFilter.emails ? `emails=${alarmsFilter.emails}&` : ""}${
      alarmsFilter.search.rule ? `type=${alarmsFilter.search.rule}&` : ""
    }${
      alarmsFilter.actuations ? `actuations=${alarmsFilter.actuations}&` : ""
    }${
      sensorIds.length ? `source=${JSON.stringify(sensorIds)}&` : ""
    }dateFrom=${new Date(
      new Date(alarmsFilter.date.startTime).setSeconds(0)
    ).toISOString()}&dateTo=${new Date(
      new Date(alarmsFilter.date.endTime).setSeconds(0)
    ).toISOString()}&pageSize=10&withTotalPages=true&currentPage=${page}${(alarmsFilter.solutions.length && alarmsFilter.solutions[0] != "All" && metaDataValue.services.find(s=>s.name == alarmsFilter.solutions[0]).group?.id) || (serviceId) ? `&groupId=${metaDataValue.services.find(s=> serviceId ? (s.id == serviceId) : (s.name == alarmsFilter.solutions[0])).group?.id}` : groupIds.length ? `&groupId=${JSON.stringify(groupIds)}`: ``}`,
  });


  //fetching all documents instead of paginating
  const allAlarmsList = 
  useGetAlarmsQuery({
    token: window.localStorage.getItem("token"),
    params: `?dashboard=true&allalarms=true&${
      Object.keys(sortedFields).length
        ? `sort=${JSON.stringify(sortedFields)}&`
        : ``
    }${
      alarmsFilter.priority.length
        ? `priority=${JSON.stringify(alarmsFilter.priority)}&`
        : ""
    }${
      (alarmsFilter.solutions.length && alarmsFilter.solutions[0] != "All") || (serviceId)
        ? `serviceId=${
            serviceId || metaDataValue.services.find(
              (s) => s.name == alarmsFilter.solutions[0]
            ).id
          }&`
        : ""
    }${
      alarmsFilter.status.length
        ? `status=${JSON.stringify(alarmsFilter.status)}&`
        : ""
    }${alarmsFilter.emails ? `emails=${alarmsFilter.emails}&` : ""}${
      alarmsFilter.search.rule ? `type=${alarmsFilter.search.rule}&` : ""
    }${
      alarmsFilter.actuations ? `actuations=${alarmsFilter.actuations}&` : ""
    }${
      sensorIds.length ? `source=${JSON.stringify(sensorIds)}&` : ""
    }dateFrom=${new Date(
      new Date(alarmsFilter.date.startTime).setSeconds(0)
    ).toISOString()}&dateTo=${new Date(
      new Date(alarmsFilter.date.endTime).setSeconds(0)
    ).toISOString()}&pageSize=${totalDocuments==0?10:totalDocuments}&withTotalPages=true&currentPage=1${(alarmsFilter.solutions.length && alarmsFilter.solutions[0] != "All" && metaDataValue.services.find(s=>s.name == alarmsFilter.solutions[0]).group?.id) || (serviceId) ? `&groupId=${metaDataValue.services.find(s=> serviceId ? (s.id == serviceId) : (s.name == alarmsFilter.solutions[0])).group?.id}` : groupIds.length ? `&groupId=${JSON.stringify(groupIds)}`: ``}`,
  },{skip: paginatedAlarms.isFetching || totalDocuments==null});

  //storing all documents
  useEffect(()=>{
    if(!allAlarmsList.isFetching && allAlarmsList.isSuccess){
      let data=JSON.parse(JSON.stringify(allAlarmsList.data.payload))
      const rows=generateRows(data.data)
      setTotalDocumentRows(rows)
    }
  },[totalDocuments, allAlarmsList.isFetching])


  useEffect(() => {
    if (!paginatedAlarms.isFetching && paginatedAlarms.isSuccess) {
      if(Object.keys(paginatedAlarms.data.payload).length){
        let data = JSON.parse(JSON.stringify(paginatedAlarms.data.payload));
        setColumns(generateColumns());
        setTotalPages(data.totalPages);
        setTotalDocuments(data.totalDocuments);
        setRows(generateRows(data.data));
      }
      else{
        setColumns(generateColumns());
        setTotalPages(0);
        setTotalDocuments(0);
        setRows([]);
      }
      //reset selection if filters change
      setChecked([])
      setAll(false)
    }
  }, [paginatedAlarms.isFetching]);

  function handlePageChange(page) {
    setPage(page);
  }

  const toggleCheck = (chk, row) => {
    if (row != "all") {
      let tempChecked = [...checked];
      if (chk) {
        tempChecked.push(row.alarmId);
      } else {
        let ind = tempChecked.findIndex((t) => t == row.alarmId);
        tempChecked.splice(ind, 1);
      }
      setChecked(tempChecked);
    } else {
      setAll(chk);
      if (chk) {
        setChecked(
          totalDocumentRows.map((row)=>row.alarmId)
        );
      } else {
        setChecked([]);
      }
    }
  };

  useEffect(() => {
    let tempSortedFields = { ...sortedFields };
    keys.forEach((key) => {
      let val = sort[key.name];
      if (
        val == 1 &&
        tempSortedFields[key.key] &&
        tempSortedFields[key.key] != val
      ) {
        tempSortedFields = { [key.key]: val };
      }
      if (val == -1) {
        tempSortedFields = { [key.key]: val };
      }
    });
    if (JSON.stringify(sortedFields) != JSON.stringify(tempSortedFields)) {
      setSortedFields(tempSortedFields);
    }
  }, [sort]);

  function generateColumns() {
    let tempColumns = [
      { id: "html", label: "html", align: "center" },
      {
        id: "service",
        label: "Solution",
        align: "center",
      },
      {
        id: "deviceName",
        label: "Asset",
        align: "center",
      },
      { id: "severity", label: "Priority", align: "center" },
      { id: "status", label: "Status", align: "center" },
      { id: "count", label: "Repeated", align: "center" },
      { id: "type", label: "Rule", align: "center" },
      { id: "reason", label: "Reason", align: "center" },
      { id: "email", label: "Emails", align: "center" },
      { id: "actuations", label: "Actuations", align: "center" },
      { id: "createdAt", label: "Created At", align: "center" },
      { id: "updatedAt", label: "Updated At", align: "center" },
    ];
    return tempColumns;
  }

  const check = (a) => {
    return (
      <Checkbox
        checked={checked.includes(a.alarmId)}
        onChange={(e) => toggleCheck(e.target.checked, a)}
        disabled={permission == "READ" || a.status == "CLEARED"}
      />
    );
  };

  const checkAll = (a) => {
    return (
      !allAlarmsList.isFetching ?
      <Checkbox
        checked={checked.length == totalDocuments}
        onChange={(e) => toggleCheck(e.target.checked, "all")}
        disabled={permission == "READ"}
      />
      : null
    );
  };

  function generateQuestion(tempStatus) {
    if (tempStatus ? tempStatus == "CLEARED" : status == "CLEARED") {
      let clearCount = 0;
      checked.forEach((chk) => {
        if (allAlarms.find((a) => a.alarmId == chk)?.status == "CLEARED") {
          clearCount += 1;
        }
      });
      return checked.length - clearCount
        ? `${checked.length - clearCount} out of ${
            checked.length
          } alarms will be cleared. Are you sure you want to clear alarms?`
        : false;
    } else {
      let ackCount = 0;
      checked.forEach((chk) => {
        if (
          allAlarms
            .filter((alarm) => alarm.status != "CLEARED")
            .find((a) => a.alarmId == chk)?.status == "ACKNOWLEDGED"
        ) {
          ackCount += 1;
        }
      });
      return checked.length - ackCount
        ? `${checked.length - ackCount} out of ${
            checked.length
          } alarms will be acknowledged. Are you sure you want to acknowledge alarms?`
        : false;
    }
  }

  async function updateAlarms() {
    let updated = await updateBatchAlarm({
      token,
      alarmId: JSON.stringify(checked),
      status,
    });
    if (updated.data?.success) {
      showSnackbar("Alarms", updated.data?.message, "success", 1000);
      setStatus("");
      setChecked([]);
    } else {
      showSnackbar("Alarms", updated.data?.message, "error", 1000);
    }
  }

  const icon = (row, type) => {
    let tempIcon;
    if (type == "email" && row.email && row.email.filter((e) => e).length) {
      tempIcon = (
        <Tooltip
          title={
            <span>
              <p>Email(s) sent to</p>
              {row.email
                .filter((e) => e)
                .map((e) => (
                  <p>○ {e}</p>
                ))}
            </span>
          }
          placement="top"
          arrow
          // TransitionComponent={Zoom}
        >
          <ForwardToInboxIcon />
        </Tooltip>
      );
    } else if (
      type == "actuations" &&
      row.actuations &&
      row.actuations.filter((a) => a)
    ) {
      tempIcon = (
        <Tooltip
          title={
            <span>
              {row.actuations
                .filter((a) => a)
                .map((e) => (
                  <p>{e}</p>
                ))}
            </span>
          }
          placement="top"
          arrow
          // TransitionComponent={Zoom}
        >
          <FlashOnIcon />
        </Tooltip>
      );
    }
    return tempIcon;
  };

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  return (
    <Fragment>
      {paginatedAlarms.isFetching || allAlarmsList.isFetching || loading  ? (
        <span
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "100%",
          }}
        >
          <Loader />
        </span>
      ) : (
        <Card sx={{ borderRadius: "10px", height: "100%" }}>
          <CardContent sx={{ padding: "0px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "16px",
                backgroundColor: checked.length
                  ? `rgb(${rgb.red}, ${rgb.green}, ${rgb.blue},0.1)`
                  : "",
              }}
            >
              <p
                style={{
                  color: "#bfbec8",
                  fontSize: "15px",
                  fontWeight: "bold",
                }}
              >
                List
                {checked.length ? (
                  <span style={{ fontWeight: "normal" }}>
                    {all
                      ? ` ( ${totalDocuments} selected )`
                      : ` ( ${checked.length} selected )`}
                  </span>
                ) : null}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >
                {generateQuestion("ACKNOWLEDGED") ? (
                  <Button
                    onClick={() => setStatus("ACKNOWLEDGED")}
                    color="success"
                    variant="contained"
                    style={{
                      visibility: checked.length ? "initial" : "hidden",
                      height: "27px",
                    }}
                  >
                    BATCH ACKNOWLEDGE
                  </Button>
                ) : null}
                {generateQuestion("CLEARED") ? (
                  <Button
                    onClick={() => setStatus("CLEARED")}
                    color="error"
                    variant="contained"
                    style={{
                      visibility: checked.length ? "initial" : "hidden",
                      height: "27px",
                    }}
                  >
                    BATCH CLEAR
                  </Button>
                ) : null}
                {csvData.length ? (
                  <CSVLink
                    id="export"
                    data={csvData}
                    asyncOnClick={true}
                    filename={`Alarms Dashboard`}
                  >
                    <Tooltip title="Export to CSV" placement="top" arrow>
                      <IconButton style={{ width: "30px", height: "30px" }}>
                        <DownloadIcon
                          style={{
                            width: "25px",
                            height: "25px",
                            color: "#333",
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                  </CSVLink>
                ) : null}
              </div>
            </div>
            <Table
              columns={columns}
              html={check}
              htmlLabel={checkAll}
              rows={totalDocumentRows}
              page={page}
              totalPages={totalPages}
              totalDocuments={totalDocuments}
              handleChange={handlePageChange}
              height="calc(100vh - 541px)"
              pageSize={10}
              size="small"
              icon={icon}
              minHeight={"auto"}
              sort={sort}
              setSort={setSort}
              sortedFields={sortedFields}
              keys={keys}
            />
          </CardContent>
        </Card>
      )}
      {status ? (
        <DeleteAlert
          deleteModal={true}
          question={generateQuestion()}
          platformCheck={false}
          id={status}
          handleDelete={() => updateAlarms()}
          handleClose={() => setStatus("")}
        />
      ) : null}
    </Fragment>
  );
}
