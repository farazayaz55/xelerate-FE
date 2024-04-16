import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";

export default function ApplyAlert({
  applyModal,
  question,
  handleApply,
  handleClose,
  title,
  applyRes,
  warning
}) {
  useEffect(() => {
    if(applyRes.isSuccess){
      handleClose()
    }
  }, [applyRes.isSuccess])

  return (
    <Dialog open={applyModal} onClose={handleClose}>
      <DialogTitle id="alert-dialog-title">
        {title ? title : "Confirmation"}
      </DialogTitle>
      <DialogContent style={{ overflow: "hidden" }}>
        <DialogContentText id="alert-dialog-description">
          {applyRes.isLoading?
            <div style={{width: "15vw", height: "100%", display: "flex", justifyContent: "center", alignItems: "center"}}>
              <CircularProgress />
            </div>
            :
            <span>
              {question}{" "}
              <span style={{color: "rgba(0,0,0,0.5)"}}>{warning}</span>
            </span>
          }
        </DialogContentText>
      </DialogContent>
      <DialogActions>        
        <Button onClick={handleClose} color="error">
          Cancel
        </Button>
        <Button
          onClick={() => handleApply()}
          color="secondary"
        >
          <span>Proceed</span>
        </Button>
      </DialogActions>
    </Dialog>
  );
}
