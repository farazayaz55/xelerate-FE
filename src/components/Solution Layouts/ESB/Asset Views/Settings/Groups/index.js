import React, { Fragment, useEffect, useRef } from "react";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
import PropTypes from "prop-types";
import { styled } from "@mui/system";
import Box from "@mui/material/Box";
import TreeView from "@mui/lab/TreeView";
import TreeItem, { treeItemClasses } from "@mui/lab/TreeItem";
import Typography from "@mui/material/Typography";
import microgrid from "assets/microgrid.svg";
import FolderIcon from "@mui/icons-material/Folder";
import MemoryIcon from "@mui/icons-material/Memory";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import hexRgb from "hex-rgb";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { useGetGroupsQuery, useGetOneGroupQuery } from "services/groups";
import { useGetDevicesQuery } from "services/devices";
import { useSelector, useDispatch } from "react-redux";
import { setFilter } from "rtkSlices/filterDevicesSlice";
import { setGroupFilter } from "rtkSlices/groupFilterSlice";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import { useSnackbar } from "notistack";
import { useFormik } from "formik";
import * as Yup from "yup";
import { setSelectedGroup } from "rtkSlices/metaDataSlice";
import "app/style.css";

const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.content}`]: {
    color: theme.palette.text.secondary,
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    textAlign: "left",
    // paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    "&.Mui-expanded": {
      fontWeight: theme.typography.fontWeightRegular,
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    "&.Mui-focused, &.Mui-selected.Mui-focused": {
      backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
      color: "var(--tree-view-color)",
    },
    "&.Mui-selected": {
      backgroundColor: `rgba(51, 153, 255, 0.08)`,
    },
    [`& .${treeItemClasses.label}`]: {
      fontWeight: "inherit",
      color: "inherit",
    },
  },
  // [`& .${treeItemClasses.group}`]: {
  //   marginLeft: 0,
  //   [`& .${treeItemClasses.content}`]: {
  //     paddingLeft: theme.spacing(2),
  //   },
  // },
}));

function StyledTreeItem(props) {
  const {
    bgColor,
    color,
    labelIcon: LabelIcon,
    labelInfo,
    labelText,
    isFilterPresent,
    ...other
  } = props;

  return (
    <StyledTreeItemRoot
      label={
        <Box
          className={
            isFilterPresent ? `${treeItemClasses.content} Mui-focused` : ""
          }
          sx={{ display: "flex", alignItems: "center", p: 0.5, pr: 0 }}
        >
          <Box component={LabelIcon} color="inherit" sx={{ mr: 1 }} />
          <Typography
            variant="body2"
            sx={{ fontWeight: "inherit", flexGrow: 1 }}
          >
            {/* {highlight} */}
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

const microgridComponent = () => {
  return <MemoryIcon />;
};

StyledTreeItem.propTypes = {
  bgColor: PropTypes.string,
  color: PropTypes.string,
  labelIcon: PropTypes.elementType.isRequired,
  labelInfo: PropTypes.string,
  labelText: PropTypes.string.isRequired,
  isFilterPresent: PropTypes.bool,
};

// let globalTree = {
//   "1": {
//     name: "Loading...",
//     id: "1",
//     childGroups: {},
//   },
// };

let expand = false;
export default function GmailTreeView(props) {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  let token = window.localStorage.getItem("token");
  const metaDataValue = useSelector((state) => state.metaData);
  const service = metaDataValue.services.find(s=>s.id == props.id)
  const filtersValue = useSelector((state) => state.filterDevice);
  const groupFiltersValue = useSelector((state) => state.groupFilter);
  const [searchString, setSearchString] = React.useState(
    filtersValue.searchString
  );
  const [matchedNodes, setMatchedNodes] = React.useState(
    filtersValue.matchedNodes
  );
  const [nameIdMap, setNameIdMap] = React.useState({});
  const [treeObj, setTreeObj] = React.useState(filtersValue.globalTree);
  const [expanded, setExpanded] = React.useState(groupFiltersValue?.expanded);
  const [selected, setSelected] = React.useState(
    `${filtersValue.group.id == "" ? ["0"] : [filtersValue.group.id]}:${
      filtersValue.group.name
    }`
  );

  const [groupIds, setGroupIds] = React.useState(["0"]);
  const [skip, setSkip] = React.useState(true);
  const [selectedId, setSelectedId] = React.useState(
    filtersValue.group.id == "" ? ["0"] : [filtersValue.group.id]
  );
  const [group, setGroup] = React.useState("0");
  const [firstLoad, setFirstLoad] = React.useState(true);
  const [rgb, setRgb] = React.useState(
    hexRgb(metaDataValue.branding.secondaryColor)
  );
  const [treeSearchItems, setTreeSearchItems] = React.useState({});
  const page = useSelector((state) => state.assetView.listPage);
  const treeSearchState = React.useRef({});

  const groupForm = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required field"),
    }),
    onSubmit: (values) => {
      let body;
      switch (popupType) {
        case "Add":
          body = {
            name: values.name,
            serviceId: props.id,
          };
          if (selectedId && selectedId != "0") body.parentId = selectedId;
          addGroup({ token, body });
          break;

        case "Edit":
          body = {
            name: values.name,
          };
          editGroup({ token, id: selectedId, body });
          break;

        default:
          break;
      }
    },
  });

  const groups = useGetGroupsQuery(
    {
      token,
      refetch: true,
      // params: `?serviceId=${props.id}`,
      //Displaying  the whole tree. set completTree to false for the oppoosite effect
//      params: props.serviceDashboard && service.group?.id ? `?${`groupId=${service.group?.id}`}` : `?completeTree=true&serviceId=${props.id}`,

      params: `?completeTree=true&serviceId=${props.id}${props.serviceDashboard && service.group?.id ? `&groupId=${service.group?.id}` : ``}`,
    }

    // { skip: !filtersValue.first }
  );

  // const singleGroup = useGetOneGroupQuery(
  //   {
  //     token,
  //     params: `?groupId=${group}`
  //   },
  //   { skip: skip }
  // );

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  function searchFunc(searchText, id, name = null) {
    if (
      searchText.length !== 0 &&
      treeSearchState.current.hasOwnProperty(id) &&
      treeSearchState.current[id].indexOf(searchText) !== -1
      // treeSearchState.current[id].substring(0, searchText.length) === searchText
    ) {
      return true;
    } else {
      return false;
    }
  }

  /*---------------------START: Populate Complete Tree---------------------*/
  function populateTree(
    treeObj,
    tempIds,
    tempNameIdMap,
    tempParentNodeIdsChain = [],
    parentName = null
  ) {
    tempNameIdMap[treeObj._id] = treeObj.name;
    tempIds.push(treeObj._id);

    // let tempParentNodeIdsChain = treeObj.parentNodeIdsChain ?? [];

    if (treeObj.parentChain.length > 0) {
      tempParentNodeIdsChain.push(
        treeObj.parentChain[treeObj.parentChain.length - 1] + ":" + parentName
      );
    }

    let tempTree = {
      name: treeObj.name,
      id: treeObj._id,
      parentChain: treeObj.parentChain,
      parentNodeIdsChain:
        treeObj.parentChain.length > 0 ? tempParentNodeIdsChain : [],
      childGroups: {},
    };
    if (treeObj.devices?.length > 0) {
      treeObj.devices.map((x) => {
        tempTree.childGroups[x._id] = {
          type: "device",
          id: x._id,
          name: x.name,
          internalId: x.internalId,
          childGroups: {},
          parentNodeIdsChain: [
            ...tempParentNodeIdsChain,
            treeObj._id + ":" + treeObj.name,
          ],
        };
      });
    }

    if (treeObj.childGroups && treeObj.childGroups.length > 0) {
      let tempChild = {};

      treeObj.childGroups.map((child, i) => {
        let tempChildParentNodeIdsChain = [...tempParentNodeIdsChain];

        if (child.parentChain.length > 0) {
          tempChildParentNodeIdsChain.push(
            child.parentChain[child.parentChain.length - 1] + ":" + treeObj.name
          );
        }

        tempChild[child._id] = {
          name: child.name,
          id: child._id,
          parentChain: child.parentChain,
          parentNodeIdsChain:
            child.parentChain.length > 0 ? tempChildParentNodeIdsChain : [],
          childGroups: {},
        };

        if (child.childGroups?.length > 0) {
          child.childGroups.map((elm) => {
            tempChild[child._id].childGroups[elm._id] = populateTree(
              elm,
              tempIds,
              tempNameIdMap,
              [...tempChildParentNodeIdsChain],
              child.name
            );
          });
        }
        if (child.devices?.length > 0) {
          child.devices.map((x) => {
            tempChild[child._id].childGroups[x._id] = {
              type: "device",
              id: x._id,
              name: x.name,
              internalId: x.internalId,
              childGroups: {},
              parentNodeIdsChain: [
                ...tempChildParentNodeIdsChain,
                child._id + ":" + child.name,
              ],
            };
          });
        }
      });

      tempTree.childGroups = { ...tempTree.childGroups, ...tempChild };
      return tempTree;
    } else {
      return tempTree;
    }
  }

  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
    } else {
      if (groups.isSuccess) {
        let tempTreeObj = {};
        let tempIds = ["0"];
        let tempNameIdMap = {};

        if (groups.data.payload.length > 0)
          groups.data.payload.forEach((elm) => {
            const populateResult = populateTree(elm, tempIds, tempNameIdMap);
            tempTreeObj[elm._id] = populateResult;
          });
        setGroupIds(tempIds);
        setTreeObj(tempTreeObj);
        dispatch(setFilter({ globalTree: tempTreeObj }));
        setNameIdMap(tempNameIdMap);
        dispatch(setFilter({ first: false }));
      }
      if (groups.isError) {
        showSnackbar("Groups", groups.error.data?.message, "error", 1000);
      }
    }

    return () => {
      setFirstLoad(true);
    };
  }, [groups.isFetching]);
  /*---------------------END: Populate Complete Tree---------------------*/

  /*---------------------START: Original Fetching For Tree---------------------*/

  /*---------------------END: Original Fetching For Tree---------------------*/

  function treeStruct(parent, parentTreeSearchItems) {
    try {
      const copy_ref = parentTreeSearchItems.current;

      return (
        <Fragment>
          {Object.keys(parent).map((elm) => {
            copy_ref[parent[elm].id + ":" + parent[elm].name] = parent[
              elm
            ].name.toUpperCase();
            const isFilterPresent = searchFunc(
              filtersValue.searchString.toUpperCase(),
              parent[elm].id + ":" + parent[elm].name,
              parent[elm].name.toUpperCase()
            );

            return (
              <StyledTreeItem
                key={`${parent[elm].id}:${parent[elm].name}`}
                nodeId={`${parent[elm].id}:${parent[elm].name}`}
                labelText={parent[elm].name}
                labelIcon={
                  parent[elm].type && parent[elm].type === "device"
                    ? microgridComponent
                    : FolderIcon
                }
                labelInfo={parent[elm].noOfDevices}
                color={metaDataValue.branding.secondaryColor}
                bgColor={`rgb(${rgb.red}, ${rgb.green}, ${rgb.blue},0.1)`}
                isFilterPresent={isFilterPresent}
              >
                {parent[elm].childGroups &&
                Object.keys(parent[elm].childGroups).length > 0
                  ? treeStruct(parent[elm].childGroups, parentTreeSearchItems)
                  : null}
              </StyledTreeItem>
            );
          })}
        </Fragment>
      );
    } catch (error) {}
  }

  function searchNodeParentChain(treeObj, id) {
    for (const elm of Object.keys(treeObj)) {
      if (treeObj[elm].id === id) {
        if (treeObj[elm].type === "device") {
          return {
            resultType: "DEVICE",
            result: treeObj[elm],
            parentChain: treeObj[elm].parentNodeIdsChain,
          };
        }
        treeObj[elm].parentNodeIdsChain;
        return treeObj[elm].parentNodeIdsChain;
      }
      if (Object.keys(treeObj[elm].childGroups)?.length > 0) {
        const result = searchNodeParentChain(treeObj[elm].childGroups, id);
        if (result) {
          return result;
        } else {
          continue;
        }
      } else {
        continue;
      }
    }

    return null;
  }

  useEffect(() => {
    function searchFiltersParentNodeIds(treeObj, id) {
      for (const elm of Object.keys(treeObj)) {
        if (treeObj[elm].id === id) {
          return treeObj[elm].parentNodeIdsChain;
        }

        if (Object.keys(treeObj[elm].childGroups)?.length > 0) {
          // return searchNodeParentChain(treeObj[elm].childGroups, id)
          const result = searchNodeParentChain(treeObj[elm].childGroups, id);
          if (result) {
            return result;
          } else {
            continue;
          }
        } else {
          continue;
        }
      }

      return null;
    }

    function searchValidity(searchText, id, name = null) {
      if (
        searchText.length !== 0 &&
        treeSearchState.current.hasOwnProperty(id) &&
        treeSearchState.current[id].indexOf(searchText) !== -1
        // treeSearchState.current[id].substring(0, searchText.length) === searchText
      ) {
        return true;
      } else {
        return false;
      }
    }

    function searchNew(treeObj, searchText, temp, parentNodeIdsTemp) {
      for (const elm of Object.keys(treeObj)) {
        if (
          searchValidity(
            searchText.toUpperCase(),
            treeObj[elm].id + ":" + treeObj[elm].name
          )
        ) {
          temp.push(treeObj[elm].id + ":" + treeObj[elm].name);

          treeObj[elm].parentNodeIdsChain?.map((nodeId) => {
            if (parentNodeIdsTemp.indexOf(nodeId) == -1) {
              parentNodeIdsTemp.push(nodeId);
            }
          });
        }

        if (Object.keys(treeObj[elm].childGroups)?.length > 0) {
          searchNew(
            treeObj[elm].childGroups,
            searchText,
            temp,
            parentNodeIdsTemp
          );
        } else {
          continue;
        }
      }
    }

    let temp = [];
    let parentNodeIdsTemp = ["0:All assets"];
    searchNew(treeObj, filtersValue.searchString, temp, parentNodeIdsTemp);

    dispatch(setFilter({ matchedNodes: temp }));

    setExpanded(parentNodeIdsTemp);
    dispatch(setFilter({ expanded: parentNodeIdsTemp }));
  }, [filtersValue.searchString]);

  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
    dispatch(setFilter({ expanded: nodeIds }));
    dispatch(setGroupFilter({ expanded: nodeIds }));
  };

  const handleSelect = (event, nodeIds) => {
    if (selected != nodeIds && expand) {
      setSelected(nodeIds);
      let tempArr = nodeIds.split(":");
      const nodeParentChain = searchNodeParentChain(
        filtersValue.globalTree,
        tempArr[0]
      );
      if (nodeParentChain && nodeParentChain.resultType === "DEVICE") {
        props.history.push(
          `/solutions/${props.link}/${nodeParentChain.result.internalId}/0`
        );
        // nodeIds !== "0:All assets" ?
        //   dispatch(setGroupFilter({ selectedNodeChain: [...(nodeParentChain.parentChain), nodeIds] })) : dispatch(setGroupFilter({ selectedNodeChain: [nodeIds] }))
        // setSelectedId(tempArr[0]);
      } else if (nodeParentChain?.length >= 0) {
        dispatch(
          setFilter({
            group: { id: nodeIds.split(":")[0], name: nodeIds.split(":")[1] },
          })
        );
        nodeIds !== "0:All assets"
          ? dispatch(
              setFilter({ selectedNodeChain: [...nodeParentChain, nodeIds] })
            )
          : dispatch(setFilter({ selectedNodeChain: [nodeIds] }));
        setSelectedId(tempArr[0]);
        /* TEMPORARY CHANGE */
        // props.setGroup({
        //   id: tempArr[0] == "0" ? "" : tempArr[0],
        //   name: tempArr[1],
        // });
        if (groupIds.indexOf(tempArr[0]) == -1) {
          /* TEMPORARY CHANGE */
          // setGroup(tempArr[0]);
          setSkip(false);
        }
      } else {
        nodeIds !== "0:All assets"
          ? dispatch(
              setFilter({ selectedNodeChain: [...nodeParentChain, nodeIds] })
            )
          : dispatch(
              setFilter({
                selectedNodeChain: [nodeIds],
                expanded: [],
                first: true,
                group: { name: "All assets", id: "" },
              })
            );
        setSelectedId(tempArr[0]);
      }
    }
  };

  useEffect(() => {
    document.getElementsByTagName("body")[0].addEventListener("click", (e) => {
      if (
        (e.path && e.path[0].dataset?.testid?.includes("ArrowRightIcon")) ||
        (e.path && e.path[1].dataset?.testid?.includes("ArrowRightIcon")) ||
        (e.path && e.path[1].dataset?.testid?.includes("ArrowDropDownIcon")) ||
        (e.path && e.path[0].dataset?.testid?.includes("ArrowDropDownIcon")) ||
        (e["srcElement"] &&
          e["srcElement"]?.dataset?.testid == "ArrowDropDownIcon") ||
        (e["srcElement"] &&
          e["srcElement"]?.dataset?.testid == "ArrowRightIcon") ||
        (e["srcElement"] &&
          e["srcElement"]?.viewportElement?.dataset?.testid ==
            "ArrowRightIcon") ||
        (e["srcElement"] &&
          e["srcElement"]?.viewportElement?.dataset?.testid ==
            "ArrowDropDownIcon")
      ) {
        expand = false;
      } else {
        expand = true;
      }
    });
    if (filtersValue.selectedNode) {
      const selectedNode = filtersValue.selectedNode;
      setSelected(selectedNode);
      let tempArr = selectedNode.split(":");

      const nodeParentChain = searchNodeParentChain(
        filtersValue.globalTree,
        tempArr[0]
      );

      if (nodeParentChain && nodeParentChain.resultType === "DEVICE") {
        props.history.push(
          `/solutions/${props.link}/${nodeParentChain.result.internalId}/0`
        );

        selectedNode !== "0:All assets"
          ? dispatch(
              setFilter({
                selectedNodeChain: [
                  ...nodeParentChain.parentChain,
                  selectedNode,
                ],
              })
            )
          : dispatch(setFilter({ selectedNodeChain: [selectedNode] }));
        setSelectedId(tempArr[0]);
      } else if (nodeParentChain?.length >= 0) {
        selectedNode !== "0:All assets"
          ? dispatch(
              setFilter({
                selectedNodeChain: [...nodeParentChain, selectedNode],
              })
            )
          : dispatch(setFilter({ selectedNodeChain: [selectedNode] }));
        setSelectedId(tempArr[0]);
        /* TEMPORARY CHANGE */
        // props.setGroup({
        //   id: tempArr[0] == "0" ? "" : tempArr[0],
        //   name: tempArr[1],
        // });
        if (groupIds.indexOf(tempArr[0]) == -1) {
          /* TEMPORARY CHANGE */
          // setGroup(tempArr[0]);
          setSkip(false);
        }
      }
    }
  }, [filtersValue.selectedNode]);

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
    <div style={{ width: "100%" }}>
      {(chkGroup() == "ALL" || chkGroup() == "READ") &&
      (metaDataValue.groupPermissions[props.id] == "ALL" ||
        metaDataValue.groupPermissions[props.id] == "READ") ? (
        <span
          style={{
            width: "100%",
            justifyContent: "flex-end",
            display: "none",
            position: "relative",
            bottom: "10px",
            left: "20px",
            cursor: "pointer",
          }}
          onClick={() => {
            dispatch(setSelectedGroup(props.id));
            props.history.push("/administration/groupManagement");
          }}
        >
          <Tooltip
            title="Groups Administration"
            placement="left"
            arrow
            TransitionComponent={Zoom}
          >
            <SettingsApplicationsIcon color="primary" />
          </Tooltip>
        </span>
      ) : null}

      <TreeView
        aria-label="gmail"
        defaultCollapseIcon={<ArrowDropDownIcon />}
        defaultExpandIcon={<ArrowRightIcon />}
        defaultEndIcon={<div style={{ width: 24 }} />}
        expanded={groupFiltersValue?.expanded}
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
        treeStruct(treeObj, treeSearchState) : 
        <StyledTreeItem
          nodeId="0:All assets"
          labelText="All Assets"
          labelIcon={AccountTreeIcon}
          color={metaDataValue.branding.secondaryColor}
          bgColor={`rgb(${rgb.red}, ${rgb.green}, ${rgb.blue},0.1)`}
        >
          {treeStruct(treeObj, treeSearchState)}
        </StyledTreeItem>}
      </TreeView>
    </div>
  );
}
