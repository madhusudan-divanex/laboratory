import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleXmark,
  faDownload,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { FaPlusCircle } from "react-icons/fa";
import { Link, NavLink, useParams } from "react-router-dom";
import { getSecureApiData, securePostData } from "../../services/api";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Barcode from "react-barcode";
import html2canvas from "html2canvas";
import html2pdf from "html2pdf.js";

function LabTestReports() {
  const params = useParams();
  const appointMentId = params.id;
  const userId = localStorage.getItem('userId');
  const [selectedTab, setSelectedTab] = useState(null);
  const [printReport, setPrintReport] = useState(false);
  const reportRef = useRef();
  const [reportMeta, setReportMeta] = useState({});
  const [appointmentData, setAppointmentData] = useState(null);
  const [testId, setTestId] = useState([]);
  const { isOwner, permissions, profiles } = useSelector(state => state.user)
  const [testData, setTestData] = useState([]);
  const [toPrint, setToPrint] = useState([]);
  const [allComponentResults, setAllComponentResults] = useState({});
  const [allComments, setAllComments] = useState({});
  const [demoData, setDemoData] = useState()
  const fetchLabAppointment = async () => {
    try {
      const response = await getSecureApiData(`lab/appointment-data/${appointMentId}`);
      if (response.success) {
        setAppointmentData(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      console.error("Error fetching appointment:", err);
    }
  };

  useEffect(() => {
    fetchLabAppointment();
  }, [userId]);
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
    if (appointmentData?.testId) {
      
      const ids = appointmentData.tests.flatMap(item => item.subCat)
      setTestId(ids);
    }
    fetchPtData()
  }, [appointmentData]);
  useEffect(() => {
    const fetchTestsOneByOne = async () => {
      if (testId.length === 0) return;
      const allTests = [];

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
                  result: comp?.optionType == 'select' ? comp?.result : comp?.textResult || "",
                  status: comp?.status || ""
                };
              });
              // Set results and comments keyed by test._id
              setAllComponentResults(prev => ({ ...prev, [test._id]: mergedResults }));
              setAllComments(prev => ({ ...prev, [test._id]: report?.upload?.comment || "" }));
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

      setTestData(allTests);
      if (allTests.length > 0) setSelectedTab(allTests[0]._id);
    };

    fetchTestsOneByOne();
  }, [testId]);
  const handleSave = async () => {
    if (!isOwner && !permissions?.editReport) {
      toast.error('You do not have permission to edit a report ')
      return
    }
    const item = testData.find(t => t._id === selectedTab);
    if (!item) return;

    const components = item.component.map((c, i) => ({
      cmpId: c._id,
      result: allComponentResults[selectedTab]?.[i]?.result || "",
      // textResult: allComponentResults[selectedTab]?.[i]?.textResult || "",
      status: allComponentResults[selectedTab]?.[i]?.status || ""
    }));
    const payload = {
      labId: userId,
      patientId: appointmentData.patientId,
      testId: selectedTab,
      subCatId: selectedTab,
      appointmentId: appointMentId,
      component: JSON.stringify(components),
      comment: allComments[selectedTab] || ""
    };

    try {
      const response = await securePostData('lab/test-report', payload);
      if (response.success) {
        toast.success("Report saved successfully");
        fetchLabAppointment(); // Refresh appointment data if needed
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      console.error("Error saving report:", err);
    }
  };

  const fetchTestReport = async (subCatId) => {
    try {
      const payload = { subCatId, appointmentId: appointMentId };
      const response = await securePostData('lab/test-report-data', payload);

      if (response.success && response.data) {
        setReportMeta(prev => ({
          ...prev,
          [subCatId]: {
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


  const handleDownload = () => {
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
  }


  useEffect(() => {
    const fetchTestsOneByOne = async () => {
      if (testId.length === 0) return;
      const allTests = [];

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
              setAllComments(prev => ({ ...prev, [test._id]: report?.upload?.comment || "" }));


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

      setTestData(allTests);
    };

    fetchTestsOneByOne();
  }, [testId]);
  return (
    <>
      {!printReport ? <div className="main-content flex-grow-1 p-3 overflow-auto">
        <div className="row mb-3">
          <div className="d-flex align-items-center justify-content-between tp-sub-main-bx">
            <div>
              <h3 className="innr-title">Test Reports</h3>
              <div className="admin-breadcrumb">
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb custom-breadcrumb">
                    <li className="breadcrumb-item">
                      <NavLink href="/dashboard" className="breadcrumb-link">
                        Dashboard
                      </NavLink>
                    </li>

                    <li className="breadcrumb-item">
                      <a href="#" className="breadcrumb-link">
                        Test Categories
                      </a>
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
            <div className="add-nw-bx d-flex gap-2">
              <NavLink to={`/patient-details/${appointmentData?.patientId?._id}`} className="add-nw-btn nw-thm-btn patient-thm-btn">
                <FontAwesomeIcon icon={faEye} /> Patient Details
              </NavLink>

              <a href="javascript:void(0)" className="add-nw-btn nw-meeting-thm-btn " data-bs-toggle="modal" data-bs-target="#edit-Request" >
                <FaPlusCircle /> Print
              </a>
            </div>
          </div>
        </div>

        <div className="lab-chart-crd">
          <div className="row">
            <div className="col-lg-12">
              <div className="lab-tp-title patient-bio-tab lab-profile-bio-tab">
                <div>
                  <h6 className="mb-0">Test</h6>
                </div>
              </div>

              <div className="patient-bio-tab">
                <ul className="nav nav-tabs gap-3">
                  {testData?.map((item) => (
                    <li className="nav-item" key={item._id}>
                      <a
                        className={`nav-link ${selectedTab === item._id ? "active" : ""
                          } text-capitalize`}
                        onClick={() => setSelectedTab(item._id)}
                        role="button"
                      >
                        {item.shortName}
                      </a>
                    </li>
                  ))}
                </ul>

                <div className="tab-content mt-4">
                  {testData
                    ?.filter((t) => t._id === selectedTab)
                    .map((item) => (
                      <div className="tab-pane fade show active" key={item._id}>
                        <div className="sub-tab-brd">
                          <div className="table-section mega-table-section">
                            <div className="table table-responsive mb-0">
                              <table className="table mb-0">
                                <thead>
                                  <tr>
                                    <th>Name</th>
                                    <th>Unit</th>
                                    <th>Reference Range</th>
                                    <th>Result</th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {item.component.map((c, i) => (
                                    <React.Fragment key={i}>
                                      <tr>
                                        <td colSpan={4}>
                                          <span className="reprt-title text-capitalize">
                                            {c.title}
                                          </span>
                                        </td>
                                      </tr>

                                      <tr >
                                        <td>{c.name}</td>
                                        <td>{c.unit}</td>
                                        <td>{c?.optionType == 'text' ? `${c?.minRange}-${c?.maxRange}` : 'Positive-Negative'}</td>

                                        <td>

                                          <div className="custom-frm-bx mb-0">



                                            {c?.optionType == 'text' ? <input
                                              type="text"
                                              className="form-control patient-frm-control"
                                              placeholder="50"
                                              value={allComponentResults[selectedTab]?.[i]?.result || ""}
                                              onChange={(e) =>
                                                setAllComponentResults(prev => ({
                                                  ...prev,
                                                  [selectedTab]: {
                                                    ...prev[selectedTab],
                                                    [i]: {
                                                      ...prev[selectedTab]?.[i],
                                                      result: e.target.value
                                                    }
                                                  }
                                                }))
                                              }
                                            />

                                              :
                                              <select
                                                className="form-select patient-frm-control"
                                                value={allComponentResults[selectedTab]?.[i]?.result || ""}
                                                onChange={(e) =>
                                                  setAllComponentResults(prev => ({
                                                    ...prev,
                                                    [selectedTab]: {
                                                      ...prev[selectedTab],
                                                      [i]: {
                                                        ...prev[selectedTab]?.[i],
                                                        result: e.target.value
                                                      }
                                                    }
                                                  }))
                                                }>
                                                <option value="">---Select status---</option>
                                                <option value="Positive">Positive</option>
                                                <option value="Negative">Negative</option>
                                              </select>
                                            }
                                          </div>
                                        </td>
                                      </tr>
                                      {/* NOTE FULL ROW */}


                                    </React.Fragment>
                                  ))}

                                </tbody>
                              </table>

                              <div>
                                <div className="custom-frm-bx cbc-commnt-bx">
                                  <textarea
                                    className="form-control"
                                    placeholder="Comment"
                                    id="comment"
                                    value={allComments[selectedTab] || ""}
                                    onChange={(e) =>
                                      setAllComments(prev => ({
                                        ...prev,
                                        [selectedTab]: e.target.value
                                      }))
                                    }
                                  ></textarea>
                                </div>
                              </div>
                            </div>

                            <div className="text-end pe-3">
                              <button onClick={handleSave} className="nw-thm-btn sub-nw-brd-tbn">Save</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

            </div>
          </div>
        </div>
        <div className="text-end mt-3">
          <Link to={-1} className="nw-thm-btn outline rounded-3">Go Back</Link>
        </div>
      </div> :
        <div className="mb-3" ref={reportRef}>
          <div className="new-invoice-card">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="first_para fw-700 fz-20 mb-0">Final Diagnostic Report</h5>
              </div>
              <div>
                <button className="print-btn" onClick={handleDownload}> <FontAwesomeIcon icon={faDownload} /> Download PDF</button>
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
                  <h4>{appointmentData?.patientId?.name}</h4>
                  <p><span className="laboratory-phne">ID :</span> {appointmentData?.patientId?.nh12}</p>
                  <p><span className="laboratory-phne">DOB:</span> {new Date(demoData?.dob)?.toLocaleDateString(('en-GB'))}</p>
                  <p><span className="laboratory-phne">Gender:</span> {appointmentData?.patientId?.patientId?.gender?.toUpperCase()}</p>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="laboratory-bill-bx laboratory-sub-bx mb-2">
                  <h6>Order </h6>
                  <p><span className="laboratory-phne">Appointment ID :</span> {appointmentData?.customId}  </p>
                </div>

                {appointmentData?.doctorId && <div className="laboratory-bill-bx laboratory-sub-bx">
                  <h6 className="my-0">Doctor</h6>
                  <h4 >{appointmentData?.doctorId?.name}</h4>
                  <p><span className="laboratory-phne">ID :</span> {appointmentData?.doctorId?.nh12}  </p>
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
                    </tr>
                  </thead>
                  <tbody>
                    {testData.filter(item => toPrint?.includes(item._id)).map((test) => (
                      test.component.map((cmp, index) => {
                        const resultObj = allComponentResults[test._id]?.[index] || {};
                        return (
                          <tr key={test._id + index}>
                            <td>{test.shortName} - {cmp.name}</td>
                            <td>{cmp.unit || "-"}</td>
                            <td>{`${cmp.minRange}-${cmp?.maxRange}` || "-"}</td>
                            <td>{resultObj.result || "-"}</td>
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
              {testData?.filter(item => toPrint?.includes(item._id)).map((test) => (
                <p key={test._id}>{allComments[test._id] || "-"}</p>
              ))}
            </div>
            <div className="page-break"></div>
            <div className="reprt-barcd flex-wrap mt-3">
              {testData?.filter(item => toPrint?.includes(item._id)).map((item, key) =>
                <div className=" barcd-scannr" key={key}>
                  <div className="barcd-content">
                    <h4 className="my-3">SP-{item?._id?.slice(-5)}</h4>
                    <ul className="qrcode-list">
                      <li className="qrcode-item">Test  <span className="qrcode-title">: {item?.shortName}</span></li>
                      <li className="qrcode-item">Draw  <span className="qrcode-title"> : {new Date(reportMeta[item._id]?.createdAt)?.toLocaleDateString()}</span> </li>
                    </ul>

                    {/* <img src="/barcode.png" alt="" /> */}
                    {/* {console.log(reportMeta[item._id]?.id)} */}
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
        </div>}

      {/*Print Popup Start  */}
      {/* data-bs-toggle="modal" data-bs-target="#edit-Request" */}
      <div className="modal fade step-modal" id="edit-Request" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1"
        aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content rounded-5 ">
            <div className="d-flex align-items-center justify-content-between popup-nw-brd px-4 py-3">
              <div>
                <h6 className="lg_title mb-0">Print</h6>
              </div>
              <div>
                <button type="button" className="" data-bs-dismiss="modal" aria-label="Close" style={{ color: "#00000040" }}>
                  <FontAwesomeIcon icon={faCircleXmark} />
                </button>
              </div>
            </div>
            <div className="modal-body px-4">
              <div className="row ">
                <div className="col-lg-12">
                  <div className="text-center my-4">
                    <div className="model-permission-bx">
                      <img src="/flask.png" alt="" />
                    </div>
                  </div>

                  <ul className="">
                    {testId?.map((item, key) =>
                      <li key={key}>
                        <div className="custom-frm-bx">
                          <div className="form-check custom-check form-control tests-reprt-frm">
                            <input className="form-check-input ms-0" type="checkbox" value={item?._id}
                              checked={toPrint.includes(item?._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setToPrint([...toPrint, item?._id])
                                } else {
                                  setToPrint(toPrint.filter(id => id !== item?._id))
                                }
                              }}
                              id="addTests" />
                            <label className="form-check-label tests-reprt-label" htmlFor="addTests">
                              {item?.shortName} Report
                            </label>
                          </div>
                        </div>
                      </li>)}

                  </ul>
                  <div>
                    <button type="submit" onClick={() => setPrintReport(true)} data-bs-dismiss="modal" className="nw-thm-btn w-100"> Print now</button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </>
  )
}

export default LabTestReports;
