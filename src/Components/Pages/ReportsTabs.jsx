import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCopy,
    faDownload,
    faPaperPlane,
    faPen,
    faPlus,
    faPrint,

    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { IoCloudUploadOutline } from "react-icons/io5";
import { useEffect, useRef, useState} from "react";
import React from 'react'

import { FaSquarePlus } from "react-icons/fa6";
import { getSecureApiData, securePostData, updateApiData } from "../../services/api";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import html2pdf from "html2pdf.js";
import html2canvas from "html2canvas";
import Barcode from "react-barcode";
import { Tab } from "bootstrap/dist/js/bootstrap.bundle.min";
import Loader from "../Layouts/Loader";
import AddPatient from "./AddPatient";
import { Link, NavLink, useSearchParams } from "react-router-dom";

function ReportsTabs() {
    const [searchParams] = useSearchParams();
    const [addManual, setAddManual] = useState(false);
    const invoiceRef = useRef();
    const [hasLRx, setHasLRx] = useState(false);
    const reportRef = useRef()
    const compenentRef = useRef()
    const [appointmentId, setAppointmentId] = useState(null)
    const [inputPtId, setInputPtId] = useState(null)
    const [inputDoctorId, setInputDoctorId] = useState(null)
    const [patData, setPatData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [doctorData, setDoctorData] = useState(null)
    const userId = localStorage.getItem('userId')
    const [remark, setRemark] = useState('')
    const [isRemark, setIsRemark] = useState(false)
    const [payData, setPayData] = useState({ appointmentId: null, paymentStatus: 'due' })
    const [actData, setActData] = useState({ appointmentId: null, status: '' })
    const [appointmentData, setAppointmentData] = useState()
    const [demoData, setDemoData] = useState()
    const [testId, setTestId] = useState([]);
    const [testData, setTestData] = useState([]);
    const [allComponentResults, setAllComponentResults] = useState({});
    const [allComments, setAllComments] = useState({});
    const [allNames, setAllNames] = useState({});
    const [allReports, setAllReports] = useState({});
    const [reportMeta, setReportMeta] = useState({});
    const [selectedTest, setSelectedTest] = useState([''])
    const [allTest, setAllTest] = useState([])
    const [fullReportData, setFullReportData] = useState()
    const { isOwner, permissions } = useSelector(state => state.user)
    const [isCollected, setIsCollected] = useState(false)
    const { profiles, labPerson, labAddress, labImg,
        rating, avgRating, labLicense, isRequest } = useSelector(state => state.user)
    const [isSaving, setIsSaving] = useState(false)
    const fetchAppointmentData = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        const id = appointmentId || searchParams.get("appointmentId")
        if (!id) return toast.error("No appointment ID found");
        try {
            setIsSaving(true)
            const response = await getSecureApiData(`lab/appointment-data/${id}`)
            if (response.success) {
                if (!response?.data?.labStaff) {
                    return toast.error("Please assign the doctor first")
                }
                if (response.data.status === 'deliver-report') {
                    toast.success("Report already delivered for this appointment")
                    return
                } else {
                    toast.success("Appointment Fetched successfully")

                    setTestId(response.data.testId)
                    handleBack("profile-tab");
                    setAppointmentData(response.data)
                    setIsCollected(response?.data?.collectionDate ? true : false)
                }
            } else {
                toast.error(response.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message || "Something went wrong.")
        } finally {
            setIsSaving(false)
        }
    }
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
    useEffect(() => {
        if (userId) {
            fetchLabTest()
        }
    }, [userId])
    const subtotal = appointmentData?.testId
        ?.reduce((acc, item) => acc + Number(item?.price || 0), 0) || 0;

    const gst = subtotal * 0.05;
    const total = subtotal + gst;
    const fetchPtData = async () => {
        if (!appointmentData?.patientId?._id) {
            return
        }
        try {
            const response = await getSecureApiData(`patient/demographic/${appointmentData?.patientId?._id}`)
            if (response.success) {
                setDemoData(response.data)
            } else {
                toast.error(response.message)
            }
        } catch (error) {

        }
    }
    useEffect(() => {
        fetchPtData()
    }, [appointmentData])
    const fetchTestReport = async (testId) => {
        try {
            const payload = { testId, appointmentId: appointmentData?._id };
            const response = await securePostData('lab/test-report-data', payload);

            if (response.success && response.data) {
                setFullReportData(response.data)
                if (response.data.remark) {
                    setIsRemark(true)
                    setRemark(response.data.remark)
                }
                setReportMeta(prev => ({
                    ...prev,
                    [testId]: {
                        id: response.data?._id,
                        createdAt: response.data.createdAt
                    }
                }));
                return response.data;
            } else {
                return null;
            }
        } catch (err) {
            console.error(`Error fetching report for test ${testId}:`, err);
            return null;
        }
    };
    useEffect(() => {
        const fetchTestsOneByOne = async () => {
            if (testId.length === 0) return;
            const allTests = [];

            for (const id of testId) {
                try {
                    const response = await getSecureApiData(`lab/test-data/${id?._id}`);
                    if (response.success) {
                        const test = response.data;

                        // Fetch report for this test
                        const report = await fetchTestReport(test._id);

                        if (report) {
                            const mergedResults = {};
                            test.component.forEach((c, i) => {
                                const comp = report.component.find(rc => rc.cmpId === c._id);
                                mergedResults[i] = {
                                    result: comp?.result || "",
                                    status: comp?.status || "",
                                };
                            });
                            // Set results and comments keyed by test._id
                            setAllComponentResults(prev => ({ ...prev, [test._id]: mergedResults }));
                            setAllComments(prev => ({ ...prev, [test._id]: report.upload.comment || "" }));
                            setAllNames(prev => ({ ...prev, [test._id]: report.name || "" }));


                        } else {
                            // If no report found, initialize empty for this test
                            setAllComponentResults(prev => ({ ...prev, [test._id]: {} }));
                            setAllComments(prev => ({ ...prev, [test._id]: "" }));
                            setAllNames(prev => ({ ...prev, [test._id]: "" }));
                        }

                        allTests.push(test);
                    } else {
                        // toast.error(response.message);
                    }
                } catch (err) {
                    console.error(`Error fetching test ${id}:`, err);
                }
            }

            setTestData(allTests);
        };

        fetchTestsOneByOne();
    }, [testId]);
    useEffect(() => {
        console.log("Received testId:", testId);
    }, [testId]);

    const handleDownload = () => {
        const element = invoiceRef.current;
        document.body.classList.add("hide-buttons");
        const opt = {
            margin: 0.5,
            filename: "invoice.pdf",
            html2canvas: { scale: 2 },
            jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
        };

        html2pdf().from(element).set(opt).save().then(() => {
            document.body.classList.remove("hide-buttons");
        });
    };
    const reportDownload = () => {
        const element = reportRef.current;

        document.body.classList.add("hide-buttons");

        const opt = {
            margin: [0.2, 0.2, 0.2, 0.2],
            filename: "report.pdf",
            image: { type: "jpeg", quality: 1 },
            html2canvas: { scale: 3, useCORS: true },
            jsPDF: {
                unit: "mm",
                format: "a4",
                orientation: "portrait"
            }
        };

        html2pdf()
            .from(element)
            .set(opt)
            .save()
            .then(() => {
                document.body.classList.remove("hide-buttons");
            });
    };
    const labelDownload = () => {
        if (!compenentRef.current) {
            console.error('print area not found');
            return;
        }

        const printContents = compenentRef.current.innerHTML;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload(); // optional if needed

    };
    const appointmentAction = async (type, status) => {

        let data = {}

        try {
            if (type == 'status') {
                data = { type, labId: userId, appointmentId: appointmentData?._id, status }
                const response = await updateApiData(`appointment/lab-action`, data);
                if (response.success) {
                    const res = await getSecureApiData(`lab/appointment-data/${appointmentId}`)
                    if (res.success) {
                        setTestId(res.data.testId)
                        setAppointmentData(res.data)
                    } else {
                        toast.error(res.message)
                    }
                    if (type === 'payment') {
                        handleBack("upload-tab");
                    }
                    if (type === 'status') {
                        handleBack("contact-tab");
                    }
                } else {
                    toast.error(response.message)
                }
            }
            else if (type == 'payment') {
                data = { type, labId: userId, appointmentId: appointmentData?._id, paymentStatus: status }
                const response = await updateApiData(`appointment/lab/payment-action`, data);
                if (response.success) {
                    const res = await getSecureApiData(`lab/appointment-data/${appointmentId}`)
                    if (res.success) {
                        setTestId(res.data.testId)
                        setAppointmentData(res.data)
                    } else {
                        toast.error(res.message)
                    }
                    // if (type === 'payment') {
                    //     handleBack("upload-tab");
                    // }
                    // if (type === 'status') {
                    //     handleBack("contact-tab");
                    // }
                } else {
                    toast.error(response.message)
                }
            }
        } catch (err) {
            console.log(err)
            toast.error(err?.response?.data?.message || "Something went wrong");
        }
    }
    const fetchInputPtData = async () => {
        if (inputPtId?.length < 8) {
            return
        }
        if (patData && inputPtId?.length > 8) {
            return
        }
        try {
            const response = await getSecureApiData(`patient/${inputPtId}`)
            if (response.success) {

                setPatData(response.data)
            } else {
                toast.error(response.message)
            }
        } catch (error) {

        }
    }
    useEffect(() => {
        if (inputPtId) {
            fetchInputPtData()
        }
    }, [inputPtId])
    const fetchInputDoctorData = async () => {
        if (inputDoctorId?.length < 8) {
            return
        }
        if (patData && inputDoctorId?.length > 8) {
            return
        }
        try {
            const response = await getSecureApiData(`doctor/${inputDoctorId}`)
            if (response.success) {
                setDoctorData(response.data)
            } else {
                toast.error(response.message)
            }
        } catch (error) {

        }
    }
    useEffect(() => {
        if (inputDoctorId) {
            fetchInputDoctorData()
        }
    }, [inputDoctorId])
    const appointmentSubmit = async (e) => {
        e.preventDefault()
        if (selectedTest[0] === '') {
            return
        }
        const selectedTestsDetails = allTest.filter((test) =>
            selectedTest.includes(test._id)
        );
        const totalFee = selectedTestsDetails.reduce(
            (acc, item) => acc + Number(item?.price),
            0
        );
        const data = {
            patientId: patData?.userId, status: 'approved',
            testId: selectedTest,
            date: new Date(), labId: userId, fees: totalFee
        }
        try {
            const response = await securePostData(`appointment/lab`, data)
            if (response.success) {
                toast.success("Appointment created successfully")
                // setTestId(response.data.testId)
                const appId = response.data._id;
                setAppointmentId(appId)
                const res = await getSecureApiData(`lab/appointment-data/${appId}`)


                setTestId(res.data.testId)
                handleBack("profile-tab");
                setAppointmentData(res.data)


            } else {
                toast.error(response.message)
            }
        } catch (error) {

        }
    }
    const handleSave = async (e) => {
        e.preventDefault();
        if (!appointmentData?.collectionDate) {
            return toast.error("Please collect sample before saving the report")
        }
        setLoading(true);
        // Loop through each test (key is testId)
        for (const testId in allComponentResults) {
            // Find the test details (component titles, units, etc.)
            const testItem = testData.find(t => t._id === testId);
            if (!testItem) continue;

            // Build components array for API
            const components = testItem.component.map((comp, index) => ({
                cmpId: comp._id,
                result: allComponentResults[testId]?.[index]?.result || "",
                status: allComponentResults[testId]?.[index]?.status || ""
            }));
            // const payload = {
            //     labId: userId,
            //     patientId: appointmentData.patientId,
            //     testId,
            //     appointmentId: appointmentData._id,
            //     component: components,manual:{comment:allComments?.[testId],
            //         name:allNames?.[testId]
            //     },
            //     remark
            // };
            const formData = new FormData();
            formData.append('labId', userId)
            formData.append('patientId', appointmentData.patientId?._id)
            formData.append('testId', testId)
            formData.append('appointmentId', appointmentData._id)
            formData.append('remark', remark)
            formData.append('component', JSON.stringify(components))
            formData.append('manualComment', allComments?.[testId] || "")
            formData.append('manualName', allNames?.[testId] || "")
            formData.append('report', allReports?.[testId] || "")

            try {
                const response = await securePostData("lab/test-report", formData);

                if (response.success) {

                    // toast.success(`Report saved for test ID: ${testId}`);
                } else {
                    toast.error(response.message);
                }
            } catch (err) {
                console.error("Error saving report:", err);
                toast.error("Failed to save report.");
            } finally {
                setLoading(false);
            }
        }
        handleBack("person-tab");
        toast.success('Report saved') // refresh data
    };
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
            toast.error(err?.response?.data?.message || "Something went wrong");
        }
    }

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
    const handleBack = (name) => {
        // e.preventDefault(); // prevent page reload
        const tabTrigger = document.getElementById(name); // the tab button for "contact"
        console.log(tabTrigger)
        if (!tabTrigger) return;
        const tab = new window.bootstrap.Tab(tabTrigger);
        tab.show();
    };
    const handleClose = async (id) => {
        const response = await getSecureApiData(`patient/${id}`)
        if (response.success) {
            setInputPtId(id);
            setAddManual(false);

            setPatData(response.data)
        } else {
            toast.error(response.message)
        }
    }
    useEffect(() => {
        const addPatient = searchParams.get("addPatient");

        if (addPatient === "true") {
            setAddManual(true);
        }
        const isGenerate = searchParams.get("appointmentId")
        if (isGenerate) {
            setHasLRx(true)
            setAppointmentId(searchParams.get("appointmentId"))
            fetchAppointmentData()


        }
    }, [searchParams]);
    async function sampleCollected() {
        try {
            const res = await securePostData('lab/test-sample', { appointmentId: appointmentData?._id })
            if (res.success) {
                setIsCollected(true)
                toast.success("Sample collected")
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong")
        }
    }
    return (
        <>
            {loading ? <Loader />
                : <div className="main-content flex-grow-1 p-3 overflow-auto">
                    <div className="row mb-3">
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <h3 className="innr-title">Report</h3>
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
                                                Reports
                                            </li>
                                        </ol>
                                    </nav>
                                </div>
                            </div>

                            <div>
                                <button className="patient-thm-btn nw-thm-btn" onClick={() => setAddManual(!addManual)}>
                                    <FontAwesomeIcon icon={faPlus} /> {addManual ? "Back" : "Add Manual"}</button>
                            </div>

                        </div>
                    </div>

                    <div className="lab-chart-crd">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="lab-tp-title patient-bio-tab lab-profile-bio-tab">
                                    <div>
                                        <h6 className="mb-0">Report</h6>
                                    </div>
                                </div>

                                <div className="patient-bio-tab patient-edit-bio-tab employee-tabs">
                                    <ul className="nav nav-tabs gap-3 rounded-0" id="myTab" role="tablist">
                                        <li className="nav-item" role="presentation">
                                            <a
                                                className="nav-link active"
                                                id="home-tab"
                                                data-bs-toggle="tab"
                                                href="#home"
                                                role="tab"
                                            >
                                                Intake
                                            </a>
                                        </li>

                                        <li className="nav-item" role="presentation">
                                            <a
                                                className="nav-link"
                                                disabled={!appointmentData}
                                                id="profile-tab"
                                                data-bs-toggle="tab"
                                                href="#profile"
                                                role="tab"
                                            >
                                                Billing
                                            </a>
                                        </li>


                                        <li className="nav-item" role="presentation">
                                            <a
                                                className="nav-link"
                                                disabled={!appointmentData}
                                                id="collection-tab"
                                                data-bs-toggle="tab"
                                                href="#collection"
                                                role="tab"
                                            >
                                                Collection
                                            </a>
                                        </li>
                                        <li className="nav-item" role="presentation">
                                            <a
                                                className="nav-link"
                                                disabled={!appointmentData}
                                                id="upload-tab"
                                                data-bs-toggle="tab"
                                                href="#upload"
                                                role="tab"
                                            >
                                                Labels
                                            </a>
                                        </li>

                                        <li className="nav-item" role="presentation">
                                            <a
                                                className="nav-link"
                                                disabled={!appointmentData}
                                                id="contact-tab"
                                                data-bs-toggle="tab"
                                                href="#contact"
                                                role="tab"
                                            >
                                                Add report upload
                                            </a>
                                        </li>


                                        <li className="nav-item" role="presentation">
                                            <a
                                                className="nav-link"
                                                id="person-tab"
                                                data-bs-toggle="tab"
                                                href="#person"
                                                disabled={appointmentData?.status !== "deliver-report"}
                                                role="tab"
                                            >
                                                Report
                                            </a>
                                        </li>
                                    </ul>

                                    <div className="tab-content mt-4" id="myTabContent">
                                        <div
                                            className="tab-pane fade show active"
                                            id="home"
                                            role="tabpanel"
                                        >
                                            {addManual ? <AddPatient handleClose={handleClose} />
                                                : <div className="sub-tab-brd">
                                                    <div className="new-invoice-card">
                                                        <form action="">
                                                            <div className="">
                                                                <div>
                                                                    <h6 className="qrcode-title fw-700 fz-20 mb-0">Intake</h6>
                                                                </div>
                                                                <div className="form-check custom-check">
                                                                    <input
                                                                        className="form-check-input"
                                                                        type="checkbox"
                                                                        id="reportsList"
                                                                        checked={hasLRx}
                                                                        onChange={(e) => setHasLRx(e.target.checked)}
                                                                    />
                                                                    <label className="form-check-label" htmlFor="reportsList">
                                                                        Has L-Rx
                                                                    </label>
                                                                </div>

                                                                {/* When checkbox is checked — show only one input */}
                                                                {hasLRx ? (
                                                                    <div className="row">
                                                                        <div className="border-bottom">
                                                                            <div className="col-lg-4 col-md-4 col-sm-12">
                                                                                <div className="custom-frm-bx">
                                                                                    <label htmlFor="">Appointment ID </label>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="form-control"
                                                                                        value={appointmentId}
                                                                                        onChange={(e) => setAppointmentId(e.target.value)}
                                                                                        placeholder="Enter Appointment ID "
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                ) : (
                                                                    // When unchecked — show full form
                                                                    <>
                                                                        <div className="row">
                                                                            <div className="col-lg-4 col-md-6 col-sm-12">
                                                                                <div className="custom-frm-bx">
                                                                                    <label>Patient Id</label>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="form-control"
                                                                                        placeholder="Patient Id"
                                                                                        value={inputPtId}
                                                                                        onChange={(e) => {
                                                                                            setInputPtId(e.target.value)
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-lg-4 col-md-6 col-sm-12">
                                                                                <div className="custom-frm-bx">
                                                                                    <label>Patient Name</label>
                                                                                    <input
                                                                                        type="text"
                                                                                        disabled
                                                                                        value={patData?.name}
                                                                                        className="form-control"
                                                                                        placeholder="Enter Patient Name"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-lg-4 col-md-6 col-sm-12">
                                                                                <div className="custom-frm-bx">
                                                                                    <label>Phone Number</label>
                                                                                    <input
                                                                                        type="text"
                                                                                        disabled
                                                                                        value={patData?.contactNumber}

                                                                                        className="form-control"
                                                                                        placeholder="Enter Phone Number"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-lg-4 col-md-6 col-sm-12">
                                                                                <div className="custom-frm-bx">
                                                                                    <label>DOB</label>

                                                                                    <input type="date" disabled
                                                                                        value={patData?.dob ? new Date(patData.dob).toISOString().split("T")[0] : ""}
                                                                                        className="form-control" />
                                                                                </div>
                                                                            </div>

                                                                            <div className="col-lg-4 col-md-6 col-sm-12">
                                                                                <div className="custom-frm-bx">
                                                                                    <label>Gender</label>
                                                                                    <select
                                                                                        value={patData?.gender}
                                                                                        disabled className="form-select">
                                                                                        <option value="">Select Gender</option>
                                                                                        <option value="Male">Male</option>
                                                                                        <option value="Female">Female</option>
                                                                                        <option value="Other">Other</option>

                                                                                    </select>
                                                                                </div>
                                                                            </div>

                                                                        </div>
                                                                        <div className="row">
                                                                            <div className="col-lg-4 col-md-6 col-sm-12">
                                                                                <div className="custom-frm-bx">
                                                                                    <label>Doctor Id</label>
                                                                                    <input
                                                                                        type="text"
                                                                                        value={inputDoctorId}
                                                                                        onChange={(e) => setInputDoctorId(e.target.value)}
                                                                                        className="form-control"
                                                                                        placeholder="Enter Doctor Id"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-lg-4 col-md-6 col-sm-12">
                                                                                <div className="custom-frm-bx">
                                                                                    <label>Doctor Name</label>
                                                                                    <input
                                                                                        type="text"
                                                                                        disabled
                                                                                        value={doctorData?.name}
                                                                                        className="form-control"
                                                                                        placeholder="Enter Doctor Name"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-lg-12">
                                                                                <h6 className="qrcode-title fw-700 fz-20">Lab Test</h6>
                                                                            </div>

                                                                            {/* <div className="col-lg-12">
                                                                        <div className="custom-frm-bx">
                                                                            <label htmlFor=""> Add lab Test</label>
                                                                            <div className="d-flex align-items-center gap-2">
                                                                                <input
                                                                                    type="text"
                                                                                    className="form-control"
                                                                                    placeholder=" Add lab Test"
                                                                                />

                                                                                <a href="javascript:void(0)" className="text-black"><FontAwesomeIcon icon={faTrash} /></a>
                                                                            </div>

                                                                        </div>
                                                                    </div> */}
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
                                                                    </>
                                                                )}


                                                                <div className="text-end pt-3" >
                                                                    <button disabled={isSaving} onClick={(e) => hasLRx ? fetchAppointmentData(e) : appointmentSubmit(e)} className="nw-thm-btn rounded-4">{isSaving ? 'Processing...' : 'Proceed'}</button>
                                                                </div>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>}
                                        </div>

                                        <div className="tab-pane fade" id="profile" role="tabpanel">
                                            <div className="sub-tab-brd">
                                                <div className="row">
                                                    <div className="col-lg-6 col-md-12 col-sm-12 mb-3">
                                                        {appointmentData && <div className="new-invoice-card" ref={invoiceRef}>
                                                            <div className="d-flex align-items-center justify-content-between mb-3">
                                                                <div>
                                                                    <h5 className="first_para fw-700 fz-20 mb-0">Invoice</h5>
                                                                </div>
                                                                <div>
                                                                    <button className="print-btn" type="submit" onClick={handleDownload}> <FontAwesomeIcon icon={faDownload} /> Download PDF</button>
                                                                </div>
                                                            </div>

                                                            <div className="laboratory-header mb-4">
                                                                <div className="laboratory-name">
                                                                    <h5>{profiles?.name || 'Advance Lab Tech'}</h5>
                                                                    <p><span className="laboratory-title">GSTIN :</span> {profiles?.gstNumber}</p>
                                                                </div>
                                                                {appointmentData?.invoiceId?.customId &&
                                                                    <div className="invoice-details">
                                                                        <p><span className="laboratory-invoice">Invoice :</span> IN{appointmentData?.invoiceId?.customId}</p>
                                                                        <p><span className="laboratory-invoice">Date :</span> {new Date(appointmentData?.invoiceId?.createdAt).toLocaleDateString(('en-GB'))}</p>
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
                                                                    {appointmentData?.testId?.map((item, key) =>
                                                                        <li className="laboratory-item border-0" key={key}>
                                                                            <span>{item?.shortName}</span> <span>{item?.price}</span></li>)}
                                                                </ul>
                                                                <div className="lab-amount-bx">
                                                                    <ul className="lab-amount-list">
                                                                        {/* <li className="lab-amount-item">Subtotal : <span className="price-title">{subtotal}</span></li>
                                                                        <li className="lab-amount-item lab-divider">GST (5%) :  <span className="price-title">{gst}</span></li> */}
                                                                        <li className="lab-amount-item">Total :  <span className="price-title">{total}</span></li>
                                                                    </ul>
                                                                </div>
                                                                {appointmentData?.paymentStatus === 'due' && <div className="text-end mt-5" >
                                                                    <button className="nw-thm-btn rounded-4" onClick={() => appointmentAction('payment', 'paid')}>Collect payment</button>
                                                                </div>}
                                                            </div>
                                                        </div>}
                                                    </div>
                                                </div>
                                                <div className="text-end mt-3" >
                                                    <button className="nw-thm-btn rounded-4" onClick={(e) => handleBack("collection-tab")}>Next</button>
                                                </div>
                                            </div>
                                        </div>



                                        {appointmentData && <div className="tab-pane fade" id="collection" role="tabpanel">
                                            <div className="sub-tab-brd">
                                                <div className="">
                                                    <div className="row">
                                                        <div className="col-lg-6 col-md-6 col-sm-12 mb-3">
                                                            <div className="new-invoice-card">
                                                                <div>
                                                                    <h5 className="first_para fw-700 fz-20">Collect Samples</h5>
                                                                </div>
                                                                <div className="">

                                                                    <ul className="appointment-booking-list">
                                                                        {testData?.map((t, key) =>
                                                                            t?.sample?.map((item) =>
                                                                                <>
                                                                                    <li key={key} className="appoint-item sample-item "> {item?.type}-: {item?.volume}</li>
                                                                                </>
                                                                            ))}
                                                                    </ul>

                                                                    {!isCollected && <div className="mt-3" >
                                                                        <button onClick={sampleCollected} className="collected-btn">Mark Collected</button>
                                                                    </div>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-6 col-md-6 col-sm-12 mb-3">
                                                            {testData?.map((item, key) =>
                                                                <div className="new-invoice-card" key={key}>
                                                                    <div>
                                                                        <h5 className="first_para fw-700 fz-20 text-capitalize">{item?.packageType} Plan</h5>
                                                                    </div>
                                                                    <div className="row">
                                                                        <div className="col-lg-6 mb-3" >
                                                                            <div className="laboratory-bill-bx">
                                                                                <h4>{item?.code}</h4>
                                                                                <p><span className="laboratory-phne">Test :</span> {item?.shortName}</p>
                                                                                <p><span className="laboratory-phne text-capitalize">Category :</span> {item?.testCategory}</p>
                                                                                <p><span className="laboratory-phne">Special Approval :</span> {item?.specialApproval ? 'Yes' : 'No'}</p>
                                                                                <p><span className="laboratory-phne text-capitalize">Fasting :</span> {item?.fastingRequired ? 'Yes' : 'No'}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-end mt-3" >
                                                    <button className="nw-thm-btn rounded-4" onClick={(e) => handleBack("upload-tab")}>Next</button>
                                                </div>
                                            </div>
                                        </div>}
                                        <div className="tab-pane fade" id="upload" role="tabpanel">
                                            <div className="sub-tab-brd ">
                                                {appointmentData && <div className="new-invoice-card">
                                                    <div className="row">
                                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                                            <div>
                                                                <h5 className="first_para fw-700 fz-20 mb-0">Preview</h5>
                                                            </div>
                                                            <div>
                                                                <button onClick={labelDownload} className="print-btn no-print"> <FontAwesomeIcon icon={faPrint} /> Print</button>
                                                            </div>
                                                        </div>

                                                        <div ref={compenentRef} className="row">
                                                            {testData?.map((item, key) =>
                                                                <div className="col-lg-3 col-md-4 col-sm-12 mb-3" key={key}>
                                                                    <div className=" barcd-scannr" >
                                                                        <div className="barcd-content">
                                                                            <h4 className="my-3">{item?.code}</h4>
                                                                            <ul className="qrcode-list">
                                                                                <li className="qrcode-item">Test  <span className="qrcode-title">: {item?.shortName}</span></li>
                                                                                {appointmentData?.collectionDate && <li className="qrcode-item">Draw  <span className="qrcode-title"> {new Date(appointmentData?.collectionDate)?.toLocaleDateString()}</span> </li>}
                                                                            </ul>

                                                                            {/* <img src="/barcode.png" alt="" /> */}
                                                                            <Barcode value={`${appointmentData?.customId}?test=${testData?._id}`} width={1} displayValue={false}
                                                                                height={60} />
                                                                        </div>
                                                                        <div className="barcode-id-details">
                                                                            <div>
                                                                                <h6>Patient Id </h6>
                                                                                <p>{appointmentData?.patientId?.nh12}</p>
                                                                            </div>


                                                                            <div>
                                                                                <h6>Appointment ID </h6>
                                                                                <p>OID-{appointmentData?.customId}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>)}

                                                        </div>
                                                    </div>
                                                    <div className="text-end mt-3" >
                                                        <button className="nw-thm-btn rounded-4" onClick={(e) => handleBack("contact-tab")}>Next</button>
                                                    </div>
                                                </div>}
                                            </div>
                                        </div>
                                        {appointmentData &&
                                            <form onSubmit={handleSave} className="tab-pane fade" id="contact" role="tabpanel">
                                                <div className="sub-tab-brd">
                                                    <div className="row">
                                                        <div className="col-lg-6">
                                                            <div className="new-invoice-card mb-3">
                                                                <div className="">
                                                                    <ul className="appointment-booking-list">
                                                                        <li className="appoint-item"> Appointment Book Date : <span className="appoint-title">{new Date(appointmentData?.createdAt)?.toLocaleDateString(('en-GB'))}</span></li>
                                                                        <li className="appoint-item"> Visited  date : <span className="appoint-title">{new Date(appointmentData?.date)?.toLocaleDateString(('en-GB'))}</span></li>
                                                                        <li className="appoint-item"> Appointment Completed date : <span className="appoint-title">{appointmentData?.status == 'deliver-report' ?
                                                                            new Date(appointmentData?.updatedAt)?.toLocaleDateString(('en-GB')) : '-'}</span></li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                            <div className="new-invoice-card">
                                                                {testData.map((item, key) =>
                                                                    <div className="sub-tab-brd mb-3" key={key}>
                                                                        <div className="custom-frm-bx">
                                                                            <label htmlFor="">{item?.shortName}</label>
                                                                            <input type="text" className="form-control" placeholder={item?.shortName}
                                                                                value={allNames[item?._id]}
                                                                                onChange={(e) =>
                                                                                    setAllNames(prev => ({
                                                                                        ...prev,
                                                                                        [item?._id]: e.target.value
                                                                                    }))
                                                                                } />
                                                                        </div>
                                                                        <div className="custom-frm-bx">
                                                                            <label htmlFor="">Upload certificate</label>
                                                                            <div className="upload-box p-3 nw-upload-bx   justify-content-center ">
                                                                                <div className="upload-icon mb-2">
                                                                                    <IoCloudUploadOutline />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="fw-semibold mb-1">
                                                                                        <label htmlFor={`fileInput-${item?._id}`} className="file-label file-select-label">
                                                                                            Choose a file or drag & drop here
                                                                                        </label>
                                                                                    </p>
                                                                                    {/* <small className="format-title">JPEG Format</small> */}
                                                                                    <div className="mt-3">
                                                                                        <label htmlFor={`fileInput-${item?._id}`} className="browse-btn">
                                                                                            Browse File
                                                                                        </label>
                                                                                    </div>
                                                                                    <input
                                                                                        type="file"
                                                                                        onChange={(e) =>
                                                                                            setAllReports(prev => ({
                                                                                                ...prev,
                                                                                                [item?._id]: e.target.files[0]
                                                                                            }))
                                                                                        }
                                                                                        className="d-none"
                                                                                        id={`fileInput-${item?._id}`}
                                                                                    // accept=".png,.jpg,.jpeg"
                                                                                    />
                                                                                    {allReports[item?._id] && (
                                                                                        <p className="mt-2 text-success fw-semibold">
                                                                                            {allReports[item?._id].name}
                                                                                        </p>
                                                                                    )}
                                                                                    <div id="filePreviewWrapper" className="d-none mt-3">
                                                                                        <img src="" alt="Preview" className="img-thumbnail" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="custom-frm-bx">
                                                                            <label htmlFor="">  Note
                                                                            </label>
                                                                            <textarea value={allComments[item?._id]}
                                                                                onChange={(e) =>
                                                                                    setAllComments(prev => ({
                                                                                        ...prev,
                                                                                        [item?._id]: e.target.value
                                                                                    }))
                                                                                }
                                                                                name="comment" id="" className="form-control"></textarea>
                                                                        </div>
                                                                    </div>)}
                                                                {/* <div className="sub-tab-brd mb-3">
                                                                <div className="custom-frm-bx">
                                                                    <label htmlFor="">Test Name</label>
                                                                    <input type="text" className="form-control" placeholder="LFT" />
                                                                </div>
                                                                <div className="custom-frm-bx">
                                                                    <label htmlFor="">Upload certificate</label>
                                                                    <div className="upload-box p-3 nw-upload-bx   justify-content-center ">
                                                                        <div className="upload-icon mb-2">
                                                                            <IoCloudUploadOutline />
                                                                        </div>
                                                                        <div>
                                                                            <p className="fw-semibold mb-1">
                                                                                <label htmlFor="fileInput1" className="file-label file-select-label">
                                                                                    Choose a file or drag & drop here
                                                                                </label>
                                                                            </p>
                                                                            <small className="format-title">JPEG Format</small>
                                                                            <div className="mt-3">
                                                                                <label htmlFor="fileInput1" className="browse-btn">
                                                                                    Browse File
                                                                                </label>
                                                                            </div>
                                                                            <input
                                                                                type="file"
                                                                                className="d-none"
                                                                                id="fileInput1"
                                                                                accept=".png,.jpg,.jpeg"
                                                                            />
                                                                            <div id="filePreviewWrapper" className="d-none mt-3">
                                                                                <img src="" alt="Preview" className="img-thumbnail" />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="custom-frm-bx">
                                                                    <label htmlFor="">  Note
                                                                    </label>
                                                                    <textarea name="" id="" className="form-control"></textarea>
                                                                </div>
                                                            </div> */}
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-6 col-md-6 col-sm-12 mb-3">
                                                            <div className="new-invoice-card">
                                                                <div className="d-flex align-items-center justify-content-between mb-3">
                                                                    <div>
                                                                        <h5 className="first_para fw-700 fz-20 mb-0">Final Diagnostic Report</h5>
                                                                    </div>
                                                                </div>
                                                                <div className="laboratory-header mb-4">
                                                                    <div className="laboratory-name">
                                                                        <h5>{profiles?.name}</h5>
                                                                        <p><span className="laboratory-title">GSTIN :</span> {profiles?.gstNumber}</p>
                                                                    </div>
                                                                    <div className="invoice-details">
                                                                        <p className="text-end"><span className="laboratory-invoice">Report ID :</span> RE-89767</p>
                                                                        <p className="text-end"><span className="laboratory-invoice">Generated ID :</span> 25-11-03  08:07</p>
                                                                    </div>
                                                                </div>
                                                                <div className="row">
                                                                    <div className="col-lg-6 mb-3">
                                                                        <div className="laboratory-bill-bx laboratory-nw-box">
                                                                            <h6>Patient </h6>
                                                                            <h4>{appointmentData?.patientId?.name}</h4>
                                                                            <p><span className="laboratory-phne">ID :</span> {appointmentData?.patientId?.nh12}</p>
                                                                            <p><span className="laboratory-phne">DOB:</span>{new Date(demoData?.dob)?.toLocaleDateString(('en-GB'))}</p>
                                                                            <p><span className="laboratory-phne">Gender:</span> {appointmentData?.patientId?.patientId?.gender}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-lg-6">
                                                                        <div className="laboratory-bill-bx laboratory-sub-bx mb-2">
                                                                            <h6>Order </h6>
                                                                            <p><span className="laboratory-phne">Appointment ID :</span> {appointmentData?.customId}  </p>
                                                                        </div>

                                                                        {appointmentData?.doctorId && <div className="laboratory-bill-bx laboratory-sub-bx">
                                                                            <h6 className="my-0">Doctor </h6>
                                                                            <h4>Dr. {appointmentData?.doctorId?.name}</h4>
                                                                            <p><span className="laboratory-phne"> ID :</span> {appointmentData?.doctorId?.nh12}  </p>
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
  {testData.map((item) => (
    <React.Fragment key={item._id}>
      
      {/* Department Row */}
      <tr>
        <td colSpan="5" className="fw-bold">
          {item?.labDept?.departmentName}
        </td>
      </tr>

      {/* Component Rows */}
      {item?.component.map((c, i) => {
        const selectedResultValue =
          allComponentResults[item?._id]?.[i]?.result || "";

        const selectedOption =
          c?.optionType === "select"
            ? c.result?.find((r) => r.value === selectedResultValue)?.note
            : c.textResult;

        return (
          <React.Fragment key={i}>
            <tr>
              <td>
                {item?.shortName} - {c?.title}
              </td>
              <td>{c?.unit}</td>
              <td>{c?.referenceRange}</td>

              {/* Result Input */}
              <td>
                <div className="custom-frm-bx mb-0">
                  {c?.optionType === "text" ? (
                    <input
                      type="text"
                      className="form-control"
                      value={selectedResultValue}
                      onChange={(e) =>
                        setAllComponentResults((prev) => ({
                          ...prev,
                          [item?._id]: {
                            ...prev[item?._id],
                            [i]: {
                              ...prev[item?._id]?.[i],
                              result: e.target.value,
                            },
                          },
                        }))
                      }
                      placeholder="Enter"
                    />
                  ) : (
                    <select
                      className="form-select"
                      value={selectedResultValue}
                      onChange={(e) =>
                        setAllComponentResults((prev) => ({
                          ...prev,
                          [item?._id]: {
                            ...prev[item?._id],
                            [i]: {
                              ...prev[item?._id]?.[i],
                              result: e.target.value,
                            },
                          },
                        }))
                      }
                    >
                      <option value="">Select</option>
                      {c?.result?.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.value}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </td>

              {/* Status */}
              <td>
                <div className="custom-frm-bx ms-2 mb-0">
                  <select
                    className="form-select"
                    value={
                      allComponentResults[item?._id]?.[i]?.status || ""
                    }
                    onChange={(e) =>
                      setAllComponentResults((prev) => ({
                        ...prev,
                        [item?._id]: {
                          ...prev[item?._id],
                          [i]: {
                            ...prev[item?._id]?.[i],
                            status: e.target.value,
                          },
                        },
                      }))
                    }
                  >
                    <option value="">Select</option>
                    <option value="Positive">Positive</option>
                    <option value="Negative">Negative</option>
                  </select>
                </div>
              </td>
            </tr>

            {/* Note Row */}
            <tr>
              <td colSpan="5">
                <strong>Note:</strong> {selectedOption || "-"}
              </td>
            </tr>
          </React.Fragment>
        );
      })}
    </React.Fragment>
  ))}
</tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                                <div className="report-remark mt-3">
                                                                    <h6>Remark {(!isRemark || remark) && <button type="button" onClick={() => setIsRemark(true)} className="edit-btn text-black"><FontAwesomeIcon icon={faPen} /></button>}</h6>
                                                                    {isRemark && <textarea rows={5} className="w-100" value={remark}
                                                                        onChange={(e) => setRemark(e.target.value)} />}
                                                                    <p>-</p>
                                                                </div>

                                                                {appointmentData?.doctorId && <div className="laboratory-bill-bx">
                                                                    <h6>Lab tests prescribed by the doctor</h6>
                                                                    <h4>Dr.{appointmentData?.doctorId?.name}</h4>
                                                                    <p><span className="laboratory-phne">ID :</span>{appointmentData?.doctorId?.nh12}</p>
                                                                </div>}

                                                                <div className="reprt-barcd mt-3">
                                                                    {testData?.map((item, key) =>
                                                                        <div className="barcd-scannr" key={key}>
                                                                            <div className="barcd-content">
                                                                                <h4 className="my-3">{item?.code}</h4>
                                                                                <ul className="qrcode-list">
                                                                                    <li className="qrcode-item">Test  <span className="qrcode-title">: {item?.shortName}</span></li>
                                                                                    <li className="qrcode-item">Draw  <span className="qrcode-title"> : {new Date(appointmentData?.createdAt)?.toLocaleDateString(('en-GB'))}</span> </li>
                                                                                </ul>

                                                                                {/* <img src="/barcode.png" alt="" /> */}
                                                                                <Barcode value={`${appointmentData?.customId}?test=${testData?._id}`} width={1} displayValue={false}
                                                                                    height={60} />
                                                                            </div>
                                                                            <div className="barcode-id-details">
                                                                                <div>
                                                                                    <h6>Patient Id </h6>
                                                                                    <p>{appointmentData?.patientId?.nh12}</p>
                                                                                </div>
                                                                                <div>
                                                                                    <h6>Appointment ID </h6>
                                                                                    <p>{appointmentData?.customId}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>)}
                                                                </div>
                                                                <div className="reprt-signature mt-5">
                                                                    <h6>Signature:</h6>
                                                                    <span className="reprt-mark"></span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>
                                                    <div className="text-end mt-3" >
                                                        <button type="submit" className="nw-thm-btn rounded-4">Submit</button>
                                                    </div>
                                                </div>




                                            </form>}



                                        <div className="tab-pane fade" id="person" role="tabpanel">
                                            <div className="sub-tab-brd">
                                                <div className="">
                                                    <div className="row">


                                                        <div className="col-lg-6 col-md-6 col-sm-12 mb-3">

                                                            <div className="new-invoice-card h-100">
                                                                <div className="">
                                                                    <ul className="appointment-booking-list">
                                                                        <li className="appoint-item"> Appointment Book Date : <span className="appoint-title">{new Date(appointmentData?.date)?.toLocaleDateString(('en-GB'))}</span></li>
                                                                        <li className="appoint-item"> Visited  date : <span className="appoint-title">{new Date(appointmentData?.date)?.toLocaleDateString(('en-GB'))}</span></li>
                                                                        <li className="appoint-item"> Appointment Completed date : <span className="appoint-title">{appointmentData?.status === 'deliver-report' ?
                                                                            new Date(appointmentData?.updatedAt)?.toLocaleDateString(('en-GB')) : '-'}</span></li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>


                                                        <div className="col-lg-6 col-md-6 col-sm-12 mb-3" ref={reportRef}>
                                                            <div className="new-invoice-card">
                                                                <div className="d-flex align-items-center justify-content-between mb-3">
                                                                    <div>
                                                                        <h5 className="first_para fw-700 fz-20 mb-0">Final Diagnostic Report</h5>
                                                                    </div>
                                                                    <div className="d-flex align-items-center gap-2" >
                                                                        <button onClick={reportDownload} className="print-btn no-print"> <FontAwesomeIcon icon={faDownload} /> Download PDF</button>
                                                                        {/* <button className="print-btn"> <FontAwesomeIcon icon={faPaperPlane} /> Send</button> */}
                                                                        <div class="dropdown no-print">
                                                                            <a
                                                                                href="javascript:void(0)"
                                                                                class="attendence-edit-btn print-btn"
                                                                                id="acticonMenu1"
                                                                                data-bs-toggle="dropdown"
                                                                                aria-expanded="false"
                                                                            >
                                                                                <FontAwesomeIcon icon={faPaperPlane} /> Send
                                                                            </a>
                                                                            <ul
                                                                                class="dropdown-menu dropdown-menu-end user-dropdown tble-action-menu"
                                                                                aria-labelledby="acticonMenu1"
                                                                            >
                                                                                <li className="report-item">
                                                                                    <a class="nw-dropdown-item report-nav" href="#">
                                                                                        Send to All
                                                                                    </a>
                                                                                </li>
                                                                                <li className="report-item">
                                                                                    <button onClick={() => sendReport(appointmentId, appointmentData?.patientId?.email, 'patient')} className="nw-dropdown-item report-nav" >
                                                                                        Send Patient
                                                                                    </button>
                                                                                </li>
                                                                                {appointmentData?.doctorId &&
                                                                                    <li className="report-item">
                                                                                        <button onClick={() => sendReport(appointmentId, appointmentData?.doctorId?.email, 'doctor')} className="nw-dropdown-item report-nav" >
                                                                                            Send Doctor
                                                                                        </button>
                                                                                    </li>}

                                                                                <li className="report-item">
                                                                                    <a class="nw-dropdown-item report-nav" href="#">
                                                                                        Send Hospital
                                                                                    </a>
                                                                                </li>
                                                                            </ul>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="laboratory-header mb-4">
                                                                    <div className="laboratory-name">
                                                                        <h5>{profiles?.name || 'Advance Lab Tech'}</h5>
                                                                        <p><span className="laboratory-title">GSTIN :</span> {profiles?.gstNumber}</p>
                                                                    </div>
                                                                    <div className="invoice-details">
                                                                        <p><span className="laboratory-invoice">Invoice :</span> IN{appointmentData?.customId}</p>
                                                                        <p><span className="laboratory-invoice">Date :</span> {new Date(appointmentData?.createdAt)?.toLocaleDateString()}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="row">
                                                                    <div className="col-lg-6 mb-3">
                                                                        <div className="laboratory-bill-bx laboratory-nw-box">
                                                                            <h6>Patient </h6>
                                                                            <h4>{appointmentData?.patientId?.name}</h4>
                                                                            <p><span className="laboratory-phne">ID :</span> {appointmentData?.patientId?.nh12}</p>
                                                                            <p><span className="laboratory-phne">DOB:</span> {new Date(demoData?.dob)?.toLocaleDateString()}</p>
                                                                            <p><span className="laboratory-phne">Gender:</span> {appointmentData?.patientId?.patientId?.gender?.toUpperCase()}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-lg-6">
                                                                        <div className="laboratory-bill-bx mb-2 laboratory-sub-bx">
                                                                            <h6>Order </h6>
                                                                            <p><span className="laboratory-phne">Appointment ID :</span> {appointmentData?.customId}  </p>
                                                                        </div>

                                                                        {appointmentData?.doctorId && <div className="laboratory-bill-bx laboratory-sub-bx">
                                                                            <h6 className="my-0">Doctor </h6>
                                                                            <h4>{appointmentData?.doctorId?.name}</h4>
                                                                            <p><span className="laboratory-phne"> ID :</span> {appointmentData?.doctorId?.nh12}  </p>
                                                                        </div>}

                                                                    </div>

                                                                </div>

                                                                {/* <div className="laboratory-bill-crd">
                          

                            <div className="laboratory-bill-bx">
                                <h6>Patient </h6>
                                <h4>Aarav Mehta</h4>
                                <p><span className="laboratory-phne">ID :</span> PID-7668</p>
                                <p><span className="laboratory-phne">DOB:</span> 30 june, 2000</p>
                                <p><span className="laboratory-phne">Gender:</span> Male</p>
                            </div>
                           <div className="">
                             <div className="laboratory-bill-bx">
                                <h6>Order </h6>
                                <p><span className="laboratory-phne">Appointment ID :</span> OID-7C1B48  </p>
                            </div>

                            <div className="laboratory-bill-bx">
                                <h6 className="mb-0">Doctor </h6>
                                <h5 className="fz-16">Dr. Ravi Kumar</h5>
                                 
                                <p><span className="laboratory-phne">ID :</span> DID-7668</p>
                            </div>
                           </div>
                        </div> */}

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
                                                                                        const selectedOption = cmp?.optionType == 'select' ? cmp.result?.find(r => r.value === resultObj.result)?.note : cmp.textResult;
                                                                                        return (
                                                                                            <>
                                                                                                <tr key={test._id + index}>
                                                                                                    <td>{test.shortName} - {cmp.name}</td>
                                                                                                    <td>{cmp.unit || "-"}</td>
                                                                                                    <td>{cmp.referenceRange || "-"}</td>
                                                                                                    <td>{resultObj.result || "-"}</td>
                                                                                                    <td className="text-capitalize">{resultObj.status || "-"}</td>
                                                                                                </tr>
                                                                                                <tr><span className="fw-600">Note</span>{selectedOption || "-"}</tr>
                                                                                            </>
                                                                                        );
                                                                                    })
                                                                                ))}
                                                                                {/* <tr>
                                                                                <td>CBC - Lymphocyte</td>
                                                                                <td>mm/dl</td>
                                                                                <td>50-60%</td>
                                                                                <td>50</td>
                                                                                <td></td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td>CBC - Lymphocyte</td>
                                                                                <td>mm/dl</td>
                                                                                <td>50-60%</td>
                                                                                <td>50</td>
                                                                                <td></td>
                                                                            </tr> */}


                                                                            </tbody>
                                                                        </table>

                                                                    </div>
                                                                </div>

                                                                <div className="report-remark mt-3">
                                                                    <h6>Remark</h6>
                                                                    {fullReportData?.remark}
                                                                </div>

                                                                <div className="row  mt-3">
                                                                    {testData?.map((item, key) =>
                                                                        <div className="col-lg-6">
                                                                            <div className=" barcd-scannr" key={key}>
                                                                                <div className="barcd-content">
                                                                                    <h4 className="my-3">{item?.code}</h4>
                                                                                    <ul className="qrcode-list">
                                                                                        <li className="qrcode-item">Test  <span className="qrcode-title">: {item?.shortName}</span></li>
                                                                                        <li className="qrcode-item">Draw  <span className="qrcode-title"> : {new Date(appointmentData?.createdAt)?.toLocaleDateString()}</span> </li>
                                                                                    </ul>
                                                                                    {/* <img src="/barcode.png" alt="" /> */}
                                                                                    {/* {console.log(reportMeta[item._id]?.id)} */}
                                                                                    <Barcode value={`${appointmentData?.customId}?test=${testData?._id}`} width={1} displayValue={false}
                                                                                        height={60} />

                                                                                </div>
                                                                            </div>

                                                                        </div>)}


                                                                </div>

                                                                <div className="reprt-signature mt-5">
                                                                    <h6>Signature:</h6>
                                                                    <span className="reprt-mark"></span>
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
                    <div className="text-end mt-3">
                        <Link to={-1} className="nw-thm-btn rounded-3 outline" >
                            Go Back
                        </Link>
                    </div>
                </div>}

            {/*Edit Profile Popup Start  */}
            {/* data-bs-toggle="modal" data-bs-target="#edit-Request" */}
            <div className="modal step-modal fade" id="edit-Request" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
                aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-md">
                    <div className="modal-content edit-modal-content rounded-5 p-5">
                        {/* <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <button type="button" className="" data-bs-dismiss="modal" aria-label="Close">
                                        <FontAwesomeIcon icon={faClose} />
                                    </button>
                                </div>
                            </div> */}
                        <div className="modal-body p-0">
                            <div className="row justify-content-center">
                                <div className="col-lg-9">
                                    <div className="text-center your-document-mega-dv">
                                        <div className="submit-document-bx">
                                            <FontAwesomeIcon icon={faCopy} className="document-icon" />
                                            <div className="timr-bx">
                                                <img src="/timer.png" alt="" />
                                            </div>
                                        </div>

                                        <p className="mt-4">Your documents have been submitted for verification. This may take up to 48 hours. You’ll be notified once approved.</p>

                                        <div className="mt-5">
                                            <a href="javascript:void(0)" className="thm-btn w-75" data-bs-dismiss="modal">OK</a>
                                        </div>


                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*  Edit Profile Popup End */}

        </>
    )
}

export default ReportsTabs