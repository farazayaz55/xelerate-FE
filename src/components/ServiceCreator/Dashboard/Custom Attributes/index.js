//----------------CORE-----------------//
import React, { useState } from "react";
import { setService } from "rtkSlices/ServiceCreatorSlice";
import { useSelector, useDispatch } from "react-redux";
import { useSnackbar } from "notistack";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
//----------------MUI-----------------//
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
//----------------EXTERNAL-----------------//
import {
  useCreateMetaMutation,
  useEditServiceMutation,
} from "services/services";
import Attributes from "components/Custom Attributes";

export default function Catalogue(props) {
  let token = window.localStorage.getItem("token");
  const dispatch = useDispatch();
  const serviceValue = useSelector((state) => state.serviceCreator);
  const [newMeta, setNewMeta] = useState({});
  const [addMeta, addMetaResult] = useCreateMetaMutation();
  const [editService, editServiceResult] = useEditServiceMutation();
  const [openPopup, setOpenPopup] = React.useState(false);

  function handlepopupClose() {
    setOpenPopup(false);
  }

  function handlepopupOpen() {
    setOpenPopup(true);
  }

  const { enqueueSnackbar } = useSnackbar();

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar(
      { title, message: message ? message : "Something went wrong", variant },
      { timeOut }
    );
  }

  async function handleEnter(e) {
    let body = {
      key: newMeta.key,
      value: newMeta.value || " ",
    };
    const added = await addMeta({
      token,
      body,
    });
    if (added?.data?.success) {
      setNewMeta({});
      addMetaToService([...serviceValue.persist.meta, added.data.payload]);
      showSnackbar("Custom Attribute", added.data?.message, "success", 1000);
      handlepopupClose();
      if (props.edit) {
        // let fd = new FormData();
        // fd.append(
        //   "metaTags",
        //   JSON.stringify({ addFlag: "true", metaId: added?.data?.payload._id })
        // );
        let body = {
          metaTags: { addFlag: "true", metaId: added?.data?.payload._id },
        };
        let updateService = await editService({
          token,
          body,
          id: props.id,
        });
      }
    } else {
      showSnackbar("Custom Attribute", added.data?.message, "error", 1000);
    }
    // setFetchTags(true);
    // }
  }

  function handleNewMeta(e, key) {
    let value = e.target.value;
    setNewMeta({ ...newMeta, [key]: value });
  }

  function addMetaToService(newValue) {
    let temp = [];
    newValue.forEach((elm) => {
      temp.push(elm._id);
    });
    dispatch(
      setService({
        persist: {
          ...serviceValue.persist,
          meta: newValue,
        },
      })
    );
    dispatch(
      setService({
        meta: temp,
      })
    );
  }

  const updateDefaultValue = (updatedMeta) => {
    let meta = JSON.parse(JSON.stringify(serviceValue.persist.meta));
    let ind = meta.findIndex((m) => m._id == updatedMeta._id);
    meta[ind] = updatedMeta;
    dispatch(
      setService({
        persist: {
          ...serviceValue.persist,
          meta,
        },
      })
    );
  };

  const removeMeta = async (id) => {
    // let fd = new FormData();
    // fd.append("metaTags", JSON.stringify([{ addFlag: "false", metaId: id }]));
    let body = {
      metaTags: { addFlag: "false", metaId: id },
    };
    let updateService = await editService({
      token,
      body,
      id: props.id,
    });
    if (updateService.data?.success) {
      let meta = JSON.parse(JSON.stringify(serviceValue.persist.meta));
      let ind = meta.findIndex((m) => m._id == id);
      meta.splice(ind, 1);
      dispatch(
        setService({
          persist: {
            ...serviceValue.persist,
            meta,
          },
        })
      );
      showSnackbar(
        "Solution Update",
        updateService.data?.message,
        "success",
        1000
      );
    }
  };

  const onDragEndCustomFragments = (result) => {
    function swapElements(arr, i1, i2) {
      arr[i1] = arr.splice(i2, 1, arr[i1])[0];
    }

    if (!result.destination) return;
    const { source, destination } = result;
    const copiedItems = [...serviceValue.persist.meta];
    swapElements(copiedItems, source.index, destination.index);
    addMetaToService(copiedItems);
  };

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "42px",
          borderRadius: "10px",
          border: "1px solid grey",
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          marginTop: "20px",
        }}
        onClick={handlepopupOpen}
      >
        Add
      </div>
      <DragDropContext onDragEnd={(result) => onDragEndCustomFragments(result)}>
        <Droppable droppableId={"custom-fragmanets"} key={"custom-fragmanets"}>
          {(provided, snapshot) => {
            return (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{ maxHeight: "400px", overflow: "auto" }}
              >
                {serviceValue.persist.meta.length
                  ? serviceValue.persist.meta.map((meta, index) => {
                      return (
                        <Draggable
                          key={meta._id}
                          draggableId={meta._id}
                          index={index}
                        >
                          {(provided, snapshot) => {
                            return (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  width: "100%",
                                  userSelect: "none",
                                  cursor: "grab",
                                  ...provided.draggableProps.style,
                                }}
                              >
                                <Attributes
                                  meta={meta}
                                  updateDefaultValue={updateDefaultValue}
                                  id={meta._id}
                                  removeMeta={removeMeta}
                                  edit={true}
                                />
                              </div>
                            );
                          }}
                        </Draggable>
                      );
                    })
                  : null}
              </div>
            );
          }}
        </Droppable>
      </DragDropContext>

      <Dialog
        open={openPopup}
        onClose={handlepopupClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle>Add Custom Attribute</DialogTitle>
        <DialogContent>
          <TextField
            onChange={(e) => handleNewMeta(e, "key")}
            fullWidth
            margin="dense"
            focused={false}
            autoFocus={false}
            value={newMeta.key ? newMeta.key : ""}
            id="new-meta-key"
            label="Attribute Name"
            variant="outlined"
          />
          <TextField
            onChange={(e) => handleNewMeta(e, "value")}
            fullWidth
            margin="dense"
            focused={false}
            autoFocus={false}
            value={newMeta.value ? newMeta.value : ""}
            id="new-meta-value"
            label="Default Value"
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handlepopupClose} color="error">
            Cancel
          </Button>
          {!addMetaResult.isLoading ? (
            <Button
              onClick={handleEnter}
              color="secondary"
              disabled={!newMeta.key}
            >
              Add
            </Button>
          ) : (
            <CircularProgress
              color="primary"
              style={{
                height: "15px",
                width: "15px",
              }}
            />
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
