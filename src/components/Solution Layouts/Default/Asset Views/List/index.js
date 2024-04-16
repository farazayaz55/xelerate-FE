//---------CORE---------//
import React, { useState, useEffect, Fragment, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import hexRgb from "hex-rgb";
//---------EXTERNAL---------//
import Table from "components/Table/newTable";
import Loader from "components/Progress";
import Simulators from "./Simulators";
import { setListPage } from "rtkSlices/AssetViewSlice";
import { useGetDevicesQuery, useGetNotesQuery } from "services/devices";
import { getMonitoringValues } from "Utilities/Monitoring Widgets";
import { Link } from "react-router-dom";

import GroupsView from "./Groups View";
import NotesIcon from "assets/img/notes.png";
import { styled } from "@mui/material/styles";
import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import { CircularProgress, IconButton } from "@mui/material";
import emitter from "Utilities/events";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { setFilter } from "rtkSlices/filterDevicesSlice";

export default function ListView(props) {
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
  const dispatch = useDispatch();
  const [rows, setRowState] = useState([]);
  const [isLoading,setIsLoading]=useState(true)
  const [sort, setSort] = useState({
    html: 1,
    firmware: 1,
    serialNumber: 1,
    imei: 1,
    lastUpdated: 1,
  });
  const [sortedFields, setSortedFields] = useState({ createdAt: -1 });
  let token = window.localStorage.getItem("token");
  const metaDataValue = useSelector((state) => state.metaData);
  const service = metaDataValue.services.find((s) => s.id == props.id)
  let sensors = filtersValue?.sensors ? filtersValue.sensors :
    props.config == "ALL"
      ? [...props.sensors, ...props.configSensors]
      : props.sensors;
  const filtersValue = useSelector((state) => state.filterDevice);
  const page = useSelector((state) => state.assetView.listPage);
  const [columns, setColumns] = useState([]);
  const [rgb, setRgb] = React.useState(
    hexRgb(metaDataValue.branding.primaryColor)
  );
  const [totalPages, setTotalPages] = useState(0);
  const [totalDocuments, setTotalDocuments] = useState(null);
  const [expandedGroup, setExpandedGroup] = useState("");
  const [notes, setNotes] = useState([]);
  const [expandedDevices, setExpandedDevices] = useState([])
  const { t } = useTranslation();
  const devices = useGetDevicesQuery(
    {
      token,
      group: props.id,
      params: `&withTotalPages=true&pagination=true&pageSize=10${
        Object.keys(sortedFields).length
          ? `&sort=${JSON.stringify(sortedFields)}`
          : ``
      }${!filtersValue.search ? `&currentPage=${page}` : ``}&search=${
        filtersValue.search
      }&searchFields=${JSON.stringify(
        filtersValue.searchFields
      )}&MeasurementFilter=${filtersValue.measurement}&connected=${
        filtersValue.connection
      }&alarms=${filtersValue.alarms}&associatedGroup=${
        filtersValue.group.id
      }&metaTags=${filtersValue.metaTags}&assetTypes=${filtersValue.assetTypes}&showChildren=${props.showHeirarchy}&showParent=${!props.showHeirarchy}`,
    },
    { skip: props.listView == "Group" }
  );

  const allDevices=  useGetDevicesQuery(
    {
      token,
      group: props.id,
      params: `&withTotalPages=true&pageSize=${totalDocuments==0?10:totalDocuments}${
        Object.keys(sortedFields).length
          ? `&sort=${JSON.stringify(sortedFields)}`
          : ``
      }${!filtersValue.search ? `&currentPage=1` : ``}&search=${
        filtersValue.search
      }&searchFields=${JSON.stringify(
        filtersValue.searchFields
      )}&MeasurementFilter=${filtersValue.measurement}&connected=${
        filtersValue.connection
      }&alarms=${filtersValue.alarms}&associatedGroup=${
        filtersValue.group.id
      }&metaTags=${filtersValue.metaTags}&assetTypes=${filtersValue.assetTypes}&showChildren=${props.showHeirarchy}&showParent=${!props.showHeirarchy}`,
    },
    { skip: (props.listView == "Group") || devices.isFetching  || totalDocuments==null }
  );

  const [loader, setLoader] = useState(false);
  const [hoveredDeviceId, setHoveredDeviceId] = useState("");
  const notesRes = useGetNotesQuery(
    {
      token,
      group: hoveredDeviceId,
    },
    { skip: !hoveredDeviceId }
  );

  function chkSimulator() {
    let ind = metaDataValue.apps.findIndex((m) => m.name == "Simulation");
    if (ind != -1) return true;
    else return false;
  }

  function handlePageChange(page) {
    dispatch(setListPage(page));
  }
  function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
  }
  
  
  const truncDecimalValues = (value,digits)=>{
    if(isNumber(parseFloat(value))){
      return Math.trunc(value*Math.pow(10, digits))/Math.pow(10, digits)
    }
    return value
  }
  function formatDevice(elm) {
    function getMetaValues(elm) {
      let perm = props.layoutPermission.columns.includes("metaTags");
      let meta = {};
      elm.metaTags.forEach((m) => {
        meta[m.key] = m.value;
      });
      return perm ? meta : [];
    }

    function getDatapointValues(elm) {
      let perm = props.layoutPermission.columns.includes("datapoints");
      let datapoints = {};
      if (elm.latestMeasurement) {
        sensors.forEach((sensor) => {
          let res;
          let l = sensor.name;
          if (
            elm.latestMeasurement[l] &&
            (elm.latestMeasurement[l].value ||
              elm.latestMeasurement[l].value == 0)
          ) {
            res = getMonitoringValues(
              sensor.type,
              sensor.metaData,
              elm.latestMeasurement[l].value,
              elm.latestMeasurement[l].unit
              );
            datapoints[l] = truncDecimalValues(res.value,1) + " " + res.unit;
          }
        });
        return perm ? datapoints : [];
      }
    }

    function getDeviceInfo(elm) {
      let perm = props.layoutPermission.columns.includes("deviceInfo");
      return perm
        ? {
            id: elm.internalId,
            firmware: elm.packetFromPlatform?.c8y_Firmware
              ? elm.packetFromPlatform?.c8y_Firmware?.version
              : "",
            serialNumber: elm.packetFromPlatform?.c8y_Hardware
              ? elm.packetFromPlatform.c8y_Hardware.serialNumber
              : "",
            imei: elm?.packetFromPlatform?.c8y_Mobile
              ? elm?.packetFromPlatform?.c8y_Mobile?.imei
              : "",
            iccid: elm?.packetFromPlatform?.c8y_Mobile
            ? elm?.packetFromPlatform?.c8y_Mobile?.iccid
            : "",
            imsi: elm?.packetFromPlatform?.c8y_Mobile
            ? elm?.packetFromPlatform?.c8y_Mobile?.imsi
            : "",
            msisdn: elm?.packetFromPlatform?.c8y_Mobile
            ? elm?.packetFromPlatform?.c8y_Mobile?.msisdn
            : "",
          }
        : [];
    }

    function createData(html, id) {
      return {
        html,
        id,
      };
    }

    function getChildDevices(elm) {
      if(elm.childDevices && elm.childDevices.length){
        return {
          childDevices: elm.childDevices,
          parentDevice: elm.parentDevice
        }
      }else {
        return []
      }
    }

    function getAssetType(elm) {
      return service.assets.length && service.assets.length > 1
        ? {
            assetType: elm?.platformDeviceType
              ? service.assets.find(
                  (asset) => asset.id == elm?.platformDeviceType
                )?.name
              : "NA",
            assetImage: elm?.platformDeviceType
              ? service.assets.find(
                  (asset) => asset.id == elm?.platformDeviceType
                )?.image
              : "NA",
          }
        : []
    }

    //Here
    let time = new Date(elm?.measurementUpdateTime);
    
    return {
      ...createData(elm.name, elm.internalId),
      ...getChildDevices(elm),
      ...getMetaValues(elm),
      ...getDeviceInfo(elm),
      ...getDatapointValues(elm),
      ...getAssetType(elm),
      ...{
        lastUpdated:
          time != "-"
            ? `${time.toLocaleDateString("en-GB")}-${time.toLocaleTimeString()}`
            : "",
        html3: elm?.packetFromPlatform?.c8y_Availability
          ? elm?.packetFromPlatform?.c8y_Availability?.status
          : "",
        childDevices: elm.childDevices,
        parentDevice: elm.parentDevice
      },
    };
  }

  function updateOld(elm, realtimeAction) {
    setRowState((prev) => {
      let old = [...prev];
      let ind = old.findIndex((e) => e.id == elm.internalId);
      if (realtimeAction == "UPDATE" && ind != -1) {
        old[ind] = formatDevice(elm);
      } else if (realtimeAction == "DELETE" && ind != -1) {
        old.splice(ind, 1);
      } else if (ind == -1 && page == 1 && realtimeAction == "CREATE") {
        old.unshift(formatDevice(elm));
      }
      return old;
    });
  }

  function callbackfn(payload) {
    let elm = payload.message;
    updateOld(elm, payload.realtimeAction);
  }

  useEffect(() => {
    emitter.on("solution?devices", callbackfn);

    return () => {
      emitter.off("solution?devices", callbackfn);
    };
  }, []);
  useEffect(() => {
    if (
      devices.isSuccess &&
      devices.data?.payload?.data &&
      props.listView != "Group"
    ) {
      dispatch(
        setFilter({
          totalDevices: devices.data.payload?.totalDocuments
      }))
      setTotalPages(devices.data.payload.totalPages?devices.data.payload.totalPages:1);
      setTotalDocuments(devices.data.payload.totalDocuments?devices.data.payload.totalDocuments: devices.data.payload?.data?.length);
      generateColumns();
    }
  }, [devices.isFetching]);

  useEffect(() => {
    if (
      allDevices.isSuccess &&
      allDevices.data?.payload?.data &&
      props.listView != "Group"
    ) {

      let data = allDevices.data.payload?.data;
      let temp = [];
      data.forEach((elm) => temp.push(formatDevice(elm)));
      setRowState(temp);
      setIsLoading(false)
    }
  }, [allDevices.isFetching]);

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
    if (!notesRes.isFetching && notesRes.isSuccess) {
      let temp = JSON.parse(JSON.stringify(notesRes.data.payload));
      temp.forEach((t) => {
        t.updatedAt =
          new Date(t.updatedAt).toLocaleDateString() +
          " " +
          new Date(t.updatedAt).toLocaleTimeString();
      });
      setNotes(temp);
      setLoader(false);
    }
    if (notesRes.isError) {
      showSnackbar("Notes", notesRes.error?.data?.message, "error", 1000);
    }
  }, [notesRes.isFetching]);

  function generateColumns(assets) {
    let tempColumns = [{ id: "html", label: t("Name"), align: "center" }];
    if(service.assets.length > 1){
      tempColumns = [
        ...tempColumns,
        { id: "assetType", label: t("Asset Type"), align: "center"},
      ]
    }
    if(service.parentChildEnabled){
      tempColumns = [
        ...tempColumns,
        {id: "heirarchy", label: t("Heirarchy"), align: "center"}
      ]
    }
    props.layoutPermission.columns.forEach((column) => {
      switch (column) {
        case "metaTags":
          let tempDevices = JSON.parse(
            JSON.stringify(devices?.data?.payload?.data)
          );
          let highestLen = Math.max(
            ...tempDevices.map((d) => d.metaTags.length)
          );
          if (tempDevices.find((d) => d.metaTags.length)) {
            let index = tempDevices.findIndex(
              (d) => d.metaTags.length == highestLen
            );
            let tags = JSON.parse(JSON.stringify(tempDevices[index].metaTags));
            tempColumns = [
              ...tempColumns,
              ...tags?.map((m) => {
                return { id: m.key, label: t(m.key), align: "center" };
              }),
            ];
          }
          break;

        case "deviceInfo":
          tempColumns = [
            ...tempColumns,
            ...[
              { id: "id", label: t("id"), align: "center" },
              { id: "firmware", label: t("Firmware"), align: "center" },
              {
                id: "serialNumber",
                label: t("Serial Number"),
                align: "center",
              },
              { id: "imei", label: t("IMEI"), align: "center" },
              { id: "imsi", label: t("IMSI"), align: "center" },
              { id: "iccid", label: t("ICCID"), align: "center" },
              { id: "msisdn", label: t("MSISDN"), align: "center" },
            ],
          ];

          break;

        case "datapoints":
          let temp = [];
          let serviceDatapoints = sensors.map((s) => ({
            name: s.name,
            friendlyName: s.friendlyName,
          }));
          let deviceList = assets || devices?.data?.payload?.data
          deviceList.map((d) => {
            if (d.latestMeasurement) {
              sensors.forEach((sensor) => {
                let l = sensor.name;
                if (
                  (!temp.find((t) => t.id == l) &&
                    serviceDatapoints.find((s) => s.name == l)) ||
                  !temp.length
                ) {
                  if (serviceDatapoints.find((s) => s.name == l)) {
                    let serivceFriendlyName = serviceDatapoints.find(
                      (s) => s.name == l
                    ).friendlyName;
                    temp.push({
                      id: l,
                      label: t(serivceFriendlyName),
                      align: "center",
                    });
                  } else {
                    temp.push({ id: l, label: t(l), align: "center" });
                  }
                }
              });
            }
          });
          tempColumns = [...tempColumns, ...temp];
          break;

        default:
          break;
      }
    });

    // if (
    //   perm.includes("metaTags") &&
    //   devices?.data?.payload?.data[0]?.metaTags
    // ) {
    //   let tags = JSON.parse(
    //     JSON.stringify(devices?.data?.payload?.data[0]?.metaTags)
    //   );
    //   // let ind = devices?.data?.payload?.data[0]?.metaTags.findIndex((m) =>
    //   //   m.key.toLowerCase().includes("id")
    //   // );
    //   // if (ind != -1) {
    //   //   tags.unshift(devices?.data?.payload?.data[0]?.metaTags[ind]);
    //   //   tags.splice(parseInt(ind) + 1, 1);
    //   // }
    //   tempColumns = [
    //     ...tempColumns,
    //     ...tags?.map((m) => {
    //       return { id: m.key, label: t(m.key), align: "center" };
    //     }),
    //   ];
    // }

    if (chkSimulator())
      tempColumns.push({
        id: "html2",
        label: t("Simulators"),
        align: "center",
      });

    tempColumns.push({
      id: "lastUpdated",
      label: t("Last Message"),
      align: "center",
    });
    if(assets){
      return tempColumns
    }else{
      setColumns(tempColumns);
    }
  }

  var simulators = (row) => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Simulators id={row.html2} group={props.id} />
      </div>
    );
  };

  var more = (row) => {
    const status = row.html3;
    let device = devices.data.payload?.data?.find(
      (d) => d.internalId == row.id
    );
    let result = "";
    function getNote(device) {
      if (!loader) {
        if (device.notes.length) {
          let count = 0;
          let tempNotes = [...device.notes];
          tempNotes
            .reverse()
            .slice(0, 5)
            .map((n) => {
              let note = notes.find((singleNote) => singleNote._id == n);
              if (note) {
                result += note?.firstName
                  ? `${note?.firstName + " " + note?.lastName} @ ${
                      note?.updatedAt
                    } : ${note?.note}\n`
                  : `${note?.updatedAt} : ${note?.note}\n`;
              }
            });
          if (tempNotes.reverse().length > 5) {
            result += `and more ...`;
          }
        }
      }
      return loader ? (
        <CircularProgress size={15} sx={{ color: "white" }} />
      ) : (
        <span style={{ whiteSpace: "pre-line", textTransform: "capitalize" }}>
          {result}
        </span>
      );
    }

    const CustomWidthTooltip = styled(({ className, ...props }) => (
      <Tooltip {...props} classes={{ popper: className }} />
    ))({
      [`& .${tooltipClasses.tooltip}`]: {
        maxWidth: "600px",
      },
    });

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "max-content",
        }}
      >
        {props.showHeirarchy && !row.parentDevice? (
            <IconButton disabled={!device?.childDevices.length}>
              {expandedDevices.includes(row.id) ? (
                <RemoveIcon fontSize="small" onClick={() => {setExpandedDevices(expandedDevices.filter((id) => id !== row.id))}} />
              ) : (
                <AddIcon fontSize="small" onClick={() => {setExpandedDevices([...expandedDevices, row.id])}}/>
              )}
            </IconButton>
          ) : null}
        <Link
          to={`/solutions/${props.link}/${row.id}/0`}
          style={{
            backgroundColor:
              status == "AVAILABLE"
                ? "rgb(76, 175, 80, 0.1)"
                : status == "UNAVAILABLE"
                ? "rgb(85, 85, 85,0.1)"
                : "rgb(186, 117, 216, 0.1)",
            padding: "10px",
            borderRadius: "10px",
            cursor: "pointer",
            width: "100%",
            textAlign: "initial",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            maxWidth: "250px",
          }}
          id={`device-${row.id}`}
        >
          <div
            style={{
              maxWidth: "8px",
              maxHeight: "8px",
              minWidth: "8px",
              minHeight: "8px",
              borderRadius: "50%",
              backgroundColor:
                status == "AVAILABLE"
                  ? "rgb(76, 175, 80)"
                  : status == "UNAVAILABLE"
                  ? "rgb(85, 85, 8)"
                  : "rgb(186, 117, 216)",
            }}
          />
          <p
            style={{
              // color: metaDataValue.branding.primaryColor,
              color:
                status == "AVAILABLE"
                  ? "#4caf50"
                  : status == "UNAVAILABLE"
                  ? "#555555"
                  : "#BA75D8",
              fontSize: "12px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            // onClick={moreDetails}
          >
            <b>{row.html}</b>
          </p>
        </Link>
        {device && device.notes && device.notes.length ? (
          <CustomWidthTooltip
            title={getNote(device)}
            placement="top"
            arrow
            sx={{ maxWidth: "800px" }}
          >
            <span
              onMouseEnter={() => {
                if (hoveredDeviceId != row.id) {
                  setLoader(true);
                }
                setHoveredDeviceId(row.id);
              }}
              style={{ cursor: "pointer" }}
            >
              <img
                src={NotesIcon}
                style={{
                  width: "20px",
                  height: "20px",
                  marginTop: "-2px",
                  marginLeft: "10px",
                }}
              />
            </span>
          </CustomWidthTooltip>
        ) : null}
      </div>
    );
  };

  return (
    <Fragment>
      {props.listView == "Table" ? (
        <>
          {isLoading || allDevices.isFetching || devices.isFetching ? (
            <Loader />
          ) : (
            <Table
              expandedDevices={expandedDevices}
              formatDevice={formatDevice}
              columns={columns}
              rows={rows}
              html={more}
              html2={simulators}
              page={page}
              totalPages={totalPages}
              totalDocuments={totalDocuments}
              handleChange={handlePageChange}
              height={
                props.open
                  ? props.emDashboard
                    ? "calc(100vh - 300px)"
                    : "calc(100vh - 201px)"
                  : "calc(100vh - 465px)"
              }
              paginationMargin={"3px"}
              minHeight="285px"
              assetList={true}
              pageSize={10}
              sticky
              sort={sort}
              setSort={setSort}
              sortedFields={sortedFields}
              keys={keys}
              generateColumns={generateColumns}
              showHeirarchy={props.showHeirarchy}
            />
          )}
        </>
      ) : (
        <GroupsView
          history={props.history}
          link={props.link}
          sensors={sensors}
          serviceId={props.id}
          layoutPermission={props.layoutPermission}
          color={props.color}
          open={props.open}
          emDashboard={props.emDashboard}
        />
      )}
    </Fragment>
  );
}
