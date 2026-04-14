import { FaFlask } from "react-icons/fa6";
import { BsFillFileImageFill } from "react-icons/bs";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { FaCloudUploadAlt } from "react-icons/fa";
import { IoCloudUploadOutline } from "react-icons/io5";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { securePostData } from "../../services/api";
import base_url from "../../../baseUrl";
import { fetchUserDetail } from "../../redux/features/userSlice";


function CreateAccountPerson() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [isPass, setIsPass] = useState(false)
    const [isConf, setIsConf] = useState(false)
    const userId = localStorage.getItem('userId')
    const { profiles, labPerson } = useSelector(state => state.user)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        contactNumber: "",
        gender: "",
        about: "",
        photo: "",
        userId
    });
    useEffect(() => {
        dispatch(fetchUserDetail())
    }, [dispatch])
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
        const payload = new FormData();
        for (let key in formData) {
            payload.append(key, formData[key]);
        }

        try {
            const response = await securePostData('lab/person', payload)
            if (response.success) {
                toast.success('Contact person data saved successfully')
                navigate('/create-account-upload')
            } else {
                toast.error(response.message)
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        }
    };
    return (
        <>
            <section className="admin-login-section account-lg-section nw-create-account-section">
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
                                    <div className="account-step-crd account-step-one">
                                        <div className="account-step-bx ">
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
                                            <h3>Contact Person</h3>
                                            <p>Enter  Laboratory Contact Person</p>
                                        </div>



                                        <div className="custom-frm-bx">
                                            <label htmlFor="">Name</label>
                                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" placeholder="Enter Name" />
                                        </div>

                                        <div className="custom-frm-bx">
                                            <label htmlFor="">Mobile Number</label>
                                            <input type="number" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="form-control" placeholder="Enter Mobile Number" />
                                        </div>

                                        <div className="custom-frm-bx">
                                            <label htmlFor="">Email Address</label>
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" placeholder="Enter Email Address" />
                                        </div>


                                        <div className="custom-frm-bx">
                                            <label htmlFor="">Gender</label>
                                            <select name="gender" value={formData.gender} onChange={handleChange} id="" className="form-select">
                                                <option value="">---Select Gender---</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        <div className="custom-frm-bx">
                                            <label htmlFor="">Upload Profile Photo</label>
                                            <div className="upload-box nw-upload-bx p-3 justify-content-center">
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
                                                        name="photo"
                                                        accept=".png,.jpg,.jpeg"
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            handleFilePreview(e);
                                                        }}
                                                    />

                                                    <div id="filePreviewWrapper" className="d-none mt-3">
                                                        <img src="" alt="Preview" className="img-thumbnail" />
                                                    </div>
                                                    {logoPreview && (
                                                        <div className="mt-3">
                                                            <img src={logoPreview} alt="Preview" className="img-thumbnail" style={{ maxHeight: '250px' }} />
                                                        </div>
                                                    )}
                                                    {!logoPreview && formData.photo && (
                                                        <div className="mt-3">
                                                            <img src={`${base_url}/${formData.photo}`} alt="Preview" className="img-thumbnail" style={{ maxHeight: '250px' }} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>



                                        <div className='mt-4'>
                                            <button type="submit" className="admin-lg-btn">
                                                Next
                                            </button>
                                        </div>

                                        <div className='text-center mt-5'>
                                            <span className='do-account-title'>Already have an account?<NavLink to="/login" className='lab-login-forgot-btn'>Login here</NavLink></span>
                                        </div>

                                    </div>



                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-lg-12">
                            <div>
                                <img src="/footer-bnner.png" alt="" />
                            </div>
                        </div>
                    </div>

                </div>
            </section>

        </>
    )
}

export default CreateAccountPerson