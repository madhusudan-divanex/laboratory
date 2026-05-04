import React, { useEffect, useRef, useState } from "react";
import "./Template Css/labReport.css";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import html2pdf from "html2pdf.js";
import base_url from "../../../baseUrl";
import { getApiData } from "../../services/api";
import { calculateAge } from "../../services/globalFunction";

/**
 * DATA FLOW:
 *
 * API: GET /api/comman/lab-report/:appointmentId
 *
 * res = {
 *   appointmentData: LabAppointment,
 *   patientData:     Patient,
 *   labData:         Lab,
 *   testReports:     TestReport[]   ← ek per subCat
 * }
 *
 * Har TestReport mein:
 *   subCatId  (populated SubTestCat)
 *     .subCategory  → naam
 *     .component[]  → definitions { _id, name, unit, minRange, maxRange, title }
 *
 *   component[]  → actual results { cmpId, result, textResult, status }
 *     cmpId matches SubTestCat.component._id
 */

const LabReportPdf = ({ appointmentId, pdfLoading, endLoading }) => {
  const { id } = useParams();
  const [appointmentData, setAppointmentData] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [labData, setLabData] = useState(null);
  const [testReports, setTestReports] = useState([]);

  const invoiceRef = useRef();

  // ── Fetch ──────────────────────────────────────────────────────────────────
  async function fetchAllotmentDetail() {
    try {
      const res = await getApiData(
        `api/comman/lab-report/${appointmentId || id}`
      );
      if (res.success) {
        setAppointmentData(res.appointmentData);
        setPatientData(res.patientData);
        setLabData(res.labData);
        setTestReports(res.testReports || []);
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
        html2canvas: { scale: 2  ,useCORS: true,allowTaint: true},
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

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="report-wrapper d-flex justify-content-center bg-light py-4">
      <div className="report-a4 bg-white position-relative" ref={invoiceRef}>

        {/* WATERMARK */}
        <div className="watermark"></div>

        {/* ── HEADER ── */}
        <div className="d-flex justify-content-between p-4 border-bottom">
          <div className="d-flex gap-3">
            <div className="logo">
              <img src={labData?.logo ?
                `${base_url}/${labData?.logo}` : "/logo.png"} alt="" />
            </div>
            <div >
              <h5 className="fw-bold mb-1">Lab Report</h5>
              <div className="text-muted small">{labData?.name}</div>
              <div className="text-muted small">
                {[labData?.address, labData?.city?.name, labData?.state?.name, labData?.pinCode]
                  .filter(Boolean).join(", ")}
              </div>
            </div>
          </div>
          <div className="text-end">
            <span className="badge bg-teal px-3 py-2">NeoHealthCard Network</span>
            <div className="small text-muted mt-2">{labData?.email}</div>
            <div className="small text-muted">{labData?.contactNumber}</div>
          </div>
        </div>

        {/* ── META ── */}
        <div className="row g-3 px-4 py-3 border-bottom small text-muted">
          {/* <MetaCol title="Appointment ID"     value={`${appointmentData?.customId || "----"}`} /> */}
          <MetaCol title="Lab Order Ref" value={appointmentData?.customId} />
          <MetaCol
            title="Collected"
            value={appointmentData?.collectionDate
              ? new Date(appointmentData.collectionDate).toLocaleString("en-GB")
              : "—"}
          />
          <MetaCol
            title="Reported"
            value={appointmentData?.date
              ? new Date(appointmentData.date).toLocaleString("en-GB")
              : "—"}
          />
        </div>

        {/* ── PATIENT ── */}
        <div className="px-4 py-3 border-bottom">
          <h6 className="fw-semibold mb-2">{patientData?.name}</h6>
          <div className="row small text-muted">
            <div className="col">
              Age: {calculateAge(patientData?.dob, appointmentData?.createdAt)} / {patientData?.gender || '-'}
            </div>
            <div className="col">
              DOB: {patientData?.dob ? new Date(patientData.dob).toLocaleDateString("en-GB") : "—"}
            </div>
            <div className="col">Blood: {patientData?.bloodGroup || '-'}</div>
            <div className="col">Contact: {patientData?.contactNumber}</div>
          </div>
        </div>

        {/* ── DYNAMIC TEST REPORTS ── */}
        {testReports.length === 0 && (
          <div className="px-4 py-4 text-center text-muted small">
            No test reports available.
          </div>
        )}

        {testReports.map((report, rIdx) => {
          /*
           * report.subCatId  → populated SubTestCat document
           *   .subCategory   → heading naam
           *   .component[]   → parameter definitions
           *       ._id       → unique id
           *       .name      → parameter naam  (e.g. "Hemoglobin")
           *       .unit      → unit           (e.g. "g/dl")
           *       .minRange  → lower limit
           *       .maxRange  → upper limit
           *       .title     → optional section heading (e.g. "Blood Indices")
           *
           * report.component[]  → entered results
           *       .cmpId        → SubTestCat.component._id ka string
           *       .result       → numeric result string
           *       .textResult   → free-text result
           *       .status       → stored status (optional)
           */
          const subCat = report?.subCatId;
          const subCatName = subCat?.subCategory ?? `Test ${rIdx + 1}`;
          const definitions = subCat?.component ?? [];
          const results = report?.component ?? [];
          const upload = report?.upload;

          // cmpId → result object lookup
          const resultMap = {};
          results.forEach((r) => {
            if (r.cmpId) resultMap[r.cmpId] = r;
          });

          return (
            <div className="px-4 py-3 border-bottom" key={report?._id || rIdx}>

              {/* SubCategory name */}
              <h6 className="text-center text-muted small mb-3">{subCatName}</h6>

              {/* Uploaded report link (if any) */}
              {/* {upload?.report && (
                <div className="mb-2 small">
                  <span className="text-muted">Uploaded Report: </span>
                  <a href={upload.report} target="_blank" rel="noreferrer" className="text-teal">
                    {upload.name || "View Report"}
                  </a>
                  {upload.comment && (
                    <span className="text-muted ms-2">— {upload.comment}</span>
                  )}
                </div>
              )} */}

              <table className="table table-borderless report-table">
                <thead className="small text-muted border-bottom">
                  <tr>
                    <th>Test</th>
                    <th>Result</th>
                    <th>Reference Range</th>
                    {/* <th>Status</th> */}
                    <th>Unit</th>
                  </tr>
                </thead>

                <tbody>
                  {definitions.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted small py-2">
                        No parameters defined.
                      </td>
                    </tr>
                  )}

                  {definitions.map((cmp, cIdx) => {
                    const cmpIdStr = cmp._id?.toString();
                    const res = resultMap[cmpIdStr] || {};

                    // Display result value
                    const resultVal =
                      res.result !== undefined && res.result !== ""
                        ? res.result
                        : res.textResult || "—";

                    // Reference range string
                    const range =
                      cmp.optionType == "text"
                        ? `${cmp.minRange} – ${cmp.maxRange}`
                        : "Positve-Negative";

                    // Status: use stored → else compute from range
                    const status =
                      res.status ||
                      (cmp.minRange !== undefined && cmp.maxRange !== undefined && res.result
                        ? computeStatus(res.result, cmp.minRange, cmp.maxRange)
                        : "—");

                    // Section title row: show when cmp.title changes
                    const showTitle =
                      cmp.title &&
                      (cIdx === 0 || definitions[cIdx - 1]?.title !== cmp.title);

                    return (
                      <React.Fragment key={cmp._id || cIdx}>
                        {/* {showTitle && (
                          <tr>
                            <td colSpan="5" className="section-title">
                              {cmp.title}
                            </td>
                          </tr>
                        )} */}
                        <tr className="border-bottom">
                          <td>{cmp.name}</td>
                          <td>{resultVal}</td>
                          <td>{range}</td>
                          {/* <td style={statusStyle(status)}>{status}</td> */}
                          <td>{cmp.unit}</td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>

              {/* Remark */}
              {report?.remark && (
                <div className="small text-muted mt-1">
                  <strong>Remark:</strong> {report.remark}
                </div>
              )}
            </div>
          );
        })}

        {/* ── INSTRUCTIONS ── */}
        <div className="px-4 py-3">
          <div className="instruction-box">
            <div className="small fw-semibold text-muted mb-2">GENERAL INSTRUCTION</div>
            <ol className="small text-muted mb-2">
              <li>Please consult your doctor before making any medical decisions based on these results.</li>
              <li>Results are specific to the sample collected on the mentioned date.</li>
              <li>Clinical correlation is advised.</li>
              <li>Follow up as recommended by your physician.</li>
            </ol>
            <div className="small text-muted">
              Clinical correlation advised. Follow up in 3 days.
            </div>
          </div>
        </div>

        {/* ── SIGNATURES ── */}
        <div className="row border-top text-center small text-muted">
          <div className="col p-3 d-flex flex-column">
            <span> Lab Technician </span>
            <span>{labData?.name}</span>
            <span>{labData?.nh12}</span>
          </div>
          <div className="col p-3 border-start d-flex flex-column">
            <span> Lab Doctor </span>
            <span>{appointmentData?.staff?.name}</span>
            <span>{appointmentData?.staff?.nh12}</span></div>
          <div className="col p-3 border-start d-flex flex-column">
            <span> Patient </span>
            <span> {patientData?.name} </span>
            <span> {patientData?.nh12} </span>

          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="footer-bar text-white text-center py-2 small">
          Wishing you a speedy recovery
        </div>

      </div>
    </div>
  );
};

// ── Helper ────────────────────────────────────────────────────────────────────
const MetaCol = ({ title, value }) => (
  <div className="col">
    <div className="text-secondary">{title}</div>
    <div className="fw-medium text-dark">{value || "—"}</div>
  </div>
);

export default LabReportPdf;