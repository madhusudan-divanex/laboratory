import { FaFlask } from "react-icons/fa6";
import { BsFillFileImageFill } from "react-icons/bs";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { FaCloudUploadAlt } from "react-icons/fa";
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IoCloudUploadOutline } from "react-icons/io5";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getApiData, postApiData } from "../../services/api";
import { useSelector } from "react-redux";
import base_url from "../../../baseUrl";
import Select from 'react-select'
function CreateAccount() {
    const navigate = useNavigate()
    const [isPass, setIsPass] = useState(false)
    const [isConf, setIsConf] = useState(false)
    const { profiles } = useSelector(state => state.user)
    const [catData, setCatData] = useState([])
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        contactNumber: "",
        password: "",
        gstNumber: "",
        about: "",
        logo: "",
        category: []
    });
    const handleChange = (e) => {
        const { type, name, value, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const [logoPreview, setLogoPreview] = useState(null);
    const handleFilePreview = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
        } else {
            setLogoPreview(null);
        }
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error("Password was not matched")
            return
        }
        const payload = new FormData();
        for (let key in formData) {
            if (key == "category") {
                payload.append(key, formData.category)
            } else {
                payload.append(key, formData[key]);
            }
        }

        try {
            const response = await postApiData('lab', payload)
            if (response.success) {
                toast.success('Signup successfully')
                localStorage.setItem('token', response.token)
                localStorage.setItem('userId', response.userId)
                navigate('/create-account-image')
            } else {
                toast.error(response.message)
            }
            console.log("Lab created:", response.data);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        }
    };
    async function fetchUserProfile() {
        const result = await getApiData(`lab/${localStorage.getItem('userId')}`)
        if (result.success) {
            setFormData(result.data)
        }
    }
    useEffect(() => {
        if (profiles) {
            navigate('/create-account-image')
        }
    }, [profiles])
    useEffect(() => {
        getApiData('admin/test-category').then((res) => {
            const formattedData = res.data.map((item) => ({
                value: item._id,
                label: item.name
            }));

            setCatData(formattedData);
        });
    }, []);


    return (
        <>
            <section className="admin-login-section account-lg-section nw-create-account-section">
                <div className="container-fluid px-lg-0">
                    <div className="row justify-content-center mb-4">
                        <div className="col-lg-8">
                            <div className="account-step-main-bx">
                                <NavLink to="/create-account">
                                    <div className="account-step-crd account-step-one">
                                        <div className="account-step-bx">
                                            <FaFlask className="account-step-icon" />
                                        </div>
                                        <h6>Laboratory Details</h6>
                                    </div>
                                </NavLink>

                                <NavLink to="/create-account-image">
                                    <div className="account-step-crd account-step-one">
                                        <div className="account-step-bx account-unstep-card ">
                                            <BsFillFileImageFill className="account-step-icon" />
                                        </div>
                                        <h6>Images</h6>
                                    </div>
                                </NavLink>

                                <NavLink to="/create-account-address">
                                    <div className="account-step-crd account-step-one">
                                        <div className="account-step-bx account-unstep-card ">
                                            <FaMapMarkerAlt className="account-step-icon" />
                                        </div>
                                        <h6>Address</h6>
                                    </div>
                                </NavLink>

                                <NavLink to="/create-account-person">
                                    <div className="account-step-crd account-step-one">
                                        <div className="account-step-bx account-unstep-card">
                                            <FaUser className="account-step-icon" />
                                        </div>
                                        <h6>Contact Person</h6>
                                    </div>
                                </NavLink>

                                <NavLink to="/create-account-upload">
                                    <div className="account-step-crd">
                                        <div className="account-step-bx account-unstep-card">
                                            <FaCloudUploadAlt className="account-step-icon" />
                                        </div>
                                        <h6>Upload</h6>
                                    </div>
                                </NavLink>
                            </div>
                        </div>

                    </div>

                    <div className="row justify-content-center mb-4">
                        <div className="col-lg-5 col-md-6 col-sm-12">
                            <div>
                                <div className=" neo-health-frm-card">
                                    <div className="">
                                        <div className="admin-vndr-login">
                                            <h3>Create Account</h3>
                                            <p>Give credential to sign up your account</p>
                                        </div>

                                        <form onSubmit={handleSubmit}>
                                            <div className="custom-frm-bx admin-frm-bx">
                                                <label>Laboratory Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control admin-frm-control"
                                                    placeholder="Enter Laboratory Name"
                                                    name="name"
                                                    value={formData.name}
                                                    required
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div className="custom-frm-bx admin-frm-bx">
                                                <label>Mobile Number</label>
                                                <input
                                                    type="number"
                                                    className="form-control admin-frm-control"
                                                    placeholder="Enter Mobile Number"
                                                    name="contactNumber"
                                                    value={formData.contactNumber}
                                                    required
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div className="custom-frm-bx admin-frm-bx">
                                                <label>Email Address</label>
                                                <input
                                                    type="email"
                                                    className="form-control admin-frm-control"
                                                    placeholder="Enter Email Address"
                                                    name="email"
                                                    value={formData.email}
                                                    required
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div className="custom-frm-bx admin-frm-bx">
                                                <label>GST Number</label>
                                                <input
                                                    type="text"
                                                    className="form-control admin-frm-control"
                                                    placeholder="Enter GST Number"
                                                    name="gstNumber"
                                                    value={formData.gstNumber}
                                                    required
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="custom-frm-bx admin-frm-bx">
                                                <label>Category</label>
                                                <Select
                                                    options={catData}
                                                    isMulti
                                                    required
                                                    value={catData.filter(option =>
                                                        formData.category?.includes(option.value)
                                                    )}
                                                    className="custom-select"
                                                    placeholder="Select category..."
                                                    onChange={(selectedOptions) => {
                                                        const ids = selectedOptions.map((item) => item.value);
                                                        setFormData({ ...formData, category: ids });
                                                    }}
                                                />
                                            </div>


                                            <div className="custom-frm-bx admin-frm-bx">
                                                <label>About</label>
                                                <textarea
                                                    className="form-control"
                                                    placeholder="About you"
                                                    name="about"
                                                    value={formData.about}
                                                    required
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div className="custom-frm-bx admin-frm-bx">
                                                <label>Password</label>
                                                <input
                                                    type={isPass ? "text" : "password"}
                                                    className="form-control admin-frm-control pe-5"
                                                    placeholder="*******"
                                                    name="password"
                                                    value={formData.password}
                                                    required
                                                    onChange={handleChange}
                                                />
                                                <div className="pass-eye-bx">
                                                    <a href="#" onClick={() => setIsPass(!isPass)} className="pass-eye-slash-btn">
                                                        <FontAwesomeIcon icon={isPass ? faEyeSlash : faEye} />
                                                    </a>
                                                </div>
                                            </div>

                                            <div className="custom-frm-bx admin-frm-bx">
                                                <label>Confirm Password</label>
                                                <input
                                                    type={isConf ? "text" : "password"}
                                                    className="form-control admin-frm-control pe-5"
                                                    placeholder="*******"
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    required
                                                    onChange={handleChange}
                                                />
                                                <div className="pass-eye-bx">
                                                    <a href="#" onClick={() => setIsConf(!isConf)} className="pass-eye-slash-btn">
                                                        <FontAwesomeIcon icon={isConf ? faEyeSlash : faEye} />
                                                    </a>
                                                </div>
                                            </div>

                                            <div className="custom-frm-bx">
                                                <label>Upload Laboratory Logo</label>
                                                <div className="upload-box nw-upload-bx p-3 justify-content-center">
                                                    <div className="upload-icon mb-2">
                                                        <IoCloudUploadOutline />
                                                    </div>

                                                    <div>
                                                        <p className="fw-semibold mb-1">
                                                            <label htmlFor="logo" className="file-label file-select-label">
                                                                Choose a file or drag & drop here
                                                            </label>
                                                        </p>
                                                        <small className="format-title">JPEG/PNG Format</small>
                                                        <div className="mt-3">
                                                            <label htmlFor="logo" className="browse-btn">
                                                                Browse File
                                                            </label>
                                                        </div>

                                                        <input
                                                            type="file"
                                                            className="d-none"
                                                            id="logo"
                                                            name="logo"
                                                            accept=".png,.jpg,.jpeg"
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                handleFilePreview(e);
                                                            }}
                                                        />

                                                        {logoPreview && (
                                                            <div className="mt-3">
                                                                <img src={logoPreview} alt="Preview" className="img-thumbnail" style={{ maxHeight: '250px' }} />
                                                            </div>
                                                        )}
                                                        {!logoPreview && formData.logo && (
                                                            <div className="mt-3">
                                                                <img src={`${base_url}/${formData.logo}`} alt="Preview" className="img-thumbnail" style={{ maxHeight: '250px' }} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-3">
                                                <button type="submit" className="admin-lg-btn">
                                                    Next
                                                </button>
                                            </div>

                                            <div className="text-center mt-5">
                                                <span className="do-account-title">
                                                    Already have an account?{" "}
                                                    <Link to="/login" className="lab-login-forgot-btn">
                                                        Login here
                                                    </Link>
                                                </span>
                                            </div>
                                        </form>

                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                    {/* <div className="row">
                        <div className="col-lg-12 px-0">
                            <div>
                                <img src="/footer-bnner.png" alt="" />
                            </div>
                        </div>
                    </div> */}

                </div>

                <div>
                    <img src="/footer-bnner.png" alt="" />
                </div>

            </section>
        </>
    )
}

export default CreateAccount