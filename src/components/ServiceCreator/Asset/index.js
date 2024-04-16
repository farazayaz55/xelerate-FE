import React, { Fragment, useEffect, useRef } from "react";
import TextField from "@mui/material/TextField";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Sensors from "../Cards/index";
import AddIcon from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import DialogTitle from "@mui/material/DialogTitle";
import { useSnackbar } from "notistack";
import VideocamIcon from "@mui/icons-material/Videocam";
import PushPinIcon from "@mui/icons-material/PushPin";
import ClearIcon from "@mui/icons-material/Clear";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import hexRgb from "hex-rgb";
import RoomIcon from "@mui/icons-material/Room";
import Keys from "Keys";
import { useGetAssetsQuery, useCreateAssetMutation } from "services/services";
import { useSelector, useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import HideImageIcon from "@mui/icons-material/HideImage";
import { setService } from "rtkSlices/ServiceCreatorSlice";
import Dragable from "components/Dragable";
import useUpload from "hooks/useUpload";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

export default function AssetFn(props) {
  const svgInputRef = useRef(null);
  const svgMapInputRef = useRef(null);

  let tempSvg = false;
  let tempSvgMap = false;

  const dispatch = useDispatch();
  let token = window.localStorage.getItem("token");
  const inputRef = useRef(null);
  const { url, isLoading, error, fetchUrl, reset } = useUpload();
  const serviceValue = useSelector((state) => state.serviceCreator);
  const { enqueueSnackbar } = useSnackbar();
  const [assetImage, setAssetImage] = React.useState(null);
  const [addLoader, setAddLoader] = React.useState(false);
  // const [selected, setSelected] = React.useState(serviceValue.asset);
  const [isShown, setIsShown] = React.useState(false);
  const [preview, setPreview] = React.useState(null);
  const [openPopup, setOpenPopup] = React.useState(false);
  const [allAssets, setAllAssets] = React.useState([]);
  const metaDataValue = useSelector((state) => state.metaData);
  const [rgb, setRgb] = React.useState(
    hexRgb(metaDataValue.branding.secondaryColor)
  );
  const [svgLoaderDigitalTwin, setSvgLoaderDigitalTwin] = React.useState(false);
  const [svgLoader, setSvgLoader] = React.useState(false);
  const [uploadType, setUploadType] = React.useState(null);
  const [boxSelected, setBoxSelected] = React.useState(null);

  useEffect(() => {
    if (!isLoading && url) {
      console.log("url", url);
      console.log("boxSelected", boxSelected);

      switch (boxSelected) {
        case "Digital Twin":
          dispatch(
            setService({
              digitalMarketUrl: { value: url, selected: false },
            })
          );
          break;
        case "Map Marker":
          dispatch(
            setService({
              mapMarkerUrl: { value: url, selected: false },
            })
          );
          break;

        default:
          break;
      }

      handleLoader(false);
    }
  }, [isLoading]);
  function handleLoader(state, selectedBox) {
    switch (selectedBox ? selectedBox : boxSelected) {
      case "Digital Twin":
        setSvgLoaderDigitalTwin(state);
        break;
      case "Map Marker":
        setSvgLoader(state);
        break;

      default:
        break;
    }
  }
  const clear = (selectedBox) => {
    reset();
    switch (selectedBox ? selectedBox : boxSelected) {
      case "Digital Twin":
        dispatch(
          setService({
            digitalMarketUrl: { value: null, selected: false },
          })
        );
        break;
      case "Map Marker":
        dispatch(
          setService({
            mapMarkerUrl: { value: null, selected: false },
          })
        );
        break;
      default:
        break;
    }
  };

  function handleSwitches(elm) {
    switch (elm.name) {
      case "Digital Twin":
        if (!tempSvg) {
          if (svgInputRef.current) {
            svgInputRef.current.value = "";
          }
          svgInputRef.current.click();
        } else {
          tempSvg = false;
        }
        break;
      case "Map Marker":
        if (!tempSvgMap) {
          if (tempSvgMap.current) {
            tempSvgMap.current.value = "";
          }
          svgMapInputRef.current.click();
        } else {
          tempSvgMap = false;
        }
        break;

      default:
        break;
    }
  }
  async function handleSvg(e, boxSelected) {
    setUploadType("svg");
    if (e.target.files[0]) {
      let body = e.target.files[0];
      let type = e.target.files[0].type;
      if (!type.toLowerCase().includes("svg") && boxSelected !== "Map Marker") {
        showSnackbar(
          "SVG",
          "The selected file format is not supported",
          "error",
          1000,
          enqueueSnackbar
        );
      } else {
        fetchUrl(body, type);
        setBoxSelected(boxSelected);
        handleLoader(true, boxSelected);
      }
    } else {
      clear(boxSelected);
    }
  }

  function setSelected(selected) {
    dispatch(
      setService({
        asset: selected,
      })
    );
  }
  function setConfiguredAssets(configuredAssets) {
    dispatch(
      setService({
        configuredAssets: configuredAssets,
      })
    );
  }
  function setSelectedSensor(assetMappingArray) {
    dispatch(setService({ assetMapping: assetMappingArray }));
  }
  const assetForm = useFormik({
    initialValues: {
      name: "",
      description: "",
      aqdt: false,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required field"),
      description: Yup.string().required("Required field"),
      aqdt: Yup.boolean(),
    }),
    onSubmit: async (values) => {
      if (url) {
        let digitalMarketUrl = JSON.parse(
          JSON.stringify(serviceValue.digitalMarketUrl)
        );
        if (digitalMarketUrl.value) {
          digitalMarketUrl.selected = true;
        } else digitalMarketUrl.selected = false;

        let mapMarkerUrl = JSON.parse(
          JSON.stringify(serviceValue.mapMarkerUrl)
        );
        if (mapMarkerUrl.value) {
          mapMarkerUrl.selected = true;
        } else mapMarkerUrl.selected = false;
        let body = {
          name: values.name,
          description: values.description,
          aqdt: values.aqdt,
          logoPath: url,
          digitalMarketUrl: digitalMarketUrl,
          mapMarkerUrl: mapMarkerUrl,
        };
        addAsset({ token, body });
        setAddLoader(true);
      } else {
        showSnackbar("Assets", "Asset Image is required", "warning", 1000);
      }
    },
  });

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar(
      { title, message: message ? message : "Something went wrong", variant },
      { timeOut }
    );
  }

  const assets = useGetAssetsQuery(token);

  const [addAsset, addAssetResult] = useCreateAssetMutation();

  useEffect(() => {
    if (addAssetResult.isSuccess) {
      let id = addAssetResult.data.payload._id;
      handleToggleAsset(addAssetResult.data.payload);
      handlepopupClose();
      showSnackbar("Assets", addAssetResult.data?.message, "success", 1000);
      setTimeout(() => {
        setAddLoader(false);
      }, 500);
    }
    if (addAssetResult.isError) {
      showSnackbar(
        "Assets",
        addAssetResult.error?.data?.message,
        "error",
        1000
      );
      setTimeout(() => {
        setAddLoader(false);
      }, 500);
    }
  }, [addAssetResult]);

  useEffect(() => {
    if (assets.isSuccess) {
      let allAssets = [];
      assets.data.payload.forEach((asset) => {
        allAssets.push({
          name: asset.name,
          id: asset._id,
          description: asset.name,
          image: asset.logoPath,
          aqdt: asset.aqdt
        });
      });
      setAllAssets(allAssets);
    }
    if (assets.isError) {
      showSnackbar("Assets", assets.error?.message, "error", 1000);
    }
  }, [assets.isFetching]);

  const handlepopupOpen = () => {
    assetForm.resetForm();
    reset();
    setPreview(null);
    setOpenPopup(true);
  };

  const handlepopupClose = () => {
    assetForm.resetForm();
    reset();
    setPreview(null);
    setOpenPopup(false);
  };

  function handleImage(e) {
    setBoxSelected("");
    let type = e.target.files[0].type;
    let body = e.target.files[0];
    if (
      !(
        type.toLowerCase().includes("image/png") ||
        type.toLowerCase().includes("image/svg") ||
        type.toLowerCase().includes("image/jpeg") ||
        type.toLowerCase().includes("image/jpg") ||
        type.toLowerCase().includes("image/gif")
      )
    ) {
      showSnackbar(
        "Asset Image",
        "Selected file format is not supported",
        "error",
        1000
      );
      return;
    }
    setPreview(URL.createObjectURL(e.target.files[0]));
    type = body.name.split(".")[body.name.split(".").length - 1];
    setIsShown(false);
    fetchUrl(body, type);
  }

  const handleToggleAsset = (obj) => {
    const index = serviceValue.assetMapping.findIndex(
      (item) => item.assetId === (obj.id || obj._id)
    );
    let assetMappingArray = JSON.parse(
      JSON.stringify([...serviceValue.assetMapping])
    );
    if (index === -1) {
      const newAssetMapping = {
        assetId: obj.id || obj._id,
        sensors: [],
        actuators: [],
        valueInsights: [],
      };
      assetMappingArray.push(newAssetMapping);
      setSelectedSensor(assetMappingArray);
    } else {
      assetMappingArray.splice(index, 1);
      setSelectedSensor(assetMappingArray);
    }

    const indexConfiguredAssets = serviceValue.configuredAssets.findIndex(
      (item) => item.id || item._id === (obj.id || obj._id)
    );
    let configuredAssets = [...serviceValue.configuredAssets];
    if (indexConfiguredAssets > -1) {
      configuredAssets.splice(indexConfiguredAssets, 1);
    } else {
      configuredAssets.push(obj.id || obj._id);
    }
    setConfiguredAssets(configuredAssets);

    // Deselect the card if it is alreaded selected
    const assetIndex = serviceValue.asset.indexOf(obj.id || obj._id);
    let assets = [...serviceValue.asset];
    if (assetIndex > -1) {
      assets.splice(assetIndex, 1);
    } else {
      assets.push(obj.id || obj._id);
    }
    setSelected(assets);
  };

  return (
    <div>
      <Dragable bottom={"10px"} right={"10px"} name="service-add">
        <Fab
          style={{ boxShadow: "none" }}
          onClick={handlepopupOpen}
          color="secondary"
          id="asset-fab"
        >
          <AddIcon />
        </Fab>
      </Dragable>

      <Dialog
        open={openPopup}
        onClose={handlepopupClose}
        aria-labelledby="form-dialog-title"
      >
        <form onSubmit={assetForm.handleSubmit}>
          <DialogTitle id="form-dialog-title">Asset</DialogTitle>
          <DialogContent>
            <div
              style={{
                display: "flex",
                minWidth: "400px",
                marginLeft: "20px",
                marginRight: "20px",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: "10px",
                  marginBottom: "20px",
                }}
              >
                <input
                  style={{ display: "none" }}
                  type="file"
                  ref={inputRef}
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleImage}
                  multiple={false}
                  id="asset-img"
                ></input>
                <div
                  onClick={() => inputRef.current.click()}
                  onMouseEnter={() => setIsShown(true)}
                  onMouseLeave={() => setIsShown(false)}
                  style={{
                    position: "relative",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#eeeeee",
                      borderRadius: "50%",
                      height: "145px",
                      width: "145px",
                      border: "1px solid #b1b1b1",
                      backgroundImage: `url(${preview})`,
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                      filter: isShown ? "blur(1px)" : "",
                    }}
                  >
                    {preview ? null : (
                      <HideImageIcon
                        style={{
                          color: "#808080",
                          height: "40px",
                          width: "40px",
                        }}
                      />
                    )}
                  </div>
                  {isShown ? (
                    <CameraAltIcon
                      style={{
                        height: "50px",
                        width: "50px",
                        color: "#555555",
                        position: "absolute",
                        top: "50px",
                        left: "50px",
                      }}
                    />
                  ) : null}
                </div>
                <p style={{ color: "#8086a3" }}>
                  <b>Asset Image</b>
                </p>
              </div>
              <TextField
                required
                label="Asset Name"
                fullWidth
                margin="dense"
                id="name"
                error={assetForm.touched.name && assetForm.errors.name}
                value={assetForm.values.name}
                onChange={assetForm.handleChange}
                onBlur={assetForm.handleBlur}
                helperText={assetForm.touched.name ? assetForm.errors.name : ""}
              />
              <TextField
                required
                label="Asset Description"
                fullWidth
                margin="dense"
                id="description"
                error={
                  assetForm.touched.description && assetForm.errors.description
                }
                value={assetForm.values.description}
                onChange={assetForm.handleChange}
                onBlur={assetForm.handleBlur}
                helperText={
                  assetForm.touched.description
                    ? assetForm.errors.description
                    : ""
                }
              />
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  width: '100%',
                  alignItems: "center",
                  padding: "10px",
                }}
              >
                <FormControlLabel
                sx={{marginRight:'0px'}}
                  control={
                    <Switch
                      name="aqdt"
                      checked={assetForm.values.aqdt}
                      onChange={assetForm.handleChange}
                    />
                  }
                />
                <p style={{ fontWeight: "bold", color: "#9f9f9f" }}>
                  Air Quality Digital Twin
                </p>
              </div>

              <input
                style={{ display: "none" }}
                type="file"
                accept=".svg"
                ref={svgInputRef}
                onChange={(event) => {
                  handleSvg(event, "Digital Twin");
                }}
                multiple={false}
              ></input>
              <input
                style={{ display: "none" }}
                type="file"
                ref={svgMapInputRef}
                onChange={(event) => {
                  handleSvg(event, "Map Marker");
                }}
                multiple={false}
              ></input>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "20px",
                  marginTop: "2rem",
                }}
              >
                {[
                  {
                    name: "Map Marker",
                    value: serviceValue.mapMarkerUrl.value,
                    icon: RoomIcon,
                    loading: svgLoader,
                  },
                  {
                    name: "Digital Twin",
                    value: serviceValue.digitalMarketUrl.value,
                    icon: ViewInArIcon,
                    loading: svgLoaderDigitalTwin,
                  },
                ].map((elm, index) => {
                  return (
                    <>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          border: elm.value
                            ? `2px solid ${
                                elm.name == "Digital Twin" &&
                                assetForm.values.aqdt
                                  ? "grey"
                                  : metaDataValue.branding.secondaryColor
                              }`
                            : "1px solid #bdbdbd",
                          backgroundColor: elm.value
                            ? `rgb(${rgb.red}, ${rgb.green}, ${rgb.blue},0.1)`
                            : "rgb(189,189,189,0.1)",
                          height: "85px",
                          width: "95px",
                          cursor: (
                            elm.name != "Digital Twin" ||
                            (elm.name == "Digital Twin" && !assetForm.values.aqdt)
                          ) ? "pointer" : "auto",
                          boxShadow:
                            "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
                          position: "relative",
                        }}
                        id={`feature-${index}`}
                        onClick={() => {
                          if (!elm.loading) {
                            if (
                              elm.name != "Digital Twin" ||
                              (elm.name == "Digital Twin" && !assetForm.values.aqdt)
                            ){
                              handleSwitches(elm);
                            }
                          }
                        }}
                      >
                        <Fragment>
                          <div
                            style={{
                              width: "0",
                              height: "0",
                              borderTop: `25px solid ${
                                elm.name == "Digital Twin" &&
                                assetForm.values.aqdt
                                  ? "grey"
                                  : metaDataValue.branding.secondaryColor
                              }`,
                              borderRight: "25px solid transparent",
                              position: "absolute",
                              top: "0",
                              left: "0",
                            }}
                          />
                          {elm.value ? (
                            <ClearIcon
                              onClick={(event) => {
                                event.stopPropagation();
                                clear(elm.name);
                              }}
                              style={{
                                width: "11px",
                                height: "11px",
                                position: "absolute",
                                color: "white",
                                top: "2px",
                                left: "2px",
                              }}
                            />
                          ) : (
                            <PushPinIcon
                              style={{
                                width: "11px",
                                height: "11px",
                                position: "absolute",
                                color: "white",
                                top: "2px",
                                left: "2px",
                              }}
                            />
                          )}
                        </Fragment>

                        {elm.loading ? (
                          <CircularProgress
                            style={{
                              color:
                                elm.name == "Digital Twin" &&
                                assetForm.values.aqdt
                                  ? "grey"
                                  : metaDataValue.branding.secondaryColor,
                            }}
                          />
                        ) : (
                          <Fragment>
                            {elm.value ? (
                              <>
                                <img
                                  style={{ maxWidth: "3rem" }}
                                  src={elm.value}
                                />
                              </>
                            ) : (
                              <>
                                <elm.icon
                                  style={{
                                    color:
                                      elm.name == "Digital Twin" &&
                                      assetForm.values.aqdt
                                        ? "grey"
                                        : metaDataValue.branding.secondaryColor,
                                    height: "30px",
                                    width: "30px",
                                  }}
                                />
                                <p
                                  style={{
                                    color:
                                      elm.name == "Digital Twin" &&
                                      assetForm.values.aqdt
                                        ? "grey"
                                        : metaDataValue.branding.secondaryColor,

                                    userSelect: "none",
                                    fontSize: "10px",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  <b>{elm.name}</b>
                                </p>
                              </>
                            )}
                          </Fragment>
                        )}
                      </div>
                    </>
                  );
                })}
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            {addLoader ? null : (
              <Button id="cancel" onClick={handlepopupClose} color="primary">
                Cancel
              </Button>
            )}
            <Button id="add" type="submit" color="primary">
              {addLoader ? (
                <CircularProgress color="secondary" size={20} />
              ) : (
                <span>Add</span>
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <span
          style={{
            padding: "0px 30px 0px 30px",
          }}
        >
          <Sensors
            name="Asset"
            loader={assets.isLoading}
            handleToggle={handleToggleAsset}
            selected={serviceValue.asset}
            parameters={allAssets}
            zoomOut
          />
        </span>
        <Divider />
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
                dispatch(
                  setService({
                    page: 0,
                    devices: 0,
                    serviceId: "",
                    name: "",
                    description: "",
                    tags: [],
                    meta: [],
                    asset: [],
                    actuator: [],
                    monitoring: [],
                    metaData: {
                      location: false,
                      maintenance: false,
                      videoAnalytics: false,
                      digitalTwin: false,
                    },
                    persist: {
                      tags: [],
                      meta: [],
                      cover: null,
                    },
                  })
                );
                props.setSelected(null);
              }}
            >
              Cancel
            </Button>
          ) : null}
          <Button
            color="secondary"
            id="back"
            onClick={() => {
              dispatch(
                setService({
                  page: 0,
                })
              );
            }}
          >
            Back
          </Button>
          <Button
            id="next"
            color="secondary"
            onClick={() => {
              if (serviceValue.asset.length < 1) {
                showSnackbar("Asset", "Asset is required", "info", 1000);
              } else
                dispatch(
                  setService({
                    page: 2,
                  })
                );
            }}
          >
            Next
          </Button>
          {props.edit ? (
            <Button
              id="save"
              color="secondary"
              onClick={() => {
                if (
                  serviceValue.actuator.length < 1 &&
                  serviceValue.monitoring.length < 1
                )
                  showSnackbar(
                    "Solution",
                    "Select atleast one Monitoring/Controlling parameter",
                    "info",
                    1000
                  );
                else {
                  props.handleSave();
                }
              }}
            >
              Save
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
