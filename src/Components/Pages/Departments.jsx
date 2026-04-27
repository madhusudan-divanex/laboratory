import { TbGridDots } from "react-icons/tb";
import {
    faCircleXmark,
    faPen,
    faSearch,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaPlusCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { getSecureApiData, securePostData, updateApiData } from "../../services/api";
import Loader from "../Layouts/Loader";

function Departments() {
    const [departments, setDepartments] = useState([]);
    const [employee, setEmployee] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [type, setType] = useState("");
    const [catData,setCatData]=useState()
    const navigate = useNavigate()
    const userId = localStorage.getItem('userId')


    const [form, setForm] = useState({
        departmentName: "",
        type: "LAB",
        headOfDepartment: null,
        employees: [],
    });

    const [editId, setEditId] = useState(null);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const res = await getSecureApiData(`api/department/list?page=${page}&limit=10&search=${search}`);
            if (res.success) {
                setDepartments(res.data);
                setTotalPages(res.pagination.totalPages);
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const fetchStaff = async () => {
        try {
            const res = await getSecureApiData(`api/staff/list?status=active&limit=100`);
            if (res.success) {

                setEmployee(res.staffData);
            }
        } catch (err) {
            toast.error("Failed to load staff");
        }
    };
    useEffect(() => {
        fetchDepartments();
        fetchStaff();
    }, [page, limit, type]);

    const handleAddDepartment = async (e) => {
        e.preventDefault();
        try {
            const res = await securePostData("api/department/create", form);
            if (res.success) {
                fetchDepartments();
                document.getElementById("closeAdd").click();
                setForm({
                    departmentName: "",
                    type: "OPD",
                    headOfDepartment: null,
                    employees: [],
                });
            }
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };

    const openEditModal = (dept) => {
        setEditId(dept._id);

        setForm({
            departmentName: dept.departmentName,
            headOfDepartment: dept.headOfDepartment?._id || null,
            employees: (dept.employees || [])?.map(emp => ({
                employeeId:
                    typeof emp.employeeId === "object"
                        ? emp.employeeId._id
                        : emp.employeeId,
                role: emp.role || ""
            }))
        });
    };

    const handleUpdateDepartment = async (e) => {
        e.preventDefault();
        try {
            const res = await updateApiData(`api/department/update`, {...form,departmentId: editId });
            if (res.success) {
                fetchDepartments();
                document.getElementById("closeEdit").click();
            }
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };


    const closeModal = (id) => {
        const modal = document.getElementById(id);
        const backdrop = document.querySelector(".modal-backdrop");
        if (modal) {
            modal.classList.remove("show");
            modal.style.display = "none";
        }
        document.body.classList.remove("modal-open");
        if (backdrop) backdrop.remove();
    };
    useEffect(() => {
        if (localStorage.getItem('doctorId')) {
            navigate('/dashboard')
        }
    }, [])
    return (
        <>
            {loading ? <Loader />
                : <div className="main-content flex-grow-1 p-3 overflow-auto">
                    <div className="row mb-3">
                        <div className="d-flex align-items-center justify-content-between flex-wrap">
                            <div>
                                <h3 className="innr-title mb-2 gradient-text">Departments</h3>
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
                                                Departments
                                            </li>
                                        </ol>
                                    </nav>
                                </div>
                            </div>

                            <div className="add-nw-bx">
                                <a href="javascript:void(0)" className="add-nw-btn nw-thm-btn" data-bs-toggle="modal" data-bs-target="#add-Department">
                                    <img src="/plus-icon.png" alt="" /> Add Department
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="d-flex align-items-center justify-content-between mb-3 gap-2 nw-box ">
                            <div className="custom-frm-bx mb-0">
                                <input
                                    type="text"
                                    className="form-control  pe-5"
                                    placeholder="Enter department name"
                                    value={search}
                                    onChange={(e) => {
                                        setPage(1);          // reset page
                                        setSearch(e.target.value);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key == "Enter") {
                                            fetchDepartments()
                                        }
                                    }}
                                />
                                <div className="search-item-bx">
                                    <button className="search-item-btn text-secondary" onClick={() => fetchDepartments()}>
                                        <FontAwesomeIcon icon={faSearch} />
                                    </button>
                                </div>
                            </div>

                            {totalPages > 1 && <div className="page-selector">
                                <div className="filters">
                                    <select className="form-select custom-page-dropdown nw-custom-page "
                                        value={page}
                                        onChange={(e) => setPage(e.target.value)}>
                                        {Array.from({ length: totalPages }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>}
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-lg-12 col-md-12 col-sm-12">
                            <div className="table-section mega-table-section">
                                <div className="table-responsive mb-0">
                                    <table className="table mb-0">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Department Name</th>
                                                <th>Head of Department</th>
                                                <th>Employees</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {departments?.length > 0 ? (
                                                departments.map((dept, index) => (
                                                    <tr key={dept._id}>
                                                        <td>{String(index + 1).padStart(2, "0")}.</td>
                                                        <td>{dept.departmentName}</td>
                                                        <td>{dept.headOfDepartment?.name || "-"}</td>
                                                        <td>{dept.employees?.length || 0}</td>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="text-success"
                                                                data-bs-toggle="modal"
                                                                data-bs-target="#edit-Department"
                                                                onClick={() => openEditModal(dept)}
                                                            >
                                                                <FontAwesomeIcon icon={faPen} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center text-black">
                                                        No department found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-end mt-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="nw-thm-btn outline"
                        >
                            Go Back
                        </button>
                    </div>
                </div>}

            {/* <!-- add-Department Alert Popup Start --> */}
            {/* <!--  data-bs-toggle="modal" data-bs-target="#add-Department" --> */}
            <div className="modal step-modal fade" id="add-Department" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1"
                aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-md">
                    <div className="modal-content rounded-0">
                        <div className="d-flex align-items-center justify-content-between border-bottom py-3 px-4">
                            <div>
                                <h6 className="lg_title mb-0">Add Department</h6>
                            </div>
                            <div>
                                <button type="button" className="" id="closeAdd" data-bs-dismiss="modal" aria-label="Close" style={{ color: "#00000040" }}>
                                    <FontAwesomeIcon icon={faCircleXmark} />
                                </button>
                            </div>
                        </div>
                        <div className="modal-body  pb-5 px-4">
                            <div className="row ">
                                <div className="col-lg-12">

                                    <div className="add-deprtment-pic">
                                        <img src="/add-department.png" alt="" />
                                    </div>

                                    <form onSubmit={handleAddDepartment}>

                                        <div className="custom-frm-bx">
                                            <label htmlFor="">Select Category</label>
                                            <select name="" id="">

                                            </select>
                                            <input type="text" className="form-control custom-select"
                                                placeholder="Enter Department Name"
                                                value={form.departmentName}
                                                onChange={(e) =>
                                                    setForm({ ...form, departmentName: e.target.value })
                                                } />
                                        </div>
                                        <div className="custom-frm-bx">
                                            <label htmlFor="">Sub Category</label>
                                            <input type="text" className="form-control custom-select"
                                                placeholder="Enter Department Name"
                                                value={form.departmentName}
                                                onChange={(e) =>
                                                    setForm({ ...form, departmentName: e.target.value })
                                                } />
                                        </div>

                                        <div className="custom-frm-bx">
                                            <label htmlFor="">Head of Department </label>
                                            <select
                                                className="form-select custom-select"
                                                value={form.headOfDepartment}
                                                
                                                onChange={(e) =>
                                                    setForm({ ...form, headOfDepartment: e.target.value })
                                                }
                                            >
                                                <option value="">---Select Head of Department---</option>
                                                {employee?.map((emp) => (
                                                    <option key={emp._id} value={emp?.userId?._id}>
                                                        {emp?.userId?.name}
                                                    </option>
                                                ))}
                                            </select>

                                        </div>

                                        <div className="education-frm-bx  p-2">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <h5 className="mb-0 fz-16 fw-700">Add Employee</h5>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setForm({
                                                            ...form,
                                                            employees: [...form.employees, { employeeId: "", role: "" }]
                                                        })
                                                    }
                                                >
                                                    <FaPlusCircle />
                                                </button>
                                            </div>

                                            {form.employees.map((emp, index) => (
                                                <div className="row " key={index}>
                                                    <div className="col-lg-12">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div className="custom-frm-bx flex-grow-1 ">
                                                                <label>Employee</label>
                                                                <select
                                                                    className="form-select custom-select"
                                                                    value={emp.employeeId}
                                                                    onChange={(e) => {
                                                                        const updated = [...form.employees];
                                                                        updated[index].employeeId = e.target.value;
                                                                        setForm({ ...form, employees: updated });
                                                                    }}
                                                                >
                                                                    <option value="">-Select Employee-</option>
                                                                    {employee?.map((e) => {
                                                                        if (e._id === form.headOfDepartment) return null; // HoD ko skip karo
                                                                        return (
                                                                            <option key={e._id} value={e?.userId?._id}>
                                                                                {e?.userId?.name}
                                                                            </option>
                                                                        );
                                                                    })}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <button
                                                                    type="button"
                                                                    className="text-danger"
                                                                    onClick={() => {
                                                                        const updated = form.employees.filter((_, i) => i !== index);
                                                                        setForm({ ...form, employees: updated });
                                                                    }}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Role */}
                                                    {/* <div className="col-lg-6 col-md-6 col-sm-12">
                                                        <div className="role-department-box">
                                                            <div className="custom-frm-bx">
                                                            <label>Role</label>
                                                            <input
                                                                type="text"
                                                                className="form-control custom-select"
                                                                placeholder="Enter Role"
                                                                value={emp.role}
                                                                onChange={(e) => {
                                                                    const updated = [...form.employees];
                                                                    updated[index].role = e.target.value;
                                                                    setForm({ ...form, employees: updated });
                                                                }}
                                                            />
                                                        </div>

                                                        <div>
                                                              <button
                                                            type="button"
                                                            className="text-danger"
                                                            onClick={() => {
                                                                const updated = form.employees.filter((_, i) => i !== index);
                                                                setForm({ ...form, employees: updated });
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                        </div>
                                                        </div>



                                                    </div> */}


                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-3">
                                            <button type="submit" className="nw-thm-btn w-100"> Add Department</button>
                                        </div>
                                    </form>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* <!-- add-Department Popup End --> */}


            {/* <!-- add-Department Alert Popup Start --> */}
            {/* <!--  data-bs-toggle="modal" data-bs-target="#edit-Department" --> */}
            <div className="modal step-modal fade" id="edit-Department" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1"
                aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-md">
                    <div className="modal-content rounded-0">
                        <div className="d-flex align-items-center justify-content-between border-bottom py-3 px-4">
                            <div>
                                <h6 className="lg_title mb-0">Edit Department</h6>
                            </div>
                            <div>
                                <button type="button" className="" id="closeEdit" data-bs-dismiss="modal" aria-label="Close" style={{ color: "#00000040" }}>
                                    <FontAwesomeIcon icon={faCircleXmark} />
                                </button>
                            </div>
                        </div>
                        <div className="modal-body  pb-5 px-4">
                            <div className="row ">
                                <div className="col-lg-12">

                                    <div className="add-deprtment-pic">
                                        <img src="/add-department.png" alt="" />
                                    </div>

                                    <form onSubmit={handleUpdateDepartment}>
                                        <div className="custom-frm-bx">
                                            <label htmlFor="">Add Department</label>
                                            <input type="text"
                                                className="form-control custom-select"
                                                placeholder="Enter Role Name"
                                                value={form.departmentName}
                                                onChange={(e) =>
                                                    setForm({ ...form, departmentName: e.target.value })
                                                }
                                            />
                                        </div>

                                        <div className="custom-frm-bx">
                                            <label htmlFor="">Head of Department </label>
                                            <select
                                                className="form-select custom-select"
                                                value={form.headOfDepartment}
                                                
                                                onChange={(e) =>
                                                    setForm({ ...form, headOfDepartment: e.target.value })
                                                }
                                            >
                                                <option value="">---Select Head of Department---</option>
                                                {employee?.map((emp) => (
                                                    <option key={emp._id} value={emp?.userId?._id}>
                                                        {emp?.userId?.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="education-frm-bx  p-2">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <h5 className="mb-0 fz-16 fw-700">Add Employee</h5>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setForm({
                                                            ...form,
                                                            employees: [...form.employees, { employeeId: "", role: "" }]
                                                        })
                                                    }
                                                >
                                                    <FaPlusCircle />
                                                </button>
                                            </div>

                                            {form.employees.map((emp, index) => (
                                                <div className="row align-items-end mb-2" key={index}>
                                                    {/* Employee */}
                                                    <div className="col-lg-12">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div className="custom-frm-bx flex-grow-1 ">
                                                                <label>Employee</label>
                                                                <select
                                                                    className="form-select custom-select"
                                                                    value={emp.employeeId}
                                                                    onChange={(e) => {
                                                                        const updated = [...form.employees];
                                                                        updated[index].employeeId = e.target.value;
                                                                        setForm({ ...form, employees: updated });
                                                                    }}
                                                                >
                                                                    <option value="">-Select Employee-</option>
                                                                    {employee?.map((e) => {
                                                                        if (e._id === form.headOfDepartment) return null; // HoD ko skip karo
                                                                        return (
                                                                            <option key={e._id} value={e?.userId?._id}>
                                                                                {e?.userId?.name}
                                                                            </option>
                                                                        );
                                                                    })}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <button
                                                                    type="button"
                                                                    className="text-danger"
                                                                    onClick={() => {
                                                                        const updated = form.employees.filter((_, i) => i !== index);
                                                                        setForm({ ...form, employees: updated });
                                                                    }}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Role */}
                                                    {/* <div className="col-lg-6 col-md-6 col-sm-12">
                                                        <div className="role-department-box">
                                                            <div className="custom-frm-bx">
                                                                <label>Role</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control custom-select"
                                                                    placeholder="Enter Role"
                                                                    value={emp.role}
                                                                    onChange={(e) => {
                                                                        const updated = [...form.employees];
                                                                        updated[index].role = e.target.value;
                                                                        setForm({ ...form, employees: updated });
                                                                    }}
                                                                />
                                                            </div>

                                                            <div>
                                                                
                                                            </div>
                                                        </div>

                                                    </div> */}


                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-3">
                                            <button type="submit" className="nw-thm-btn w-100" >Save</button>
                                        </div>
                                    </form>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* <!-- add-Department Popup End --> */}






        </>
    )
}

export default Departments