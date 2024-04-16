import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Divider } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  item: {
    width: "25vw",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    paddingTop: "10px",
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.1)",
    },
  }
})

export default function CloneModal({
  open,
  question,
  rules,
  handleClose,
  title,
  handleRuleSelect
}) {

  const styles = useStyles();

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle id="alert-dialog-title">
        {title ? title : "Confirmation"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          <div>
            <span style={{color: "dimgray"}}>
              {question}
            </span>
            <div style={{maxHeight: "70vh", overflowY: "scroll"}}>
              <Divider style={{color: "rgba(0,0,0,0.1)"}}/>
              {rules.map((rule) =>
                    <div
                      key={rule._id}
                      onClick={() => {handleRuleSelect(rule)}}
                      className={styles.item}
                    >
                        <span style={{paddingLeft: "5px"}}>{rule.name}</span>
                        <Divider style={{color: "rgba(0,0,0,0.1)", marginTop: "10px"}}/>
                    </div>
                  )
                }
            </div>
          </div>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}
