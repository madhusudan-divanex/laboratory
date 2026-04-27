import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import { FaPlusCircle } from "react-icons/fa";
import { getApiData, securePostData } from "../../services/api";
function AddPatient({handleClose}) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false)
    const [patientData, setPatientData] = useState()

    const [fetchById, setFetchById] = useState(false)
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [patientId, setPatientId] = useState()
    const [byId, setById] = useState(true)
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        name: "",
        dob: "",
        gender: "",
        contactNumber: "",
        email: "",
        contact: {
            emergencyContactName: "",
            emergencyContactNumber: "",
        },
        address: "",
        countryId: null,
        stateId: "",
        cityId: "",
        pinCode: "",
        status: "Active"
    });


    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes(".")) {
            const [parent, child] = name.split(".");

            setForm(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {

            setForm(prev => ({ ...prev, [name]: value }));
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
        if (!validate()) return;
        try {
            const res=await securePostData("lab/add-patient", form);
            if(res.success){            
                toast.success("Patient added successfully");
                handleClose(res.data.nh12)
            }else{
                toast.error(res?.message || "Failed to add patient");
            }


        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
        }
    };

    useEffect(() => {
        getApiData("api/location/countries")
            .then(res =>{const data=res.find(item=>item?.name=="India")
                setForm({...form,countryId:data?._id})
                fetchStates(data?.isoCode)
                 setCountries(res)})
            .catch(err => console.error(err));
        
    }, []);

    async function fetchStates(value) {
        try {
            const response = await getApiData(`api/location/states/${value}`)
            const data = await response
            setStates(data)
        } catch (error) {

        }
    }
    async function fetchCities(value) {
        try {
            const response = await getApiData(`api/location/cities/${value}`)
            const data = await response
            setCities(data)
        } catch (error) {

        }
    }






    const validate = () => {
        let newErrors = {};

        //   if (!form.patientId.trim())
        //     newErrors.patientId = "Patient ID is required";

        if (!form.name.trim())
            newErrors.name = "Patient name is required";

        if (!form.dob)
            newErrors.dob = "Date of birth is required";

        if (!form.gender)
            newErrors.gender = "Gender is required";

        if (!form.contactNumber)
            newErrors.contactNumber = "Mobile number is required";
        else if (!/^\d{10}$/.test(form.contactNumber))
            newErrors.contactNumber = "Mobile number must be 10 digits";

        if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
            newErrors.email = "Invalid email address";

        // if (form.emergencyContactPhone && !/^\d{10}$/.test(form.emergencyContactPhone))
        //     newErrors.emergencyContactPhone = "Emergency phone must be 10 digits";

       

        if (!form.countryId )
          newErrors.countryId = "State is required";

        if (!form.stateId )
          newErrors.stateId = "State is required";

        if (!form.cityId )
          newErrors.cityId = "City is required";

        if (form.pinCode && !/^\d{6}$/.test(form.pinCode))
            newErrors.pinCode = "Pincode must be 6 digits";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    useEffect(() => {
        if (!form.stateId) return;

        const fetchCities = async () => {
            try {
                const res = await getApiData(`location/cities/${form.stateId}`);
                setCities(res.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchCities();
    }, [form.stateId]);

    return (
        <>

           <div className="new-panel-card">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="">
                                    <h5 className="add-contact-title">Patient Details</h5>
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-6 col-sm-12">
                                <div className="custom-frm-bx">
                                    <label htmlFor="">Patient Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Name"
                                        value={form.name}
                                        onChange={handleChange}
                                        disabled={fetchById}
                                        className="form-control"
                                    />
                                    {errors.name && <small className="text-danger">{errors.name}</small>}
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-6 col-sm-12">
                                <div className="custom-frm-bx">
                                    <label htmlFor="">Date of Birth </label>
                                    <input
                                        type="date"
                                        name="dob"
                                        max={new Date().toISOString().split("T")[0]}
                                        value={form.dob}
                                        onChange={handleChange}
                                        disabled={fetchById}
                                        className="form-control"
                                    />
                                    {errors.dob && <small className="text-danger">{errors.dob}</small>}
                                </div>
                            </div>



                            <div className="col-lg-4 col-md-6 col-sm-12">
                                <div className="custom-frm-bx">
                                    <label>Gender</label>

                                     <select
                                            name="gender"
                                            value={form.gender}
                                            onChange={handleChange}
                                            disabled={fetchById}
                                            className="form-select"
                                        >
                                            <option value="">Select</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {errors.gender && <small className="text-danger">{errors.gender}</small>}

                                   
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-6 col-sm-12">
                                <div className="custom-frm-bx">
                                    <label htmlFor="">Mobile Number</label>
                                    <input
                                        type="number"
                                        placeholder="Mobile Number"
                                        name="contactNumber"
                                        value={form.contactNumber}
                                        onChange={handleChange}
                                        disabled={fetchById}
                                        className="form-control"
                                    />
                                    {errors.contactNumber && <small className="text-danger">{errors.contactNumber}</small>}
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-6 col-sm-12">
                                <div className="custom-frm-bx">
                                    <label htmlFor="">Email</label>
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        disabled={fetchById}
                                        className="form-control"
                                    />
                                    {errors.email && <small className="text-danger">{errors.email}</small>}
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-6 col-sm-12">
                                <div className="custom-frm-bx">
                                    <label htmlFor="">Emergency Contact Name</label>
                                    <input
                                        type="text"
                                        placeholder="Emergency Contact Name"
                                        name="contact.emergencyContactName"
                                        value={form.emergencyContactName}
                                        onChange={handleChange}
                                        disabled={fetchById}
                                        className="form-control"
                                    />
                                    {/* {errors.emergencyContactName && <small className="text-danger">{errors.emergencyContactName}</small>} */}
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-6 col-sm-12">
                                <div className="custom-frm-bx">
                                    <label htmlFor="">Emergency Contact Phone</label>
                                    <input
                                        type="number"
                                        placeholder="Emergency Contact Phone"
                                        name="contact.emergencyContactNumber"
                                        value={form?.contact?.emergencyContactNumber}
                                        onChange={handleChange}
                                        disabled={fetchById}
                                        className="form-control"
                                    />
                                    {/* {errors.emergencyContactNumber && <small className="text-danger">{errors.emergencyContactNumber}</small>} */}
                                </div>
                            </div>                        
                            <div className="col-lg-12">
                                <div className="custom-frm-bx">
                                    <label htmlFor="">Address</label>
                                    <textarea name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        disabled={fetchById}
                                        placeholder="Address"
                                        className="form-control">
                                    </textarea>
                                    {errors.address && <small className="text-danger">{errors.address}</small>}
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6 col-sm-12">
                                <div className="custom-frm-bx">
                                    <label htmlFor="">Country</label>
                                    <select
                                            className="form-select"
                                            value={form.countryId}
                                            name="countryId"
                                            onChange={handleChange}
                                            disabled={fetchById}
                                        >
                                            <option value="">---Select Country---</option>
                                            {countries?.map((s) => (
                                                <option key={s._id} value={s._id} >
                                                    {s.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.countryId && <small className="text-danger">{errors.countryId}</small>}

                                </div>
                            </div>

                            <div className="col-lg-4 col-md-6 col-sm-12">
                                <div className="custom-frm-bx">
                                    <label htmlFor="">State</label>
                                    <select
                                            className="form-select"
                                            value={form.stateId}
                                            name="stateId"
                                            disabled={!form.countryId && fetchById}
                                            onChange={handleChange}
                                        >
                                            <option value="">---Select State---</option>
                                            {states?.map((s) => (
                                                <option key={s._id} value={s._id}>
                                                    {s.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.stateId && <small className="text-danger">{errors.stateId}</small>}

                                </div>
                            </div>

                            <div className="col-lg-4 col-md-6 col-sm-12">
                                <div className="custom-frm-bx">
                                    <label htmlFor="">City</label>
                                   <select
                                            className="form-select"
                                            value={form.cityId}
                                            name="cityId"
                                            onChange={handleChange}
                                            disabled={!form.stateId && fetchById}
                                        >
                                            <option value="">---Select City---</option>
                                            {cities?.map((c, index) => (
                                                <option key={index} value={c._id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.cityId && <small className="text-danger">{errors.cityId}</small>}
                                </div>
                            </div>


                            <div className="col-lg-4 col-md-6 col-sm-12">
                                <div className="custom-frm-bx">
                                    <label htmlFor="">Pincode</label>
                                    <input
                                        type="number"
                                        name="pinCode"
                                        placeholder="Pincode"
                                        value={form.pinCode}
                                        onChange={handleChange}
                                        disabled={fetchById}
                                        className="form-control" />
                                    {errors.pinCode && <small className="text-danger">{errors.pinCode}</small>}
                                </div>
                            </div>                          
                        </div>
                        <div className="mt-5 d-flex align-items-center justify-content-end gap-3">
                            <button type="submit" className="nw-thm-btn rounded-3" >Submit</button>
                        </div>

                    </form>
                </div>

            

        </>
    )
}

export default AddPatient