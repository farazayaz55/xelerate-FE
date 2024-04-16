import React, { useState, useEffect, Fragment } from "react";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import { useSnackbar } from "notistack";
import { makeStyles } from "@mui/styles";
import Zoom from "@mui/material/Zoom";
import Tooltip from "@mui/material/Tooltip";
import { useSelector, useDispatch } from "react-redux";
import {
  useGetSimulationsDeviceQuery,
  useAddRemoveSimulationMutation,
  useGetSimulationsQuery,
} from "services/simulation";
import Skeleton from "@mui/material/Skeleton";
import Loader from "components/Progress";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";

export default function GroupAvatars(props) {
  const metaDataValue = useSelector((state) => state.metaData);
  const [openPopup, setOpenPopup] = useState(false);
  const [deviceSimulators, setDeviceSimulators] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [skip, setSkip] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  let token = window.localStorage.getItem("token");
  const simulators = useGetSimulationsDeviceQuery({
    token,
    id: props.id,
  });
  const templates = useGetSimulationsQuery(
    { token, parameters: `?serviceId=${props.group}` },
    {
      skip,
    }
  );

  const [edit, result] = useAddRemoveSimulationMutation();

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  useEffect(() => {
    if (result.isSuccess) {
      showSnackbar("Simulator", result.data?.message, "success", 1000);
    }
  }, [result.isSuccess]);

  useEffect(() => {
    if (simulators.isSuccess && simulators.data?.payload) {
      let temp = [];
      simulators.data.payload.forEach((elm) => {
        temp.push(elm._id);
      });
      setDeviceSimulators(temp);
    }
    if (simulators.isError)
      showSnackbar("Simulators", simulators.error.data?.message, "error", 1000);
  }, [simulators.isFetching]);

  async function handleClick(id, addDevice, deviceId) {
    let body = { token, body: { addDevice, deviceId }, id };
    await edit(body);
  }

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
  };

  const handlepopupOpen = () => {
    setSkip(false);
    setSelectedIndex(null);
    templates.refetch();
    setOpenPopup(true);
  };

  const handlepopupClose = () => {
    setOpenPopup(false);
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignContent: "center",
        color: "black",
      }}
    >
      <form>
        <Dialog open={openPopup} onClose={handlepopupClose} fullWidth>
          <DialogTitle style={{ maxHeight: "45px" }}>Add Simulator</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Select the simulator you want to attach to this device.
            </DialogContentText>
            <div>
              <List component="nav">
                {templates.isLoading || skip ? (
                  <Loader />
                ) : (
                  <Fragment>
                    <Divider />
                    {templates.data.payload.map((elm, i) => {
                      if (deviceSimulators.indexOf(elm._id) == -1)
                        return (
                          <Fragment>
                            <ListItemButton
                              onClick={(event) =>
                                handleListItemClick(event, elm._id)
                              }
                              style={{
                                backgroundColor:
                                  selectedIndex === elm._id
                                    ? metaDataValue.branding.secondaryColor
                                    : "white",
                                margin: "5px",
                              }}
                            >
                              <ListItemIcon>
                                <GraphicEqIcon
                                  style={{
                                    color:
                                      selectedIndex === elm._id ? "white" : "",
                                  }}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={elm.name}
                                style={{
                                  color:
                                    selectedIndex === elm._id ? "white" : "",
                                }}
                              />
                            </ListItemButton>
                            <Divider />
                          </Fragment>
                        );
                      else null;
                    })}
                  </Fragment>
                )}
              </List>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handlepopupClose} color="primary">
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              onClick={() => {
                handleClick(selectedIndex, true, props.id);
                handlepopupClose();
              }}
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </form>
      {simulators.isLoading ? (
        <div style={{ display: "flex" }}>
          <Skeleton variant="circular" width={30} height={30} />
          <Skeleton variant="circular" width={30} height={30} />
          <Skeleton variant="circular" width={30} height={30} />
        </div>
      ) : (
        <AvatarGroup max={100} style={{ color: "black" }}>
          {simulators.data?.payload.map((elm) => {
            return (
              <Tooltip TransitionComponent={Zoom} title={elm.name} arrow>
                <Avatar
                  alt={elm.name}
                  id={elm._id}
                  src="/"
                  style={{
                    backgroundColor: metaDataValue.branding.primaryColor,
                    cursor: "pointer",
                    width: 30,
                    height: 30,
                  }}
                  onClick={(e) =>
                    handleClick(e.currentTarget.id, false, props.id)
                  }
                />
              </Tooltip>
            );
          })}
          <Tooltip TransitionComponent={Zoom} title="Add" arrow>
            <Avatar
              alt="+"
              src="/"
              style={{
                backgroundColor: metaDataValue.branding.secondaryColor,
                cursor: "pointer",
                width: 30,
                height: 30,
              }}
              color="secondary"
              onClick={handlepopupOpen}
            />
          </Tooltip>
        </AvatarGroup>
      )}
    </div>
  );
}
