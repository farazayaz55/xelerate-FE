//----------------CORE-----------------//
import React, { useRef } from "react";
import clsx from "clsx";
import { useSnackbar } from "notistack";
import { jsPDF } from "jspdf";
import * as html2canvas from "html2canvas";
import { useSelector } from "react-redux";
//----------------MUI-----------------//
import { makeStyles, withStyles } from "@mui/styles";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepConnector from "@mui/material/StepConnector";
import Card from "@mui/material/Card";
//----------------MUI ICONS-----------------//
import SummarizeIcon from "@mui/icons-material/Summarize";
import DoneOutlineIcon from "@mui/icons-material/DoneOutline";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SavingsIcon from "@mui/icons-material/Savings";
import BusinessIcon from "@mui/icons-material/Business";
//----------------EXTERNAL-----------------//
import Logo from "assets/img/sideLogo.png";
import Details from "./Details";
import Solution from "./Solution";
import CostSavings from "./Cost Savings";
import Investments from "./Investments";
import Summary from "./Summary";
import Result from "./Result";

const useStyles = makeStyles(() => ({
  root: {
    width: "100%",
  },
}));

export default function Roi() {
  const { enqueueSnackbar } = useSnackbar();
  const metaDataValue = useSelector((state) => state.metaData);
  const wizardPage = useSelector((state) => state.roiWizard);
  const roiFormValue = useSelector((state) => state.roiForm);
  const classes = useStyles();
  const [summaryPdf, setSummartPdf] = React.useState(null);
  const mainStepper = useRef(null);
  function getSteps() {
    return [
      "Details",
      "Solution",
      `Cost Savings (${roiFormValue.currency ?? "£"})`,
      `Investments (${roiFormValue.currency ?? "£"})`,
      "Summary",
      "Result",
    ];
  }

  const ColorlibConnector = withStyles({
    alternativeLabel: {
      top: 22,
    },
    active: {
      "& $line": {
        backgroundColor: metaDataValue.branding.secondaryColor,
      },
    },
    completed: {
      "& $line": {
        backgroundColor: metaDataValue.branding.secondaryColor,
      },
    },
    line: {
      height: 3,
      border: 0,
      marginTop: "10px",
      backgroundColor: "#eaeaf0",
      borderRadius: 1,
    },
  })(StepConnector);

  const useColorlibStepIconStyles = makeStyles(() => ({
    root: {
      backgroundColor: "#ccc",
      zIndex: 1,
      color: "#fff",
      width: 50,
      height: 50,
      display: "flex",
      borderRadius: "50%",
      justifyContent: "center",
      alignItems: "center",
    },
    active: {
      backgroundColor: metaDataValue.branding.secondaryColor,
      boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
    },
    completed: {
      backgroundColor: metaDataValue.branding.secondaryColor,
    },
  }));

  function ColorlibStepIcon(props) {
    const classes = useColorlibStepIconStyles();
    const { active, completed } = props;

    const icons = {
      1: <FormatAlignJustifyIcon />,
      2: <DashboardIcon />,
      3: <SavingsIcon />,
      4: <BusinessIcon />,
      5: <SummarizeIcon />,
      6: <DoneOutlineIcon />,
    };

    return (
      <div
        className={clsx(classes.root, {
          [classes.active]: active,
          [classes.completed]: completed,
        })}
      >
        {icons[String(props.icon)]}
      </div>
    );
  }

  const steps = getSteps();

  function getStepContent(step) {
    switch (step) {
      case 0:
        return <Details />;
      case 1:
        return <Solution />;
      case 2:
        return <CostSavings />;
      case 3:
        return <Investments />;
      case 4:
        return <Summary generateSummaryPDF={generateSummaryPDF} />;
      case 5:
        return <Result generatePDF={generatePDF} />;
      default:
        return null;
    }
  }

  async function generatePDF() {
    const input = document.getElementById("pdf");
    document.getElementById("result-pdf").style.overflow = "inherit";
    document.getElementById("result-btns").style.display = "none";
    let canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");
    document.getElementById("result-pdf").style.overflow = "scroll";
    document.getElementById("result-btns").style.display = "flex";
    const pdf = new jsPDF();
    // pdf.addJS(`Xelerate - ROI Tool - ${name}`)
    var width = pdf.internal.pageSize.getWidth();
    var height = pdf.internal.pageSize.getHeight();
    pdf.addImage(metaDataValue.branding?.logo || Logo, "JPEG", 85, 10, 40, 10);
    pdf.text(`Xelerate - ROI Tool - ${roiFormValue.name}`, width / 2, 30, {
      align: "center",
    });
    pdf.addImage(imgData, "JPEG", 17, 33, 200, 100);
    pdf.addImage(summaryPdf, "JPEG", 0, 170, 200, 80);
    // pdf.text(150,285, `Powered by Invixible`);
    // pdf.text(150,290, `www.invixible.com`);
    pdf.setFontSize(10);
    //   pdf.text('© Powered by Invixible', 5, height - 18, {
    //     styles: { fontSize: 5 },
    // });
    pdf.addImage(Logo, "PNG", 5, height - 26, 37, 8);
    pdf.text("© Powered by Invixible", 5, height - 12, {
      styles: { fontSize: 5 },
    });
    pdf.text("   www.invixible.com", 5, height - 7, {
      styles: { fontSize: 5 },
    });
    var blobPDF = new Blob([pdf.output("blob")], { type: "application/pdf" });
    return blobPDF;
  }

  async function generateSummaryPDF() {
    const input = document.getElementById("pdf");
    let canvas = await html2canvas(input);
    const summaryData = canvas.toDataURL("image/png");
    setSummartPdf(summaryData);
  }

  return (
    <div style={{ height: "100%" }}>
      <Card style={{ height: "100%" }}>
        <div ref={mainStepper} className={classes.root}>
          <Stepper
            alternativeLabel
            activeStep={wizardPage}
            connector={<ColorlibConnector />}
            style={{ margin: "40px" }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel StepIconComponent={ColorlibStepIcon}>
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          <div>
            <div id="pdf">{getStepContent(wizardPage)}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
