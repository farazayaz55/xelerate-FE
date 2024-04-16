import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
//-------------EXTERNAL COMPONENTS--------//
import { store } from "app/store";
import App from "app";

ReactDOM.render(
  <Provider store={store}>
    <div
      style={{
        direction:
          window.localStorage.getItem("Language") == "ar" ? "rtl" : "ltr",
      }}
    >
      <App />
    </div>
  </Provider>,
  document.getElementById("root")
);
