import React, { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { useAddGeoGroupMutation, useAddGroupMutation } from "services/groups";
import { useSnackbar } from "notistack";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import { useGetSignedUsersQuery, useUploadUserMutation } from "services/user";
import {
  useGetGroupsQuery,
  useGetOneGroupQuery,
  useUpdateGroupMutation,
} from "services/groups";

import CloseIcon from "@mui/icons-material/Close";
import Pin from "assets/img/location-pin.png";
import Loader from "components/Progress";
import { setSelectedGroup } from "rtkSlices/metaDataSlice";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

export default function GmailTreeView({
  setOpenPopup,
  clear,
  solution,
  group,
  geofence,
}) {
  const { enqueueSnackbar } = useSnackbar();
  let token = window.localStorage.getItem("token");
  const metaDataValue = useSelector((state) => state.metaData);
  const [addLoader, setAddLoader] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [marker, setMarker] = useState({
    file: "",
    img: getDefaultMarker(),
    url: getDefaultMarker(),
  });
  const [expanded, setExpanded] = useState([]);
  const [selected, setSelected] = useState("0");
  const [groupsData, setGroupsData] = useState([]);
  const [existingGroup, setExistingGroup] = useState(null);

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
  console.log("solution", solution);
  console.log("metaDataValue", metaDataValue);

  let selectedSerivce = metaDataValue.services.find((s) => s.id == solution);

  const groups = useGetGroupsQuery({
    token,
    refetch: true,
    params: selectedSerivce.group?.id
      ? `${`?groupId=${selectedSerivce.group?.id}`}`
      : `?serviceId=${selectedSerivce.id}${selectedSerivce.group?.id
        ? `&groupId=${selectedSerivce.group?.id}`
        : ``
      }`,
  });

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
    if (!groups.isFetching && groups.isSuccess) {
      const groupsData = [{ name: '[ Create New Group ]', _id: "123Empty" }, ...groups?.data?.payload]
      setGroupsData(groupsData);
    }
  }, [groups.isFetching]);
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

  const groupForm = useFormik({
    initialValues: {
      name: "",
      existingGroup: "123Empty",
    },
    onSubmit: async (values) => {
      if (!values.name && !values.existingGroup) {
        showSnackbar(
          "Groups",
          "Please select any existing group or specify a name for new group",
          "error",
          1000
        );
      } else {
        setAddLoader(true);
        if (values.existingGroup !='123Empty') {
          let body = {
            addDevices: true,
            devices: devicesResult?.data?.payload?.devices,
            marker: marker.url,
          };
          editGroup({ token, id: values.existingGroup, body });
          groups.refetch()
        } else {
          let body = {
            name: values.name,
            marker: marker.url,
            serviceId: solution,
            devices: devicesResult?.data?.payload?.devices,
          };
          if (group) body.parentId = group;
          {
            addGroup({ token, body });
            groups.refetch()
          }
        }
      }
    },
  });

  const [addGroup, addResult] = useAddGroupMutation();
  const [getDevices, devicesResult] = useAddGeoGroupMutation();
  const [editGroup, editResult] = useUpdateGroupMutation();

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  useEffect(() => {
    let body = { coordinates: geofence.coordinates, serviceId: solution };
    getDevices({ token, body });
    return () => { };
  }, []);

  useEffect(() => {
    if (addResult.isSuccess) {
      setTimeout(() => {
        setAddLoader(false);
      }, 500);
      handlepopupClose();
      showSnackbar("Groups", addResult.data?.message, "success", 1000);
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
      showSnackbar("Groups", editResult.error?.data?.message, "error", 1000);
    }
  }, [editResult]);

  const handlepopupClose = () => {
    setOpenPopup(false);
    clear();
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

  function getMarker() {
    let gotMarker =
      (singleGroup?.data?.payload[0]?._id == selected &&
        singleGroup?.data?.payload[0]?.marker) ||
      groups.data.payload.find((g) => g._id == selected)?.marker;
    // if (gotMarker) {
    //   setMarker({ file: "", img: gotMarker, url: gotMarker });
    // }
    return gotMarker;
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
    <Dialog open onClose={handlepopupClose} aria-labelledby="form-dialog-title">
      <DialogTitle>Create group using polygon</DialogTitle>
      {!devicesResult.isFetching && !groups.isFetching ? (
        <form onSubmit={groupForm.handleSubmit}>
          <DialogContent>
            <p
              style={{
                position: "relative",
                bottom: "15px",
                fontSize: "13px",
                color: "grey",
                minWidth: "30rem",
              }}
            >
              Group will contain (
              {devicesResult?.data?.payload?.devices?.length}) asset(s)
            </p>

            {!groups.isFetching && groupsData.length ? (
              <>
                <FormControl fullWidth>
                  <InputLabel
                    id="demo-simple-select-label"
                  // style={{ color: "black" }}
                  >
                    Select Group
                  </InputLabel>
                  <Select
                    value={groupForm.values.existingGroup}
                    labelId="demo-simple-select-label"
                    label="Select Group"
                    disabled={groups.isFetching}
                    onChange={(e) => {
                      groupForm.setValues({ existingGroup: e.target.value });
                    }}

                    style={{
                      // background: metaDataValue.branding.primaryColor,
                      paddingRight: "5px",
                      color: "black",
                      borderRadius: "10px",
                    }}
                  >
                    {groupsData.map((elm) => (
                      <MenuItem value={elm._id} sx={{background:elm._id=='123Empty'? '#80808073 !important':'initial'}} >{elm.name} </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            ) : null}
            <TextField
              id="name"
              sx={{ display: groupForm.values.existingGroup == '123Empty' ? 'auto' : 'none' }}
              margin="dense"
              label="Name"
              fullWidth
              value={groupForm.values.name}
              onChange={groupForm.handleChange}
              onBlur={groupForm.handleBlur}
            />
            {!(selected && selected != "0") ? (
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
                Add
              </Button>
            )}
          </DialogActions>
        </form>
      ) : (
        <div
          style={{
            minWidth: "30rem",
            minHeight: "15rem",
            display: "flex",
            justifyContent: "center",
            textAlign: "center",
            alignItems: "center",
          }}
        >
          <Loader />
        </div>
      )}
    </Dialog>
  );
}
