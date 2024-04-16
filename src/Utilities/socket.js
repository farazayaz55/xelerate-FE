import io from "socket.io-client";
import Keys from "Keys";

let socket;
let url = Keys.baseUrl;
let topicsGlobal = [];
let monitoring;
let controlling;
let devices;
let events;

function devicesSocket() {
  let path = url.includes("/api") ? "/api/devices/socket.io" : "/socket.io/devices"
  devices = io(url, {
    path: path,
    transports: ["websocket"],
    upgrade: false,
  });

  devices.on("connect", () => {
    console.log("Socket IO Connected", "devices");
  });

  devices.on("disconnect", () => {
    console.log("Socket IO Disonnected", "devices");
    devices = null;
  });

  return devices;
}

function monitoringSocket() {
  let path = url.includes("/api") ? "/api/monitoring/socket.io" : "/socket.io/monitoring"
  monitoring = io(url, {
    path: path,
    transports: ["websocket"],
    upgrade: false,
  });

  monitoring.on("connect", () => {
    console.log("Socket IO Connected", "monitoring");
  });

  monitoring.on("disconnect", () => {
    console.log("Socket IO Disonnected", "monitoring");
    monitoring = null;
  });

  return monitoring;
}

function controllingSocket() {
  let path = url.includes("/api") ? "/api/controlling/socket.io" : "/socket.io/controlling"

  controlling = io(url, {
    path: path,
    transports: ["websocket"],
    upgrade: false,
    query: {
      token: window.localStorage.getItem("token"),
    },
  });

  controlling.on("connect", () => {
    console.log("Socket IO Connected", "controlling");
  });

  controlling.on("disconnect", () => {
    console.log("Socket IO Disonnected", "controlling");
    controlling = null;
  });

  return controlling;
}


function eventsSocket(topics) {

  let path = url.includes("/api") ? "/api/events/socket.io" : "/socket.io/events"
  events = io(url, {
    path: path,
    transports: ["websocket"],
    upgrade: false,
    query: {
      token: window.localStorage.getItem("token"),
    },
  });

  events.on("connect", () => {
    console.log("Socket IO Connected", "events");
    events.emit("subscribe", { topics: topics });

  });

  events.on("disconnect", () => {
    console.log("Socket IO Disonnected", "events");
    events = null;
  });

  events.emit("subscribe", { topics: topics });

  return events;
}

function getSocket(topics) {
  let path = url.includes("/api") ? "/api/notification/socket.io" : "/socket.io/notifications"

  topicsGlobal = topics;
  if (!socket) {
    socket = io(url, {
      path: path,
      transports: ["websocket"],
      upgrade: false,
      query: {
        token: window.localStorage.getItem("token"),
      },
    });

    socket.on("connect", () => {
      console.log("Socket IO Connected");
      if (topicsGlobal.length)
        socket.emit("subscribe", { topics: topicsGlobal });
    });

    socket.on("disconnect", () => {
      console.log("Socket IO Disonnected");
      socket = null;
    });
  }

  socket.emit("subscribe", { topics: topicsGlobal });

  return socket;
}

export {
  monitoringSocket,
  controllingSocket,
  devicesSocket,
  eventsSocket,
  getSocket,
};
