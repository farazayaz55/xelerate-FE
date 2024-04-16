import React, { Fragment, useEffect, useReducer, useState } from "react";
import { useSelector } from "react-redux";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useGetServicesQuery } from "services/services";
import {
  useCreateRoleMutation,
  useEditRoleMutation,
  useGetSpecificRoleQuery,
} from "services/roles";
import { useSnackbar } from "notistack";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Button from "@mui/material/Button";
import { useHistory } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import { useDispatch } from "react-redux";
import { setRole } from "rtkSlices/metaDataSlice";
import Chip from "@mui/material/Chip";
import GroupModal from "./groupModal";

const assets = [
  "Monitoring",
  "Controlling",
  "Configuration",
  "Alarms",
  "Events",
  "Analytics",
  "Group Management",
  "Tracking",
  "Rule Management",
  "Video Analytics",
  "Digital Twin",
  "History",
  "Metadata",
  "Threshold Profiles",
];

const allUtils = [
  {
    name: "Administration",
    tabs: [
      { name: "Device Management", permission: "ALL" },
      { name: "User Management", permission: "ALL" },
      { name: "Role Management", permission: "ALL" },
      { name: "Group Management", permission: "ALL" },
      { name: "Billing", permission: "ALL" },
    ],
    overall: "ALL",
  },
  {
    name: "Simulation",
    tabs: [
      { name: "Simulation", permission: "ALL" },
      { name: "Profiles", permission: "ALL" },
      { name: "", permission: "" },
      { name: "", permission: "" },
    ],
    overall: "ALL",
  },
  {
    name: "Analytics",
    tabs: [
      { name: "Self-Service Analytics", permission: "ALL" },
      { name: "Trend Forecasting", permission: "ALL" },
      { name: "Advanced Analytics", permission: "ALL" },
      { name: "", permission: "" },
    ],
    overall: "ALL",
  },
  {
    name: "Settings",
    tabs: [
      { name: "Branding", permission: "ALL" },
      { name: "", permission: "" },
      { name: "", permission: "" },
      { name: "", permission: "" },
    ],
    overall: "ALL",
  },
  {
    name: "ROI Calculator",
    tabs: [
      { name: "Calculator", permission: "ALL" },
      { name: "", permission: "" },
      { name: "", permission: "" },
      { name: "", permission: "" },
    ],
    overall: "ALL",
  },
  {
    name: "Alarms Management",
    tabs: [
      { name: "Alarms Management", permission: "ALL" },
      { name: "", permission: "" },
      { name: "", permission: "" },
      { name: "", permission: "" },
    ],
    overall: "ALL",
  },
  {
    name: "Solution Management",
    tabs: [
      { name: "Solution Creator", permission: "ALL" },
      { name: "Solution Settings", permission: "ALL" },
      { name: "Thresholds Management", permission: "ALL" },
      { name: "", permission: "" },
    ],
    overall: "ALL",
  },
  {
    name: "Solution Enablement",
    tabs: [
      { name: "Solution Enablement", permission: "ALL" },
      { name: "", permission: "" },
      { name: "", permission: "" },
      { name: "", permission: "" },
    ],
    overall: "ALL",
  },
];

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3, overflow: "hidden" }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}
export default function EditRole(props) {
  let modules = [];
  const allServices = useSelector((state) => state.metaData?.services);
  const [isLoading, setIsLoading] = useState(false);
  const [groupModal, setGroupModal] = useState(false);
  const [serviceId, setServiceId] = useState("");
  const initalState = {
    Groups: false,
    "Overall Permissions": false,
  };

  assets.forEach((asset) => {
    initalState[asset] = false;
  });

  const [hoverState, dispatchHoverState] = useReducer((state, action) => {
    return { ...state, [action.type]: action.value };
  }, initalState);

  if (props.selectedRole) {
    console.log(props.selectedRole);
    modules = JSON.parse(JSON.stringify(props.selectedRole.modules));
    allUtils.forEach((mod) => {
      let ind = modules.findIndex((m) => m.name == mod.name);
      if (ind != -1) {
        mod.tabs.forEach((t) => {
          if (!t.name) {
            modules
              .find((m) => m.name == mod.name)
              ?.tabs.push({ name: "", permissions: "" });
          } else {
            if (
              !modules
                .find((m) => m.name == mod.name)
                ?.tabs.find((tab) => tab.name == t.name)
            ) {
              modules
                .find((m) => m.name == mod.name)
                ?.tabs.push({ name: t.name, permission: "disable" });
            }
          }
        });
        modules[ind].overall = !modules.find((s) => s.name == mod.name)
          ? "disable"
          : modules
            .find((s) => s.name == mod.name)
            ?.tabs.filter((t) => t.permission && t.permission == "ALL")
            ?.length ==
            modules.find((s) => s.name == mod.name)?.tabs.filter((t) => t.name)
              .length
            ? "ALL"
            : modules
              .find((s) => s.name == mod.name)
              ?.tabs.filter((t) => t.permission && t.permission == "READ")
              ?.length ==
              modules.find((s) => s.name == mod.name)?.tabs.filter((t) => t.name)
                .length
              ? "READ"
              : "";
      } else {
        modules.push({
          name: mod.name,
          tabs: mod.tabs.map((m) => {
            return { name: m.name, permission: m.permission ? "disable" : "" };
          }),
          overall: "disable",
        });
      }
    });
  }
  const history = useHistory();
  let token = window.localStorage.getItem("token");
  const getServices = useGetServicesQuery({
    token,
    param: "?tenant=true&user=true",
  });
  const dispatch = useDispatch();
  const [createRole, createResult] = useCreateRoleMutation();
  const [updateRole, updateResult] = useEditRoleMutation();
  const [roleChanged, setRoleChanged] = React.useState(false);
  const [groupIds, setGroupIds] = useState(props.selectedRole ? patchGroupIds() : [])
  const roleRes = useGetSpecificRoleQuery(window.localStorage.getItem("role"), {
    skip: !roleChanged,
  });
  const [value, setValue] = React.useState(0);
  const [name, setName] = React.useState(
    props.isCloneRole
      ? props.selectedRole.name + " - clone"
      : props.selectedRole.name || ""
  );
  const [description, setDescription] = React.useState(
    props.selectedRole.description || ""
  );
  const { enqueueSnackbar } = useSnackbar();
  const [utils, setUtils] = React.useState(
    !props.selectedRole ? allUtils : modules
  );
  const [servicePermissions, setServicePermissions] = React.useState([]);

  useEffect(() => {
    if (!roleRes.isFetching && roleRes.isSuccess) {
      dispatch(setRole(roleRes.data.payload));
      setRoleChanged(false);
      // props.handleEditClose();
    }
  }, [roleRes.isFetching]);

  function patchGroupIds() {
    const tempGroupIds = [];
    props.selectedRole.services.forEach(s => {
      if (s.group && s.group.id) {
        tempGroupIds.push({ id: s.group.id, name: s.group.name, serviceId: s.serviceId })
      }
    })
    return tempGroupIds;
  }

  const resetGroupsToAssets = () => {
    setGroupIds([]);
  };

  useEffect(() => {
    // let tabs = {
    //   location: 'Tracking',
    //   maintenance: 'Rule Management',
    //   digitalTwin: 'Digital Twin',
    //   videoAnalytics: 'Video Analytics'
    // }
    if (!getServices.isFetching && getServices.isSuccess) {
      let perms = getServices.data.payload.map((service) => {
        let metaData;
        if (typeof service.metaData === "string")
          metaData = JSON.parse(service.metaData);
        else metaData = service.metaData;
        const tempSelectedService = props.selectedRole ? props.selectedRole.services.find(s => s.serviceId == service._id) : {};
        console.log({ tempSelectedService })
        return {
          name: service.name,
          id: service._id,
          group: { name: props.selectedRole && tempSelectedService?.group ? tempSelectedService.group.name : "", id: props.selectedRole && tempSelectedService?.group ? tempSelectedService.group.id : "" },
          assets: assets.reduce((acc, asset) => {
            if (
              allServices
                .find((n) => n.name == service.name)
                ?.tabs.find((t) => t.name == asset) ||
              asset == "Monitoring" ||
              asset == "Controlling" ||
              asset == "Alarms" ||
              asset == "Events" ||
              asset == "Analytics" ||
              asset == "History" ||
              asset == "Metadata" ||
              asset == "Group Management" ||
              asset == "Billing" ||
              asset == "Configuration" ||
              asset == "Threshold Profiles" ||
              (metaData.tabs.location && asset == "Tracking") ||
              (metaData.tabs.location && asset == "Rule Management") ||
              (metaData.tabs.location && asset == "Digital Twin") ||
              (metaData.tabs.location && asset == "Video Analytics")
            ) {
              acc.push({
                name: asset,
                group: { name: props.selectedRole && tempSelectedService?.group ? tempSelectedService.group.name : "", id: props.selectedRole && tempSelectedService?.group ? tempSelectedService.group.id : "" },
                permissions: !props.selectedRole
                  ? "ALL"
                  : props.selectedRole.services
                    .find((s) => s.serviceId == service._id)
                    ?.tabs.find((t) => t.name == asset)?.permission ||
                  "disable",
              });
            }
            return acc;
          }, []),
          serviceId: service._id,
          overall: !props.selectedRole
            ? "ALL"
            : !props.selectedRole.services.find(
              (s) => s.serviceId == service._id
            )
              ? "disable"
              : props.selectedRole.services
                .find((s) => s.serviceId == service._id)
                ?.tabs.filter((t) => t.permission == "ALL")?.length ==
                props.selectedRole.services.find(
                  (s) => s.serviceId == service._id
                )?.tabs.length
                ? "ALL"
                : props.selectedRole.services
                  .find((s) => s.serviceId == service._id)
                  ?.tabs.filter((t) => t.permission == "READ")?.length ==
                  props.selectedRole.services.find(
                    (s) => s.serviceId == service._id
                  )?.tabs.length
                  ? "READ"
                  : "",
        };
      });
      setServicePermissions(perms);
      console.log({ perms })
    }
    if (!getServices.isFetching && getServices.isError) {
      showSnackbar("Role", getServices.data?.message, "error", 1000);
    }
  }, [getServices.isFetching]);

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  /**
   * 
   * @param {String} text 
   * @returns basically this function removes extra spaces before - and after - , there should only be one space before and after
   * - clone 
   */
  function removeExtraSpaces(text) {
    text = text.trim();

    // Regular expression to match hyphen with any whitespace combination
    const hyphenPattern = /\s*(-|\s)\s*/g;
  
    // Replace multiple spaces with a single space before and after hyphens
    return text.replace(hyphenPattern, ' - ')
  }

  async function addRole() {
    setIsLoading(true);

    let body = {
      name: name,
      description: description,
      services: [],
      modules: [],
    };
    let services = [];
    let modules = [];
    servicePermissions.forEach((service, i) => {
      if (service.overall != "disable") {
        console.log({ groupIds })
        const tempGroup = groupIds.find(g => g.serviceId == service.serviceId);
        services.push({
          serviceId: service.serviceId,
          tabs: [],
          group: { id: tempGroup?.id && tempGroup?.id != "0" ? tempGroup?.id : "", name: tempGroup?.name }
        });
        service.assets.forEach((asset) => {
          if (asset.permissions != "disable") {
            services[services.length - 1].tabs.push({
              name: asset.name,
              permission: asset.permissions,
            });
          }
        });
      }
    });
    utils.forEach((util, i) => {
      if (util.overall != "disable") {
        modules.push({
          name: util.name,
          tabs: [],
        });
        util.tabs
          .filter((t) => t.name)
          .forEach((tab) => {
            if (tab.permission != "disable") {
              modules[modules.length - 1].tabs.push({
                name:
                  tab.name == "Predictive Analytics"
                    ? "Trend Forecasting"
                    : tab.name,
                permission: tab.permission,
              });
            }
          });
      }
    });
    body.services = services;
    modules.forEach((mod) => {
      if (mod.tabs.length) {
        body.modules.push(mod);
      }
    });
    if (!props.selectedRole || props.isCloneRole) {
      body.name=removeExtraSpaces(body.name)
      let createdRole = await createRole({ token, body });
      if (createdRole.data?.success) {
        showSnackbar("Role", createdRole.data?.message, "success", 1000);
        props.handleEditClose();
        setIsLoading(false);
      }
      if (createdRole.error) {
        showSnackbar(
          "Role",
          createdRole.data?.message || createdRole?.error?.data?.message,
          "error",
          1000
        );
        setIsLoading(false);
      }
    } else {
      if (name == props.selectedRole.name) {
        delete body.name;
      }
      let updatedRole = await updateRole({
        token,
        body,
        id: props.selectedRole._id,
      });
      if (updatedRole.data?.success) {
        setRoleChanged(true);
        showSnackbar("Role", updatedRole.data?.message, "success", 1000);
        setIsLoading(false);
      }
      if (updatedRole.error) {
        showSnackbar(
          "Role",
          updatedRole.data?.message || updatedRole?.error?.data?.message,
          "error",
          1000
        );
        setIsLoading(false);
      }
    }
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const servicePermissionChange = (service, asset, value, overall) => {
    let perms = JSON.parse(JSON.stringify(servicePermissions));
    if (!overall) {
      if (service == -1) {
        //make all the rows
        const servicesLength = servicePermissions.length;
        for (let i = 0; i < servicesLength; i++) {
          perms[i].assets.find((a) => a.name == asset).permissions = value;
          if (!perms[i].assets.filter((a) => a.permissions != value).length) {
            perms[i].overall = value;
          } else {
            perms[i].overall = "";
          }
        }
      } else {
        perms[service].assets.find((a) => a.name == asset).permissions = value;
        if (
          !perms[service].assets.filter((a) => a.permissions != value).length
        ) {
          perms[service].overall = value;
        } else {
          perms[service].overall = "";
        }
      }
    } else {
      if (service == -1) {
        const servicesLength = servicePermissions.length;
        for (let i = 0; i < servicesLength; i++) {
          perms[i].overall = value;
          perms[i].assets.forEach((asset) => {
            asset.permissions = value;
          });
        }
      } else {
        perms[service].overall = value;
        perms[service].assets.forEach((asset) => {
          asset.permissions = value;
        });
      }
    }
    setServicePermissions(perms);
  };
  const utilPermissionChange = (util, tab, value, overall) => {
    let tempUtils = JSON.parse(JSON.stringify(utils));
    if (!overall) {
      tempUtils[util].tabs[tab].permission = value;
      if (
        !tempUtils[util].tabs.filter(
          (t) => t.permission && t.permission != value
        ).length
      ) {
        tempUtils[util].overall = value;
      } else {
        tempUtils[util].overall = "";
      }
    } else {
      tempUtils[util].overall = value;
      tempUtils[util].tabs.forEach((tab) => {
        tab.permission = value;
      });
    }
    setUtils(tempUtils);
  };

  const handleGroupClick = (id) => {
    setServiceId(id)
    setGroupModal(!groupModal);
    // console.log(id, props.selectedRole)
  };

  const AccessType = ({ asset }) => {
    return (
      <>
        <div
          style={{
            display: "flex",
            gap: 4,
            justifyContent: "center",
          }}
        >
          <Tooltip title="Full Access">
            <CheckCircleOutlinedIcon
              onClick={() => {
                asset == "Overall Permissions"
                  ? servicePermissionChange(-1, null, "ALL", true)
                  : servicePermissionChange(-1, asset, "ALL", false);
              }}
              sx={{ color: "#222", cursor: "pointer" }}
            />
          </Tooltip>
          <Tooltip title="Partial Access">
            <VisibilityOutlinedIcon
              onClick={() => {
                asset == "Overall Permissions"
                  ? servicePermissionChange(-1, null, "READ", true)
                  : servicePermissionChange(-1, asset, "READ", false);
              }}
              sx={{ color: "#222", cursor: "pointer" }}
            />
          </Tooltip>
          <Tooltip title="Disable">
            <CancelOutlinedIcon
              onClick={() => {
                asset == "Overall Permissions"
                  ? servicePermissionChange(-1, null, "disable", true)
                  : servicePermissionChange(-1, asset, "disable", false);
              }}
              sx={{ color: "#222", cursor: "pointer" }}
            />
          </Tooltip>
        </div>
      </>
    );
  };

  return (
    <Fragment>
      <GroupModal open={groupModal} setGroupModal={(e) => setGroupModal(e)} serviceId={serviceId} setGroupIds={(e) => {
        console.log(e)
        setGroupIds(e)

      }}
        selectedGroup={props.selectedRole ? props.selectedRole.services.find(s => s.serviceId == serviceId)?.group : {}}
        groupIds={groupIds} />
      <Card>
        <CardContent>
          <Box sx={{ width: "100%" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                borderBottom: 1,
                borderColor: "divider",
              }}
            >
              <Tabs
                style={{ display: "flex", justifyContent: "center" }}
                value={value}
                onChange={handleChange}
                aria-label="basic tabs example"
              >
                <Tab label="Key Information" />
                <Tab label="Utilities Permissions" />
                <Tab label="Solutions Permissions" />
              </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
              <div>
                <div>
                  <TextField
                    label="Name"
                    style={{
                      marginBottom: "10px",
                      width: "100%",
                    }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <TextField
                    label="Description"
                    multiline
                    style={{
                      marginBottom: "10px",
                      width: "100%",
                    }}
                    value={description}
                    rows={12}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </TabPanel>
            <TabPanel value={value} index={1}>
              <TableContainer
                component={Paper}
                sx={{ maxHeight: "calc(100vh - 300px)" }}
              >
                <Table stickyHeader aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Name</TableCell>
                      <TableCell align="center">Overall Permissions</TableCell>
                      <TableCell align="center" colSpan={4}>
                        Permissions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {utils.map((util, utilIndex) => (
                      <TableRow
                        key={util.name}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell align="center">{util.name}</TableCell>
                        <TableCell
                          style={{ backgroundColor: "rgb(245 245 245)" }}
                          align="center"
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: 4,
                              justifyContent: "center",
                            }}
                          >
                            <Tooltip title="Full Access">
                              {util.overall == "ALL" ? (
                                <CheckCircleIcon color="success" />
                              ) : (
                                <CheckCircleOutlinedIcon
                                  onClick={() =>
                                    utilPermissionChange(
                                      utilIndex,
                                      null,
                                      "ALL",
                                      true
                                    )
                                  }
                                  sx={{ color: "#222", cursor: "pointer" }}
                                />
                              )}
                            </Tooltip>
                            <Tooltip title="Partial Access">
                              {util.overall == "READ" ? (
                                <VisibilityIcon color="warning" />
                              ) : (
                                <VisibilityOutlinedIcon
                                  onClick={() =>
                                    utilPermissionChange(
                                      utilIndex,
                                      null,
                                      "READ",
                                      true
                                    )
                                  }
                                  sx={{ color: "#222", cursor: "pointer" }}
                                />
                              )}
                            </Tooltip>
                            <Tooltip title="Disable">
                              {util.overall == "disable" ? (
                                <CancelIcon color="error" />
                              ) : (
                                <CancelOutlinedIcon
                                  onClick={() =>
                                    utilPermissionChange(
                                      utilIndex,
                                      null,
                                      "disable",
                                      true
                                    )
                                  }
                                  sx={{ color: "#222", cursor: "pointer" }}
                                />
                              )}
                            </Tooltip>
                          </div>
                        </TableCell>
                        {/* <TableRow> */}
                        {util.tabs.map((tab, tabIndex) => {
                          return (
                            <TableCell align="center">
                              {tab.name ? (
                                <div>
                                  <div style={{ fontSize: 12, color: "#444" }}>
                                    {tab.name}
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: 4,
                                      justifyContent: "center",
                                    }}
                                  >
                                    <Tooltip title="Full Access">
                                      {tab.permission == "ALL" ? (
                                        <CheckCircleIcon color="success" />
                                      ) : (
                                        <CheckCircleOutlinedIcon
                                          onClick={() =>
                                            utilPermissionChange(
                                              utilIndex,
                                              tabIndex,
                                              "ALL",
                                              false
                                            )
                                          }
                                          sx={{
                                            color: "#666",
                                            cursor: "pointer",
                                          }}
                                        />
                                      )}
                                    </Tooltip>
                                    <Tooltip title="Partial Access">
                                      {tab.permission == "READ" ? (
                                        <VisibilityIcon color="warning" />
                                      ) : (
                                        <VisibilityOutlinedIcon
                                          onClick={() =>
                                            utilPermissionChange(
                                              utilIndex,
                                              tabIndex,
                                              "READ",
                                              false
                                            )
                                          }
                                          sx={{
                                            color: "#666",
                                            cursor: "pointer",
                                          }}
                                        />
                                      )}
                                    </Tooltip>
                                    <Tooltip title="Disable">
                                      {tab.permission == "disable" ? (
                                        <CancelIcon color="error" />
                                      ) : (
                                        <CancelOutlinedIcon
                                          onClick={() =>
                                            utilPermissionChange(
                                              utilIndex,
                                              tabIndex,
                                              "disable",
                                              false
                                            )
                                          }
                                          sx={{
                                            color: "#666",
                                            cursor: "pointer",
                                          }}
                                        />
                                      )}
                                    </Tooltip>
                                  </div>
                                </div>
                              ) : (
                                <div>-</div>
                              )}
                            </TableCell>
                          );
                        })}
                        {/* </TableRow> */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
            <TabPanel value={value} index={2}  >
              <TableContainer
                component={Paper}
                sx={{ maxHeight: "calc(100vh - 300px)" , width:'92vw'}}
              >
                <Table stickyHeader aria-label="simple table">
                  <TableHead  >
                    <TableRow>
                      <TableCell align="center">Name</TableCell>
                      <TableCell
                        align="center"
                        onMouseEnter={() =>
                          dispatchHoverState({ type: "Groups", value: true })
                        }
                        onMouseLeave={() =>
                          dispatchHoverState({ type: "Groups", value: false })
                        }
                      >
                        {hoverState["Groups"] ? (
                          <Button onClick={resetGroupsToAssets}>Reset</Button>
                        ) : (
                          "Groups"
                        )}
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{
                          backgroundColor: hoverState["Overall Permissions"]
                            ? "rgb(245, 245, 245)"
                            : "#fff",
                        }}
                        onMouseEnter={() =>
                          dispatchHoverState({
                            type: "Overall Permissions",
                            value: true,
                          })
                        }
                        onMouseLeave={() =>
                          dispatchHoverState({
                            type: "Overall Permissions",
                            value: false,
                          })
                        }
                      >
                        {hoverState["Overall Permissions"] ? (
                          <AccessType asset={"Overall Permissions"} />
                        ) : (
                          "Overall Permissions"
                        )}
                      </TableCell>
                      {assets.map((asset) => {
                        return (
                          <TableCell
                            align="center"
                            onMouseEnter={() =>
                              dispatchHoverState({
                                type: asset,
                                value: true,
                              })
                            }
                            onMouseLeave={() =>
                              dispatchHoverState({
                                type: asset,
                                value: false,
                              })
                            }
                          >
                            {hoverState[asset] ? (
                              <AccessType asset={asset} />
                            ) : (
                              asset
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {servicePermissions.map((service, serviceIndex) => (
                      <TableRow
                        key={service.name}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell align="center">{service.name}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={groupIds.find(g => g.serviceId == service.id)?.name || "All assets"}
                            onClick={() => handleGroupClick(service.id)}
                          />
                        </TableCell>
                        <TableCell
                          style={{ backgroundColor: "rgb(245 245 245)" }}
                          align="center"
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: 4,
                              justifyContent: "center",
                            }}
                          >
                            <Tooltip title="Full Access">
                              {service.overall == "ALL" ? (
                                <CheckCircleIcon color="success" />
                              ) : (
                                <CheckCircleOutlinedIcon
                                  onClick={() =>
                                    servicePermissionChange(
                                      serviceIndex,
                                      null,
                                      "ALL",
                                      true
                                    )
                                  }
                                  sx={{ color: "#222", cursor: "pointer" }}
                                />
                              )}
                            </Tooltip>
                            <Tooltip title="Partial Access">
                              {service.overall == "READ" ? (
                                <VisibilityIcon color="warning" />
                              ) : (
                                <VisibilityOutlinedIcon
                                  onClick={() =>
                                    servicePermissionChange(
                                      serviceIndex,
                                      null,
                                      "READ",
                                      true
                                    )
                                  }
                                  sx={{ color: "#222", cursor: "pointer" }}
                                />
                              )}
                            </Tooltip>
                            <Tooltip title="Disable">
                              {service.overall == "disable" ? (
                                <CancelIcon color="error" />
                              ) : (
                                <CancelOutlinedIcon
                                  onClick={() =>
                                    servicePermissionChange(
                                      serviceIndex,
                                      null,
                                      "disable",
                                      true
                                    )
                                  }
                                  sx={{ color: "#222", cursor: "pointer" }}
                                />
                              )}
                            </Tooltip>
                          </div>
                        </TableCell>
                        {assets.map((asset, assetIndex) => {
                          return (
                            <TableCell align="center">
                              {service.assets.find((a) => a.name == asset) ||
                                asset == "Monitoring" ||
                                asset == "Controlling" ||
                                asset == "Alarms" ||
                                asset == "Events" ||
                                asset == "Analytics" ||
                                asset == "History" ||
                                asset == "Metadata" ||
                                asset == "Configuration" ||
                                asset == "Billing" ||
                                asset == "Threshold Profiles" ||
                                asset == "Group Management" ? (
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 4,
                                    justifyContent: "center",
                                  }}
                                >
                                  <Tooltip title="Full Access">
                                    {service.assets.find((a) => a.name == asset)
                                      ?.permissions == "ALL" ? (
                                      <CheckCircleIcon color="success" />
                                    ) : (
                                      <CheckCircleOutlinedIcon
                                        onClick={() =>
                                          servicePermissionChange(
                                            serviceIndex,
                                            asset,
                                            "ALL",
                                            false
                                          )
                                        }
                                        sx={{
                                          color: "#666",
                                          cursor: "pointer",
                                        }}
                                      />
                                    )}
                                  </Tooltip>
                                  <Tooltip title="Partial Access">
                                    {service.assets.find((a) => a.name == asset)
                                      ?.permissions == "READ" ? (
                                      <VisibilityIcon color="warning" />
                                    ) : (
                                      <VisibilityOutlinedIcon
                                        onClick={() =>
                                          servicePermissionChange(
                                            serviceIndex,
                                            asset,
                                            "READ",
                                            false
                                          )
                                        }
                                        sx={{
                                          color: "#666",
                                          cursor: "pointer",
                                        }}
                                      />
                                    )}
                                  </Tooltip>
                                  <Tooltip title="Disable">
                                    {service.assets.find((a) => a.name == asset)
                                      ?.permissions == "disable" ? (
                                      <CancelIcon color="error" />
                                    ) : (
                                      <CancelOutlinedIcon
                                        onClick={() =>
                                          servicePermissionChange(
                                            serviceIndex,
                                            asset,
                                            "disable",
                                            false
                                          )
                                        }
                                        sx={{
                                          color: "#666",
                                          cursor: "pointer",
                                        }}
                                      />
                                    )}
                                  </Tooltip>
                                </div>
                              ) : (
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 4,
                                    justifyContent: "center",
                                  }}
                                >
                                  -
                                </div>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
          </Box>
          <div
            style={{
              display: "flex",
              gap: "20px",
              justifyContent: "center",
              margin: "6px 20px",
            }}
          >
            <Button
              onClick={props.handleEditClose}
              variant="contained"
              color="error"
            >
              Cancel
            </Button>
            <Button
              disabled={!name || !description || isLoading}
              onClick={() => addRole()}
              variant="contained"
              color="secondary"
            >
              {isLoading && props.isCloneRole
                ? "Cloning"
                : !isLoading && props.isCloneRole
                  ? "Clone"
                  : isLoading && props.selectedRole
                    ? "Updating"
                    : !isLoading && props.selectedRole
                      ? "Update"
                      : "Submit"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Fragment>
  );
}
