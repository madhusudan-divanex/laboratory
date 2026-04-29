import { faDownload } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useRef, useState } from "react"
import { getSecureApiData, securePostData } from "../../services/api"
import { toast } from "react-toastify"
import { NavLink, useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import html2canvas from "html2canvas"
import html2pdf from "html2pdf.js"
import NeoHealthCardLabTemplates from "./Billing"
import Loader from "../Layouts/Loader"


function NewInvoice() {
  const params = useParams()
  const invoiceRef = useRef(null);
  const appointmentId = params.id
  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(null)
  const { profiles, labPerson, labAddress, labImg,
    rating, avgRating, labLicense, isRequest } = useSelector(state => state.user)
  const [appointmentData, setAppointmentData] = useState({})
  const [formData, setFormData] = useState({ discount: null, subTotal: null, total: null, taxes: null, paymentType: null })
  const [showDownload, setShowDownload] = useState(false);
  const fetchAppointmentData = async () => {
    setLoading(true)
    try {
      const response = await getSecureApiData(`lab/appointment-data/${appointmentId}`)
      if (response.success) {
        setAppointmentData(response.data)
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (appointmentId) {

      fetchAppointmentData()
    }
  }, [appointmentId])
  // Calculate subtotal, GST and total
  const subtotal = appointmentData?.testData
    ?.reduce((acc, item) => acc + Number(item?.fees || 0), 0) || 0;

  const gst = subtotal * 0.05;
  const total = subtotal + gst;
  const handleReportDownload = (appointmentId) => {
    setPdfLoading(true)
    // setSelectedReport({ appointmentId });
    setShowDownload(true);
  };
  useEffect(() => {
    if (appointmentData) {
      if (appointmentData?.invoiceId) {
        const data = appointmentData?.invoiceId
        setFormData({
          ...formData, subTotal: data?.subTotal, discount: data?.discount, total: data?.total,
          taxes: data?.taxes, paymentType: data?.paymentType
        })
      } else {

        const sub = appointmentData?.testData
          ?.reduce((acc, item) => acc + Number(item?.fees || 0), 0) || 0;
        setFormData({ ...formData, subTotal: sub, total: sub })
      }
    }
  }, [appointmentData])
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }
  useEffect(() => {
    const subTotal = Number(formData.subTotal || 0);
    const discount = Number(formData.discount || 0);
    const tax = Number(formData.taxes || 0);

    // Calculate discount amount
    const discountAmount = (subTotal * discount) / 100;

    // Price after discount
    const discountedPrice = subTotal - discountAmount;

    // GST amount
    const taxAmount = (discountedPrice * tax) / 100;

    // Final total
    const total = discountedPrice + taxAmount;

    setFormData((prev) => ({
      ...prev,
      total: total.toFixed(2), // optional rounding
    }));
  }, [formData.subTotal, formData.discount, formData.taxes]);

  const billSubmit = async () => {
    if (!formData?.paymentType) {
      return toast.error("Please select payment type")
    }
    setLoading(true)
    const data = { ...formData, patientId: appointmentData?.patientId?._id, appointmentId: appointmentData?._id }
    try {
      const res = await securePostData('lab/payment', data)
      if (res.success) {
        toast.success("Payment created successfully")
        fetchAppointmentData()
      } else {
        toast.error(res?.message)
      }
    } catch (error) {
      toast.error(error?.response?.data?.message)
    } finally{
      setLoading(false)
    }
  }
  return (
    <>
      {loading ? <Loader />
        : <div className="main-content flex-grow-1 p-3 overflow-auto" >
          <form action="">
            <div className="row mb-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h3 className="innr-title">Invoices</h3>
                  <div className="admin-breadcrumb">
                    <nav aria-label="breadcrumb">
                      <ol class="breadcrumb custom-breadcrumb">
                        <li className="breadcrumb-item">
                          <NavLink to="/dashboard" className="breadcrumb-link">
                            Dashboard
                          </NavLink>
                        </li>
                        <li
                          className="breadcrumb-item active"
                          aria-current="page"
                        >
                          Invoices
                        </li>
                      </ol>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </form>
          <div className="submega-main-bx">
            <div className="row">
              <div className="col-lg-12 col-md-12 col-sm-12 mb-3" >
                <div className="new-invoice-card">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <h5 className="first_para fw-700 fz-20 mb-0">Invoice</h5>
                    </div>
                    {appointmentData?.invoiceId &&<div>
                      <button className="print-btn no-print" onClick={handleReportDownload}> <FontAwesomeIcon icon={faDownload} /> Download PDF</button>
                    </div>}
                  </div>

                  <div className="laboratory-header mb-4">
                    <div className="laboratory-name">
                      <h5>{profiles?.name || 'Advance Lab Tech'}</h5>
                      <p><span className="laboratory-title">GSTIN :</span> {profiles?.gstNumber || '09897886454'}</p>
                    </div>
                    {appointmentData?.invoiceId && <div className="invoice-details">
                      <p><span className="laboratory-invoice">Invoice :</span> {appointmentData?.invoiceId?.customId}</p>
                      <p><span className="laboratory-invoice">Date :</span>{"  "}{new Date(appointmentData?.invoiceId?.createdAt).toLocaleDateString('en-GB')}</p>
                    </div>}
                  </div>

                  <div className="laboratory-bill-crd">
                    <div className="laboratory-bill-bx">
                      <h6>Bill To</h6>
                      <h4>{appointmentData?.patientId?.name}</h4>
                      <p><span className="laboratory-phne">Phone :</span> {appointmentData?.patientId?.patientId?.contactNumber}</p>
                    </div>
                    <div className="laboratory-bill-bx">
                      <h6>Order</h6>
                      <h4>{appointmentData?.patientId?.name}</h4>
                      <p><span className="laboratory-phne">Phone :</span> {appointmentData?.patientId?.patientId?.contactNumber}</p>
                    </div>
                  </div>

                  <div className="laboratory-report-bx">
                    <ul className="laboratory-report-list">
                      <li className="laboratory-item"><span>Test</span> <span>Price</span></li>
                      {appointmentData?.testData?.map((item, key) =>
                        <li className="laboratory-item border-0" key={key}><span>{item?.name}</span> <span>₹ {item?.fees}</span></li>)}
                    </ul>

                    <div className="">
                      <div className="row ">
                        <div className="col-lg-6 align-content-center">
                          <div className="custom-frm-bx">
                          <label className="">Sub Total ₹  :  </label>
                          </div>
                        </div>

                        <div className="col-lg-6">
                          <div className="custom-frm-bx">
                            <input type="number" min={0} className="form-control" value={formData?.subTotal}
                            readOnly name="subTotal" />
                          </div>
                        </div>

                        <div className="col-lg-6 align-content-center">
                          <div className="custom-frm-bx">
                          <label className="">Discount (%) :  </label>
                          </div>
                        </div>

                        <div className="col-lg-6">
                          <div className="custom-frm-bx">
                            <input type="number" min={0} className="form-control"
                            readOnly={appointmentData?.invoiceId} value={formData?.discount}
                            onChange={handleChange} name="discount" />
                          </div>
                        </div>

                        <div className="col-lg-6 align-content-center">
                          <div className="custom-frm-bx">
                          <label className="">GST (%) :  </label>
                          </div>
                        </div>

                        <div className="col-lg-6">
                          <div className="custom-frm-bx">
                            <input type="number" min={0} className="form-control"
                            readOnly={appointmentData?.invoiceId}
                            value={formData?.taxes}
                            onChange={handleChange} name="taxes" />
                          </div>
                        </div>

                        <div className="col-lg-6 align-content-center">
                          <div className="custom-frm-bx ">
                          <label className="">Total ₹ :  </label>
                          </div>
                        </div>

                        <div className="col-lg-6">
                          <div className="custom-frm-bx">
                            <input type="number" min={0} className="form-control" value={formData?.total}
                            readOnly name="total" />
                          </div>
                        </div>

                        <div className="col-lg-6 align-content-center">
                          <div className="custom-frm-bx ">
                          <label className="">Payment Type :  </label>
                          </div>
                        </div>

                        <div className="col-lg-6 ">
                          <div className="custom-frm-bx">
                            <select className="form-select" id="" readOnly={appointmentData?.invoiceId}
                            value={formData?.paymentType} onChange={handleChange} name="paymentType">
                            <option selected>Select type</option>
                            <option value="CARD">CARD</option>
                            <option value="CASH">CASH</option>
                            <option value="ONLINE">ONLINE</option>
                          </select>

                          </div>
                          
                        </div>
                      </div>


                    </div>
                    {!appointmentData?.invoiceId && <div className="text-end mt-5" >
                      <button type="button" onClick={() => billSubmit()} className="nw-thm-btn rounded-3 py-2 no-print">Save</button>
                    </div>}
                    {/* {appointmentData?.paymentStatus == "due" &&
                      <div className="text-end mt-5" >
                        <button className="nw-thm-btn rounded-3 py-2 no-print">Collect payment</button>
                      </div>} */}
                  </div>
                </div>
              </div>


            </div>
          </div>
          <div
            ref={invoiceRef}
            className="d-none"
          >
            <NeoHealthCardLabTemplates
              appointmentId={appointmentId}
              endLoading={() => setPdfLoading(false)}
              pdfLoading={pdfLoading}
            />
          </div>


        </div>}
    </>
  )
}

export default NewInvoice