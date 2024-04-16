import React, { Fragment } from "react";
import { useSnackbar } from "notistack";
import CircularProgress from "@mui/material/CircularProgress";
import SaveIcon from "@mui/icons-material/Save";
import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import { useEditDeviceMetaMutation } from "services/devices";
import { useEditMetaMutation, useDeleteMetaMutation } from "services/services";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import DeleteAlert from "components/Alerts/Delete";

export default function CustomAttributes({
  meta,
  setDevice,
  id,
  updateDefaultValue,
  removeMeta,
  edit,
}) {
  let token = window.localStorage.getItem("token");
  const [editingMeta, setEditingMeta] = React.useState(null);
  const [deleteId, setDeleteId] = React.useState("");
  const [editDeviceMeta, editDeviceMetaResult] = useEditDeviceMetaMutation();
  const [editMeta, editMetaResult] = useEditMetaMutation();
  const [deleteMeta, deleteMetaResult] = useDeleteMetaMutation();
  const { enqueueSnackbar } = useSnackbar();

  const updateMeta = async () => {
    if (updateDefaultValue) {
      let body = {
        value: editingMeta.value,
      };
      let updated = await editMeta({ token, body, id });
      if (updated?.data?.success) {
        showSnackbar(
          "Custom Attribute",
          updated?.data?.message,
          "success",
          1000
        );
        updateDefaultValue(updated?.data?.payload);
        setEditingMeta(null);
      } else {
        showSnackbar("Custom Attribute", updated?.data?.message, "error", 1000);
      }
      setEditingMeta(null);
    } else {
      let body = {
        metaTags: [{ metaId: editingMeta.metaId, value: editingMeta.value }],
      };
      let updated = await editDeviceMeta({ token, body, id });
      if (updated?.data?.success) {
        showSnackbar("Device", updated?.data?.message, "success", 1000);
        setDevice(updated?.data?.payload);

        setEditingMeta(null);
      } else {
        showSnackbar("Device", updated?.data?.message, "error", 1000);
      }
    }
  };

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar(
      { title, message: message ? message : "Something went wrong", variant },
      { timeOut }
    );
  }

  async function deleteAttribute(id) {
    let deleted = await deleteMeta({ token, id });
    if (deleted?.data?.success) {
      showSnackbar("Custom Attribute", deleted?.data?.message, "success", 1000);
      removeMeta(id);
      setDeleteId("");
    } else {
      showSnackbar("Custom Attribute", deleted?.data?.message, "error", 1000);
    }
  }

  return (
    <form
      style={{
        width: "100%",
        fontSize: 14,
        width: "98% !important",
        borderRadius: "10px",
        color: "#555",
        border:
          editingMeta?.metaId == meta.metaId ? "1px solid lightgrey" : "none",
        background: "#f1f1f1",
        margin: "10px 0",
        padding: "0px 10px",
        boxShadow: "none !important",
        display: "flex",
        alignItems: "center",
      }}
    >
      <p
        style={{
          width: "25%",
          fontWeight: 700,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {meta.key}
      </p>
      <Tooltip
        disableInteractive={!meta.value}
        title={meta.value}
        placement="top"
        arrow
      >
        <InputBase
          disabled={!editingMeta || meta.metaId != editingMeta?.metaId}
          autoFocus={meta.metaId == editingMeta?.metaId}
          sx={{ ml: 1, flex: 1, fontSize: 13 }}
          onChange={(e) =>
            setEditingMeta({ ...editingMeta, value: e.target.value })
          }
          value={editingMeta ? editingMeta.value : meta.value}
          inputProps={{ "aria-label": "search google maps" }}
        />
      </Tooltip>
      {edit ? (
        <Fragment>
          {!editingMeta || editingMeta?.metaId != meta.metaId ? (
            <div style={{ display: "flex" }}>
              <IconButton
                type="button"
                sx={{ p: "10px" }}
                aria-label="search"
                onClick={() =>
                  setEditingMeta({ metaId: meta.metaId, value: meta.value })
                }
              >
                <EditIcon fontSize="small" />
              </IconButton>
              {removeMeta ? (
                <IconButton
                  type="button"
                  sx={{ p: "10px" }}
                  aria-label="search"
                  onClick={() => setDeleteId(meta._id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              ) : null}
            </div>
          ) : (
            <div style={{ display: "flex" }}>
              <IconButton
                type="button"
                sx={{ p: "10px" }}
                aria-label="search"
                onClick={() => updateMeta(meta._id)}
              >
                <SaveIcon fontSize="small" />
              </IconButton>
              {removeMeta ? (
                <IconButton
                  type="button"
                  sx={{ p: "10px" }}
                  aria-label="search"
                  onClick={() => setDeleteId(meta._id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              ) : null}
            </div>
          )}
        </Fragment>
      ) : null}
      {deleteId ? (
        <DeleteAlert
          deleteModal={true}
          question={`Custom attribute will be deleted in all assets of this solution even if they have been populated. Are you sure you want to continue?`}
          platformCheck={false}
          id={deleteId}
          handleDelete={() => {
            if (!editingMeta || editingMeta?.metaId != meta.metaId) {
              removeMeta(id);
              setDeleteId("");
            } else {
              deleteAttribute(id);
            }
          }}
          handleClose={() => setDeleteId("")}
          // deleteResult={updateResult}
        />
      ) : null}
    </form>
    //  editDeviceMetaResult.isLoading ? (
    //   <CircularProgress
    //     style={{
    //       color: "#333333",
    //       height: "13px",
    //       width: "13px",
    //       marginRight: 12,
    //     }}
    //   />
    // ) :
  );
}
