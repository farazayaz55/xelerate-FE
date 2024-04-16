//-------------CORE-------------//
import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import { useSnackbar } from "notistack";
import { useSelector, useDispatch } from "react-redux";

//-------------MUI-------------//
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Card from "@mui/material/Card";
import DeviceHubSharpIcon from "@mui/icons-material/DeviceHubSharp";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import GetAppIcon from "@mui/icons-material/GetApp";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
//----------EXTERNAL COMPS--------//
import { resetFilter, setFilter } from "rtkSlices/filterDevicesSlice";
import DeleteAlert from "components/Alerts/Delete";
import Table from "components/Table/newTable";
import Loader from "components/Progress";
import AddDevices from "./addDevices";
import { useGetDevicesQuery, useDeleteDevicesMutation } from "services/devices";
import InputBase from "@mui/material/InputBase";
import TuneIcon from "@mui/icons-material/Tune";
import Popover from "@mui/material/Popover";
import DeviceFilter from "components/Filters/deviceFilter";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import Tariff from "./tariff";

const useStyles = makeStyles((theme) => ({
  speedDial: {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    // zIndex: 20,
    transform: 'translateX(30%)', // Move the button to the right by 50%
    zIndex: theme.zIndex.speedDial,
  },
}));
let timeout = null;
let temp = "";
let searchFields = [];

