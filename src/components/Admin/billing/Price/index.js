//-------------CORE-------------//
import React, { Fragment, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSnackbar } from "notistack";
//-------------MUI-------------//
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Zoom from "@mui/material/Zoom";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
//-------------MUI Icon-------------//
import SettingsIcon from "@mui/icons-material/Settings";
//----------EXTERNAL COMPS--------//
import { useGetPriceQuery, useUpdatePriceMutation } from "services/devices";
import Loader from "components/Progress";

export default function Price() {
  let token = window.localStorage.getItem("token");
  const [openPopup, setOpenPopup] = useState(false);
  const [priceValues, setPriceValues] = useState({
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    F: 0,
  });

  const { enqueueSnackbar } = useSnackbar();

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar(
      { title, message: message ? message : "Something went wrong", variant },
      { timeOut }
    );
  }

  const price = useGetPriceQuery(
    {
      token,
    },
    { skip: !openPopup }
  );

  const [updatePrice, result] = useUpdatePriceMutation();

  function handlePrice() {
    let body = { classes: priceValues };
    let id = null;
    if (price?.data?.payload?.length > 0) id = price?.data?.payload[0]?._id;
    updatePrice({
      token,
      body,
      id,
    });
  }

  useEffect(() => {
    if (result.isSuccess) {
      showSnackbar("Billing", result?.data?.message, "success", 1000);
      setOpenPopup(false);
    }
    if (result.isError) {
      showSnackbar("Billing", result?.error?.data?.message, "error", 1000);
      setOpenPopup(false);
    }
  }, [result]);

  useEffect(() => {
    if (price.isSuccess) {
      setPriceValues(price.data.payload[0].classes);
    }
    if (price.isError) {
      showSnackbar("Billing", price?.error?.data?.message, "error", 1000);
    }
  }, [price.isFetching]);

  return (
    <Fragment>
      <Tooltip
        title="Set Price"
        placement="bottom"
        arrow
        TransitionComponent={Zoom}
      >
        <IconButton onClick={() => setOpenPopup(true)}>
          <SettingsIcon style={{ color: "grey" }} />
        </IconButton>
      </Tooltip>
      <Dialog
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        PaperProps={{ style: { width: "500px" } }}
      >
        <DialogTitle>Pricing</DialogTitle>
        <DialogContent style={{ height: "400px", overflow: "hidden" }}>
          {price.isFetching ? (
            <Loader />
          ) : (
            <>
              {Object.keys(priceValues).map((e) => (
                <TextField
                  id={e}
                  margin="dense"
                  value={priceValues[e]}
                  onChange={(event) => {
                    let value = event.target.value;
                    setPriceValues((prev) => {
                      return { ...prev, [e]: value };
                    });
                  }}
                  fullWidth
                  label={e}
                />
              ))}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenPopup(false)} color="primary">
            Cancel
          </Button>
          <Button type="submit" onClick={handlePrice} color="primary">
            {result.isLoading ? (
              <CircularProgress size={20} />
            ) : (
              <span>Submit</span>
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}
