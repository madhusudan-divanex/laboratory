import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faClose, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getSecureApiData, updateApiData } from "../../services/api";
import base_url from "../../../baseUrl";
import { Link, NavLink } from "react-router-dom";
import Loader from "../Layouts/Loader";

function AppointmentRequest() {
    const userId = localStorage.getItem('userId')
    const [appointments, setAppointments] = useState([])
    const [totalPages, setTotalPage] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [allTest, setAllTest] = useState([])
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState({
        status: 'pending', paymentStatus: '', dateFrom: null,
        dateTo: null, test: null, patientName: ''
    })
    const fetchLabAppointment = async () => {
        setLoading(true)
        try {
            const response = await getSecureApiData(`lab/appointment/${userId}?page=${currentPage}&status=${filter.status}`);
            if (response.success) {
                // setCurrentPage(response.pagination.page)
                // setTotalPage(response.pagination.totalPages)
                setAppointments(response.data)
            } else {
                toast.error(response.message)
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false)
        }
    }
    const appointmentAction = async (id, status) => {
        setLoading(true)
        const data = { labId: userId, appointmentId: id, status }
        try {
            const response = await updateApiData(`appointment/lab-action`, data);
            if (response.success) {
                // setCurrentPage(response.pagination.page)
                // setTotalPage(response.pagination.totalPages)
                fetchLabAppointment()
            } else {
                toast.error(response.message)
            }
        } catch (err) {
            toast.error(err?.response?.data?.message);
        } finally {
            setLoading(false)
        }
    }
    const fetchLabTest = async () => {
        try {
            const response = await getSecureApiData(`lab/test/${userId}`);
            if (response.success) {
                // setCurrentPage(response.pagination.page)
                // setTotalPage(response.pagination.totalPages)
                setAllTest(response.data)
                // setTotalPage(response.totalPages)
            } else {
                toast.error(response.message)
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        }
    }
    useEffect(() => {
        fetchLabAppointment()
        // fetchLabTest()
    }, [])
    const filterSubmit = (e) => {
        e.preventDefault()
        const query = new URLSearchParams({
            status: filter.status,
            paymentStatus: filter.paymentStatus,
            dateFrom: filter.dateFrom || '',
            dateTo: filter.dateTo || '',
            test: filter.test || '',
            patientName: filter.patientName || '',
            currentPage,
        });

        getSecureApiData(`lab/appointment/${userId}?${query.toString()}`)
            .then(response => {
                if (response.success) {
                    setAppointments(response.data);
                    setTotalPage(response.totalPages)
                } else {
                    toast.error(response.message);
                }
            });
    }
    useEffect(() => {
        fetchLabAppointment()
    }, [currentPage])
    return (
        <>
            {loading ? <Loader />
                : <div className="main-content flex-grow-1 p-3 overflow-auto">
                    <form action="">
                        <div className="row mb-3">
                            <div className="mb-3">
                                <h3 className="innr-title">Appointment Request</h3>
                                <div className="admin-breadcrumb">
                                    <nav aria-label="breadcrumb">
                                        <ol className="breadcrumb custom-breadcrumb justify-content-start">
                                            <li className="breadcrumb-item">
                                                <NavLink to="/dashboard" className="breadcrumb-link">
                                                    Dashboard
                                                </NavLink>
                                            </li>
                                            <li
                                                className="breadcrumb-item "
                                                aria-current="page"
                                            >
                                                Appointment Request
                                            </li>
                                        </ol>
                                    </nav>
                                </div>
                            </div>
                            <div className="laboratory-appointment-box">
                                <div className="filters new-filters p-0">
                                    <div className="field custom-frm-bx mb-0">
                                        <label className="label">Status:</label>
                                        <select name="status" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
                                            <option value='pending'>Pending</option>
                                            <option value='rejected'>Reject</option>
                                            <option value='cancel'>Cancel</option>
                                        </select>
                                    </div>

                                    {/* <div className="field custom-frm-bx mb-0">
                                        <label className="label">Test:</label>
                                        <select name="test" value={filter.test} onChange={(e) => setFilter({ ...filter, test: e.target.value })}>
                                            <option value=''>All</option>
                                            {allTest?.map((item, key) =>
                                                <option value={item?._id}>{item?.shortName}</option>)}
                                        </select>
                                    </div> */}

                                    <div className="field custom-frm-bx mb-0">
                                        <label className="label">Date from:</label>
                                        <input type="date" className="" name="dateFrom" value={filter.dateFrom} onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })} />
                                    </div>

                                    <div className="field custom-frm-bx mb-0">
                                        <label className="label">Date to:</label>
                                        <input type="date" name="dateTo" value={filter.dateTo} onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })} />
                                    </div>

                                    <div>
                                        <button onClick={filterSubmit} className="nw-thm-btn" >Filter</button>

                                    </div>

                                </div>
                                <div className="text-end">
                                    <Link to={'/add-appointment'} className="nw-thm-btn">Add Appointment</Link>
                                </div>
                            </div>

                        </div>
                    </form>

                    <div className="row justify-content-between">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="custom-frm-bx">
                                <input type="text" className="form-control pe-5" placeholder="Search "
                                    name="name" value={filter.name} onChange={(e) => setFilter({ ...filter, name: e.target.value })} />

                                <div className="search-item-bx">
                                    <button onClick={filterSubmit} className="search-item-btn"><FontAwesomeIcon icon={faSearch} /></button>
                                </div>

                            </div>

                            <div>
                                <div className="page-selector d-flex align-items-center">

                                    <div className="custom-frm-bx">
                                        <select
                                            className="form-select custom-page-dropdown nw-custom-page"
                                            name="currentPage"
                                            value={currentPage}
                                            onChange={(e) => setCurrentPage(e.target.value)}
                                        >
                                            {Array.from({ length: totalPages }, (_, i) => (
                                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                                            ))}
                                        </select>
                                    </div>

                                </div>
                            </div>
                        </div>



                    </div>

                    <div className="row">
                        <div className="col-lg-12 col-md-12 col-sm-12">
                            <div className="table-section mega-table-section">
                                <div className="table table-responsive mb-0">
                                    <table className="table mb-0">
                                        <thead>
                                            <tr>
                                                <th>S.no.</th>
                                                <th>Patient Name</th>
                                                <th>Date</th>
                                                <th>Test</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {appointments?.length > 0 ?
                                                appointments?.map((item, key) =>
                                                    <tr key={key}>
                                                        <td>{key + 1}</td>
                                                        <td>
                                                            <div className="admin-table-bx">
                                                                <div className="admin-table-sub-bx">
                                                                    <img src={item?.patientId?.patientId?.profileImage ? `${base_url}/${item?.patientId?.patientId?.profileImage}` : "/profile.png"}
                                                                        onError={(e) => {
                                                                            e.target.onerror = null;
                                                                            e.target.src = "/profile.png";
                                                                        }}
                                                                        alt="" />
                                                                    <div className="admin-table-sub-details">
                                                                        <h6>{item?.patientId?.name} </h6>
                                                                        <p>ID: {item?.patientId?.nh12}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>{new Date(item?.date).toLocaleDateString("en-GB", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric"
                                                        })}
                                                        </td>
                                                        <td>
                                                            {/* {item?.testId?.map((item) => item?.shortName + ',')} */}
                                                            <ul className="admin-test-list">
                                                                {item?.subCatId?.map((test, key) =>
                                                                    <li className="admin-test-item" key={key}>{test?.subCategory}</li>)}
                                                                {/* <li className="admin-test-item">Haemoglobin</li> */}
                                                            </ul>

                                                        </td>
                                                        <td>
                                                            {item?.status == 'rejected' && <span className="approved reject">Reject</span>}
                                                            {(item?.status !== 'rejected' && item?.status !== 'pending') &&
                                                                <span className={`text-capitalize paid`}>{item?.status}</span>}

                                                            {item?.status == 'pending' && <ul className="test-action-list">
                                                                <li className="test-action-item">
                                                                    <button
                                                                        onClick={() => appointmentAction(item._id, 'approved')}
                                                                        className="test-right-btn"
                                                                    >
                                                                        <FontAwesomeIcon icon={faCheck} />
                                                                    </button>
                                                                </li>
                                                                <li className="test-action-item">
                                                                    <button
                                                                        onClick={() => appointmentAction(item._id, 'rejected')}
                                                                        className="test-right-btn test-close-btn"
                                                                    >
                                                                        <FontAwesomeIcon icon={faClose} />
                                                                    </button>
                                                                </li>
                                                            </ul>}
                                                        </td>
                                                    </tr>)
                                                    : <tr>
                                                        <td colSpan="5" className="text-center">
                                                            No appointments request found.
                                                        </td>
                                                    </tr>}


                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-end mt-3">
                        <Link to={-1} className="nw-thm-btn rounded-3 outline" >
                            Go Back
                        </Link>
                    </div>


                </div>}
        </>
    )
}

export default AppointmentRequest