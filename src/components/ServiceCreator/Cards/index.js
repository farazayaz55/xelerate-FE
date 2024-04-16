import React, { Fragment, useState, useEffect } from "react";
import { makeStyles } from "@mui/styles";
import IconButton from "@mui/material/IconButton";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import Grid from "@mui/material/Grid";
import Catalogue from "./avatar";
import Search from "../../Search";
import { useSelector } from "react-redux";
import Skeleton from "components/Card Skeleton";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import Chip from "@mui/material/Chip";
import InfoIcon from "@mui/icons-material/Info";
import Zoom from "@mui/material/Zoom";
import Tooltip from "@mui/material/Tooltip";
import { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import { Divider } from "@mui/material";
import { Typography } from "antd";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import { DialogContent, DialogContentText } from "@mui/material";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { useDeleteSensorMutation } from "services/services";
import { useSnackbar } from "notistack";
import { Air } from "@mui/icons-material";
import Rensair from "../../../assets/icons/rensair-logo.png";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
}));

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#f5f5f9",
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

export default function CheckboxListSecondary(props) {
  const metaDataValue = useSelector((state) => state.metaData);
  const [page, setPage] = useState({ Asset: 0, Monitoring: 0, Actuator: 0 });
  const services = metaDataValue.services;
  console.log("services in cards", services);
  const [notFound, setNotFound] = useState(false);
  const [filterFn, setFilterFn] = useState({
    fn: (items) => {
      return items;
    },
  });
  const [deleteSensor, deleteSensorResult] = useDeleteSensorMutation();
  const [openModal, setOpenModal] = useState(false);
  const [deleteDatapointObj, setDeleteDatapointObj] = useState(null);
  let token = window.localStorage.getItem("token");
  const { enqueueSnackbar } = useSnackbar();
  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar(
      { title, message: message ? message : "Something went wrong", variant },
      { timeOut }
    );
  }
  useEffect(() => {
    if (deleteSensorResult.isSuccess) {
      showSnackbar(
        "Solution",
        deleteSensorResult.data?.message,
        "success",
        1000
      );
    }
    if (deleteSensorResult.isError) {
      showSnackbar(
        "Solution",
        deleteSensorResult.error?.data?.message,
        "error",
        1000
      );
    }
  }, [deleteSensorResult]);

  function arrayUnique(array) {
    var a = array.concat();
    for (var i = 0; i < a.length; ++i) {
      for (var j = i + 1; j < a.length; ++j) {
        if (a[i] === a[j]) a.splice(j--, 1);
      }
    }
    return a;
  }
  function itemGenerator(array, x = 0, temp = [], end = false) {
    var a = array.concat();
    if (a.length == 1) return a[0];
    for (var i = 1; i < a.length; ++i) {
      if (end) {
        temp = arrayUnique(temp.concat(a[x]));
        i = a.length;
      } else {
        temp = arrayUnique(temp.concat(arrayUnique(a[x].concat(a[x + 1]))));
      }
      x += 2;
      if (x >= a.length - 1) {
        if (a.length % 2 == 0) {
          i = a.length;
        } else {
          end = true;
        }
      }
    }
    return temp;
  }

  const handleSearch = (e) => {
    let old = { ...page };
    old[props.name] = 0;
    setPage(old);
    let target = e.target;
    setFilterFn({
      fn: (items) => {
        if (target.value == "") {
          props.parameters.forEach((prop) => delete prop.searched);
          return items;
        } else {
          var temp = [];
          ["name"].forEach((elm) => {
            temp.push(
              items.filter((x) =>
                x[elm].toLowerCase().includes(target.value.toLowerCase())
              )
            );
          });
          props.parameters.forEach((prop) => {
            if (itemGenerator(temp).find((t) => t.id == prop.id)) {
              prop.searched = true;
            } else {
              delete prop.searched;
            }
          });

          return itemGenerator(temp);
        }
      },
    });
  };

  const handleToggleAsset = (assetId) => {
    props.setSelectedAsset(assetId);
  };
  const handlePageNext = () => {
    let old = { ...page };
    old[props.name] = page[props.name] + 1;
    setPage(old);
  };
  const handlePagePrevious = () => {
    let old = { ...page };
    old[props.name] = page[props.name] - 1;
    setPage(old);
  };

  function back(page) {
    let disabled;
    if (page != 0) disabled = false;
    else disabled = true;
    return (
      <IconButton
        id="previous"
        size="medium"
        onClick={handlePagePrevious}
        disabled={disabled}
      >
        <NavigateBeforeIcon fontSize="inherit" />
      </IconButton>
    );
  }
  const pageSize =
    props.name === "Asset" || (props.allAssets && props.allAssets.length === 1)
      ? 8
      : 6;

  function next(page) {
    let disabled;
    if (
      page * pageSize + pageSize <=
        (props.parameters.filter((p) => p.searched).length ||
          props.parameters.length) -
          1 &&
      filterFn.fn(props.parameters).length
    )
      disabled = false;
    else disabled = true;
    return (
      <IconButton
        id="next"
        size="medium"
        onClick={handlePageNext}
        disabled={disabled}
      >
        <NavigateNextIcon fontSize="inherit" />
      </IconButton>
    );
  }
  const AllowedMultiAsset = ["Monitoring", "Actuator"];

  function isSensorIdExists(sensorIdToCheck) {
    // Using nested loops
    for (let i = 0; i < services.length; i++) {
      const sensors = services[i].sensors;
      for (let j = 0; j < sensors.length; j++) {
        if ((sensors[j].id || sensors[j]._id) === sensorIdToCheck) {
          return true; // Sensor ID exists
        }
      }
    }
    return false; // Sensor ID does not exist
  }
  const deleteSensorFunction = (elm) => {
    setDeleteDatapointObj(elm);
    if (!isSensorIdExists(elm.id || elm._id)) {
      setOpenModal(true);
    } else {
      showSnackbar(
        "Solution",
        "Datapoint is already in use in other soultion(s)",
        "error",
        1000
      );
    }
    console.log("elm", elm);
  };
  const accept = () => {
    setOpenModal(false);
    const id = deleteDatapointObj.id || deleteDatapointObj._id;
    deleteSensor({ token, id });
  };
  const reject = () => {
    setOpenModal(false);
  };
  return (
    <div>
      <Dialog open={openModal} onClose={reject}>
        <DialogTitle id="alert-dialog-title">
          Remove {deleteDatapointObj?.friendlyName}
        </DialogTitle>
        <DialogContent style={{ overflow: "hidden" }}>
          <DialogContentText id="alert-dialog-description">
            <span style={{ display: "flex", flexDirection: "column" }}>
              Are you sure to remove datapoint permanantly
            </span>
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
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            width: "50%",
            minHeight: "calc(50vh - 19.875rem)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Search handleSearch={handleSearch} />
        </div>
      </span>
      <div>
        {props.loader ? (
          <Grid
            container
            style={{
              maxHeight: "18rem",
              overflowY: "scroll",
              overflowX: "hidden",
              marginBottom: "10rem",
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(() => {
              return (
                <Grid item xs={3}>
                  <Skeleton />
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Fragment>
            <Grid container spacing={2} style={{}}>
              {AllowedMultiAsset.includes(props.name) &&
                props.allAssets &&
                props.allAssets.length > 1 && (
                  <>
                    <Grid
                      item
                      xs={12}
                      md={3}
                      padding={"1rem"}
                      display={"flex"}
                      spacing={1}
                      gap={"0.5rem"}
                      style={{
                        maxHeight: "20rem",
                      }}
                    >
                      <Grid
                        style={{
                          overflowY: "scroll",
                          overflowX: "hidden",
                          width: "100%",
                        }}
                      >
                        {props.allAssets &&
                          props.allAssets.map((elm, ind) => {
                            let value = elm?.name;
                            let icon = elm?.icon;
                            let featureTabs = elm?.featureTabs;
                            let assetMapping = props.assetMapping.find(
                              (item) => item.assetId === elm.id
                            );
                            let label = "";
                            let count = 0;
                            if (props.name === "Monitoring") {
                              if (props.type && props.type === "valueInsight") {
                                count =
                                  assetMapping &&
                                  assetMapping?.valueInsights?.length
                                    ? assetMapping.valueInsights.length
                                    : 0;
                                label = "Number of Value Insight datapoints";
                              } else {
                                count =
                                  assetMapping && assetMapping?.sensors?.length
                                    ? assetMapping.sensors.length
                                    : 0;
                                label = "Number of Datapoints";
                              }
                            } else if (props.name === "Actuator") {
                              count =
                                assetMapping && assetMapping?.actuators?.length
                                  ? assetMapping.actuators.length
                                  : 0;
                              label = "Number of Actuators";
                            }
                            let id = elm?.id;
                            let tags = elm?.tags;
                            let str = "";
                            if (tags)
                              tags.slice(0, 3).forEach((elm) => {
                                str = str.concat(` #${elm}`);
                              });
                            let description = elm?.description;
                            let image = elm?.image;
                            return (
                              <Card
                                id={`asset-` + ind}
                                style={{
                                  margin: "10px 10px",
                                  border:
                                    props.selectedAsset === id
                                      ? `2px solid ${metaDataValue.branding.secondaryColor}`
                                      : `2px solid #f7f7f7`,
                                  backgroundColor: "#f7f7f7",
                                  boxShadow:
                                    props.selectedAsset === id
                                      ? ""
                                      : "rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
                                }}
                                onClick={() => handleToggleAsset(id)}
                              >
                                <CardActionArea
                                  style={{
                                    height: "6.813rem",
                                    position: "relative",
                                  }}
                                >
                                  {props.selectedAsset === id ? (
                                    <div
                                      style={{
                                        width: "0",
                                        height: "0",
                                        borderTop: `50px solid ${metaDataValue.branding.secondaryColor}`,
                                        borderRight: "50px solid transparent",
                                        position: "absolute",
                                        top: "0",
                                        left: "0",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <CheckIcon
                                        style={{
                                          width: "20px",
                                          height: "20px",
                                          position: "relative",
                                          color: "white",
                                          bottom: "32px",
                                          left: "15px",
                                        }}
                                      />
                                    </div>
                                  ) : null}
                                  <div style={{ margin: "10px" }}>
                                    <span>
                                      <Catalogue
                                        zoomOut={props.zoomOut}
                                        title={
                                          elm?.friendlyName
                                            ? elm?.friendlyName
                                            : value
                                        }
                                        parameters={tags}
                                        image={image}
                                        icon={icon}
                                        description={description}
                                      />
                                    </span>
                                  </div>
                                  <Tooltip
                                    title={label}
                                    placement="bottom"
                                    arrow
                                    TransitionComponent={Zoom}
                                  >
                                    <Chip
                                      size="small"
                                      color="secondary"
                                      label={count ? count : 0}
                                      variant="outlined"
                                      style={{
                                        position: "absolute",
                                        top: "10px",
                                        right: "10px",
                                      }}
                                    />
                                  </Tooltip>
                                  {elm.config ? (
                                    <SettingsOutlinedIcon
                                      color="primary"
                                      style={{
                                        position: "absolute",
                                        bottom: "10px",
                                        left: "10px",
                                      }}
                                    />
                                  ) : null}
                                </CardActionArea>
                              </Card>
                            );
                          })}
                      </Grid>
                      <Divider
                        orientation="vertical"
                        flexItem
                        sx={{ mr: "-0.063rem" }}
                      />
                    </Grid>
                  </>
                )}

              <Grid
                marginBottom={
                  !AllowedMultiAsset.includes(props.name) ? "4.4rem" : ""
                }
                style={{
                  height: !AllowedMultiAsset.includes(props.name)
                    ? "calc(50vh - 4.875rem)"
                    : "18.3rem",
                  overflowY: "scroll",
                  overflowX: "hidden",
                }}
                item
                xs={12}
                md={
                  AllowedMultiAsset.includes(props.name) &&
                  props.allAssets &&
                  props.allAssets.length > 1
                    ? 9
                    : 12
                }
              >
                <Grid container spacing={2}>
                  {filterFn.fn(props.parameters).length ? (
                    filterFn
                      .fn(props.parameters)
                      .slice(
                        page[props.name] * pageSize,
                        page[props.name] * pageSize + pageSize
                      )
                      .map((elm, ind) => {
                        let id = elm.id;
                        let value = elm.name;
                        let icon = elm?.icon;
                        let featureTabs = elm?.featureTabs;
                        let tags = elm.tags;
                        let str = "";
                        if (tags)
                          tags.slice(0, 3).forEach((elm) => {
                            str = str.concat(` #${elm}`);
                          });
                        let description = elm.description;
                        let image = elm.image;
                        return (
                          <Grid
                            item
                            xs={
                              AllowedMultiAsset.includes(props.name) &&
                              props.allAssets &&
                              props.allAssets.length > 1
                                ? 4
                                : 3
                            }
                          >
                            <Card
                              id={`asset-` + ind}
                              style={{
                                border:
                                  props.selected != undefined &&
                                  props.selected.length &&
                                  props.selected.includes(id)
                                    ? `2px solid ${metaDataValue.branding.secondaryColor}`
                                    : `2px solid #f7f7f7`,
                                backgroundColor: "#f7f7f7",
                                maxHeight: "7.813rem",
                                boxShadow:
                                  props.selected != undefined &&
                                  props.selected.length &&
                                  props.selected.includes(id)
                                    ? ""
                                    : "rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
                                position:'relative'
                              }}
                              onClick={() =>
                                {props.handleToggle({
                                  name: value,
                                  id: id,
                                  description: description,
                                  image: image,
                                  featureTabs: featureTabs,
                                  friendlyName: elm?.friendlyName,
                                  operation: elm?.operation,
                                });
                              }}
                            >
                              {elm.aqdt ? (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: "5px",
                                    right: "5px",
                                    display: "flex",
                                    gap: "5px",
                                  }}
                                >
                                  <img
                                    src={Rensair}
                                    style={{
                                      width: "50px",
                                      height: "20px",
                                      objectFit: "contain",
                                    }}
                                  />
                                  <Air />
                                </div>
                              ) : null}
                              <CardActionArea
                                style={{
                                  height: "7.813rem",
                                  position: "relative",
                                }}
                              >
                                {props.selected != undefined &&
                                props.selected.length &&
                                props.selected.includes(id) ? (
                                  <div
                                    style={{
                                      width: "0",
                                      height: "0",
                                      borderTop: `50px solid ${metaDataValue.branding.secondaryColor}`,
                                      borderRight: "50px solid transparent",
                                      position: "absolute",
                                      top: "0",
                                      left: "0",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <CheckIcon
                                      style={{
                                        width: "20px",
                                        height: "20px",
                                        position: "relative",
                                        color: "white",
                                        bottom: "32px",
                                        left: "15px",
                                      }}
                                    />
                                  </div>
                                ) : null}
                                <div style={{ margin: "10px" }}>
                                  <span>
                                    <Catalogue
                                      zoomOut={props.zoomOut}
                                      title={
                                        elm?.friendlyName
                                          ? elm?.friendlyName
                                          : value
                                      }
                                      parameters={tags}
                                      image={image}
                                      icon={icon}
                                      description={description}
                                    />
                                  </span>
                                </div>

                                {props.name == "Monitoring" ? (
                                  <>
                                    {elm.operation ? (
                                      <HtmlTooltip
                                        title={
                                          <Fragment>
                                            <div
                                              style={{
                                                display: elm.operation
                                                  ? "flex"
                                                  : "none",
                                              }}
                                            >
                                              {elm.operation}
                                            </div>
                                          </Fragment>
                                        }
                                        placement="bottom"
                                        arrow
                                        TransitionComponent={Zoom}
                                      >
                                        <Chip
                                          size="small"
                                          color="secondary"
                                          label={elm?.tags[0]}
                                          variant="outlined"
                                          style={{
                                            position: "absolute",
                                            top: "10px",
                                            right: "10px",
                                          }}
                                        />
                                      </HtmlTooltip>
                                    ) : (
                                      <Chip
                                        size="small"
                                        color="secondary"
                                        label={elm?.tags[0]}
                                        variant="outlined"
                                        style={{
                                          position: "absolute",
                                          top: "1px",
                                          right: "10px",
                                        }}
                                      />
                                    )}
                                    {props?.selected?.length &&
                                    !props.selected?.includes(id) ? (
                                      <Tooltip
                                        title="Clear"
                                        placement="bottom"
                                        arrow
                                        TransitionComponent={Zoom}
                                      >
                                        {/* <IconButton
                                          color="secondary"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteSensorFunction(elm);
                                          }}
                                          style={{
                                            height: "30px",
                                            width: "30px",
                                            top: "5.5rem",
                                            left: "25.5rem",
                                            position: "absolute",
                                          }}
                                        >
                                          <DeleteIcon
                                            style={{
                                              cursor: "pointer",
                                              height: "20px",
                                              width: "20px",
                                            }}
                                          />
                                        </IconButton> */}
                                      </Tooltip>
                                    ) : null}
                                  </>
                                ) : null}

                                {props.name == "Actuator" ? (
                                  <Tooltip
                                    title={elm?.command}
                                    placement="bottom"
                                    arrow
                                    TransitionComponent={Zoom}
                                  >
                                    <InfoIcon
                                      style={{
                                        position: "absolute",
                                        top: "10px",
                                        right: "10px",
                                        color: "grey",
                                      }}
                                    />
                                  </Tooltip>
                                ) : null}

                                {elm.config ? (
                                  <SettingsOutlinedIcon
                                    color="primary"
                                    style={{
                                      position: "absolute",
                                      bottom: "10px",
                                      left: "10px",
                                    }}
                                  />
                                ) : null}
                              </CardActionArea>
                            </Card>
                          </Grid>
                        );
                      })
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: 22,
                        margin: "35px 0px",
                        width: "100%",
                        fontWeigt: 500,
                      }}
                    >
                      No Search Results
                    </div>
                  )}
                </Grid>
              </Grid>
              {AllowedMultiAsset.includes(props.name) && (
                <Grid
                  container
                  textAlign={"center"}
                  minHeight={"calc(50vh - 21.875rem)"}
                  marginTop={"3rem"}
                  overflow={"auto"}
                  display={"block"}
                >
                  <Grid item md={12}>
                    {props?.selectedAssetIndex != undefined &&
                      props?.selectedAssetIndex !== -1 &&
                      props.selected.map((elm, ind) => {
                        let datapoint =
                          props.uniqueSelected &&
                          props.uniqueSelected.find(
                            (obj) => obj?.id === elm || obj?._id === elm
                          );
                        return (
                          <>
                            <Chip
                              sx={{
                                "& .MuiChip-deleteIcon": {
                                  color: "white",
                                },
                              }}
                              size="small"
                              color="secondary"
                              label={
                                datapoint?.friendlyName
                                  ? datapoint?.friendlyName
                                  : datapoint?.name
                              }
                              variant="filled"
                              onDelete={() => {
                                props.handleToggle(datapoint);
                              }}
                              style={{
                                background: "#008000",
                                color: "white",
                                margin: "0.3rem",
                              }}
                            />
                          </>
                        );
                      })}
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Fragment>
        )}
      </div>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Grid container justifyContent={"center"} spacing={3}>
          {AllowedMultiAsset.includes(props.name) && (
            <Grid
              item
              xs={6}
              justifyContent={"end"}
              display={"flex"}
              alignItems={"center"}
            >
              <Typography
                style={{
                  fontSize: "100%",
                  fontWeight: 700,
                  lineHeight: "23px",
                  color: "#D3D3D3",
                }}
              >
                Selected{" "}
                {props.name == "Monitoring" ? "Datapoints" : "Actuators"} (
                {props?.selectedAssetIndex != undefined &&
                props?.selectedAssetIndex !== -1 &&
                props.selected.length
                  ? props.selected.length
                  : 0}
                )
              </Typography>
            </Grid>
          )}

          <Grid
            item
            xs={6}
            justifyContent={
              AllowedMultiAsset.includes(props.name) ? "start" : "center"
            }
            display={"flex"}
            alignItems={"center"}
          >
            {back(page[props.name])}
            <p>
              <span style={{ marginRight: "0.5rem" }}>Page</span>
              {page[props.name] +
                1 +
                "/" +
                Math.ceil(filterFn.fn(props.parameters).length / pageSize)}
            </p>
            {next(page[props.name])}
          </Grid>
        </Grid>
      </span>
    </div>
  );
}
