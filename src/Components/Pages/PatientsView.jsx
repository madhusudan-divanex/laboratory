import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faDroplet, faEnvelope, faEye, faFilePdf, faLocationDot, faPerson, faPhone, faPrint } from "@fortawesome/free-solid-svg-icons";
import { TbGridDots } from "react-icons/tb";
import { useEffect, useState } from "react";
import { getSecureApiData } from "../../services/api";
import { toast } from "react-toastify";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import base_url from "../../../baseUrl";
import { useDispatch, useSelector } from "react-redux";
import Barcode from "react-barcode";
import Loader from "../Layouts/Loader";
import LabReportPdf from "../Template/LabReportPdf";

function PatientsView() {
    const params = useParams()
    const patientId = params.id
    const navigate = useNavigate()
    const userId = localStorage.getItem('userId')
    const [appointments, setAppointments] = useState([])
    const [ptData, setPtData] = useState()
    const [isLoading, setIsLoading] = useState(true)
    const dispatch = useDispatch()
    const { isOwner, permissions, user } = useSelector(state => state.user)
    useDispatch(() => {
        dispatch(fetchUserDetail())
    }, [dispatch])
    const [medicalHistory, setMedicalHistory] = useState()
    const [demographicData, setDemographicData] = useState()
    const [prescriptionData, setPrescriptionData] = useState()
    const [labAppointments, setLabAppointments] = useState([])
    const [customId, setCustomId] = useState()
    const [labReports, setLabReports] = useState([])
    const [pdfLoading, setPdfLoading] = useState(false)
    const fetchPatient = async () => {
        try {
            const response = await getSecureApiData(`patient/detail/${patientId}`);
            if (response.success) {
                setPtData(response.user)
                setCustomId(response.patientUser?.nh12)
                setMedicalHistory(response.medicalHistory)
                setDemographicData(response.demographic)
                setPrescriptionData(response.prescription?.prescriptions)
                setIsLoading(false)
            } else {
                toast.error(response.message)
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        }
    }
    const fetchLabPatient = async () => {
        setIsLoading(true)
        try {
            const response = await getSecureApiData(`appointment/lab/past-appointments/${userId}/${patientId}`);
            if (response.success) {
                setLabAppointments(response.data)
                setIsLoading(false)
            } else {
                toast.error(response.message)
                // navigate('/tests')
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        }
    }
    useEffect(() => {
        if (userId) {

            fetchPatient()
            fetchLabPatient()
            fetchPatientReport()
        }
    }, [userId])
    const calculateAge = (dob) => {
        if (!dob) return "";

        const birthDate = new Date(dob);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--; // haven't had birthday yet this year
        }
        return age;
    };

    const fetchPatientReport = async () => {
        try {
            const response = await getSecureApiData(`lab/patient-lab-report/${userId}/${patientId}`);
            if (response.success) {
                setLabReports(response.data)
            } else {
                toast.error(response.message)
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        }
    }

    return (
        <>
            {isLoading ?
                <Loader /> : <div className="main-content flex-grow-1 p-3 overflow-auto">
                    <div className="row mb-3">
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <h3 className="innr-title">Patient Details</h3>
                                <div className="admin-breadcrumb">
                                    <nav aria-label="breadcrumb">
                                        <ol className="breadcrumb custom-breadcrumb">
                                            <li className="breadcrumb-item">
                                                <NavLink to="/dashboard" className="breadcrumb-link">
                                                    Dashboard
                                                </NavLink>
                                            </li>
                                            <li
                                                className="breadcrumb-item active"
                                                aria-current="page"
                                            >
                                                Patient Detail
                                            </li>
                                        </ol>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="view-employee-bx patient-view-bx">
                        <div className="row">
                            <div className="col-lg-3 col-md-12 col-sm-12">
                                <div className="view-employee-bx patient-vw-main">
                                    <div>
                                        <div className="view-avatr-bio-bx text-center">
                                            <img src={ptData?.profileImage ? `${base_url}/${ptData?.profileImage}` : "/profile.png"} alt="" />
                                            <h4>{ptData?.name}</h4>
                                            <p><span className="vw-id">ID:</span> {customId}</p>
                                            <h6 className="vw-activ text-capitalize">{ptData?.status}</h6>
                                        </div>
                                        <div>
                                            <ul className="vw-info-list">
                                                <li className="vw-info-item">
                                                    <span className="vw-info-icon"><FontAwesomeIcon icon={faPerson} /></span>
                                                    <div>
                                                        <p className="vw-info-title">Age</p>
                                                        <p className="vw-info-value">{calculateAge(demographicData?.dob)} Years</p>
                                                    </div>
                                                </li>

                                                <li className="vw-info-item">
                                                    <span className="vw-info-icon"><FontAwesomeIcon icon={faCalendar} /></span>
                                                    <div>
                                                        <p className="vw-info-title">Gender </p>
                                                        <p className="vw-info-value text-capitalize">{ptData?.gender}</p>
                                                    </div>
                                                </li>

                                                <li className="vw-info-item">
                                                    <span className="vw-info-icon"><FontAwesomeIcon icon={faDroplet} /></span>
                                                    <div>
                                                        <p className="vw-info-title">Blood  Group </p>
                                                        <p className="vw-info-value">{demographicData?.bloodGroup}</p>
                                                    </div>
                                                </li>

                                                <li className="vw-info-item">
                                                    <span className="vw-info-icon"><FontAwesomeIcon icon={faEnvelope} /></span>
                                                    <div>
                                                        <p className="vw-info-title">Email </p>
                                                        <p className="vw-info-value">{ptData?.email}</p>
                                                    </div>
                                                </li>

                                                <li className="vw-info-item">
                                                    <span className="vw-info-icon"><FontAwesomeIcon icon={faPhone} /></span>
                                                    <div>
                                                        <p className="vw-info-title">Phone </p>
                                                        <p className="vw-info-value">{ptData?.contactNumber}</p>
                                                    </div>
                                                </li>

                                                <li className="vw-info-item">
                                                    <span className="vw-info-icon"><FontAwesomeIcon icon={faPhone} /></span>
                                                    <div>
                                                        <p className="vw-info-title">Emergency Contact Name </p>
                                                        <p className="vw-info-value"><span className="fw-700">({demographicData?.contact?.emergencyContactName}) </span> {demographicData?.contact?.emergencyContactNumber}</p>
                                                    </div>
                                                </li>

                                                <li className="vw-info-item">
                                                    <span className="vw-info-icon"><FontAwesomeIcon icon={faLocationDot} /></span>
                                                    <div>
                                                        <p className="vw-info-title">Address</p>
                                                        <p className="vw-info-value">{demographicData?.address}</p>
                                                    </div>
                                                </li>

                                            </ul>

                                        </div>

                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-9 col-md-12 col-sm-12">
                                <div className="view-employee-bx">
                                    <div className="employee-tabs">
                                        <ul className="nav nav-tabs gap-3" id="myTab" role="tablist">
                                            <li className="nav-item" role="presentation">
                                                <a
                                                    className="nav-link active"
                                                    id="home-tab"
                                                    data-bs-toggle="tab"
                                                    href="#home"
                                                    role="tab"
                                                >
                                                    Lab Appointments
                                                </a>
                                            </li>

                                            <li className="nav-item" role="presentation">
                                                <a
                                                    className="nav-link"
                                                    id="profile-tab"
                                                    data-bs-toggle="tab"
                                                    href="#profile"
                                                    role="tab"
                                                >
                                                    Lab Reports
                                                </a>
                                            </li>

                                            <li className="nav-item" role="presentation">
                                                <a
                                                    className="nav-link"
                                                    id="contact-tab"
                                                    data-bs-toggle="tab"
                                                    href="#contact"
                                                    role="tab"
                                                >
                                                    Other Personal Details
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="">
                                        <div className="patient-bio-tab px-0">
                                            <div className="tab-content" id="myTabContent">
                                                <div
                                                    className="tab-pane fade show active"
                                                    id="home"
                                                    role="tabpanel"
                                                >
                                                    <div className="row">
                                                        <div className="col-lg-12">
                                                            <div className="table-section admin-mega-section">
                                                                <div className="table table-responsive mb-0">
                                                                    <table className="table mb-0">
                                                                        <thead>
                                                                            <tr>
                                                                                <th>#</th>
                                                                                <th>Appointment  Id</th>
                                                                                <th>Patient Details</th>
                                                                                <th>Appointment  </th>
                                                                                <th>Status</th>
                                                                                <th>Action</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>

                                                                            {labAppointments?.length > 0 &&
                                                                                labAppointments?.map((item, key) =>
                                                                                    <tr key={key}>
                                                                                        <td>{key + 1}</td>
                                                                                        <td>  #{item?.customId}</td>
                                                                                        <td>
                                                                                            <div className="admin-table-bx">
                                                                                                <div className="admin-table-sub-bx">
                                                                                                    <img src={ptData?.profileImage ? `${base_url}/${ptData?.profileImage}` : "/admin-tb-logo.png"} alt="" />
                                                                                                    <div className="admin-table-sub-details">
                                                                                                        <h6>{ptData?.name}</h6>
                                                                                                        <p>ID: {customId}</p>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </td>
                                                                                        <td>
                                                                                            <ul className="ad-info-list">
                                                                                                <li className="ad-info-item patient-report-item"><span className="ad-info-title"></span>Appointment ID : #{item?.customId}</li>
                                                                                                <li className="ad-info-item"><span className="ad-info-title">Appointment Book Date : {item?.date && new Date(item?.date)?.toLocaleDateString("en-GB", {
                                                                                                    day: "2-digit",
                                                                                                    month: "short",
                                                                                                    year: "numeric"
                                                                                                })}</span></li>
                                                                                                <li className="ad-info-item"><span className="ad-info-title">Total Amount  :  ₹{item?.fees}</span></li>
                                                                                            </ul>
                                                                                        </td>

                                                                                        <td >{(item?.status == 'approved' || item?.status == 'deliver-report') ? <span className="approved approved-active fw-400 text-capitalize">
                                                                                            {item?.status}</span> :
                                                                                            <span className="approved approved-active reject   fw-400 text-capitalize">
                                                                                                {item?.status}</span>}
                                                                                        </td>
                                                                                        {/* <td>
                                                                                <a
                                                                                    href="javascript:void(0)"
                                                                                    className="grid-dots-btn"
                                                                                >
                                                                                    <TbGridDots />
                                                                                </a>
                                                                            </td> */}

                                                                                        {(item?.status !== 'rejected' && item?.status !== 'pending' && item?.status !== 'cancel'
                                                                                            && item?.labId?._id == userId
                                                                                        ) && <td>
                                                                                                <a
                                                                                                    href="javascript:void(0)"
                                                                                                    className="grid-dots-btn "
                                                                                                    data-bs-toggle="dropdown"
                                                                                                    aria-expanded="false"
                                                                                                >

                                                                                                    <TbGridDots />
                                                                                                </a>

                                                                                                <div class="dropdown">
                                                                                                    <a
                                                                                                        href="javascript:void(0)"
                                                                                                        class="attendence-edit-btn"
                                                                                                        id="acticonMenu1"
                                                                                                        data-bs-toggle="dropdown"
                                                                                                        aria-expanded="false"
                                                                                                    >
                                                                                                    </a>
                                                                                                    <ul
                                                                                                        class="dropdown-menu dropdown-menu-end user-dropdown tble-action-menu "
                                                                                                        aria-labelledby="acticonMenu1"
                                                                                                    >
                                                                                                        {item?.status == 'deliver-report' && <li className="drop-item">
                                                                                                            <Link
                                                                                                                class="nw-dropdown-item"
                                                                                                                to={`/lab-test-reports/${item._id}`}
                                                                                                            >
                                                                                                                <img src="/flask-report.png" alt="" />
                                                                                                                Edit Report
                                                                                                            </Link>
                                                                                                        </li>}
                                                                                                        {/* <li className="drop-item">
                                    <Link class="nw-dropdown-item" to={`/patient-view/${item?.patientId?._id}`}>
                                      <img src="/add-user.png" alt="" />
                                      Patient Details
                                    </Link>
                                  </li> */}
                                                                                                        <li className="drop-item">
                                                                                                            <Link class="nw-dropdown-item" to={`/appointment-details/${item?._id}`}>
                                                                                                                <img src="/flask-report.png" alt="" />
                                                                                                                Appointment Details
                                                                                                            </Link>
                                                                                                        </li>

                                                                                                        <li className="drop-item">
                                                                                                            <NavLink to={`/report-tabs?appointmentId=${item?.customId}`} className="nw-dropdown-item" href="#">
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

                                                                                                        {item?.status == 'deliver-report' && <li className="drop-item">
                                                                                                            <NavLink to={`/report-view/${item?._id}`} className="nw-dropdown-item" href="#">
                                                                                                                <img src="/file.png" alt="" />
                                                                                                                Report  view
                                                                                                            </NavLink>
                                                                                                        </li>}


                                                                                                        <li className="drop-item">
                                                                                                            <NavLink to={`/new-invoice/${item?._id}`} className="nw-dropdown-item" href="#">
                                                                                                                <img src="/invoices.png" alt="" />
                                                                                                                Invoice
                                                                                                            </NavLink>
                                                                                                        </li>

                                                                                                        {(item?.status === 'pending-report' || item?.status === 'deliver-report') && <>
                                                                                                            {item?.doctorId && <li className="drop-item">
                                                                                                                <button className="nw-dropdown-item" onClick={() => sendReport(item?._id, item?.doctorId?.email, 'doctor')}>
                                                                                                                    <img src="/dc-usr.png" alt="" />
                                                                                                                    Send  Report Doctor
                                                                                                                </button>
                                                                                                            </li>}
                                                                                                            <li className="drop-item">
                                                                                                                <button className="nw-dropdown-item" onClick={() => sendReport(item?._id, item?.patientId?.email, 'patient')}>
                                                                                                                    <img src="/report-mail.png" alt="" />
                                                                                                                    Send  Report Patient
                                                                                                                </button>
                                                                                                            </li>
                                                                                                        </>}
                                                                                                    </ul>
                                                                                                </div>
                                                                                            </td>}
                                                                                    </tr>)}

                                                                            {/* <tr>
                                                                            <td>02.</td>
                                                                            <td>  #89324879</td>
                                                                            <td>
                                                                                <div className="admin-table-bx">
                                                                                    <div className="admin-table-sub-bx">
                                                                                        <img src="/admin-tb-logo.png" alt="" />
                                                                                        <div className="admin-table-sub-details">
                                                                                            <h6>Sunil</h6>
                                                                                            <p>ID: SU3320</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td>
                                                                                <ul className="ad-info-list">
                                                                                    <li className="ad-info-item patient-report-item"><span className="ad-info-title"></span>Appointment ID : #0959595</li>
                                                                                    <li className="ad-info-item"><span className="ad-info-title">Appointment Book Date : 20 jun 2025</span></li>
                                                                                    <li className="ad-info-item"><span className="ad-info-title">Total Amount  :  $25</span></li>
                                                                                </ul>
                                                                            </td>

                                                                            <td ><span className="approved approved-active fw-400">Deliver Report</span></td>
                                                                            <td>
                                                                                <a
                                                                                    href="javascript:void(0)"
                                                                                    className="grid-dots-btn "
                                                                                    data-bs-toggle="dropdown"
                                                                                    aria-expanded="false"
                                                                                >

                                                                                    <TbGridDots />
                                                                                </a>

                                                                                <div class="dropdown">
                                                                                    <a
                                                                                        href="javascript:void(0)"
                                                                                        class="attendence-edit-btn"
                                                                                        id="acticonMenu1"
                                                                                        data-bs-toggle="dropdown"
                                                                                        aria-expanded="false"
                                                                                    >
                                                                                    </a>
                                                                                    <ul
                                                                                        class="dropdown-menu dropdown-menu-end user-dropdown tble-action-menu"
                                                                                        aria-labelledby="acticonMenu1"
                                                                                    >
                                                                                        <li className="drop-item">
                                                                                            <a
                                                                                                class="nw-dropdown-item"
                                                                                                href="#"
                                                                                                data-bs-toggle="modal"
                                                                                                data-bs-target="#attendance-edit"
                                                                                            >
                                                                                                <img src="/flask-report.png" alt="" />
                                                                                                Edit Report
                                                                                            </a>
                                                                                        </li>
                                                                                        <li className="drop-item">
                                                                                            <a class="nw-dropdown-item" href="#">
                                                                                                <img src="/add-user.png" alt="" />
                                                                                                Patient Details
                                                                                            </a>
                                                                                        </li>
                                                                                        <li className="drop-item">
                                                                                            <a class="nw-dropdown-item" href="#">
                                                                                                <img src="/flask-report.png" alt="" />
                                                                                                Appointment Details
                                                                                            </a>
                                                                                        </li>

                                                                                        <li className="drop-item">
                                                                                            <a class="nw-dropdown-item" href="#">
                                                                                                <img src="/reprt-icon.png" alt="" />
                                                                                                Generate Report
                                                                                            </a>
                                                                                        </li>

                                                                                        <li className="drop-item">
                                                                                            <a class="nw-dropdown-item" href="#">
                                                                                                <img src="/barcd-icon.png" alt="" />
                                                                                                Labels
                                                                                            </a>
                                                                                        </li>

                                                                                        <li className="drop-item">
                                                                                            <a class="nw-dropdown-item" href="#">
                                                                                                <img src="/file.png" alt="" />
                                                                                                Report  view
                                                                                            </a>
                                                                                        </li>
                                                                                        <li className="drop-item">
                                                                                            <a class="nw-dropdown-item" href="#">
                                                                                                <img src="/file.png" alt="" />
                                                                                                Invoice
                                                                                            </a>
                                                                                        </li>
                                                                                        <li className="drop-item">
                                                                                            <a class="nw-dropdown-item" href="#">
                                                                                                <img src="/dc-usr.png" alt="" />
                                                                                                Send  Report Doctor
                                                                                            </a>
                                                                                        </li>



                                                                                        <li className="drop-item">
                                                                                            <a class="nw-dropdown-item" href="#">
                                                                                                <img src="/add-user.png" alt="" />
                                                                                                Send  Report Patient
                                                                                            </a>
                                                                                        </li>
                                                                                    </ul>
                                                                                </div>
                                                                            </td>
                                                                        </tr> */}




                                                                        </tbody>
                                                                    </table>
                                                                </div>

                                                            </div>

                                                        </div>



                                                    </div>
                                                </div>

                                                <div className="tab-pane fade" id="profile" role="tabpanel">
                                                    <div className="row">

                                                        {labReports?.length > 0 &&
                                                            labReports?.map((item, key) =>
                                                                <div className="col-lg-6 col-md-6 col-sm-12 mb-3" key={key}>
                                                                    <div className="qrcode-prescriptions-bx">
                                                                        <div className="admin-table-bx d-flex align-items-center justify-content-between qr-cd-headr">
                                                                            <div className="admin-table-sub-details final-reprt d-flex align-items-center gap-2">
                                                                                <img src="/reprt-plus.png" alt="" className="rounded-0" />
                                                                                <div>
                                                                                    <h6 className="fs-16 fw-600 text-black">{item?.testId?.shortName} Report</h6>
                                                                                    <p>RE-{item?._id?.slice(-10)}</p>

                                                                                </div>
                                                                            </div>

                                                                        </div>

                                                                        <div className="barcode-active-bx">
                                                                            <div className="d-flex align-items-center justify-content-between mb-3">
                                                                                <div className="admin-table-bx">
                                                                                    <div className="">
                                                                                        <div className="admin-table-sub-details d-flex align-items-center gap-2 doctor-title ">
                                                                                            <div>
                                                                                                <h6 className="reprting-name">{item?.labId?.name}</h6>
                                                                                                <p className="fs-14 fw-500">{user?.nh12}</p>
                                                                                            </div>
                                                                                        </div>

                                                                                    </div>
                                                                                </div>

                                                                                <div className="d-flex align-items gap-2">
                                                                                    {/* <button type="button" className="card-sw-btn"><FontAwesomeIcon icon={faPrint} /></button> */}
                                                                                    <Link to={`/report-view/${item?.appointmentId?._id}`} type="button" className="card-sw-btn"><FontAwesomeIcon icon={faEye} /></Link>
                                                                                </div>
                                                                            </div>

                                                                            <div className="barcd-scannr barcde-scnnr-card">
                                                                                <div className="barcd-content">
                                                                                    <h4 className="fw-700 mb-2">SP-{item?.testId?.customId}</h4>
                                                                                    <ul className="qrcode-list mb-2">
                                                                                        <li className="qrcode-item">Test  <span className="qrcode-title">: {item?.subCatId?.subCategory}</span></li>
                                                                                        <li className="qrcode-item">Draw  <span className="qrcode-title"> : {new Date(item?.createdAt)?.toLocaleString()}</span> </li>
                                                                                    </ul>


                                                                                    {/* <img src="/barcode.png" alt="" /> */}
                                                                                    <Barcode value={item?.appointmentId?._id} width={1} displayValue={false}
                                                                                        height={60} className="dynamic-barcode" />
                                                                                </div>

                                                                                <div className="barcode-id-details mt-2">
                                                                                    <div>
                                                                                        <h6>Patient Id </h6>
                                                                                        <p>{customId}</p>
                                                                                    </div>


                                                                                    <div>
                                                                                        <h6>Appointment ID </h6>
                                                                                        <p>{item?.appointmentId?.customId}</p>
                                                                                    </div>
                                                                                </div>

                                                                            </div>

                                                                            <div className="text-start mt-3">
                                                                                <button onClick={()=>setPdfLoading(item?.appointmentId?._id)} className="pdf-download-tbn py-2">
                                                                                    <FontAwesomeIcon icon={faFilePdf} style={{ color: "#EF5350" }} />
                                                                                    {pdfLoading==item?.appointmentId?._id?'Downloading...':'Download'} Report</button>

                                                                            </div>

                                                                        </div>

                                                                    </div>

                                                                </div>)}
                                                        {/* <div className="col-lg-6 col-md-6 col-sm-12 mb-3">
                                                        <div className="qrcode-prescriptions-bx">
                                                            <div className="admin-table-bx d-flex align-items-center justify-content-between qr-cd-headr">
                                                                <div className="admin-table-sub-details final-reprt d-flex align-items-center gap-2">
                                                                    <img src="/reprt-plus.png" alt="" className="rounded-0" />
                                                                    <div>
                                                                        <h6 className="fs-16 fw-600 text-black">Final Diagnostic Report</h6>
                                                                        <p>RE-89767</p>

                                                                    </div>
                                                                </div>

                                                            </div>

                                                            <div className="barcode-active-bx">
                                                                <div className="d-flex align-items-center justify-content-between mb-3">
                                                                    <div className="admin-table-bx">
                                                                        <div className="">
                                                                            <div className="admin-table-sub-details d-flex align-items-center gap-2 doctor-title ">
                                                                                <div>
                                                                                    <h6 className="reprting-name">Advance Lab Tech</h6>
                                                                                    <p className="fs-14 fw-500">DO-4001</p>
                                                                                </div>
                                                                            </div>

                                                                        </div>
                                                                    </div>


                                                                </div>

                                                                <div className="barcd-scannr barcde-scnnr-card">
                                                                    <div className="barcd-content">
                                                                        <h4 className="fw-700 mb-2">SP-9879</h4>
                                                                        <ul className="qrcode-list mb-2">
                                                                            <li className="qrcode-item">Test  <span className="qrcode-title">: CBC</span></li>
                                                                            <li className="qrcode-item">Draw  <span className="qrcode-title"> : 25-11-03  08:07</span> </li>
                                                                        </ul>


                                                                        <img src="/barcode.png" alt="" />
                                                                    </div>

                                                                    <div className="barcode-id-details mt-2">
                                                                        <div>
                                                                            <h6>Patient Id </h6>
                                                                            <p>PS-9001</p>
                                                                        </div>


                                                                        <div>
                                                                            <h6>Appointment ID </h6>
                                                                            <p>OID-8876</p>
                                                                        </div>
                                                                    </div>

                                                                </div>

                                                                <div className="text-start mt-3">
                                                                    <button className="pdf-download-tbn py-2"><FontAwesomeIcon icon={faFilePdf} style={{ color: "#EF5350" }} /> Download Report</button>

                                                                </div>

                                                            </div>

                                                        </div>

                                                    </div>
                                                    <div className="col-lg-6 col-md-6 col-sm-12 mb-3">
                                                        <div className="qrcode-prescriptions-bx">
                                                            <div className="admin-table-bx d-flex align-items-center justify-content-between qr-cd-headr">
                                                                <div className="admin-table-sub-details final-reprt d-flex align-items-center gap-2">
                                                                    <img src="/reprt-plus.png" alt="" className="rounded-0" />
                                                                    <div>
                                                                        <h6 className="fs-16 fw-600 text-black">Final Diagnostic Report</h6>
                                                                        <p>RE-89767</p>

                                                                    </div>
                                                                </div>

                                                            </div>

                                                            <div className="barcode-active-bx">
                                                                <div className="d-flex align-items-center justify-content-between mb-3">
                                                                    <div className="admin-table-bx">
                                                                        <div className="">
                                                                            <div className="admin-table-sub-details d-flex align-items-center gap-2 doctor-title ">
                                                                                <div>
                                                                                    <h6 className="reprting-name">Advance Lab Tech</h6>
                                                                                    <p className="fs-14 fw-500">DO-4001</p>
                                                                                </div>
                                                                            </div>

                                                                        </div>
                                                                    </div>


                                                                </div>

                                                                <div className="barcd-scannr barcde-scnnr-card">
                                                                    <div className="barcd-content">
                                                                        <h4 className="fw-700 mb-2">SP-9879</h4>
                                                                        <ul className="qrcode-list mb-2">
                                                                            <li className="qrcode-item">Test  <span className="qrcode-title">: CBC</span></li>
                                                                            <li className="qrcode-item">Draw  <span className="qrcode-title"> : 25-11-03  08:07</span> </li>
                                                                        </ul>


                                                                        <img src="/barcode.png" alt="" />
                                                                    </div>

                                                                    <div className="barcode-id-details mt-2">
                                                                        <div>
                                                                            <h6>Patient Id </h6>
                                                                            <p>PS-9001</p>
                                                                        </div>


                                                                        <div>
                                                                            <h6>Appointment ID </h6>
                                                                            <p>OID-8876</p>
                                                                        </div>
                                                                    </div>

                                                                </div>

                                                                <div className="text-start mt-3">
                                                                    <button className="pdf-download-tbn py-2"><FontAwesomeIcon icon={faFilePdf} style={{ color: "#EF5350" }} /> Download Report</button>

                                                                </div>

                                                            </div>

                                                        </div>

                                                    </div>
                                                    <div className="col-lg-6 col-md-6 col-sm-12 mb-3">
                                                        <div className="qrcode-prescriptions-bx">
                                                            <div className="admin-table-bx d-flex align-items-center justify-content-between qr-cd-headr">
                                                                <div className="admin-table-sub-details final-reprt d-flex align-items-center gap-2">
                                                                    <img src="/reprt-plus.png" alt="" className="rounded-0" />
                                                                    <div>
                                                                        <h6 className="fs-16 fw-600 text-black">Final Diagnostic Report</h6>
                                                                        <p>RE-89767</p>

                                                                    </div>
                                                                </div>

                                                            </div>

                                                            <div className="barcode-active-bx">
                                                                <div className="d-flex align-items-center justify-content-between mb-3">
                                                                    <div className="admin-table-bx">
                                                                        <div className="">
                                                                            <div className="admin-table-sub-details d-flex align-items-center gap-2 doctor-title ">
                                                                                <div>
                                                                                    <h6 className="reprting-name">Advance Lab Tech</h6>
                                                                                    <p className="fs-14 fw-500">DO-4001</p>
                                                                                </div>
                                                                            </div>

                                                                        </div>
                                                                    </div>


                                                                </div>

                                                                <div className="barcd-scannr barcde-scnnr-card">
                                                                    <div className="barcd-content">
                                                                        <h4 className="fw-700 mb-2">SP-9879</h4>
                                                                        <ul className="qrcode-list mb-2">
                                                                            <li className="qrcode-item">Test  <span className="qrcode-title">: CBC</span></li>
                                                                            <li className="qrcode-item">Draw  <span className="qrcode-title"> : 25-11-03  08:07</span> </li>
                                                                        </ul>


                                                                        <img src="/barcode.png" alt="" />
                                                                    </div>

                                                                    <div className="barcode-id-details mt-2">
                                                                        <div>
                                                                            <h6>Patient Id </h6>
                                                                            <p>PS-9001</p>
                                                                        </div>


                                                                        <div>
                                                                            <h6>Appointment ID </h6>
                                                                            <p>OID-8876</p>
                                                                        </div>
                                                                    </div>

                                                                </div>

                                                                <div className="text-start mt-3">
                                                                    <button className="pdf-download-tbn py-2"><FontAwesomeIcon icon={faFilePdf} style={{ color: "#EF5350" }} /> Download Report</button>

                                                                </div>

                                                            </div>

                                                        </div>

                                                    </div> */}



                                                    </div>
                                                </div>

                                                <div className="tab-pane fade" id="contact" role="tabpanel">
                                                    <div className="row">
                                                        <div className="col-lg-12">
                                                            <div className="">
                                                                <div className="ovrview-bx mb-3">
                                                                    <h4 className="new_title">Medical History</h4>
                                                                    {/* <p className="">Robert Davis is a board-certified cardiologist with over 8 years of experience in diagnosing and treating heart conditions. She specializes in preventive cardiology and heart failure management.</p> */}
                                                                </div>

                                                                <div className="medical-history-content">
                                                                    <div>
                                                                        <h4 className="fz-16 fw-700">Do you have any chronic conditions?</h4>
                                                                        <h5 className="hearth-disese">{medicalHistory?.chronicCondition}</h5>
                                                                    </div>

                                                                    <div className="mt-3">
                                                                        <h4 className="fz-16 fw-700">Are you currently on any medications?</h4>
                                                                        <h5 className="hearth-disese">{medicalHistory?.onMedication ? 'Yes' : 'No'}</h5>
                                                                    </div>

                                                                </div>

                                                                <div className="medical-history-content my-3">
                                                                    <div>
                                                                        <h4 className="fz-16 fw-700">Medication Details</h4>
                                                                        <p>{medicalHistory?.medicationDetail}</p>

                                                                    </div>

                                                                    <div className="mt-3">
                                                                        <h4 className="fz-16 fw-700">Allergies</h4>
                                                                        <p>{medicalHistory?.allergies}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="ovrview-bx mb-3">
                                                                    <h4 className="new_title">Family Medical History</h4>
                                                                </div>
                                                                <div className="medical-history-content my-3">
                                                                    <div>
                                                                        <h4 className="fz-16 fw-700">Any family history of chronic disease?</h4>
                                                                        <h5 className="hearth-disese">{medicalHistory?.familyHistory?.chronicHistory}</h5>

                                                                    </div>

                                                                    <div className="mt-3">
                                                                        <h4 className="fz-16 fw-700">Chronic Diseases in Family</h4>
                                                                        <p> {medicalHistory?.familyHistory?.diseasesInFamiy}</p>
                                                                        {/* <p>Mother: Osteoarthritis</p>
                                                                    <p>Maternal Grandfather: Heart Disease</p>
                                                                    <p>Paternal Grandmother: Stroke</p> */}
                                                                    </div>

                                                                </div>

                                                                <div className="ovrview-bx mb-3">
                                                                    <h4 className="new_title">Prescriptions and Reports</h4>
                                                                </div>

                                                                <div className="row">
                                                                    {prescriptionData?.length > 0 &&
                                                                        prescriptionData?.map((item, key) =>
                                                                            <div className="col-lg-6 mb-3" key={key}>
                                                                                <div className="prescription-patients-card">
                                                                                    <div className="prescription-patients-picture">
                                                                                        <img src={item?.fileUrl ?
                                                                                            `${base_url}/${item?.fileUrl}` : '/patient-card-two.png'} alt=""
                                                                                            style={{ width: '600px', height: '200px', objectFit: 'cover' }} />
                                                                                    </div>
                                                                                    <div className="card-details-bx">
                                                                                        <div className="card-info-title">
                                                                                            <h3>{item?.diagnosticName}</h3>
                                                                                            <p>{item?.name}</p>
                                                                                        </div>

                                                                                        <div className="">
                                                                                            <button type="button" className="card-sw-btn"><FontAwesomeIcon icon={faEye} /></button>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                            </div>)}
                                                                    {/* 
                                                                <div className="col-lg-6">
                                                                    <div className="prescription-patients-card">
                                                                        <div className="prescription-patients-picture">
                                                                            <img src="/patient-card-two.png" alt="" />
                                                                        </div>
                                                                        <div className="card-details-bx">
                                                                            <div className="card-info-title">
                                                                                <h3>Prescriptions 8/21/2025</h3>
                                                                                <p>8/21/2025</p>
                                                                            </div>

                                                                            <div className="">
                                                                                <button type="button" className="card-sw-btn"><FontAwesomeIcon icon={faEye} /></button>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                </div> */}
                                                                </div>



                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-end mt-4">
                        <Link to={-1} className="nw-thm-btn rounded-3 outline" >
                            Go Back
                        </Link>
                    </div>
                    <div className="d-none">
                        <LabReportPdf appointmentId={pdfLoading} pdfLoading={pdfLoading} endLoading={() => setPdfLoading(false)} />
                    </div>
                    {/* <div className="col-lg-6 col-md-6 col-sm-12 mb-3 d-none" ref={reportRef}>
                    <div className="new-invoice-card">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div>
                                <h5 className="first_para fw-700 fz-20 mb-0">Final Diagnostic Report</h5>
                            </div>
                        </div>

                        <div className="laboratory-header mb-4">
                            <div className="laboratory-name">
                                <h5>{profiles?.name || 'Advance Lab Tech'}</h5>
                                <p><span className="laboratory-title">GSTIN :</span> {profiles?.gstNumber || '09897886454'}</p>
                            </div>
                            <div className="invoice-details">
                                <p><span className="laboratory-invoice">Invoice :</span> {appointmentData?.customId}</p>
                                <p><span className="laboratory-invoice">Date :</span> {new Date()?.toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-6 mb-3">
                                <div className="laboratory-bill-bx laboratory-nw-box">
                                    <h6>Patient </h6>
                                    <h4>{ptData?.name}</h4>
                                    <p><span className="laboratory-phne">ID :</span> {ptData.customId}</p>
                                    <p><span className="laboratory-phne">DOB:</span> {new Date(demoData?.dob)?.toLocaleDateString()}</p>
                                    <p><span className="laboratory-phne">Gender:</span> {ptData.gender?.toUpperCase()}</p>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="laboratory-bill-bx laboratory-sub-bx mb-2">
                                    <h6>Order </h6>
                                    <p><span className="laboratory-phne">Appointment ID :</span> OID-{appointmentData?.customId}  </p>
                                </div>
                                {appointmentData?.doctorId && <div className="laboratory-bill-bx laboratory-sub-bx">
                                    <h6 className="my-0">Doctor</h6>
                                    <h4 >Aarav Mehta</h4>
                                    <p><span className="laboratory-phne">ID :</span> OID-7C1B48  </p>
                                </div>}
                            </div>
                        </div>
                        <div className="laboratory-report-table mt-3">
                            <div className="table table-responsive mb-0 reprt-table">
                                <table className="table mb-0">
                                    <thead>
                                        <tr>
                                            <th>Test</th>
                                            <th>Unit</th>
                                            <th>Reference</th>
                                            <th>Result</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>

                                        {testData.map((test) => (
                                            test.component.map((cmp, index) => {
                                                const resultObj = allComponentResults[test._id]?.[index] || {};
                                                return (
                                                    <tr key={test._id + index}>
                                                        <td>{test.shortName} - {cmp.name}</td>
                                                        <td>{cmp.unit || "-"}</td>
                                                        <td>{cmp.referenceRange || "-"}</td>
                                                        <td>{resultObj.result || "-"}</td>
                                                        <td className="text-capitalize">{resultObj.status || "-"}</td>
                                                    </tr>
                                                );
                                            })
                                        ))}



                                    </tbody>
                                </table>

                            </div>
                        </div>

                        <div className="report-remark mt-3">
                            <h6>Remark</h6>
                            {testData.map((test) => (
                                <p key={test._id}>{allComments[test._id] || "-"}</p>
                            ))}
                        </div>
                        <div className="page-break"></div>
                        <div className="reprt-barcd flex-wrap mt-3">
                            {testData?.map((item, key) =>
                                <div className=" barcd-scannr" key={key}>
                                    <div className="barcd-content">
                                        <h4 className="my-3">SP-{item?._id?.slice(-5)}</h4>
                                        <ul className="qrcode-list">
                                            <li className="qrcode-item">Test  <span className="qrcode-title">: {item?.shortName}</span></li>
                                            <li className="qrcode-item">Draw  <span className="qrcode-title"> : {new Date(reportMeta[item._id]?.createdAt)?.toLocaleDateString()}</span> </li>
                                        </ul>
                                        <Barcode value={reportMeta[item._id]?.id} width={1} displayValue={false}
                                            height={60} />

                                    </div>
                                </div>)}
                        </div>
                        <div className="reprt-signature mt-5">
                            <h6>Signature:</h6>
                            <span className="reprt-mark"></span>
                        </div>
                    </div>
                </div> */}
                </div>}
        </>
    )
}

export default PatientsView