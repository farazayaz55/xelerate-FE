import React, { Fragment, useEffect, useState, useRef } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SettingsIcon from "@mui/icons-material/Settings";
import { useSnackbar } from "notistack";
import hexRgb from "hex-rgb";
import PushPinIcon from "@mui/icons-material/PushPin";
import VideocamIcon from "@mui/icons-material/Videocam";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';
import { InputAdornment } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import CloseIcon from "@mui/icons-material/Close";
import HideImageIcon from "@mui/icons-material/HideImage";
import { setService } from "rtkSlices/ServiceCreatorSlice";
import { useSelector, useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useGetTagsQuery, useAddTagMutation } from "services/tags";
import useUpload from "hooks/useUpload";
import { showSnackbar } from "Utilities/Snackbar";

export default function Catalogue(props) {
  let tempSvg = false;
  const dispatch = useDispatch();
  const { url, isLoading, error, fetchUrl } = useUpload();
  const svgInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const metaDataValue = useSelector((state) => state.metaData);
  const serviceValue = useSelector((state) => state.serviceCreator);
  const [svgLoader, setSvgLoader] = React.useState(false);
  if (serviceValue.metaData.digitalTwin) tempSvg = true;
  const [addingTag, setAddingTag] = useState(false);
  const [uploadType, setUploadType] = useState(null);
  const [isShown, setIsShown] = React.useState(false);
  const [newTag, setNewTag] = useState("");
  const [tagsLoader, setTagsLoader] = useState(true);
  const [rgb, setRgb] = React.useState(
    hexRgb(metaDataValue.branding.secondaryColor)
  );
  const { enqueueSnackbar } = useSnackbar();

  const [fetchTags, setFetchTags] = useState(true);
  const tagsRes = useGetTagsQuery({}, { skip: !fetchTags });
  const [addTag, addTagResult] = useAddTagMutation();

  function isValidDateTime(value) {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  useEffect(() => {
    if (!tagsRes.isFetching && tagsRes.isSuccess) {
      setFetchTags(false);
      if ((props.edit && serviceValue.tags.length > 0) || newTag) {
        if (newTag) {
          setAddingTag(false);
          setNewTag("");
          showSnackbar(
            "Tags",
            addTagResult.data?.message,
            "success",
            1000,
            enqueueSnackbar
          );
        }
        let temp = [];
        tagsRes.data.payload.forEach((elm) => {
          if (serviceValue.tags.indexOf(elm._id) != -1) temp.push(elm);
        });
        // setPersistTags(temp);
        dispatch(
          setService(
            newTag
              ? {
                  persist: {
                    ...serviceValue.persist,
                    tags: [
                      ...serviceValue.persist.tags,
                      tagsRes.data.payload[tagsRes.data.payload.length - 1],
                    ],
                  },
                  tags: [
                    ...serviceValue.tags,
                    tagsRes.data.payload[tagsRes.data.payload.length - 1]._id,
                  ],
                }
              : {
                  persist: {
                    ...serviceValue.persist,
                    tags: temp,
                  },
                }
          )
        );
      }
      setTagsLoader(false);
    }
    if (tagsRes.isError) {
      showSnackbar(
        "Tags",
        tagsRes.error?.data?.message,
        "error",
        1000,
        enqueueSnackbar
      );
      setTagsLoader(false);
    }
  }, [tagsRes.isFetching]);

  useEffect(() => {
    if (!isLoading && url) {
      if (uploadType == "svg") {
        dispatch(
          setService({
            svg: url,
            metaData: {
              ...serviceValue.metaData,
              digitalTwin: true,
            },
          })
        );
        tempSvg = true;
        handleLoader(false);
      } else if (uploadType == "img") {
        dispatch(
          setService({
            cover: url,
          })
        );
      }
    }
  }, [isLoading]);

  useEffect(() => {
    if (!addTagResult.isFetching && addTagResult.isSuccess) {
      // setNewTag("");
      setAddingTag(false);
      showSnackbar(
        "Tags",
        addTagResult.data?.message,
        "success",
        1000,
        enqueueSnackbar
      );
    }
    if (addTagResult.isError) {
      showSnackbar(
        "Tags",
        addTagResult.error?.data?.message,
        "error",
        1000,
        enqueueSnackbar
      );
    }
  }, [addTagResult.isFetching]);

  const detailsForm = useFormik({
    initialValues: {
      name: serviceValue.name,
      description: serviceValue.description,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required field"),
      description: Yup.string().required("Required field"),
    }),
    onSubmit: async () => {
      dispatch(
        setService({
          page: 1,
        })
      );
    },
  });

  useEffect(() => {
    dispatch(
      setService({
        name: detailsForm.values.name,
        description: detailsForm.values.description,
      })
    );
  }, [detailsForm.values]);

  function onKeyDown(keyEvent) {
    if ((keyEvent.charCode || keyEvent.keyCode) === 13) {
      keyEvent.preventDefault();
    }
  }

  function handleImage(e) {
    if (e.target.files[0].size > 2097152)
      showSnackbar(
        "Cover Image",
        "Image size should not be more then 2mb",
        "error",
        1000,
        enqueueSnackbar
      );
    else {
      setUploadType("img");
      let body = e.target.files[0];
      let type = e.target.files[0].type;
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
          "Cover Image",
          "Selected file format is not supported",
          "error",
          1000,
          enqueueSnackbar
        );
        return;
      } else {
        type = body.name.split(".")[body.name.split(".").length - 1];
        fetchUrl(e.target.files[0], type);
      }
      setIsShown(false);
    }
  }

  async function handleSvg(e) {
    setUploadType("svg");
    let body = e.target.files[0];
    let type = e.target.files[0].type;
    if (!type.toLowerCase().includes("svg")) {
      showSnackbar(
        "SVG",
        "The selected file format is not supported",
        "error",
        1000,
        enqueueSnackbar
      );
    } else {
      fetchUrl(body, type);
      handleLoader(true);
    }
  }

  function handleLoader(state) {
    setSvgLoader(state);
  }

  function handleNewTag(e) {
    let value = e.target.value;
    setNewTag(value);
  }

  async function handleEnter(e) {
    if (e.keyCode == 13) {
      if (
        tagsRes.data?.payload.find(
          (t) => t.name.toLowerCase() == newTag.toLowerCase()
        )
      ) {
        showSnackbar("Tag", "Already exists", "error", 1000, enqueueSnackbar);
        return;
      }
      // dispatch(
      //   setService({
      //     tags: [...serviceValue.tags,newTag],
      //   })
      // );
      addTag({
        name: newTag,
      });
      setFetchTags(true);
    }
  }

  function handleSwitches(elm) {
    switch (elm.name) {
      case "Tracking":
        // setLocation(!location);
        dispatch(
          setService({
            metaData: {
              ...serviceValue.metaData,
              location: !serviceValue.metaData.location,
            },
          })
        );
        break;

      case "Smart Rules":
        // setMaintenance(!maintenance);
        dispatch(
          setService({
            metaData: {
              ...serviceValue.metaData,
              maintenance: !serviceValue.metaData.maintenance,
            },
          })
        );
        break;

      case "Video Analytics":
        // setVideo(!video);
        dispatch(
          setService({
            metaData: {
              ...serviceValue.metaData,
              videoAnalytics: !serviceValue.metaData.videoAnalytics,
            },
          })
        );
        break;

      case "Digital Twin":
        if (!tempSvg) svgInputRef.current.click();
        else {
          tempSvg = false;
          dispatch(
            setService({
              svg: null,
              metaData: {
                ...serviceValue.metaData,
                digitalTwin: !serviceValue.metaData.digitalTwin,
              },
            })
          );
        }
        break;
      case "Parent Child":
        dispatch(
          setService({
            parentChildEnabled: !serviceValue.parentChildEnabled
          })
        )
      default:
        break;
    }
  }

  return (
    <Fragment>
      <form onSubmit={detailsForm.handleSubmit} onKeyDown={onKeyDown}>
        <div
          style={{
            maxHeight: "calc(100vh - 286px)",
            minHeight: "calc(100vh - 286px)",
            overflowY: "scroll",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginBottom: "40px",
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
                ref={imageInputRef}
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleImage}
                multiple={false}
              ></input>
              <div
                id="cover-image"
                onClick={() => imageInputRef.current.click()}
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
                    backgroundImage: `url("${serviceValue.cover}")`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    filter: isShown ? "blur(1px)" : "",
                  }}
                >
                  {serviceValue.cover ? null : (
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
                <b>Cover Photo</b>
              </p>
            </div>

            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <span
                style={{
                  maxWidth: "500px",
                }}
              >
                <div style={{ marginBottom: "20px" }}>
                  <p
                    style={{
                      color: "#616161",
                      fontSize: "15px",
                    }}
                  >
                    <b>Details</b>
                  </p>
                  <Divider />
                </div>

                <TextField
                  required
                  label="Solution Name"
                  fullWidth
                  id="name"
                  margin="dense"
                  error={detailsForm.touched.name && detailsForm.errors.name}
                  value={detailsForm.values.name}
                  onChange={detailsForm.handleChange}
                  onBlur={detailsForm.handleBlur}
                  helperText={
                    detailsForm.touched.name ? detailsForm.errors.name : ""
                  }
                />
                <TextField
                  required
                  label="Solution Description"
                  fullWidth
                  id="description"
                  error={
                    detailsForm.touched.description &&
                    detailsForm.errors.description
                  }
                  value={detailsForm.values.description}
                  onChange={detailsForm.handleChange}
                  onBlur={detailsForm.handleBlur}
                  helperText={
                    detailsForm.touched.description
                      ? detailsForm.errors.description
                      : ""
                  }
                  margin="dense"
                />
                {tagsLoader ? (
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "20px 0px 20px 0px",
                      gap: "20px",
                      color: metaDataValue.branding.secondaryColor,
                    }}
                  >
                    <p>Loading Tags</p>
                    <CircularProgress color="secondary" size={30} />
                  </div>
                ) : (
                  <Fragment>
                    <Autocomplete
                      multiple
                      limitTags={2}
                      id="multiple-limit-tags"
                      options={
                        tagsRes.data?.payload ? tagsRes.data.payload : []
                      }
                      getOptionLabel={(option) => option.name}
                      value={serviceValue.persist.tags}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          margin="dense"
                          label="Solution Tags"
                          placeholder="Select Tags"
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <Fragment>
                                {params.InputProps.endAdornment}
                              </Fragment>
                            ),
                          }}
                        />
                      )}
                      onChange={(e, newValue) => {
                        let temp = [];
                        newValue.forEach((elm) => {
                          temp.push(elm._id);
                        });
                        // setPersistTags(newValue);
                        dispatch(
                          setService({
                            persist: {
                              ...serviceValue.persist,
                              tags: newValue,
                            },
                          })
                        );
                        dispatch(
                          setService({
                            tags: temp,
                          })
                        );
                      }}
                      sx={{ width: "500px" }}
                    />
                    {!addingTag ? (
                      <div style={{ textAlign: "center", marginBottom: 10 }}>
                        <Button
                          color="secondary"
                          variant="outlined"
                          id="add-custom-tag"
                          onClick={() => setAddingTag(true)}
                          style={{
                            height: "56px",
                            width: "200px",
                            margin: "10px 10px 0px 10px",
                          }}
                          startIcon={<AddCircleIcon />}
                        >
                          Add Custom Tag
                        </Button>
                      </div>
                    ) : null}
                    {addingTag ? (
                      <div>
                        <TextField
                          onKeyDown={handleEnter}
                          onChange={handleNewTag}
                          fullWidth
                          margin="dense"
                          focused={true}
                          autoFocus={true}
                          value={newTag}
                          id="new-tag"
                          label="Tag Name"
                          variant="outlined"
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <CloseIcon
                                  onClick={() => setAddingTag(false)}
                                  style={{
                                    cursor: "pointer",
                                    color: "grey",
                                  }}
                                />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </div>
                    ) : null}
                  </Fragment>
                )}

                <div style={{ marginBottom: "20px" }}>
                  <p
                    style={{
                      color: "#616161",
                      fontSize: "15px",
                    }}
                  >
                    <b>Features</b>
                  </p>
                </div>
                <input
                  style={{ display: "none" }}
                  type="file"
                  accept=".svg"
                  ref={svgInputRef}
                  onChange={handleSvg}
                  multiple={false}
                ></input>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "20px",
                    marginTop: "10px",
                  }}
                >
                  {[
                    {
                      name: "Tracking",
                      value: serviceValue.metaData.location,
                      icon: LocationOnIcon,
                    },
                    {
                      name: "Smart Rules",
                      value: serviceValue.metaData.maintenance,
                      icon: SettingsIcon,
                    },
                    {
                      name: "Video Analytics",
                      value: serviceValue.metaData.videoAnalytics,
                      icon: VideocamIcon,
                    },
                    {
                      name: "Digital Twin",
                      value: serviceValue.metaData.digitalTwin,
                      icon: ViewInArIcon,
                    },
                    {
                      name: "Parent Child",
                      value: serviceValue.parentChildEnabled,
                      icon: DevicesOtherIcon
                    }
                  ].map((elm, index) => {
                    return (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          border: elm.value
                            ? `2px solid ${metaDataValue.branding.secondaryColor}`
                            : "1px solid #bdbdbd",
                          backgroundColor: elm.value
                            ? `rgb(${rgb.red}, ${rgb.green}, ${rgb.blue},0.1)`
                            : "rgb(189,189,189,0.1)",
                          height: "85px",
                          width: "95px",
                          cursor: "pointer",
                          boxShadow:
                            "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
                          position: "relative",
                        }}
                        id={`feature-${index}`}
                        onClick={() => {
                          handleSwitches(elm);
                        }}
                      >
                        {elm.value ? (
                          <Fragment>
                            <div
                              style={{
                                width: "0",
                                height: "0",
                                borderTop: `25px solid ${metaDataValue.branding.secondaryColor}`,
                                borderRight: "25px solid transparent",
                                position: "absolute",
                                top: "0",
                                left: "0",
                              }}
                            />
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
                          </Fragment>
                        ) : null}

                        {svgLoader && elm.name == "Digital Twin" ? (
                          <CircularProgress
                            style={{
                              color: metaDataValue.branding.secondaryColor,
                            }}
                          />
                        ) : (
                          <Fragment>
                            <elm.icon
                              style={{
                                color: elm.value
                                  ? metaDataValue.branding.secondaryColor
                                  : "grey",
                                height: "30px",
                                width: "30px",
                              }}
                            />
                            <p
                              style={{
                                color: elm.value
                                  ? metaDataValue.branding.secondaryColor
                                  : "grey",
                                userSelect: "none",
                                fontSize: "10px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              <b>{elm.name}</b>
                            </p>
                          </Fragment>
                        )}
                      </div>
                    );
                  })}
                </div>
              </span>
            </div>
          </div>
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
                    vanish: false,
                    tags: [],
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
          <Button color="secondary" disabled>
            Back
          </Button>
          <Button
            color="secondary"
            id="next"
            type="submit"
            disabled={
              tagsLoader ||
              !detailsForm.values.name ||
              !detailsForm.values.description ||
              svgLoader || isLoading
            }
          >
            Next
          </Button>
          {props.edit ? (
            <Button
              color="secondary"
              id="save"
              onClick={() => {
                if (
                  serviceValue.actuator.length < 1 &&
                  serviceValue.monitoring.length < 1
                )
                  showSnackbar(
                    "Solution",
                    "Select atleast one Monitoring/Controlling parameter",
                    "info",
                    1000,
                    enqueueSnackbar
                  );
                else {
                  props.handleSave();
                }
              }}
              disabled={svgLoader}
            >
              Save
            </Button>
          ) : null}
        </div>
      </form>
    </Fragment>
  );
}
