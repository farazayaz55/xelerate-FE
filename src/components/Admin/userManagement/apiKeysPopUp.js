//-----------CORE------------//
import React, { useEffect } from "react";
//--------------MUI--------------//
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import CheckBox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import CircularProgress from "@mui/material/CircularProgress";
import FormHelperText from "@mui/material/FormHelperText";
import { useSnackbar } from "notistack";


//----------EXTERNAL COMPS----------//

export default function ApiKeyPopUp(props) {
  const { enqueueSnackbar } = useSnackbar();

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  return (
    <div>
      <Dialog
        open={true}
        onClose={props.handlePopupClose}
        aria-labelledby="form-dialog-title"
        maxWidth="md"
      >
        <DialogTitle id="form-dialog-title"> API Keys </DialogTitle>
        <DialogContent>
          <span style={{ display: "flex", gap: "20px", width: "642px" }}>
            <TextField
              id="firstName"
              margin="dense"
              value={props.apiKeys.publicToken}
              fullWidth
              disabled
              label="Public Token"
            />
            <Button
              size="small"
              onClick={() => {
                navigator.clipboard.writeText(props.apiKeys.publicToken);
                showSnackbar(
                  "API Keys",
                  `Public Token Copied!`,
                  "success",
                  1000
                );
              }}
            >
              Copy
            </Button>
          </span>
          <span style={{ display: "flex", gap: "20px", width: "642px" }}>
            <TextField
              id="firstName"
              margin="dense"
              value={props.apiKeys.privateSecret}
              fullWidth
              disabled
              label="Private Secret"
            />
            <Button
              size="small"
              onClick={() => {
                navigator.clipboard.writeText(props.apiKeys.privateSecret);
                showSnackbar(
                  "API Keys",
                  `Private Token Copied!`,
                  "success",
                  1000
                );
              }}
            >
              Copy
            </Button>
          </span>
          <p style={{ color: "grey", fontSize: "10px" }}>
            Note: please record and keep these keys safely for your reference.
            These are generated and presented only once.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
