import React, { useEffect, useState, Fragment } from "react";
import { useSnackbar } from "notistack";
import Catalogue from "components/Service Management/Catalogue";
import Edit from "components/Service Management/Edit";
import { resetService } from "rtkSlices/ServiceCreatorSlice";
import DeleteAlert from "components/Alerts/Delete";
import { useSelector, useDispatch } from "react-redux";

export default function SM(props) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const metaDataValue = useSelector((state) => state.metaData);
  const [activeId, setActiveId] = useState(null);
  const [deleteModal, setDelete] = useState(false);
  const [selected, setSelected] = React.useState(null);

  useEffect(() => {
    dispatch(resetService());
  }, []);

  async function onDelete(e) {
    await props.DeleteService(e);
    let type = "error";
    if (props.res.deleteService.success) {
      type = "success";
    }
    enqueueSnackbar(props.res.deleteService.message, {
      variant: type,
      timeOut: 1000,
    });
  }

  async function toggleDelete(id = null) {
    setActiveId(id);
    setDelete((state) => !state);
  }

  return (
    <div>
      <Fragment>
        {selected ? (
          <Edit setSelected={setSelected} selected={selected} />
        ) : (
          <Catalogue
            services={metaDataValue.servicesNew}
            toggleDelete={toggleDelete}
            setSelected={setSelected}
          />
        )}
      </Fragment>
      {activeId ? (
        <DeleteAlert
          deleteModal={deleteModal}
          question="Are you sure you want to delete this solution?"
          platformCheck={false}
          id={activeId}
          handleDelete={onDelete}
          handleClose={toggleDelete}
        />
      ) : null}
    </div>
  );
}
