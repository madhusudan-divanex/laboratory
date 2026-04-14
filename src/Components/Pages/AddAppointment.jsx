import { faSearch, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaPlusCircle } from "react-icons/fa";
import { getSecureApiData, securePostData } from "../../services/api";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Select, Spin } from "antd";
import { FaSquarePlus } from "react-icons/fa6";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Loader from "../Layouts/Loader";
function AddAppointment() {
    const navigate = useNavigate()
    const userId = localStorage.getItem('userId')
    const [allTest, setAllTest] = useState([])
    const [patientId, setPatientId] = useState()
    const [aptDate, setAptDate] = useState({ date: null, time: null })
    const [selectedTest, setSelectedTest] = useState([''])
    const [ptName, setPtName] = useState('')
    const [loading, setLoading] = useState(false);
    const [allPatient, setAllPatient] = useState([])
    const [userData, setUserData] = useState()
    const fetchLabTest = async () => {
        try {
            const response = await getSecureApiData(`lab/test/${userId}`);
            if (response.success) {
                setAllTest(response.data)
            } else {
                toast.error(response.message)
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        }
    }
    const fetchUserProfile = async () => {
        setLoading(true)
        try {
            const response = await getSecureApiData(`patient/all?limit=100000`);
            if (response.success) {
                const formattedOptions = response.data.map(user => ({
                    value: user._id,   // or user._id depending on your data
                    label: user.name, // display name
                }));
                setAllPatient(formattedOptions)
                setLoading(false)
            } else {
                toast.error(response.message)
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        }
    }
    useEffect(() => {
        if (userId) {
            fetchLabTest()
        }
        fetchUserProfile()
    }, [userId])
    const handleAddTest = () => {
        setSelectedTest([...selectedTest, ""]);
    };
    const handleRemoveTest = (index) => {
        const updatedTests = selectedTest.filter((_, i) => i !== index);
        setSelectedTest(updatedTests);
    };
    const handleChange = (index, value) => {
        const updatedTests = [...selectedTest];
        updatedTests[index] = value;
        setSelectedTest(updatedTests);
    };
    const appointmentSubmit = async (e) => {
        e.preventDefault()
        if (selectedTest[0] === '') {
            return
        }
        setLoading(true)
        const selectedTestsDetails = allTest.filter((test) =>
            selectedTest.includes(test._id)
        );
        const totalFee = selectedTestsDetails.reduce(
            (acc, item) => acc + Number(item?.price),
            0
        );
        const data = {
            patientId: userData?._id, status: 'approved',
            testId: selectedTest,
            date: aptDate.date && aptDate.time
                ? new Date(`${aptDate.date}T${aptDate.time}`)
                : null, labId: userId, fees: totalFee
        }
        try {
            const response = await securePostData(`appointment/lab`, data)
            if (response.success) {
                setAptDate({ date: null, time: null })
                setSelectedTest([''])
                toast.success("Appointment created successfully")
                navigate('/test-reports-appointment')
            } else {
                toast.error(response.message)
            }
        } catch (error) {
            toast.error(error?.response?.data?.message)
        } finally {
            setLoading(false)
        }
    }
    const [nh12, setNh12] = useState('')
    async function fetchPatient() {
        if (nh12?.length < 12) {
            toast.error("Please enter valid id")
        }
        setLoading(true)
        try {
            const result = await getSecureApiData(`api/comman/user-data/${nh12}`)
            if (result.success) {
                if (result.data.role !== "patient") {
                    return toast.error("The user is not registerd for patient")
                }
                setUserData(result.data)
            } else {
                toast.error(result.message)
            }
        } catch (error) {

        } finally {
            setLoading(false)
        }
    }
    return (
        <>
            {loading ? <Loader />
                : <div className="main-content flex-grow-1 p-3 overflow-auto">
                    <div className="row mb-3">
                        <div>
                            <h3 className="innr-title mb-2 gradient-text">Add Appointment</h3>
                            <div className="admin-breadcrumb">
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb custom-breadcrumb justify-content-start">
                                        <li className="breadcrumb-item">
                                            <NavLink to="/dashboard" className="breadcrumb-link">
                                                Dashboard
                                            </NavLink>
                                        </li>
                                        <li className="breadcrumb-item">
                                            <a href="#" className="breadcrumb-link">
                                                Appointment
                                            </a>
                                        </li>
                                        <li
                                            className="breadcrumb-item active"
                                            aria-current="page"
                                        >
                                            Add Appointment
                                        </li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={appointmentSubmit} className='new-panel-card'>

                        <div className="new-panel-card mb-3">
                            <form action="">
                                <div className="row">
                                    <div>
                                        <h4 className="fz-18 fw-700 text-black">Appointment Details</h4>
                                        <p className="fw-400 fz-16">Enter the details for the new appointment.</p>
                                    </div>

                                    <div className="col-lg-6 col-md-6 col-sm-12">
                                        <div className="custom-frm-bx">
                                            <label htmlFor="">Appointment Date</label>
                                            <input onChange={(e) => setAptDate({ ...aptDate, date: e.target.value })}
                                                min={new Date().toISOString().split("T")[0]}
                                                type="date" className="form-control nw-frm-select" />
                                        </div>
                                    </div>

                                    <div className="col-lg-6 col-md-6 col-sm-12">
                                        <div className="custom-frm-bx">
                                            <label htmlFor="">Appointment Time</label>
                                            <input
                                                min={new Date().toISOString().split("T")[0]}
                                                onChange={(e) => setAptDate({ ...aptDate, time: e.target.value })} type="time" className="form-control nw-frm-select" />
                                        </div>
                                    </div>

                                </div>
                            </form>
                        </div>


                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-12 mb-3">
                                <div className="new-panel-card">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap">
                                        <div>
                                            <h4 className="fz-18 fw-700 text-black">Select Patient</h4>
                                            <p className="fw-400 fz-16">select a patient for this appointment.</p>
                                        </div>

                                        {/* <div>
                                        <button className="nw-exprt-btn">
                                            <FaPlusCircle />  Add Patient
                                        </button>
                                    </div> */}

                                    </div>

                                    <div className="custom-frm-bx">
                                        <label htmlFor="">Patient</label>
                                        <div className="d-flex gap-2">

                                            <input type="text" className="form-control" value={nh12}
                                                onChange={(e) => setNh12(e.target.value)} />
                                            <button className="thm-btn" type="button" onClick={() => fetchPatient()}>
                                                <FontAwesomeIcon icon={faSearch} /></button>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* <div className="col-lg-6 col-md-6 col-sm-12 mb-3">
                            <div className="new-panel-card">
                                <div className="d-flex align-items-center justify-content-between flex-wrap">
                                    <div>
                                        <h4 className="fz-18 fw-700 text-black">Select Doctor</h4>
                                        <p className="fw-400 fz-16">Choose a doctor for this appointment.</p>
                                    </div>
                                </div>

                                <div className="custom-frm-bx">
                                    <label htmlFor="">Doctor</label>
                                    <div class="select-wrapper">
                                        <select disabled class="form-select nw-control-frm">
                                            <option>---Select Doctor ---</option>
                                        </select>
                                    </div>

                                </div>
                            </div>
                        </div> */}

                            <div className="col-lg-6 col-md-6 col-sm-12 mb-3">
                                <div className="new-panel-card">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap">
                                        <div>
                                            <h4 className="fz-18 fw-700 text-black">Lab Test</h4>
                                            <p className="fw-400 fz-16">Select lab test and book appointment.</p>
                                        </div>


                                    </div>
                                    {selectedTest?.map((item, key) => (
                                        <div className="col-lg-12" key={key}>
                                            <div className="custom-frm-bx">
                                                <label htmlFor="">Add Lab Test</label>
                                                <div className="d-flex align-items-center gap-2">
                                                    <select
                                                        value={item}
                                                        required
                                                        onChange={(e) => handleChange(key, e.target.value)}
                                                        className="form-select"
                                                    >
                                                        <option value="">Select Test</option>
                                                        {allTest
                                                            ?.filter(
                                                                (t) =>
                                                                    // Allow tests that are not already selected OR the current one (to allow reselecting it)
                                                                    !selectedTest.includes(t._id) || t._id === item
                                                            )
                                                            .map((t) => (
                                                                <option key={t._id} value={t._id}>
                                                                    {t.shortName}
                                                                </option>
                                                            ))}
                                                    </select>

                                                    <button
                                                        className="text-black"
                                                        disabled={selectedTest?.length === 1}
                                                        onClick={() => handleRemoveTest(key)}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="d-flex align-items-center gap-2 justify-content-end">
                                        <button onClick={handleAddTest}
                                            type="button"
                                            className="fz-16 fw-700 " style={{ color: "#34A853" }}><FaSquarePlus /> Add </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {userData && <div className="row">
                            <h3>Patient Data</h3>
                            <div className="col-lg-4 col-md-6 col-sm-12 mb-3">

                                <div className="custom-frm-bx">
                                    <label htmlFor="">Patient Name  </label>
                                    <input type="text" className="form-control" value={userData?.name} readOnly />
                                </div>

                            </div>
                            <div className="col-lg-4 col-md-6 col-sm-12 mb-3">

                                <div className="custom-frm-bx">
                                    <label htmlFor="">Patient Email  </label>
                                    <input type="text" className="form-control" value={userData?.email} readOnly />
                                </div>

                            </div>
                            <div className="col-lg-4 col-md-6 col-sm-12 mb-3">

                                <div className="custom-frm-bx">
                                    <label htmlFor="">Patient Contact Number  </label>
                                    <input type="text" className="form-control" value={userData?.contactNumber} readOnly />
                                </div>

                            </div>

                        </div>}

                        <div className="d-flex justify-content-between mt-4">
                            <Link to={-1} className="nw-thm-btn rounded-3 outline" >
                                Go Back
                            </Link>
                            <button className="nw-thm-btn" type="submit" >Submit</button>
                        </div>
                    </form>
                </div>}
        </>
    )
}

export default AddAppointment