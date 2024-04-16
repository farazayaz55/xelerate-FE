//----------------CORE-----------------//
import React, { useEffect, useState, Fragment } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

//--------------MUI COMPS----------------//
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import Button from "@mui/material/Button";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import ListItemButton from "@mui/material/ListItemButton";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Fab from "@mui/material/Fab";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import Zoom from "@mui/material/Zoom";
import Dragable from "components/Dragable";

//---------------EXTERNAL COMPS---------------//
import { setFilteredServices } from "rtkSlices/filteredServicesSlice";
import { setSelectedTags } from "rtkSlices/selectedTagsSlice";

export default function Tags(props) {
  const dispatch = useDispatch();
  const [tempFilters, setTempFilters] = useState(props.selectedTags);
  const [page, setPage] = useState(0);
  const [openPopup, setOpenPopup] = useState(false);
  const [applied, setApplied] = useState(false);
  const metaDataValue = useSelector((state) => state.metaData);

  useEffect(() => {
    setTempFilters(props.selectedTags);
  }, [props.selectedTags]);

  function back(page) {
    let disabled;
    if (page != 1) disabled = false;
    else disabled = true;
    return (
      <IconButton
        size="medium"
        onClick={handlePagePrevious}
        disabled={page == 0}
      >
        <NavigateBeforeIcon fontSize="inherit" />
      </IconButton>
    );
  }

  function next(page) {
    let disabled;
    if ((page + 1) * 6 < props.tagsRes?.data?.payload?.length) {
      disabled = false;
    } else {
      disabled = true;
    }
    return (
      <IconButton size="medium" onClick={handlePageNext} disabled={disabled}>
        <NavigateNextIcon fontSize="inherit" />
      </IconButton>
    );
  }

  const handleListItemClick = (id) => {
    let tag = props.tagsRes?.data?.payload?.find((t) => t._id == id);
    setTempFilters(
      !tempFilters.find((s) => s._id == id)
        ? [...tempFilters, tag]
        : tempFilters.filter((s) => s._id != id)
    );
  };

  const handlePageNext = () => {
    setPage(page + 1);
  };
  const handlePagePrevious = () => {
    setPage(page - 1);
  };

  const handlepopupClose = (val = false) => {
    setOpenPopup(false);
    if (val) {
      setApplied(val);
      filterOutSolutions(tempFilters);
      dispatch(setSelectedTags(tempFilters));
    } else {
      setTempFilters(tempFilters);
      if (!applied) {
        dispatch(setSelectedTags([]));
      }
    }
  };

  function filterOutSolutions(currentTags) {
    let foundSolutions = [];
    currentTags.forEach((tag) => {
      let foundOne = props.services.filter((p) =>
        p.tags?.find((t) => t == tag._id)
      );
      if (foundOne.length) {
        foundOne.forEach((one) => {
          if (!foundSolutions.find((f) => f.id == one.id)) {
            foundSolutions.push(one);
          }
        });
      }
    });
    dispatch(
      setFilteredServices(currentTags.length ? foundSolutions : props.services)
    );
  }

  return (
    <div>
      <Dragable bottom={"100px"} right={"30px"} name="catalogue-filter">
        <Tooltip
          title="Apply Filter"
          TransitionComponent={Zoom}
          placement="top"
          arrow
        >
          <Fab
            style={{ boxShadow: "none" }}
            id="fab"
            color="secondary"
            aria-label="add"
            onClick={() => setOpenPopup(true)}
          >
            <FilterAltIcon />
          </Fab>
        </Tooltip>
      </Dragable>
      <Dialog
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        PaperProps={{ style: { width: "500px" } }}
      >
        <DialogTitle>Filter by tags</DialogTitle>
        <DialogContent style={{ height: "400px", overflow: "hidden" }}>
          <div style={{ height: "95%" }}>
            <List component="nav">
              <Divider />
              {props.tagsRes?.data?.payload
                ?.slice(page * 6, (page + 1) * 6)
                .map((elm, i) => {
                  return (
                    <Fragment>
                      <ListItemButton
                        onClick={() => handleListItemClick(elm._id)}
                        style={{
                          backgroundColor: tempFilters.find(
                            (s) => s._id == elm._id
                          )
                            ? metaDataValue?.branding?.secondaryColor
                            : "white",

                          margin: "5px",
                        }}
                      >
                        <ListItemIcon>
                          <LocalOfferIcon
                            style={{
                              color: tempFilters.find((s) => s._id == elm._id)
                                ? "white"
                                : "",
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={elm.name}
                          style={{
                            color: tempFilters.find((s) => s._id == elm._id)
                              ? "white"
                              : "",
                          }}
                        />
                      </ListItemButton>
                      <Divider />
                    </Fragment>
                  );
                })}
            </List>
          </div>
          <span
            style={{
              display: "flex",

              alignItems: "center",

              justifyContent: "center",
            }}
          >
            {back(page)}
            <p>{page + 1}</p>
            {next(page)}
          </span>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => handlepopupClose(false)}
            style={{ color: "#bf3535" }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handlepopupClose(true)}
            color="primary"
            disabled={!tempFilters.length}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
