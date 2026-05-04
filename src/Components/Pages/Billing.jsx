import { useEffect, useRef, useState } from "react";
import { getApiData, getSecureApiData, securePostData } from "../../services/api";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { calculateAge } from "../../services/globalFunction";
import base_url from "../../../baseUrl";
import html2pdf from "html2pdf.js";
import "../../assets/css/billing.css"

const NeoHealthCardLabTemplates = ({ appointmentId, pdfLoading, endLoading }) => {
    // const params = useParams()
    // const appointmentId = params.id
    const [isReady, setIsReady] = useState(false);
    const [userData, setUserData] = useState()
    const [patientData, setPatientData] = useState()
    const [testReport, setTestReport] = useState()
    const [testData, setTestData] = useState([]);
    const [testId, setTestId] = useState([]);
    const [allComponentResults, setAllComponentResults] = useState({});
    const [allComments, setAllComments] = useState({});
    const [reportMeta, setReportMeta] = useState({});
    const [fullReportData, setFullReportData] = useState()
    const downloadInvoice = useRef(null);
    const [isRemark, setIsRemark] = useState(false)
    const { profiles, labPerson, labAddress, labImg, paymentInfo,
        rating, avgRating, labLicense, isRequest } = useSelector(state => state.user)

    const [appointmentData, setAppointmentData] = useState({})
    const fetchAppointmentData = async () => {
        try {
            const response = await getSecureApiData(`lab/appointment-data/${appointmentId}`)
            if (response.success) {
                setTestId(response?.data?.subCatId)
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
    useEffect(() => {
        if (testData.length > 0 && patientData && appointmentData) {
            setIsReady(true);
        }
    }, [testData, patientData, appointmentData]);
    // Calculate subtotal, GST and total
    // const subtotal = appointmentData?.testId
    //     ?.reduce((acc, item) => acc + Number(item?.price || 0), 0) || 0;

    // const gst = subtotal * 0.05;
    // const total = subtotal + gst;

    async function fetchPatientData() {
        try {
            const res = await getApiData(`patient/${appointmentData?.patientId?._id}`)
            if (res.success) {
                setPatientData(res.data)
            }
        } catch (error) {

        }
    }
    useEffect(() => {
        if (appointmentData?.patientId?._id) {

            fetchPatientData()
        }
    }, [appointmentData])
    const fetchTestReport = async (testId) => {
        try {
            const payload = {subCatId: testId, appointmentId };
            const response = await securePostData('lab/test-report-data', payload);

            if (response.success && response.data) {
                setFullReportData(response.data)
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
                                    textResult: comp?.textResult || '',
                                    status: comp?.status || "",
                                };
                            });
                            // Set results and comments keyed by test._id
                            setAllComponentResults(prev => ({ ...prev, [test._id]: mergedResults }));
                            setAllComments(prev => ({ ...prev, [test._id]: report.upload?.comment || "" }));


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
    const lab = {
        name: 'Nova Diagnostics Center',
        location: '221B King Street, London, UK',
        phone: '+44 20 5555 1122',
        email: 'support@novadiagnostics.com',
        accreditations: 'ISO 15189 • CAP Aligned • Digital Report Verified',
        logoText: 'ND',
    };



    const badgeStyle = (flag) => {
        if (flag === 'high') return 'bg-rose-50 text-rose-700 border border-rose-200';
        if (flag === 'low') return 'bg-amber-50 text-amber-700 border border-amber-200';
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    };

    const valueStyle = (flag) => {
        if (flag === 'positive') return 'text-rose-700 font-semibold';
        if (flag === 'negative') return 'text-amber-700 font-semibold';
        return 'text-slate-900';
    };
    const handleDownload = async () => {
        try {
            const element = downloadInvoice.current;

            document.body.classList.add("hide-buttons");

            // wait for render
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const opt = {
                margin: 0,
                filename: `invoice-${appointmentData?.customId}.pdf`,
                html2canvas: {
                    scale: 3,
                    useCORS: true
                },
                jsPDF: {
                    unit: "mm",
                    format: "a4",
                    orientation: "portrait"
                }
            };

            await html2pdf().from(element).set(opt).save();

            document.body.classList.remove("hide-buttons");
        } catch (error) {
            console.log(error)
        } finally {
            if (pdfLoading) endLoading();
            setReportMeta({});
        }
    };


    useEffect(() => {
        if (Object.keys(reportMeta).length > 0 && testData && pdfLoading) {
            const timer = setTimeout(() => {
                handleDownload();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [reportMeta, testData, pdfLoading]);

    return (
       <>
        <div ref={downloadInvoice}>
             <div className="a4-page">
                <div className="watermark"><span>NEOHEALTHCARD</span></div>
                 <div className="no-print neo-billing-cards">
               <h5> NeoHealthCard print-ready A4 templates: modern lab result report + billing invoice. Lab branding stays primary; NeoHealthCard appears as network ID layer and watermark.</h5>
            </div>

                {/* <div className="watermark"><span>NEOHEALTHCARD</span></div> */}
                <div className="content-layer ">
                    <header className="flex items-start justify-between border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-xl font-bold text-white shadow-lg">
                                
                            </div>
                            <div className="neo-billing-print-content">
                                <h2 className=" tracking-tight">{profiles?.name}</h2>
                                <h3 className="">{labAddress?.fullAddress}</h3>
                                <p className="">{profiles?.contactNumber} • {profiles?.email}</p>
                                
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="neo-invoice-tag">
                                <h6>Laboratory Result Report</h6>
                            </div>
                            <p className="neo-powered-by-content">Powered by local lab systems with NeoHealthCard identity interoperability</p>
                        </div>
                    </header>

                    <section className="pb-3">
                        <div className="nh-inv-box mb-3">
                            <h2 className="">Patient Information</h2>
                            <div className="">
                                <Field label="Patient Name" value={patientData?.name} />
                                <Field label="Age / Sex" value={`${calculateAge(patientData?.dob)} / ${patientData?.gender}`} />
                                <Field label="DOB" value={new Date(patientData?.dob).toLocaleDateString('en-GB')} />
                                <Field label="Patient ID" value={appointmentData?.patientId?.nh12} mono />
                                {appointmentData?.doctorId && <>
                                    <Field label="Doctor" value={appointmentData?.doctorId?.name} />
                                    <Field label="Doctor ID" value={appointmentData?.doctorId?.nh12} mono />
                                </>}
                            </div>
                        </div>
                        <div className="nh-inv-box ">
                            <h2 className="">Case & Sample Metadata</h2>
                            <div className="">
                                <Field label="Lab ID" value={appointmentData?.labId?.nh12} mono />
                               
                                <Field label="Sample ID" value={appointmentData?.customId} mono />
                                
                            </div>
                        </div>
                    </section>
                
                    
                    <section className="nh-inv-tests-section">

  {testData.map((test) => (
    <div key={test._id} className="nh-inv-test-card">

      <div className="nh-inv-test-header">
        <h3 className="nh-inv-test-title">
          {test?.shortName}
        </h3>
        <div className="nh-inv-test-verified">Verified panel</div>
      </div>

      <table className="nh-inv-table">
        <thead>
          <tr className="nh-inv-table-head-row">
            <th className="nh-inv-th">Test</th>
            <th className="nh-inv-th">Result</th>
            <th className="nh-inv-th">Unit</th>
            <th className="nh-inv-th">Reference Range</th>
            <th className="nh-inv-th">Flag</th>
          </tr>
        </thead>

        <tbody>
          {test.component.map((cmp, index) => {
            const resultObj =
              allComponentResults[test._id]?.[index] || {};

            const selectedOption =
              cmp?.optionType === "select"
                ? cmp.result?.find(
                    (r) => r.value === resultObj.result
                  )?.note
                : cmp.textResult;

            return (
              <tr key={index}>
                <td className="nh-inv-td nh-inv-td-name">
                  {cmp?.name}
                </td>
                <td className={`nh-inv-td ${valueStyle(resultObj?.status)}`}>
                  {resultObj?.result || "-"}
                </td>
                <td className="nh-inv-td ">
                  {cmp?.unit}
                </td>
                <td className="nh-inv-td">
                  {cmp?.minRange}-{cmp?.maxRange}
                </td>
                <td className="nh-inv-td">
                  <span
                    className={`nh-inv-badge ${badgeStyle(
                      resultObj?.status
                    )}`}
                  >
                    {resultObj?.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ))}

                    </section>

                     <section className="nh-inv-notes-section">
                        <div className="nh-inv-notes-main mb-3">
                            <h3 className="nh-inv-notes-title">Interpretation & Notes</h3>
                            <p className="nh-inv-notes-text">
                            {fullReportData?.remark}
                            </p>
                        </div>

                        <div className="nh-inv-notes-side">
                            <h3 className="nh-inv-auth-title">Authentication</h3>
                            <div className="nh-inv-auth-label">
                            <div className="">
                                <h6 >Validated by</h6>
                                <h6>{appointmentData?.labStaff?.name}</h6>
                            </div>
                            <div>
                                <h6>Digital Signature</h6>
                                <h6>
                                {appointmentData?.labStaff?.name}
                                </h6>
                            </div>
                            <div>
                                <h6 >Verification</h6>
                                <p>
                                Scan QR / verify via lab portal or NeoHealthCard-linked patient record.
                                </p>
                            </div>
                            </div>
                        </div>
                    </section>

                    <footer className="nh-inv-footer">
  <div className="nh-inv-footer-row">
    <p className="nh-inv-footer-text">
      NeoHealthCard serves as an interoperable health network for identity, exchange, and verification. Laboratory brand,
      accreditation, responsibility, and report issuance remain with the performing lab.
    </p>

    {/* <p className="nh-inv-footer-page">Page 1 / 2</p> */}
  </div>
                     </footer>

                </div>
            </div>

             <div className="a4-page">
                <div className="watermark"><span>NEOHEALTHCARD</span></div>
                <div className="content-layer ">
                    <header className="flex items-start justify-between border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-xl font-bold text-white shadow-lg">
                               
                            </div>
                            <div className="neo-billing-print-content">
                                <h2 className=" tracking-tight">{profiles?.name}</h2>
                                <h3 className="">{labAddress?.fullAddress}</h3>
                                <p className="">{profiles?.contactNumber} • {profiles?.email}</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="neo-invoice-tag">
                                <h6>Laboratory Billing Invoice</h6>
                            </div>
                            <p className="neo-powered-by-content mb-0">Invoice generated by provider lab • NeoHealthCard watermark for network-origin traceability</p>
                        </div>
                    </header>

                    <section className="pb-3">
                        <div className="nh-inv-box mb-3">
                            <h2 className="">Bill To</h2>
                            <div className="">
                                <Field label="Patient Name" value={patientData?.name} />
                                <Field label="Patient ID" value={appointmentData?.patientId?.nh12} mono />
                                {appointmentData?.doctorId && <>
                                    <Field label="Doctor Name" value={appointmentData?.doctorId?.name} />
                                    <Field label="Doctor ID" value={appointmentData.doctorId?.nh12} mono />
                                </>}
                                <Field label="Lab ID" value={appointmentData?.labId?.nh12} mono />
                                <Field label="Accession No." value={appointmentData?.customId} mono />
                            </div>
                        </div>
                        {appointmentData?.invoiceId && <div className="nh-inv-box">
                            <h2 className="">Invoice Meta</h2>
                            <div className="">
                                <InfoLine label="Invoice No." value={appointmentData?.invoiceId?.customId} mono />
                                <InfoLine label="Invoice Date"
                                    value={new Date(appointmentData?.invoiceId?.createdAt)?.toLocaleDateString('en-GB')} />
                                <InfoLine label="Payment Status" value={appointmentData?.paymentStatus} />
                                <InfoLine label="Method" value={appointmentData?.invoiceId?.paymentType} />
                            </div>
                        </div>}
                    </section>

                    <section className=" nh-inv-test-card">
                        <div className="nh-inv-test-header">
                            <h3 className="nh-inv-test-title">Services & Charges</h3>
                        </div>
                        <table className="nh-inv-table">
                            <thead>
                                <tr className="nh-inv-table-head-row">
                                    {/* <th className="px-5 py-3">Code</th> */}
                                    <th className="nh-inv-th">Service</th>
                                    <th className="nh-inv-th">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointmentData?.testData?.map((item, index) => {
                                    return (
                                        <tr key={item?.code} className={index !== appointmentData?.testData?.length - 1 ? 'border-b border-slate-100' : ''}>
                                            {/* <td className="px-5 py-3 font-mono text-xs text-slate-600">{item?.code}</td> */}
                                            <td className="nh-inv-td">{item?.name}</td>
                                            <td className="nh-inv-td">${item?.fees.toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </section>


                    <section className="pt-3 ">
                        <div className="nh-inv-billing-box mb-3">
                        <h3 className="">Billing Notes</h3>
                        <ul className="nh-inv-billing-list">
                            <li> Charges belong to the performing laboratory, not to NeoHealthCard.</li>
                            <li> NeoHealthCard watermark indicates the invoice originated within the connected health network.</li>
                            <li>Local taxes, payer contracts, and country-specific compliance rules remain configurable per lab.</li>
                            <li>This layout supports QR payment, insurance attachment, and patient app download workflows.</li>
                        </ul>
                        </div>

                        <div className="nh-inv-billing-box">
                            <h3 className="">Summary</h3>
                            <div className="">
                                <SummaryRow label="Subtotal" value={`$${appointmentData?.invoiceId?.subTotal}`} />
                                <SummaryRow label="Discount" value={`-$${appointmentData?.invoiceId?.discount || '0'}`} />
                                <SummaryRow label="Taxes / VAT" value={`$${appointmentData?.invoiceId?.taxes || '0'}`} />
                                <div className="my-2 border-t border-dashed border-slate-200" />
                                <SummaryRow label="Grand Total" value={`$${appointmentData?.invoiceId?.total}`} strong />
                            </div>

                           
                        </div>
                    </section>

                    <section className="py-3">
                        <div className="nh-inv-billing-box">
                            <div className="row">
                              <div className="col-lg-6 align-content-center">
                                <div className="neo-banking-content">
                                        <h6 className="">Bank :-</h6>
                                        <h4>{paymentInfo?.bankName}</h4>
                                    </div>
                                    <div className="neo-banking-content">
                                        <h6 className="">Account Number :-</h6>
                                        <h4>{paymentInfo?.accountNumber}</h4>
                                    </div>
                                    <div className="neo-banking-content">
                                        <h6 className="">Account Holder Name :-</h6>
                                        <h4>{paymentInfo?.accountNumber}</h4>
                                    </div>
                                    <div className="neo-banking-content">
                                        <h6 className="">IFSC Code :-</h6>
                                        <h4>{paymentInfo?.ifscCode}</h4>
                                    </div>
                                    <div className="neo-banking-content">
                                        <h6 className="">Branch :-</h6>
                                        <h4>{paymentInfo?.branch}</h4>
                                    </div>

                            </div>

                            <div className="col-lg-6">
                                 <div className="text-center">
                                    <div className="neo-banking-content mb-0">
                                        <h6 className="">Payment QR</h6>
                                    </div>
                                    <img src={`${base_url}/${paymentInfo?.qr}`} alt="" height={250} width={250} />
                                </div>

                            </div>

                        </div>
                            
                        </div>
                        
                        
                    </section>


                    <section className="">
                        <div className="nh-inv-billing-box mb-3">
                            <h3 className="">Provider Declaration</h3>
                            <p className="nh-inv-footer-text mb-0">
                                We certify that the billed laboratory services were ordered, collected, processed, and reported by the issuing laboratory.
                                NeoHealthCard functions as a connected identity and exchange network only.
                            </p>
                        </div>
                        <div className="nh-inv-billing-box">
                            <h3 className="">Authorized Signatory</h3>
                            <div className="">
                                <p className="nh-inv-footer-text mb-0">Billing Officer / Lab Administrator</p>
                            </div>
                        </div>
                    </section>

                    <footer className="pt-3 ">
                        <div className="">
                            <p className="nh-inv-footer-text mb-0">
                                This invoice is lab-issued and can be localized for currency, tax structure, payer type, and national billing law. NHC IDs support
                                cross-provider identity linking without changing lab ownership of the document.
                            </p>
                            {/* <p className="whitespace-nowrap font-medium text-slate-700">Page 2 / 2</p> */}
                        </div>
                    </footer>
                </div>
            </div>

        </div>



       </>
    );
}
export default NeoHealthCardLabTemplates

function Field({ label, value, mono = false }) {
    return (
        

        <div className="nh-inv-field">
  <p className="nh-inv-field-label">{label}</p>
  <p className={`nh-inv-field-value ${mono ? 'nh-inv-field-value-mono' : ''}`}>
    {value}
  </p>
</div>
        

    );
}

function InfoLine({ label, value, mono = false }) {
    return (
        <div className=" nh-inv-field">
            <p className="nh-inv-field-label">{label}</p>
            <p className={mono ? 'nh-inv-field-value ' : 'nh-inv-field-value-mono'}>{value}</p>
        </div>
    );
}

function SummaryRow({ label, value, strong = false }) {
    return (
        <div className="nh-inv-field">
            <p className="nh-inv-field-label">{label}</p>
            <p className={strong ? 'nh-inv-field-value' : 'nh-inv-field-value-mono'}>{value}</p>
        </div>
    );
}
