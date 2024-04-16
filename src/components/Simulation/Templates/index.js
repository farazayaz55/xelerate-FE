import React, { Fragment, useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import { connect } from "react-redux";
// import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import { Button, IconButton } from "@mui/material";
import Table from "../../Table/newTable";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Loader from "../../Progress";
import {
  GetSimulations,
  DeleteSimulations,
} from "../../../actions/simulationsActions";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Slide from "@mui/material/Slide";
import CloseIcon from "@mui/icons-material/Close";
import Simulatior from "./simulator";
import DeleteAlert from "components/Alerts/Delete";

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: "relative",
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  fab: {
    position: "fixed",
    bottom: theme.spacing(4),
    right: theme.spacing(4),
    zIndex: 20,
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function DM(props) {
  const [loader, setLoader] = useState(true);
  const [open, setOpen] = React.useState(false);
  const [rows, setRowState] = useState([]);
  const [snack, setSnack] = useState(false);
  const [selected, setSelected] = useState({});
  const [snackText, setSnackText] = useState("");
  const [snackType, setSnackType] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [deleteModal, setDelete] = useState(false);
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnack(false);
  };

  const handlePopupOpen = () => {
    setOpen(true);
  };

  const handlePopupClose = () => {
    setOpen(false);
  };

  function ifLoaded(state, component) {
    if (state) return <Loader />;
    else return component();
  }

  async function fetchSimulations() {
    var temp = [];
    await props.GetSimulations();
    if (
      props.res.getSimulations.success[0] &&
      props.res.getSimulations.payload[0] != []
    ) {
      props.res.getSimulations.payload[0].forEach((elm) => {
        let time = new Date(elm.updatedAt);
        temp.push(
          createData(
            elm.name,
            `${time.toLocaleDateString('en-GB')}-${time.toLocaleTimeString()}`,
            elm
          )
        );
      });
      setRowState(temp);
      setLoader(false);
    } else if (
      !props.res.getSimulations.success[0] &&
      props.res.getSimulations.message[0] != ""
    ) {
      setSnackType("fail");
      setSnackText(props.res.getSimulations.message);
      setSnack(true);
    }
  }

  useEffect(() => {
    fetchSimulations();
  }, []);

  async function onDelete(e) {
    await props.DeleteSimulations(e);
    if (props.res.deleteSimulations.success) {
      setSnackType("success");
      setDelete(false);
      fetchSimulations();
    } else {
      setSnackType("fail");
    }
    setSnackText(props.res.deleteSimulations.message);
    setSnack(true);
  }

  async function toggleDelete(id = null) {
    setActiveId(id);
    setDelete((state) => !state);
  }

  // const classes = useStyles();

  function columns() {
    let temp = [
      { id: "name", label: "Name", align: "center" },
      {
        id: "updatedTime",
        label: "Creation time",
        align: "center",
      },
    ];
    if (props.permission == "ALL")
      temp.push({
        id: "html",
        label: "Actions",
        minWidth: 150,
        align: "center",
        disableSorting: true,
      });
    return temp;
  }

  function createData(name, updatedTime, html) {
    return {
      name,
      updatedTime,
      html,
    };
  }

  var html = (row) => {
    return (
      <div>
        <IconButton
          id={row.html._id}
          onClick={() => {
            setSelected(row.html);
            handlePopupOpen();
          }}
        >
          <EditIcon color="secondary" />
        </IconButton>
        <IconButton onClick={() => toggleDelete(row.html._id)}>
          <DeleteIcon color="secondary" />
        </IconButton>
      </div>
    );
  };

  function cardFunc() {
    return (
      <Fragment>
        <Dialog
          fullScreen
          open={open}
          onClose={handlePopupClose}
          TransitionComponent={Transition}
        >
          <AppBar
            color="secondary"
            // className={classes.appBar}
          >
            <Toolbar>
              <IconButton
                edge="end"
                color="inherit"
                onClick={handlePopupClose}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
              <Typography
                variant="h6"
                // className={classes.title}
              >
                {selected.name}
              </Typography>
            </Toolbar>
          </AppBar>
          <DialogContent>
            <div style={{ marginTop: "10px" }}>
              <Simulatior selected={selected} />
            </div>
          </DialogContent>
        </Dialog>

        <Card>
          {/* <CardHeader color="primary">
            <h4 className={classes.cardTitleWhite}>Simulator Templates</h4>
          </CardHeader> */}
          <div
            style={{
              margin: "15px 20px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <p style={{ color: "rgb(191, 190, 200)", fontSize: "15px" }}>
              <b>Simulator Templates</b>
            </p>
            {/* <GroupSharpIcon color="disabled" /> */}
          </div>
          <CardBody>
            <Table
              columns={columns()}
              minHeight={"1000px"}
              rows={rows}
              html={html}
              filter={[
                "name",
                "dashboard",
                "id",
                "creationTime",
                "updatedTime",
                "imei",
                "firmware",
                "serialNumgber",
              ]}
            />
          </CardBody>
        </Card>
      </Fragment>
    );
  }

  return (
    <div>
      {/* <Snackbar
        type={snackType}
        open={snack}
        setOpen={handleClose}
        text={snackText}
        timeOut={3000}
      /> */}
      {/* {props.permission == "ALL" ? (
        <AddDevices
          fetchSimulations={fetchSimulations}
          setText={setSnackText}
          setSnack={setSnack}
          setSnackType={setSnackType}
        />
      ) : null} */}
      {ifLoaded(loader, cardFunc)}
      {activeId ? (
        <DeleteAlert
          deleteModal={deleteModal}
          question="Are you sure you want to delete this Profile?"
          platformCheck={false}
          id={activeId}
          handleDelete={onDelete}
          handleClose={toggleDelete}
        />
      ) : null}
    </div>
  );
}

const mapStateToProps = (state) => {
  return { res: state.simulations };
};

const mapDispatchToProps = {
  GetSimulations,
  DeleteSimulations,
};

DM = connect(mapStateToProps, mapDispatchToProps)(DM);
