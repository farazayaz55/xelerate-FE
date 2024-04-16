import React, { Fragment, useRef, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import RouterIcon from "@mui/icons-material/Router";
import { useSnackbar } from "notistack";
import { useCreateServiceMutation } from "services/services";
import { useAddDeviceMutation } from "services/devices";
import { useSelector, useDispatch } from "react-redux";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { setService } from "rtkSlices/ServiceCreatorSlice";
import { useFormik } from "formik";
import * as Yup from "yup";
import { setRole } from "rtkSlices/metaDataSlice";
import { useCreateEventMutation } from "services/events";
import { useGetSpecificRoleQuery } from "services/roles";
import mapboxgl from "!mapbox-gl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

mapboxgl.accessToken =
  "pk.eyJ1IjoiaW52aXhpYmxlZGV2IiwiYSI6ImNraXNvbGYwYjBtYWQyd3Njd2lkeTRsNnMifQ.M-WA639AR9Rcf52HgCa8UA";
let marker;
export default function Devices(props) {
  const dispatch = useDispatch();
  let token = window.localStorage.getItem("token");
  const { enqueueSnackbar } = useSnackbar();
  const serviceValue = useSelector((state) => state.serviceCreator);
  const [c8y_Position, setC8y_Position] = React.useState({
    lat: serviceValue.defaultLocation && serviceValue.defaultLocation.length ? serviceValue.defaultLocation[1] : 51.509865,
    lng: serviceValue.defaultLocation && serviceValue.defaultLocation.length ? serviceValue.defaultLocation[0] : -0.118092,
  });
  const metaDataValue = useSelector((state) => state.metaData);
  const [loader, setLoader] = React.useState(true);
  const [validLat, setValidLat] = React.useState(true);
  const [validLng, setValidLng] = React.useState(true);
  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar(
      { title, message: message ? message : "Something went wrong", variant },
      { timeOut }
    );
  }
  const [createEvent, createEventResult] = useCreateEventMutation();
  const [doneButton, setDoneButton] = React.useState("SKip");

  const mapContainer = useRef(null);
  const map = useRef(null);
  const [createService, serviceResult] = useCreateServiceMutation();
  const [createDevice, deviceResult] = useAddDeviceMutation();

  const roleRes = useGetSpecificRoleQuery(window.localStorage.getItem("role"), {
    skip: !serviceResult.isSuccess,
  });
  console.log('serviceValue', serviceValue)
  useEffect(() => {
    if (roleRes.isSuccess) {
      dispatch(setRole(roleRes.data.payload));
    }
  }, [roleRes.isFetching]);

  useEffect(() => {
    if (mapContainer.current) {
      console.log("setting map")
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: serviceValue.defaultLocation && serviceValue.defaultLocation.length ? serviceValue.defaultLocation : [-0.118092, 51.509865],
        zoom: 10,
      });



      if (marker) {
        marker.remove();
      }


      marker = new mapboxgl.Marker()
        .setLngLat(serviceValue.defaultLocation && serviceValue.defaultLocation.length ? serviceValue.defaultLocation : [-0.118092, 51.509865])
        .addTo(map.current);

      map.current.on("click", (e) => {
        if (marker) {
          marker.remove();
        }
        map.current.flyTo({
          center: [e.lngLat.lng, e.lngLat.lat],
        });
        setC8y_Position({
          lng: e.lngLat.lng,
          lat: e.lngLat.lat,
        });
        setValidLat(true);
        setValidLng(true);
        deviceForm.setFieldValue("lat", e.lngLat.lat);
        deviceForm.setFieldValue("lng", e.lngLat.lng);
        marker = new mapboxgl.Marker()
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .addTo(map.current);
      });


    }
  }, [mapContainer.current, loader]);

  const deviceForm = useFormik({
    initialValues: {
      name: "",
      firmware: "",
      imei: "",
      serial: "",
      lat: c8y_Position.lat,
      lng: c8y_Position.lng,
      platformDeviceType: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required field"),
    }),
    onSubmit: async (values) => {
      // if(!deviceResult.isLoading){
      let body = {
        name: values.name,
        serviceId: serviceValue.serviceId,
        firmwareVersion: values.firmware,
        imei: values.imei,
        serialNumber: values.serial,
        location: [c8y_Position.lng,c8y_Position.lat],
        platformDeviceType: values.platformDeviceType,
      };

      let added = await createDevice({ token, body });
      if (added) {
        setDoneButton("Done");
      }
      if (c8y_Position) {
        let eventsBody = {
          deviceId: added.data.payload.internalId,
          c8y_Position,
          text: "Asset location specified",
          type: "c8y_LocationUpdate",
          time: new Date(),
        };
        let created = await createEvent({ token, body: eventsBody });

        if (created) {
          // if (marker) {
          //   console.log('removing marjer')
          //   marker.remove();
          // }
          map.current.flyTo({
            center: serviceValue.defaultLocation && serviceValue.defaultLocation.length ? serviceValue.defaultLocation : [-0.118092, 51.509865],
          });
          setC8y_Position({
            lat: serviceValue.defaultLocation && serviceValue.defaultLocation.length ? serviceValue.defaultLocation[0] : 51.509865,
            lng: serviceValue.defaultLocation && serviceValue.defaultLocation.length ? serviceValue.defaultLocation[1] : -0.118092,
          });
        }
      }

      // }
    },
  });

  useEffect(() => {
    if (deviceResult.isSuccess) {
      showSnackbar("Device", deviceResult.data?.message, "success", 1000);
      deviceForm.resetForm();
      dispatch(
        setService({
          devices: serviceValue.devices + 1,
        })
      );
    }
    if (deviceResult.isError) {
      showSnackbar("Device", deviceResult.error?.data?.message, "error", 1000);
    }
  }, [deviceResult]);

  useEffect(() => {
    if (serviceValue.serviceId == "") {
      let metaData = {};
      metaData.tabs = {
        location: serviceValue.metaData.location,
        maintenance: serviceValue.metaData.maintenance,
        videoAnalytics: serviceValue.metaData.videoAnalytics,
        digitalTwin: {
          value: serviceValue.metaData.digitalTwin,
          svg: serviceValue.svg,
        },
      };
      if (
        serviceValue.layout == 1 &&
        (!metaData.tabs.digitalTwin || !metaData.tabs.digitalTwin.value)
      ) {
        metaData.tabs.digitalTwin = {
          value: true,
          svg: "test-svg",
        };
      }
      const assetMapping = JSON.parse(
        JSON.stringify([...serviceValue.assetMapping])
      );

      // Merging value insights to sensors and removing it
      // Also replacing assetId with assetType
      for (var i = 0; i < assetMapping.length; i++) {
        var object = assetMapping[i];
        object.sensors = object.sensors.concat(object.valueInsights);
        object.assetType = object.assetId;
        delete object.assetId;
        delete object.valueInsights;
      }
      let body = {
        name: serviceValue.name,
        description: serviceValue.description,
        tags: serviceValue.tags,
        configuredSensors: serviceValue.monitoring,
        configuredActuators: serviceValue.actuator,
        metaData: metaData,
        configuredAsset: serviceValue.asset[0],
        configuredAssets: serviceValue.asset,
        assetMapping: assetMapping,
        parentChildEnabled: serviceValue.parentChildEnabled,
        configuredSensors: serviceValue.configuredSensors.map(function (obj) {
          return obj.id;
        }),
        configuredActuators: serviceValue.configuredActuators.map(function (
          obj
        ) {
          return obj.id;
        }),
        dataPointThresholds: serviceValue.dataPointThresholds,
        metaTags: serviceValue.meta,
        layout: { map: serviceValue.map, dashboardView: serviceValue.layout },
        widgetDatapoints: serviceValue.widgetDatapoints,
        trend: serviceValue.trend,
        logoPath: serviceValue.cover,
        defaultLocation: serviceValue.defaultLocation,
      };
      if (serviceValue.vanish) {
        body.vanish = serviceValue.vanish;
        body.devicePrompt = serviceValue.devPrompt;
        body.duration = serviceValue.duration;
      } else {
        body.vanish = serviceValue.vanish;
      }
      createService({ token, body });
    } else {
      setLoader(false);
    }
  }, []);

  useEffect(() => {
    if (serviceResult.isSuccess) {
      setLoader(false);
      showSnackbar("Solution", serviceResult.data?.message, "success", 1000);
      dispatch(
        setService({
          serviceId: serviceResult.data.payload._id,
          configuredAssets: serviceResult.data?.payload?.configuredAssets,
        })
      );
    }
    if (serviceResult.isError) {
      showSnackbar(
        "Solution",
        serviceResult.error?.data?.message,
        "error",
        1000
      );
      dispatch(
        setService({
          page: 0,
        })
      );
    }
  }, [serviceResult]);

  return (
    <Fragment>
      <div
        style={{
          maxHeight: "calc(100vh - 310px)",
          minHeight: "calc(100vh - 310px)",
          overflowY: "scroll",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loader ? (
          <span
            style={{
              display: "flex",
              gap: "20px",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <CircularProgress
              size="8rem"
              style={{
                color: metaDataValue.branding.secondaryColor,
              }}
            />
            <p
              style={{
                color: metaDataValue.branding.secondaryColor,
              }}
            >
              <b>Creating Solution...</b>
            </p>
          </span>
        ) : (
          //     <div
          //       style={{
          //         display: "flex",
          //         alignItems: "center",
          //         flexDirection: "column",
          //         height: "100%",
          //         width:'100%'
          //       }}
          //     >
          //       <div
          //         style={{
          //           display: "flex",
          //           alignItems: "center",
          //           justifyContent: "center",
          //           flexDirection: "column",
          //           height: "100%",
          //           width:'100%'
          //         }}
          //       >
          //         <form style={{width:'50%'}}>
          //           <div style={{display:'flex', width:'100%'}}>
          //           <Card
          //             style={{
          //               backgroundColor: "#f2f2f2",
          //               maxWidth: "400px",
          //             }}
          //           >
          //             <div
          //               style={{
          //                 padding: "20px",
          //               }}
          //             >
          //               <span
          //                 style={{
          //                   display: "flex",
          //                   flexDirection: "column",
          //                   alignItems: "center",
          //                   justifyContent: "center",
          //                 }}
          //               >
          //                 <RouterIcon
          //                   style={{
          //                     color: "#555555",
          //                     height: "50px",
          //                     width: "50px",
          //                     marginBottom: "5px",
          //                   }}
          //                 />
          //                 <p
          //                   style={{
          //                     color: "#555555",
          //                     marginBottom: "20px",
          //                   }}
          //                 >
          //                   Total Devices <b>{serviceValue.devices}</b>
          //                 </p>
          //               </span>
          //               <form onSubmit={deviceForm.handleSubmit}>
          //                 <TextField
          //                   required
          //                   autoFocus
          //                   label="Name"
          //                   fullWidth
          //                   id="name"
          //                   margin="dense"
          //                   error={
          //                     deviceForm.touched.name && deviceForm.errors.name
          //                   }
          //                   value={deviceForm.values.name}
          //                   onChange={deviceForm.handleChange}
          //                   onBlur={deviceForm.handleBlur}
          //                   helperText={
          //                     deviceForm.touched.name ? deviceForm.errors.name : ""
          //                   }
          //                 />
          //                 <TextField
          //                   label="Firmware"
          //                   fullWidth
          //                   id="firmware"
          //                   margin="dense"
          //                   value={deviceForm.values.firmware}
          //                   onChange={deviceForm.handleChange}
          //                 />
          //                 <TextField
          //                   label="Serial Number"
          //                   id="serial"
          //                   margin="dense"
          //                   value={deviceForm.values.serial}
          //                   onChange={deviceForm.handleChange}
          //                   fullWidth
          //                 />
          //                 <TextField
          //                   label="IMEI"
          //                   fullWidth
          //                   id="imei"
          //                   margin="dense"
          //                   value={deviceForm.values.imei}
          //                   onChange={deviceForm.handleChange}
          //                 />
          //                 <Button
          //                   fullWidth
          //                   variant="contained"
          //                   color="secondary"
          //                   style={{
          //                     color: "white",
          //                     marginTop: "10px",
          //                   }}
          //                   type="submit"
          //                   id="add-device"
          //                 >
          //                   Add Device
          //                 </Button>
          //               </form>
          //             </div>
          //           </Card>

          // </div>
          //         </form>
          //         <div
          //   ref={mapContainer}
          //   style={{
          //     height: "calc(100% - 30px)",
          //     borderRadius: "10px",
          //     width:'50%'
          //   }}
          // />
          //       </div>

          //     </div>
          <div
            style={{
              display: "flex",
              width: "100%",
              // paddingRight: "14%",
              gap: 20,
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", justifyContent: "end" }}>
              <div style={{ display: "flex", width: "100%" }}>
                <Card
                  style={{
                    backgroundColor: "#f2f2f2",
                    maxWidth: "400px",
                  }}
                >
                  <div
                    style={{
                      padding: "20px",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <RouterIcon
                        style={{
                          color: "#555555",
                          height: "50px",
                          width: "50px",
                          marginBottom: "5px",
                        }}
                      />
                      <p
                        style={{
                          color: "#555555",
                          marginBottom: "20px",
                        }}
                      >
                        Total Devices <b>{serviceValue.devices}</b>
                      </p>
                    </span>
                    <form onSubmit={deviceForm.handleSubmit}>
                      <TextField
                        required
                        autoFocus
                        label="Name"
                        fullWidth
                        id="name"
                        margin="dense"
                        error={
                          deviceForm.touched.name && deviceForm.errors.name
                        }
                        value={deviceForm.values.name}
                        onChange={deviceForm.handleChange}
                        onBlur={deviceForm.handleBlur}
                        helperText={
                          deviceForm.touched.name ? deviceForm.errors.name : ""
                        }
                      />
                      <TextField
                        label="Firmware"
                        fullWidth
                        id="firmware"
                        margin="dense"
                        value={deviceForm.values.firmware}
                        onChange={deviceForm.handleChange}
                      />
                      <TextField
                        label="Serial Number"
                        id="serial"
                        margin="dense"
                        value={deviceForm.values.serial}
                        onChange={deviceForm.handleChange}
                        fullWidth
                      />
                      <TextField
                        label="IMEI"
                        fullWidth
                        id="imei"
                        margin="dense"
                        value={deviceForm.values.imei}
                        onChange={deviceForm.handleChange}
                      />
                      {serviceValue.configuredAssets && serviceValue.configuredAssets.length > 1 ? (
                        <FormControl fullWidth margin="dense">
                          <InputLabel>Asset type</InputLabel>
                          <Select
                            value={deviceForm.values.platformDeviceType}
                            error={
                              deviceForm.touched.platformDeviceType &&
                                deviceForm.errors.platformDeviceType
                                ? true
                                : false
                            }
                            name="platformDeviceType"
                            fullWidth
                            onChange={(e) => {
                              console.log("e.target.value", e.target.value);
                              deviceForm.setFieldValue(
                                "platformDeviceType",
                                e.target.value
                              );
                            }}
                            label="platformDeviceType"
                            helperText={
                              deviceForm.touched.platformDeviceType
                                ? deviceForm.errors.platformDeviceType
                                : ""
                            }
                          >
                            {serviceValue.configuredAssets.map((elm) => {
                              return (
                                <MenuItem value={elm.id || elm._id}>
                                  {elm.name}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      ) : null}
                      <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        style={{
                          color: "white",
                          marginTop: "10px",
                        }}
                        type="submit"
                        id="add-device"
                        disabled={deviceResult.isLoading}
                      >
                        {deviceResult.isLoading ? (
                          <CircularProgress
                            size={20}
                            style={{
                              color: "white",
                            }}
                          />
                        ) : (
                          <span>Add Device</span>
                        )}
                      </Button>
                    </form>
                  </div>
                </Card>
              </div>
            </div>
            <div
            // style={{height: 'calc(100% - 500px)'}}
            >
              <div
                ref={mapContainer}
                style={{
                  // width: "50%",
                  borderRadius: "10px",
                  height: "calc(100% - 60px)",
                }}
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ width: "50%" }}>
                  <TextField
                    label="Latitude"
                    fullWidth
                    id="lat"
                    margin="dense"
                    value={deviceForm.values.lat}
                    onChange={(e) => {
                      if (e.target.value >= -90 && e.target.value <= 90) {
                        console.log({ e });
                        setValidLat(true);
                        setC8y_Position({
                          ...c8y_Position,
                          lat: e.target.value,
                        });
                        console.log({
                          ...c8y_Position,
                          lat: e.target.value,
                        });
                        if (
                          validLat &&
                          validLng &&
                          c8y_Position.lng >= -180 &&
                          c8y_Position.lng <= 180 &&
                          c8y_Position.lat >= -90 &&
                          c8y_Position.lat <= 90
                        ) {
                          if (marker) {
                            marker.remove();
                          }
                          map.current.flyTo({
                            center: [c8y_Position.lng, e.target.value],
                          });
                          marker = new mapboxgl.Marker()
                            .setLngLat([c8y_Position.lng, e.target.value])
                            .addTo(map.current);
                        }
                      } else {
                        console.log("invalid");
                        setValidLat(false);
                      }
                      deviceForm.handleChange(e);
                    }}
                  />
                  {!validLat ? (
                    <div style={{ fontSize: "10px", color: "red" }}>
                      Invalid Latitude
                    </div>
                  ) : null}
                </div>
                <div style={{ width: "50%" }}>
                  <TextField
                    label="Longitude"
                    fullWidth
                    id="lng"
                    margin="dense"
                    value={deviceForm.values.lng}
                    onChange={(e) => {
                      if (e.target.value >= -180 && e.target.value <= 180) {
                        setValidLat(true);
                        setC8y_Position({
                          ...c8y_Position,
                          lng: e.target.value,
                        });
                        console.log({
                          ...c8y_Position,
                          lng: e.target.value,
                        });
                        if (
                          validLat &&
                          validLng &&
                          c8y_Position.lng >= -180 &&
                          c8y_Position.lng <= 180 &&
                          c8y_Position.lat >= -90 &&
                          c8y_Position.lat <= 90
                        ) {
                          if (marker) {
                            marker.remove();
                          }
                          map.current.flyTo({
                            center: [e.target.value, c8y_Position.lat],
                          });
                          marker = new mapboxgl.Marker()
                            .setLngLat([e.target.value, c8y_Position.lat])
                            .addTo(map.current);
                        }
                      } else {
                        console.log("invalid");
                        setValidLat(false);
                      }
                      deviceForm.handleChange(e);
                    }}
                  />
                  {!validLng ? (
                    <div style={{ fontSize: "10px", color: "red" }}>
                      Invalid Longitude
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Divider />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          position: "relative",
          top: "10px",
        }}
      >
        <Button id="back" color="secondary" disabled>
          Back
        </Button>
        <Button
          id="next"
          color="secondary"
          disabled={loader}
          onClick={() => {
            dispatch(
              setService({
                page: 8,
              })
            );
          }}
        >
          {doneButton}
        </Button>
      </div>
    </Fragment>
  );
}
