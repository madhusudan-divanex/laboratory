import { faCircleXmark } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { postApiData } from '../../services/api'
import { toast } from 'react-toastify'

function ContactQuery() {
    const [loading,setLoading] =useState(false)
    const [formData,setFormData]=useState({
        name:"",
        panel:"lab",
        email:"",
        accountType:"",
        companyName:"",
        contactNumber:""
    })
    const handleChange=(e)=>{
        const{name,value}=e.target
        setFormData({...formData,[name]:value})
    }
    const handleSubmit=async(e)=>{
        e.preventDefault()
        setLoading(true)
        try {
            const res=await postApiData('api/neo/contact-query',formData)
            if(res.success){
                document.getElementById('closeContact')?.click()
                toast.success("Message sent")
            }else{
                toast.error(res.message)
            }
        } catch (error) {
            toast.error(res.message)
        } finally{
            setLoading(false)
        }
    }
    return (
        <div className="modal step-modal" id="contactQuery" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
            aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content rounded-5">
                    <div className="d-flex align-items-center justify-content-between popup-nw-brd px-4 py-3">
                        <div>
                            <h6 className="lg_title mb-0">Become a Laboratory Partner</h6>
                        </div>
                        <div>
                            <button type="button" className="" data-bs-dismiss="modal" aria-label="Close" id="closeContact">
                                <FontAwesomeIcon icon={faCircleXmark} />
                            </button>
                        </div>
                    </div>
                    <div className="modal-body px-4">
                        <form onSubmit={handleSubmit}>
                            <div className="row">

                                <div className="col-12">
                                    <div className="custom-frm-bx">
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="form-control nw-frm-select"
                                            placeholder="Enter your Name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="custom-frm-bx">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            required
                                            className="form-control nw-frm-select"
                                            placeholder="Enter your email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="custom-frm-bx">
                                        <label>Contact Number</label>
                                        <input
                                            type="number"
                                            required
                                            minLength={10}
                                            maxLength={10}
                                            className="form-control nw-frm-select"
                                            placeholder="Enter your contact number"
                                            name="contactNumber"
                                            value={formData.contactNumber}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="custom-frm-bx">
                                        <label>Account Type</label>
                                        <select name="accountType" className='form-select'
                                            value={formData.accountType}
                                            onChange={handleChange} id="" required>
                                            <option value="">Select</option>
                                            <option value="Doctor">Doctor</option>
                                            <option value="Hospital">Hospital</option>
                                            <option value="Pharmacy">Pharmacy</option>
                                            <option value="Laboratory">Laboratory</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="custom-frm-bx">
                                        <label>Company Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="form-control nw-frm-select"
                                            placeholder="Enter your company Name"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="col-lg-12">
                                    <div className="text-center mt-3">
                                        <button disabled={loading} className="nw-thm-btn rounded-2 w-75" type="submit">
                                            {loading?"Submitting...":"Submit"}
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ContactQuery
