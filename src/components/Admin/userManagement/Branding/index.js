//------------CORE------------//
import React from "react";
//-------------MUI-----------//
import InvixibleLogo from "assets/img/sideLogo.png";
import Keys from "Keys";

export default function BrandingCard({ elm }) {
  return (
    <div>
      <p
        style={{
          fontSize: "18px",
          fontWeight: "600",
          userSelect: "none",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          color: "grey",
          margin: "0px 70px",
        }}
      >
        {elm ? elm.name : "Default"}
      </p>
      <div
        style={{
          position: "relative",
          top: "15px",
          display: "flex",
          alignItems: "center",
          fontSize: "12px",
          color: "gray",
          gap: "5px",
          margin: "0px 70px",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          <p>Primary: </p>
          <div
            style={{
              borderRadius: "50%",
              background: elm ? elm.primaryColor : "#3399ff",
              minHeight: "15px",
              width: "15px",
              height: "15px",
              minWidth: "15px",
              marginLeft: "10px",
            }}
          />
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          <p>Logo: </p>
          <div
            style={{
              height: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              objectFit: "cover",
            }}
          >
            <img
              src={
                elm?.logoPath
                  ? elm.logoPath
                  : Keys?.logo
                  ? Keys.logo
                  : InvixibleLogo
              }
              style={{ maxHeight: "80%", maxWidth: "80%" }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          top: "15px",
          display: "flex",
          alignItems: "center",
          fontSize: "12px",
          color: "gray",
          gap: "5px",
          margin: "0px 70px",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          <p>Secondary: </p>
          <div
            style={{
              borderRadius: "50%",
              background: elm ? elm.secondaryColor : "#607d8b",
              minHeight: "15px",
              width: "15px",
              height: "15px",
              minWidth: "15px",
              marginLeft: "10px",
            }}
          />
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          <p>Font: </p>
          <p
            style={{
              fontWeight: "bold",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginLeft: "10px",
            }}
          >
            {elm ? elm.font?.friendlyName : "Open Sans"}
          </p>
        </div>
      </div>
    </div>
  );
}
