import React, { Fragment, useEffect, useState } from "react";
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import Groups from "components/Groups";
import { useSelector } from "react-redux";
import Button from "@mui/material/Button";

export default function GroupModal({
  open,
  setGroupModal,
  serviceId,
  setGroupIds,
  groupIds,
  selectedGroup
}) {
  console.log({selectedGroup})
  let token = window.localStorage.getItem("token");
  const filtersValue = useSelector((state) => state.filterDevice);
  const [group, setGroup] = useState(filtersValue.group);
  const [selectedNode, setSelectedNode] = useState({});
  const [path, setPath] = React.useState(["0:All assets"]);

  return (
    <Dialog
      open={open}
      onClose={() => setGroupModal(false)}
      PaperProps={{ style: { width: "500px" } }}
    >
      <DialogTitle>Select Group Level</DialogTitle>
      <DialogContent style={{ height: "400px", overflow: "hidden" }}>
        <Groups
          id={serviceId}
          group={group}
          setGroup={setGroup}
          history={""}
          refetch={false}
          height={"calc(100vh - 175px)"}
          path={path}
          setPath={setPath}
          setSelectedGroupNode={(e) => {
            setSelectedNode(e && e != "0" ? {id: e.split(":")[0], name: e.split(':')[1]} : "");
          }}
          selectedGroup={selectedGroup}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setGroupModal(false)}
          variant="contained"
          color="error"
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            const tempGroupIds = JSON.parse(JSON.stringify(groupIds))
            const singleGroup = groupIds.find(g=>g.serviceId == serviceId);
            if(singleGroup){
              tempGroupIds[groupIds.findIndex(g=>g.serviceId == serviceId)] = {serviceId, name: selectedNode.name, id: selectedNode.id}
            }
            else{
              tempGroupIds.push({serviceId, name: selectedNode.name, id: selectedNode.id})
            }
            setGroupIds(tempGroupIds);
            setGroupModal(false);
          }}
          variant="contained"
          color="secondary"
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
