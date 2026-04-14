import { FaFlask } from "react-icons/fa6";
import { BsFillFileImageFill } from "react-icons/bs";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { FaCloudUploadAlt } from "react-icons/fa";
import { IoCloudUploadOutline } from "react-icons/io5";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FaPlusCircle } from "react-icons/fa";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { securePostData } from "../../services/api";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserDetail } from "../../redux/features/userSlice";
import Loader from "../Layouts/Loader";

function CreateAccountUpload() {
    const navigate=useNavigate()
    const dispatch=useDispatch()
    const [isShow, setIsShow] = useState(false)
    const [loading,setLoading] =useState(false)
    const userId = localStorage.getItem('userId')
    const { labLicense } = useSelector(state => state.user)
    const [formData, setFormData] = useState({
        labLicenseNumber: "",
        licenseFile: null,
        labCert: [{ certName: "", certFile: null }]
    });

    useEffect(()=>{
        dispatch(fetchUserDetail())
    },[dispatch])

    // ⬆ Handle License Inputs
    const handleLicenseInput = (e) => {
        setFormData({ ...formData, labLicenseNumber: e.target.value });
    };

    const handleLicenseFile = (e) => {
        setFormData({ ...formData, licenseFile: e.target.files[0] });
    };

    // ⬆ Handle Certificate Inputs
    const handleCertChange = (index, e) => {
        const { name, value } = e.target;
        const list = [...formData.labCert];
        list[index][name] = value;
        console.log(list)
        setFormData({ ...formData, labCert: list });
    };

    const handleCertFile = (index, e) => {
        const file = e.target.files[0];
        const list = [...formData.labCert];
        list[index].certFile = file;
        setFormData({ ...formData, labCert: list });
    };

    // Add/Remove Certificates
    const addCertificate = () => {
        setFormData({
            ...formData,
            labCert: [...formData.labCert, { certName: "", certFile: null }]
        });
    };

    const removeCertificate = (index) => {
        const list = [...formData.labCert];
        list.splice(index, 1);
        setFormData({ ...formData, labCert: list });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- Basic Validation ---
        if (!formData.labLicenseNumber) {
            return alert("Please enter lab license number.");
        }

        if (!formData.licenseFile) {
            return alert("Please upload license file.");
        }

        for (let i = 0; i < formData.labCert.length; i++) {
            const cert = formData.labCert[i];
            if (!cert.certName) return alert(`Please enter certificate name for Certificate #${i + 1}`);
            if (!cert.certFile) return alert(`Please upload certificate file for Certificate #${i + 1}`);
        }
        setLoading(true)

        // --- Create FormData ---
        const dataToSend = new FormData();
        dataToSend.append("userId", userId);      // Make sure this exists
        dataToSend.append("labLicenseNumber", formData.labLicenseNumber);

        // Send JSON meta data for certificates
        const certMeta = formData.labCert.map(c => ({ certName: c.certName }));
        dataToSend.append("labCert", JSON.stringify(certMeta));

        // Append certificate files (backend expects: certFiles[])
        formData.labCert.forEach((item) => {
            dataToSend.append("certFiles", item.certFile);
        });

        // Append license file (backend expects: licenseFile)
        dataToSend.append("licenseFile", formData.licenseFile);

        const result = await securePostData("lab/license", dataToSend);

        if (result.success) {
            toast.success("Lab license data saved successfully");
            setIsShow(true);
        } else {
            toast.error(result.message);
        }
        setLoading(false)
    };
    useEffect(()=>{
        if(labLicense){
            // navigate('/')
        }
    },[labLicense])
    return (
        <>
            {loading?<Loader/>
            :<section className="admin-login-section account-lg-section nw-create-account-section">
                <div className="container-fluid px-lg-0">
                    <div className="row justify-content-center mb-4">
                        <div className="col-lg-8">
                            <div className="account-step-main-bx">
                                <NavLink to="/create-account">
                                    <div className="account-step-crd account-step-one account-progress-done">
                                        <div className="account-step-bx account-step-complete">
                                            <FaFlask className="account-step-icon" />
                                        </div>
                                        <h6>Laboratory Details</h6>
                                    </div>
                                </NavLink>


                                <NavLink to="/create-account-image">
                                    <div className="account-step-crd account-step-one account-progress-done">
                                        <div className="account-step-bx  account-step-complete">
                                            <BsFillFileImageFill className="account-step-icon" />
                                        </div>
                                        <h6>Images</h6>
                                    </div>
                                </NavLink>

                                <NavLink to="/create-account-address">
                                    <div className="account-step-crd account-step-one account-progress-done">
                                        <div className="account-step-bx  account-step-complete">
                                            <FaMapMarkerAlt className="account-step-icon" />
                                        </div>
                                        <h6>Address</h6>
                                    </div>
                                </NavLink>

                                <NavLink to="/create-account-person">
                                    <div className="account-step-crd account-step-one account-progress-done">
                                        <div className="account-step-bx account-step-complete">
                                            <FaUser className="account-step-icon" />
                                        </div>
                                        <h6>Contact Person</h6>
                                    </div>
                                </NavLink>

                                <NavLink to="/create-account-upload">
                                    <div className="account-step-crd">
                                        <div className="account-step-bx ">
                                            <FaCloudUploadAlt className="account-step-icon" />
                                        </div>
                                        <h6>Upload</h6>
                                    </div>
                                </NavLink>

                            </div>





                        </div>

                        <div className="col-lg-12">
                            <div>
                                {/* <img src="/footer-bnner.png" alt="" /> */}
                            </div>
                        </div>

                    </div>

                    <div className="row justify-content-center mb-4">
                        <div className="col-lg-5 col-md-12 col-sm-12">

                            <form onSubmit={handleSubmit}>
                                <div className="">
                                    <div className="neo-health-frm-card">
                                        <div className="admin-vndr-login">
                                            <h3>Upload License And Certificate </h3>
                                            <p>Please upload License And Certificate </p>
                                        </div>
                                        <h6 className="fz-18 fw-700 text-black">License Details</h6>
                                        <div className="upload-account-bx">
                                            <div className="custom-frm-bx">
                                                <label htmlFor="">Lab License Number</label>
                                                <input type="text" className="form-control" placeholder="Enter Lab License Number" value={formData.labLicenseNumber}
                                                    onChange={handleLicenseInput} />
                                            </div>
                                            <div className="custom-frm-bx">
                                                <label htmlFor="">Upload License</label>
                                                <div className="upload-box nw-upload-bx p-3 justify-content-center">
                                                    <div className="upload-icon mb-2">
                                                        <IoCloudUploadOutline />
                                                    </div>
                                                    <div>
                                                        <p className="fw-semibold mb-1">
                                                            <label htmlFor="fileInput1" className="file-label file-select-label"> Choose a file or drag & drop here </label>
                                                        </p>
                                                        <small className="format-title">JPEG Format</small>
                                                        <div className="mt-3">
                                                            <label htmlFor="fileInput1" className="browse-btn"> Browse File </label>
                                                        </div>
                                                        <input type="file" className="d-none" id="fileInput1" accept=".png,.jpg,.jpeg" onChange={handleLicenseFile} />
                                                        <div id="filePreviewWrapper" className=" mt-3">
                                                            {formData.licenseFile && (
                                                                <img
                                                                    src={URL.createObjectURL(formData.licenseFile)}
                                                                    className="img-thumbnail"
                                                                    alt="license"
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <h6 className="fz-18 fw-700 text-black">Certificate</h6>
                                        {formData.labCert.map((cert, index) => (
                                            <div key={index} className="upload-account-bx nw-account-add-bx">
                                                <div className="row">
                                                    <div className="col-lg-11">
                                                        <div className="custom-frm-bx">
                                                            <label htmlFor="">Certificate Name</label>
                                                            <input type="text" name="certName" className="form-control" placeholder="Enter Certificate Name"
                                                                value={cert.certName}
                                                                onChange={(e) => handleCertChange(index, e)} />
                                                        </div>
                                                        <div className="custom-frm-bx">
                                                            <label htmlFor="">Upload certificate</label>
                                                            <div className="upload-box nw-upload-bx p-3 justify-content-center">
                                                                <div className="upload-icon mb-2">
                                                                    <IoCloudUploadOutline />
                                                                </div>
                                                                <div>
                                                                    <p className="fw-semibold mb-1">
                                                                        <label htmlFor={`certInput${index}`} className="file-label file-select-label"> Choose a file or drag & drop here </label>
                                                                    </p>
                                                                    <small className="format-title">JPEG Format</small>
                                                                    <div className="mt-3">
                                                                        <label htmlFor={`certInput${index}`} className="browse-btn"> Browse File </label>
                                                                    </div>
                                                                    <input type="file" className="d-none" id={`certInput${index}`} accept=".png,.jpg,.jpeg" onChange={(e) => handleCertFile(index, e)} />
                                                                    <div id="filePreviewWrapper" className=" mt-3">
                                                                        {cert.certFile && (
                                                                            <div className="mt-3">
                                                                                <img
                                                                                    src={URL.createObjectURL(cert.certFile)}
                                                                                    className="img-thumbnail"
                                                                                    alt="certificate"
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-1 d-flex align-items-center justify-content-end px-lg-0">
                                                        {index === formData.labCert.length - 1 ? (
                                                            <button type="button" onClick={addCertificate}>
                                                                <FaPlusCircle style={{ color: "#34A853", fontSize: 20 }} />
                                                            </button>
                                                        ) : (
                                                            <button type="button" className="text-danger" onClick={() => removeCertificate(index)}>
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>))}
                                        <div className='mt-4'>
                                            <button type="submit" className="admin-lg-btn" > Submit</button>
                                        </div>
                                        <div className='text-center mt-5'>
                                            <span className='do-account-title'>Already have an account? <NavLink to="/login" className='lab-login-forgot-btn'>Login here</NavLink></span>
                                        </div>
                                    </div>
                                </div>
                            </form>

                        </div>
                    </div>

                    <div className="row">
                        <div className="col-lg-12 px-0">
                            <div>
                                <img src="/footer-bnner.png" alt="" className="w-100" />
                            </div>
                        </div>
                    </div>

                </div>
            </section>}



            {/*Edit Profile Popup Start  */}
            {/* data-bs-toggle="modal" data-bs-target="#edit-Request" */}
            {isShow &&
                <div className="modal show fade step-modal" id="edit-Request" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1"
                    aria-labelledby="staticBackdropLabel" aria-hidden="true" style={{ display: "block" }}  >
                    <div className="modal-dialog modal-dialog-centered modal-md">
                        <div className="modal-content edit-modal-content rounded-5 p-5">
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
                                            <h6 className="fz-16 fw-400 text-white my-3">Your documents have been submitted for verification. This may take up to 48 hours. You’ll be notified once approved.</h6>

                                            <p className="mt-4">“Your KYC verification is in progress. You can continue browsing but cannot access patient data until approval.”</p>

                                            <div className="mt-5">
                                                <Link to='/login' onClick={() => localStorage.clear()} className="thm-btn w-75" >OK</Link>
                                            </div>


                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>}
            {/*  Edit Profile Popup End */}



        </>
    )
}

export default CreateAccountUpload