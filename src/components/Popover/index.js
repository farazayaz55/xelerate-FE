import React from "react";
//----------------MUI-----------------//
import { makeStyles } from "@mui/styles";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import PopupState, { bindToggle, bindPopover } from "material-ui-popup-state";
import Avatar from "@mui/material/Avatar";
import { useSelector } from "react-redux";

export default function popper(props) {
  const metaDataValue = useSelector((state) => state.metaData);
  const useStyles = makeStyles({
    icons: {
      marginTop: props.profile ? "14px" : "10px",
    },
  });
  const classes = useStyles(props);

  return (
    <PopupState variant="popover">
      {(popupState) => (
        <div>
          {props.target ? (
            <div {...bindToggle(popupState)}>
              <props.target />
            </div>
          ) : props.profile ? (
            <IconButton
              {...bindToggle(popupState)}
              size="small"
              id={props.name}
              style={{ position: "relative", top: "4px" }}
            >
              <Avatar
                style={{
                  width: "32px",
                  height: "32px",
                }}
              >
                {metaDataValue.userInfo.firstName[0].toUpperCase()}
              </Avatar>
            </IconButton>
          ) : (
            <IconButton
              {...bindToggle(popupState)}
              style={{
                borderRadius: "0",
                height: "50px",
                width: "50px",
              }}
              id={props.name}
            >
              <props.icon
                fontSize="medium"
                style={{ color: props.white ? "white" : "" }}
              />
            </IconButton>
          )}

          <Popover
            {...bindPopover(popupState)}
            PaperProps={{
              style: {
                borderRadius: "10px",
              },
            }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
            className={classes.icons}
          >
            <props.component />
          </Popover>
        </div>
      )}
    </PopupState>
  );
}
