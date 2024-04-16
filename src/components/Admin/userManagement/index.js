//------------CORE------------//
import React, { useState, useEffect } from "react";
//-------------MUI-----------//
import IconButton from "@mui/material/IconButton";
import Card from "@mui/material/Card";
import GroupSharpIcon from "@mui/icons-material/GroupSharp";
import Fab from "@mui/material/Fab";
import Zoom from "@mui/material/Zoom";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import { useGetBrandingQuery } from "services/branding";
//-------------MUI-ICONSS-----------//
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import WebhookIcon from "@mui/icons-material/Webhook";
import DeleteIcon from "@mui/icons-material/Delete";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import HandymanIcon from "@mui/icons-material/Handyman";
//-----------EXTERNAL LIBS----------//
import { useSnackbar } from "notistack";
//-----------EXTERNAL COMPONENTS---------//
import DeleteAlert from "components/Alerts/Delete";
import Loader from "components/Progress";
import Table from "components/Table/table";
import AddUsers from "./addUser";
import ApiKeyPopUp from "./apiKeysPopUp";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useEditUserMutation,
  useGenerateApiKeysMutation,
} from "services/user";
import { useForgotPasswordMutation } from "services/auth";
import { useGetRolesQuery } from "services/roles";
import Dragable from "components/Dragable";
import BrandingCard from "./Branding";

