import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import html2pdf from "html2pdf.js";
import { QRCodeCanvas } from "qrcode.react";
import base_url from "../../../baseUrl";
import { getApiData } from "../../services/api";
import { calculateAge } from "../../services/globalFunction";

// ─── Fonts & Bootstrap (CDN — no install needed) ─────────────────────────
const ExternalLinks = () => (
  <>
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
      rel="stylesheet"
    />
  </>
);



// ─── Lab tests data ───────────────────────────────────────────────────────
const tests = [
  {
    name: "Complete Blood Count (CBC)",
    panel: "Haematology",
    sample: "Blood (EDTA)",
    reason: "Anemia workup · fever",
  },
  {
    name: "Peripheral Blood Smear",
    panel: "Haematology",
    sample: "Blood (EDTA)",
    reason: "Anemia morphology",
  },
  {
    name: "Serum Iron + TIBC + Ferritin",
    panel: "Iron Studies",
    sample: "Blood (Plain)",
    reason: "Iron deficiency eval",
  },
  {
    name: "Vitamin B12 + Folate",
    panel: "Vitamins",
    sample: "Blood (Plain)",
    reason: "Nutritional anemia",
  },
];

// ─── Component ────────────────────────────────────────────────────────────
export default function LabTestOrder({ appointmentId, pdfLoading, endLoading }) {
  const { id } = useParams();
  const [appointmentData, setAppointmentData] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [labData, setLabData] = useState(null);
  const [orgData, setOrgData] = useState();

  const invoiceRef = useRef();

  // ── Fetch ──────────────────────────────────────────────────────────────────
  async function fetchAllotmentDetail() {
    try {
      const res = await getApiData(
        `api/comman/lab-order/${appointmentId || id}`
      );
      if (res.success) {
        setAppointmentData(res.orderData);
        setPatientData(res.ptData);
        setLabData(res.orgData);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  }

  useEffect(() => {
    if (id || appointmentId) fetchAllotmentDetail();
  }, [id, appointmentId]);

  // ── PDF Download ───────────────────────────────────────────────────────────
  const handleDownload = () => {
    try {
      const element = invoiceRef.current;
      document.body.classList.add("hide-buttons");
      const opt = {
        margin: 0,
        filename: `LabReport-${appointmentData?.customId}.pdf`,
        html2canvas: { scale: 2, useCORS: true, allowTaint: true },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      };
      html2pdf()
        .from(element)
        .set(opt)
        .save()
        .then(() => document.body.classList.remove("hide-buttons"));
    } catch (_) {
    } finally {
      if (pdfLoading) endLoading();
    }
  };

  useEffect(() => {
    if (appointmentData && patientData && labData && pdfLoading) {
      const timer = setTimeout(handleDownload, 1500);
      return () => clearTimeout(timer);
    }
  }, [appointmentData, patientData, labData, pdfLoading]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const statusStyle = (status) => {
    if (!status) return {};
    const s = status.toLowerCase();
    if (s === "high") return { color: "#dc2626", fontWeight: 600 };
    if (s === "low") return { color: "#d97706", fontWeight: 600 };
    if (s === "normal") return { color: "#16a34a" };
    return {};
  };

  const computeStatus = (resultStr, minRange, maxRange) => {
    const num = parseFloat(resultStr);
    if (isNaN(num)) return "—";
    if (num < minRange) return "Low";
    if (num > maxRange) return "High";
    return "Normal";
  };

  return (
    <>
      <ExternalLinks />

      <style>{`
        /* ── Reset / base ── */
        .lto * { font-family: 'Inter', sans-serif; box-sizing: border-box; }

        /* ── Page background ── */
        .lto-page { background: #f4f6f7; min-height: 100vh; padding: 32px 16px; }

        /* ── Card ── */
        .lto-card {
          background: #fff;
          border: 1px solid #c8c8c8;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 2px 18px rgba(0,0,0,0.10);
          max-width: 880px;
          margin: 0 auto;
        }

        /* ── Header ── */
        .lto-header { padding: 17px 24px 13px; border-bottom: 1px solid #e0e0e0; }
        .lto-logo {
          width: 40px; height: 40px; border-radius: 50%;
          // background: linear-gradient(140deg, #1b90c8, #1fcdd8);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .lto-h-title   { font-size: 19px;   font-weight: 700; color: #111; letter-spacing: -0.3px; line-height: 1; }
        .lto-h-name    { font-size: 12.5px; font-weight: 600; color: #222; margin-top: 2px; }
        .lto-h-addr    { font-size: 10px;   color: #666; margin-top: 3px; line-height: 1.6; }
        .lto-badge {
          border: 1.5px solid #1ecece; color: #1ecece;
          border-radius: 30px; padding: 3px 10px;
          font-size: 9.5px; font-weight: 600;
          display: inline-flex; align-items: center; gap: 5px;
        }
        .lto-eco { font-size: 9.5px; color: #1aab5f; display: flex; align-items: center; gap: 4px; }
        .lto-eco::before { content: "●"; font-size: 6px; }
        .lto-h-contact { font-size: 10px; color: #555; margin-top: 2px; }

        /* ── Meta strip ── */
        .lto-meta { background: #f7f7f7; border-bottom: 1px solid #e0e0e0; display: flex; }
        .lto-mc { padding: 9px 18px; border-right: 1px solid #e0e0e0; flex: 1; }
        .lto-mc:last-child { border-right: none; }
        .lto-mc.wide { flex: 2.5; }
        .lto-ml { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: .9px; color: #aaa; margin-bottom: 3px; }
        .lto-mv { font-size: 11.5px; font-weight: 500; color: #111; }
        .lto-mv.mono { font-family: 'Courier New', monospace; font-size: 11px; }
        .lto-mv.urgent { font-weight: 700; color: #d0021b; }

        /* ── Patient section ── */
        .lto-patient { padding: 15px 24px 16px; border-bottom: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
        .lto-pt-sec-lbl { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: .9px; color: #aaa; margin-bottom: 5px; }
        .lto-pt-name    { font-size: 22px; font-weight: 700; color: #111; letter-spacing: -.4px; margin-bottom: 10px; line-height: 1; }
        .lto-pt-grid    { display: grid; grid-template-columns: 128px 1fr 148px 1fr; row-gap: 5px; }
        .lto-pt-l  { font-size: 10.5px; color: #777; }
        .lto-pt-v  { font-size: 10.5px; color: #111; font-weight: 500; }
        .lto-pt-v.mono { font-family: 'Courier New', monospace; font-size: 10px; }
        .lto-qr-wrap { border: 1px solid #ddd; border-radius: 4px; padding: 2px;background: #fff; flex-shrink: 0; }
        .lto-scan { font-size: 8.5px; color: #1ecece; text-align: right; margin-top: 5px; line-height: 1.6; }

        /* ── Tests table ── */
        .lto-tbl-wrap { padding: 0 24px; }
        .lto-tbl-title {
          text-align: center; font-size: 8.5px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 1.8px; color: #888;
          padding: 10px 0 7px;
        }
        .lto-tbl { width: 100%; border-collapse: collapse; }
        .lto-tbl thead tr { background: #f2f2f2; }
        .lto-tbl th {
          font-size: 8px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .8px; color: #666;
          padding: 8px 11px; text-align: left;
          border-bottom: 1.5px solid #ddd;
        }
        .lto-tbl tbody tr { border-bottom: 1px solid #efefef; }
        .lto-tbl tbody tr:last-child { border-bottom: none; }
        .lto-tbl td { font-size: 11.5px; color: #222; padding: 8.5px 11px; vertical-align: middle; }

        /* ── Clinical notes ── */
        .lto-notes {
          margin: 12px 24px 14px;
          border: 1px solid #e0e0e0; border-radius: 5px;
          padding: 11px 16px; background: #fafafa;
        }
        .lto-notes-title { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: .9px; color: #aaa; margin-bottom: 8px; }
        .lto-notes-body  { font-size: 11.5px; color: #333; line-height: 1.65; }

        /* ── Signatures ── */
        .lto-sig-row { display: flex; border-top: 1px solid #e0e0e0; margin: 0 24px; }
        .lto-sig-blk { flex: 1; padding: 14px 0; text-align: center; }
        .lto-sig-blk:first-child { border-right: 1px solid #e0e0e0; }
        .lto-sig-name { font-size: 12.5px; font-weight: 700; color: #111; }
        .lto-sig-role { font-size: 10px;   color: #555; margin-top: 2px; }
        .lto-sig-id   { font-size: 9px;    color: #1ecece; margin-top: 3px; font-family: 'Courier New', monospace; }

        /* ── Footer bar ── */
        .lto-footer {
          background: #1ecece;
          display: flex; justify-content: space-between; align-items: center;
          padding: 9px 24px; margin-top: 14px;
        }
        .lto-footer span { font-size: 10px; color: #fff; }
        .lto-tagline { font-style: italic; }
      `}</style>

      <div className="lto lto-page" ref={invoiceRef}>
        <div className="lto-card">

          {/* ── HEADER ── */}
          <div className="lto-header d-flex justify-content-between align-items-start">
            <div className="d-flex align-items-start gap-3">
              <div className="lto-logo">
                <img src={labData?.logo ?
                  `${base_url}/${labData?.logo}` : "/logo.png"} alt=""
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/logo.png";
                  }} />
              </div>
              <div>
                <div className="lto-h-title">Lab Test Order</div>
                <div className="lto-h-name">{appointmentData?.labId?.name}</div>
                <div className="lto-h-addr">
                  {appointmentData?.labId?.nh12} <br />
                  {labData?.address}
                </div>
              </div>
            </div>
            <div className="text-end">
              <div className="mb-1">
                <span className="lto-badge">
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="#1ecece">
                    <polygon points="5,0.5 6.2,3.5 9.5,3.8 7.2,6 7.9,9.5 5,7.8 2.1,9.5 2.8,6 0.5,3.8 3.8,3.5" />
                  </svg>
                  NeoHealthCard Network
                </span>
              </div>
              <div className="d-flex gap-3 justify-content-end mb-1">
                <span className="lto-eco">Fully Automated</span>
                <span className="lto-eco">Ecosystem Connected</span>
              </div>
              <div className="lto-h-contact">{appointmentData?.labId?.email} · {appointmentData?.labId?.contactNumber}</div>
            </div>
          </div>

          {/* ── META STRIP ── */}
          <div className="lto-meta">
            <div className="lto-mc">
              <div className="lto-ml">Lab ID</div>
              <div className="lto-mv mono">{appointmentData?.labId?.nh12}</div>
            </div>
            <div className="lto-mc">
              <div className="lto-ml">Date &amp; Time</div>
              <div className="lto-mv">{new Date(appointmentData?.date)?.toLocaleString('en-GB')}</div>
            </div>
            {/* <div className="lto-mc">
              <div className="lto-ml">Urgency</div>
              <div className="lto-mv urgent">Urgent</div>
            </div> */}
            <div className="lto-mc wide">
              <div className="lto-ml">Report To</div>
              <div className="lto-mv">{appointmentData?.labId?.name} · {appointmentData?.labId?.nh12}</div>
            </div>
          </div>

          {/* ── PATIENT ── */}
          <div className="lto-patient">
            <div className="flex-fill">
              <div className="lto-pt-sec-lbl">Patient</div>
              <div className="lto-pt-name">{appointmentData?.patientId?.name}</div>
              <div className="lto-pt-grid">
                <span className="lto-pt-l">Age / Sex</span>      <span className="lto-pt-v">{calculateAge(patientData?.dob, appointmentData?.createdAt)}/ {patientData?.gender}</span>
                <span className="lto-pt-l">Email Address</span>   <span className="lto-pt-v">{appointmentData?.patientId?.email}</span>

                <span className="lto-pt-l">DOB</span>             <span className="lto-pt-v">{new Date(patientData?.dob)?.toLocaleDateString('en-GB')}</span>
                <span className="lto-pt-l">Address</span>         <span className="lto-pt-v">{patientData?.fullAddress}</span>

                <span className="lto-pt-l">Blood</span>           <span className="lto-pt-v">{patientData?.bloodGroup}</span>
                <span className="lto-pt-l">Patient ID</span>      <span className="lto-pt-v mono">{appointmentData?.patientId?.nh12}</span>

                <span className="lto-pt-l">Contact no</span>      <span className="lto-pt-v">{appointmentData?.patientId?.contactNumber}</span>
                <span className="lto-pt-l">Dr Name</span>         <span className="lto-pt-v">{appointmentData?.staff?.name}</span>

                <span className="lto-pt-l"></span>                 <span className="lto-pt-v"></span>
                <span className="lto-pt-l">Dr ID</span>           <span className="lto-pt-v mono">{appointmentData?.staff?.nh12}</span>
              </div>
            </div>
            <div>
              <div className="lto-qr-wrap" style={{ width: '74px', height: '74px' }}>
                <QRCodeCanvas
                  value={`https://www.neohealthcard.com/lab-order/${appointmentData?.customId}`}
                  size={256}
                  // className="qr-code"
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                />
              </div>
              <div className="lto-scan">Scan to verify<br />verify.neohealthcard.in</div>
            </div>
          </div>

          {/* ── TESTS TABLE ── */}
          <div className="lto-tbl-wrap">
            <div className="lto-tbl-title">Tests Ordered</div>
            <table className="lto-tbl">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Panel / Group</th>
                  <th>Sample Type</th>
                  <th>Code</th>
                </tr>
              </thead>
              <tbody>
                {appointmentData?.subCatId.map((sub, i) => (
                  <tr key={i}>
                    <td>{sub?.subCategory}</td>
                    <td>{sub?.category?.name}</td>
                    <td>{sub?.sample?.map(s=>s?.type).join(', ')}</td>
                    <td>{sub.code}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── CLINICAL NOTES ── */}
          <div className="lto-notes">
            <div className="lto-notes-title">Clinical Notes for Lab</div>
            <div className="lto-notes-body">
              Patient presenting with 3-week history of fever (103°F), weight loss (32kg underweight),
              and CBC showing Hb 8.5 g/dl. Requesting urgent panel to rule out infectious cause of fever
              and investigate anemia aetiology. Please report all values with reference ranges. Contact
              ordering doctor immediately if any critical values found.
            </div>
          </div>

          {/* ── SIGNATURES ── */}
          <div className="lto-sig-row">
            <div className="lto-sig-blk">
              <div className="lto-sig-name">{appointmentData?.staff?.name}</div>
              <div className="lto-sig-role">{appointmentData?.staff?.n12}</div>
              <div className="lto-sig-id">{appointmentData?.staff?.contactNumber}</div>
            </div>
            <div className="lto-sig-blk">
              <div className="lto-sig-name">{appointmentData?.labId?.name}</div>
              <div className="lto-sig-role">Accepted &amp; Registered</div>
              <div className="lto-sig-id">{appointmentData?.labId?.nh12}</div>
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div className="lto-footer">
            <span>{appointmentData?.labId?.name}, {labData?.address} · {appointmentData?.labId?.email} · {appointmentData?.labId?.contactNumber}</span>
            <span className="lto-tagline">Wishing you a speedy recovery</span>
          </div>

        </div>
      </div>
    </>
  );
}
