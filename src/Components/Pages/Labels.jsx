import { faPrint } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useRef, useState } from "react"
import { Link, NavLink, useParams } from "react-router-dom"
import { getSecureApiData, securePostData } from "../../services/api"
import { toast } from "react-toastify"
import { useSelector } from "react-redux"
import html2canvas from "html2canvas"
import html2pdf from "html2pdf.js"
import Barcode from "react-barcode"
import Loader from "../Layouts/Loader"

function Labels() {
    const params = useParams()
    const componentRef = useRef();
    const [isLoading, setIsLoading] = useState(true);
    const appointmentId = params.id
    const [demoData, setDemoData] = useState()
    const [testId, setTestId] = useState([]);
    const [testData, setTestData] = useState([]);
    const [allComponentResults, setAllComponentResults] = useState({});
    const [allComments, setAllComments] = useState({});
    const [reportMeta, setReportMeta] = useState({});

    const { profiles, labPerson, labAddress, labImg,
        rating, avgRating, labLicense, isRequest } = useSelector(state => state.user)
    const [appointmentData, setAppointmentData] = useState({})
    const fetchAppointmentData = async () => {
        try {
            const response = await getSecureApiData(`lab/appointment-data/${appointmentId}`)
            if (response.success) {
                setTestId(response.data.subCatId)
                setAppointmentData(response.data)
            } else {
                toast.error(response.message)
            }
        } catch (error) {

        }
    }
    useEffect(() => {
        fetchAppointmentData()
    }, [appointmentId])
    const fetchTestReport = async (testId) => {
        try {
            const payload = { subCatId:testId, appointmentId };
            const response = await securePostData('lab/test-report-data', payload);

            if (response.success && response.data) {
                setReportMeta(prev => ({
                    ...prev,
                    [testId]: {
                        id: response.data._id,
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
            setIsLoading(true);

            for (const id of testId) {
                try {
                    const response = await getSecureApiData(`api/comman/sub-test-category-data/${id._id}`);
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


                        } else {
                            // If no report found, initialize empty for this test
                            setAllComponentResults(prev => ({ ...prev, [test._id]: {} }));
                            setAllComments(prev => ({ ...prev, [test._id]: "" }));
                        }

                        allTests.push(test);

                    } else {
                        toast.error(response.message);
                    }
                } catch (err) {
                    console.error(`Error fetching test ${id}:`, err);
                }
            }
            setIsLoading(false);
            setTestData(allTests);
        };

        fetchTestsOneByOne();
    }, [testId]);

    const printDiv = () => {
        if (!componentRef.current) {
            console.error('print area not found');
            return;
        }

        const printContents = componentRef.current.innerHTML;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload(); // optional if needed
    };


    return (
        <>
            {isLoading ? <Loader /> : <div className="main-content flex-grow-1 p-3 overflow-auto">
                <form action="">
                    <div className="row mb-3">
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <h3 className="innr-title">Labels</h3>
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
                                                Labels
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
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div>
                                <h5 className="first_para fw-700 fz-20 mb-0">Preview</h5>
                            </div>
                            <div>
                                <button disabled={testData?.length == 0} className="print-btn"
                                    onClick={() => printDiv()}
                                >
                                    <FontAwesomeIcon icon={faPrint} /> {isLoading ? 'Loading...' : 'Print'}</button>
                            </div>
                        </div>

                    </div>

                    <div ref={componentRef} className="row" >
                        {testData?.map((item, key) =>
                            <div className="col-lg-4 col-md-6 col-sm-12 mb-3" key={key}>
                                <div className=" barcd-scannr w-100" style={{ maxWidth: '100%' }}>
                                    <div className="barcd-content">
                                        <h4 className="my-3">SP-{item?._id?.slice(-5)}</h4>
                                        <ul className="qrcode-list">
                                            <li className="qrcode-item">Test  <span className="qrcode-title">: {item?.shortName}</span></li>
                                            <li className="qrcode-item">Draw  <span className="qrcode-title"> : {new Date(reportMeta[item._id]?.createdAt)?.toLocaleDateString()}</span> </li>
                                        </ul>

                                        {/* <img src="/barcode.png" alt="" /> */}
                                        <Barcode value={`${appointmentData?.customId}?test=${item._id}`} width={1} displayValue={false}
                                            height={60} className="dynamic-barcode" />
                                    </div>
                                    <div className="barcode-id-details">
                                        <div>
                                            <h6>Patient Id </h6>
                                            <p>PS-{appointmentData?.patientId?.nh12}</p>
                                        </div>


                                        <div>
                                            <h6>Appointment ID </h6>
                                            <p>{appointmentData?.customId}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>)}

                    </div>

                </div>
                <div className="text-end mt-4">
                    <Link to={-1} className="nw-thm-btn rounded-3 outline" >
                        Go Back
                    </Link>
                </div>
            </div>}
        </>
    )
}

export default Labels