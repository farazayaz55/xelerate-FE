import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import Table from "components/ControlledAccordion/table";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import Loader from "../../Progress";
import { Fragment } from "react";
import Fab from "@mui/material/Fab";
import BuildIcon from "@mui/icons-material/Build";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import Chip from "@mui/material/Chip";
import WebIcon from "@mui/icons-material/Web";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGreaterThan,
  faLessThan,
  faGreaterThanEqual,
  faLessThanEqual,
  faEquals,
  faArrowsLeftRightToLine,
  faArrowsLeftRight,
} from "@fortawesome/free-solid-svg-icons";
import Edit from "./Popup";
import IconButton from "@mui/material/IconButton";
import DeleteAlert from "components/Alerts/Delete";
import { useGetRulesQuery, useDeleteRuleMutation } from "services/rules";
import { useSelector } from "react-redux";
import Dragable from "components/Dragable";

export default function Maintenance(props) {
  const metaDataValue = useSelector((state) => state.metaData);
  let token = window.localStorage.getItem("token");
  const { enqueueSnackbar } = useSnackbar();
  const [rows, setRowState] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [deleteModal, setDelete] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const rules = useGetRulesQuery({ token, id: props.id });
  const [deleteRule, deleteResult] = useDeleteRuleMutation();

  function ifLoaded(state, component) {
    if (state) return <Loader top="130px" />;
    else return component();
  }

  const handlepopupOpen = () => {
    setOpenPopup(true);
  };

  async function onDelete() {
    let deletedRule = await deleteRule({
      token,
      id: activeId,
    });
    if (deletedRule.error) {
      showSnackbar("Rule", deletedRule.error?.data?.message, "error", 1000);
    } else {
      showSnackbar("Rule", deletedRule.data?.message, "success", 1000);
      toggleDelete();
    }
  }

  async function toggleDelete(id = null) {
    setActiveId(id);
    setDelete((state) => !state);
  }
  function columns() {
    let temp = [
      { id: "name", label: "Name", align: "center" },
      { id: "parameter", label: "Sensor Data", align: "center" },
      {
        id: "html2",
        label: "Operator",
        align: "center",
      },
      {
        id: "condition",
        label: "Value",
        align: "center",
      },
      {
        id: "html3",
        label: "Severity",
        align: "center",
      },
      {
        id: "lastUpdated",
        label: "Last Updated",
        align: "center",
      },
    ];
    if (props.permission == "ALL")
      temp.push({
        id: "html",
        label: "",
        minWidth: 150,
        align: "center",
        disableSorting: true,
      });
    return temp;
  }

  function createData(
    name,
    parameter,
    html2,
    condition,
    html,
    lastUpdated,
    html3,
    range,
    rules,
    relation,
    
  ) {
    return {
      name,
      parameter,
      html2,
      condition,
      html,
      lastUpdated,
      html3,
      range,
      rules,
      relation
    };
  }

  const getAdditionalFields = (row) => {
    return {
      ...row,
      actions: rules.data?.payload?.find((p) => p._id == row.html.id)?.actions,
      rollingFlag: rules.data?.payload?.find((p) => p._id == row.html.id)
        ?.rollingFlag,
      type: rules.data?.payload?.find((p) => p._id == row.html.id)?.type,
      rollingAvg: rules.data?.payload?.find((p) => p._id == row.html.id)
        ?.rollingAvg,
      rollingTimeDuration: rules.data?.payload?.find(
        (p) => p._id == row.html.id
      )?.rollingTimeDuration,
    };
  };

  var html = (row) => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {row.html.global ? (
          <Chip
            icon={row.html?.groupName ? <AccountTreeIcon /> : <WebIcon />}
            label={row.html?.groupName ? row.html.groupName : "Solution Wide"}
            variant="outlined"
            size="small"
            color="secondary"
          />
        ) : (
          <Fragment>
            <Edit
              fields={props.fields}
              row={{
                ...row,
                actions: rules.data?.payload?.find((p) => p._id == row.html.id)
                  ?.actions,
                muteNotification: rules.data?.payload?.find(
                  (p) => p._id == row.html.id
                )?.muteNotification,
                repeatNotification: row.html.repeatNotification,
              }}
              serviceId={props.serviceId}
              id={props.id}
              main
              permission={props.permission}
            />
            <IconButton onClick={() => toggleDelete(row.html.id)}>
              <DeleteIcon color="secondary" />
            </IconButton>
          </Fragment>
        )}
      </div>
    );
  };

  var html2 = (row) => {
    let val;
    switch (row.html2) {
      case "gt":
        val = faGreaterThan;
        break;
      case "lt":
        val = faLessThan;
        break;
      case "lte":
        val = faLessThanEqual;
        break;
      case "gte":
        val = faGreaterThanEqual;
        break;
      case "eq":
        val = faEquals;
        break;
      case "ib":
        val = faArrowsLeftRightToLine;
        break;
      case "nib":
        val = faArrowsLeftRight;
        break;
      default:
        break;
    }
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <FontAwesomeIcon
          icon={val}
          style={{
            color: metaDataValue.branding.secondaryColor,
            width: "30px",
            height: "30px",
          }}
        />
      </div>
    );
  };

  var html3 = (row) => {
    let val;
    switch (row.html3) {
      case "CRITICAL":
        val = "#e8413e";
        break;
      case "MAJOR":
        val = "#844204";
        break;
      case "MINOR":
        val = "#fb9107";
        break;
      case "WARNING":
        val = "#288deb";
        break;
      default:
        break;
    }
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Chip
          style={{
            color: "white",
            backgroundColor: val,
          }}
          icon={
            <NotificationsActiveIcon
              fontSize="small"
              style={{
                color: "white",
              }}
            />
          }
          label={row.html3}
        />
      </div>
    );
  };

  function getFriendlyName(name) {
    let res = props.actuators.find((m) => m.name == name);
    if (res) return res.friendlyName;
    else return name;
  }

  async function fetchRules() {
    var temp = [];
    if (!rules.isFetching && rules.isSuccess) {
      let tempRules = rules.data.payload;
      tempRules.forEach((elm) => {
        let time = new Date(elm.createdAt);
        let time2 = new Date(elm.updatedAt);
        // temp.push(
        //   createData(
        //     elm.name,
        //     getFriendlyName(elm.parameter),
        //     elm.operation,
        //     elm?.range
        //       ? `${elm?.range.min} to ${elm?.range.max}`
        //       : elm?.rollingAvg || elm?.rollingAvg == 0
        //       ? elm.rollingAvg
        //       : elm?.condition || elm?.condition == 0
        //       ? elm?.condition
        //       : "",
        //     {
        //       emailBool: elm.sendEmail,
        //       numberBool: elm.sendMessage,
        //       emails: elm.email,
        //       numbers: elm.phoneNumber,
        //       global: elm.global,
        //       id: elm._id,
        //       rules: elm.multipleOperations,
        //       relation: elm.multipleOperationsOperator,
        //       repeatNotification: elm.repeatNotification,
        //       groupName: elm?.groupName,
        //     },
        //     `${time2.toLocaleDateString(
        //       "en-GB"
        //     )}-${time2.toLocaleTimeString()}`,
        //     elm.severity,
        //     elm?.range,
        //     elm?.multipleOperations,
        //     elm?.multipleOperationsOperator

        //   )
        // );
        temp.push(elm)
      });
      setRowState(temp);
    }
    if (!rules.isFetching && rules.isError) {
      showSnackbar("Rules", rules.error?.data?.message, "error");
    }
  }

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  useEffect(() => {
    fetchRules();
  }, [rules.isFetching]);

  function getIndex(arr, id) {
    let res = -1;
    arr.forEach((elm) => {
      if (elm.id == id) res = i;
    });
    return res;
  }

  function compFunc() {
    return (
      <Table
        minHeight={"calc(100vh - 390px)"}
        rows={rows}
        filter={["name"]}
        toggleDelete={toggleDelete}
        fields={props.fields}
        serviceId={props.serviceId}
        id={props.id}
        permission={props.permission}
        rules={rules}
      />
    );
  }

  return (
    <Fragment>
      {props.permission == "ALL" ? (
        <Dragable bottom={"30px"} right={"30px"} name="add-rule">
          <Fab
            style={{ boxShadow: "none" }}
            color="secondary"
            // style={{
            //   position: "fixed",
            //   bottom: "30px",
            //   right: "30px",
            //   zIndex: 20,
            // }}
            onClick={handlepopupOpen}
          >
            <AddIcon />
          </Fab>
        </Dragable>
      ) : null}

      {openPopup ? (
        <Edit
          fields={props.fields}
          openPopup={openPopup}
          id={props.id}
          setOpenPopup={setOpenPopup}
          main
          serviceId={props.serviceId}
          permission={props.permission}
        />
      ) : null}
      <Card
        style={{
          minHeight: "400px",
          padding: "15px",
          height: "calc(100vh - 235px)",
        }}
      >
        <span
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <p
            style={{
              color: "#bfbec8",
              fontSize:
                window.localStorage.getItem("Language") == "en"
                  ? "15px"
                  : "22px",
            }}
          >
            <b>Rules</b>
          </p>
          <BuildIcon style={{ color: "#bfbec8" }} />
        </span>
        {ifLoaded(rules.isFetching, compFunc)}
      </Card>
      {activeId ? (
        <DeleteAlert
          deleteModal={deleteModal}
          question="Are you sure you want to delete this rule?"
          platformCheck={false}
          id={activeId}
          handleDelete={onDelete}
          handleClose={toggleDelete}
          deleteResult={deleteResult}
        />
      ) : null}
    </Fragment>
  );
}
