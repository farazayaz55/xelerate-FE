//-----------CORE----------//
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useSnackbar } from "notistack";
//-----------MUI----------//
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import DeleteAlert from "components/Alerts/Delete";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircularProgress from "@mui/material/CircularProgress";
import AddCircleIcon from "@mui/icons-material/AddCircle";
//-----------EXTERNAL----------//
import "./support.css";
import ClearIcon from "@mui/icons-material/Clear";
import { useCreateSupportTicketMutation } from "services/support";
import {
  useGetSignedUsersQuery,
  useLazyGetSignedUsersQuery,
  useUploadUserMutation,
  useUploadFileToAWSMutation,
} from "services/user";
import DocIcon from "../../assets/img/google-docs.png";
import Tooltip from "@mui/material/Tooltip";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";

var infoText2 = {
  fontSize: 12,
  backgroundColor: "rgb(223 223 223)",
  padding: 10,
  display: "flex",
  alignItems: "center",
  gap: 10,
  color: "grey",
  borderRadius: "4px",
};

let body = null;
let tempAttachments = [];

export default function Support(props) {
  let token = window.localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("userInfo"));
  const metaData = useSelector((state) => state.metaData);
  const [cancel, setCancel] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [reason, setReason] = useState("");
  const [service, setService] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [submit, setSubmit] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const [skip, setSkip] = useState(true);
  const [createSupportTicket, creating] = useCreateSupportTicketMutation();
  const [url, setUrl] = useState("");
  // const signed = useGetSignedUsersQuery(
  //   { token: token, type: "svg" },
  //   { skip }
  // );
  const [signed, signedResult] = useLazyGetSignedUsersQuery();
  const [upload, uploadResult] = useUploadUserMutation();
  const [uploadFile, uploadFileResult] = useUploadFileToAWSMutation();

  const onDelete = (param1 = null, param2 = null) => {
    props.history.push("/solutions");
    setCancel(!cancel);
  };

  const toggleDelete = () => {
    setCancel(!cancel);
  };
  const resetForm = () => {
    setRemarks("");
    setReason("");
    setSubmittedTicket("");
    setAttachments([]);
    setService(null)
  };

  async function onSubmit() {
    if (reason && remarks) {
      /* let body = {
        issueType: reason,
        remarks: remarks,
        attachments: attachments.map((a) => {
          return { link: a.link, name: a.name };
        })
      };
      if(service){
        body.service = {
          name: metaData.services.find((s) => s.id == service).name,
          id: service,
        }
      } */
      const formData = new FormData();

      // Append issueType and remarks to formData
      formData.append('issueType', reason);
      formData.append('remarks', remarks);

      // Append attachments to formData
      attachments.forEach((attachment, index) => {
        formData.append(`file`, attachment.body);
      });

      // Append service to formData
      if(service){
        let serviceObj = {
          name: metaData.services.find((s) => s.id == service).name,
          id: service,
        }
        formData.append('service', JSON.stringify(serviceObj));
      }

      let submitted = await createSupportTicket({ token, formData });
      if (submitted.data?.success) {
        setSubmit(false);
        setSubmittedTicket(submitted.data?.payload._id);
      } else {
        showSnackbar(
          "Support Ticket",
          submitted.error.data?.message,
          "error",
          1000
        );
      }
    } else {
    }
  }

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  function chkImg(type) {
    if (
      type.toLowerCase().includes("image/png") ||
      type.toLowerCase().includes("image/svg") ||
      type.toLowerCase().includes("image/jpeg") ||
      type.toLowerCase().includes("image/jpg") ||
      type.toLowerCase().includes("image/gif")
    ) {
      return true;
    } else {
      return false;
    }
  }

  function getImgExt(type) {
    return type.toLowerCase().slice(6);
  }

  function getOtherExt(name) {
    return name.slice(name.lastIndexOf(".") + 1);
  }

  const selectFiles = async (e) => {
    setSkip(false);
    tempAttachments = e.target.files;
    for (let i = 0; i < tempAttachments.length; i++) {
      let type = tempAttachments[i].type.toLowerCase();
      let name = tempAttachments[i].name;
      let size = tempAttachments[i].size;
      if (
        getOtherExt(name) == "exe" ||
        getOtherExt(name) == "exec" ||
        getOtherExt(name) == "js" ||
        getOtherExt(name) == "apk" ||
        getOtherExt(name) == "sh" ||
        getOtherExt(name) == "bat"
      ) {
        showSnackbar("File upload", "File not supported", "warning");
      } else if (size > 1000000) {
        showSnackbar(
          "File upload",
          "File size limit exceeded i.e 10 MB.",
          "warning"
        );
      } else {
       /*  const res = await signed({
          token,
          type: chkImg(type) ? getImgExt(type) : getOtherExt(name),
        }); */
        body = tempAttachments[i];
        // Create a FileReader instance
        const reader = new FileReader();

        reader.onload = async (event) => {
          const previewURL = event.target.result;
          const mimeType = chkImg(type) ? getImgExt(type) : getOtherExt(name);
          const attachment = {
            file: body,
            // previewURL: previewURL,
            // name: body.name,
            mimeType: mimeType
          };
          console.log("attachment: ", attachment);
          setAttachments((prev) => [
            ...prev,
            { body, preview: previewURL, name },
          ]);
          const formData = new FormData();
          formData.append('file', body); 
          await uploadFile({token, mimeType, attachment, formData})
        };
        reader.readAsDataURL(body);

        /* await upload({ url: res.data.payload, body });
        let link = res.data.payload.split("?")[0];
        setAttachments((prev) => [
          ...prev,
          { link, preview: chkImg(type) ? link : DocIcon, name },
        ]); */
        document.getElementById(
          "support-content"
        ).scrollTop = document.getElementById("support-content").scrollHeight;
      }
    }
  };

  const removeFile = (i) => {
    let tempFiles = JSON.parse(JSON.stringify(attachments));
    tempFiles.splice(i, 1);
    setAttachments(tempFiles);
  };

  return (
    <div>
      <Card className="user-info">
        {!submittedTicket ? (
          <p
            style={{
              color: "rgb(191, 190, 200)",
              fontSize: "15px",
              margin: "15px 30px 15px 30px",
            }}
          >
            <b>Create Support Ticket</b>
          </p>
        ) : null}
        <CardContent
          id="support-content"
          style={{
            display: submittedTicket ? "flex" : "block",
            padding: 0,
            overflow: "auto",
            justifyContent: submittedTicket ? "center" : "",
            alignItems: submittedTicket ? "center" : "",
            height: "calc(100vh - 240px)",
          }}
        >
          {submittedTicket ? (
            <div
              style={{
                color: metaData.branding.secondaryColor,
                fontWeight: "400",
                fontSize: "20px",
                textAlign: "center",
                lineHeight: "40px",
                marginBottom: "15px",
              }}
            >
              <CheckCircleIcon style={{ width: "80px", height: "80px" }} />
              <div>Your ticket has been submitted successfully</div>
              <p style={{ fontWeight: "bold" }}>
                Ticket ID : {submittedTicket}
              </p>
              <div>Xelerate support team will respond within 24 hours.</div>
              <div style={{ fontSize: 14, color: "rgb(197, 197, 197)" }}>
                Note: a copy of this ticket has been sent to your registered
                email also.
              </div>
              <Stack
                direction="row"
                spacing={2}
                style={{ justifyContent: "center", marginTop: "4%" }}
              >
                <Button
                  color="secondary"
                  onClick={() => props.history.push("/solutions")}
                  variant="outlined"
                >
                  Go Home
                </Button>
                <Button
                  color="secondary"
                  variant="outlined"
                  onClick={resetForm}
                >
                  Create new ticket
                </Button>
              </Stack>
            </div>
          ) : (
            <div style={{ padding: "5px 30px", maxHeight: "61vh" }}>
              <div>
                <p style={{ color: "#555555" }}>
                  <b>User Details</b>
                </p>
                <Divider />
                <div style={{ marginTop: "20px" }}>
                  <h4 className="name">{`${metaData.userInfo.firstName} ${metaData.userInfo.lastName}`}</h4>
                  <p className="email">{metaData.userInfo.email}</p>
                  <p className="phone">{metaData.userInfo.phone}</p>
                </div>
              </div>

              <div className="ticket-info">
                <p style={{ color: "#555555" }}>
                  <b>Ticket Details</b>
                </p>
                <Divider />
                <div style={{ marginTop: "20px" }}>
                  <FormControl fullWidth sx={{ position: "relative" }}>
                    <InputLabel id="demo-simple-select-label">
                      Select Solution ( optional )
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      label="Select Solution ( optional )"
                      style={{ width: "100%", marginBottom: 10 }}
                      onChange={(e) => setService(e.target.value)}
                    >
                      {service ? <MenuItem value={""}>None</MenuItem> : null}
                      {metaData.services.map((service) => {
                        return (
                          <MenuItem value={service.id}>{service.name}</MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">
                      Reason
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      label="Reason"
                      style={{ width: "100%", marginBottom: 10 }}
                      onChange={(e) => setReason(e.target.value)}
                    >
                      <MenuItem value={"Defect"}>Defect</MenuItem>
                      <MenuItem value={"Feature Usage Problems"}>
                        Feature Usage Problems
                      </MenuItem>
                      <MenuItem value={"Performance Issues"}>
                        Performance Issues
                      </MenuItem>
                      <MenuItem value={"New Feature Request"}>
                        New Feature Request
                      </MenuItem>
                      <MenuItem value={"General Inquiry"}>
                        General Inquiry
                      </MenuItem>
                      <MenuItem value={"Hardware/Device Issues"}>
                        Hardware/Device Issues
                      </MenuItem>
                      <MenuItem value={"Connectivity Issues"}>
                        Connectivity Issues
                      </MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div>
                  <TextField
                    label="Remarks"
                    multiline
                    style={{
                      marginBottom: "10px",
                      width: "100%",
                    }}
                    rows={8}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
                <div style={infoText2}>
                  <InfoIcon />
                  Please elaborate your issue in remarks.
                </div>
              </div>
              {!skip ? (
                <div className="files">
                  {signedResult?.isFetching || uploadResult?.isLoading ? (
                    <CircularProgress
                      style={{
                        color: metaData.branding.primaryColor,
                        textAlign: "center",
                      }}
                      size={50}
                    />
                  ) : (
                    attachments.map((file, i) => {
                      return (
                        <Tooltip title={file.name} placement="top" arrow>
                          <div className="single-file">
                            <ClearIcon
                              className="clear"
                              onClick={() => removeFile(i)}
                            />
                            <img src={file.preview} className="file" />
                          </div>
                        </Tooltip>
                      );
                    })
                  )}
                </div>
              ) : null}
              <input
                type="file"
                multiple
                id="select-file"
                onChange={selectFiles}
              />
            </div>
          )}
        </CardContent>
        {!submittedTicket ? (
          <div className="btns">
            <Button
              color="info"
              sx={{ color: "white" }}
              variant="contained"
              onClick={() => document.getElementById("select-file").click()}
              startIcon={<CloudUploadIcon sx={{ color: "white" }} />}
            >
              Attach Files
            </Button>
            <Stack direction="row" spacing={2}>
              <Button
                color="error"
                onClick={() => setCancel(!cancel)}
                variant="contained"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={onSubmit}
                disabled={
                  !reason ||
                  !remarks ||
                  signedResult?.isFetching ||
                  uploadResult?.isLoading
                }
              >
                {creating.isLoading ? (
                  <CircularProgress style={{ color: "white" }} size={20} />
                ) : (
                  <span>Submit</span>
                )}
              </Button>
            </Stack>
          </div>
        ) : null}
      </Card>
      {cancel ? (
        <DeleteAlert
          deleteModal={true}
          question="Are you sure you want to cancel raising this ticket?"
          platformCheck={false}
          id={null}
          handleDelete={onDelete}
          handleClose={toggleDelete}
        />
      ) : null}
    </div>
  );
}
