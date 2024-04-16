import React, { Fragment, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/system";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import TreeView from "@mui/lab/TreeView";
import TreeItem, { treeItemClasses } from "@mui/lab/TreeItem";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import FolderIcon from "@mui/icons-material/Folder";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import hexRgb from "hex-rgb";
import Loader from "components/Progress";
import AddIcon from "@mui/icons-material/Add";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import {
  useGetGroupsQuery,
  useGetOneGroupQuery,
  useDeleteGroupMutation,
  useAddGroupMutation,
  useEditGroupMutation,
} from "services/groups";
import { useSnackbar } from "notistack";
import { useFormik } from "formik";
import * as Yup from "yup";
import Devices from "./Devices";
import { useSelector } from "react-redux";
import DeleteAlert from "components/Alerts/Delete";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import { useGetSignedUsersQuery, useUploadUserMutation } from "services/user";
import CloseIcon from "@mui/icons-material/Close";
import Pin from "assets/img/location-pin.png";

const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.content}`]: {
    color: theme.palette.text.secondary,
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    fontWeight: theme.typography.fontWeightMedium,
    "&.Mui-expanded": {
      fontWeight: theme.typography.fontWeightRegular,
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    "&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused": {
      backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
      color: "var(--tree-view-color)",
    },
    [`& .${treeItemClasses.label}`]: {
      fontWeight: "inherit",
      color: "inherit",
    },
  },
}));
function StyledTreeItem(props) {
  const {
    bgColor,
    color,
    labelIcon: LabelIcon,
    labelInfo,
    labelText,
    ...other
  } = props;

  return (
    <StyledTreeItemRoot
      label={
        <Box sx={{ display: "flex", alignItems: "center", p: 0.5, pr: 0 }}>
          <Box component={LabelIcon} color="inherit" sx={{ mr: 1 }} />
          <Typography
            variant="body2"
            sx={{ fontWeight: "inherit", flexGrow: 1 }}
          >
            {labelText}
          </Typography>
          <Typography variant="caption" color="inherit">
            {labelInfo}
          </Typography>
        </Box>
      }
      style={{
        "--tree-view-color": color,
        "--tree-view-bg-color": bgColor,
      }}
      {...other}
    />
  );
}

StyledTreeItem.propTypes = {
  bgColor: PropTypes.string,
  color: PropTypes.string,
  labelIcon: PropTypes.elementType.isRequired,
  labelInfo: PropTypes.string,
  labelText: PropTypes.string.isRequired,
};

export default function GmailTreeView() {
  const { enqueueSnackbar } = useSnackbar();
  let token = window.localStorage.getItem("token");
  const metaDataValue = useSelector((state) => state.metaData);
  const [addLoader, setAddLoader] = React.useState(false);
  const [loader, setLoader] = React.useState(true);
  const [solution, setSolution] = React.useState(
    metaDataValue.selectedGroup
      ? metaDataValue.selectedGroup
      : metaDataValue.services[0].id
  );
  const [hovered, setHovered] = React.useState(false);
  const [removed, setRemoved] = React.useState(false);
  const [marker, setMarker] = React.useState({
    file: "",
    img: getDefaultMarker(),
    url: getDefaultMarker(),
  });
  const [openPopup, setOpenPopup] = React.useState(false);
  const [popupType, setPopupType] = React.useState(null);
  const [nameIdMap, setNameIdMap] = React.useState({});
  const [
    groupMetaDataParameterMap,
    setGroupMetaDataParameterMap,
  ] = React.useState({});

  const [treeObj, setTreeObj] = React.useState({});
  const [expanded, setExpanded] = React.useState([]);
  const [selected, setSelected] = React.useState("0");
  const [groupIds, setGroupIds] = React.useState([]);
  const [skip, setSkip] = React.useState(true);
  const [group, setGroup] = React.useState("");
  const [rgb, setRgb] = React.useState(
    hexRgb(metaDataValue.branding.secondaryColor)
  );
  const [activeId, setActiveId] = useState(null);
  const [deleteModal, setDelete] = useState(false);
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

  function getDefaultMarker(serviceId = undefined) {
    let id = !serviceId
      ? metaDataValue.services.find((s) => s.id == solution).id
      : serviceId;
    let service = metaDataValue.services.find((s) => s.id == id);
    return service.solutionLayout?.map?.marker
      ? service.solutionLayout?.map?.marker
      : Pin;
  }

  function getDefaultMarker2(serviceId = undefined) {
    let id = !serviceId
      ? metaDataValue.services.find((s) => s.id == solution).id
      : serviceId;
    let service = metaDataValue.services.find((s) => s.id == id);
    return service.solutionLayout?.map?.marker
      ? service.solutionLayout?.map?.marker
      : "";
  }

  function chkDefault() {
    if (getDefaultMarker() == marker.url) {
      return true;
    } else {
      return false;
    }
  }

  useEffect(() => {
    if (!signed.isFetching && signed.isSuccess) {
      upload({ url: signed.data.payload, body: marker.file });
    }
    if (signed.isError) {
      showSnackbar("Marker upload error", signed.error?.message, "error", 1000);
    }
  }, [signed.isFetching]);

  useEffect(() => {
    if (uploadResult.isSuccess) {
      let link = signed.data.payload.split("?")[0];
      setMarker({ ...marker, url: link });
    }
    if (uploadResult.isError) {
      showSnackbar("Marker upload", uploadResult.error?.message, "error", 1000);
    }
  }, [uploadResult]);

  async function toggleDelete(id = null) {
    setActiveId(id);
    setDelete((state) => !state);
  }

  const groupForm = useFormik({
    initialValues: {
      name: "",
      squaremeter: 1,
      person: 1,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required field"),
      squaremeter: Yup.number().min(1),
      person: Yup.number().min(1),
    }),
    onSubmit: async (values) => {
      let body;
      setAddLoader(true);
      switch (popupType) {
        case "Add":
          body = {
            name: values.name,
            marker: marker.url,
            serviceId: solution,
            squaremeter: 1,
            person: 1,
          };
          if (selected && selected != "0") body.parentId = selected;
          addGroup({ token, body });
          setGroup(selected);
          setSkip(false);
          break;

        case "Edit":
          body = {
            name: values.name,
            squaremeter: values.squaremeter ? values.squaremeter : 1,
            person: values.person ? values.person : 1,
            marker:
              marker.file ||
              (marker.url.includes("https://xelerate-video") &&
                getDefaultMarker2() != marker.url)
                ? marker.url
                : "",
          };
          if (body.name == nameIdMap[selected]) {
            delete body.name;
          }
          // if(!body.marker){
          //   delete body.marker;
          // }
          await editGroup({ token, id: selected, body });
          setGroup(selected);
          setSkip(false);
          break;

        default:
          break;
      }
    },
  });

  const [deleteGroup, deleteResult] = useDeleteGroupMutation();

  const [addGroup, addResult] = useAddGroupMutation();

  const [editGroup, editResult] = useEditGroupMutation();
  const service = metaDataValue.services.find(s=>s.id == solution)
  const groups = useGetGroupsQuery({
    token,
    params: service.group?.id ? `${`?groupId=${service.group?.id}`}` : `?serviceId=${solution}${service.group?.id ? `&groupId=${service.group?.id}` : ``}`,
  });

  const singleGroup = useGetOneGroupQuery(
    {
      token,
      params: `?groupId=${group}`,
    },
    { skip: skip || group == "" || selected == "0" || group == "0" }
  );

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  useEffect(() => {
    if (deleteResult.isSuccess) {
      toggleDelete();
      showSnackbar("Groups", deleteResult.data?.message, "success", 1000);
      let tempTreeObj = { ...treeObj };
      let destination = tempTreeObj;
      let parent;
      if (deleteResult.data.payload.length > 0) {
        deleteResult.data.payload.every((elm) => {
          if (elm != selected) {
            destination = destination[elm].childGroups;
            parent = elm;
            return true;
          } else {
            return false;
          }
        });
        if (Object.entries(destination).length == 1) {
          let old = [...expanded];
          old.splice(old.indexOf(parent), 1);
          setExpanded(old);
        }
        delete destination[selected];
      } else {
        if (Object.entries(treeObj).length == 1) {
          setExpanded([]);
        }
        delete destination[selected];
      }
      setTreeObj(tempTreeObj);
      setGroupIds([]);
      setSelected("0");
    }
    if (deleteResult.isError) {
      toggleDelete();
      showSnackbar("Groups", deleteResult.error?.data?.message, "error", 1000);
    }
  }, [deleteResult]);

  useEffect(() => {
    if (addResult.isSuccess) {
      setTimeout(() => {
        setAddLoader(false);
      }, 500);
      handlepopupClose();
      showSnackbar("Groups", addResult.data?.message, "success", 1000);
      if (selected == "0") groups.refetch();
      else if (expanded.indexOf(selected) == -1) {
        let old = [...expanded];
        old.push(selected);
        setExpanded(old);
      }
    }
    if (addResult.isError) {
      setTimeout(() => {
        setAddLoader(false);
      }, 500);
      showSnackbar("Groups", addResult.error?.data?.message, "error", 1000);
    }
  }, [addResult]);

  useEffect(() => {
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
    if (!groups.isFetching && groups.isSuccess) {
      let tempTreeObj = {};
      let tempIds = ["0"];
      let tempNameIdMap = {};
      let tempMetaData = {};
      setTimeout(() => {
        setExpanded(["0"]);
      }, 300);
      if (groups.data.payload.length > 0)
        groups.data.payload.forEach((elm) => {
          tempNameIdMap[elm._id] = elm.name;
          tempMetaData[elm._id] = elm.metaData;
          tempIds.push(elm._id);
          let tempChild = {};
          if (elm.childGroups.length > 0)
            elm.childGroups.forEach((child, i) => {
              tempNameIdMap[child._id] = child.name;
              tempMetaData[child._id] = child.metaData;
              let loader = {};
              loader[`${child._id}-${i}`] = {
                name: "Loading...",
                id: `${child._id}-${i}`,
                childGroups: {},
              };
              tempChild[child._id] = {
                name: child.name,
                id: child._id,
                childGroups: child.childGroups.length > 0 ? loader : {},
              };
            });
          tempTreeObj[elm._id] = {
            name: elm.name,
            id: elm._id,
            childGroups: tempChild,
          };
        });
      setGroupIds(tempIds);
      setTreeObj(tempTreeObj);
      setNameIdMap(tempNameIdMap);
      setGroupMetaDataParameterMap(tempMetaData);
      setGroup("");
      setSelected("0");
      setLoader(false);
    }
    if (groups.isError) {
      showSnackbar("Groups", groups.error.data?.message, "error", 1000);
    }
  }, [groups.isFetching]);

  useEffect(() => {
    if (singleGroup.isSuccess && singleGroup.data.payload.length > 0) {
      let tempTreeObj = { ...treeObj };
      let tempNameIdMap = { ...nameIdMap };
      let tempChild = {};
      let tempMetaData = { ...groupMetaDataParameterMap};
      let data = singleGroup.data.payload[0];
      let tempIds = [...groupIds];
      tempIds.push(data._id);
      tempNameIdMap[data._id] = data.name;
      tempMetaData[data._id] = data.metaData;
      if (data.childGroups.length > 0)
        data.childGroups.forEach((child, i) => {
          tempNameIdMap[child._id] = child.name;
          tempMetaData[child._id] = child.metaData;
          let loader = {};
          loader[`${child._id}-${i}`] = {
            name: "Loading...",
            id: `${child._id}-${i}`,
            childGroups: {},
          };
          tempChild[child._id] = {
            name: child.name,
            id: child._id,
            childGroups: child.childGroups.length > 0 ? loader : {},
          };
        });
      let destination = tempTreeObj;
      if (data.parentChain.length > 0) {
        data.parentChain.forEach((elm) => {
          if (elm != data._id && (destination && destination[elm])) destination = destination[elm].childGroups;
        });
        destination[data._id] = {
          name: data.name,
          id: data._id,
          childGroups: tempChild,
        };
      } else {
        destination[data._id] = {
          name: data.name,
          id: data._id,
          childGroups: tempChild,
        };
      }
      setGroupIds(tempIds);
      setTreeObj(tempTreeObj);
      setNameIdMap(tempNameIdMap);
      setGroupMetaDataParameterMap(tempMetaData);
      if (data.marker) {
        setMarker({ file: "", img: data.marker, url: data.marker });
      }
    }
    if (singleGroup.isError) {
      showSnackbar("Group", singleGroup.error.data?.message, "error", 1000);
    }
  }, [singleGroup.isFetching]);

  function treeStruct(parent) {
    return (
      <Fragment>
        {Object.keys(parent).map((elm) => {
          return (
            <StyledTreeItem
              nodeId={parent[elm].id}
              labelText={parent[elm].name}
              labelIcon={FolderIcon}
              labelInfo={parent[elm].noOfDevices}
              color={metaDataValue.branding.secondaryColor}
              bgColor={`rgb(${rgb.red}, ${rgb.green}, ${rgb.blue},0.1)`}
            >
              {parent[elm].childGroups &&
              Object.keys(parent[elm].childGroups).length > 0
                ? treeStruct(parent[elm].childGroups)
                : null}
            </StyledTreeItem>
          );
        })}
      </Fragment>
    );
  }

  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };

  const handleSelect = (event, nodeIds) => {
    setSelected(nodeIds);
    if (groupIds.indexOf(nodeIds) == -1) {
      setSkip(false);
      setGroup(nodeIds);
    }
  };

  const handlepopupClose = () => {
    setOpenPopup(false);
    setTimeout(() => {
      setMarker({
        file: "",
        img: getDefaultMarker(),
        url: getDefaultMarker(),
      });
      setRemoved(false);
    }, 500);
    // setMarker({ file: "", img: "", url: "" });
  };

  const handlepopupOpen = () => {
    setOpenPopup(true);
  };

  function handleOnClick(type) {
    setPopupType(type);
    if (type == "Edit") {
      groupForm.values.name = nameIdMap[selected];
      if(groupForm?.values && groupForm.values.squaremeter)
        groupForm.values.squaremeter = groupMetaDataParameterMap[selected].squaremeter ? groupMetaDataParameterMap[selected].squaremeter : 1;
      if(groupForm?.values && groupForm.values.person)
        groupForm.values.person = groupMetaDataParameterMap[selected].person ? groupMetaDataParameterMap[selected].person : 1;
      let marker =
        selected == singleGroup?.data?.payload[0]?._id
          ? singleGroup?.data?.payload[0]
            ? singleGroup?.data?.payload[0]?._id == selected &&
              singleGroup?.data?.payload[0]?.marker
            : groups.data.payload.find((g) => g._id == selected)?.marker
          : groups.data.payload.find((g) => g._id == selected)?.marker;

      setMarker({
        file: "",
        url: marker || getDefaultMarker(),
        img: marker || getDefaultMarker(),
      });
    } else groupForm.values.name = "";
    handlepopupOpen();
  }

  function getMarker() {
    if (openPopup) {
      let gotMarker =
        (singleGroup?.data?.payload[0]?._id == selected &&
          singleGroup?.data?.payload[0]?.marker) ||
        groups.data.payload.find((g) => g._id == selected)?.marker;
      // if (gotMarker) {
      //   setMarker({ file: "", img: gotMarker, url: gotMarker });
      // }
      return gotMarker;
    } else {
      return "";
    }
  }

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
        // Create Blob file from URL
      };
    };
  };

  return (
    <Card
      style={{
        padding: "20px",
      }}
    >
      <Dialog
        open={openPopup}
        onClose={handlepopupClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle>
          {popupType == "Add" ? "Add Group" : "Edit Group"}
        </DialogTitle>
        <form onSubmit={groupForm.handleSubmit}>
          <DialogContent>
            <TextField
              id="name"
              required
              margin="dense"
              label="Name"
              fullWidth
              value={groupForm.values.name}
              onChange={groupForm.handleChange}
              onBlur={groupForm.handleBlur}
              helperText={groupForm.touched.name ? groupForm.errors.name : ""}
              error={groupForm.touched.name && groupForm.errors.name}
            />

            <TextField
              id="squaremeter"
              margin="dense"
              label="Area (m2)"
              fullWidth
              value={groupForm.values.squaremeter}
              onChange={groupForm.handleChange}
              onBlur={groupForm.handleBlur}
              helperText={
                groupForm.touched.squaremeter
                  ? groupForm.errors.squaremeter
                  : ""
              }
              error={
                groupForm.touched.squaremeter && groupForm.errors.squaremeter
              }
            />

            <TextField
              id="person"
              margin="dense"
              label="Occupants"
              fullWidth
              value={groupForm.values.person}
              onChange={groupForm.handleChange}
              onBlur={groupForm.handleBlur}
              helperText={
                groupForm.touched.person ? groupForm.errors.person : ""
              }
              error={groupForm.touched.person && groupForm.errors.person}
            />
            {(
              popupType == "Add"
                ? !(selected && selected != "0")
                : groups?.data?.payload?.map((g) => g._id).includes(selected)
            ) ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "10px",
                  maxHeight: "33px",
                  margin: "35px 0 5px 0",
                }}
              >
                <p style={{ color: "#cccccc", fontWeight: "600" }}>
                  Map Marker
                </p>
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
                    {!(marker.img || getMarker() || getDefaultMarker()) ? (
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
                    ) : (
                      <div></div>
                    )}
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
                    {marker.img || getMarker() || getDefaultMarker2() ? (
                      <img
                        onClick={() =>
                          document.getElementById("marker-img").click()
                        }
                        src={marker?.img || getMarker()}
                        style={{
                          cursor: "pointer",
                          width: "32px",
                          height: "33px",
                          borderRadius: "10%",
                          marginLeft: "15px",
                        }}
                      />
                    ) : null}
                    {hovered &&
                    (marker.img || getMarker()) &&
                    !removed &&
                    !chkDefault() ? (
                      <CloseIcon
                        color="error"
                        sx={{
                          fontSize: 13,
                          position: "absolute",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setMarker({
                            file: "",
                            img: getDefaultMarker(),
                            url: getDefaultMarker(),
                          });
                          setRemoved(true);
                        }}
                      />
                    ) : null}
                  </div>
                )}
              </div>
            ) : null}
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
                disabled={signed.isLoading || uploadResult.isLoading}
              >
                <span>{popupType == "Add" ? popupType : "Save"}</span>
              </Button>
            )}
          </DialogActions>
        </form>
      </Dialog>
      <div
        style={{
          display: "flex",
          height: "100%",
          height: "calc(100vh - 180px)",
        }}
      >
        <div style={{ height: "100%" }}>
          <h4
            style={{
              color: "#bfbec8",
              margin: "10px 10px 20px 10px",
            }}
          >
            <strong>Groups</strong>
          </h4>
          <FormControl fullWidth>
            <InputLabel>Solution *</InputLabel>
            <Select
              fullWidth
              required
              value={solution}
              onChange={(e) => {
                setSolution(e.target.value);
                setMarker({
                  file: "",
                  img: getDefaultMarker(e.target.value),
                  url: getDefaultMarker(e.target.value),
                });
                setLoader(true);
              }}
              label={"Solution *"}
            >
              {metaDataValue.services
                .filter(
                  (s) => metaDataValue.groupPermissions[s.id] != "DISABLE"
                )
                .map((elm) => (
                  <MenuItem value={elm.id}>{elm.name}</MenuItem>
                ))}
            </Select>
          </FormControl>

          {loader ? (
            <div
              style={{
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Loader />
            </div>
          ) : (
            <div style={{ width: "300px", marginTop: "20px", height: "100%" }}>
              <TreeView
                aria-label="gmail"
                defaultCollapseIcon={<ArrowDropDownIcon />}
                defaultExpandIcon={<ArrowRightIcon />}
                defaultEndIcon={<div style={{ width: 24 }} />}
                expanded={expanded}
                selected={selected}
                onNodeToggle={handleToggle}
                onNodeSelect={handleSelect}
                sx={{
                  height: "calc(100vh - 370px)",
                  flexGrow: 1,
                  maxWidth: 400,
                  overflowY: "scroll",
                }}
              >
                {Object.keys(treeObj).length > 0 ? (
                  service.group?.id ?
                  treeStruct(treeObj)
                  :
                  <StyledTreeItem
                    nodeId={"0"}
                    labelText={"All Groups"}
                    labelIcon={AccountTreeIcon}
                    color={metaDataValue.branding.secondaryColor}
                    bgColor={`rgb(${rgb.red}, ${rgb.green}, ${rgb.blue},0.1)`}
                  >
                    {treeStruct(treeObj)}
                  </StyledTreeItem>
                ) : (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#c8c8c8",
                    }}
                  >
                    <AccountTreeIcon
                      style={{ height: "40px", width: "40px" }}
                    />
                    <p>No Groups Found</p>
                  </div>
                )}
              </TreeView>
              {metaDataValue.groupPermissions[solution] == "ALL" &&
              metaDataValue.appPaths.find((a) => a.name == "Group Management")
                .permission == "ALL" ? (
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "20px",
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<DeleteIcon />}
                    color="error"
                    disabled={selected != "0" ? false : true}
                    onClick={() => toggleDelete(selected)}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    color="secondary"
                    disabled={selected != "0" ? false : true}
                    onClick={() => {
                      handleOnClick("Edit");
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    color="secondary"
                    onClick={() => {
                      handleOnClick("Add");
                    }}
                  >
                    Add
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </div>
        <Divider orientation="vertical" flexItem style={{ margin: "20px" }} />
        <Devices
          id={selected}
          solution={solution}
          marker={groups?.data?.payload?.find((p) => p._id == selected)?.marker}
          devices={groups?.data?.payload?.find((p) => p._id == selected)?.devices}
          groups={groups}
          selectedGroup = {groups?.data?.payload?.find((p) => p._id == selected)}
        />
      </div>
      {activeId ? (
        <DeleteAlert
          deleteModal={deleteModal}
          question="All the child groups will also be deleted, Are you sure you want to proceed?"
          id={activeId}
          handleDelete={(selected) => {
            deleteGroup({ token, id: selected });
          }}
          handleClose={toggleDelete}
          deleteResult={deleteResult}
        />
      ) : null}
    </Card>
  );
}
