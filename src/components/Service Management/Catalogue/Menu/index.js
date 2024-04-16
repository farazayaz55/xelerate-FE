import React, { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import Divider from "@mui/material/Divider";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Poppers from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Edit from "../../Edit";
import { useDeleteServiceMutation } from "services/services";
import { useGetSpecificRoleQuery } from "services/roles";
import { useDispatch } from "react-redux";
import DeleteAlert from "components/Alerts/Delete";

export default function Menu(props) {
  const dispatch = useDispatch();
  let token = window.localStorage.getItem("token");
  const { enqueueSnackbar } = useSnackbar();
  const [openProfile, setOpenProfile] = React.useState(null);
  const [openEdit, setOpenEdit] = React.useState(false);
  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar(
      { title, message: message ? message : "Something went wrong", variant },
      { timeOut }
    );
  }

  const [deleteService, deleteServiceResult] = useDeleteServiceMutation();
  const [activeId, setActiveId] = useState(null);
  const [deleteModal, setDelete] = useState(false);
  const roleRes = useGetSpecificRoleQuery(window.localStorage.getItem("role"), {
    skip: !deleteServiceResult.isSuccess,
  });
  async function toggleDelete(id = null) {
    setActiveId(id);
    setDelete((state) => !state);
  }

  useEffect(() => {
    if (roleRes.isSuccess) {
      dispatch(setRole(roleRes.data.payload));
    }
  }, [roleRes.isFetching]);

  useEffect(() => {
    if (deleteServiceResult.isSuccess) {
      showSnackbar(
        "Solution",
        deleteServiceResult.data?.message,
        "success",
        1000
      );
    }
    if (deleteServiceResult.isError) {
      showSnackbar(
        "Solution",
        deleteServiceResult.error?.data?.message,
        "error",
        1000
      );
    }
  }, [deleteServiceResult]);

  const handleClickProfile = (event, id) => {
    props.setBlur(id);
    if (openProfile && openProfile.contains(event.target)) {
      setOpenProfile(null);
    } else {
      setOpenProfile(event.currentTarget);
    }
  };

  const handleCloseProfile = () => {
    props.setBlur(false);
    setOpenProfile(null);
  };
  const handleClickOpen = () => {
    setOpenEdit(true);
  };
  const handleClose = () => {
    setOpenEdit(false);
  };
  return (
    <div
      style={{
        position: "absolute",
        right: "5px",
        top: "12px",
        cursor: "pointer",
      }}
    >
      <MoreVertIcon
        style={{ color: "#555555" }}
        onClick={(e) => handleClickProfile(e, props.id)}
      />
      <Poppers
        open={Boolean(openProfile)}
        anchorEl={openProfile}
        transition
        disablePortal
        placement="bottom-end"
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            id="profile-menu-list-grow"
            timeout={500}
            style={{
              transformOrigin: "center top",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleCloseProfile}>
                <MenuList role="menu" style={{ minWidth: "100px" }}>
                  <MenuItem onClick={() => props.setSelected(props.service)}>
                    Edit
                  </MenuItem>

                  <Divider />
                  <MenuItem onClick={() => toggleDelete(props.id)}>
                    Delete
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Poppers>
      {openEdit ? (
        <Edit
          key={props.id}
          service={props.service}
          updateService={props.updateService}
          open={true}
          handleClose={handleClose}
        />
      ) : null}
      {activeId ? (
        <DeleteAlert
          deleteModal={deleteModal}
          question="Are you sure you want to delete this solution?"
          id={activeId}
          handleDelete={(id) => {
            deleteService({ token, id });
            toggleDelete();
          }}
          handleClose={toggleDelete}
          deleteResult={deleteServiceResult}
        />
      ) : null}
    </div>
  );
}
