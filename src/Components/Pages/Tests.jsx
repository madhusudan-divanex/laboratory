import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faPen, faSearch, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { deleteApiData, getSecureApiData, securePostData } from "../../services/api";
import { useSelector } from "react-redux";
import Loader from "../Layouts/Loader";

function Tests() {
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const userId = localStorage.getItem('userId')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const { isOwner, permissions } = useSelector(state => state.user)
    const [allTest, setAllTest] = useState([])
    const fetchLabTest = async () => {
        setLoading(true)
        try {
            const response = await getSecureApiData(`lab/test/${userId}?page=${currentPage}&name=${name}`);
            if (response.success) {
                // setCurrentPage(response.pagination.page)
                // setTotalPage(response.pagination.totalPages)
                setAllTest(response.data)
                setTotalPages(response.pagination.totalPages)
            } else {
                toast.error(response.message)
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false)
        }
    }
    const testAction = async (e, id, status) => {
        e.preventDefault()
        const data = { testId: id, status }
        try {
            const response = await securePostData(`lab/test-action`, data);
            if (response.success) {
                toast.success('Status updated')
                fetchLabTest()
            } else {
                toast.error(response.message)
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        }
    }
    const deleteTest = async (id) => {
        try {
            const response = await deleteApiData(`lab/test/${id}`);
            if (response.success) {
                toast.success('Test deleted')
                fetchLabTest()
            } else {
                toast.error(response.message)
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        }
    }
    useEffect(() => {
        fetchLabTest()
    }, [userId, currentPage])

    return (
        <>
            {loading ? <Loader />
                : <div className="main-content flex-grow-1 p-3 overflow-auto">
                    <div className="row mb-3">
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <h3 className="innr-title mb-0"> Tests</h3>
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
                                                Tests
                                            </li>
                                        </ol>
                                    </nav>
                                </div>
                            </div>

                            <div className="add-nw-bx">
                                <NavLink to="/reports" className="add-nw-btn thm-btn">
                                    <img src="/plus-icon.png" alt="" /> Add Tests
                                </NavLink>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="custom-frm-bx">
                                <input value={name} onChange={(e) => setName(e.target.value)} type="text" className="form-control" placeholder="Search " />

                                <div className="search-item-bx">
                                    <button className="search-item-btn" onClick={() => fetchLabTest()}><FontAwesomeIcon icon={faSearch} /></button>
                                </div>

                            </div>

                            {totalPages > 1 && <div>
                                <div className="custom-frm-bx">
                                    <select
                                        className="form-select custom-page-dropdown nw-custom-page"
                                        name="currentPage"
                                        value={currentPage}
                                        onChange={(e) => setCurrentPage(e.target.value)}
                                    >
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
                                <div className="table table-responsive mb-0">
                                    <table className="table mb-0">
                                        <thead>
                                            <tr>
                                                <th>S.no.</th>
                                                <th>Test Categories Name</th>
                                                <th>Short Name</th>
                                                <th>Package Type</th>
                                                <th>Price</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allTest?.length > 0 &&
                                                allTest?.map((item, key) =>
                                                    <tr key={key}>
                                                        <td>{key + 1}</td>
                                                        <td className="text-capitalize">{item?.department?.departmentName}</td>
                                                        <td>{item?.shortName}</td>
                                                        <td>{item?.packageType}</td>
                                                        <td>${item?.price}</td>
                                                        <td>
                                                            <div className="switch">
                                                                <input type="checkbox"
                                                                    id={`toggle-${item._id}`}
                                                                    checked={item.status === "active"}
                                                                    onChange={(e) =>
                                                                        testAction(e, item._id, e.target.checked ? "active" : "inactive")
                                                                    } />
                                                                <label for={`toggle-${item._id}`}></label>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <a
                                                                href="javascript:void(0)"
                                                                className=" admin-sub-dropdown dropdown-toggle"
                                                                data-bs-toggle="dropdown"
                                                                aria-expanded="false"
                                                            >
                                                                <FontAwesomeIcon icon={faGear} /> Action
                                                            </a>

                                                            <div className="dropdown">
                                                                <a
                                                                    href="javascript:void(0)"
                                                                    className="attendence-edit-btn"
                                                                    id="acticonMenu1"
                                                                    data-bs-toggle="dropdown"
                                                                    aria-expanded="false"
                                                                >

                                                                </a>
                                                                <ul
                                                                    className="dropdown-menu dropdown-menu-end user-dropdown tble-action-menu"
                                                                    aria-labelledby="acticonMenu1"
                                                                >
                                                                    <li className="drop-item">
                                                                        <button onClick={() => {

                                                                            navigate(`/edit-test/${item?._id}`)

                                                                        }} className="nw-dropdown-item" href="#">
                                                                            <FontAwesomeIcon
                                                                                icon={faPen}
                                                                                className=""
                                                                            />
                                                                            View / Edit
                                                                        </button>
                                                                    </li>


                                                                    <li className="drop-item">
                                                                        {/* <button className="nw-dropdown-item" onClick={() => deleteTest(item._id)}>
                                                                            <FontAwesomeIcon
                                                                                icon={faTrash}
                                                                                className=""
                                                                            />
                                                                            Delete
                                                                        </button> */}
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </td>
                                                    </tr>)}



                                            {/* <tr>
                                            <td>04.</td>
                                            <td>COVID-19 ELISA</td>
                                            <td>urn</td>
                                            <td>Urine</td>
                                            <td>$25</td>
                                            <td>
                                                <div className="switch">
                                                    <input type="checkbox" id="toggle4" />
                                                    <label for="toggle4"></label>
                                                </div>
                                            </td>
                                            <td>
                                                <a
                                                    href="javascript:void(0)"
                                                    className=" admin-sub-dropdown dropdown-toggle"
                                                    data-bs-toggle="dropdown"
                                                    aria-expanded="false"
                                                >
                                                    <FontAwesomeIcon icon={faGear} /> Action
                                                </a>

                                                <div className="dropdown">
                                                    <a
                                                        href="javascript:void(0)"
                                                        className="attendence-edit-btn"
                                                        id="acticonMenu1"
                                                        data-bs-toggle="dropdown"
                                                        aria-expanded="false"
                                                    >
                                                        <i className="fas fa-pen"></i>
                                                    </a>
                                                    <ul
                                                        className="dropdown-menu dropdown-menu-end user-dropdown tble-action-menu"
                                                        aria-labelledby="acticonMenu1"
                                                    >
                                                        <li className="drop-item">
                                                            <NavLink to="/edit-test" className="nw-dropdown-item" href="#">
                                                                <FontAwesomeIcon
                                                                    icon={faPen}
                                                                    className=""
                                                                />
                                                                View / Edit
                                                            </NavLink>
                                                        </li>


                                                        <li className="drop-item">
                                                            <a className="nw-dropdown-item" href="#">
                                                                <FontAwesomeIcon
                                                                    icon={faTrash}
                                                                    className=""
                                                                />
                                                                Delete
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr> */}

                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-end mt-3">
                        <Link to={-1} className="nw-thm-btn rounded-3 outline" >
                            Go Back
                        </Link>
                    </div>
                </div>}
        </>
    );
}

export default Tests;
