import React, { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import {
  useAddNoteMutation,
  useEditNoteMutation,
  useDeleteNoteMutation,
} from "services/devices";
import { useGetSignedUsersQuery, useUploadUserMutation } from "services/user";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { CircularProgress } from "@mui/material";
import DocIcon from "assets/img/google-docs.png";
import CloseIcon from "@mui/icons-material/Close";
import Tooltip from "@mui/material/Tooltip";

export default function Notes({
  notes,
  setNotes,
  deviceId,
  permission,
  userId,
}) {
  let token = window.localStorage.getItem("token");
  const { enqueueSnackbar } = useSnackbar();
  const [body, setBody] = useState(null);
  const [createNote, createNoteResult] = useAddNoteMutation();
  const [updateNote, updateNoteResult] = useEditNoteMutation();
  const [newNote, setNewNote] = useState({
    note: "",
    attachments: [],
    deviceId,
  });
  const [deleteNote, deleteNoteResult] = useDeleteNoteMutation();
  const [hovered, setHovered] = useState(null);
  const [uploadAttachment, uploadAttachmentResult] = useUploadUserMutation();
  const signed = useGetSignedUsersQuery(
    {
      token,
      type: body
        ? chkImg(body?.type?.toLowerCase())
          ? getImgExt(body?.type?.toLowerCase())
          : getOtherExt(body?.name)
        : null,
    },
    { skip: !body }
  );

  useEffect(() => {
    notes.forEach((note, ind) => {
      document.getElementById(`note-${ind}`).style.height = "auto";
    });
    notes.forEach((note, ind) => {
      document.getElementById(`note-${ind}`).style.height =
        document.getElementById(`note-${ind}`).scrollHeight + "px";
    });
  }, [JSON.stringify(notes)]);

  useEffect(() => {
    setTimeout(() => {
      let textArea = document.getElementById("initial-note");
      textArea.focus();
    }, 100);
  }, []);

  const saveNote = async (id = undefined) => {
    let note = !id ? newNote.note : notes[editing].note;
    let tempAttachments = !id
      ? [...newNote.attachments]
      : [...notes[editing].attachments];
    tempAttachments.forEach((att) => {
      if (att.img) {
        delete att.img;
      }
    });
    if (note) {
      let payload = { note, deviceId, attachments: tempAttachments };
      if (!id) {
        let createdNote = await createNote({ token, body: payload });
        if (createdNote.data.success) {
          showSnackbar(
            "Note created successfully",
            createdNote.data?.message,
            "success",
            1000
          );
          setEditing(null);
          setNewNote({ note: "", attachments: [], deviceId });
          setBody(null);
        } else {
          showSnackbar("Failed", createdNote.data?.message, "error", 1000);
        }
      } else {
        let updatedNote = await updateNote({ token, body: payload, id });
        if (updatedNote.data?.success) {
          showSnackbar(
            "Note updated successfully",
            updatedNote.data?.message,
            "success",
            1000
          );
          setEditing(null);
          setBody(null);
        } else {
          showSnackbar("Failed", updatedNote.data?.message, "error", 1000);
        }
      }
    } else {
      showSnackbar("Add Note", "Please enter some note", "warning", 1000);
    }
  };

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  function getImgExt(type) {
    return type.toLowerCase().slice(6);
  }

  function getOtherExt(name) {
    return name.slice(name.lastIndexOf(".") + 1);
  }

  function chkImg(type) {
    if (
      type.toLowerCase().includes("image/png") ||
      type.toLowerCase().includes("image/jpeg") ||
      type.toLowerCase().includes("image/jpg") ||
      type.toLowerCase().includes("image/gif")
    ) {
      return true;
    } else {
      return false;
    }
  }

  const removeNote = async (id) => {
    if (id) {
      let deletedNote = await deleteNote({ token, id });
      if (deletedNote.data?.success) {
        showSnackbar(
          "Note deleted successfully",
          deletedNote.data?.message,
          "success",
          1000
        );
      } else {
        showSnackbar("Failed", deletedNote.data?.message, "error", 1000);
      }
    } else {
      let tempNotes = notes.filter((n) => n._id);
      setNotes(tempNotes);
    }
  };

  const addAttachment = async (att, type) => {
    let name = att.name;
    if (
      getOtherExt(name) == "exe" ||
      getOtherExt(name) == "exec" ||
      getOtherExt(name) == "js" ||
      getOtherExt(name) == "apk" ||
      getOtherExt(name) == "sh" ||
      getOtherExt(name) == "bat"
    ) {
      showSnackbar("File upload", "File not supported", "warning");
      return;
    }
    if (type == "update") {
      let tempNotes = [...notes];
      tempNotes[editing].attachments.push("loading");
      setBody(att);
      setNotes(tempNotes);
    } else {
      let tempNote = { ...newNote };
      tempNote.attachments.push("loading");
      setBody(att);
      setNewNote(tempNote);
    }
  };

  useEffect(() => {
    if (!signed.isFetching && signed.isSuccess) {
      uploadAttachment({ url: signed.data.payload, body });
    }
    if (signed.isError) {
      showSnackbar(
        "Attachment upload error",
        signed.error?.message,
        "error",
        1000
      );
    }
  }, [signed.isFetching]);

  useEffect(() => {
    if (uploadAttachmentResult.isSuccess) {
      let link = signed.data.payload.split("?")[0];

      let tempNotes = [...notes];
      if (tempNotes[editing]) {
        let ind = tempNotes[editing].attachments.findIndex(
          (a) => a == "loading"
        );
        tempNotes[editing].attachments[ind] = chkImg(body?.type?.toLowerCase())
          ? { link, img: URL.createObjectURL(body), name: body.name }
          : { link: link, img: DocIcon, name: body.name };
        setNotes(tempNotes);
      } else {
        let tempNote = { ...newNote };
        let ind = tempNote.attachments.findIndex((a) => a == "loading");
        tempNote.attachments[ind] = chkImg(body?.type?.toLowerCase())
          ? { link, img: URL.createObjectURL(body), name: body.name }
          : { link: link, img: DocIcon, name: body.name };
        setNewNote(tempNote);
      }
      setBody(null);
    }
  }, [uploadAttachmentResult]);

  const [editing, setEditing] = useState(null);

  return (
    <div>
      <h1
        style={{
          color: "#666",
          textAlign: "center",
          marginBottom: "22px",
          fontSize: "20px",
          marginTop: "20px",
          fontWeight: 600,
        }}
      >
        Asset Notes
      </h1>
      <div
        style={{
          margin: "20px",
          width: "360px",
          height: "calc(100vh - 90px)",
          overflow: "auto",
        }}
      >
        <div
          style={{
            padding: "0px 20px",
            border: "1px solid #111",
            borderRadius: "12px",
            margin: "10px 0px",
            position: "relative",
            width: "350px",
            height: "180px",
          }}
        >
          {permission == "ALL" ? (
            <div
              style={{
                position: "absolute",
                right: "20px",
                top: "10px",
                display: "flex",
                gap: "5px",
              }}
            >
              <input
                type="file"
                hidden={true}
                id="newnote-attachment"
                onChange={(e) => addAttachment(e.target.files[0], "new")}
              />

              <AttachFileIcon
                sx={{ fontSize: 19, color: "#777", cursor: "pointer" }}
                onClick={() => {
                  if (newNote.attachments.length < 6) {
                    document.getElementById("newnote-attachment").click();
                  } else {
                    showSnackbar(
                      "Attachment",
                      "Attachments limit exceeded",
                      "error",
                      1000
                    );
                  }
                }}
              />
              <SaveIcon
                sx={{ fontSize: 19, color: "#777", cursor: "pointer" }}
                onClick={() => saveNote()}
              />
            </div>
          ) : null}
          <textarea
            placeholder="Enter your note here ..."
            id={`initial-note`}
            value={newNote.note}
            sx={{
              fontSize: "13px",
              color: "#444",
              "& .MuiInputBase-input": {
                width: "300px",
                height: "100px",
              },
            }}
            style={{
              fontSize: "13px",
              border: "none",
              width: "100%",
              height: "100%",
              backgroundColor: "white",
              marginTop: "35px",
              height: newNote.attachments.length ? "110px" : "135px",
              resize: "none",
            }}
            onChange={(e) => {
              let tempNote = { ...newNote };
              tempNote.note = e.target.value;
              setNewNote(tempNote);
            }}
          />
          <div style={{ marginTop: "-8px", display: "flex", gap: "10px" }}>
            {newNote.attachments?.map((att, i) => {
              return att == "loading" ? (
                <CircularProgress size={20} />
              ) : (
                <Tooltip title={att.name} placement="top" arrow>
                  <div
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {hovered == i ? (
                      <CloseIcon
                        onClick={() => {
                          let tempNote = { ...newNote };
                          tempNote.attachments.splice(i, 1);
                          setNewNote(tempNote);
                        }}
                        sx={{
                          position: "absolute",
                          cursor: "pointer",
                          marginLeft: "21px",
                          color: "red",
                          fontSize: "12px",
                        }}
                      />
                    ) : null}
                    <a href={att.link} download>
                      <img
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                        }}
                        src={att.img || att.link}
                      />
                    </a>
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </div>
        {notes.map((note, ind) => {
          return (
            <div
              style={{
                padding: "0px 20px",
                border: "1px solid lightgrey",
                borderRadius: "12px",
                margin: "10px 0px",
                position: "relative",
                width: "350px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "20px",
                  top: "11px",
                  color: "#888",
                  lineHeight: "1.5",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    textTransform: "capitalize",
                    opacity: "0.3",
                  }}
                >
                  {note.firstName + " " + note.lastName} @ {note.updatedAt}
                </div>
                {/* <div style={{fontSize:'9px'}}>
                                
                            </div> */}
              </div>
              {(permission == "ALL" && note.userId == userId) ||
              !note.userId ? (
                <div
                  style={{
                    position: "absolute",
                    right: "20px",
                    top: "10px",
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <input
                    type="file"
                    hidden={true}
                    id="note-attachment"
                    onChange={(e) => addAttachment(e.target.files[0], "update")}
                  />

                  {(editing || editing == 0) && editing == ind ? (
                    <AttachFileIcon
                      sx={{ fontSize: 19, color: "#777", cursor: "pointer" }}
                      onClick={() => {
                        if (note.attachments.length < 6) {
                          document.getElementById("note-attachment").click();
                        } else {
                          showSnackbar(
                            "Attachment",
                            "Attachments limit exceeded",
                            "error",
                            1000
                          );
                        }
                      }}
                    />
                  ) : null}
                  {(editing || editing == 0) && editing == ind ? (
                    <SaveIcon
                      sx={{ fontSize: 19, color: "#777", cursor: "pointer" }}
                      onClick={() => saveNote(note._id)}
                    />
                  ) : (
                    <EditIcon
                      sx={{ fontSize: 19, color: "#777", cursor: "pointer" }}
                      onClick={() => {
                        let textArea = document.getElementById("note-" + ind);
                        textArea.focus();
                        setEditing(ind);
                      }}
                    />
                  )}
                  <DeleteIcon
                    sx={{ fontSize: 19, color: "#777", cursor: "pointer" }}
                    onClick={() => removeNote(note._id)}
                  />
                </div>
              ) : null}
              <textarea
                placeholder="Enter your note here ..."
                disabled={editing != ind}
                id={`note-${ind}`}
                value={note.note}
                sx={{
                  fontSize: "13px",
                  color: "#444",
                  "& .MuiInputBase-input": {
                    width: "300px",
                    height: "100px",
                  },
                }}
                style={{
                  fontSize: "13px",
                  color:
                    (editing || editing == 0) && editing == ind
                      ? "#444"
                      : "#999",
                  border: "none",
                  width: "100%",
                  height: "100%",
                  backgroundColor: "white",
                  marginTop: "35px",
                  //  height: note.attachments.length ? '110px' : '135px',
                  resize: "none",
                }}
                onChange={(e) => {
                  let tempNote = [...notes];
                  tempNote[ind].note = e.target.value;
                  setNotes(tempNote);
                }}
              />
              <div
                style={{
                  marginTop: "-8px",
                  marginBottom: "10px",
                  display: "flex",
                  gap: "10px",
                }}
              >
                {note.attachments?.map((att, i) => {
                  return att == "loading" ? (
                    <CircularProgress size={20} />
                  ) : (
                    <Tooltip title={att.name} placement="top" arrow>
                      <div
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                      >
                        {editing == ind && hovered == i ? (
                          <CloseIcon
                            onClick={() => {
                              let tempNotes = [...notes];
                              tempNotes[editing].attachments.splice(i, 1);
                              setNotes(tempNotes);
                            }}
                            sx={{
                              position: "absolute",
                              cursor: "pointer",
                              marginLeft: "21px",
                              color: "red",
                              fontSize: "12px",
                            }}
                          />
                        ) : null}
                        <a href={att.link} target="newWindow">
                          <img
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "50%",
                            }}
                            src={att.img || att.link}
                            onError={({ currentTarget }) => {
                              currentTarget.onerror = null; // prevents looping
                              currentTarget.src = DocIcon;
                            }}
                          />
                        </a>
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {/* <div style={{textAlign:'center'}}>
            <Button variant="outlined"
            disabled={notes.find(n=>!n._id)}
            size="large" onClick={()=>{
                setEditing(notes.length)
                setNotes([...notes,{note:"",attachments:[]}])
            }} startIcon={<AddIcon />}>
                Add Note
            </Button>
            </div> */}
    </div>
  );
}
