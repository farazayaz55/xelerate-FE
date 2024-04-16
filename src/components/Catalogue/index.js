//----------------CORE-----------------//
import React, { useEffect } from "react";
import { makeStyles } from "@mui/styles";
import { useSelector, useDispatch } from "react-redux";
import { useSnackbar } from "notistack";
import hexRgb from "hex-rgb";
//--------------MUI-------------//
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Grid } from "@mui/material";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import WebIcon from "@mui/icons-material/Web";
import { useGetTagsQuery } from "services/tags";
import Grow from "@mui/material/Grow";
import SearchIcon from "@mui/icons-material/Search";
import Zoom from "@mui/material/Zoom";
import CloseIcon from "@mui/icons-material/Close";
import Tooltip from "@mui/material/Tooltip";
import Fab from "@mui/material/Fab";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Badge from "@mui/material/Badge";
import InputBase from "@mui/material/InputBase";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
//-----------EXTERNAL--------//
import Media from "components/Card Skeleton";
import Dragable from "components/Dragable";
import Tags from "./tags";
import NoImage from "assets/img/catalogue.jpg";
import { setFilteredServices } from "rtkSlices/filteredServicesSlice";
import { setSelectedTags } from "rtkSlices/selectedTagsSlice";
import { setServices } from "rtkSlices/metaDataSlice";
import { useUploadBrandingMutation } from "services/branding";
import { resetFilter, setFilter } from "rtkSlices/filterDevicesSlice";

import Keys from "Keys";
import "./catalogue.css";

let rendered = false;

