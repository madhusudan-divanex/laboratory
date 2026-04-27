
import { faCircleXmark, faPen } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "react"
import { Link, NavLink, useNavigate, useParams } from "react-router-dom"
import { getSecureApiData, updateApiData } from "../../services/api"
import { toast } from "react-toastify"
import { useSelector } from "react-redux"
import Loader from "../Layouts/Loader"

function AppointmentDetails() {
  const params = useParams()
  const navigate = useNavigate()
  const userId = localStorage.getItem('userId')
  const appointmentId = params.id
  const [appointmentData, setAppointmentData] = useState({})
  const [employees, setEmployees] = useState([])
  const { isOwner, permissions } = useSelector(state => state.user)
  const { labPerson } = useSelector(state => state.user)
  const [payData, setPayData] = useState({ appointmentId, paymentStatus: 'due' })
  const [actData, setActData] = useState({ appointmentId, status: '' ,labStaff:''})
  const [loading,setLoading]=useState(false)
  const fetchAppointmentData = async () => {
    try {
      setLoading(true)
      const response = await getSecureApiData(`lab/appointment-data/${appointmentId}`)
      if (response.success) {
        setAppointmentData(response.data)
        setActData({ ...actData, status: response.data.status, labStaff:response.data.labStaff?._id })
        setPayData({ ...payData, paymentStatus: response.data.paymentStatus })
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      toast.error(error?.response.data?.message || "Something went wrong")
    } finally{
      setLoading(false)
    }
  }
  const fetchLabStaff = async () => {
    try {
      const response = await getSecureApiData(`api/staff/list?limit=100&status=active`);
      if (response.success) {
        setEmployees(response.staffData)
      } else {
        toast.error(response.message)
      }
    } catch (err) {
      console.error("Error creating lab:", err);
    }
  }
  useEffect(() => {
    fetchAppointmentData()
    fetchLabStaff()
  }, [appointmentId])
  const appointmentAction = async (e, type) => {
    e.preventDefault()
    let data = {}
    if (type == 'status') {
      data = { type, labId: userId, appointmentId, status: actData?.status }
    }
    else if (type == 'payment') {
      data = { type, labId: userId, appointmentId: payData.appointmentId, paymentStatus: payData.paymentStatus }
    }
    try {
      const response = await updateApiData(`appointment/lab-action`, data);
      if (response.success) {
        fetchAppointmentData()
      } else {
        toast.error(response.message)
      }
    } catch (err) {
      console.error("Error creating lab:", err);
    }
  }
  // useEffect(()=>{
  //       if(!isOwner && !permissions?.appointmentDetails){
  //     toast.error('You do not have permission to see appointment deatails ')
  //     navigate(-1)
  //   }
  //   },[isOwner,permissions])
  return (
    <>
      {loading?<Loader/>
      :<div className="main-content flex-grow-1 p-3 overflow-auto">
        <form action="">
          <div className="row mb-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h3 className="innr-title">Appointment Details</h3>
                <div className="admin-breadcrumb">
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb custom-breadcrumb">
                      <li className="breadcrumb-item">
                        <NavLink to="/dashboard" className="breadcrumb-link">
                          Dashboard
                        </NavLink>
                      </li>
                      <li className="breadcrumb-item">
                        <a href="#" className="breadcrumb-link">
                          Test  Request
                        </a>
                      </li>
                      <li
                        className="breadcrumb-item active"
                        aria-current="page"
                      >
                        Appointment  Details
                      </li>
                    </ol>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="submega-main-bx sub-tab-brd">
          <div className="row">
            <div className="col-lg-6 mb-3">
              <div className="patient-main-bx">
                <h5>Appointment  Details</h5>
                <div>
                  <ul className="vw-info-list">
                    <li className="vw-info-item">
                      <span className="vw-info-icon"><img src="/schedule.svg" alt="" /></span>
                      <div>
                        <p className="vw-info-value mb-2">Appointment Date</p>
                        <p className="vw-info-title">{new Date(appointmentData?.date)?.toLocaleString()}</p>
                      </div>
                    </li>

                  </ul>
                </div>
              </div>

              <div className="appointment-crd-details">
                <ul className="appointment-crd-list">
                  <li className="appointment-crd-item">Appointment ID : <span className="appointment-crd-title">#{appointmentData?.customId}</span></li>
                  <li className="appointment-crd-item">Appointment Completed date  : <span className="appointment-crd-title">-</span></li>
                  <li className="appointment-crd-item">Amount : <span className="appointment-crd-title"> ${appointmentData?.fees}</span></li>
                  <li className="appointment-crd-item">Payment Status : <span className="appointment-due-title text-capitalize"> {appointmentData?.paymentStatus}</span></li>
                </ul>
              </div>



            </div>

            <div className="col-lg-6">
              <div className="d-flex gap-3 justify-content-end mb-3">
                <div>
                  <h6 className="subtitle mb-2">Payment Status</h6>
                  <ul className="admin-paid-list justify-content-center">
                    <li>
                      <span className="paid due text-capitalize">{appointmentData?.paymentStatus}</span>
                    </li>
                    <li>
                      <a
                        href="javascript:void(0)"
                        className="edit-btn" data-bs-toggle="modal" data-bs-target="#payment-Status"
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h6 className="subtitle mb-2">Appointment Status</h6>
                  <ul className="admin-paid-list justify-content-center">
                    <li>

                      <span className="paid pending text-capitalize">
                        {appointmentData?.status}
                      </span>
                    </li>
                    <li>
                      <a
                        href="javascript:void(0)"
                        className="edit-btn" data-bs-toggle="modal" data-bs-target="#appointment-Status"
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </a>
                    </li>
                  </ul>
                </div>

              </div>

              <div className="laboratory-bill-bx mt-lg-5 mt-sm-3 mb-3">
                <h6 className="my-0">Lab Doctor </h6>
                <h4>Dr. {appointmentData?.staff?.name}</h4>
                {/* <p><span className="laboratory-phne"> ID :</span> {appointmentData?.labStaff?.customId}</p> */}
              </div>
              {appointmentData?.doctorId && <div className="laboratory-bill-bx mb-3">
                <h6 className="my-0">Lab tests prescribed by the doctor</h6>
                <h4>Dr.{appointmentData?.doctorId?.name}</h4>
                <p><span className="laboratory-phne"> ID :</span> {appointmentData?.doctorId?.nh12}</p>
              </div>}
            </div>
          </div>
        </div>
        <div className="text-end mt-4">
          <Link to={-1} className="nw-thm-btn rounded-3 outline" >
            Go Back
          </Link>
        </div>
      </div>}

      {/*Payment Status Popup Start  */}
      {/* data-bs-toggle="modal" data-bs-target="#payment-Status" */}
      <div className="modal step-modal fade" id="payment-Status" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content rounded-5">
            <div className="d-flex align-items-center justify-content-between popup-nw-brd px-4 py-3">
              <div>
                <h6 className="lg_title mb-0">Payment Status</h6>
              </div>
              <div>
                <button type="button" className="" data-bs-dismiss="modal" aria-label="Close" style={{ color: "#00000040" }}>
                  <FontAwesomeIcon icon={faCircleXmark} />
                </button>
              </div>
            </div>
            <div className="modal-body px-4">
              <div className="row ">
                <form onSubmit={(e) => appointmentAction(e, 'payment')} className="col-lg-12 ">
                  <div className="custom-frm-bx">
                    <label htmlFor="">Status</label>
                    <select name="paymentStatus" value={payData.paymentStatus}
                      onChange={(e) => setPayData({ ...payData, paymentStatus: e.target.value })} 
                      className="form-select nw-control-frm">
                      <option value="due">Due</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>

                  <div>
                    <button type="submit" className="nw-thm-btn w-100" data-bs-dismiss="modal"> Submit</button>
                  </div>

                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*  Payment Status Popup End */}


      {/*Appointment Popup Start  */}
      {/* data-bs-toggle="modal" data-bs-target="#appointment-Status" */}
      <div className="modal step-modal fade" id="appointment-Status" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content rounded-5 ">
            <div className="d-flex align-items-center justify-content-between popup-nw-brd px-4 py-3">
              <div>
                <h6 className="lg_title mb-0">Appointment Status</h6>
              </div>
              <div>
                <button type="button" className="" data-bs-dismiss="modal" aria-label="Close" style={{ color: "#00000040" }}>
                  <FontAwesomeIcon icon={faCircleXmark} />
                </button>
              </div>
            </div>
            <div className="modal-body px-4">
              <div className="row ">
                <form onSubmit={(e) => appointmentAction(e, 'status')} className="col-lg-12 ">
                  <div className="custom-frm-bx">
                    <label htmlFor="">Status</label>
                    <select name="status" value={actData.status} onChange={(e) => setActData({ ...actData, status: e.target.value })} className="form-select nw-control-frm">
                      <option value="pending" disabled>Pending</option>
                      <option value="cancel" disabled>Cancel</option>
                      <option value="approved" disabled>Approved</option>
                      <option value="rejected" disabled>Rejected</option>
                      <option value="report-pending">Pending Report</option>
                      <option value="deliver-report">Deliver Report</option>
                    </select>
                  </div>

                  <div className="custom-frm-bx">
                    <label htmlFor="">Select Doctor</label>
                    <select className="form-select patient-frm-control"
                    value={actData.labStaff} onChange={(e) => setActData({ ...actData, labStaff: e.target.value })}>
                      <option>----Select Doctor----</option>
                      {employees?.map((item, key) =>
                        <option value={item?.userId?._id}>{item?.userId?.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <button type="submit" className="nw-thm-btn w-100" data-bs-dismiss="modal"> Submit</button>
                  </div>

                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Appointment Popup End */}
    </>
  )
}

export default AppointmentDetails