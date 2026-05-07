import { faDownload } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useRef, useState } from "react"
import { getSecureApiData, securePostData } from "../../services/api"
import { toast } from "react-toastify"
import { NavLink, useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import NeoHealthCardLabTemplates from "./Billing"
import Loader from "../Layouts/Loader"
import LabInvoice from "../Template/LabInvoice"

function NewInvoice() {
  const params = useParams()
  const invoiceRef = useRef(null)
  const appointmentId = params.id
  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(null)
  const { profiles } = useSelector(state => state.user)
  const [appointmentData, setAppointmentData] = useState({})
  const [formData, setFormData] = useState({
    discount: null, subTotal: null, total: null, taxes: null, paymentType: null
  })
  const [showDownload, setShowDownload] = useState(false)

  // ─── Fetch appointment ────────────────────────────────────────
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
    if (appointmentId) fetchAppointmentData()
  }, [appointmentId])

  // ─── subTotal calculate — naye schema se ─────────────────────
  useEffect(() => {
    if (!appointmentData?._id) return

    if (appointmentData?.invoiceId) {
      // Invoice already hai — saved data use karo
      const data = appointmentData.invoiceId
      setFormData({
        subTotal: data?.subTotal,
        discount: data?.discount,
        total: data?.total,
        taxes: data?.taxes,
        paymentType: data?.paymentType
      })
    } else {
      // ✅ Naye schema: tests[].categoryPrice ya tests[].subCat[].subCatPrice
      const sub = appointmentData?.tests?.reduce((sum, testEntry) => {
        if (testEntry?.categoryPrice) {
          return sum + (testEntry.categoryPrice || 0)
        }
        return sum + (testEntry?.subCat?.reduce(
          (s, sub) => s + (sub?.subCatPrice || 0), 0
        ) || 0)
      }, 0) || 0

      setFormData(prev => ({ ...prev, subTotal: sub, total: sub }))
    }
  }, [appointmentData])

  // ─── Discount / GST change ────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target
    const updatedData = { ...formData, [name]: value }

    if (name === 'discount' || name === 'taxes') {
      const subTotal = Number(updatedData.subTotal || 0)
      const discount = Number(updatedData.discount || 0)
      const taxes = Number(updatedData.taxes || 0)

      const discountAmount = (subTotal * discount) / 100
      const afterDiscount = subTotal - discountAmount
      const taxAmount = (afterDiscount * taxes) / 100
      const total = afterDiscount + taxAmount

      updatedData.total = Math.round((total + Number.EPSILON) * 100) / 100
    }

    setFormData(updatedData)
  }

  // ─── Bill submit ──────────────────────────────────────────────
  const billSubmit = async () => {
    if (!formData?.paymentType) {
      return toast.error("Please select payment type")
    }
    setLoading(true)
    const data = {
      ...formData,
      patientId: appointmentData?.patientId?._id,
      appointmentId: appointmentData?._id
    }
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
    } finally {
      setLoading(false)
    }
  }

  const handleReportDownload = () => {
    setPdfLoading(true)
    setShowDownload(true)
  }

  return (
    <>
      {loading ? <Loader /> :
        <div className="main-content flex-grow-1 p-3 overflow-auto">
          <form action="">
            <div className="row mb-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h3 className="innr-title">Invoices</h3>
                  <div className="admin-breadcrumb">
                    <nav aria-label="breadcrumb">
                      <ol className="breadcrumb custom-breadcrumb">
                        <li className="breadcrumb-item">
                          <NavLink to="/dashboard" className="breadcrumb-link">Dashboard</NavLink>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">Invoices</li>
                      </ol>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </form>

          <div className="submega-main-bx">
            <div className="row">
              <div className="col-lg-12 col-md-12 col-sm-12 mb-3">
                <div className="new-invoice-card">

                  {/* Header */}
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="first_para fw-700 fz-20 mb-0">Invoice</h5>
                    {appointmentData?.invoiceId && (
                      <button className="print-btn " onClick={handleReportDownload}>
                        <FontAwesomeIcon icon={faDownload} /> {pdfLoading?'Downloading...':'Download'} PDF
                      </button>
                    )}
                  </div>

                  {/* Lab info */}
                  <div className="laboratory-header mb-4">
                    <div className="laboratory-name">
                      <h5>{profiles?.name || 'Advance Lab Tech'}</h5>
                      <p><span className="laboratory-title">GSTIN :</span> {profiles?.gstNumber || '09897886454'}</p>
                    </div>
                    {appointmentData?.invoiceId && (
                      <div className="invoice-details">
                        <p><span className="laboratory-invoice">Invoice :</span> {appointmentData?.invoiceId?.customId}</p>
                        <p><span className="laboratory-invoice">Date :</span> {new Date(appointmentData?.invoiceId?.createdAt).toLocaleDateString('en-GB')}</p>
                      </div>
                    )}
                  </div>

                  {/* Bill to */}
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

                  {/* Tests list */}
                  <div className="laboratory-report-bx">
                    <ul className="laboratory-report-list">
                      <li className="laboratory-item"><span>Test</span> <span>Price</span></li>
                      {appointmentData?.tests?.map((testEntry, key) => {
                        const isAllSelected = !!testEntry?.categoryPrice
                        return (
                          <div key={key}>
                            <li className="laboratory-item border-0">
                              <strong>{testEntry?.category?.name}</strong>
                              {isAllSelected && <span>₹ {testEntry?.categoryPrice}</span>}
                            </li>
                            {testEntry?.subCat?.map((sub, i) => (
                              <li className="laboratory-item border-0 ps-3" key={i}>
                                <span>{sub?.subCatId?.subCategory}</span>
                                {!isAllSelected && <span>₹ {sub?.subCatPrice}</span>}
                              </li>
                            ))}
                          </div>
                        )
                      })}
                    </ul>

                    {/* Billing form */}
                    <div className="row">
                      <div className="col-lg-6 align-content-center">
                        <div className="custom-frm-bx"><label>Sub Total ₹ :</label></div>
                      </div>
                      <div className="col-lg-6">
                        <div className="custom-frm-bx">
                          <input type="number" min={0} className="form-control"
                            value={formData?.subTotal} readOnly name="subTotal" />
                        </div>
                      </div>

                      <div className="col-lg-6 align-content-center">
                        <div className="custom-frm-bx"><label>Discount (%) :</label></div>
                      </div>
                      <div className="col-lg-6">
                        <div className="custom-frm-bx">
                          <input type="number" min={0} max={99} className="form-control"
                            readOnly={!!appointmentData?.invoiceId}
                            value={formData?.discount}
                            onChange={handleChange} name="discount" />
                        </div>
                      </div>

                      <div className="col-lg-6 align-content-center">
                        <div className="custom-frm-bx"><label>GST (%) :</label></div>
                      </div>
                      <div className="col-lg-6">
                        <div className="custom-frm-bx">
                          <input type="number" min={0} className="form-control"
                            readOnly={!!appointmentData?.invoiceId}
                            value={formData?.taxes}
                            onChange={handleChange} name="taxes" />
                        </div>
                      </div>

                      <div className="col-lg-6 align-content-center">
                        <div className="custom-frm-bx"><label>Total ₹ :</label></div>
                      </div>
                      <div className="col-lg-6">
                        <div className="custom-frm-bx">
                          <input type="number" min={0} className="form-control"
                            value={formData?.total} readOnly name="total" />
                        </div>
                      </div>

                      <div className="col-lg-6 align-content-center">
                        <div className="custom-frm-bx"><label>Payment Type :</label></div>
                      </div>
                      <div className="col-lg-6">
                        <div className="custom-frm-bx">
                          <select className="form-select"
                            disabled={!!appointmentData?.invoiceId}
                            value={formData?.paymentType}
                            onChange={handleChange} name="paymentType">
                            <option value="">Select type</option>
                            <option value="CARD">CARD</option>
                            <option value="CASH">CASH</option>
                            <option value="ONLINE">ONLINE</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {!appointmentData?.invoiceId && (
                      <div className="text-end mt-5">
                        <button type="button" onClick={billSubmit}
                          className="nw-thm-btn rounded-3 py-2 no-print">
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div  className="d-none">
            <LabInvoice
              appointmentId={appointmentId}
              endLoading={() => setPdfLoading(false)}
              pdfLoading={pdfLoading}
            />
          </div>
        </div>
      }
    </>
  )
}

export default NewInvoice