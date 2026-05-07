import React, { useEffect, useRef, useState } from "react";
import "./Template Css/labReport.css";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import html2pdf from "html2pdf.js";
import base_url from "../../../baseUrl";
import { getApiData } from "../../services/api";
import { calculateAge } from "../../services/globalFunction";
import { QRCodeCanvas } from "qrcode.react";

const LabInvoice = ({ appointmentId, pdfLoading, endLoading }) => {
  const { id } = useParams();
  const [appointmentData, setAppointmentData] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [labData, setLabData] = useState(null);
  const [labPayment, setPaymentData] = useState([]);

  const invoiceRef = useRef();

  // ── Fetch ──────────────────────────────────────────────────────────────────
  async function fetchAllotmentDetail() {
    if(!appointmentId){
      return
    }
    try {
      const res = await getApiData(
        `api/comman/lab-invoice/${appointmentId || id}`
      );
      if (res.success) {
        setAppointmentData(res.appointmentData);
        setPatientData(res.patientData);
        setLabData(res.labData);
        setPaymentData(res.labPayment || []);
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
        filename: `LabInvoice-${labPayment?.customId}.pdf`,
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
  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  return (
    <div ref={invoiceRef} style={{ background: "#f4f6f8", padding: "24px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ width: "794x", margin: "0 auto", background: "#fff", border: "1px solid #e5e7eb" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid #e5e7eb" }}>
          <div className="d-flex align-items-center gap-2">
            <div style={{width:'40px',height:'40px'}}>
                <img src={labData?.logo ?
                  `${base_url}/${labData?.logo}` : "/logo.png"} alt="" />
              </div>
            <div>
              <div style={{ fontSize: "22px", fontWeight: 600 }}>Lab Invoice</div>
              <div style={{ fontSize: "12px" }}>{labData?.name}</div>
              <div style={{ fontSize: "11px", color: "#6b7280" }}>
                {labData?.nh12}
              </div>
              <div style={{ fontSize: "11px", color: "#6b7280" }}>
                {[labData?.address, labData?.city?.name, labData?.state?.name, labData?.pinCode]
                  .filter(Boolean).join(", ")}
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ border: "1px solid #0ea5a4", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", color: "#0ea5a4" }}>
              NeoHealthCard Network
            </div>
            <div style={{ fontSize: "11px", color: "#6b7280" }}>
              Fully Automated · Ecosystem Connected
            </div>
            <div style={{ fontSize: "11px", color: "#6b7280" }}>
              {labData?.email} · {labData?.contactNumber}
            </div>
          </div>
        </div>

        {/* META */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderBottom: "1px solid #e5e7eb" }}>
          {[
            ["INVOICE ID", labPayment?.customId],
            ["LAB ORDER REF", appointmentData?.customId],
            // ["REPORT REF", "NHC-OPD-2026-0412-00022"],
            ["DATE", new Date(labPayment?.createdAt)?.toLocaleDateString('en-GB')],
            ["STATUS", capitalize(appointmentData?.paymentStatus)]
          ].map((item, i) => (
            <div key={i} style={{ padding: "10px 14px", borderRight: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: "10px", color: "#6b7280" }}>{item[0]}</div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: item[0] === "STATUS" ? "#0ea5a4" : "#111827" }}>
                {item[1]}
              </div>
            </div>
          ))}
        </div>

        {/* PATIENT */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>Vijay Kumar</div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", fontSize: "12px", rowGap: "6px" }}>
              <div>Age / Sex: {calculateAge(patientData?.dob, appointmentData?.createdAt)} / {patientData?.gender || '-'}</div>
              <div>Email Address: {patientData?.email}</div>
              <div>Patient ID: {patientData?.nh12}</div>

              <div>DOB: {patientData?.dob ? new Date(patientData.dob).toLocaleDateString("en-GB") : "—"}</div>
              <div>Address: {patientData?.address}</div>
              <div>Attending Doctor: {appointmentData?.staff?.name}</div>

              <div>Blood: {patientData?.bloodGroup}</div>
              <div>Contact no: {patientData?.contactNumber}</div>
              <div>Lab: {labData?.name}</div>
            </div>
          </div>

          <div style={{ width: "120px", textAlign: "center" }}>
            <div style={{ width: "90px", height: "90px", border: "1px solid #d1d5db", margin: "0 auto" }} >
              <QRCodeCanvas
                value={`https://www.neohealthcard.com/lab-invoice/${appointmentData?.customId}`}
                size={256}
                // className="qr-code"
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
            </div>
            <div style={{ fontSize: "10px" }}>Scan to verify</div>
            <div style={{ fontSize: "10px", color: "#0ea5a4" }}>verify.neohealthcard.in</div>
          </div>
        </div>

        {/* TABLE */}
        <div style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "11px", marginBottom: "6px", color: "#6b7280" }}>TEST CHARGES</div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                {["TEST NAME", "SAC CODE", "AMOUNT"].map((h, i) => (
                  <th key={i} style={{ border: "1px solid #e5e7eb", padding: "8px", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointmentData?.tests.map((test, i) => (
                <>
                  <tr key={i}>
                    <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>{test?.category?.name}</td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>{test?.subCatId?.code}</td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "8px" }}>{test?.categoryPrice}</td>
                  </tr>
                  {test?.subCat?.map((cell, j) => (
                    <tr key={i} >
                      <td key={j} style={{ border: "1px solid #e5e7eb", padding: "8px", paddingLeft: '20px' }}>{cell?.subCatId?.subCategory}</td>
                      <td key={j} style={{ border: "1px solid #e5e7eb", padding: "8px" }}>{cell?.subCatId?.code}</td>
                      <td key={j} style={{ border: "1px solid #e5e7eb", padding: "8px" }}>{test?.categoryPrice ? '' : cell?.subCatPrice}</td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>

          {/* TOTALS */}
          {(() => {
            // ✅ subTotal calculate karo
            const subTotal = appointmentData?.tests?.reduce((sum, testEntry) => {
              if (testEntry?.categoryPrice) return sum + (testEntry.categoryPrice || 0)
              return sum + (testEntry?.subCat?.reduce((s, sub) => s + (sub?.subCatPrice || 0), 0) || 0)
            }, 0) || 0

            const discount = Number(labPayment?.discount || 0)
            const taxes = Number(labPayment?.taxes || 0)

            const discountAmount = (subTotal * discount) / 100
            const afterDiscount = subTotal - discountAmount
            const taxAmount = (afterDiscount * taxes) / 100
            const grandTotal = Math.round((afterDiscount + taxAmount) * 100) / 100

            return (
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                <div style={{ width: "280px", fontSize: "12px" }}>

                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span>Sub Total</span>
                    <span>₹ {subTotal.toFixed(2)}</span>
                  </div>

                  {discount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span>Discount ({discount}%)</span>
                      <span>- ₹ {discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {taxes > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span>GST ({taxes}%)</span>
                      <span>+ ₹ {taxAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    fontWeight: 600, marginTop: "8px",
                    borderTop: "1px solid #e5e7eb", paddingTop: "6px"
                  }}>
                    <span>Grand Total</span>
                    <span>₹ {grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>

        {/* PAYMENT */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ padding: "14px" }}>
            <div style={{ fontSize: "11px", color: "#6b7280" }}>Payment Mode</div>
            <div style={{ fontSize: "12px" }}>{labPayment?.paymentType}</div>
          </div>
          <div style={{ padding: "14px" }}>
            <div style={{ fontSize: "11px", color: "#6b7280" }}>Transaction ID</div>
            <div style={{ fontSize: "12px" }}>{labPayment?.customId}</div>
          </div>
          <div style={{ padding: "14px" }}>
            <div style={{ fontSize: "11px", color: "#6b7280" }}>Status</div>
            <div style={{ fontSize: "12px", textTransform: 'capitalize' }}>{appointmentData?.paymentStatus}</div>
          </div>
        </div>

        {/* NOTES */}
        <div style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "11px", marginBottom: "6px", color: "#6b7280" }}>LAB TERMS</div>
          <ol style={{ fontSize: "12px", marginLeft: "16px" }}>
            <li>Reports will be available on NeoHealthCard app as soon as processed.</li>
            <li>Critical values will be immediately communicated to ordering doctor.</li>
            <li>Sample storage: 72 hours post-reporting for repeat testing if required.</li>
            <li>Disputes regarding results must be raised within 7 days of report date.</li>
          </ol>
        </div>

        {/* FOOTER */}
        <div style={{ background: "#0ea5a4", color: "#fff", fontSize: "11px", padding: "8px 14px", display: "flex", justifyContent: "space-between" }}>
          <span>Apollo General Hospital, Mumbai · {labData?.email} · {labData?.contactNumber}</span>
          <span>Wishing you a speedy recovery</span>
        </div>

      </div>
    </div>
  );
};

export default LabInvoice;