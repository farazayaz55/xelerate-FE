import React, { useEffect, useState, Fragment } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Box from "@mui/material/Box";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { Button, DialogActions } from "@mui/material";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import Chip from "@mui/material/Chip";
import { useAddReportMutation } from "services/alarms";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "@mui/material/styles";
import { showSnackbar } from "Utilities/Snackbar";
import { useSnackbar } from "notistack";

export default function DM({ setOpenPopup, solutions, row }) {
  let token = window.localStorage.getItem("token");
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const filters = useSelector((state) => state.alarmsFilter);
  const metaDataValue = useSelector((state) => state.metaData);
  let priorities = ["CRITICAL", "MAJOR", "MINOR", "WARNING"];
  let statuses = ["ACTIVE", "ACKNOWLEDGED", "CLEARED"];
  const [email, setEmail] = useState(row ? row.mailingList?.join() : "");
  const [name, setName] = useState(row ? row.name : "");
  const [emails, setEmails] = useState(row ? row.userFilters.emails : false);
  const [interval, setInterval] = useState(row ? row.interval : "Daily");
  const [actuations, setActuations] = useState(
    row ? row.userFilters.actuations : false
  );
  const [selectedSolutions, setSelectedSolutions] = useState(
    row?.userFilters?.serviceId
      ? [
          metaDataValue.services.find((e) => e.id == row.userFilters.serviceId)
            .name,
        ]
      : ["All"]
  );
  const [selectedPriorities, setSelectedPriorities] = useState(
    row ? row.userFilters.severity : ["CRITICAL"]
  );
  const [selectedStatuses, setSelectedStatuses] = useState(
    row ? row.userFilters.status : ["ACTIVE"]
  );
  const [createReport, createReportResult] = useAddReportMutation();
  function getStyles(name, values, theme) {
    return {
      fontWeight:
        values.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
  }

  useEffect(() => {
    if (createReportResult.isSuccess) {
      setOpenPopup(false);
      showSnackbar(
        "Report",
        createReportResult.data?.message,
        "success",
        1000,
        enqueueSnackbar
      );
    }
    if (createReportResult.isError) {
      setOpenPopup(false);
      showSnackbar(
        "Report",
        createReportResult.error?.data?.message,
        "error",
        1000,
        enqueueSnackbar
      );
    }
  }, [createReportResult]);

  const handleChange = (event, setFunc) => {
    const {
      target: { value },
    } = event;
    setFunc(typeof value === "string" ? value.split(",") : value);
  };

  const filterBy = (name, options) => {
    return (
      <FormControl
        sx={{ m: 1, width: "100%", position: "relative", right: "8px" }}
      >
        <InputLabel id="demo-multiple-chip-label">{name}</InputLabel>
        <Select
          multiple={name == "Solution" ? false : true}
          value={
            name == "Priority"
              ? selectedPriorities
              : name == "Status"
              ? selectedStatuses
              : selectedSolutions
          }
          sx={{ height: name == "Priority" ? "65px" : "auto" }}
          onChange={(e) =>
            handleChange(
              e,
              name == "Priority"
                ? setSelectedPriorities
                : name == "Status"
                ? setSelectedStatuses
                : setSelectedSolutions
            )
          }
          input={<OutlinedInput id="select-multiple-chip" label={name} />}
          renderValue={(selected) => {
            return (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            );
          }}
          // MenuProps={MenuProps}
        >
          {options.map((option) => (
            <MenuItem
              key={name == "Solution" ? option.name : option}
              value={name == "Solution" ? option.name : option}
              style={getStyles(
                name == "Solution" ? option.id : option,
                name == "Priority"
                  ? selectedPriorities
                  : name == "Status"
                  ? selectedStatuses
                  : selectedSolutions,
                theme
              )}
            >
              {name == "Solution" ? option.name : option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  function handleInterval(e) {
    setInterval(e.target.value);
  }

  return (
    <Dialog
      open
      onClose={() => {
        setOpenPopup(false);
      }}
      PaperProps={{
        style: {
          maxWidth: "600px",
          maxHeight: "90vh",
          padding: "20px",
          width: "80vw",
        },
      }}
    >
      <DialogTitle>
        {row ? `Edit Report (${row.name})` : "Add Report"}
      </DialogTitle>
      <div>
        <TextField
          style={{ marginBottom: "20px" }}
          label="Name"
          fullWidth
          margin="dense"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {filterBy("Solution", solutions)}
        {filterBy("Priority", priorities)}
        {filterBy("Status", statuses)}

        <FormControl fullWidth style={{ marginTop: "10px" }}>
          <InputLabel>Interval *</InputLabel>
          <Select
            fullWidth
            required
            onChange={handleInterval}
            value={interval}
            label={"Interval *"}
          >
            <MenuItem value="Daily">Daily</MenuItem>
            <MenuItem value="Weekly">Weekly</MenuItem>
            <MenuItem value="Monthly">Monthly</MenuItem>
          </Select>
        </FormControl>
        <TextField
          style={{ marginTop: "20px" }}
          label="Recipient Email(s)"
          fullWidth
          margin="dense"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          helperText={"Hint: you can add multiple comma seperated emails"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <MailOutlineIcon
                  style={{
                    color: "grey",
                  }}
                />
              </InputAdornment>
            ),
          }}
        />
      </div>
      {/* <div style={{ margin: "10px" }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={emails}
              onChange={(e) => setEmails(e.target.checked)}
            />
          }
          sx={{ marginRight: "30px" }}
          label="Include Emails"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={actuations}
              onChange={(e) => setActuations(e.target.checked)}
            />
          }
          label="Include Actuations"
        />
      </div> */}
      <DialogActions>
        <Button color="error" onClick={() => setOpenPopup(false)}>
          Cancel
        </Button>
        <Button
          color="secondary"
          onClick={() => {
            let mailingList = [];
            email.split`,`.forEach((elm) => {
              mailingList.push(elm);
            });
            let userFilters = {
              severity: selectedPriorities,
              status: selectedStatuses,
              emails,
              actuations,
            };
            if (selectedSolutions[0] != "All")
              userFilters.serviceId = metaDataValue.services.find(
                (e) => e.name == selectedSolutions[0]
              ).id;
            let body = {
              name,
              userFilters,
              mailingList,
              interval,
            };
            createReport({ token, body, edit: row ? row._id : false });
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
