import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Chart from "react-apexcharts";
import { faClose, faGear, faPen } from "@fortawesome/free-solid-svg-icons";
import { Link, NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import { getSecureApiData, securePostData, updateApiData } from "../../services/api";
import { useEffect, useState } from "react";
import base_url from "../../../baseUrl";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserDetail } from "../../redux/features/userSlice";
import Loader from "../Layouts/Loader";
function Dashboard() {
  const [rpData, setRpData] = useState({})
  const [totalTest,setTotalTest]=useState(0)
  const [testReport,setTestReport]=useState()
  const [loading,setLoading] =useState(false)
  const {isOwner,permissions}=useSelector(state=>state.user)
  const labReports = {
    series: [rpData?.deliverRequest ||0,rpData?.pendingTestRequest|| 0, rpData?.pendingReport ||0], 
    options: {
      chart: {
        type: "donut",
      },
      labels: ["Delivered", "Report Pending", "Approval Pending"],
      colors: ["#34A853", "#FEB052", "#4285F4"],
      legend: {
        position: "right",
      },
      dataLabels: {
        enabled: false,
      },
    },
  };

  // Test Request chart data
  const testRequest = {
    series: [testReport?.totalTestRequest || 0, rpData?.pendingReport || 0], // Total Request, Pending
    options: {
      chart: {
        type: "donut",
      },
      labels: ["Total Request", "Pending"],
      colors: ["#052F59", "#FEB052"],
      legend: {
        position: "right",
      },
      dataLabels: {
        enabled: false,
      },
    },
  };
  const userId = localStorage.getItem('userId')
  const [allTest, setAllTest] = useState([])
  const [payData, setPayData] = useState({ appointmentId: null, paymentStatus: 'due' })
  const [actData, setActData] = useState({ appointmentId: null, status: '' })
  const fetchLabTest = async () => {
    try {
      const response = await getSecureApiData(`lab/test/${userId}`);
      if (response.success) {
        // setCurrentPage(response.pagination.page)
        // setTotalPage(response.pagination.totalPages)
        setAllTest(response.data)
      } else {
        toast.error(response.message)
      }
    } catch (err) {
      console.error("Error creating lab:", err);
    }
  }
  useEffect(() => {
    labDashboard()
    fetchLabAppointment()
  }, [userId])
  const [appointments, setAppointments] = useState([])
  const fetchLabAppointment = async () => {
    try {
      const response = await getSecureApiData(`lab/appointment/${userId}?status=approved&page=1&limit=5`);
      if (response.success) {
        // setCurrentPage(response.pagination.page)
        // setTotalPage(response.pagination.totalPages)
        setAppointments(response.data)
      } else {
        toast.error(response.message)
      }
    } catch (err) {
      console.error("Error creating lab:", err);
    }
  }
  const appointmentAction = async (e, type) => {
    e.preventDefault()
    let data = {}
    if (type == 'status') {
      if (!isOwner && !permissions.appointmentStatus) {
        toast.error('You do not have permission to update appointment status ')
        return
      }
      data = { type, labId: userId, appointmentId: actData.appointmentId, status: actData?.status }
    }
    else if (type == 'payment') {
      if (!isOwner && !permissions.paymentStatus) {
        toast.error('You do not have permission to update payment status ')
        return
      }
      data = { type, labId: userId, appointmentId: payData.appointmentId, paymentStatus: payData.paymentStatus }
    }
    try {
      const response = await updateApiData(`appointment/lab-action`, data);
      if (response.success) {
        fetchLabAppointment()
      } else {
        toast.error(response.message)
      }
    } catch (err) {
      console.error("Error creating lab:", err);
    }
  }
  const sendReport = async (appointmentId, email, type) => {
    const data = { appointmentId, email, type }
    try {
      const response = await securePostData(`lab/send-report`, data);
      if (response.success) {
        toast.success("Report sent")
      } else {
        toast.error(response.message)
      }
    } catch (err) {
      console.error("Error creating lab:", err);
    }
  }
  const labDashboard = async () => {
    setLoading(true)
    try {
      const response = await getSecureApiData(`lab/dashboard/${userId}`);
      if (response.success) {
        setRpData(response.labReports)
        setTestReport(response.testRequests)
        setTotalTest(response.totalTest)
      } else {
        toast.error(response.message)
      }
    } catch (err) {
      console.error("Error creating lab:", err);
    } finally{
      setLoading(false)
    }
  }
  return (
    <>
      {loading?<Loader/>
      :<div className="main-content flex-grow-1 p-3 overflow-auto">
        <div className="row">
          <div>
            <h3 className="innr-title">Dashboard</h3>
          </div>

          <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
            <div>
              <div className="dashboard-main-card">
                <div className="attendence-content-bx">
                  <div className="attendence-content-first">
                    <img src="/admin-check.png" alt="" />
                  </div>
                  <div>
                    <h6 className="">{testReport?.totalTestRequest}</h6>
                    <p>Test Request</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
            <div>
              <div className="dashboard-main-card">
                <div className="attendence-content-bx">
                  <div className="attendence-content-first admin-crd-two">
                    <img src="/admin-lab.png" alt="" />
                  </div>
                  <div>
                    <h6 className="">{totalTest}</h6>
                    <p>Tests </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
            <div>
              <div className="dashboard-main-card">
                <div className="attendence-content-bx">
                  <div className="attendence-content-first admin-crd-three">
                    <img src="/admin-test-yellow.png" alt="" />
                  </div>
                  <div>
                    <h6 className="">{rpData?.pendingReport}</h6>
                    <p>Pending Report </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
            <div>
              <div className="dashboard-main-card">
                <div className="attendence-content-bx">
                  <div className="attendence-content-first admin-crd-four">
                    <img src="/admin-test-green.png" alt="" />
                  </div>
                  <div>
                    <h6 className="">{rpData?.deliverRequest}</h6>
                    <p>Delivered Report</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6 col-md-6 col-sm-12 mb-3">
            <div className="lab-chart-crd h-100">
              <div className="lab-tp-title">
                <h6>

                  <img src="/lab-test.png" alt="" /> Lab Reports
                </h6>
              </div>
              <div className="p-3">
                <Chart
                  options={labReports.options}
                  series={labReports.series}
                  type="donut"
                  height={300}
                />
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-md-6 col-sm-12 mb-3">
            <div className="lab-chart-crd h-100">
              <div className="lab-tp-title">
                <h6>

                  <img src="/reqest-test.png" alt="" /> Test Request
                </h6>
              </div>
              <div className="p-3">
                <Chart
                  options={testRequest.options}
                  series={testRequest.series}
                  type="donut"
                  height={300}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12">
            <div className="lab-chart-crd ">
              <div className="lab-tp-title d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="mb-0">

                    <img src="/lab-test.png" alt="" /> Lab Reports List
                  </h6>
                </div>

                <div>
                  <NavLink to="/test-reports-appointment" href="javascript:void(0)" className="thm-btn">
                    View all
                  </NavLink>
                </div>
              </div>

              <div className="lab-admin-main-bx">
                <div className="table-section">
                  <div className="table table-responsive mb-0">
                    <table className="table mb-0">
                      <thead>
                        <tr>
                          <th>S.no.</th>
                          <th>Patient Details</th>
                          <th>Appointment ID</th>
                          <th>Test</th>
                          <th>Payment Status</th>
                          <th>Appointment Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments?.length > 0 &&
                          appointments?.map((item, key) =>
                            <tr key={key}>
                              <td>{key + 1}</td>
                              <td>
                                <div className="admin-table-bx">
                                  <div className="admin-table-sub-bx">
                                    <img src={item?.patientId?.profileImage ? `${base_url}/${item?.patientId?.profileImage}` : "/table-avatar.jpg"} alt="" />
                                    <div className="admin-table-sub-details">
                                      <h6>{item?.patientId?.name} </h6>
                                      <p>ID: {item?.patientId?.nh12}</p>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <ul className="admin-appointment-list">
                                  <li className="admin-appoint-item">
                                    <span className="admin-appoint-id">
                                      Appointment ID : #{item?.customId}
                                    </span>
                                  </li>
                                  <li className="admin-appoint-item">
                                    Appointment Book Date : {item?.date ? new Date(item?.date)?.toLocaleDateString('en-GB', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    }) : '-'}
                                  </li>
                                  <li className="admin-appoint-item">
                                    Total Amount : ${item?.fees}
                                  </li>
                                </ul>
                              </td>
                              <td>
                                <ul className="admin-test-list">
                                  {item?.testId?.map((item, key) =>
                                    <li className="admin-test-item" key={key}>{item?.shortName}</li>)}
                                  {/* <li className="admin-test-item">Haemoglobin</li> */}
                                </ul>
                              </td>
                              <td>
                                <ul className="admin-paid-list">
                                  <li>

                                    <span className="paid text-capitalize">{item?.paymentStatus}</span>
                                  </li>
                                  <li>
                                    <a
                                      href="javascript:void(0)"
                                      onClick={() => setPayData({ appointmentId: item?._id, paymentStatus: item?.paymentStatus })}
                                      className="edit-btn" data-bs-toggle="modal" data-bs-target="#payment-Status"
                                    >
                                      <FontAwesomeIcon icon={faPen} />
                                    </a>
                                  </li>
                                </ul>
                              </td>
                              <td>
                                <ul className="admin-paid-list">
                                  <li>

                                    <span className="paid text-capitalize">
                                      {item?.status}
                                    </span>
                                  </li>
                                  <li>
                                    <a
                                      href="javascript:void(0)"
                                      onClick={() => setActData({ appointmentId: item?._id, status: item?.status })}

                                      className="edit-btn" data-bs-toggle="modal" data-bs-target="#appointment-Status"
                                    >
                                      <FontAwesomeIcon icon={faPen} />
                                    </a>
                                  </li>
                                </ul>
                              </td>
                              <td>
                                <a
                                  href="javascript:void(0)"
                                  className=" admin-sub-dropdown dropdown-toggle"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                >

                                  <FontAwesomeIcon icon={faGear} /> Action
                                </a>

                                <div class="dropdown">
                                  <a
                                    href="javascript:void(0)"
                                    class="attendence-edit-btn"
                                    id="acticonMenu1"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                  >
                                    {/* <i class="fas fa-pen"></i> */}
                                  </a>
                                  <ul
                                    class="dropdown-menu dropdown-menu-end user-dropdown tble-action-menu"
                                    aria-labelledby="acticonMenu1"
                                  >
                                    <li className="drop-item">
                                      <Link
                                        class="nw-dropdown-item"
                                        to={`/lab-test-reports/${item._id}`}
                                      >
                                        <img src="/flask-report.png" alt="" />
                                        Edit Report
                                      </Link>
                                    </li>
                                    <li className="drop-item">
                                      <Link class="nw-dropdown-item" to={`/patient-view/${item?.patientId?._id}`}>
                                        <img src="/add-user.png" alt="" />
                                        Patient Details
                                      </Link>
                                    </li>
                                    <li className="drop-item">
                                      <Link class="nw-dropdown-item" to={`/appointment-details/${item?._id}`}>
                                        <img src="/flask-report.png" alt="" />
                                        Appointment Details
                                      </Link>
                                    </li>

                                    <li className="drop-item">
                                      <NavLink to="/report-tabs" className="nw-dropdown-item" href="#">
                                        <img src="/reprt-icon.png" alt="" />
                                        Generate Report
                                      </NavLink>
                                    </li>

                                    <li className="drop-item">
                                      <NavLink to={`/label/${item?._id}`} className="nw-dropdown-item" href="#">
                                        <img src="/barcd-icon.png" alt="" />
                                        Labels
                                      </NavLink>
                                    </li>

                                    <li className="drop-item">
                                      <NavLink to={`/report-view/${item?._id}`} className="nw-dropdown-item" href="#">
                                        <img src="/file.png" alt="" />
                                        Report  view
                                      </NavLink>
                                    </li>
                                    <li className="drop-item">
                                      <NavLink to={`/new-invoice/${item?._id}`} className="nw-dropdown-item" href="#">
                                        <img src="/invoices.png" alt="" />
                                        Invoice
                                      </NavLink>
                                    </li>
                                    <li className="drop-item">
                                      <a className="nw-dropdown-item" href="#">
                                        <img src="/dc-usr.png" alt="" />
                                        Send  Report Doctor
                                      </a>
                                    </li>
                                    <li className="drop-item">
                                      <button className="nw-dropdown-item" onClick={() => sendReport(item?._id, item?.patientId?.email, 'patient')}>
                                        <img src="/report-mail.png" alt="" />
                                        Send  Report Patient
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              </td>
                            </tr>)}




                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal step-modal fade" id="payment-Status" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
          aria-labelledby="staticBackdropLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered modal-md">
            <div className="modal-content rounded-5 p-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="lg_title mb-0">Payment Status</h6>
                </div>
                <div>
                  <button type="button" className="" data-bs-dismiss="modal" aria-label="Close">
                    <FontAwesomeIcon icon={faClose} />
                  </button>
                </div>
              </div>
              <div className="modal-body p-0">
                <div className="row ">
                  <form onSubmit={(e) => appointmentAction(e, 'payment')} className="col-lg-12 mt-5">
                    <div className="custom-frm-bx">
                      <label htmlFor="">Status</label>
                      <select name="paymentStatus" value={payData.paymentStatus}
                        onChange={(e) => setPayData({ ...payData, paymentStatus: e.target.value })} className="form-select nw-control-frm">
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
            <div className="modal-content rounded-5 p-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="lg_title mb-0">Appointment Status</h6>
                </div>
                <div>
                  <button type="button" className="" data-bs-dismiss="modal" aria-label="Close">
                    <FontAwesomeIcon icon={faClose} />
                  </button>
                </div>
              </div>
              <form onSubmit={(e) => appointmentAction(e, 'status')} className="modal-body p-0">
                <div className="row ">
                  <div className="col-lg-12 mt-3">
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


                  </div>

                  <div className="col-lg-12">
                    <div className="custom-frm-bx">
                      <label htmlFor="">Select Doctor</label>
                      <select className="form-select nw-control-frm">
                        <option>Dr. Ravi Kumar</option>
                      </select>
                    </div>

                    <div>
                      <button type="submit" data-bs-dismiss="modal" className="nw-thm-btn w-100"> Submit</button>
                    </div>

                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>}
    </>
  );
}

export default Dashboard;
