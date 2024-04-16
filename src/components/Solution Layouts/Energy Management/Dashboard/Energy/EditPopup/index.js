//-----------------CORE---------------//
import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { Button, CircularProgress, Divider } from "@mui/material";
import { useEditServiceMutation } from "services/services";
import { useSnackbar } from "notistack";
import { setServices } from "rtkSlices/metaDataSlice";
import { useSelector, useDispatch } from "react-redux";
import EnergyOn from "assets/icons/energy-on.png";
import DollarOn from "assets/icons/dollarOn.png";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  maxWidth: "800px",
  minWidth: "350px",
  boxShadow: 24,
  padding: "20px",
  borderRadius: "15px 20px",
};

export default function Edit({
  open,
  setOpen,
  cost,
  setCost,
  target,
  setTarget,
  serviceId,
  unit
}) {
    const [editService, editServiceResult] = useEditServiceMutation();
    let token = window.localStorage.getItem("token");
    const dispatch = useDispatch();
    const [tempTarget, setTempTarget] = useState(target)
    let services = useSelector((state) => state.metaData?.services);
    const { enqueueSnackbar } = useSnackbar();
    const update = async () => {
        // let fd = new FormData();
        // fd.append("target", JSON.stringify(target));
        // console.log(typeof cost)
        // fd.append("cost", parseFloat(cost));
        let body = {
            target: tempTarget,
            cost
        }
        let updateService = await editService({
          token,
          body,
          id: serviceId,
        });
        let temp = JSON.parse(JSON.stringify(services))
        temp.find(s=>s.id == serviceId).cost = cost;
        temp.find(s=>s.id == serviceId).unit = unit;
        temp.find(s=>s.id == serviceId).target = tempTarget;
        if(updateService.data.success){
            setTarget(tempTarget)
            dispatch(setServices(temp));
            showSnackbar("Service update", updateService.data?.message, "success", 1000);
            setOpen(false)
        }
        else{
            showSnackbar("Service update", "Failed", "error", 1000);
        }
    }

    function showSnackbar(title, message, variant, timeOut) {
        return enqueueSnackbar(
          { title, message: message ? message : "Something went wrong", variant },
          { timeOut }
        );
      }

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <p style={{ color: "grey", fontSize: "18px", marginBottom: "15px" }}>
          Target kWh <span><img src={EnergyOn} style={{width:'20px',height:'20px', marginTop:'3px'}} /></span>
        </p>
        <TextField
          placeholder="Enter 24 hours target"
          margin="dense"
          value={tempTarget['1']}
          type="number"
          style={{ margin: "12px 9px 0px 0px", width: "100%" }}
          label="Enter 24 hours target"
          onChange={(e) => setTempTarget({ ...tempTarget, 1: e.target.value })}
        />
        <Divider style={{ margin: "15px 0px 10px 0px" }} />
        <p style={{ color: "grey", fontSize: "18px", marginBottom: "15px" }}>
          Tarriff <span><img src={DollarOn} style={{width:'20px',height:'20px', marginTop:'5px'}} /></span>
        </p>
        <TextField
          placeholder="Enter cost factor"
          margin="dense"
          value={cost}
          type="number"
          label="Enter cost factor"
          onChange={(e) => setCost(e.target.value)}
          style={{ width: "100%", margin: "12px 0px 0px 0px" }}
        />
        <div style={{display:'flex',justifyContent:'flex-end', marginTop: "16px"}}>
          <Button color="error" onClick={()=>setOpen(false)}>
            Cancel
          </Button>
          <Button color="primary" onClick={update} disabled={editServiceResult.isLoading}>
            {editServiceResult.isLoading ? <CircularProgress color="secondary" size={20} /> : 'Update'}
          </Button>
        </div>
      </Box>
    </Modal>
  );
}
