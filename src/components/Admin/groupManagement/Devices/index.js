import React, { Fragment, useEffect } from "react";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHdd, faL } from "@fortawesome/free-solid-svg-icons";
import DeleteIcon from "@mui/icons-material/Delete";
import { makeStyles } from "@mui/styles";
import CircularProgress from "@mui/material/CircularProgress";
import { useSelector, useDispatch } from "react-redux";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
import {
  useGetDevicesQuery,
  useGetDevicesListQuery,
  useUpdateGroupMutation,
} from "services/groups";
import { useEditDeviceMutation } from "services/devices";
useDispatch;
import { useSnackbar } from "notistack";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import { DialogContent, DialogContentText } from "@mui/material";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DialogTitle from "@mui/material/DialogTitle";
import Loader from "components/Progress";
import Table from "components/Table/newTable";
import Divider from "@mui/material/Divider";
import RouterIcon from "@mui/icons-material/Router";
import Pagination from "@mui/material/Pagination";
import CheckIcon from "@mui/icons-material/Check";
import Chip from "@mui/material/Chip";
import hexRgb from "hex-rgb";
import TuneIcon from "@mui/icons-material/Tune";
import { Popover, Checkbox } from "@mui/material";
import DeviceFilter from "../../../Filters/deviceFilter";

const useStyles = makeStyles({
  root: {
    height: 264,
    flexGrow: 1,
    maxWidth: 800,
    minWidth: 800,
  },
  device: {
    display: "flex",
    alignItems: "center",
    borderRadius: "10px",
    padding: "10px",
    cursor: "pointer",
    zIndex: "1000000px",
    "&:hover": {
      backgroundColor: "#eeeeee",
    },
    "&:active": {
      backgroundColor: "white",
    },
  },
});

let timeout = null;
let tempSearch = "";

