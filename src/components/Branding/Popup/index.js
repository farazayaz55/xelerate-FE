//-----------CORE----------//
import React, { useEffect } from "react";
//----------MUI----------//
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Dragable from "components/Dragable";
//-----------EXTERNAL------------//
import Card from "./card";
import "../branding.css";

export default function Branding(props) {
  const [open, setOpen] = React.useState(props?.template ? true : false);

  useEffect(() => {
    if (props.template) setOpen(true);
  }, [props.template]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "20px",
      }}
    >
      <Dragable bottom={"30px"} right={"30px"} name="add-branding">
        <Fab
          style={{ boxShadow: "none" }}
          color="secondary"
          onClick={() => setOpen(true)}
        >
          <AddIcon />
        </Fab>
      </Dragable>
      <Dialog
        open={open}
        onClose={() => {
          props.setTemplate(null);
          setOpen(false);
        }}
      >
        <DialogTitle>Add branding template</DialogTitle>
        <Card
          user={"true"}
          template={props.template}
          close={() => {
            props.setTemplate(null);
            setOpen(false);
          }}
          length={props.length}
          permission={props.permission}
        />
      </Dialog>
    </div>
  );
}
