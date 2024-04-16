import React from "react";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

function Search(props) {
  return (
    <TextField
      color="secondary"
      fullWidth
      size="small"
      label="Search"
      onChange={props.handleSearch}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon style={{ color: "grey" }} />
          </InputAdornment>
        ),
      }}
    />
  );
}

export default React.memo(Search);
