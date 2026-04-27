import { IoCloudUploadOutline } from "react-icons/io5";
import { FaPlusCircle, FaPlusSquare } from "react-icons/fa";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getApiData, getSecureApiData, securePostData } from "../../services/api";
import { Tab } from "bootstrap";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import base_url from "../../../baseUrl";

function AddEmployee() {
    const [searchParams] = useSearchParams();
    const [byId, setById] = useState(searchParams.get("id") ? false : true);
    const [isExistingStaff, setIsExistingStaff] = useState(false);
    const [staffNh12, setStaffNh12] = useState(searchParams.get("id") || "");
    const [staffId, setStaffId] = useState();
    const userId = localStorage.getItem("userId");
    const [permisions, setPermissions] = useState([]);
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const { user, medicalLicense, allowEdit, aboutDoctor, } = useSelector(state => state.user)

    // Error states
    const [errors, setErrors] = useState({
        personal: {},
        professional: {},
        employment: {},
        access: {},
    });

    const [personalInfo, setPersonalInfo] = useState({
        profileImage: "",
        name: "",
        dob: null,
        gender: "",
        address: "",
        countryId: "",
        stateId: "",
        cityId: "",
        pincode: "",
        mobile: "",
        email: "",
        emergencyContactName: "",
        emergencyContactPhone: "",

    });

    const [professionalInfo, setProfessionalInfo] = useState({
        profession: "",
        specialization: "",
        experience: "",
        bio: "",
        education: [{ university: "", degree: "", yearFrom: "", yearTo: "" }],
        certificates: [{ certificateName: "", certificateFile: null }],
    });

    const [employmentInfo, setEmploymentInfo] = useState({
        department: null,
        role: "",
        position: "",
        joinDate: "",
        contractStart: "",
        contractEnd: "",
        salary: "",
        contactNumber: "",
        email: "",
        password: "",
        permissionId: null,
        status: "",
        note: "",
    });

    // Validation functions
    const validatePersonalInfo = () => {
        const newErrors = {};
        if (!personalInfo.name?.trim()) newErrors.name = "Name is required";
        if (!personalInfo.dob) newErrors.dob = "Date of birth is required";
        if (!personalInfo.gender) newErrors.gender = "Gender is required";
        if (!personalInfo.address?.trim()) newErrors.address = "Address is required";
        if (!personalInfo.countryId) newErrors.countryId = "Country is required";
        if (!personalInfo.stateId) newErrors.stateId = "State is required";
        if (!personalInfo.cityId) newErrors.cityId = "City is required";
        if (!personalInfo.pincode?.trim()) newErrors.pincode = "Pincode is required";
        if (!personalInfo.emergencyContactPhone?.trim())
            newErrors.emergencyContactPhone = "Mobile number is required";
        if (!personalInfo.email?.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(personalInfo.email)) {
            newErrors.email = "Email is invalid";
        }
        if (!personalInfo.emergencyContactName?.trim())
            newErrors.emergencyContactName = "Emergency contact name is required";
        if (!personalInfo.emergencyContactPhone?.trim())
            newErrors.emergencyContactPhone = "Emergency contact phone is required";
        return newErrors;
    };

    const validateProfessionalInfo = () => {
        const newErrors = {};
        if (!professionalInfo.profession?.trim())
            newErrors.profession = "Profession is required";
        if (!professionalInfo.specialization?.trim())
            newErrors.specialization = "Specialization is required";
        if (!professionalInfo.experience?.trim())
            newErrors.experience = "Experience is required";
        if (!professionalInfo.bio?.trim()) newErrors.bio = "Bio is required";

        // Education validation
        const eduErrors = [];
        professionalInfo.education.forEach((edu, idx) => {
            const eduErr = {};
            if (!edu.university?.trim())
                eduErr.university = "University is required";
            if (!edu.degree?.trim()) eduErr.degree = "Degree is required";
            if (!edu.yearFrom) eduErr.yearFrom = "Year from is required";
            if (!edu.yearTo) eduErr.yearTo = "Year to is required";
            if (edu.yearFrom && edu.yearTo && edu.yearFrom > edu.yearTo)
                eduErr.yearTo = "Year to must be after year from";
            if (Object.keys(eduErr).length) eduErrors[idx] = eduErr;
        });
        if (eduErrors.length) newErrors.education = eduErrors;

        // Certificates validation
        const certErrors = [];
        professionalInfo.certificates.forEach((cert, idx) => {
            const certErr = {};
            if (!cert.certificateName?.trim())
                certErr.certificateName = "Certificate name is required";
            if (!cert.certificateFile)
                certErr.certificateFile = "Certificate file is required";
            if (Object.keys(certErr).length) certErrors[idx] = certErr;
        });
        if (certErrors.length) newErrors.certificates = certErrors;

        return newErrors;
    };

    const validateEmploymentInfo = () => {
        const newErrors = {};
        if (!employmentInfo.role?.trim()) newErrors.role = "Role is required";
        if (!employmentInfo.status) newErrors.status = "Status is required";
        if (!employmentInfo.joinDate) newErrors.joinDate = "Join date is required";
        if (!employmentInfo.salary) newErrors.salary = "Salary is required";
        if (!employmentInfo.contractStart)
            newErrors.contractStart = "Contract start date is required";
        if (!employmentInfo.contractEnd)
            newErrors.contractEnd = "Contract end date is required";
        if (
            employmentInfo.contractStart &&
            employmentInfo.contractEnd &&
            new Date(employmentInfo.contractStart) > new Date(employmentInfo.contractEnd)
        ) {
            newErrors.contractEnd = "Contract end must be after start";
        }
        if (!employmentInfo.note?.trim()) newErrors.note = "Note is required";
        return newErrors;
    };

    const validateAccessInfo = () => {
        const newErrors = {};
        if (!employmentInfo.email?.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(employmentInfo.email)) {
            newErrors.email = "Email is invalid";
        }
        if (!employmentInfo.contactNumber?.trim())
            newErrors.contactNumber = "Contact number is required";
        if (!employmentInfo.password && !employmentInfo?._id) {
            newErrors.password = "Password is required";
        } else if (employmentInfo.password.length < 6 && !employmentInfo?._id) {
            newErrors.password = "Password must be at least 6 characters";
        }
        if (!employmentInfo.permissionId)
            newErrors.permissionId = "Permission type is required";
        return newErrors;
    };

    // API calls
    const fetchPermission = async () => {
        try {
            const response = await getSecureApiData(`api/comman/permission/${userId}?type=lab`);
            if (response.success) {
                setPermissions(response.data);
            } else {
                toast.error(response.message);
            }
        } catch (err) {
            toast.error(err?.response?.data?.message);
        }
    };

    useEffect(() => {
        fetchPermission();
    }, []);

    const switchTab = (tabSelector) => {
        const tabTrigger = document.querySelector(tabSelector);
        if (tabTrigger) {
            const tab = new Tab(tabTrigger);
            tab.show();
        }
    };

    const handleBack = (e, name) => {
        e.preventDefault();
        switchTab(name);
    };

    async function fetchCountries() {
        setLoading(true);
        try {
            const response = await getApiData("api/location/countries");
            setCountries(response);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCountries();
    }, []);

    async function fetchStates(value) {
        setLoading(true);
        try {
            const response = await getApiData(`api/location/states/${value}`);
            setStates(response);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    }

    async function fetchCities(value) {
        setLoading(true);
        try {
            const response = await getApiData(`api/location/cities/${value}`);
            setCities(response);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    }

    async function handleAddStaff() {
        try {
            setSearchLoading(true)
            const result = await getSecureApiData(`api/staff/${staffNh12}`);
            if (result.success) {
                setStaffId(result.staffData?.userId)
                const staffData = result.staffData;
                let updatedPersonalInfo = {
                    ...staffData,
                    countryId: staffData?.countryId?._id,
                    stateId: staffData?.stateId?._id,
                    cityId: staffData?.cityId?._id,
                    dob: staffData?.dob
                        ? new Date(staffData.dob).toISOString().split("T")[0]
                        : "",

                };

                setPersonalInfo(updatedPersonalInfo);
                setProfessionalInfo({
                    education: staffData.education,
                    certificates: staffData?.certificates,
                    profession: staffData?.profession || "",
                    specialization: staffData.specialization || "",
                    experience: staffData.experience || "",
                    bio: staffData.bio || "",
                });
                if (result.employment) {
                    setEmploymentInfo({
                        ...result.employment,
                        password: "",
                        permissionId: result?.employment?.permissionId?._id || null
                    });
                }
                setIsExistingStaff(true);
                setById(false);
                fetchStates(staffData?.countryId?._id);
                fetchCities(staffData?.stateId?._id);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
        } finally {
            setSearchLoading(false)
        }
    }

    // Dynamic handlers for education/certificates
    const addEducation = () => {
        setProfessionalInfo((prev) => ({
            ...prev,
            education: [...prev.education, { university: "", degree: "", yearFrom: "", yearTo: "" }],
        }));
    };

    const removeEducation = (index) => {
        if (professionalInfo.education.length === 1) return;
        const updated = [...professionalInfo.education];
        updated.splice(index, 1);
        setProfessionalInfo((prev) => ({ ...prev, education: updated }));
    };

    const addCertificate = () => {
        setProfessionalInfo((prev) => ({
            ...prev,
            certificates: [...prev.certificates, { certificateName: "", certificateFile: null }],
        }));
    };

    const removeCertificate = (index) => {
        if (professionalInfo.certificates.length === 1) return;
        const updated = [...professionalInfo.certificates];
        updated.splice(index, 1);
        setProfessionalInfo((prev) => ({ ...prev, certificates: updated }));
    };

    const imageDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (!file) return;
        setPersonalInfo({ ...personalInfo, profileImage: file });
    };

    const imageDragOver = (e) => {
        e.preventDefault();
    };

    const handleUserChange = (e) => {
        const { name, value, files } = e.target;
        setPersonalInfo((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
        // Clear field error on change
        setErrors((prev) => ({
            ...prev,
            personal: { ...prev.personal, [name]: "" },
        }));

        if (name === "countryId") {
            const countryData = countries.find((item) => item?._id == value);
            fetchStates(countryData?.isoCode);
            setPersonalInfo((prev) => ({ ...prev, stateId: "", cityId: "" }));
        }
        if (name === "stateId") {
            const stateData = states.find((item) => item?._id == value);
            fetchCities(stateData?.isoCode);
            setPersonalInfo((prev) => ({ ...prev, cityId: "" }));
        }
    };

    const handleProfessionalChange = (e, index = null, type = null) => {
        const { name, value, files } = e.target;

        // ✅ CASE 1: Normal fields (profession, specialization, etc.)
        if (!type) {
            setProfessionalInfo((prev) => ({
                ...prev,
                [name]: value,
            }));

            // Clear error
            setErrors((prev) => ({
                ...prev,
                professional: {
                    ...prev.professional,
                    [name]: "",
                },
            }));

            return;
        }

        // ✅ CASE 2: Array fields (education / certificates)
        setProfessionalInfo((prev) => {
            const updated = [...(prev[type] || [])];
            updated[index][name] = files ? files[0] : value;

            return {
                ...prev,
                [type]: updated,
            };
        });

        // Clear error
        setErrors((prev) => {
            const newErrors = { ...prev };

            if (type === "education" && newErrors.professional?.education?.[index]) {
                delete newErrors.professional.education[index][name];
            }

            if (type === "certificates" && newErrors.professional?.certificates?.[index]) {
                delete newErrors.professional.certificates[index][name];
            }

            return newErrors;
        });
    };

    const handleEmploymentChange = (e) => {
        const { name, value } = e.target;
        setEmploymentInfo((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({
            ...prev,
            employment: { ...prev.employment, [name]: "" },
        }));
    };

    // Form submissions
    const userInfoSubmit = async (e) => {
        e.preventDefault();
        if (isExistingStaff) {
            switchTab("#profile-tab");
            return;
        }
        const personalErrors = validatePersonalInfo();
        if (Object.keys(personalErrors).length) {
            setErrors((prev) => ({ ...prev, personal: personalErrors }));
            toast.error("Please fix errors in Personal Information");
            return;
        }
        try {
            const formData = new FormData();
            Object.keys(personalInfo).forEach((key) => {
                formData.append(key, personalInfo[key]);
            });
            const res = await securePostData("api/staff/profile", formData);
            if (res.success) {
                setStaffId(res.user._id)
                toast.success("Staff Created");
                switchTab("#profile-tab");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message);
        }
    };

    const professionalSubmit = async (e) => {
        e.preventDefault();

        if (isExistingStaff) {
            switchTab("#contact-tab");
            return;
        }

        const profErrors = validateProfessionalInfo();
        if (Object.keys(profErrors).length) {
            setErrors((prev) => ({ ...prev, professional: profErrors }));
            toast.error("Please fix errors in Professional Information");
            return;
        }

        try {
            const formData = new FormData();

            formData.append("staffId", staffId);
            formData.append("bio", professionalInfo.bio);
            formData.append("specialization", professionalInfo.specialization);
            formData.append("experience", professionalInfo.experience);
            formData.append("profession", professionalInfo.profession);

            // ✅ Education
            formData.append(
                "education",
                JSON.stringify(professionalInfo.education)
            );

            // ✅ Certificates (IMPORTANT FIX)
            const certificateNames = [];

            professionalInfo.certificates.forEach((cert) => {
                if (cert.certificateFile) {
                    formData.append("certificates", cert.certificateFile); // 👈 same key multiple times
                    certificateNames.push(cert.certificateName);
                }
            });

            formData.append("certificateNames", JSON.stringify(certificateNames));

            const res = await securePostData("api/staff/professional", formData);

            if (res.success) {
                switchTab("#contact-tab");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message);
        }
    };

    const employmentSubmit = async (e) => {
        e.preventDefault();
        const empErrors = validateEmploymentInfo();
        if (Object.keys(empErrors).length) {
            setErrors((prev) => ({ ...prev, employment: empErrors }));
            toast.error("Please fix errors in Employment Details");
            return;
        }
        try {
            const payload = {
                ...employmentInfo,
                staffId: staffId || staffNh12,
                organizationId: userId,
            };
            const res = await securePostData("api/staff/employment", payload);
            if (res.success) {
                toast.success("Employment Added");
                switchTab("#upload-tab");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message);
        }
    };

    const accessSubmit = async (e) => {
        e.preventDefault();
        const accessErrors = validateAccessInfo();
        if (Object.keys(accessErrors).length) {
            setErrors((prev) => ({ ...prev, access: accessErrors }));
            toast.error("Please fix errors in Access Information");
            return;
        }
        try {
            const payload = {
                staffId: staffId || staffNh12,
                email: employmentInfo.email,
                contactNumber: employmentInfo.contactNumber,
                password: employmentInfo.password,
                permissionId: employmentInfo.permissionId,
                organizationId: userId,
            };
            const res = await securePostData("api/staff/employment", payload); // Adjust API endpoint as needed
            if (res.success) {
                toast.success("Access granted successfully");
                navigate('/employee')
                // Optionally redirect or reset
            }
        } catch (err) {
            toast.error(err?.response?.data?.message);
        }
    };
    useEffect(() => {
        if (searchParams.get('id')?.length === 12) {
            handleAddStaff()
        }
    }, [searchParams])

    return (
        <>
            {byId ? (
                <div className="main-content flex-grow-1 p-3 overflow-auto">
                    <h3 className="innr-title mb-2 ">Add Staff</h3>
                    <div className="new-panel-card col-lg-8">
                        <div className="hospital-add-doctor mb-2">
                            <div>
                                {/* <h4 className="fz-18 text-black fw-700 mb-0">Add Staff</h4> */}
                                <p className="mb-0">Please enter staff ID</p>
                            </div>
                            <div>
                                <button onClick={() => setById(false)} className="nw-exprt-btn">
                                    <FaPlusCircle /> Add Staff Manually
                                </button>
                            </div>
                        </div>
                        <div className="custom-frm-bx">
                            <label>Staff ID</label>
                            <input
                                type="text"
                                className="form-control nw-frm-select"
                                placeholder="Enter Staff ID"
                                value={staffNh12}
                                onChange={(e) => setStaffNh12(e.target.value)}
                            />
                            {searchLoading && <small className="text-info">Checking...</small>}
                        </div>
                        <div className="text-center mt-4">
                            <button className="nw-thm-btn w-75" disabled={searchLoading} onClick={handleAddStaff}>
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="main-content flex-grow-1 p-3 overflow-auto ">
                    <div className="profile-tp-header">
                        <h5 className="innr-title fz-24 mb-0">{searchParams?.get('id') ? 'Edit' : "Add"} Employee</h5>
                    </div>
                    <div className="all-profile-data-bx">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="employee-tabs mb-3">
                                    <ul className="nav nav-tabs gap-3" id="myTab" role="tablist">
                                        <li className="nav-item" role="presentation">
                                            <a className="nav-link active" id="home-tab" data-bs-toggle="tab" href="#home" role="tab">
                                                Personal Info
                                            </a>
                                        </li>
                                        <li className="nav-item" role="presentation">
                                            <a className="nav-link" id="profile-tab" data-bs-toggle="tab" href="#profile" role="tab">
                                                Professional
                                            </a>
                                        </li>
                                        <li className="nav-item" role="presentation">
                                            <a className="nav-link" id="contact-tab" data-bs-toggle="tab" href="#contact" role="tab">
                                                Employment
                                            </a>
                                        </li>
                                        <li className="nav-item" role="presentation">
                                            <a className="nav-link" id="upload-tab" data-bs-toggle="tab" href="#upload" role="tab">
                                                Access
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <div className="lab-chart-crd">
                                    <div className="patient-bio-tab">
                                        <div className="tab-content" id="myTabContent">
                                            {/* Personal Info Tab */}
                                            <div className="tab-pane fade show active" id="home" role="tabpanel">
                                                <form onSubmit={userInfoSubmit}>
                                                    <div className="row">
                                                        <div className="d-flex align-items-center gap-3 mb-3">
                                                            <h4 className="subtitle text-black mb-0">Personal Information</h4>
                                                        </div>
                                                        <div className="col-lg-4 col-md-6 col-sm-12">
                                                            <div className="custom-frm-bx">
                                                                <div className="upload-box p-3" onDrop={imageDrop} onDragOver={imageDragOver}>
                                                                    {!isExistingStaff && (
                                                                        <div className="upload-icon mb-2">
                                                                            <IoCloudUploadOutline />
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        {!isExistingStaff && (
                                                                            <>
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
                                                                                    onChange={handleUserChange}
                                                                                    id="fileInput1"
                                                                                    name="profileImage"
                                                                                    disabled={isExistingStaff}
                                                                                    accept=".png,.jpg,.jpeg"
                                                                                />
                                                                            </>
                                                                        )}
                                                                        {personalInfo.profileImage instanceof File && (
                                                                            <div id="filePreviewWrapper" className="mt-3">
                                                                                <img
                                                                                    src={URL.createObjectURL(personalInfo.profileImage)}
                                                                                    alt="Preview"
                                                                                    className="img-thumbnail"
                                                                                />
                                                                            </div>
                                                                        )}
                                                                        {typeof personalInfo.profileImage === "string" &&
                                                                            personalInfo.profileImage.startsWith("uploads") && (
                                                                                <div id="filePreviewWrapper" className="mt-3">
                                                                                    <img
                                                                                        src={`${base_url}/${personalInfo.profileImage}`}
                                                                                        alt="Preview"
                                                                                        className="img-thumbnail"
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-lg-4 col-md-6 col-sm-12">
                                                            <div className="custom-frm-bx">
                                                                <label>Name</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control nw-frm-select"
                                                                    placeholder="Enter name"
                                                                    value={personalInfo.name}
                                                                    name="name"
                                                                    onChange={handleUserChange}
                                                                    disabled={isExistingStaff}
                                                                />
                                                                {errors.personal.name && <small className="text-danger">{errors.personal.name}</small>}
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-4 col-md-6 col-sm-12">
                                                            <div className="custom-frm-bx">
                                                                <label>Date of Birth</label>
                                                                <input
                                                                    type="date"
                                                                    className="form-control nw-frm-select"
                                                                    value={personalInfo.dob}
                                                                    disabled={isExistingStaff}
                                                                    name="dob"
                                                                    max={new Date().toISOString().split("T")[0]}
                                                                    onChange={handleUserChange}
                                                                />
                                                                {errors.personal.dob && <small className="text-danger">{errors.personal.dob}</small>}
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-4 col-md-6 col-sm-12">
                                                            <div className="custom-frm-bx">
                                                                <label>Gender</label>
                                                                <select
                                                                    className="form-control nw-frm-select new-control-frm"
                                                                    value={personalInfo.gender}
                                                                    name="gender"
                                                                    disabled={isExistingStaff}
                                                                    onChange={handleUserChange}
                                                                >
                                                                    <option value="">---Select Gender---</option>
                                                                    <option value="male">Male</option>
                                                                    <option value="female">Female</option>
                                                                    <option value="other">Other</option>
                                                                </select>
                                                                {errors.personal.gender && <small className="text-danger">{errors.personal.gender}</small>}
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-12">
                                                            <div className="custom-frm-bx">
                                                                <label>Address</label>
                                                                <textarea
                                                                    value={personalInfo.address}
                                                                    disabled={isExistingStaff}
                                                                    name="address"
                                                                    onChange={handleUserChange}
                                                                    className="form-control nw-frm-select"
                                                                    placeholder="Enter Address"
                                                                ></textarea>
                                                                {errors.personal.address && <small className="text-danger">{errors.personal.address}</small>}
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-4 col-md-6 col-sm-12">
                                                            <div className="custom-frm-bx">
                                                                <label>Country</label>
                                                                <select
                                                                    className="form-control nw-frm-select"
                                                                    name="countryId"
                                                                    value={personalInfo.countryId}
                                                                    onChange={handleUserChange}
                                                                    disabled={isExistingStaff}
                                                                >
                                                                    <option value="">---Select Country---</option>
                                                                    {countries?.map((c) => (
                                                                        <option key={c._id} value={c._id}>
                                                                            {c.name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                {errors.personal.countryId && <small className="text-danger">{errors.personal.countryId}</small>}
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-4 col-md-6 col-sm-12">
                                                            <div className="custom-frm-bx">
                                                                <label>State</label>
                                                                <select
                                                                    className="form-control nw-frm-select"
                                                                    name="stateId"
                                                                    value={personalInfo.stateId}
                                                                    onChange={handleUserChange}
                                                                    disabled={isExistingStaff}
                                                                >
                                                                    <option value="">---Select State---</option>
                                                                    {states?.map((s) => (
                                                                        <option key={s._id} value={s._id}>
                                                                            {s.name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                {errors.personal.stateId && <small className="text-danger">{errors.personal.stateId}</small>}
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-4 col-md-6 col-sm-12">
                                                            <div className="custom-frm-bx">
                                                                <label>City</label>
                                                                <select
                                                                    className="form-control nw-frm-select"
                                                                    value={personalInfo.cityId}
                                                                    name="cityId"
                                                                    disabled={isExistingStaff}
                                                                    onChange={handleUserChange}
                                                                >
                                                                    <option value="">---Select City---</option>
                                                                    {cities?.map((c) => (
                                                                        <option key={c._id} value={c._id}>
                                                                            {c.name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                {errors.personal.cityId && <small className="text-danger">{errors.personal.cityId}</small>}
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-4 col-md-6 col-sm-12">
                                                            <div className="custom-frm-bx">
                                                                <label>Pin code</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control nw-frm-select"
                                                                    placeholder="Enter Pin code"
                                                                    value={personalInfo.pincode}
                                                                    disabled={isExistingStaff}
                                                                    name="pincode"
                                                                    onChange={handleUserChange}
                                                                />
                                                                {errors.personal.pincode && <small className="text-danger">{errors.personal.pincode}</small>}
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-12 my-3">
                                                            <h5 className="add-contact-title">Contact Information</h5>
                                                        </div>
                                                        <div className="col-lg-6 col-md-6 col-sm-12">
                                                            <div className="custom-frm-bx">
                                                                <label>Mobile Number</label>
                                                                <input
                                                                    type="number"
                                                                    className="form-control nw-frm-select"
                                                                    placeholder="Enter mobile number"
                                                                    value={personalInfo.contactNumber}
                                                                    maxLength={10}
                                                                    disabled={isExistingStaff}
                                                                    name="contactNumber"
                                                                    onChange={handleUserChange}
                                                                />
                                                                {errors.personal.contactNumber && (
                                                                    <small className="text-danger">{errors.personal.contactNumber}</small>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-6 col-md-6 col-sm-12">
                                                            <div className="custom-frm-bx">
                                                                <label>Email</label>
                                                                <input
                                                                    type="email"
                                                                    className="form-control nw-frm-select"
                                                                    placeholder="Enter Email"
                                                                    value={personalInfo.email}
                                                                    name="email"
                                                                    disabled={isExistingStaff}
                                                                    onChange={handleUserChange}
                                                                />
                                                                {errors.personal.email && <small className="text-danger">{errors.personal.email}</small>}
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-6 col-md-6 col-sm-12">
                                                            <div className="custom-frm-bx">
                                                                <label>Emergency Contact Name</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control nw-frm-select"
                                                                    placeholder="Enter Emergency Contact Name"
                                                                    value={personalInfo.emergencyContactName}
                                                                    name="emergencyContactName"
                                                                    disabled={isExistingStaff}
                                                                    onChange={handleUserChange}
                                                                />
                                                                {errors.personal.emergencyContactName && (
                                                                    <small className="text-danger">{errors.personal.emergencyContactName}</small>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-6 col-md-6 col-sm-12">
                                                            <div className="custom-frm-bx">
                                                                <label>Emergency Contact Phone</label>
                                                                <input
                                                                    type="number"
                                                                    className="form-control nw-frm-select"
                                                                    placeholder="Enter Emergency Contact Phone"
                                                                    value={personalInfo.emergencyContactPhone}
                                                                    name="emergencyContactPhone"
                                                                    maxLength={10}
                                                                    disabled={isExistingStaff}
                                                                    onChange={handleUserChange}
                                                                />
                                                                {errors.personal.emergencyContactPhone && (
                                                                    <small className="text-danger">{errors.personal.emergencyContactPhone}</small>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-end">
                                                            {isExistingStaff ? (
                                                                <button type="button" onClick={() => switchTab("#profile-tab")} className="nw-thm-btn">
                                                                    Next
                                                                </button>
                                                            ) : (
                                                                <button type="submit" className="nw-thm-btn">
                                                                    Save & Continue
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>

                                            {/* Professional Tab */}
                                            <div className="tab-pane fade" id="profile" role="tabpanel">
                                                <form onSubmit={professionalSubmit}>
                                                    <div className="row">
                                                        <h4 className="subtitle text-black mb-2">Professional Information</h4>
                                                        <div className="col-lg-4 col-md-6 col-sm-12">
                                                            <div className="custom-frm-bx">
                                                                <label>Profession</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control nw-frm-select"
                                                                    placeholder="e.g. Pharmacist, Nurse, etc."
                                                                    value={professionalInfo.profession}
                                                                    name="profession"
                                                                    onChange={handleProfessionalChange}
                                                                    disabled={isExistingStaff}
                                                                />
                                                                {errors.professional.profession && (
                                                                    <small className="text-danger">{errors.professional.profession}</small>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-4 col-md-6 col-sm-12">
                                                            <div className="custom-frm-bx">
                                                                <label>Specialization</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control nw-frm-select"
                                                                    placeholder="e.g. Cardiology, Pediatrics, etc."
                                                                    value={professionalInfo.specialization}
                                                                    name="specialization"
                                                                    onChange={handleProfessionalChange}
                                                                    disabled={isExistingStaff}
                                                                />
                                                                {errors.professional.specialization && (
                                                                    <small className="text-danger">{errors.professional.specialization}</small>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-4 col-md-6 col-sm-12">
                                                            <div className="custom-frm-bx">
                                                                <label>Total Experience</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control nw-frm-select"
                                                                    placeholder="Enter Total Experience"
                                                                    value={professionalInfo.experience}
                                                                    name="experience"
                                                                    onChange={handleProfessionalChange}
                                                                    disabled={isExistingStaff}
                                                                />
                                                                {errors.professional.experience && (
                                                                    <small className="text-danger">{errors.professional.experience}</small>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-12">
                                                            <div className="custom-frm-bx">
                                                                <label>Professional Bio</label>
                                                                <textarea
                                                                    value={professionalInfo.bio}
                                                                    name="bio"
                                                                    onChange={handleProfessionalChange}
                                                                    disabled={isExistingStaff}
                                                                    className="form-control nw-frm-select"
                                                                    placeholder="Enter professional biography and experience"
                                                                ></textarea>
                                                                {errors.professional.bio && <small className="text-danger">{errors.professional.bio}</small>}
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-12">
                                                            <h5 className="add-contact-title">Education</h5>
                                                        </div>
                                                    </div>
                                                    <div className="education-frm-bx mb-3 new-control-frm">
                                                        {professionalInfo.education.map((item, index) => (
                                                            <div className="row" key={index}>
                                                                <div className="col-lg-3 col-md-6 col-sm-12">
                                                                    <div className="custom-frm-bx">
                                                                        <label>University / Institution</label>
                                                                        <input
                                                                            type="text"
                                                                            className="form-control nw-frm-select"
                                                                            placeholder="Enter University / Institution"
                                                                            value={item.university}
                                                                            disabled={isExistingStaff}
                                                                            name="university"
                                                                            onChange={(e) => handleProfessionalChange(e, index, "education")}
                                                                        />
                                                                        {errors.professional.education?.[index]?.university && (
                                                                            <small className="text-danger">
                                                                                {errors.professional.education[index].university}
                                                                            </small>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="col-lg-3 col-md-6 col-sm-12">
                                                                    <div className="custom-frm-bx">
                                                                        <label>Degree / Qualification</label>
                                                                        <input
                                                                            type="text"
                                                                            className="form-control nw-frm-select"
                                                                            placeholder="Enter Degree / Qualification"
                                                                            value={item.degree}
                                                                            disabled={isExistingStaff}
                                                                            name="degree"
                                                                            onChange={(e) => handleProfessionalChange(e, index, "education")}
                                                                        />
                                                                        {errors.professional.education?.[index]?.degree && (
                                                                            <small className="text-danger">{errors.professional.education[index].degree}</small>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="col-lg-3 col-md-6 col-sm-12">
                                                                    <div className="custom-frm-bx">
                                                                        <label>Year From</label>
                                                                        <input
                                                                            type="number"
                                                                            className="form-control nw-frm-select"
                                                                            placeholder="Enter Year From"
                                                                            value={item.yearFrom}
                                                                            disabled={isExistingStaff}
                                                                            name="yearFrom"
                                                                            onChange={(e) => handleProfessionalChange(e, index, "education")}
                                                                        />
                                                                        {errors.professional.education?.[index]?.yearFrom && (
                                                                            <small className="text-danger">
                                                                                {errors.professional.education[index].yearFrom}
                                                                            </small>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="col-lg-3 col-md-6 col-sm-12">
                                                                    <div className="return-box">
                                                                        <div className="custom-frm-bx flex-column flex-grow-1">
                                                                            <label>Year To</label>
                                                                            <input
                                                                                type="number"
                                                                                className="form-control nw-frm-select"
                                                                                placeholder="Enter Year To"
                                                                                value={item.yearTo}
                                                                                disabled={isExistingStaff}
                                                                                name="yearTo"
                                                                                onChange={(e) => handleProfessionalChange(e, index, "education")}
                                                                            />
                                                                            {errors.professional.education?.[index]?.yearTo && (
                                                                                <small className="text-danger">
                                                                                    {errors.professional.education[index].yearTo}
                                                                                </small>
                                                                            )}
                                                                        </div>
                                                                        <div className="mt-2 remove-item-box">
                                                                            <button
                                                                                type="button"
                                                                                disabled={professionalInfo.education.length === 1 || isExistingStaff}
                                                                                className="employee-remove"
                                                                                onClick={() => removeEducation(index)}
                                                                            >
                                                                                <FontAwesomeIcon icon={faTrash} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="d-flex justify-content-end my-3">
                                                        <button
                                                            disabled={isExistingStaff}
                                                            type="button"
                                                            onClick={addEducation}
                                                            className="employee-data-btn"
                                                        >
                                                            <FaPlusSquare /> Add More
                                                        </button>
                                                    </div>
                                                    <div className="col-lg-12">
                                                        <h5 className="add-contact-title">Certificate</h5>
                                                    </div>
                                                    <div className="education-frm-bx mb-3">
                                                        {professionalInfo.certificates.map((item, index) => (
                                                            <div className="row" key={index}>
                                                                <div className="col-lg-6 col-md-6 col-sm-12">
                                                                    <div className="custom-frm-bx">
                                                                        <label>Certificate</label>
                                                                        <input
                                                                            type="text"
                                                                            className="form-control nw-frm-select"
                                                                            placeholder="Enter Certificate Name"
                                                                            value={item.certificateName}
                                                                            name="certificateName"
                                                                            onChange={(e) => handleProfessionalChange(e, index, "certificates")}
                                                                        />
                                                                        {errors.professional.certificates?.[index]?.certificateName && (
                                                                            <small className="text-danger">
                                                                                {errors.professional.certificates[index].certificateName}
                                                                            </small>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="col-lg-6 col-md-6 col-sm-12">
                                                                    <div className="return-box">
                                                                        <div className="custom-frm-bx mb-3 flex-column flex-grow-1">
                                                                            <label>Certificate Upload</label>
                                                                            <div className="custom-file-wrapper new-control-frm">
                                                                                <span className="em-browse-btn">
                                                                                    {item.certificateFile
                                                                                        ? item.certificateFile.name ||
                                                                                        item?.certificateFile.split("\\").pop().split("-").slice(1).join("-")
                                                                                        : ""}
                                                                                    Browse File
                                                                                </span>
                                                                                <input
                                                                                    type="file"
                                                                                    name="certificateFile"
                                                                                    onChange={(e) => handleProfessionalChange(e, index, "certificates")}
                                                                                    className="real-file-input"
                                                                                />
                                                                            </div>
                                                                            {errors.professional.certificates?.[index]?.certificateFile && (
                                                                                <small className="text-danger">
                                                                                    {errors.professional.certificates[index].certificateFile}
                                                                                </small>
                                                                            )}
                                                                        </div>
                                                                        <div className="remove-item-box">
                                                                            <button
                                                                                className="employee-remove"
                                                                                disabled={professionalInfo.certificates.length === 1 || isExistingStaff}
                                                                                onClick={() => removeCertificate(index)}
                                                                            >
                                                                                <FontAwesomeIcon icon={faTrash} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="d-flex justify-content-end my-3">
                                                        <button
                                                            disabled={isExistingStaff}
                                                            type="button"
                                                            onClick={addCertificate}
                                                            className="employee-data-btn"
                                                        >
                                                            <FaPlusSquare /> Add More
                                                        </button>
                                                    </div>
                                                    <div className="d-flex align-items-center justify-content-end gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleBack(e, "#home-tab")}
                                                            className="nw-thm-btn outline rounded-3"
                                                        >
                                                            Back
                                                        </button>
                                                        {isExistingStaff ? (
                                                            <button type="submit" onClick={() => switchTab("#contact-tab")} className="nw-thm-btn">
                                                                Next
                                                            </button>
                                                        ) : (
                                                            <button type="submit" className="nw-thm-btn rounded-3">
                                                                Save & Continue
                                                            </button>
                                                        )}
                                                    </div>
                                                </form>
                                            </div>

                                            {/* Employment Tab */}
                                            <div className="tab-pane fade" id="contact" role="tabpanel">
                                                <form onSubmit={employmentSubmit}>
                                                    <div className="row">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <h4 className="subtitle text-black mb-2">Employment Details</h4>
                                                        </div>
                                                        <div className="col-lg-6 col-md-6 col-sm-12">
                                                            <div className="custom-frm-bx">
                                                                <label>Position/Role</label>
                                                                <input
                                                                    type="text"
                                                                    name="role"
                                                                    className="form-control nw-frm-select"
                                                                    value={employmentInfo.role}
                                                                    onChange={handleEmploymentChange}
                                                                />
                                                                {errors.employment.role && <small className="text-danger">{errors.employment.role}</small>}
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-6 col-md-6 col-sm-12">
                                                            <div className="custom-frm-bx">
                                                                <label>Status</label>
                                                                <div className="select-wrapper">
                                                                    <select
                                                                        className="form-select nw-frm-select"
                                                                        name="status"
                                                                        value={employmentInfo.status}
                                                                        onChange={handleEmploymentChange}
                                                                    >
                                                                        <option value="">---Select Status---</option>
                                                                        <option value="active">Active</option>
                                                                        <option value="inactive">Inactive</option>
                                                                        <option value="leave">Leave</option>
                                                                    </select>

                                                                </div>
                                                                {errors.employment.status && <small className="text-danger">{errors.employment.status}</small>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-lg-6 col-md-6 col-sm-12">
                                                            <div className="custom-frm-bx">
                                                                <label>Join Date</label>
                                                                <input
                                                                    type="date"
                                                                    className="form-control nw-frm-select"
                                                                    value={employmentInfo.joinDate}
                                                                    name="joinDate"
                                                                    onChange={handleEmploymentChange}
                                                                />
                                                                {errors.employment.joinDate && <small className="text-danger">{errors.employment.joinDate}</small>}
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-6 col-md-6 col-sm-12">
                                                            <div className="custom-frm-bx">
                                                                <label>Salary(₹)</label>
                                                                <input
                                                                    type="number"
                                                                    value={employmentInfo.salary}
                                                                    name="salary"
                                                                    onChange={handleEmploymentChange}
                                                                    className="form-control nw-frm-select"
                                                                />
                                                                {errors.employment.salary && <small className="text-danger">{errors.employment.salary}</small>}
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-12 my-3">
                                                            <h5 className="add-contact-title">Contract Details</h5>
                                                        </div>
                                                        <div className="col-lg-6 col-md-6 col-sm-12">
                                                            <div className="custom-frm-bx">
                                                                <label>Contract Start</label>
                                                                <input
                                                                    type="date"
                                                                    className="form-control nw-frm-select"
                                                                    value={employmentInfo.contractStart}
                                                                    name="contractStart"
                                                                    onChange={handleEmploymentChange}
                                                                />
                                                                {errors.employment.contractStart && (
                                                                    <small className="text-danger">{errors.employment.contractStart}</small>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-6 col-md-6 col-sm-12">
                                                            <div className="custom-frm-bx">
                                                                <label>Contract End</label>
                                                                <input
                                                                    type="date"
                                                                    className="form-control nw-frm-select"
                                                                    value={employmentInfo.contractEnd}
                                                                    name="contractEnd"
                                                                    onChange={handleEmploymentChange}
                                                                />
                                                                {errors.employment.contractEnd && (
                                                                    <small className="text-danger">{errors.employment.contractEnd}</small>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-12">
                                                            <div className="custom-frm-bx">
                                                                <label>Note</label>
                                                                <textarea
                                                                    value={employmentInfo.note}
                                                                    name="note"
                                                                    onChange={handleEmploymentChange}
                                                                    className="form-control nw-frm-select"
                                                                    placeholder="Enter Note"
                                                                ></textarea>
                                                                {errors.employment.note && <small className="text-danger">{errors.employment.note}</small>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex align-items-center justify-content-end gap-3">
                                                        <button
                                                            type="button"
                                                            className="nw-thm-btn outline rounded-3"
                                                            onClick={(e) => handleBack(e, "#profile-tab")}
                                                        >
                                                            Back
                                                        </button>
                                                        <button type="submit" className="nw-thm-btn rounded-3">
                                                            Save & Continue
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>

                                            {/* Access Tab */}
                                            <div className="tab-pane fade" id="upload" role="tabpanel">
                                                <form onSubmit={accessSubmit}>
                                                    <div className="row">
                                                        <h4 className="subtitle text-black mb-2">Access</h4>
                                                        <div className="col-lg-6 col-md-6 col-sm-12">
                                                            <div className="custom-frm-bx">
                                                                <label>Email</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control nw-frm-select"
                                                                    placeholder="Enter email"
                                                                    value={employmentInfo.email}
                                                                    onChange={handleEmploymentChange}
                                                                    name="email"
                                                                />
                                                                {errors.access.email && <small className="text-danger">{errors.access.email}</small>}
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-6 col-md-6 col-sm-12">
                                                            <div className="custom-frm-bx">
                                                                <label>Phone</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control nw-frm-select"

                                                                    placeholder="Enter Phone"
                                                                    maxLength={10}
                                                                    value={employmentInfo.contactNumber}
                                                                    onChange={handleEmploymentChange}
                                                                    name="contactNumber"
                                                                />
                                                                {errors.access.phone && <small className="text-danger">{errors.access.phone}</small>}
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-6 col-md-6 col-sm-12">
                                                            <div className="custom-frm-bx">
                                                                <label>Id</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control nw-frm-select"
                                                                    disabled
                                                                    placeholder="Enter Phone"
                                                                    maxLength={10}
                                                                    value={user?.nh12}
                                                                    readOnly
                                                                    name="contactNumber"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-6 col-md-6 col-sm-12">
                                                            <div className="custom-frm-bx">
                                                                <label>Password</label>
                                                                <input
                                                                    type="password"
                                                                    className="form-control nw-frm-select"
                                                                    placeholder="Enter Password"
                                                                    value={employmentInfo.password}
                                                                    onChange={handleEmploymentChange}
                                                                    name="password"
                                                                />
                                                                {errors.access.password && <small className="text-danger">{errors.access.password}</small>}
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-12">
                                                            <h5 className="add-contact-title">Permission</h5>
                                                        </div>
                                                        <div className="col-lg-6 col-md-6 col-sm-12">
                                                            <div className="custom-frm-bx">
                                                                <label>Permission Type</label>
                                                                <div className="select-wrapper">
                                                                    <select
                                                                        name="permissionId"
                                                                        onChange={handleEmploymentChange}
                                                                        value={employmentInfo.permissionId}
                                                                        className="form-select nw-frm-select"
                                                                    >
                                                                        <option value="">---Select Permission Type---</option>
                                                                        {permisions?.length > 0 &&
                                                                            permisions.map((item, key) => (
                                                                                <option value={item._id} key={key}>
                                                                                    {item.name}
                                                                                </option>
                                                                            ))}
                                                                    </select>

                                                                </div>
                                                                {errors.access.permissionId && (
                                                                    <small className="text-danger">{errors.access.permissionId}</small>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="d-flex align-items-center justify-content-end gap-3">
                                                            <button
                                                                className="nw-thm-btn outline rounded-3"
                                                                onClick={(e) => handleBack(e, "#contact-tab")}
                                                            >
                                                                Back
                                                            </button>
                                                            <button type="submit" className="nw-thm-btn rounded-3">
                                                                Submit
                                                            </button>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default AddEmployee;