export default function DM(props) {
  let keys = [
    { name: "name", key: "name" },
    { name: "imei", key: "packetFromPlatform.c8y_Mobile.imei" },
    { name: "imsi", key: "packetFromPlatform.c8y_Mobile.imsi" },
    { name: "iccid", key: "packetFromPlatform.c8y_Mobile.iccid" },
    { name: "msisdn", key: "packetFromPlatform.c8y_Mobile.msisdn" },
    {
      name: "serialNumber",
      key: "packetFromPlatform.c8y_Hardware.serialNumber",
    },
    {
      name: "firmware",
      key: "packetFromPlatform.c8y_Hardware.firmwareVersion",
    },
    { name: "updateTime", key: "updatedAt" },
  ];
  let token = window.localStorage.getItem("token");
  const dispatch = useDispatch();
  const [sort, setSort] = useState({
    name: 1,
    firmware: 1,
    serialNumber: 1,
    imei: 1,
    imsi: 1,
    iccid: 1,
    msisdn: 1,
    updateTime: 1,
  });
  const metaDataValue = useSelector((state) => state.metaData);
  const [sortedFields, setSortedFields] = useState({});
  const [loader, setLoader] = useState(true);
  const [service, setService] = useState("");
  const [rows, setRowState] = useState([]);
  const [filtering, setFiltering] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [allData, setAllData] = useState({});
  const [filterColumns, setFilterColumns] = useState(["name"]);
  const [page, setPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDevice, deleteResult] = useDeleteDevicesMutation();
  const [search, setSearch] = React.useState("");
  const [tempSearch, setTempSearch] = useState("");
  const groupIds = []
  metaDataValue?.services.forEach(s=>{
    if(s.group?.id){
      groupIds.push(`${s.id}:${s.group?.id}`)
    }
  })
  const devices = useGetDevicesQuery({
    token,
    group: JSON.stringify(metaDataValue?.services.map((e) => e.id)),
    params: `${
      service && `&serviceId=${service}`
    }&pageSize=25&currentPage=${page}&withTotalPages=true${
      Object.keys(sortedFields).length &&
      `&sort=${JSON.stringify(sortedFields)}`
    }&search=${search}&searchFields=${JSON.stringify(searchFields)}${service && metaDataValue.services.find(s=>s.id == service).groupd?.id ? `&associatedGroup=${metaDataValue.services.find(s=>s.id == service).groupd?.id}` : groupIds?.length ?  `&associatedGroup=${JSON.stringify(groupIds)}` : ``}`,
  });

  const AllDevices = useGetDevicesQuery({
    token,
    group: JSON.stringify(metaDataValue?.services.map((e) => e.id)),
    params: `${
      service && `&serviceId=${service}`
    }&pageSize=${devices?.data?.payload?.totalDocuments==0?10:devices?.data?.payload?.totalDocuments}&currentPage=1&withTotalPages=true${
      Object.keys(sortedFields).length &&
      `&sort=${JSON.stringify(sortedFields)}`
    }&search=${search}&searchFields=${JSON.stringify(searchFields)}${service && metaDataValue.services.find(s=>s.id == service).groupd?.id ? `&associatedGroup=${metaDataValue.services.find(s=>s.id == service).groupd?.id}` : groupIds?.length ?  `&associatedGroup=${JSON.stringify(groupIds)}` : ``}`,
  },{
    skip:devices.isFetching 
  });

  const [activeId, setActiveId] = useState(null);
  const [deleteModal, setDelete] = useState(false);
  const [deviceEdit, setDeviceEdit] = useState("");
  const [openPopup, setOpenPopup] = useState(false);
  const [openPopup2, setOpenPopup2] = useState(false);
  const [open, setOpen] = React.useState(false);
  const metaData = useSelector((state) => state.metaData?.services);
  const { enqueueSnackbar } = useSnackbar();

  function getServiceName(id) {
    let output;
    metaData.forEach((elm) => {
      if (elm.id == id) {
        output = elm.name;
      }
    });
    return output;
  }
  function ifLoaded(state, component) {
    if (state) return <Loader top="20vh" />;
    else return component();
  }

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
      if (val != 1) {
        tempSortedFields = { [key.key]: val };
      }
    });
    if (JSON.stringify(sortedFields) != JSON.stringify(tempSortedFields)) {
      setSortedFields(tempSortedFields);
    }
  }, [sort]);

  const handleSearch = (e) => {
    setTempSearch(e.target.value);
    temp = e.target.value;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      setSearch(temp);
    }, 1000);
  };

  async function fetchDevices() {
    var temp = [];
    if (devices.isSuccess && devices.data?.payload) {
      devices.data.payload?.data?.forEach((elm) => {
        let time = new Date(elm.updatedAt);
        temp.push(
          createData(
            elm.name,
            getServiceName(elm.serviceId),
            elm.internalId,
            `${time.toLocaleDateString("en-GB")} ${time.toLocaleTimeString()}`,
            elm?.packetFromPlatform?.c8y_Hardware?.serialNumber,
            elm?.packetFromPlatform?.c8y_Firmware?.version,
            elm?.packetFromPlatform?.c8y_Mobile?.imei,
            elm?.packetFromPlatform?.c8y_Mobile?.imsi,
            elm?.packetFromPlatform?.c8y_Mobile?.iccid,
            elm?.packetFromPlatform?.c8y_Mobile?.msisdn,
            elm.internalId,
            elm.platformDeviceType
          )
        );
      });
      setAllData({
        ...allData,
        ...temp.reduce(
          (acc, t) => {
            acc[`page-${page}`].push(t);
            return acc;
          },
          { ["page-" + page]: [] }
        ),
      });
    } 
    else if (
      !devices.isFetching &&
      devices.isError &&
      devices.data?.message != ""
    ) {
      showSnackbar("Devices", devices.data?.message, "error", 1000);
    }
  }

  function handleUpdateDevice(body, id) {
    let old = [...rows];
    let ind = rows.findIndex((m) => m.id == id);
    if (ind != -1)
      old.splice(
        ind,
        1,
        createData(
          body.name,
          getServiceName(body.serviceId),
          id,
          `${new Date().toLocaleDateString(
            "en-GB"
          )} ${new Date().toLocaleTimeString()}`,
          body.serialNumber,
          body.firmwareVersion,
          body.imei,
          body.imsi,
          body.iccid,
          body.msisdn,
         ` ${new Date().toLocaleDateString(
            "en-GB"
          )} ${new Date().toLocaleTimeString()}`
        )
      );
    setRowState(old);
  }

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  const handleClose = () => {
    setDeviceEdit("");
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  useEffect(() => {
    fetchDevices();
  }, [devices.isFetching]);

  useEffect(()=>{
    var temp = [];
    if (AllDevices.isSuccess && AllDevices.data?.payload) {
      AllDevices.data.payload?.data?.forEach((elm) => {
        let time = new Date(elm.updatedAt);
        temp.push(
          createData(
            elm.name,
            getServiceName(elm.serviceId),
            elm.internalId,
            `${time.toLocaleDateString("en-GB")} ${time.toLocaleTimeString()}`,
            elm?.packetFromPlatform?.c8y_Hardware?.serialNumber,
            elm?.packetFromPlatform?.c8y_Firmware?.version,
            elm?.packetFromPlatform?.c8y_Mobile?.imei,
            elm?.packetFromPlatform?.c8y_Mobile?.imsi,
            elm?.packetFromPlatform?.c8y_Mobile?.iccid,
            elm?.packetFromPlatform?.c8y_Mobile?.msisdn,
            elm.internalId,
            elm.platformDeviceType
          )
        );
      });
      setRowState(temp);
      setLoader(false)
    } 
  },[AllDevices.isFetching])

  async function toggleDelete(id = null) {
    setActiveId(id);
    setDelete((state) => !state);
  }

  async function onDelete(e, check) {
    let deletedDevice = await deleteDevice({
      token,
      id: e,
      platformCheck: check,
    });
    if (deletedDevice.error) {
      showSnackbar("Device", deletedDevice.error?.data?.message, "error", 1000);
    } else {
      showSnackbar("Device", deletedDevice.data?.message, "success", 1000);
      toggleDelete();
    }
  }

  const handlepopupToggle = () => {
    setOpenPopup(!openPopup);
    setDeviceEdit("");
  };

  const handlepopupToggle2 = () => {
    setOpenPopup2(!openPopup2);
  };

  const actions = [
    {
      icon: <GetAppIcon />,
      name: "Import Devices",
      handleFn: handlepopupToggle,
    },
    {
      icon: <AddCircleOutlineIcon />,
      name: "Add Device",
      handleFn: handlepopupToggle2,
    },
  ];

  const classes = useStyles();

  function columns() {
    let temp = [
      { id: "name", label: "Name", align: "center" },
      { id: "dashboard", label: "Solution", align: "center" },
      { id: "id", label: "ID", align: "center" },
      { id: "serialNumber", label: "Serial Number", align: "center" },
      { id: "firmware", label: "Firmware", align: "center" },
      { id: "imei", label: "IMEI", align: "center" },
      { id: "imsi", label: "IMSI", align: "center" },
      { id: "iccid", label: "ICCID", align: "center" },
      { id: "msisdn", label: "MSISDN", align: "center" },
      {
        id: "updateTime",
        label: "Last Updated",
        align: "center",
      },
    ];
    if (props.permission == "ALL")
      temp.push({
        id: "html",
        label: "Actions",
        minWidth: 150,
        align: "center",
        disableSorting: true,
      });
    return temp;
  }

  function createData(
    name,
    dashboard,
    id,
    updateTime,
    serialNumber,
    firmware,
    imei,
    iccid,
    msisdn,
    imsi,
    html,
    platformDeviceType
  ) {
    return {
      name,
      dashboard,
      id,
      updateTime,
      serialNumber,
      firmware,
      imei,
      html,
      platformDeviceType,
      imsi,
      iccid,
      msisdn
    };
  }

  var html = (row) => {
    return (
      <div>
        {/* <Tariff id={row.html} name={row.name} /> */}
        <IconButton
          onClick={() => {
            setDeviceEdit(row);
            setOpenPopup2(true);
          }}
        >
          <EditIcon color="secondary" />
        </IconButton>
        <IconButton
          id={row.html}
          // onClick={onDelete}
          onClick={() => toggleDelete(row.html)}
        >
          <DeleteIcon color="secondary" />
        </IconButton>
      </div>
    );
  };

  const pageChange = (newPage) => {
    setCurrentPage(newPage);
      setPage(newPage);
    }

  function cardFunc() {
    return (
      <Table
        columns={columns()}
        rows={rows}
        html={html}
        page={currentPage}
        totalPages={devices.data.payload.totalPages}
        totalDocuments={devices.data.payload.totalDocuments}
        handleChange={pageChange}
        height="calc(100vh - 270px)"
        pageSize={25}
        setSort={setSort}
        sort={sort}
        sortedFields={sortedFields}
        keys={keys}
      />
    );
  }

  const doneFilter = (cols) => {
    setFiltering(false);
    // setFilterColumns(cols)
    searchFields = filterColumns;
    if (search) {
      devices.refetch();
    }
  };

  return (
    <div>
      {props.permission == "ALL" ? (
        <SpeedDial
          ariaLabel="SpeedDial example"
          className={classes.speedDial}
          icon={<SpeedDialIcon />}
          FabProps={{
            color: "secondary",
          }}
          onClose={handleClose}
          onOpen={handleOpen}
          open={open}
          direction="left"
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              id={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.handleFn}
            />
          ))}
        </SpeedDial>
      ) : null}
      {openPopup || openPopup2 ? (
        <AddDevices
          deviceEdit={deviceEdit}
          openPopup2={openPopup2}
          openPopup={openPopup}
          handlepopupToggle={handlepopupToggle}
          handlepopupToggle2={handlepopupToggle2}
          handleUpdateDevice={handleUpdateDevice}
        />
      ) : null}
      <Card>
        <div
          style={{
            margin: "15px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p style={{ color: "rgb(191, 190, 200)", fontSize: "15px", flex: 1 }}>
            <b>Devices</b>
          </p>
          <div style={{ width: "20%" }}>
            <FormControl size="small" fullWidth sx={{ borderRadius: "10px" }}>
              <InputLabel id="demo-select-small">Filter By Solution</InputLabel>
              <Select
                label="Filter by Solution"
                onChange={(e) => {
                  setService(e.target.value);
                }}
                sx={{ borderRadius: "10px" }}
              >
                {metaData.map((elm) => {
                  return <MenuItem value={elm.id}>{elm.name}</MenuItem>;
                })}
              </Select>
            </FormControl>
          </div>

          <div style={{ marginRight: "20px", height: "40px" }}>
            <InputBase
              placeholder={
                !service ? "Select a solution to enable search" : "Search ..."
              }
              sx={{
                border: "1px solid rgb(215, 215, 215)",
                borderRadius: "10px",
                padding: "12px",
                marginLeft: "5px",
                width: "500px",
                height: "40px",
              }}
              value={tempSearch}
              onChange={handleSearch}
              disabled={!service}
            />
            <TuneIcon
              sx={{
                position: "absolute",
                marginLeft: "-35px",
                marginTop: "6px",
                cursor: "pointer",
                color: !service ? "lightgrey" : "#222",
                pointerEvents: !service && "none",
              }}
              onClick={(e) => {
                setAnchorEl(e.currentTarget);
                setFiltering(true);
              }}
            />
          </div>
          <span>
            <Popover
              id="assets"
              anchorEl={anchorEl}
              // icon={KeyboardArrowDownIcon}
              open={filtering}
              onClose={doneFilter}
              name="assets"
              // anchorOrigin={{
              //   vertical: "bottom",
              //   horizontal: "left",
              // }}
              style={{ maxHeight: "500px" }}
            >
              <DeviceFilter
                filterColumns={filterColumns}
                setFilterColumns={setFilterColumns}
                doneFilter={doneFilter}
              />
            </Popover>
          </span>
          <DeviceHubSharpIcon color="disabled" />
        </div>
        <div
          style={{
            margin: "20px",
            minHeight: "50vh",
          }}
        >
          {ifLoaded(loader, cardFunc)}
        </div>
      </Card>

      {activeId ? (
        <DeleteAlert
          deleteModal={deleteModal}
          question="Are you sure you want to delete this device?"
          platformCheck={true}
          id={activeId}
          handleDelete={onDelete}
          handleClose={toggleDelete}
          deleteResult={deleteResult}
        />
      ) : null}
    </div>
  );
}
