//----------------CORE-----------------//
import React, { Fragment, useEffect, useState } from "react";
import { setService, resetService } from "rtkSlices/ServiceCreatorSlice";
import { useSelector, useDispatch } from "react-redux";
import { useSnackbar } from "notistack";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
//----------------MUI-----------------//
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
//----------------MUI ICONS-----------------//
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import MapIcon from "@mui/icons-material/Map";
import VerifiedIcon from "@mui/icons-material/Verified";
import ImageIcon from "@mui/icons-material/Image";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import SpeedIcon from "@mui/icons-material/Speed";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import ViewQuiltIcon from "@mui/icons-material/ViewQuilt";
//----------------EXTERNAL-----------------//
import Street from "assets/img/street.png";
import Light from "assets/img/light.png";
import Dark from "assets/img/dark.png";
import EnergyManagement from "assets/img/energy.png";
import Satellite from "assets/img/satellite.png";
import { useGetSignedUsersQuery, useUploadUserMutation } from "services/user";
import CloseIcon from "@mui/icons-material/Close";
import Pin from "assets/img/location-pin.png";
import AirPurifier from "../../../assets/img/air-purifier.png";
import Esb from "assets/img/esb.png";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";

export default function Catalogue(props) {
  console.log({props})
  const metaDataValue = useSelector((state) => state.metaData);
  let token = window.localStorage.getItem("token");
  const dispatch = useDispatch();
  const serviceValue = useSelector((state) => state.serviceCreator);
  console.log({serviceValue})
  const [selectedLayout, setSelectedLayout] = useState(
    props.dashboardView || 0
  );
  const [datapointName, setDatapointName] = useState(
    serviceValue.dataPointThresholds.map((e) => e.dataPoint)
  );

  function sortArray(data, template) {
    let arr = JSON.parse(JSON.stringify(data));
    arr.forEach((tab) => {
      let foundIndex = template.findIndex((t) => t == tab.value);
      if (foundIndex != -1) {
        tab.position = parseInt(foundIndex);
      }
    });
    arr.sort(function (a, b) {
      return a["position"] - b["position"];
    });
    return arr;
  }

  const [columnsArray, setColumnsArray] = useState(
    sortArray(
      [
        { name: "Device Info", value: "deviceInfo" },
        {
          name: "Monitoring Values",
          value: "datapoints",
        },
        {
          name: "Custom Attributes  ",
          value: "metaTags",
        },
      ],
      serviceValue.map.columns
    )
  );

  const [hovered, setHovered] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [datapoints, setDatapoints] = useState(
    props.widgetDatapoints || {
      energyConsumption: {
        name: "",
        id: "",
      },
      frequency: {
        name: "",
        id: "",
      },
      powerFactor: {
        name: "",
        id: "",
      },
    }
  );
  const [aggregationType, setAggregationType] = useState(props.widgetDatapoints?.aggregationType || "")
  const [openPopup, setOpenPopup] = useState(false);
  const [marker, setMarker] = useState({ file: "", img: "", url: "" });
  const signed = useGetSignedUsersQuery(
    {
      token: token,
      type: marker.file
        ? marker.file.name.split(".")[marker.file.name.split(".").length - 1]
        : "jpeg",
    },
    { skip: !marker.file }
  );
  const [upload, uploadResult] = useUploadUserMutation();

  useEffect(() => {
    if (!signed.isFetching && signed.isSuccess) {
      if (signed.data?.payload) {
        upload({ url: signed.data.payload, body: marker.file });
      }
    }
    if (signed.isError) {
      showSnackbar("Marker upload error", signed.error?.message, "error", 1000);
    }
  }, [signed.isFetching]);

  useEffect(() => {
    if (uploadResult.isSuccess) {
      let link = signed.data.payload.split("?")[0];
      setMarker({ ...marker, url: link });
      dispatch(
        setService({
          map: {
            ...serviceValue.map,
            marker: link,
          },
        })
      );
    }
    if (uploadResult.isError) {
      showSnackbar("Marker upload", uploadResult.error?.message, "error", 1000);
    }
  }, [uploadResult]);

  const { enqueueSnackbar } = useSnackbar();

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar(
      { title, message: message ? message : "Something went wrong", variant },
      { timeOut }
    );
  }

  const handleClick = (view) => {
    dispatch(
      setService({
        map: {
          ...serviceValue.map,
          default: view,
        },
      })
    );
  };

  function blobCreationFromURL(dataURI) {
    var byteString;
    if (dataURI.split(",")[0].indexOf("base64") >= 0)
      byteString = atob(dataURI.split(",")[1]);
    else byteString = unescape(dataURI.split(",")[1]);

    // separate out the mime component
    var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
  }

  function blobToFile(theBlob, fileName) {
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    theBlob.lastModifiedDate = new Date();
    theBlob.name = fileName;
    return theBlob;
  }

  const handleMarker = (e) => {
    const reader = new FileReader();
    let file = e.target.files[0];
    reader.readAsDataURL(file);

    reader.onload = function (event) {
      const imgElement = document.createElement("img");
      imgElement.src = event.target.result;
      // document.querySelector("#input").src = event.target.result;

      imgElement.onload = function (e) {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 550;

        const scaleSize = MAX_WIDTH / e.target.width;
        canvas.width = MAX_WIDTH;
        canvas.height = e.target.height * scaleSize;

        const ctx = canvas.getContext("2d");

        ctx.drawImage(e.target, 0, 0, canvas.width, canvas.height);

        const srcEncoded = ctx.canvas.toDataURL(e.target, file.type);
        var blobObject = blobCreationFromURL(srcEncoded);

        const fileReady = blobToFile(blobObject, file.name);
        setMarker({ file: fileReady, img: URL.createObjectURL(fileReady) });
        setRemoved(false);
      };
    };
  };

  const onDragEndColumns = (result) => {
    function swapElements(arr, i1, i2) {
      arr[i1] = arr.splice(i2, 1, arr[i1])[0];
    }

    if (!result.destination) return;
    const { source, destination } = result;
    const copiedItems = [...columnsArray];
    swapElements(copiedItems, source.index, destination.index);
    setColumnsArray(copiedItems);
    dispatch(
      setService({
        map: {
          ...serviceValue.map,
          columns: copiedItems.map((e) => e.value),
        },
      })
    );
  };

  const submitDatapoints = () => {
    setOpenPopup(false);
    dispatch(
      setService({
        widgetDatapoints: {...datapoints, aggregationType},
      })
    );
  };

  return (
    <Fragment> 
      <div
        style={{
          padding: "10px 5px",
          maxHeight: "calc(100vh - 286px)",
          minHeight: "calc(100vh - 286px)",
          overflowY: "scroll",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                maxWidth: "500px",
              }}
            >
              <p
                style={{
                  color: "#616161",
                  fontSize: "15px",
                }}
              >
                <b>Dashboard Layout</b>
              </p>
              <Divider />
              <div
                style={{
                  display: "flex",
                  gap: "5px",
                  margin: "15px 0px 25px 0px",
                  flexWrap: "wrap",
                }}
              >
                {[
                  { name: "General" },
                  { name: "Air Quality Monitoring", image: AirPurifier },
                  { name: "Aggregator Control Centre", image: Esb },
                  { name: "Energy Management", image: EnergyManagement },
                ].map((layout, i) => {
                  return (
                    <div
                      key={layout.name}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: "8px",
                          cursor: "pointer",
                          width: "150px",
                          height: "80px",
                          margin: "2px",
                          border:
                            selectedLayout == i
                              ? `2px solid ${metaDataValue.branding.secondaryColor}`
                              : "2px solid white",
                        }}
                        onClick={() => {
                          if (layout.name == "Energy Management") {
                            setOpenPopup(true);
                          }
                          else{
                            dispatch(
                              setService({
                                widgetDatapoints: {},
                              })
                            )
                            setDatapoints(props.widgetDatapoints || {
                              energyConsumption: {
                                name: "",
                                id: "",
                              },
                              frequency: {
                                name: "",
                                id: "",
                              },
                              powerFactor: {
                                name: "",
                                id: "",
                              },
                            })
                          }
                          dispatch(
                            setService({
                              layout: i,
                            })
                          );
                          setSelectedLayout(i);
                        }}
                      >
                        {i ? (
                          <img
                            src={layout.image}
                            style={{
                              maxWidth: "60px",
                              maxHeight: "60px",
                              borderRadius: "8px",
                              objectFit: "contain",
                            }}
                          />
                        ) : (
                          <ViewQuiltIcon
                            sx={{
                              color: "grey",
                              width: "60px",
                              height: "60px",
                            }}
                          />
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          marginTop: "5px",
                          fontWeight: "bold",
                          textAlign: "center",
                          color:
                            selectedLayout == i
                              ? metaDataValue.branding.secondaryColor
                              : "grey",
                        }}
                      >
                        {layout.name}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p
                style={{
                  color: "#616161",
                  fontSize: "15px",
                }}
              >
                <b>Asset Views</b>
              </p>
              <Divider />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "10px",
                  maxHeight: "33px",
                  margin: "20px 0 5px 0",
                }}
              >
                <p style={{ color: "#cccccc", fontWeight: "600" }}>
                  Default View
                </p>
                <span
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <Chip
                    size="small"
                    icon={
                      <FormatListBulletedIcon
                        fontSize="small"
                        style={{
                          marginLeft: "10px",
                          color:
                            serviceValue.map.default == "Table"
                              ? "White"
                              : metaDataValue.branding.secondaryColor,
                        }}
                      />
                    }
                    color="secondary"
                    variant="outlined"
                    style={{
                      backgroundColor:
                        serviceValue.map.default == "Table"
                          ? metaDataValue.branding.secondaryColor
                          : "",
                      minWidth: "60px",
                    }}
                    onClick={() => {
                      handleClick("Table");
                    }}
                    clickable
                  />
                  <Chip
                    size="small"
                    icon={
                      <AccountTreeIcon
                        fontSize="small"
                        style={{
                          marginLeft: "10px",
                          color:
                            serviceValue.map.default == "Group"
                              ? "White"
                              : metaDataValue.branding.secondaryColor,
                        }}
                      />
                    }
                    color="secondary"
                    variant="outlined"
                    style={{
                      backgroundColor:
                        serviceValue.map.default == "Group"
                          ? metaDataValue.branding.secondaryColor
                          : "",
                      minWidth: "60px",
                    }}
                    onClick={() => {
                      handleClick("Group");
                    }}
                    clickable
                  />
                  <Chip
                    size="small"
                    icon={
                      <MapIcon
                        fontSize="small"
                        style={{
                          marginLeft: "10px",
                          color:
                            serviceValue.map.default == "Map"
                              ? "White"
                              : metaDataValue.branding.secondaryColor,
                        }}
                      />
                    }
                    onClick={() => {
                      handleClick("Map");
                    }}
                    clickable
                    color="secondary"
                    variant="outlined"
                    style={{
                      backgroundColor:
                        serviceValue.map.default == "Map"
                          ? metaDataValue.branding.secondaryColor
                          : "",
                      minWidth: "60px",
                    }}
                  />
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  maxHeight: "33px",
                  margin: "20px 0 10px 0",
                }}
              >
                <p style={{ color: "#cccccc", fontWeight: "600" }}>Columns</p>
                <DragDropContext
                  onDragEnd={(result) => onDragEndColumns(result)}
                >
                  <Droppable
                    droppableId={"columns"}
                    key={"columns"}
                    direction="horizontal"
                  >
                    {(provided, snapshot) => {
                      return (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          {columnsArray.map((elm, index) => {
                            return (
                              <Draggable
                                key={elm.value}
                                draggableId={elm.value}
                                index={index}
                              >
                                {(provided, snapshot) => {
                                  return (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor:
                                          serviceValue.map.columns.indexOf(
                                            elm.value
                                          ) != -1
                                            ? metaDataValue.branding
                                                .secondaryColor
                                            : "#f5f5f5",
                                        borderRadius: "10px",
                                        border: `1px solid ${metaDataValue.branding.secondaryColor}`,
                                        cursor: "pointer",
                                        transition: "0.3s",
                                        userSelect: "none",
                                        cursor: "grab",
                                        ...provided.draggableProps.style,
                                      }}
                                      onClick={() => {
                                        let old = [...serviceValue.map.columns];
                                        let index = serviceValue.map.columns.indexOf(
                                          elm.value
                                        );
                                        if (index == -1) {
                                          old.push(elm.value);
                                        } else {
                                          old.splice(index, 1);
                                        }
                                        dispatch(
                                          setService({
                                            map: {
                                              ...serviceValue.map,
                                              columns: old,
                                            },
                                          })
                                        );
                                      }}
                                    >
                                      <p
                                        style={{
                                          color:
                                            serviceValue.map.columns.indexOf(
                                              elm.value
                                            ) != -1
                                              ? "white"
                                              : "grey",
                                          fontSize: "10px",
                                          margin: "5px",
                                          userSelect: "none",
                                          transition: "0.3s",
                                          overflow: "hidden",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        <b>{elm.name}</b>
                                      </p>
                                    </div>
                                  );
                                }}
                              </Draggable>
                            );
                          })}
                        </div>
                        // <div
                        //   {...provided.droppableProps}
                        //   ref={provided.innerRef}
                        //   style={{
                        //     padding: 4,
                        //   }}
                        // >
                        //   {serviceValue.persist.meta.length
                        //     ? serviceValue.persist.meta.map(
                        //         (meta, index) => {
                        //           return (
                        //             <Draggable
                        //               key={meta._id}
                        //               draggableId={meta._id}
                        //               index={index}
                        //             >
                        //               {(provided, snapshot) => {
                        //                 return (
                        //                   <div
                        //                     ref={provided.innerRef}
                        //                     {...provided.draggableProps}
                        //                     {...provided.dragHandleProps}
                        //                     style={{
                        //                       userSelect: "none",
                        //                       cursor: "grab",
                        //                       ...provided.draggableProps
                        //                         .style,
                        //                     }}
                        //                   >
                        //                     <Attributes
                        //                       meta={meta}
                        //                       updateDefaultValue={
                        //                         updateDefaultValue
                        //                       }
                        //                       id={meta._id}
                        //                       removeMeta={removeMeta}
                        //                       edit={true}
                        //                     />
                        //                   </div>
                        //                 );
                        //               }}
                        //             </Draggable>
                        //           );
                        //         }
                        //       )
                        //     : null}
                        // </div>
                      );
                    }}
                  </Droppable>
                </DragDropContext>
              </div>

              <p
                style={{
                  color: "#616161",
                  fontSize: "15px",
                }}
              >
                <b>Map</b>
              </p>
              <Divider />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  maxHeight: "33px",
                  margin: "35px 0 5px 0",
                }}
              >
                <p style={{ color: "#cccccc", fontWeight: "600" }}>Map Modes</p>
                <span
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "20px",
                  }}
                >
                  {[
                    { image: Street, name: "Street View", value: "street" },
                    { image: Light, name: "Light View", value: "light" },
                    {
                      image: Satellite,
                      name: "Satellite",
                      value: "satellite",
                    },
                    { image: Dark, name: "HeatMap", value: "heat" },
                  ].map((elm) => (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        position: "relative",
                      }}
                    >
                      {serviceValue.map.mapModes.indexOf(elm.value) != -1 &&
                      elm.value != "heat" ? (
                        <Tooltip
                          title="Default"
                          placement="top"
                          arrow
                          TransitionComponent={Zoom}
                        >
                          <VerifiedIcon
                            color="primary"
                            style={{
                              position: "absolute",
                              top: "3px",
                              right: "3px",
                              height: "15px",
                              width: "15px",
                              color:
                                elm.value != serviceValue.map.mapDefault
                                  ? "#cccccc"
                                  : "",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              dispatch(
                                setService({
                                  map: {
                                    ...serviceValue.map,
                                    mapDefault: elm.value,
                                  },
                                })
                              )
                            }
                          />
                        </Tooltip>
                      ) : null}
                      <div
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "10px",
                          backgroundImage: `url(${elm.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          cursor: "pointer",
                          opacity:
                            serviceValue.map.mapModes.indexOf(elm.value) != -1
                              ? "1"
                              : "0.7",
                          border:
                            serviceValue.map.mapModes.indexOf(elm.value) != -1
                              ? `2px solid ${metaDataValue.branding.secondaryColor}`
                              : "",
                          marginTop: "25px",
                        }}
                        onClick={() => {
                          let mapDefault = serviceValue.map.mapDefault;
                          let old = [...serviceValue.map.mapModes];
                          let index = serviceValue.map.mapModes.indexOf(
                            elm.value
                          );
                          if (index == -1) {
                            old.push(elm.value);
                          } else {
                            if (
                              (old.length == 2 && old.indexOf("heat") == -1) ||
                              (old.length == 2 && elm.value == "heat")
                            ) {
                              old.splice(index, 1);
                            } else if (old.length > 2) old.splice(index, 1);
                            if (old.indexOf(mapDefault) == -1) {
                              for (const mode of old) {
                                if (mode != "heat") {
                                  mapDefault = mode;
                                  break;
                                }
                              }
                            }
                          }
                          dispatch(
                            setService({
                              map: {
                                ...serviceValue.map,
                                mapModes: old,
                                mapDefault,
                              },
                            })
                          );
                        }}
                      />
                      <p style={{ fontSize: "10px", fontWeight: "600" }}>
                        {elm.name}
                      </p>
                    </div>
                  ))}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  maxHeight: "33px",
                  margin: "55px 0 5px 0",
                }}
              >
                <p style={{ color: "#cccccc", fontWeight: "600" }}>
                  Marker Icon
                </p>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                  }}
                >
                  {signed.isLoading || uploadResult.isLoading ? (
                    <CircularProgress
                      color="secondary"
                      style={{
                        height: "25px",
                        width: "25px",
                      }}
                    />
                  ) : (
                    <div
                      onMouseEnter={() => setHovered(true)}
                      onMouseLeave={() => setHovered(false)}
                      style={{ width: "50px", height: "50px" }}
                    >
                      {!(
                        (marker.file || serviceValue.map?.marker) &&
                        !removed
                      ) ? (
                        // <FmdGoodIcon
                        //   size={30}
                        //   style={{ fontSize: "50px", cursor: "pointer" }}
                        //   onClick={() =>
                        //     document.getElementById("marker-img").click()
                        //   }
                        // />
                        <img
                          src={Pin}
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            document.getElementById("marker-img").click()
                          }
                        />
                      ) : null}
                      <input
                        style={{ display: "none" }}
                        type="file"
                        id="marker-img"
                        onChange={(e) => {
                          let type = e.target.files[0].type.toLowerCase();
                          if (
                            !(
                              type.toLowerCase().includes("image/png") ||
                              type.toLowerCase().includes("image/jpeg") ||
                              type.toLowerCase().includes("image/jpg")
                            )
                          ) {
                            showSnackbar(
                              "Marker Image",
                              "Selected file format is not supported",
                              "error",
                              1000
                            );
                            return;
                          }
                          handleMarker(e);
                        }}
                      />
                      {(marker.file || serviceValue.map?.marker) && !removed ? (
                        <img
                          onClick={() =>
                            document.getElementById("marker-img").click()
                          }
                          src={marker?.img || serviceValue.map?.marker}
                          style={{
                            cursor: "pointer",
                            marginLeft: "15px",
                            width: "32px",
                            height: "33px",
                            borderRadius: "10%",
                            marginTop: "7px",
                          }}
                        />
                      ) : null}
                      {hovered &&
                      (marker.file || serviceValue.map?.marker) &&
                      !removed ? (
                        <CloseIcon
                          color="error"
                          sx={{
                            fontSize: 13,
                            cursor: "pointer",
                            position: "relative",
                            top: "-40px",
                            marginLeft: "45px",
                          }}
                          onClick={() => {
                            setMarker({ file: "", img: "", url: "" });
                            setRemoved(true);
                            let tempMap = JSON.parse(
                              JSON.stringify(serviceValue.map)
                            );
                            delete tempMap.marker;
                            dispatch(setService({ map: tempMap }));
                          }}
                        />
                      ) : null}
                    </div>
                  )}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  maxHeight: "33px",
                  margin: "25px 0 5px 0",
                }}
              >
                <p style={{ color: "#cccccc", fontWeight: "600" }}>
                  Default View
                </p>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Chip
                      size="small"
                      icon={
                        <HealthAndSafetyIcon
                          fontSize="small"
                          style={{
                            marginLeft: "10px",
                            color:
                              serviceValue.map.markerDefault == "Health"
                                ? "White"
                                : metaDataValue.branding.secondaryColor,
                          }}
                        />
                      }
                      color="secondary"
                      variant="outlined"
                      style={{
                        backgroundColor:
                          serviceValue.map.markerDefault == "Health"
                            ? metaDataValue.branding.secondaryColor
                            : "",
                        minWidth: "60px",
                      }}
                      onClick={() => {
                        dispatch(
                          setService({
                            map: {
                              ...serviceValue.map,
                              markerDefault: "Health",
                            },
                          })
                        );
                      }}
                      clickable
                    />

                    {datapointName.length ? (
                      <Chip
                        size="small"
                        icon={
                          <SpeedIcon
                            fontSize="small"
                            style={{
                              marginLeft: "10px",
                              color:
                                serviceValue.map.markerDefault == "Monitoring"
                                  ? "White"
                                  : metaDataValue.branding.secondaryColor,
                            }}
                          />
                        }
                        color="secondary"
                        variant="outlined"
                        style={{
                          backgroundColor:
                            serviceValue.map.markerDefault == "Monitoring"
                              ? metaDataValue.branding.secondaryColor
                              : "",
                          minWidth: "60px",
                        }}
                        onClick={() => {
                          dispatch(
                            setService({
                              map: {
                                ...serviceValue.map,
                                markerDefault: "Monitoring",
                              },
                            })
                          );
                        }}
                        clickable
                      />
                    ) : null}

                    <Chip
                      size="small"
                      icon={
                        <CompareArrowsIcon
                          fontSize="small"
                          style={{
                            marginLeft: "10px",
                            color:
                              serviceValue.map.markerDefault == "Connectivity"
                                ? "White"
                                : metaDataValue.branding.secondaryColor,
                          }}
                        />
                      }
                      color="secondary"
                      variant="outlined"
                      style={{
                        backgroundColor:
                          serviceValue.map.markerDefault == "Connectivity"
                            ? metaDataValue.branding.secondaryColor
                            : "",
                        minWidth: "60px",
                      }}
                      onClick={() => {
                        dispatch(
                          setService({
                            map: {
                              ...serviceValue.map,
                              markerDefault: "Connectivity",
                            },
                          })
                        );
                      }}
                      clickable
                    />

                    <Chip
                      size="small"
                      icon={
                        <ImageIcon
                          fontSize="small"
                          style={{
                            marginLeft: "10px",
                            color:
                              serviceValue.map.markerDefault == "Marker"
                                ? "White"
                                : metaDataValue.branding.secondaryColor,
                          }}
                        />
                      }
                      color="secondary"
                      variant="outlined"
                      style={{
                        backgroundColor:
                          serviceValue.map.markerDefault == "Marker"
                            ? metaDataValue.branding.secondaryColor
                            : "",
                        minWidth: "60px",
                      }}
                      onClick={() => {
                        dispatch(
                          setService({
                            map: {
                              ...serviceValue.map,
                              markerDefault: "Marker",
                            },
                          })
                        );
                      }}
                      clickable
                    />
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Divider />
      <Dialog open={openPopup} aria-labelledby="form-dialog-title">
        <DialogTitle>Add Datapoints for Dashboard Widgets</DialogTitle>
        <DialogContent>
          <InputLabel>Energy Consumption</InputLabel>
          <Select
            fullWidth
            label="Energy Consumption"
            name="kwh"
            value={datapoints.energyConsumption.id}
            onChange={(e) => {
              console.log({ e });
              let name = serviceValue.datapoints.find(
                (d) => d.id == e.target.value
              ).name;
              setDatapoints({
                ...datapoints,
                energyConsumption: { name, id: e.target.value },
              });
            }}
            required
          >
            {serviceValue.datapoints.map((dp) => {
              return <MenuItem value={dp.id}>{dp.friendlyName}</MenuItem>;
            })}
          </Select>
          <InputLabel>Energy Consumption Hourly Aggregation</InputLabel>
          <Select
            fullWidth
            label="Energy Consumption Aggregation"
            name="agg"
            value={aggregationType}
            onChange={(e) => {
              setAggregationType(e.target.value)
            }}
            required
          >
            <MenuItem value="sum">Sum</MenuItem>
            <MenuItem value="avg">Average</MenuItem>
          </Select>
          <Divider style={{margin:'10px 0px'}} />
          <InputLabel>Power Factor</InputLabel>
          <Select
            fullWidth
            label="Power Factor"
            name="pf"
            value={datapoints.powerFactor.id}
            onChange={(e) => {
              console.log({ e });
              let name = serviceValue.datapoints.find(
                (d) => d.id == e.target.value
              ).name;
              setDatapoints({
                ...datapoints,
                powerFactor: { name, id: e.target.value },
              });
            }}
            required
          >
            {serviceValue.datapoints.map((dp) => {
              return <MenuItem value={dp.id}>{dp.friendlyName}</MenuItem>;
            })}
          </Select>
          <InputLabel>Frequency</InputLabel>
          <Select
            fullWidth
            label="Frequency"
            name="hz"
            value={datapoints.frequency.id}
            onChange={(e) => {
              console.log({ e });
              let name = serviceValue.datapoints.find(
                (d) => d.id == e.target.value
              ).name;
              setDatapoints({
                ...datapoints,
                frequency: { name, id: e.target.value },
              });
            }}
            required
          >
            {serviceValue.datapoints.map((dp) => {
              return <MenuItem value={dp.id}>{dp.friendlyName}</MenuItem>;
            })}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            if((!datapoints.energyConsumption.id && !datapoints.frequency.id && !datapoints.powerFactor.id) || (!Object.keys(serviceValue.widgetDatapoints).length)){
              dispatch(
                setService({
                  layout: 0,
                })
              );
              setSelectedLayout(0);
             
            }
            setDatapoints(Object.keys(serviceValue.widgetDatapoints).length ? serviceValue.widgetDatapoints : {
              energyConsumption: {
                name: "",
                id: "",
              },
              frequency: {
                name: "",
                id: "",
              },
              powerFactor: {
                name: "",
                id: "",
              },
            })
           
            setOpenPopup(false)}} color="error">
            Cancel
          </Button>
          <Button onClick={submitDatapoints} color="secondary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          position: "relative",
          top: "10px",
        }}
      >
        {props.edit ? (
          <Button
            color="error"
            id="cancel"
            onClick={() => {
              dispatch(resetService());
              props.setSelected(null);
            }}
          >
            Cancel
          </Button>
        ) : null}
        <Button
          color="secondary"
          onClick={() =>
            dispatch(
              setService({
                page: 5,
              })
            )
          }
        >
          Back
        </Button>

        {props.edit ? (
          <Button
            color="secondary"
            id="save"
            onClick={props.handleSave}
            disabled={signed.isLoading || uploadResult.isLoading}
          >
            Save
          </Button>
        ) : (
          <Button
            color="secondary"
            id="next"
            onClick={() => {
              dispatch(
                setService({
                  page: 7,
                })
              );
            }}
            disabled={signed.isLoading || uploadResult.isLoading}
          >
            Next
          </Button>
        )}
      </div>
    </Fragment>
  );
}
