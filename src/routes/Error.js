import React from "react";
// import Background from "../assets/img/404.jpg";

var sectionStyle = {
  // backgroundImage: `url(${Background})`,
  backgroundSize: "cover",
};

export default function Error() {
  return (
    <section>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          flexDirection: "column",
          backgroundColor: "#3399ff",
        }}
      >
        <h1
          style={{
            color: "white",
            fontSize: "40px",
          }}
        >
          Error 404 page not found.
        </h1>
      </div>
    </section>
  );
}
