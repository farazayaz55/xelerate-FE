import React, { useEffect, useState, Fragment } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import EditRole from "./editRole";
import Loader from "components/Progress";
import DeleteAlert from "components/Alerts/Delete";
import Media from "components/Card Skeleton";
import { useGetRolesQuery, useDeleteRoleMutation } from "services/roles";
import Chip from "@mui/material/Chip";
import Badge from "@mui/material/Badge";
import { useSelector } from "react-redux";
import CodeIcon from "@mui/icons-material/Code";
import CalculateIcon from "@mui/icons-material/Calculate";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import GroupIcon from "@mui/icons-material/Group";
import SettingsIcon from "@mui/icons-material/Settings";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FileCopyIcon from '@mui/icons-material/FileCopy';
import IconButton from "@mui/material/IconButton";
import { useSnackbar } from "notistack";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import Dragable from "components/Dragable";
import './index.css'

// const useStyles = makeStyles(styles);
const utils = [
  { name: "Administration", icon: GroupIcon },
  { name: "Simulation", icon: GraphicEqIcon },
  { name: "Analytics", icon: AnalyticsIcon },
  { name: "Settings", icon: SettingsIcon },
  { name: "ROI Calculator", icon: CalculateIcon },
  { name: "Solution Management", icon: CodeIcon },
  { name: "Solution Enablement", icon: ImportExportIcon },
];
export default function RM(props) {
  // const classes = useStyles();
  let token = window.localStorage.getItem("token");
  const [loader, setLoader] = useState(true);
  const metaData = useSelector((state) => {
    return state.metaData;
  });
  const [snack, setSnack] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [cloneRole, setCloneRole] = useState("")
  const [isCloneRole, setIsCloneRole] = useState(false)
  const [activeId, setActiveId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [addRole, setAddRole] = useState(false);
  const [rolePermission, setRolePermission] = useState("");
  const [roles, setRoles] = useState([]);
  const getRoles = useGetRolesQuery(token);
  const [deleteRole, deleteResult] = useDeleteRoleMutation();
  const { enqueueSnackbar } = useSnackbar();

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnack(false);
  };

  function ifLoaded(state, component) {
    if (state) return <Loader />;
    else return component();
  }

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  useEffect(() => {
    if (!getRoles.isFetching && getRoles.isSuccess) {
      setRoles(getRoles.data?.payload);
      setLoader(false);
    } else if (
      !getRoles.isLoading &&
      getRoles.isError &&
      getRoles.data?.message != ""
    ) {
      showSnackbar("Roles", getRoles?.data?.message, "error");
    }
  }, [getRoles.isFetching]);

  async function onDelete(e) {
    let deletedRole = await deleteRole({ token, id: e });
    if (deletedRole.data?.success) {
      setDeleteModal(false);
      showSnackbar("Roles", deletedRole.data?.message, "success");
    } else {
      showSnackbar("Roles", deletedRole.data?.message, "error");
    }
  }
  async function toggleDelete(id = null) {
    setActiveId(id);
    setDeleteModal((state) => !state);
  }

  function cardLoaderFunc() {
    return (
      <Fragment>
        {/* {props.permission == "ALL" ? (
          <AddRole
            setSnackType={setSnackType}
            setSnackText={setSnackText}
            setSnack={setSnack}
            fetchRoles={fetchRoles}
          />
        ) : null} */}
        <Grid spacing={2} container>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((elm) => (
            <Grid item xs={12} sm={6} md={4}>
              <Media />
            </Grid>
          ))}
        </Grid>
      </Fragment>
    );
  }

  function generateIcons(Icon, exists, title) {
    return (
      <Tooltip title={title}>
        <Icon fontSize="10" sx={{ color: exists ? "white" : "#777" }} />
      </Tooltip>
    );
  }

  const handleEditClose = () => {
    if (selectedRole) {
      setSelectedRole("");
      setCloneRole("")
      setIsCloneRole(false)
    }
    if (addRole) {
      setAddRole(false);
    }
  };

  function checkPermission() {
    let roleManagement = metaData.apps
      .find((app) => app.name == "Administration")
      ?.tabs.find((tab) => tab.name == "Role Management");
    // if(roleManagement.permission){
    //   return roleManagement.permission == 'ALL' ? true : false;
    // }
    if (roleManagement) {
      return roleManagement.permission == "ALL" ? true : false;
    }
  }

  const handleCloneRole = (rule) => {
    setCloneRole(rule)
    setSelectedRole(rule)
    setIsCloneRole(true)
  }

  function cardFunc() {
    return (
      <Fragment>
        {checkPermission() ? (
          <Dragable bottom={"30px"} right={"30px"} name="add-role">
            <Fab
              style={{ boxShadow: "none" }}
              color="secondary"
              onClick={() => setAddRole(true)}
            >
              <AddIcon />
            </Fab>
          </Dragable>
        ) : null}
        {/* {props.permission == "ALL" ? (
          <AddRole
            setSnackType={setSnackType}
            setSnackText={setSnackText}
            setSnack={setSnack}
            fetchRoles={fetchRoles}
          />
        ) : null} */}
        <Grid container spacing={2}>
          {roles.map((elm) => (
            <Grid item xs={12} sm={6} md={4}>
              <div style={{ paddingBottom: "10px" }}>
                <Card
                  // className={classes.root}
                  variant="outlined"
                  style={{ boxShadow: "0px 3px 7px 0px lightgrey" }}
                >
                  <CardContent>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          margin: "10px 0px",
                          fontWeight: 500,
                          fontSize: 23,
                        }}
                      >
                        {elm.name}
                      </div>
                      {checkPermission() ? (
                        <div
                          style={{
                            display: "flex",
                            gap: "5px",
                            height: "35px",
                          }}
                        >
                          <Tooltip title="Clone this role">
                            <IconButton
                              aria-label="clone"
                              onClick={() => handleCloneRole(elm)}
                            >
                              <FileCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit this role">
                            <IconButton
                              aria-label="edit"
                              onClick={() => setSelectedRole(elm)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete this role">
                            <IconButton
                              aria-label="delete"
                              onClick={() => toggleDelete(elm._id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                        </div>
                      ) : null}
                    </div>
                    <div
                      style={{
                        color: "grey",
                        margin: "10px 0px 20px 0px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {elm.description}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        justifyContent: "end",
                      }}
                    >
                      <Badge
                        badgeContent={elm.services.length || "0"}
                        color="secondary"
                        style={{ marginRight: 20 }}
                      >
                        <Chip
                          label="Solutions"
                          style={{
                            color: metaData.branding.secondaryColor,
                            fontWeight: "bold",
                          }}
                        />
                      </Badge>
                      {utils.map((util) => {
                        return (
                          <div
                            style={{
                              padding: 15,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 35,
                              height: 35,
                              backgroundColor: elm.modules.find(
                                (m) => m.name == util.name
                              )
                                ? metaData.branding.secondaryColor
                                : "lightgrey",
                            }}
                          >
                            {generateIcons(
                              util.icon,
                              elm.modules.find((m) => m.name == util.name)
                                ? true
                                : false,
                              util.name
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Grid>
          ))}
        </Grid>
      </Fragment>
    );
  }

  return (
    <div>
      {selectedRole || cloneRole || addRole ? (
        <EditRole
          handleEditClose={handleEditClose}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          cloneRole={cloneRole}
          isCloneRole={isCloneRole}
        />
      ) : (
        <Fragment>
          {loader ? cardLoaderFunc() : cardFunc()}
          {activeId ? (
            <DeleteAlert
              deleteModal={deleteModal}
              question="Are you sure you want to delete this role?"
              platformCheck={false}
              id={activeId}
              handleDelete={onDelete}
              handleClose={toggleDelete}
            />
          ) : null}
        </Fragment>
      )}
    </div>
  );
}
