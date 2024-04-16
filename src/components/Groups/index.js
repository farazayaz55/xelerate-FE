import React, { Fragment, useEffect } from "react";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
import PropTypes from "prop-types";
import { styled } from "@mui/system";
import Box from "@mui/material/Box";
import TreeView from "@mui/lab/TreeView";
import TreeItem, { treeItemClasses } from "@mui/lab/TreeItem";
import Typography from "@mui/material/Typography";
import FolderIcon from "@mui/icons-material/Folder";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import hexRgb from "hex-rgb";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { useGetGroupsQuery, useGetOneGroupQuery } from "services/groups";
import { useSelector, useDispatch } from "react-redux";
import { setFilter } from "rtkSlices/filterDevicesSlice";
// import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { useSnackbar } from "notistack";
import { setSelectedGroup } from "rtkSlices/metaDataSlice";
import { useHistory } from "react-router-dom";

const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.content}`]: {
    color: theme.palette.text.secondary,
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    fontWeight: theme.typography.fontWeightMedium,
    "&.Mui-expanded": {
      fontWeight: theme.typography.fontWeightRegular,
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    "&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused": {
      backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
      color: "var(--tree-view-color)",
    },
    [`& .${treeItemClasses.label}`]: {
      fontWeight: "inherit",
      color: "inherit",
    },
  },
}));

function StyledTreeItem(props) {
  const {
    bgColor,
    color,
    labelIcon: LabelIcon,
    labelInfo,
    labelText,
    disabled,
    ...other
  } = props;

  return (
    <StyledTreeItemRoot
      disabled={disabled}
      label={
        <Box sx={{ display: "flex", alignItems: "center", p: 0.5, pr: 0 }}>
          <Box component={LabelIcon} color="inherit" sx={{ mr: 1 }} />
          <Typography
            variant="body2"
            sx={{ fontWeight: "inherit", flexGrow: 1 }}
          >
            {labelText}
          </Typography>
          <Typography variant="caption" color="inherit">
            {labelInfo}
          </Typography>
        </Box>
      }
      style={{
        "--tree-view-color": color,
        "--tree-view-bg-color": bgColor,
      }}
      {...other}
    />
  );
}

StyledTreeItem.propTypes = {
  bgColor: PropTypes.string,
  color: PropTypes.string,
  labelIcon: PropTypes.elementType.isRequired,
  labelInfo: PropTypes.string,
  labelText: PropTypes.string.isRequired,
};

export default function GmailTreeView(props) {
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  let token = window.localStorage.getItem("token");
  const metaDataValue = useSelector((state) => state.metaData);
  const service = metaDataValue.services.find(s=>s.id == props.id)
  console.log({service})
  const filtersValue = useSelector((state) => state.filterDevice);
  const [nameIdMap, setNameIdMap] = React.useState({});
  const [treeObj, setTreeObj] = React.useState(filtersValue.globalTree);
  const [expanded, setExpanded] = React.useState(filtersValue.expanded);
  const [selected, setSelected] = React.useState(
    `${filtersValue.group.id == "" ? ["0"] : [filtersValue.group.id]}:${
      filtersValue.group.name
    }`
  );
  const [groupIds, setGroupIds] = React.useState(["0"]);
  const [skip, setSkip] = React.useState(true);
  const [group, setGroup] = React.useState("0");
  const [firstLoad, setFirstLoad] = React.useState(true);
  const [rgb, setRgb] = React.useState(
    hexRgb(metaDataValue.branding.secondaryColor)
  );

  const groups = useGetGroupsQuery({
    token,
    refetch: true,
    params: props?.serviceDashboard && service.group?.id ? `${`?completeTree=true&groupId=${service.group?.id}`}` : `?completeTree=true&serviceId=${props?.id}${service.group?.id ? `&completeTree=truegroupId=${service.group?.id}` : ``}`,
  });

  useEffect(()=>{
    console.log("pirapps",props.groupsToggle)
    groups.refetch()
  },[props.groupsToggle])
  

  const singleGroup = useGetOneGroupQuery(
    {
      token,
      params: `?groupId=${group}`,
    },
    { skip: skip }
  );

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
    } else {
      if (
        groups.isSuccess &&
        !groups.isFetching 
      ) {
        console.log({ groups });
        let tempTreeObj = {};
        let tempIds = ["0"];
        let tempNameIdMap = {};
        if (groups.data.payload.length > 0)
          groups.data.payload.forEach((elm) => {
            tempNameIdMap[elm._id] = elm.name;
            tempIds.push(elm._id);
            let tempChild = {};
            if (elm.childGroups.length > 0)
              elm.childGroups.forEach((child, i) => {
                tempNameIdMap[child._id] = child.name;
                let loader = {};
                loader[`${child._id}-${i}`] = {
                  name: "Loading...",
                  id: `${child._id}-${i}`,
                  childGroups: {},
                };
                tempChild[child._id] = {
                  name: child.name,
                  id: child._id,
                  childGroups: child.childGroups.length > 0 ? loader : {},
                };
              });
            tempTreeObj[elm._id] = {
              name: elm.name,
              id: elm._id,
              childGroups: tempChild,
            };
          });
        setGroupIds(tempIds);
        setTreeObj(tempTreeObj);
        // globalTree = tempTreeObj;
        console.log('hereeeeeeeeeeeee-----',tempTreeObj)
        dispatch(setFilter({ globalTree: tempTreeObj }));
        setNameIdMap(tempNameIdMap);
        console.log({tempNameIdMap, tempTreeObj, tempIds})
        dispatch(setFilter({ first: false }));
        // console.log(props.selectedGroup?.id, ((props.serviceDashboard && service.group?.id) || (props.selectedGroup?.id)))
        if((props.serviceDashboard && service.group?.id) || props.selectedGroup?.id){
          console.log({props, tempTreeObj},service.group)
          const tempNodeId = props.selectedGroup?.id ? `${props.selectedGroup?.id}:${props.selectedGroup?.name}` : `${service.group?.id}:${service.group?.name}`
          dispatch(setFilter({ group: {name:props.selectedGroup?.id ? props.selectedGroup?.name : service.group?.name, id:props.selectedGroup?.id ? props.selectedGroup?.id : service.group?.id} }));
          handleSelect(null, tempNodeId)
        }
      }
      if (groups.isError) {
        showSnackbar("Groups", groups.error.data?.message, "error", 1000);
      }
    }
  }, [groups.isFetching]);

  useEffect(() => {
    if (singleGroup.isSuccess) {
      let tempTreeObj = JSON.parse(JSON.stringify(treeObj));
      let tempNameIdMap = { ...nameIdMap };
      let tempChild = {};
      let data = singleGroup.data.payload[0];
      console.log({data, tempTreeObj})
      let tempIds = [...groupIds];
      tempIds.push(data._id);
      tempNameIdMap[data._id] = data.name;
      if (data.childGroups.length > 0)
        data.childGroups.forEach((child, i) => {
          tempNameIdMap[child._id] = child.name;
          let loader = {};
          loader[`${child._id}-${i}`] = {
            name: "Loading...",
            id: `${child._id}-${i}`,
            childGroups: {},
          };
          tempChild[child._id] = {
            name: child.name,
            id: child._id,
            childGroups: child.childGroups.length > 0 ? loader : {},
          };
        });
      let destination = tempTreeObj;
      if (data.parentChain.length > 0) {
        if(Object.keys(destination).length){
          data.parentChain.forEach((elm) => {
            if (elm != data._id && (destination[elm])) destination = destination[elm].childGroups;
          });
        }
        destination[data._id] = {
          name: data.name,
          id: data._id,
          childGroups: tempChild,
        };
      }
      setGroupIds(tempIds);
      setTreeObj(tempTreeObj);
      // globalTree = tempTreeObj;
      console.log('hereeeeeeeeeeeee-----',tempTreeObj)
      dispatch(setFilter({ globalTree: tempTreeObj }));
      setNameIdMap(tempNameIdMap);
    }
    if (singleGroup.isError) {
      showSnackbar("Group", singleGroup.error.data?.message, "error", 1000);
    }
  }, [singleGroup.isFetching]);

  function treeStruct(parent) {
    return (
      <Fragment>
        {Object.keys(parent).map((elm) => {
          let disabled = false;
          if (
            groups?.data?.payload?.length &&
            groups.data.payload?.find((g) => g._id == elm)
          ) {
            disabled =
              groups.data.payload?.find((g) => g._id == elm).childGroups
                .length ||
              groups.data.payload?.find((g) => g._id == elm).devices.length
                ? false
                : true;
          }
          return (
            <StyledTreeItem
              // disabled={disabled}
              nodeId={`${parent[elm].id}:${parent[elm].name}`}
              labelText={parent[elm].name}
              labelIcon={FolderIcon}
              labelInfo={parent[elm].noOfDevices}
              color={metaDataValue.branding.secondaryColor}
              bgColor={`rgb(${rgb.red}, ${rgb.green}, ${rgb.blue},0.1)`}
            >
              {parent[elm].childGroups &&
              Object.keys(parent[elm].childGroups).length > 0
                ? treeStruct(parent[elm].childGroups)
                : null}
            </StyledTreeItem>
          );
        })}
      </Fragment>
    );
  }

  const checkSelectedNode = (nodeId) => {
    Object.entries(treeObj).map(([key,value], idx) => {
     let nodeKey = nodeId.split(":")[0]
      if(key == nodeKey) {
        props.setPath(["0:All assets"])
      }
    })
    return true;
  }

  const handleRemovePrevSelectedNodes = (childKeys, subTreeObj, nodeKey) => {
    const index = childKeys.indexOf(nodeKey);

    if(childKeys.length == 0) {
      return;
    }
    if(index !== -1) {
      let removedItem = childKeys.splice(index, 1);
      childKeys.map((childKey) => {
        let searchValue = `${childKey}:${subTreeObj.childGroups[childKey]?.name}`
        let deleteIndex = props.path.indexOf(searchValue)
      
        if(deleteIndex !== -1) {
          let pathArray = props.path
          let deletedPathName = pathArray.splice(0, deleteIndex+1)
          props.setPath(pathArray)

        } else if (Object.keys(subTreeObj.childGroups[childKey]?.childGroups)?.length > 0) {
          let innerChildKeys = Object.keys(subTreeObj.childGroups[childKey]?.childGroups)
          handleRemovePrevSelectedNodes(innerChildKeys, subTreeObj.childGroups[childKey], nodeKey)
        }
      })
    } else {
      childKeys.map((childKey) => {
        let innerChildKeys = Object.keys(subTreeObj.childGroups[childKey]?.childGroups)
        handleRemovePrevSelectedNodes(innerChildKeys, subTreeObj.childGroups[childKey], nodeKey)
      })
    }
  }

  const checkSelectedAdjacentNodes = (nodeId) => {
    let nodeKey = nodeId.split(":")[0]
    Object.entries(treeObj).map(([key, value], idx) => {
      let childKeys = Object.keys(value.childGroups)
      handleRemovePrevSelectedNodes(childKeys, value, nodeKey)
      return;
    })
  }

  const handleToggle = (event, nodeIds) => {
    let tempNodeIds = [];
    if(nodeIds[0] && groups.data.payload.find(g=>g._id == nodeIds[0].split(':')[0])){
      tempNodeIds = [nodeIds[0],"0:All assets"]
    }
    setExpanded(tempNodeIds.length ? tempNodeIds : nodeIds);
  };

  const handleSelect = (event, nodeIds) => {
    setSelected(nodeIds);
    if(props.setSelectedGroupNode){
      props.setSelectedGroupNode(nodeIds)
    }
    let tempArr = nodeIds.split(":");
    props.setGroup({
      id: tempArr[0] == "0" ? "" : tempArr[0],
      name: tempArr[1],
    });
    if (groupIds.indexOf(tempArr[0]) == -1) {
      setGroup(tempArr[0]);
      setSkip(false);
    }
    if(checkSelectedNode(nodeIds) && !props.path.includes(nodeIds)) {
      checkSelectedAdjacentNodes(nodeIds)
      props.setPath((prevState) => [nodeIds, ...prevState])
    }
  };

  function chkGroup() {
    let tab;
    let permission;
    let admin = metaDataValue.apps.find((m) => m.name == "Administration");
    if (admin) {
      tab = admin.tabs.find((m) => m.name == "Group Management");
      if (tab) permission = tab.permission;
    }
    return permission;
  }

  return (
    <div
      style={{
        width: "100%",
        height: props.height ? props.height : "100%",
      }}
    >
      {(chkGroup() == "ALL" || chkGroup() == "READ") &&
      (metaDataValue.groupPermissions[props.id] == "ALL" ||
        metaDataValue.groupPermissions[props.id] == "READ") ? (
        <span
          style={{
            width: "100%",
            justifyContent: "flex-end",
            display: "flex",
            position: "relative",
            bottom: props.setSelectedGroupNode ? "30px" : "10px",
            cursor: "pointer",
          }}
          onClick={() => {
            dispatch(setSelectedGroup(props.id));
            history.push("/administration/groupManagement");
          }}
        >
          <Tooltip
            title="Groups Administration"
            placement="left"
            arrow
            TransitionComponent={Zoom}
          >
            <SettingsOutlinedIcon color="secondary" />
          </Tooltip>
        </span>
      ) : null}

      <TreeView
        aria-label="gmail"
        defaultCollapseIcon={<ArrowDropDownIcon />}
        defaultExpandIcon={<ArrowRightIcon />}
        defaultEndIcon={<div style={{ width: 24 }} />}
        expanded={props.path}
        selected={selected}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
        sx={{
          height: "100%",
          flexGrow: 1,
          overflowY: "scroll",
        }}
      >
        {(props.serviceDashboard && service.group?.id) ?
        treeStruct(treeObj) : 
        <StyledTreeItem
          nodeId="0:All assets"
          labelText="All Assets"
          labelIcon={AccountTreeIcon}
          color={metaDataValue.branding.secondaryColor}
          bgColor={`rgb(${rgb.red}, ${rgb.green}, ${rgb.blue},0.1)`}
        >
          {treeStruct(treeObj)}
        </StyledTreeItem>}
      </TreeView>
    </div>
  );
}
