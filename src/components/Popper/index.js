import React, { useRef, useState } from "react";
import { makeStyles } from "@mui/styles";
import Button from "@mui/material/Button";
import Popper from "@mui/material/Popper";
import Paper from "@mui/material/Paper";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ClickAwayListener from "@mui/material/ClickAwayListener";

const useStyles = makeStyles((theme) => ({
  popper: {
    zIndex: 1,
    '&[x-placement*="bottom"] $arrow': {
      top: 0,
      left: 0,
      marginTop: "-0.9em",
      width: "3em",
      height: "1em",
      "&::before": {
        borderWidth: "0 1em 1em 1em",
        borderColor: `transparent transparent ${theme.palette.background.paper} transparent`,
      },
    },
    '&[x-placement*="top"] $arrow': {
      bottom: 0,
      left: 0,
      marginBottom: "-0.9em",
      width: "3em",
      height: "1em",
      "&::before": {
        borderWidth: "1em 1em 0 1em",
        borderColor: `${theme.palette.background.paper} transparent transparent transparent`,
      },
    },
    '&[x-placement*="right"] $arrow': {
      left: 0,
      marginLeft: "-0.9em",
      height: "3em",
      width: "1em",
      "&::before": {
        borderWidth: "1em 1em 1em 0",
        borderColor: `transparent ${theme.palette.background.paper} transparent transparent`,
      },
    },
    '&[x-placement*="left"] $arrow': {
      right: 0,
      marginRight: "-0.9em",
      height: "3em",
      width: "1em",
      "&::before": {
        borderWidth: "1em 0 1em 1em",
        borderColor: `transparent transparent transparent ${theme.palette.background.paper}`,
      },
    },
  },
  arrow: {
    position: "absolute",
    fontSize: 7,
    width: "3em",
    height: "3em",
    "&::before": {
      content: '""',
      margin: "auto",
      display: "block",
      width: 0,
      height: 0,
      borderStyle: "solid",
    },
  },
}));

export default function ScrollPlayground(props) {
  const anchorRef = useRef(null);
  const [arrowRef, setArrowRef] = useState(null);
  const [open, setOpen] = useState(false);

  const handleClickButton = () => {
    setOpen(!open);
  };

  const handleCloseNotification = () => {
    setOpen(false);
  };

  const classes = useStyles();

  const id = open ? "scroll-playground" : null;

  return (
    <div>
      <div>
        <IconButton
          style={{ position: "relative", bottom: "14px" }}
          ref={anchorRef}
          variant="contained"
          onClick={handleClickButton}
          aria-describedby={id}
          color="primary"
          component="span"
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement={"right"}
          disablePortal={"false"}
          className={classes.popper}
          modifiers={{
            flip: {
              enabled: true,
            },
            arrow: {
              enabled: true,
              element: arrowRef,
            },
            preventOverflow: "scrollParent",
          }}
        >
          <span className={classes.arrow} ref={setArrowRef} />
          <ClickAwayListener onClickAway={handleCloseNotification}>
            <Paper className={classes.paper}>
              <props.componenet close={"abc"} />
            </Paper>
          </ClickAwayListener>
        </Popper>
      </div>
    </div>
  );
}
