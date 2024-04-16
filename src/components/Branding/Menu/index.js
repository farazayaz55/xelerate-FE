import React, { useEffect, useState, Fragment } from "react";
import { useSnackbar } from "notistack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import PublicIcon from "@mui/icons-material/Public";
import PersonIcon from "@mui/icons-material/Person";
import { useDispatch, useSelector } from "react-redux";
import DeleteAlert from "components/Alerts/Delete";
import {
  useUploadBrandingMutation,
  useDeleteTemplateMutation,
} from "services/branding";
import { setBranding, setBrandingBlockList } from "rtkSlices/metaDataSlice";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import { useGetRolesQuery } from "services/roles";
import { CircularProgress } from "@mui/material";
import Divider from "@mui/material/Divider";
import ListItemButton from "@mui/material/ListItemButton";
import Tooltip from "@mui/material/Tooltip";
import Fab from "@mui/material/Fab";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import PublicOffIcon from "@mui/icons-material/PublicOff";
import Dragable from "components/Dragable";

let editType = null;

export default function Menu(props) {
  const dispatch = useDispatch();
  const metaDataValue = useSelector((state) => state.metaData);
  function getPermission(chk) {
    let value;
    metaDataValue.appPaths.forEach((elm) => {
      if (elm.name == chk) {
        value = elm.permission;
      }
    });
    return value;
  }
  const [uploadBranding, uploadResult] = useUploadBrandingMutation();
  let token = window.localStorage.getItem("token");
  const [deleteTemplate, deleteTemplateResult] = useDeleteTemplateMutation();
  // const [resetBranding, resetBrandingResult] = useDeleteBrandingMutation();
  const { enqueueSnackbar } = useSnackbar();
  const [loader, setLoader] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [question, setQuestion] = useState("");
  const [rolePopup, setRolePopup] = useState(false);
  const [deleteModal, setDelete] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [roles, setRoles] = useState([]);
  const getRoles = useGetRolesQuery(token, { skip: !rolePopup });
  const [selectedRole, setSelectedRole] = useState(false);

  const Icon = props.block ? VisibilityIcon : VisibilityOffIcon;

  async function toggleDelete(id = null) {
    setActiveId(id);
    setDelete((state) => !state);
  }

  useEffect(() => {
    if (!getRoles.isFetching && getRoles.isSuccess) {
      setRoles(getRoles.data?.payload);
    } else if (
      !getRoles.isLoading &&
      getRoles.isError &&
      getRoles.data?.message != ""
    ) {
      showSnackbar("Roles", getRoles?.data?.message, "error");
    }
  }, [getRoles.isFetching]);

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  useEffect(() => {
    if (uploadResult.isSuccess) {
      showSnackbar("Branding", uploadResult.data?.message, "success", 1000);
      switch (editType) {
        case "personal":
          if (!uploadResult.data.payload?.branding && props.global?.branding) {
            let ss = { ...props.global };
            delete ss.brandingBlockList;
            dispatch(setBranding(ss));
          } else {
            dispatch(setBranding(uploadResult.data.payload));
          }
          break;

        case "global":
          if (!metaDataValue.branding.userFlag)
            dispatch(setBranding(uploadResult.data.payload));
          break;

        case "block":
          dispatch(
            setBrandingBlockList(uploadResult.data.payload.brandingBlockList)
          );
          break;
        default:
          break;
      }
    }
    if (uploadResult.isError) {
      showSnackbar("Branding", uploadResult.error?.message, "error", 1000);
    }
  }, [uploadResult]);

  useEffect(() => {
    if (deleteTemplateResult.isSuccess) {
      showSnackbar(
        "Branding",
        deleteTemplateResult.data?.message,
        "success",
        1000
      );
      if (props.template._id == metaDataValue.branding.id) {
        if (
          !metaDataValue.branding.userFlag ||
          props.global?.branding?._id == metaDataValue.branding.id
        )
          dispatch(setBranding());
        else dispatch(setBranding(props.global));
      }
    }
    if (deleteTemplateResult.isError) {
      showSnackbar(
        "Branding",
        deleteTemplateResult.error?.message,
        "error",
        1000
      );
    }
  }, [deleteTemplateResult]);

  async function onDelete() {
    deleteTemplate({ id: props.template._id });
  }

  function ListComp() {
    return (
      <Fragment>
        <List component="nav">
          <Divider />
          {roles?.map((elm, i) => {
            return (
              <Fragment>
                <ListItemButton
                  onClick={(event) => {
                    setSelectedRole(elm._id);
                  }}
                  style={{
                    backgroundColor:
                      selectedRole === elm._id ? "#3399ff" : "white",
                    margin: "5px",
                  }}
                >
                  <ListItemText
                    primary={`${elm.name}`}
                    style={{
                      color: selectedRole === elm._id ? "white" : "",
                    }}
                  />
                </ListItemButton>
                <Divider />
              </Fragment>
            );
          })}
        </List>
      </Fragment>
    );
  }

  const onConfirm = async () => {
    let body;
    if (confirm == "personal") {
      editType = "personal";
      body = {
        branding: null,
      };
      uploadBranding({
        body,
        type: "PUT",
        user: "true",
      });
    } else if (confirm == "global") {
      editType = "global";
      body = {
        branding: null,
      };
      uploadBranding({
        body,
        type: "PUT",
        user: "false",
      });
    } else {
      editType = "personal";
      body = {
        branding: props.template._id,
        roleId: selectedRole,
        userFlag: true,
      };
      let uploaded = await uploadBranding({
        body,
        type: "POST",
        user: "true",
      });
      if (uploaded.data?.success) {
        setConfirm("");
        setRolePopup(false);
      } else {
        showSnackbar("Branding", uploaded.error.data?.message, "error", 1000);
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: "15px",
        height: "35px",
        margin: "0 10px",
      }}
    >
      {!props.permission ? (
        <>
          {props.global?.branding?._id != props.template._id &&
          props.template._id != "default" ? (
            getPermission("Branding") == "ALL" ? (
              <Tooltip title="Set Global Branding" placement="top" arrow>
                <PublicIcon
                  color="primary"
                  fontSize="small"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    editType = "global";
                    let chk = props.global;
                    let body = {
                      branding: props.template._id,
                    };
                    if (!chk) body.userFlag = false;
                    uploadBranding({
                      body,
                      type: chk ? "PUT" : "POST",
                      user: "false",
                    });
                  }}
                />
              </Tooltip>
            ) : null
          ) : null}
          {(metaDataValue.branding.userFlag
            ? metaDataValue.branding.id != props.template._id
            : true) && props.template._id != "default" ? (
            <Tooltip title="Set Personal Branding" placement="top" arrow>
              <PersonIcon
                color="primary"
                fontSize="small"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  editType = "personal";
                  console.log(
                    "CHK",
                    metaDataValue.settings,
                    metaDataValue.branding.userFlag,
                    metaDataValue.branding.pinnedSolutions,
                    metaDataValue.branding.brandingBlockList
                  );
                  let chk =
                    metaDataValue.settings &&
                    (metaDataValue.branding.userFlag ||
                      metaDataValue.branding.pinnedSolutions ||
                      metaDataValue.branding.brandingBlockList);
                  let body = {
                    branding: props.template._id,
                  };
                  if (!chk) body.userFlag = true;
                  uploadBranding({
                    body,
                    type: chk ? "PUT" : "POST",
                    user: "true",
                  });
                }}
              />
            </Tooltip>
          ) : null}
          {props.template._id != "default" ? (
            getPermission("Branding") == "ALL" ? (
              <Tooltip title="Apply Branding to Role" placement="top" arrow>
                <AssignmentIndIcon
                  color="primary"
                  fontSize="small"
                  style={{ cursor: "pointer" }}
                  onClick={() => setRolePopup(true)}
                />
              </Tooltip>
            ) : null
          ) : null}
          {props.template._id != "default" ? (
            <Tooltip
              title={`${props.block ? "Unhide Branding" : "Archive"} Template`}
              placement="top"
              arrow
            >
              <Icon
                color="primary"
                fontSize="small"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  editType = "block";
                  let old = [...metaDataValue.branding.brandingBlockList];
                  if (props.block)
                    old.splice(old.indexOf(props.template._id), 1);
                  else old.push(props.template._id);
                  let body = {
                    brandingBlockList: old,
                  };
                  uploadBranding({
                    body,
                    type: metaDataValue.settings ? "PUT" : "POST",
                    user: "true",
                  });
                }}
              />
            </Tooltip>
          ) : null}
          {props.template._id != "default" ? (
            <Tooltip title="Edit Branding" placement="top" arrow>
              <EditIcon
                color="primary"
                fontSize="small"
                style={{ cursor: "pointer" }}
                onClick={() => props.setTemplate(props.template)}
              />
            </Tooltip>
          ) : null}
          {props.template._id != "default" ? (
            getPermission("Branding") == "ALL" ? (
              <Tooltip title="Delete Branding" placement="top" arrow>
                <DeleteIcon
                  color="primary"
                  fontSize="small"
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleDelete(true)}
                />
              </Tooltip>
            ) : null
          ) : null}
        </>
      ) : null}
      {activeId ? (
        <DeleteAlert
          deleteModal={deleteModal}
          question="Are you absolutely sure? any existing user with this branding will revert to default branding?"
          id={activeId}
          handleDelete={onDelete}
          handleClose={toggleDelete}
          deleteResult={deleteTemplateResult}
        />
      ) : null}
      <Dialog
        open={rolePopup}
        onClose={() => setRolePopup(!rolePopup)}
        aria-labelledby="form-dialog-title"
        PaperProps={{
          style: {
            maxWidth: "25vw",
            width: "25vw",
            height: "70vh",
          },
        }}
      >
        <DialogTitle id="form-dialog-title">Apply Branding to Role</DialogTitle>
        <DialogContent>
          {getRoles.isFetching ? (
            <div style={{ textAlign: "center", marginTop: "20%" }}>
              <CircularProgress size={40} />
            </div>
          ) : (
            <ListComp />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRolePopup(!rolePopup)} color="error">
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={() => {
              setQuestion(
                "This will override any exsiting branding of users in selected role. Are you absolutely sure?"
              );
              setConfirm("role");
            }}
            color="primary"
          >
            {loader ? <CircularProgress size={20} /> : <span>Submit</span>}
          </Button>
        </DialogActions>
      </Dialog>
      {props.global?.branding &&
      getPermission("Branding") == "ALL" &&
      props.template._id == "default" ? (
        <Dragable
          bottom={
            metaDataValue.branding?.userFlag && metaDataValue.branding.applied
              ? "170px"
              : "100px"
          }
          right={"30px"}
          name="reset-global"
        >
          <Tooltip title="Reset Global Branding" placement="top" arrow>
            <Fab
              style={{ boxShadow: "none" }}
              color="secondary"
              onClick={() => {
                setQuestion(
                  "Are you sure you want to reset branding being applied globally? (This may effect multiple users)"
                );
                setConfirm("global");
              }}
            >
              <PublicOffIcon />
            </Fab>
          </Tooltip>
        </Dragable>
      ) : null}
      {metaDataValue.branding.applied &&
      metaDataValue.branding?.userFlag &&
      props.template._id == "default" ? (
        <Dragable bottom={"100px"} right={"30px"} name="reset-personal">
          <Tooltip title="Reset Personal Branding" placement="top" arrow>
            <Fab
              style={{ boxShadow: "none" }}
              color="secondary"
              onClick={() => {
                setQuestion("Are you sure you want to reset your branding?");
                setConfirm("personal");
              }}
            >
              <PersonOffIcon />
            </Fab>
          </Tooltip>
        </Dragable>
      ) : null}
      <DeleteAlert
        deleteModal={confirm}
        question={question}
        platformCheck={false}
        id={""}
        handleDelete={onConfirm}
        handleClose={() => setConfirm("")}
        uploadBranding={false}
      />
    </div>
  );
}
