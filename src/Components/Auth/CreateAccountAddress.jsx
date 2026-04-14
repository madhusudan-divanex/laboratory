import { FaFlask } from "react-icons/fa6";
import { BsFillFileImageFill } from "react-icons/bs";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { FaCloudUploadAlt } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getApiData, postApiData, securePostData } from "../../services/api";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserDetail } from "../../redux/features/userSlice";
import Loader from "../Layouts/Loader";


function CreateAccountAddress() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const userId = localStorage.getItem('userId')
    const { labAddress } = useSelector(state => state.user)
    const [countries, setCountries] = useState([])
    const [states, setStates] = useState([])
    const [cities, setCities] = useState([])
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        fullAddress: "",
        countryId: "",
        stateId: "",
        cityId: "",
        pinCode: "",
        lat: null,
        long: null,
        userId
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
        if (name === 'countryId' && value) {
            const data = countries?.filter(item => item?._id === value)
            fetchStates(data[0].isoCode);
        }
        if (name === 'stateId' && value) {
            const data = states?.filter(item => item?._id === value)
            fetchCities(data[0].isoCode);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await securePostData('lab/about', formData)
            if (response.success) {
                toast.success('Address saved successfully')
                navigate('/create-account-person')
            } else {
                toast.error(response.message)
            }
            console.log("Lab created:", response.data);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        }
    };

    async function fetchCountries() {
        setLoading(true)
        try {
            const response = await getApiData('api/location/countries')
            const data = await response
            setCountries(data)
        } catch (error) {

        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        fetchCountries()
    }, [])
    async function fetchStates(value) {
        setLoading(true)
        try {
            const response = await getApiData(`api/location/states/${value}`)
            const data = await response
            setStates(data)
        } catch (error) {

        } finally {
            setLoading(false)
        }
    }
    async function fetchCities(value) {
        setLoading(true)
        try {
            const response = await getApiData(`api/location/cities/${value}`)
            const data = await response
            setCities(data)
        } catch (error) {

        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        dispatch(fetchUserDetail())
    }, [dispatch])
    useEffect(() => {
        if (labAddress) {
            navigate('/create-account-person')
        }
    }, [labAddress])
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        lat: position.coords.latitude,
                        long: position.coords.longitude
                    }));
                },
                (error) => {
                    console.log(error);
                }
            );
        }
    }, []);
    return (
        <>
            {loading ? <Loader />
                : <section className="admin-login-section account-lg-section nw-create-account-section">
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
                                        <div className="account-step-crd account-step-one">
                                            <div className="account-step-bx  ">
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
                            <div className="col-lg-12">
                                <div>
                                    {/* <img src="/footer-bnner.png" alt="" /> */}
                                </div>
                            </div>

                        </div>

                        <div className="row justify-content-center mb-4">
                            <div className="col-lg-5 col-md-6 col-sm-12">
                                <form onSubmit={handleSubmit}>
                                    <div className="">
                                        <div className="neo-health-frm-card">
                                            <div className="admin-vndr-login">
                                                <h3>Laboratory Address</h3>
                                                <p>Enter  Laboratory  Address </p>
                                            </div>
                                            <div className="custom-frm-bx">
                                                <label htmlFor="">Full Address</label>
                                                <input type="text" className="form-control" name="fullAddress" value={formData.fullAddress} onChange={handleChange} placeholder="Enter Full Address" />
                                            </div>

                                            <div className="custom-frm-bx">
                                                <label htmlFor="">Country</label>
                                                <select name="countryId" value={formData.countryId} onChange={handleChange} id="" className="form-select">
                                                    <option value="">---Select Country---</option>
                                                    {countries?.map((item, key) =>
                                                        <option value={item?._id} key={key}>{item?.name}</option>)}
                                                </select>
                                            </div>

                                            <div className="custom-frm-bx">
                                                <label htmlFor="">State</label>
                                                <select name="stateId" value={formData.stateId} onChange={handleChange} id="" className="form-select">
                                                    <option value="">---Select State---</option>
                                                    {states?.map((item, key) =>
                                                        <option value={item?._id} key={key}>{item?.name}</option>)}
                                                </select>
                                            </div>

                                            <div className="custom-frm-bx">
                                                <label htmlFor="">City</label>
                                                <select name="cityId" value={formData.cityId} onChange={handleChange} id="" className="form-select">
                                                    <option value="">---Select City---</option>
                                                    {cities?.map((item, key) =>
                                                        <option value={item?._id} key={key}>{item?.name}</option>)}
                                                </select>
                                            </div>

                                            <div className="custom-frm-bx">
                                                <label htmlFor="">Pin Code</label>
                                                <input type="text" name="pinCode" value={formData.pinCode} onChange={handleChange} className="form-control" placeholder="Enter Pin code" />
                                            </div>


                                            <div className='mt-4'>
                                                <button type="submit" className="admin-lg-btn">
                                                    Next
                                                </button>
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
                            <div className="col-lg-12">
                                <div>
                                    <img src="/footer-bnner.png" alt="" />
                                </div>
                            </div>
                        </div>

                    </div>
                </section>}
        </>
    )
}

export default CreateAccountAddress