export default function MediaCard(props) {
  let token = window.localStorage.getItem("token");
  const dispatch = useDispatch();
  const [uploadBranding, uploadResult] = useUploadBrandingMutation();
  const [search, setSearch] = React.useState("");
  const [toggleSearch, setToggleSearch] = React.useState(false);
  const metaDataValue = useSelector((state) => state.metaData);
  const services = useSelector((state) => {
    return state.filteredServices
      ? state.selectedTags.length
        ? state.selectedTags.reduce((acc, tag) => {
          const services = metaDataValue.services.filter((service) =>
            service.tags.includes(tag._id)
          );
          return [...acc, ...services];
        }, [])
        : state.filteredServices.length > metaDataValue.services.length
          ? metaDataValue.services
          : state.filteredServices
      : metaDataValue.services;
  });
  const [hovered, setHovered] = React.useState(false);
  const [searchedSolutions, setSearchedSolutions] = React.useState([]);
  const selectedTags = useSelector((state) => {
    if (state.selectedTags?.value) return state.selectedTags.value;
    else return state.selectedTags.length ? state.selectedTags : [];
  });
  const { enqueueSnackbar } = useSnackbar();
  // const [pinId, setPinId] = React.useState('')
  let rgbSecondary = hexRgb(metaDataValue?.branding?.secondaryColor);

  const useStyles = makeStyles({
    root: {
      transition: "0.3s",
      "&:hover": {
        transition: "0.3s",
        transform: "translate(0, -5px)",
      },
    },
    card: {
      transition: "0.3s",
      width: "100%",
      "&:hover": {
        transition: "0.3s",
        boxShadow: "rgb(38, 57, 77) 0px 20px 30px -10px",
        transform: "translate(0, -5px)",
      },
    },
    media: {
      height: 200,
    },
    accordionSummary: {
      "> .MuiAccordionSummary-content": {
        display: "contents",
      },
    },
  });
  const classes = useStyles();
  const tagsRes = useGetTagsQuery();
  // const [page, setPage] = useState(0);
  useEffect(() => {
    if (!rendered) {
      rendered = true;
    }
    setTimeout(() => {
      document.getElementById("root").addEventListener("click", (e) => {
        if (window.location.pathname.includes("catalogue")) {
          const fabContainer = document.getElementById("fab-container");
          document.addEventListener("click", function (event) {
            if (!fabContainer.contains(event.target) && event.target.id && event.target.id !== 'search-sol') {
              // The click occurred outside of the "fab-container" div
              setToggleSearch(false);
            }
          });
        }
      });
    }, 5000)

  });

  useEffect(() => {
    document.title = "Solution Catalogue";
    console.log('hereeeee')
    dispatch(setFilter({ searching: false, search: "", searchFields: [], expanded: ["0:All assets"], group: { name: "All assets", id: "" } }))
  }, []);

  function handleClick(path) {
    const kpiData = localStorage.getItem("kpiData") ? JSON.parse(localStorage.getItem("kpiData")) : [];
    if (kpiData.length && kpiData.find(k => k.serviceId == path) && kpiData.find(k => k.serviceId == path).popup) {
      props.history.push(`/solutions/${path}/kpi`);
    }else if (kpiData.length && kpiData.find(k => k.serviceId == path) && kpiData.find(k => k.serviceId == path).videoWallPopup) {
      props.history.push(`/solutions/${path}/video_wall`);
    }
    else {
      props.history.push(`/solutions/${path}`);
    }
  }

  const searchSolutions = (e) => {
    setSearch(e.target.value);
    setSearchedSolutions(
      services.filter(
        (s) =>
          s.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
          s.description.toLowerCase().includes(e.target.value.toLowerCase())
      )
    );
  };

  function handleTagDelete(id) {
    dispatch(setSelectedTags(selectedTags.filter((s) => s._id != id)));
    filterOutSolutions(selectedTags.filter((s) => s._id != id));
  }

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

  function getServices() {
    return searchedSolutions.length
      ? searchedSolutions
      : search
        ? []
        : services;
  }

  const clearSearch = () => {
    setSearchedSolutions([]);
    setSearch("");
    setToggleSearch(false);
  };

  const onPin = async (id) => {
    let tempServices = JSON.parse(JSON.stringify(metaDataValue.services));
    let index = tempServices.findIndex((t) => t.id == getServices()[id - 1].id);
    let pinnedIndex = tempServices.filter((t) => t.pinned).length + 1;
    if (tempServices[index].pinned) {
      delete tempServices[index].pinned;
    } else {
      tempServices[index].pinned = pinnedIndex;
    }
    let pinnedSolutions = [];
    tempServices
      .filter((t) => t.pinned)
      .forEach((p) => {
        pinnedSolutions.push({ solution: p.id, pin: p.pinned });
      });
    let body = {
      pinnedSolutions,
    };
    let updatedSettings = await uploadBranding({
      token,
      body,
      type: metaDataValue.settings ? "PUT" : "POST",
      user: "true",
    });
    if (updatedSettings.data?.success) {
      dispatch(setServices(tempServices));
    } else if (updatedSettings.error) {
      showSnackbar(
        "Settings",
        updatedSettings.error.data?.message,
        "error",
        1000
      );
    }
    dispatch(setServices(tempServices));
  };

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  return (
    <div
      id="sol-catalogue"
      style={{
        height: "calc(100vh - 110px)",
        overflowY: "scroll",
        scrollbarWidth: "none",
        padding: "10px",
      }}
    >
      <div>
        {selectedTags.length ? (
          <Stack
            direction="row"
            spacing={1}
            style={{ justifyContent: "center", marginBottom: 20 }}
          >
            {selectedTags.map((tag) => {
              return (
                <Chip
                  color="secondary"
                  label={tag.name}
                  variant="filled"
                  style={{ cursor: "pointer" }}
                  onDelete={() => handleTagDelete(tag._id)}
                />
              );
            })}
          </Stack>
        ) : null}
        {getServices().length ? (
          <Grid container spacing={2}>
            {getServices().map((elm, i) => (
              <Grid item xs={12} sm={6} md={4} id={`solution-${elm.id}`}>
                <Grow appear={!rendered} in timeout={(i + 1) * 200}>
                  <div className={classes.root}>
                    <Card
                      onClick={(e) => {
                        if (
                          e.target?.viewportElement?.id == "pin-icon" ||
                          e.target.id == "pin-icon"
                        ) {
                          return;
                        }
                        handleClick(elm.path);
                      }}
                      onMouseOver={() => setHovered(i + 1)}
                      onMouseLeave={() => setHovered(false)}
                      className={classes.card}
                    >
                      <CardActionArea>
                        <CardMedia
                          className={classes.media}
                          image={elm.image ? elm.image : NoImage}
                        />
                        <CardContent
                          style={{
                            minHeight: "102px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              gutterBottom
                              variant="h7"
                              component="strong"
                            >
                              {elm.name}
                            </Typography>
                            {hovered == i + 1 ||
                              metaDataValue.services.find(
                                (m, ind) => m.pinned && ind == i
                              ) ? (
                              <PushPinOutlinedIcon
                                fontSize="small"
                                color={
                                  metaDataValue.services.find(
                                    (m, ind) => m.pinned && ind == i
                                  )
                                    ? "primary"
                                    : ""
                                }
                                onClick={() => onPin(i + 1)}
                                id="pin-icon"
                              />
                            ) : null}
                          </div>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            component="p"
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              marginBottom: "2px",
                            }}
                          >
                            {elm.description}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1}
                            style={{ justifyContent: "flex-end" }}
                          >
                            {elm.tags.slice(0, 2).map((tag) => {
                              return (
                                <Chip
                                  label={
                                    tagsRes.data?.payload.find(
                                      (t) => t._id == tag
                                    )?.name
                                  }
                                  size="small"
                                  style={{
                                    color:
                                      metaDataValue?.branding?.secondaryColor,
                                    backgroundColor: `rgb(${rgbSecondary.red}, ${rgbSecondary.green}, ${rgbSecondary.blue},0.1)`,
                                    fontWeight: "400",
                                    fontSize: "11px",
                                    borderRadius: 4,
                                  }}
                                />
                              );
                            })}
                          </Stack>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </div>
                </Grow>
              </Grid>
            ))}
          </Grid>
        ) : (
          <div
            style={{
              textAlign: "center",
              fontSize: 35,
              fontWeight: 500,
              marginTop: "14%",
              color: "rgb(199, 199, 199)",
            }}
          >
            <WebIcon style={{ color: "#c7c7c7", fontSize: "100px" }} />
            <div style={{ color: "#c8c8c8" }}>
              <p style={{ fontSize: "20px", marginTop: "10px" }}>
                {selectedTags.length || search
                  ? "No such solution found. Please adjust filters"
                  : "No Solutions added. Please consult platform administrator to add solutions here"}
              </p>
            </div>
          </div>
        )}
        <div id="fab-container" >
          <span onClick={() => {
            if (!toggleSearch) {
              document.getElementById("search-sol").focus();
            }
            setToggleSearch(!toggleSearch);
          }} >
            <Dragable bottom={"30px"} right={"30px"} name="catalogue-search" >

              <Tooltip
                title={!toggleSearch ? "Search Solutions" : "Close search"}
                TransitionComponent={Zoom}
                placement="bottom"
                arrow
              >
                <Fab
                  style={{ boxShadow: "none" }}
                  id="fab"
                  color="secondary"
                  aria-label="add"
                  className="btn-search"
                >
                  {toggleSearch ? (
                    <ArrowForwardIosIcon />
                  ) : search ? (
                    <Badge color="primary" variant="dot">
                      <SearchIcon />
                    </Badge>
                  ) : (
                    <SearchIcon />
                  )}
                </Fab>
              </Tooltip>
            </Dragable>
          </span>

          <Box
            sx={{
              width: 500,
              maxWidth: "100%",
              position: "fixed",
            }}
          >
            <InputBase
              placeholder="Search Solutions"
              onChange={searchSolutions}
              value={search}
              id="search-sol"
              color="secondary"
              className={!toggleSearch ? "hide-search" : "show-search"}
            />

            <IconButton
              onClick={clearSearch}
              className={search && toggleSearch ? "show-icon" : "hide-icon"}
              sx={{ p: "10px" }}
              aria-label="menu"
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Tags
            services={props.services}
            tagsRes={tagsRes}
            selectedTags={selectedTags}
          />
        </div>
      </div>
    </div>
  );
}
