//-----------CORE------------//
import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
//--------------MUI--------------//
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import CheckBox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import CircularProgress from "@mui/material/CircularProgress";
import FormHelperText from "@mui/material/FormHelperText";
//----------EXTERNAL COMPS----------//
import { useCreateUserMutation, useEditUserMutation } from "services/user";
import { useGetSpecificRoleQuery } from "services/roles";
import { setRole } from "rtkSlices/metaDataSlice";

export default function AddUsers(props) {
  let token = window.localStorage.getItem("token");

  let user = props.userEdit;
  let license2FAEnabled = props.license2FAEnabled;
  let twoFAOptionEnabledForAdmins = props.twoFAOptionEnabledForAdmins;
  const userForm = useFormik({
    initialValues: {
      firstName: user ? user.firstName : "",
      lastName: user ? user.lastName : "",
      userName: user ? user.userName : "",
      role: user ? user.role : "",
      email: user ? user.email : "",
      phone: user ? user.phone : "",
      tfa: user ? user.twoFAUserEnabled : false,
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("Required field"),
      lastName: Yup.string().required("Required field"),
      userName: Yup.string().required("Required field"),
      role: Yup.string().required("Required field"),
      email: Yup.string().required("Required field").email("Invalid Email"),
      tfa: Yup.boolean(),
      phone: Yup.string()
        .min(9)
        .max(15)
        .matches(/^[+ 0-9]+$/, "Invalid Phone Number")
        .required("Required field"),
    }),
    onSubmit: async (values) => {
      onSubmitAdd(values);
    },
  });
  const { enqueueSnackbar } = useSnackbar();
  const [createUser, addResult] = useCreateUserMutation();
  const roleRes = useGetSpecificRoleQuery(window.localStorage.getItem("role"), {
    skip: !userUpdated,
  });
  const [editUser, updateResult] = useEditUserMutation();
  const [userUpdated, setUserUpdated] = React.useState(false);
  const metaDataValue = useSelector((state) => state.metaData);
  const dispatch = useDispatch();
  var onSubmitAdd = async (body) => {
    if (!props.userEdit) {
      console.log(body);
      let addedUser = await createUser({ body });
      if (addedUser.error) {
        showSnackbar("User", addedUser.error?.data?.message, "error", 1000);
      } else {
        showSnackbar("User", addedUser.data?.message, "success", 1000);
        userForm.resetForm();
        props.handlePopupClose();
      }
    } else {
      let updatedUser = await editUser({ token, id: props.userEdit._id, body });
      if (updatedUser.error) {
        showSnackbar("User", updatedUser.error?.data?.message, "error", 1000);
      } else {
        if (body.userName == metaDataValue.userInfo.userName) {
          setUserUpdated(true);
        }
        showSnackbar("User", updatedUser.data?.message, "success", 1000);
        userForm.resetForm();
        props.handlePopupClose();
      }
    }
  };

  useEffect(() => {
    if (!roleRes.isFetching && roleRes.isSuccess) {
      dispatch(setRole(roleRes.data.payload));
      setUserUpdated(false);
    }
  }, [roleRes.isFetching]);

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  return (
    <div>
      <Dialog
        open={true}
        onClose={props.handlePopupClose}
        aria-labelledby="form-dialog-title"
      >
        <form onSubmit={userForm.handleSubmit}>
          <DialogTitle id="form-dialog-title">
            {props.userEdit
              ? `Update User (${props.userEdit.userName})`
              : "Create User"}
          </DialogTitle>
          <DialogContent>
            <span style={{ display: "flex", gap: "20px", width: "542px" }}>
              <TextField
                id="firstName"
                error={
                  userForm.touched.firstName && userForm.errors.firstName
                    ? true
                    : false
                }
                required
                margin="dense"
                value={userForm.values.firstName}
                onChange={userForm.handleChange}
                onBlur={userForm.handleBlur}
                fullWidth
                label="First Name"
                helperText={
                  userForm.touched.firstName ? userForm.errors.firstName : ""
                }
              />
              <TextField
                id="lastName"
                required
                error={
                  userForm.touched.lastName && userForm.errors.lastName
                    ? true
                    : false
                }
                margin="dense"
                value={userForm.values.lastName}
                onChange={userForm.handleChange}
                onBlur={userForm.handleBlur}
                fullWidth
                label="Last Name"
                helperText={
                  userForm.touched.lastName ? userForm.errors.lastName : ""
                }
              />
            </span>

            <TextField
              id="email"
              required
              error={
                userForm.touched.email && userForm.errors.email ? true : false
              }
              margin="dense"
              style={{
                paddingRight: "10px",
              }}
              value={userForm.values.email}
              onChange={userForm.handleChange}
              onBlur={userForm.handleBlur}
              fullWidth
              label="Email"
              helperText={userForm.touched.email ? userForm.errors.email : ""}
            />
            {props.userEdit ? null : (
              <TextField
                id="userName"
                required
                error={
                  userForm.touched.userName && userForm.errors.userName
                    ? true
                    : false
                }
                margin="dense"
                style={{
                  paddingRight: "10px",
                }}
                value={userForm.values.userName}
                onChange={userForm.handleChange}
                onBlur={userForm.handleBlur}
                fullWidth
                label="Username"
                helperText={
                  userForm.touched.userName ? userForm.errors.userName : ""
                }
              />
            )}
            <TextField
              id="phone"
              required
              error={userForm.touched.phone && userForm.errors.phone}
              margin="dense"
              style={{
                paddingRight: "10px",
              }}
              value={userForm.values.phone}
              onChange={userForm.handleChange}
              onBlur={userForm.handleBlur}
              fullWidth
              label="Phone number"
              helperText={userForm.touched.phone ? userForm.errors.phone : ""}
            />
            <FormControl
              margin="dense"
              fullWidth
              style={{ width: "542px" }}
              error={userForm.touched.role && userForm.errors.role}
            >
              <InputLabel>Role *</InputLabel>
              <Select
                value={userForm.values.role}
                name="role"
                fullWidth
                onChange={userForm.handleChange}
                onBlur={userForm.handleBlur}
                label="Role *"
              >
                {props.roles.map((role) => {
                  return <MenuItem value={role._id}>{role.name}</MenuItem>;
                })}
              </Select>
              <FormHelperText>
                {userForm.touched.role ? userForm.errors.role : ""}
              </FormHelperText>
            </FormControl>

            {(license2FAEnabled && twoFAOptionEnabledForAdmins) && (
              <FormControlLabel
                label={"Enforce 2FA"}
                sx={{ color: "grey" }}
                control={
                  <CheckBox
                    id="tfa"
                    sx={{ color: "grey" }}
                    label={"Enforce 2FA"}
                    color="primary"
                    fullWidth
                    margin="dense"
                    checked={userForm.values.tfa}
                    onChange={userForm.handleChange}
                  />
                }
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={props.handlePopupClose}
              color="primary"
              id="cancelBtn"
            >
              Cancel
            </Button>
            <Button type="submit">
              {addResult.isLoading || updateResult.isLoading ? (
                <CircularProgress size={20} />
              ) : (
                <span>Submit</span>
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
