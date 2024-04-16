import React, { useState, Fragment, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setAlarmsFilter } from "rtkSlices/AlarmsFilterSlice";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Box from "@mui/material/Box";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { Button, DialogActions } from "@mui/material";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { SearchOutlined } from "@mui/icons-material";

export default function AlarmFilters({
  priorities,
  statuses,
  solutions,
  filters,
  serviceId
}) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedSolutions, setSelectedSolutions] = useState(filters.solutions);
  const [selectedPriorities, setSelectedPriorities] = useState(
    filters.priority
  );
  const [selectedStatuses, setSelectedStatuses] = useState(filters.status);
  const [dateError, setDateError] = useState("");
  const [startTime, setStartTime] = useState(filters.date.startTime);
  const [endTime, setEndTime] = useState(filters.date.endTime);
  const [emails, setEmails] = useState(filters.emails);
  const [actuations, setActuations] = useState(filters.actuations);
  const [searchAsset, setSearchAsset] = useState(filters.search.asset);
  const [searchRule, setSearchRule] = useState(filters.search.rule);
  function getStyles(name, values, theme) {
    return {
      fontWeight:
        values.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
  }

  const handleChange = (event, setFunc) => {
    const {
      target: { value },
    } = event;
    setFunc(typeof value === "string" ? value.split(",") : value);
  };

  const filterBy = (name, options) => {
    return (
      <FormControl sx={{ m: 1, width: "100%" }}>
        <InputLabel id="demo-multiple-chip-label">{name}</InputLabel>
        <Select
          labelId="demo-multiple-chip-label"
          id="demo-multiple-chip"
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
          input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
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

  const handleStartDate = (val) => {
    setStartTime(val);
  };

  const handleEndDate = (val) => {
    setEndTime(val);
  };

  function chkError() {
    var one_day = 1000 * 60 * 60 * 24;
    var startDate = new Date(startTime);
    var endDate = new Date(endTime);
    var diff = Math.ceil((endDate.getTime() - startDate.getTime()) / one_day);
    if (diff > 60) {
      setDateError("Please select date range within 2 months.");
      return;
    } else {
      setDateError("");
    }
  }

  const updateFilter = (e) => {
    dispatch(setAlarmsFilter(e));
    setOpen(false);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          // marginBottom: "10px",
        }}
      >
        <Stack direction="row" spacing={1}>
          {Object.keys(filters)?.map((filter) => {
            return filter == "date" ? (
              <Stack direction="row" spacing={1}>
                <Chip
                  label={
                    "From " +
                    new Date(filters[filter].startTime).toLocaleDateString('en-GB',{
                      day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                    })
                  }
                />
                <Chip
                  label={
                    "To " +
                    new Date(filters[filter].endTime).toLocaleDateString('en-GB',{
                      day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                    })
                  }
                />
              </Stack>
            ) : filter == "emails" || filter == "actuations" ? (
              filters[filter] ? (
                <Chip
                  label={filter == "emails" ? "Emails" : "Actuations"}
                  onDelete={() => {
                    let tempFilters = JSON.parse(JSON.stringify(filters));
                    tempFilters[filter] = false;
                    dispatch(setAlarmsFilter(tempFilters));
                  }}
                />
              ) : null
            ) : filter == "search" ? (
              <Fragment>
                {filters[filter].asset ? (
                  <Chip
                    label={`Asset - ${filters[filter].asset}`}
                    onDelete={() => {
                      let tempFilters = JSON.parse(JSON.stringify(filters));
                      tempFilters[filter].asset = null;
                      dispatch(setAlarmsFilter(tempFilters));
                    }}
                  />
                ) : null}
                {filters[filter].rule ? (
                  <Chip
                    label={`Rule - ${filters[filter].rule}`}
                    onDelete={() => {
                      let tempFilters = JSON.parse(JSON.stringify(filters));
                      tempFilters[filter].rule = null;
                      dispatch(setAlarmsFilter(tempFilters));
                    }}
                  />
                ) : null}
              </Fragment>
            ) : filters[filter]?.length ? (
              filters[filter].map((f) => {
                return f != "All" ? (
                  <Chip
                    label={f}
                    onDelete={() => {
                      let tempFilters = JSON.parse(JSON.stringify(filters));
                      if (filter != "solutions") {
                        tempFilters[filter].splice(
                          [filters[filter].findIndex((t) => t == f)],
                          1
                        );
                      } else {
                        tempFilters[filter] = ["All"];
                      }
                      dispatch(setAlarmsFilter(tempFilters));
                    }}
                  />
                ) : null;
              })
            ) : null;
          })}
        </Stack>
        <Button
          variant="outlined"
          startIcon={<FilterAltIcon />}
          onClick={() => {
            setOpen(true);
            setStartTime(filters.date.startTime.valueOf());
            setEndTime(filters.date.endTime.valueOf());
            setSelectedStatuses(filters.status);
            setSelectedSolutions(filters.solutions);
            setSelectedPriorities(filters.priority);
            setActuations(filters.actuations);
            setSearchAsset(filters.search.asset);
            setSearchRule(filters.search.rule);
            setEmails(filters.emails);
          }}
        >
          Filters
        </Button>
      </div>

      <Dialog
        onClose={() => setOpen(false)}
        open={open}
        PaperProps={{
          style: {
            maxWidth: "90vw",
            maxHeight: "90vh",
            padding: "20px",
            width: "80vw",
          }, 
        }}
      >
        <DialogTitle style={{ padding: "10px" }}>Set Alarm Filters</DialogTitle>
        <div style={{ display: "flex", gap: "15px" }}>
          {!serviceId ? filterBy("Solution", solutions) : null}
          {filterBy("Priority", priorities)}
          {filterBy("Status", statuses)}
        </div>
        <div style={{ display: "flex", gap: "15px", margin: "8px" }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Start Time"
              value={startTime}
              inputFormat="dd/MM/yyyy h:mm:ss aaa"
              // maxDate={new Date(endTime)}
              onChange={(e) => {
                chkError();
                handleStartDate(e);
              }}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
            <DateTimePicker
              label="End Time"
              inputFormat="dd/MM/yyyy h:mm:ss aaa"
              value={endTime}
              // maxDate={new Date().setDate(new Date(startTime).getDate() + 60)}
              onChange={(e) => {
                chkError();
                handleEndDate(e);
              }}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </div>
        <div style={{ margin: "8px", display: "flex", gap: "15px" }}>
          <TextField
            id="search"
            color="primary"
            value={searchAsset}
            // defaultValue={filters.search.asset}
            onChange={(e) => setSearchAsset(e.target.value)}
            fullWidth
            label="Search by asset name ..."
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchOutlined />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            id="search"
            color="primary"
            value={searchRule}
            // defaultValue={filters.search.rule}
            onChange={(e) => setSearchRule(e.target.value)}
            fullWidth
            label="Search by rule name ..."
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchOutlined />
                </InputAdornment>
              ),
            }}
          />
        </div>
        {dateError ? (
          <p style={{ color: "red", fontSize: "12px" }}>{dateError}</p>
        ) : null}
        <div style={{ margin: "10px" }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={emails}
                onChange={(e) => setEmails(e.target.checked)}
              />
            }
            sx={{ marginRight: "30px" }}
            label="Emails"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={actuations}
                onChange={(e) => setActuations(e.target.checked)}
              />
            }
            label="Actuations"
          />
        </div>
        <DialogActions>
          <Button color="error" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            color="secondary"
            onClick={() => {
              let tempFilters = {
                date: {
                  startTime: startTime.valueOf(),
                  endTime: endTime.valueOf(),
                },
                status: selectedStatuses,
                solutions: selectedSolutions,
                priority: selectedPriorities,
                actuations,
                emails,
                search: {
                  asset: searchAsset,
                  rule: searchRule,
                },
              };
              updateFilter(tempFilters);
            }}
            disabled={dateError}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