export default function UM(props) {
  let token = window.localStorage.getItem("token");
  const allRoles = useGetRolesQuery(token);
  const [forgotPassword, resetResult] = useForgotPasswordMutation();
  const [deleteUser, deleteResult] = useDeleteUserMutation();
  const [openBranding, setOpenBranding] = React.useState(false);
  const users = useGetUsersQuery(
    { token, parameters: "" },
    { skip: !allRoles.isSuccess }
  );
  const { enqueueSnackbar } = useSnackbar();
  const [userId, setUserId] = useState("");
  const [rows, setRowState] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeUserName, setActiveUserName] = useState(null);
  const [deleteModal, setDelete] = useState(false);
  const [roles, setRoles] = useState([]);
  const [username, setUsername] = useState(null);
  const [block, setBlock] = useState(null);
  const [userEdit, setUserEdit] = useState("");
  const [openPopup, setOpenPopup] = useState(false);
  const [rolesIdMap, setRolesIdMap] = useState({});
  const [openKeysPopup, setOpenKeysPopup] = useState(false);
  const [apiKeysPopup, setApiKeysPopup] = useState({});
  const [isLoading,setIsLoading]=useState(true)

  const [editUser, updateResult] = useEditUserMutation();
  const [
    generateApiKeys,
    generateApiKeysResults,
  ] = useGenerateApiKeysMutation();

  const brandingRes = useGetBrandingQuery(
    { user: "true", id: userId },
    {
      skip: !openBranding,
    }
  );

  console.log("USER CHANGED", userId);

  function ifLoaded(state, component) {
    if (state) return <Loader top="20vh" />;
    else return component();
  }

  useEffect(() => {
    var temp = [];
    if (users.isSuccess && users.data?.payload.Users) {
      users.data.payload.Users.forEach((elm) => {
        temp.push(
          createData(
            {
              name: `${elm.firstName ? elm.firstName : ""} ${
                elm.lastName ? elm.lastName : ""
              }`,
              status: elm?.currentLoggedIn,
              blocked: elm?.blocked,
            },
            elm.userName,
            rolesIdMap[elm.role],
            elm.email,
            elm.phone,
            {
              created: elm?.createdAt
                ? `${new Date(elm?.createdAt).toLocaleDateString(
                    "en-GB"
                  )} ${new Date(elm?.createdAt).toLocaleTimeString()}`
                : "N/A",
              update: elm?.updatedAt
                ? `${new Date(elm?.updatedAt).toLocaleDateString(
                    "en-GB"
                  )} ${new Date(elm?.updatedAt).toLocaleTimeString()}`
                : "N/A",
              login: elm?.loginTime
                ? `${new Date(elm?.loginTime).toLocaleDateString(
                    "en-GB"
                  )} ${new Date(elm?.loginTime).toLocaleTimeString()}`
                : "N/A",
              logout: elm?.logoutTime
                ? `${new Date(elm?.logoutTime).toLocaleDateString(
                    "en-GB"
                  )} ${new Date(elm?.logoutTime).toLocaleTimeString()}`
                : "N/A",
            },
            elm
          )
        );
      });
      setRowState(temp);
      setIsLoading(false)
    }
    if (users.isError) {
      showSnackbar("Users", users.error?.data?.message, "error", 1000);
    }
  }, [users.isFetching]);

  useEffect(() => {
    if (allRoles.isSuccess) {
      let idObj = {};
      let roles = allRoles.data.payload;
      roles.forEach((elm) => {
        idObj[elm._id] = elm.name;
      });
      setRolesIdMap(idObj);
      setRoles(roles);
    } else if (
      !allRoles.isLoading &&
      !allRoles.isSuccess &&
      allRoles.data?.message != ""
    ) {
      showSnackbar("Roles", allRoles.data?.message, "error", 1000);
    }
  }, [allRoles.isFetching]);

  const handlePopupClose = () => {
    setUserEdit("");
    setOpenPopup(false);
  };

  async function onDelete(e, check) {
    let deletedUser = await deleteUser({ token, id: e, platformCheck: check });
    if (deletedUser.error) {
      showSnackbar("User", deletedUser.error?.data?.message, "error", 1000);
    } else {
      showSnackbar("User", deletedUser.data?.message, "success", 1000);
      toggleDelete();
    }
  }

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  async function onReset() {
    let forgot = await forgotPassword({ userName: username });
    if (forgot.data?.success) {
      showSnackbar(
        "User",
        `Verification email has been sent to ${username}`,
        "success",
        1000
      );
      setUsername(null);
    } else {
      showSnackbar("User", forgot.data?.message, "error", 1000);
    }
  }

  async function onBlock() {
    let updatedUser = await editUser({
      token,
      id: block.id,
      body: { blocked: !block.blocked },
    });
    if (updatedUser.error) {
      showSnackbar("User", updatedUser.error?.data?.message, "error", 1000);
    } else {
      showSnackbar("User", updatedUser.data?.message, "success", 1000);
    }
  }

  async function onGenerateApiKeys(userId, email) {
    let apiKeys = await generateApiKeys({
      id: userId,
      email,
    });
    if (apiKeys.error) {
      showSnackbar("User", apiKeys.error?.data?.message, "error", 1000);
    } else {
      showSnackbar("User", apiKeys.data?.message, "success", 1000);
      setApiKeysPopup(apiKeys.data?.payload);
      setOpenKeysPopup(true);
    }
  }

  async function toggleDelete(id = null) {
    setActiveId(id);
    setDelete((state) => !state);
  }

  async function forgotPass(username = null) {
    setUsername(username);
  }

  async function blockUser(id = null, blocked = null) {
    setBlock({ id, blocked });
  }

  function columns() {
    let temp = [
      { id: "html2", label: "Name", align: "center" },
      // { id: "name", label: "Name", align: "center" },
      { id: "userName", label: "User Name", align: "center" },
      { id: "role", label: "Role", align: "center" },
      { id: "email", label: "Email", align: "center" },
      { id: "number", label: "Phone Number", align: "center" },
      { id: "html3", label: "Last Login", align: "center" },
    ];
    if (props.permission == "ALL")
      temp.push({
        id: "html",
        label: "Actions",
        align: "center",
        disableSorting: true,
      });
    return temp;
  }

  function createData(html2, userName, role, email, number, html3, html) {
    return { html2, userName, role, email, number, html3, html };
  }

  var html = (row) => {
    return (
      <div>
        {users.data.payload.apiAccess && (
          <Tooltip
            title={"Generate Api Keys"}
            placement="bottom"
            arrow
            TransitionComponent={Zoom}
          >
            <IconButton
              onClick={() => {
                onGenerateApiKeys(row.html._id, row.html.email);
              }}
            >
              <WebhookIcon color="secondary" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip
          title={"Show Branding"}
          placement="bottom"
          arrow
          TransitionComponent={Zoom}
        >
          <IconButton
            onClick={() => {
              setActiveUserName(row.html.userName);
              setUserId(row.html._id);
              setOpenBranding(true);
            }}
          >
            <ColorLensIcon color="secondary" />
          </IconButton>
        </Tooltip>
        <Tooltip
          title={"Reset Password"}
          placement="bottom"
          arrow
          TransitionComponent={Zoom}
        >
          <IconButton onClick={() => forgotPass(row.html.userName)}>
            <VpnKeyIcon color="secondary" />
          </IconButton>
        </Tooltip>
        <Tooltip
          title={row.html.blocked ? "Unblock" : "Block"}
          placement="bottom"
          arrow
          TransitionComponent={Zoom}
        >
          <IconButton
            onClick={() => {
              setActiveUserName(row.html.userName);
              blockUser(row.html._id, row.html.blocked);
            }}
          >
            {row.html.blocked ? (
              <LockOpenIcon color="secondary" />
            ) : (
              <LockIcon color="secondary" />
            )}
          </IconButton>
        </Tooltip>
        <Tooltip
          title={"Edit"}
          placement="bottom"
          arrow
          TransitionComponent={Zoom}
        >
          <IconButton
            onClick={() => {
              setUserEdit(row.html);
              setOpenPopup(true);
            }}
          >
            <EditIcon color="secondary" />
          </IconButton>
        </Tooltip>
        <Tooltip
          title={"Delete"}
          placement="bottom"
          arrow
          TransitionComponent={Zoom}
        >
          <IconButton
            onClick={() => {
              setActiveUserName(row.html.userName);
              toggleDelete(row.html._id);
            }}
          >
            <DeleteIcon color="secondary" />
          </IconButton>
        </Tooltip>
      </div>
    );
  };

  var html2 = (row) => {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "start",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            background: row.html2?.blocked
              ? "rgb(221,0,0,0.1)"
              : row.html2?.status
              ? "rgb(95,183,98,0.1)"
              : "rgb(85,85,106,0.1)",
            padding: "5px 8px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              height: "10px",
              width: "10px",
              background: row.html2?.blocked
                ? "#dd0000"
                : row.html2?.status
                ? "#5fb762"
                : "grey",
              borderRadius: "50%",
            }}
          />
          <p
            style={{
              color: row.html2?.blocked
                ? "#dd0000"
                : row.html2?.status
                ? "#5fb762"
                : "grey",
              textTransform: "uppercase",
            }}
          >
            {row.html2.name}
          </p>
        </div>
      </div>
    );
  };

  var html3 = (row) => {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <p>{row.html3?.login}</p>
        <Tooltip
          title={
            <div>
              <p>Created: {row.html3?.created}</p>
              <p>Updated: {row.html3?.update}</p>
              <p>Login: {row.html3?.login}</p>
              <p>Logout: {row.html3?.logout}</p>
            </div>
          }
          placement="left"
          arrow
          TransitionComponent={Zoom}
        >
          <InfoOutlinedIcon style={{ color: "grey", cursor: "pointer" }} />
        </Tooltip>
      </div>
    );
  };

  function cardFunc() {
    return (
      <Table
        columns={columns()}
        rows={rows}
        html={html}
        html2={html2}
        html3={html3}
        filter={[
          "userName",
          "createdAt",
          "updatedAt",
          "platform",
          "tenant",
          "name",
        ]}
        minHeight={"calc(100vh - 330px)"}
      />
    );
  }

  return (
    <div>
      <Dialog
        open={openBranding}
        onClose={() => setOpenBranding(false)}
        PaperProps={{
          style: {
            maxWidth: "90vw",
            maxHeight: "90vh",
            padding: "5px",
            width: "500px",
            height: "200px",
          },
        }}
      >
        <p
          style={{
            fontSize: "18px",
            padding: "20px 20px 25px 20px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {`Branding (${activeUserName})`}
        </p>
        {brandingRes.isFetching ? (
          <Loader />
        ) : (
          <BrandingCard elm={brandingRes?.data?.payload?.branding} />
        )}
      </Dialog>
      {props.permission == "ALL" ? (
        <Dragable bottom={"30px"} right={"30px"} name="add-user">
          <Fab
            style={{ boxShadow: "none" }}
            color="secondary"
            onClick={() => setOpenPopup(true)}
          >
            <AddIcon />
          </Fab>
        </Dragable>
      ) : null}
      <Card>
        <div
          style={{
            margin: "15px 20px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <p style={{ color: "rgb(191, 190, 200)", fontSize: "15px" }}>
            <b>Users</b>
          </p>
          <GroupSharpIcon color="disabled" />
        </div>
        <div
          style={{
            margin: "20px",
            minHeight: "50vh",
          }}
        >
          {ifLoaded(isLoading, cardFunc)}
        </div>
      </Card>
      {activeId ? (
        <DeleteAlert
          deleteModal={deleteModal}
          title={`Delete (${activeUserName})`}
          question={`Are you sure you want to delete this user?`}
          id={activeId}
          handleDelete={onDelete}
          handleClose={toggleDelete}
          deleteResult={deleteResult}
        />
      ) : null}
      {username ? (
        <DeleteAlert
          deleteModal={true}
          title={`Reset password (${username})`}
          question={`Are you sure you want to reset password for this user?`}
          platformCheck={false}
          id={activeId}
          handleDelete={onReset}
          handleClose={() => setUsername(null)}
          deleteResult={resetResult}
        />
      ) : null}
      {block ? (
        <DeleteAlert
          deleteModal={true}
          title={`${block.blocked ? "Unblock" : "Block"} (${activeUserName})`}
          question={`Are you sure you want to ${
            block.blocked ? "unblock" : "block"
          } this user?`}
          platformCheck={false}
          id={activeId}
          handleDelete={onBlock}
          handleClose={() => setBlock(null)}
          deleteResult={resetResult}
        />
      ) : null}
      {openPopup ? (
        <AddUsers
          userEdit={userEdit}
          roles={roles}
          license2FAEnabled={users.data?.payload?.license2FAEnabled}
          twoFAOptionEnabledForAdmins={
            users.data?.payload?.twoFAOptionEnabledForAdmins
          }
          handlePopupClose={handlePopupClose}
        />
      ) : null}
      {openKeysPopup ? (
        <ApiKeyPopUp
          handlePopupClose={() => {
            setOpenKeysPopup(false);
          }}
          apiKeys={apiKeysPopup}
        />
      ) : null}
    </div>
  );
}
