import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { deleteApiData, getApiData, securePostData, updateApiData } from '../../services/api'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleXmark, faEdit, faPlusCircle, faTrash } from '@fortawesome/free-solid-svg-icons'
import Loader from '../Layouts/Loader'
import { Link, NavLink } from 'react-router-dom'

function Slots() {
    const [day, setDay] = useState('')
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [loading, setLoading] = useState(false)
    const userId = localStorage.getItem('userId')
    const [isCreate, setIsCreate] = useState(false)
    const [mySlots, setMySlots] = useState([])
    const [selectedSlot, setSelectedSlot] = useState()
    const [slots, setSlots] = useState(selectedSlot?.slots || []);
    const [errors, setErrors] = useState([])
    const slotSubmit = async (e) => {
        e.preventDefault()
        const data = { day, startTime, endTime, userId }
        if (!day || !startTime || !endTime) {
            return toast.error("All fields are required")
        }
        if (startTime > endTime) {
            return toast.error("Start time is not greater then end time")
        }
        setLoading(true)
        try {
            const res = await securePostData('lab/time-slot', data)
            if (res.success) {
                setIsCreate(false)
                fetchMySlots()
                toast.success("Time slot added")
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error(error?.response?.data?.message)
        } finally {
            setLoading(false)
        }
    }
    async function fetchMySlots() {
        try {
            const res = await getApiData(`lab/time-slot/${userId}`)
            if (res.success) {
                setMySlots(res.data)
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error(error?.response?.data?.message)
        }
    }
    useEffect(() => {
        fetchMySlots()
    }, [userId])
    useEffect(() => {
        if (selectedSlot?.slots) {
            setSlots(selectedSlot.slots);
        }
    }, [selectedSlot]);
    const handleSlotChange = (index, field, value) => {
        const updatedSlots = [...slots];
        updatedSlots[index][field] = value;
        setSlots(updatedSlots);
    };
    const addSlot = () => {
        setSlots([...slots, { startTime: "", endTime: "" }]);
    };
    const deleteSlot = (index) => {
        const updatedSlots = slots.filter((_, i) => i !== index);
        setSlots(updatedSlots);
    };
    const handleSave = async (e) => {
        e.preventDefault()
        if (!validateSlots()) return;
        const data = { day: selectedSlot?.day, userId, slots }
        setLoading(true)
        try {
            const res = await updateApiData('lab/day-slot', data)
            if (res.success) {
                document.getElementById("closeSlot")?.click()
                toast.success("Slot updated")
                fetchMySlots()
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error(error?.response?.data?.message)
        } finally {
            setLoading(false)
        }
    }
    const validateSlots = () => {
        let newErrors = [];

        slots.forEach((slot, index) => {

            if (!slot.startTime) {
                newErrors.push(`Slot ${index + 1}: Start time is required`);
            }

            if (!slot.endTime) {
                newErrors.push(`Slot ${index + 1}: End time is required`);
            }

            if (slot.startTime && slot.endTime && slot.startTime >= slot.endTime) {
                newErrors.push(`Slot ${index + 1}: End time must be greater than start time`);
            }

        });

        // Overlap validation
        const sorted = [...slots].sort((a, b) =>
            a.startTime.localeCompare(b.startTime)
        );

        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i].startTime < sorted[i - 1].endTime) {
                newErrors.push("Slots should not overlap");
                break;
            }
        }

        setErrors(newErrors);

        return newErrors.length === 0;
    };
    return (
        <>
            {loading ? <Loader />
                : <div className="main-content flex-grow-1 p-3 overflow-auto">
                    <div className="row mb-3">
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <h3 className="innr-title"> Slots</h3>
                                <div className="admin-breadcrumb">
                                    <nav aria-label="breadcrumb">
                                        <ol className="breadcrumb custom-breadcrumb">
                                            <li className="breadcrumb-item">
                                                <NavLink to="/dashboard" className="breadcrumb-link">
                                                    Dashboard
                                                </NavLink>
                                            </li>
                                            <li
                                                className="breadcrumb-item active"
                                                aria-current="page"
                                            >
                                                Slots
                                            </li>
                                        </ol>
                                    </nav>
                                </div>
                            </div>

                            <div className="add-nw-bx">
                                {!isCreate && mySlots?.length < 7 && <button className='thm-btn' onClick={() => setIsCreate(!isCreate)}>{isCreate ? 'Close' : 'Add'}</button>}

                            </div>
                        </div>
                    </div>
                    {isCreate ? <div className="all-profile-data-bx">
                        <form onSubmit={slotSubmit}>
                            <div className="new-panel-card mb-3">
                                <div className="row">
                                    <div>
                                        <h5 className="text-black fz-18 fw-700">Add Slot Details</h5>
                                        <p className="fz-16 fw-400">Select day and time for appointment.</p>
                                    </div>
                                    <div className="col-lg-4 col-md-6 col-sm-12">
                                        <div className="custom-frm-bx">
                                            <label htmlFor="">Day</label>
                                            <div className='custom-frm-bx mb-0 '>
                                                <select className='form-select new-control-frm' value={day} onChange={(e) => setDay(e.target.value)}>
                                                    <option value="">Select</option>
                                                    <option value="Sunday">Sunday</option>
                                                    <option value="Monday">Monday</option>
                                                    <option value="Tuesday">Tuesday</option>
                                                    <option value="Wednesday">Wednesday</option>
                                                    <option value="Thursday">Thursday</option>
                                                    <option value="Friday">Friday</option>
                                                    <option value="Saturday">Saturday</option>
                                                </select>
                                            </div>

                                        </div>
                                    </div>

                                    <div className="col-lg-4 col-md-6 col-sm-12">
                                        <div className="custom-frm-bx">
                                            <label htmlFor="">Start Time</label>
                                            <input type="time"
                                                value={startTime} onChange={(e) => setStartTime(e.target.value)}
                                                className="form-control new-control-frm" placeholder="" />

                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-md-6 col-sm-12">
                                        <div className="custom-frm-bx">
                                            <label htmlFor="">End Time</label>
                                            <input type="time"
                                                value={endTime} onChange={(e) => setEndTime(e.target.value)}
                                                className="form-control new-control-frm" placeholder="" />

                                        </div>
                                    </div>

                                </div>
                            </div>


                            <div className="d-flex justify-content-between mt-3">
                                <button className='nw-thm-btn outline' type='button' onClick={() => setIsCreate(false)}>Close</button>
                                <button className="nw-thm-btn">Submit</button>
                            </div>

                        </form>
                    </div> :
                        <div className="all-profile-data-bx">
                            <div className="row ">
                                <div className="col-lg-12">
                                    <div className="table-section mega-table-section">
                                        <div className="table table-responsive mb-0">
                                            <table className="table mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Day</th>
                                                        <th>Total Slots</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {mySlots?.length > 0 ?
                                                        mySlots?.map((item, key) =>
                                                            <tr key={key}>
                                                                <td>{key + 1}.</td>
                                                                <td> {item?.day}</td>
                                                                <td>
                                                                    {item?.slots?.length}
                                                                </td>
                                                                <td>
                                                                    <div className='d-flex gap-3'>
                                                                        <button onClick={() => setSelectedSlot(item)} data-bs-toggle="modal" data-bs-target="#slot-modal" className='text-success'><FontAwesomeIcon icon={faEdit} /></button>
                                                                        {/* <button className='text-danger'><FontAwesomeIcon icon={faTrash}/></button> */}
                                                                    </div>
                                                                </td>

                                                            </tr>) : (
                                                            <tr>
                                                                <td colSpan="5" className="text-center py-4 fw-600">
                                                                    No slots found
                                                                </td>
                                                            </tr>
                                                        )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>}
                    <div className="mt-3 text-end">
                        <Link to={-1} className="nw-thm-btn rounded-3 outline" >
                            Go Back
                        </Link>
                    </div>




                </div>}
            <div className="modal step-modal fade" id="slot-modal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1}
                aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-md">
                    <div className="modal-content rounded-0">
                        <div className="d-flex align-items-center justify-content-between border-bottom py-3 px-4">
                            <div>
                                <h6 className="heading-grad fz-24 mb-0">{selectedSlot?.day} Slot Details </h6>
                            </div>
                            <div>
                                <button type="button" className="" id='closeSlot' data-bs-dismiss="modal" aria-label="Close" style={{ color: "rgba(239, 0, 0, 1)" }}>
                                    <FontAwesomeIcon icon={faCircleXmark} />
                                </button>
                            </div>
                        </div>
                        <div className="modal-body px-4 pb-4">
                            <div className="row justify-content-center">
                                <div className="col-lg-12">
                                    <form onSubmit={handleSave}>

                                        {slots.map((item, index) => (
                                            <div className="row" key={index}>

                                                <div className="col-lg-6">
                                                    <label>Start Time</label>
                                                    <div className="custom-frm-bx">

                                                        <input
                                                            type="time"
                                                            value={item.startTime}
                                                            onChange={(e) =>
                                                                handleSlotChange(index, "startTime", e.target.value)
                                                            }
                                                            className="form-control new-control-frm"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-lg-6">
                                                    <div className='role-department-box'>
                                                        <div className="custom-frm-bx mb-0 flex-grow-1">
                                                            <label>End Time</label>
                                                            <input
                                                                type="time"
                                                                value={item.endTime}
                                                                onChange={(e) =>
                                                                    handleSlotChange(index, "endTime", e.target.value)
                                                                }
                                                                className="form-control new-control-frm"
                                                            />
                                                        </div>

                                                        <div className='mt-4'>
                                                            <button
                                                                type="button"
                                                                className="text-danger"
                                                                onClick={() => deleteSlot(index)}
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        ))}

                                        <div className="text-end mb-3">
                                            <button type="button" className="text-success" onClick={addSlot}>
                                                <FontAwesomeIcon icon={faPlusCircle} /> Add Slot
                                            </button>
                                        </div>

                                        {errors.length > 0 && (
                                            <div className="alert alert-danger">
                                                <ul className="mb-0">
                                                    {errors.map((err, i) => (
                                                        <li key={i}>{err}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <button type="submit" className="nw-thm-btn w-100">
                                            Submit
                                        </button>

                                    </form>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Slots