export default function Devices(props) {
  let keys = [
    { name: "html", key: "name" },
    { name: "imei", key: "packetFromPlatform.c8y_Mobile.imei" },
    {
      name: "serialNumber",
      key: "packetFromPlatform.c8y_Hardware.serialNumber",
    },
    {
      name: "firmware",
      key: "packetFromPlatform.c8y_Hardware.firmwareVersion",
    },
    {
      name: "lastUpdated",
      key: "measurementUpdateTime",
    },
    {
      name: "html3",
      key: "packetFromPlatform.c8y_Availability.status",
    },
  ];
  const metaDataValue = useSelector((state) => state.metaData);
  const solution = metaDataValue.services.find((s) => s.id == props.solution);
  let permission = solution.solutionLayout?.map?.columns;
  const classes = useStyles();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  let token = window.localStorage.getItem("token");
  const [isLoading,setIsLoading]=React.useState(true)
  const [rows, setRows] = React.useState([]);
  const [searchText, setSearchText] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [filterColumns, setFilterColumns] = React.useState(getSearchParam());
  const [addLoader, setAddLoader] = React.useState(false);
  const [filtering, setFiltering] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [attachedDevices, setAttachedDevices] = React.useState([]);
  const [unattachedDevices, setUnattachedDevices] = React.useState([]);
  const [openPopup, setOpenPopup] = React.useState(false);
  const [openPopupParentChild, setOpenPopupParentChild] = React.useState(false);

  const [openChildrenPopup, setOpenChildrenPopup] = React.useState(false);

  const [searchFields, setSearchFields] = React.useState(getSearchParam());
  const [selected, setSelected] = React.useState([]);
  const [totalDocuments, setTotalDocuments] = React.useState([]);
  const [selectedList, setSelectedList] = React.useState([]);
  const [skip, setSkip] = React.useState(true);
  const [deviceSkip, setDeviceSkip] = React.useState(true);
  const [id, setId] = React.useState(props.id);
  const [devicesPage, setDevicesPage] = React.useState(1);
  const [columns, setColumns] = React.useState([]);
  const [assets, setAssets] = React.useState([]);
  const [selectedAsset, setSelectedAsset] = React.useState();
  const [popup, setPopup] = React.useState();
  const [updateDevice, updateResult] = useEditDeviceMutation();
  const [childDevices, setChildDevices] = React.useState([]);
  const [disableSaveButton, setDisableSaveButton] = React.useState();
  const [
    openChildAssetsDelinkModal,
    setOpenChildAssetsDelinkModal,
  ] = React.useState(false);
  const checkboxLabel = { inputProps: { "aria-label": "Checkbox demo" } };

  const { t } = useTranslation();
  const [sort, setSort] = React.useState({
    html: 1,
    firmware: 1,
    serialNumber: 1,
    imei: 1,
    lastUpdated: 1,
  });
  const [rgb, setRgb] = React.useState(
    hexRgb(metaDataValue.branding.primaryColor)
  );
  const [sortedFields, setSortedFields] = React.useState({});
  const [devicesTotalPages, setDevicesTotalPages] = React.useState(1);
  const [devicesListPage, setDevicesListPage] = React.useState(1);
  const [devicesListTotalPages, setDevicesListTotalPages] = React.useState(1);
  let rgbSecondary = hexRgb(metaDataValue?.branding?.secondaryColor);
  const [childrenOfSelected, setChildrenOfSelected] = React.useState([]);
  const [deLinkHerarchi, setDeLinkHerarchi] = React.useState(false);

  // const [rgb, setRgb] = React.useState(
  //   hexRgb(metaDataValue.branding.secondaryColor)
  // );

  const handleChangePage = (event, newPage) => {
    setDevicesPage(newPage);
  };

  const handleListChangePage = (page) => {
    setDevicesListPage(page);
  };
  useEffect(() => {
    setDisableSaveButton(true);
  }, []);
  useEffect(() => {
    if (props.id == "0") {
      setDeviceSkip(true);
      setAttachedDevices([]);
    } else {
      setDeviceSkip(false);
      setId(props.id);
    }
    setSkip(true);
  }, [props.id]);

  const [editGroup, editResult] = useUpdateGroupMutation();

  const devices = useGetDevicesQuery(
    {
      token,
      id: id,
      params: `?currentPage=${devicesPage}&pageSize=10`,
    },
    { skip: deviceSkip }
  );





  const devicesList = useGetDevicesListQuery(
    {
      token,
      id: id,
      params: `?currentPage=${devicesListPage}&parentDeviceId=${
        selectedAsset ? selectedAsset.internalId : null
      }&pageSize=10&search=${searchText}&searchFields=${JSON.stringify(
        searchFields
      )}${
        Object.keys(sortedFields).length
          ? `&sort=${JSON.stringify(sortedFields)}`
          : ``
      }`,
    },
    { skip: skip }
  );


    const allDevicesList=useGetDevicesListQuery(
      {
        token,
        id: id,
        params: `?currentPage=1&parentDeviceId=${
          selectedAsset ? selectedAsset.internalId : null
        }&pageSize=${totalDocuments==0?10:totalDocuments}&search=${searchText}&searchFields=${JSON.stringify(
          searchFields
        )}${
          Object.keys(sortedFields).length
            ? `&sort=${JSON.stringify(sortedFields)}`
            : ``
        }`,
      },
      { skip: devicesList.isFetching  }
    );





  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }
  const manageChildDevices = () => {
    if (selectedAsset) {
      const specificDevice =
        childDevices?.length &&
        childDevices.find((device) => device._id === selectedAsset?._id);
      if (specificDevice) {
        setChildrenOfSelected(specificDevice.childDevices);
      }
    }
  };
  function getSearchParam() {
    let searchArr = ["name"];
    if (permission) {
      if (permission.includes("metaTags")) {
        searchArr.push("metaTags");
      }
      if (permission.includes("deviceInfo")) {
        searchArr.push("firmware", "serialNo", "imei", "internalId");
      }
      return searchArr;
    } else {
      return [];
    }
  }

  useEffect(() => {
    console.log("editResult", editResult);
    setDeLinkHerarchi(false);
    if (editResult.isSuccess) {
      setTimeout(() => {
        setAddLoader(false);
      }, 500);
      handlepopupClose();
      showSnackbar("Groups", editResult.data?.message, "success", 1000);
    }
    if (editResult.isError) {
      setTimeout(() => {
        setAddLoader(false);
      }, 500);
      showSnackbar("Groups", editResult.error?.message, "success", 1000);
    }
  }, [editResult]);
  useEffect(() => {
    if (selectedAsset && attachedDevices && attachedDevices.length) {
      console.log("here");
      setSelected(selectedAsset?._id);
      setChildrenOfSelected(
        attachedDevices.find((p) => p.internalId === selectedAsset.internalId)
          ?.childDevices
      );
    }
    // manageChildDevices()
  }, [selectedAsset, attachedDevices, devicesList]);
  useEffect(() => {
    console.log("useEffect 1 ")
    if (devices.isSuccess) {
      setSelected([]);
      setAssets([]);
      setDevicesTotalPages(devices.data.payload.totalPages);

      setAttachedDevices(devices.data.payload.devices);
    }
    if (devices.isError) {
      showSnackbar("Devices", devices.error.data?.message, "error", 1000);
    }
  }, [devices.isFetching]);

  useEffect(() => {
    console.log('useEffect 2')
    if (devicesList.isSuccess) {
      if (popup === "parentChild") {
        // setDisableSaveButton(true);

        // manageParentChildDevices(devicesList);
      } else {
        setSelected([]);
        setAssets([])
        setDevicesListTotalPages(devicesList.data.payload.totalPages);
        setTotalDocuments(devicesList.data.payload.totalDocuments);
        let data = devicesList.data.payload.devices;
        setUnattachedDevices(data);
        generateColumns(data);
      }
    }
    if (devicesList.isError) {
      showSnackbar("Devices", devicesList.error.data?.message, "error", 1000);
    }
  }, [devicesList.isFetching]);

  useEffect(() => {
    console.log('useEffect 3 ')
    if (allDevicesList.isSuccess) {
      if (popup !== "parentChild") {
        let data = allDevicesList.data.payload.devices;
        let temp = [];
        data.forEach((elm) => {
          temp.push({
            ...{ name: elm.name, internalId: elm.internalId },
            ...getMetaValues(elm),
            ...getDeviceInfo(elm),
            html3: elm?.packetFromPlatform?.c8y_Availability
              ? elm?.packetFromPlatform?.c8y_Availability?.status
              : "",
          });
        });
        setRows(temp);
        setIsLoading(false)
        setSkip(true)
      } 
    }

  }, [allDevicesList.isFetching]);

  const manageParentChildDevices = (devicesList) => {
    setSelected([]);
    setAssets([]);
    setDevicesListTotalPages(devicesList.data.payload.totalPages);
    setTotalDocuments(devicesList.data.payload.totalDocuments);
    let data = allDevicesList.data.payload.devices;
    let temp = [];
    setUnattachedDevices(data);
    data.forEach((elm) => {
      temp.push({
        ...{ name: elm.name, internalId: elm.internalId },
        ...getMetaValues(elm),
        ...getDeviceInfo(elm),
        ...isChild(elm),
        html3: elm?.packetFromPlatform?.c8y_Availability
          ? elm?.packetFromPlatform?.c8y_Availability?.status
          : "",
      });
    });
    // Sorting the array based on the isChild property
    temp.sort((a, b) => (a.isChild === b.isChild ? 0 : a.isChild ? -1 : 1));
    setRows(temp);
    generateColumnsParentChild(data);
  };
  const handlepopupClose = () => {
    setAssets([]);
    setOpenPopup(false);
    setSearch("");
    setSearchText("");
    setFilterColumns(getSearchParam());
    setSearchFields(getSearchParam());
  };
  const handlepopupCloseParentChild = () => {
    setOpenPopupParentChild(false);
  };

  const handlepopupOpen = () => {
    setPopup("assetsPopup");
    setSelectedAsset(null);
    if (skip) setSkip(false);
    else devicesList.refetch();
    setOpenPopup(true);
  };
  const handleChildrenPopupOpen = () => {
    setPopup("parentChild");
    manageChildDevices();
    if (skip) setSkip(false);
    else devicesList.refetch();
    setOpenPopupParentChild(true);
  };

  function handleClick(id) {
    let old = [...selected];
    if (old.indexOf(id) == -1) old.push(id);
    else old.splice(old.indexOf(id), 1);
    setSelected(old);
  }

  function handleListItemClick(id) {
    let old = [...selectedList];
    if (old.indexOf(id) == -1) old.push(id);
    else old.splice(old.indexOf(id), 1);
    setSelectedList(old);
  }

  function handleDevice(add, arr) {
    let body = {
      addDevices: add,
      devices: arr,
      marker: props.marker,
    };
    editGroup({ token, id: props.id, body });
  }

  const handleSearch = (e) => {
    setSearch(e.target.value);
    clearTimeout(timeout);
    tempSearch = e.target.value;
    timeout = setTimeout(function () {
      setSearchText(tempSearch);
      setSearchFields(filterColumns);
    }, 1000);
  };

  function generateColumns(devices) {
    let tempColumns = [
      { id: "html3", label: "connectivity", align: "center" },
      { id: "html", label: t("Name"), align: "center" },
      // { id: "id", label: t("id"), align: "center" },
    ];

    if (permission.includes("deviceInfo")) {
      tempColumns = [
        ...tempColumns,
        ...[
          { id: "id", label: t("id"), align: "center" },
          { id: "firmware", label: t("Firmware"), align: "center" },
          { id: "serialNumber", label: t("Serial Number"), align: "center" },
          { id: "imei", label: t("IMEI"), align: "center" },
        ],
      ];
    }
    let highestLen = Math.max(...devices.map((d) => d.metaTags.length));
    if (
      permission.includes("metaTags") &&
      devices.find((d) => d.metaTags.length)
    ) {
      let index = devices.findIndex((d) => d.metaTags.length == highestLen);
      let tags = JSON.parse(JSON.stringify(devices[index].metaTags));
      tempColumns = [
        ...tempColumns,
        ...tags?.map((m) => {
          return { id: m.key, label: t(m.key), align: "center" };
        }),
      ];
    }
    setColumns(tempColumns);
  }
  function generateColumnsParentChild(devices) {
    let tempColumns = [
      { id: "isChild", label: t("Selected"), align: "center" },
      { id: "html3", label: "connectivity", align: "center" },
      { id: "html", label: t("Name"), align: "center" },

      // { id: "id", label: t("id"), align: "center" },
    ];
    if (permission.includes("deviceInfo")) {
      tempColumns = [
        ...tempColumns,
        ...[
          { id: "id", label: t("id"), align: "center" },
          { id: "firmware", label: t("Firmware"), align: "center" },
          { id: "serialNumber", label: t("Serial Number"), align: "center" },
          { id: "imei", label: t("IMEI"), align: "center" },
        ],
      ];
    }
    let highestLen = Math.max(...devices.map((d) => d.metaTags.length));
    if (
      permission.includes("metaTags") &&
      devices.find((d) => d.metaTags.length)
    ) {
      let index = devices.findIndex((d) => d.metaTags.length == highestLen);
      let tags = JSON.parse(JSON.stringify(devices[index].metaTags));
      tempColumns = [
        ...tempColumns,
        ...tags?.map((m) => {
          return { id: m.key, label: t(m.key), align: "center" };
        }),
      ];
    }
    setColumns(tempColumns);

    setColumns(tempColumns);
  }
  const updateDeviceChildren = async () => {
    if (selectedAsset) {
      const body = {
        ...selectedAsset,
        childDevices: childrenOfSelected.map((obj) => obj.internalId || obj.id),
      };
      let updated = await updateDevice({
        token,
        body,
        id: body.internalId,
      });
      if (updated.data?.success) {
        setAddLoader(false);
        handlepopupCloseParentChild();
        const childDevicesCopy = childDevices.map((obj) =>
          obj.internalId === body.internalId ? { ...body } : obj
        );
        setChildDevices(childDevicesCopy);
        devices.refetch();
        showSnackbar("Device", updated.data?.message, "success", 1000);
      } else {
        showSnackbar("Device", updated.data?.message, "error", 1000);
      }
    }
  };
  const selectDevice = (device) => {
    let children = JSON.parse(JSON.stringify(childrenOfSelected));
    const index = children.findIndex(
      (p) => (p.internalId || p.id) === device.internalId
    );
    console.log("index", index);
    if (index !== -1) {
      children.splice(index, 1);
    } else {
      children.push(device);
    }
    setDisableSaveButton(false);
    setChildrenOfSelected(children);
  };
  function getDeviceInfo(elm) {
    return permission.includes("deviceInfo")
      ? {
          id: elm.internalId,
          firmware: elm.packetFromPlatform?.c8y_Hardware
            ? elm.packetFromPlatform?.c8y_Hardware?.firmwareVersion
            : "",
          serialNumber: elm.packetFromPlatform?.c8y_Hardware
            ? elm.packetFromPlatform.c8y_Hardware.serialNumber
            : "",
          imei: elm?.packetFromPlatform?.c8y_Mobile
            ? elm?.packetFromPlatform?.c8y_Mobile?.imei
            : "",
        }
      : [];
  }
  function isChild(elm) {
    // Check if any childDevice has the specified childID
    const childExists = childrenOfSelected && childrenOfSelected.some(
      (child) => (child.id || child.internalId) === elm?.internalId
    );

    return {
      isChild: childExists,
    };
  }

  function getMetaValues(elm) {
    let meta = {};
    elm.metaTags.forEach((m) => {
      meta[m.key] = m.value;
    });
    return permission.includes("metaTags") ? meta : [];
  }

  var more = (row) => {
    // function moreDetails() {
    //   props.history.push(`/solutions/${props.link}/${row.id}`);
    // }
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "max-content",
        }}
      >
        {/* <div
          style={{
            backgroundColor: `rgb(${rgb.red}, ${rgb.green}, ${rgb.blue},0.1)`,
            padding: "4px 6px 4px 6px",
            borderRadius: "10px",
            cursor: "pointer",
            width: "max-content",
          }}
          // onClick={moreDetails}
        > */}
        <p
          style={{
            color: assets.find((a) => a.internalId == row.internalId)
              ? "white"
              : "#333",
            fontSize: "12px",
          }}
        >
          <b>{row.name}</b>
        </p>
        {/* </div> */}
      </div>
    );
  };

  var status = (row) => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor:
              row.html3 == "AVAILABLE"
                ? "#4caf50"
                : row.html3 == "UNAVAILABLE"
                ? "#555555"
                : "#ba75d8",
          }}
        />
      </div>
    );
  };

  const doneFilter = () => {
    // setFilterColumns(cols)
    setFiltering(false);
    if (tempSearch) {
      dispatch(
        setFilter({
          search: tempSearch,
          searching: true,
          searchFields: filterColumns,
        })
      );
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
  useEffect(() => {
    if (devicesList && devicesList?.data) {
      manageParentChildDevices(devicesList);
    }
  }, [childrenOfSelected]);

  const CustomTooltip = ({ name, id, connectedStatus, children }) => {
    const tooltipContent = (
      <div>
        <p>Name: {name}</p>
        <p>ID: {id}</p>
        <p>Status: {connectedStatus}</p>
      </div>
    );

    return <Tooltip title={tooltipContent}>{children}</Tooltip>;
  };

  const reject = () => {
    setOpenChildAssetsDelinkModal(false);
  };

  const accept = () => {
    setOpenChildAssetsDelinkModal(false);
    let body = {
      addDevices: false,
      devices: [selectedAsset._id],
      marker: props.marker,
      removeChildren: deLinkHerarchi,
    };
    editGroup({ token, id: props.id, body });
  };
  return (
    <Fragment>
      <Dialog
        open={openPopup}
        onClose={handlepopupClose}
        aria-labelledby="form-dialog-title"
        PaperProps={{
          style: {
            maxWidth: "80vw",
            width: "80vw",
            // height:'75vh'
          },
        }}
      >
        <DialogTitle>Assets List</DialogTitle>
        {!devicesList.isFetching ? (
          <TextField
            variant="outlined"
            margin="dense"
            fullWidth
            size="small"
            label="Search"
            onChange={handleSearch}
            style={{ margin: "0px 2%", width: "96%" }}
            value={search}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "grey" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <TuneIcon
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      setAnchorEl(e.currentTarget);
                      setFiltering(true);
                    }}
                  />
                </InputAdornment>
              ),
            }}
          />
        ) : null}
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
              layoutPermission={solution.solutionLayout?.map}
              doneFilter={doneFilter}
            />
          </Popover>
        </span>
        <DialogContent
          style={{
            overflow: "hidden",
            padding: "2% 2% 0% 2%",
            textAlign: "center",
          }}
        >
          {/* <div style={{ margin: "5px" }}>
            <List component="nav">
              {devicesList.isLoading || skip ? (
                <Loader />
              ) : (
                <Fragment>
                  {unattachedDevices.length > 0 ? (
                    <Fragment>
                      <Divider />
                      {unattachedDevices.map((elm, i) => {
                        return (
                          <Fragment>
                            <ListItemButton
                              onClick={() => handleListItemClick(elm._id)}
                              style={{
                                backgroundColor:
                                  selectedList.indexOf(elm._id) != -1
                                    ? metaDataValue.branding.secondaryColor
                                    : "white",
                                justifyContent: "space-between",
                                alignItems: "center",
                                margin: "5px",
                                gap: "40px",
                              }}
                            >
                              <span style={{ display: "flex" }}>
                                <ListItemIcon>
                                  <RouterIcon
                                    style={{
                                      color:
                                        selectedList.indexOf(elm._id) != -1
                                          ? "white"
                                          : "",
                                    }}
                                  />
                                </ListItemIcon>
                                <ListItemText
                                  primary={`${elm.name}(${elm.internalId})`}
                                  style={{
                                    color:
                                      selectedList.indexOf(elm._id) != -1
                                        ? "white"
                                        : "",
                                  }}
                                />
                              </span>
                              {permission ? (
                                <div style={{ display: "flex", gap: 2 }}>
                                  {elm.metaTags.map((tag) => {
                                    return (
                                      <Chip
                                        label={`${tag.key}: ${tag.value}`}
                                        size="small"
                                        style={{
                                          color:
                                            metaDataValue?.branding
                                              ?.secondaryColor,
                                          backgroundColor:
                                            selectedList.indexOf(elm._id) != -1
                                              ? "white"
                                              : `rgb(${rgbSecondary.red}, ${rgbSecondary.green}, ${rgbSecondary.blue},0.1)`,
                                          fontWeight: "400",
                                          fontSize: "11px",
                                          borderRadius: 4,
                                        }}
                                      />
                                    );
                                  })}
                                </div>
                              ) : null}
                            </ListItemButton>
                            <Divider />
                          </Fragment>
                        );
                      })}
                      <div
                        style={{
                          margin: "30px 10px 10px 10px",
                          width: "100%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Pagination
                          color="secondary"
                          count={devicesListTotalPages}
                          page={devicesListPage}
                          onChange={handleListChangePage}
                        />
                      </div>
                    </Fragment>
                  ) : (
                    <div
                      style={{
                        height: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                        display: "flex",
                        flexDirection: "column",
                        color: "#c8c8c8",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faHdd}
                        style={{
                          color: "#c8c8c8",
                          width: "50px",
                          height: "50px",
                        }}
                      />
                      <p style={{ fontSize: "13px" }}>No Assets Found</p>
                    </div>
                  )}
                </Fragment>
              )}
            </List>
          </div> */}
          {isLoading? (
            <CircularProgress
              color="secondary"
              size={50}
              sx={{ marginTop: "6%" }}
            />
          ) : (
            <Table
              columns={columns}
              rows={rows}
              html={more}
              // html2={simulators}
              html3={status}
              page={devicesListPage}
              totalPages={devicesListTotalPages}
              totalDocuments={totalDocuments}
              handleChange={handleListChangePage}
              height="calc(100vh - 475px)"
              pageSize={10}
              sort={sort}
              setSort={setSort}
              sortedFields={sortedFields}
              keys={keys}
              groupAsset={true}
              assets={assets}
              setAssets={setAssets}
              unattachedDevices={unattachedDevices}
            />
          )}
        </DialogContent>
        <DialogActions>
          {addLoader ? null : (
            <Button onClick={handlepopupClose} color="error">
              Cancel
            </Button>
          )}
          {addLoader ? (
            <CircularProgress
              color="secondary"
              size={20}
              style={{ position: "relative", right: "20px", bottom: "5px" }}
            />
          ) : (
            <Button
              type="submit"
              color="secondary"
              onClick={() => {
                setAddLoader(true);
                handleDevice(
                  true,
                  assets.map((a) => a._id)
                );
              }}
              disabled={assets.length < 1}
            >
              Add
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <Dialog
        open={openPopupParentChild}
        onClose={handlepopupCloseParentChild}
        aria-labelledby="form-dialog-title"
        PaperProps={{
          style: {
            maxWidth: "80vw",
            width: "80vw",
            // height:'75vh'
          },
        }}
      >
        <DialogTitle>
          Manage Child Asset for {selectedAsset?.name} {disableSaveButton}
        </DialogTitle>
        {!devicesList.isFetching ? (
          <TextField
            variant="outlined"
            margin="dense"
            fullWidth
            size="small"
            label="Search"
            onChange={handleSearch}
            style={{ margin: "0px 2%", width: "96%" }}
            value={search}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "grey" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <TuneIcon
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      setAnchorEl(e.currentTarget);
                      setFiltering(true);
                    }}
                  />
                </InputAdornment>
              ),
            }}
          />
        ) : null}
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
              layoutPermission={solution.solutionLayout?.map}
              doneFilter={doneFilter}
            />
          </Popover>
        </span>
        <DialogContent
          style={{
            overflow: "hidden",
            padding: "2% 2% 0% 2%",
            textAlign: "center",
          }}
        >
          {devicesList.isFetching || allDevicesList.isFetching ? (
            <CircularProgress
              color="secondary"
              size={50}
              sx={{ marginTop: "6%" }}
            />
          ) : (
            <Table
              columns={columns}
              rows={rows}
              html={more}
              // html2={simulators}
              html3={status}
              page={devicesListPage}
              totalPages={devicesListTotalPages}
              totalDocuments={totalDocuments}
              handleChange={handleListChangePage}
              height="calc(100vh - 475px)"
              pageSize={10}
              sort={sort}
              setSort={setSort}
              sortedFields={sortedFields}
              keys={keys}
              groupAsset={false}
              assets={assets}
              setAssets={setAssets}
              unattachedDevices={unattachedDevices}
              selectDevice={selectDevice}
            />
          )}
        </DialogContent>
        <DialogActions>
          {addLoader ? null : (
            <Button onClick={handlepopupCloseParentChild} color="error">
              Cancel
            </Button>
          )}
          {addLoader ? (
            <CircularProgress
              color="secondary"
              size={20}
              style={{ position: "relative", right: "20px", bottom: "5px" }}
            />
          ) : (
            <Button
              type="submit"
              color="secondary"
              onClick={() => {
                setAddLoader(true);
                updateDeviceChildren();
              }}
              disabled={disableSaveButton}
            >
              Save
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <Dialog open={openChildAssetsDelinkModal} onClose={reject}>
        <DialogTitle id="alert-dialog-title">
          Remove Asset from group{" "}
          {props?.selectedGroup && props?.selectedGroup?.name}
        </DialogTitle>
        <DialogContent style={{ overflow: "hidden" }}>
          <DialogContentText id="alert-dialog-description">
            {editResult.isLoading ? (
              <div
                style={{
                  width: "15vw",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress />
              </div>
            ) : (
              <span style={{ display: "flex", flexDirection: "column" }}>
                This will remove {selectedAsset?.name} from group{" "}
                {props?.selectedGroup && props?.selectedGroup?.name}
                <span>
                  <Checkbox
                    style={{ paddingLeft: "0" }}
                    checked={deLinkHerarchi}
                    {...checkboxLabel}
                    onClick={() => setDeLinkHerarchi(!deLinkHerarchi)}
                  />{" "}
                  Also dissociate hierarchy?
                </span>
              </span>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={reject} color="error">
            Cancel
          </Button>
          <Button onClick={() => accept()} color="secondary">
            <span>Proceed</span>
          </Button>
        </DialogActions>
      </Dialog>
      <div
        style={{
          width: "100%",
          marginRight: "20px",
          position: "relative",
        }}
        onClick={(e) => setSelected([])}
      >
        <h4
          style={{
            color: "#bfbec8",
            margin: "10px 10px 20px 10px",
          }}
        >
          <strong>Assets</strong>
        </h4>

        {/* <TextField
          variant="outlined"
          margin="dense"
          fullWidth
          size="small"
          label="Search"
          onChange={handleSearch}
          style={{ marginBottom: "30px" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon style={{ color: "grey" }} />
              </InputAdornment>
            ),
          }}
        /> */}
        <div style={{ height: "calc(100vh - 370px)" }}>
          {devices.isLoading  ? (
            <Loader />
          ) : (
            <Fragment>
              {props.id != "0" ? (
                <Fragment>
                  {attachedDevices.length > 0 ? (
                    <Fragment>
                      <div
                        style={{
                          height: "calc(100vh - 270px)",
                          overflow: "auto",
                        }}
                      >
                        <Grid container spacing={5}>
                          {metaDataValue.groupPermissions[props.solution] ==
                            "ALL" &&
                          metaDataValue.appPaths.find(
                            (a) => a.name == "Group Management"
                          ).permission == "ALL" ? (
                            <Grid item xs={12} sm={6} md={4} lg={2}>
                              <div
                                className={classes.device}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  height: "100%",
                                  width: "100%",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlepopupOpen();
                                }}
                              >
                                <AddCircleIcon
                                  style={{ cursor: "pointer" }}
                                  color="secondary"
                                  fontSize="large"
                                />
                                <p
                                  style={{
                                    color: "#666666",
                                    fontSize: "12px",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  <b>Add Asset(s)</b>
                                </p>
                              </div>
                            </Grid>
                          ) : null}
                          {attachedDevices.map((elm) => (
                            <Grid item xs={12} sm={6} md={4} lg={2}>
                              <Grid
                                container
                                className={classes.device}
                                style={{
                                  position: "relative",
                                  alignItems: "start",
                                  border:
                                    selectedAsset?._id === elm._id
                                      ? `1px solid ${metaDataValue.branding.secondaryColor}`
                                      : "1px solid #D3D3D3",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClick(elm._id);
                                  setSelectedAsset(elm);
                                }}
                              >
                                <Grid
                                  item
                                  xs={12}
                                  sm={12}
                                  md={
                                    elm?.childDevices &&
                                    elm?.childDevices?.length
                                      ? 5
                                      : 12
                                  }
                                  style={{
                                    display: "flex",
                                    textAlign: "center",
                                    justifyContent: "center",
                                    marginTop: "6px",
                                  }}
                                >
                                  <div>
                                    <FontAwesomeIcon
                                      icon={faHdd}
                                      style={{
                                        color:
                                          metaDataValue.branding.primaryColor,
                                        width: "40px",
                                        height: "40px",
                                      }}
                                    />
                                    <p
                                      style={{
                                        color: "#666666",
                                        fontSize: "12px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      <b>
                                        {elm.name.length < 20
                                          ? elm.name
                                          : elm.name.slice(0, 20) + "..."}
                                      </b>
                                    </p>
                                    <p style={{ color: "", fontSize: "10px" }}>
                                      ({elm.internalId})
                                    </p>
                                  </div>
                                </Grid>
                                <Grid
                                  item
                                  xs={12}
                                  sm={12}
                                  md={7}
                                  style={{
                                    justifyContent: "center",
                                    display: "flex",
                                    textAlign: "center",
                                  }}
                                >
                                  {elm?.childDevices &&
                                  elm?.childDevices?.length ? (
                                    <>
                                      <div
                                        style={{
                                          width: "100%",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <span
                                          style={{
                                            color: "rgb(191, 190, 200)",
                                            fontSize: "15px",
                                          }}
                                        >
                                          Child Assets (
                                          {elm?.childDevices?.length})
                                        </span>
                                        <div
                                          style={{
                                            maxHeight: "5rem",
                                            overflow: "auto",
                                            textAlign: "left",
                                          }}
                                        >
                                          {elm?.childDevices &&
                                            elm?.childDevices.map((elm) => (
                                              <CustomTooltip {...elm}>
                                                <div
                                                  style={{
                                                    color: "rgb(85, 85, 85)",
                                                    fontSize: "12px",
                                                  }}
                                                >
                                                  {elm.name}
                                                </div>
                                              </CustomTooltip>
                                            ))}
                                        </div>
                                      </div>
                                    </>
                                  ) : null}
                                </Grid>
                              </Grid>
                            </Grid>
                          ))}
                        </Grid>
                      </div>
                      {attachedDevices.length > 0 ? (
                        <div
                          style={{
                            margin: "10px",
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Pagination
                            color="secondary"
                            count={devicesTotalPages}
                            page={devicesPage}
                            onChange={handleChangePage}
                          />
                        </div>
                      ) : null}
                    </Fragment>
                  ) : metaDataValue.groupPermissions[props.solution] == "ALL" &&
                    metaDataValue.appPaths.find(
                      (a) => a.name == "Group Management"
                    ).permission == "ALL" ? (
                    <div
                      style={{
                        display: "flex",
                        height: "100%",
                        width: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <div
                        className={classes.device}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          height: "200px",
                          width: "200px",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlepopupOpen();
                        }}
                      >
                        <AddCircleIcon
                          style={{
                            height: "70px",
                            width: "70px",
                          }}
                          color="secondary"
                        />
                        <p
                          style={{
                            color: metaDataValue.branding.secondaryColor,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            marginTop: "10px",
                          }}
                        >
                          <b>Add Asset(s)</b>
                        </p>
                      </div>
                    </div>
                  ) : null}
                </Fragment>
              ) : (
                <div
                  style={{
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    display: "flex",
                    flexDirection: "column",
                    color: "#c8c8c8",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faHdd}
                    style={{
                      color: "#c8c8c8",
                      width: "100px",
                      height: "100px",
                    }}
                  />
                  <p>No Group Selected</p>
                </div>
              )}
            </Fragment>
          )}
        </div>
        {metaDataValue.groupPermissions[props.solution] == "ALL" &&
        metaDataValue.appPaths.find((a) => a.name == "Group Management")
          .permission == "ALL" ? (
          <>
            <div
              style={{
                position: "absolute",
                bottom: "0px",
                right: "0px",
                marginTop: "20px",
              }}
            >
              <Button
                variant="contained"
                startIcon={<DeleteIcon />}
                color="error"
                disabled={!selectedAsset}
                onClick={() => {
                  if (
                    selectedAsset?.childDevices &&
                    selectedAsset.childDevices.length
                  ) {
                    setOpenChildAssetsDelinkModal(true);
                  } else {
                    handleDevice(false, selected);
                  }
                }}
              >
                Remove Assets
              </Button>
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "0px",
                right: "13rem",
                marginTop: "20px",
              }}
            >
              <Button
                variant="contained"
                color="primary"
                disabled={!selectedAsset}
                onClick={() => {
                  handleChildrenPopupOpen();
                }}
              >
                Manage Child Assets
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </Fragment>
  );
}
