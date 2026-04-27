import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleXmark,
  faKey,
  faPen,
  faSearch,
  faTrash,

} from "@fortawesome/free-solid-svg-icons";
import { Link, NavLink } from "react-router-dom";
import { deleteApiData, getSecureApiData, securePostData, updateApiData } from "../../services/api";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import Loader from "../Layouts/Loader";
import Select from 'react-select'
function Permission() {
  const userId = localStorage.getItem('userId')
  const [name, setName] = useState('')
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState(null)
  const [totalPage, setTotalPage] = useState()
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [staffData, setStaffData] = useState([])
  const [staffEmp, setStaffEmp] = useState([])
  const [assignPId, setAssignPId] = useState()
  const [permissions, setPermissions] = useState([])
  const fetchLabPermission = async () => {
    try {
      setLoading(true)
      const response = await getSecureApiData(`api/comman/permission/${userId}?page=${currentPage}&name=${search}&type=lab`);
      if (response.success) {
        setCurrentPage(response.pagination.page)
        setTotalPage(response.pagination.totalPages)
        setPermissions(response.data)
      } else {
        toast.error(response.message)
      }
    } catch (err) {
      toast.error(err?.response?.data?.message);
    } finally {
      setLoading(false)
    }
  }
  const addLabPermission = async (e) => {
    e.preventDefault()
    if (editId) {
      const data = { labId: userId, name, permissionId: editId }
      try {
        const response = await updateApiData(`api/comman/permission`, data);
        if (response.success) {
          setName('')
          setEditId(null)
          fetchLabPermission()
          toast.success("Permission updated")
        } else {
          toast.error(response.message)
        }
      } catch (err) {
        console.error("Error creating lab:", err);
      }
    } else {

      const data = { labId: userId, name }
      try {
        const response = await securePostData(`api/comman/permission`, data);
        if (response.success) {
          setName('')
          fetchLabPermission()
          toast.success("Permission created")
        } else {
          toast.error(response.message)
        }
      } catch (err) {
        console.error("Error creating lab:", err);
      }
    }
  }
  const deletePermission = async (id) => {
    // e.preventDefault()
    const data = { labId: userId, permissionId: id }
    try {
      const response = await deleteApiData(`api/comman/permission`, data);
      if (response.success) {
        fetchLabPermission()
        toast.success("Permission deleted")
      } else {
        toast.error(response.message)
      }
    } catch (err) {
      console.error("Error creating lab:", err);
    }
  }
  useEffect(() => {
    fetchLabPermission()
  }, [currentPage, userId])
  const fetchStaffEmp = async () => {
    setLoading(true)
    try {
      const response = await getSecureApiData(`api/staff/employment`);
      if (response.success) {
        const options = response.data.map((item) => ({
          value: item._id,
          label: item.userId?.name + " " + `(${item?.role})`
        }));
        setStaffData(options)
      } else {
        toast.error(response.message)
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");;
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchStaffEmp()
  }, [])
  const assignPermission = async (e) => {
    e.preventDefault()
    const data = { permissionId: assignPId, staffEmp }
    try {
      const response = await updateApiData(`api/comman/assign-permission`, data);
      if (response.success) {
        setAssignPId('')
        fetchLabPermission()
        document.getElementById('closeAssign')?.click()
        toast.success("Permission assigned successfully")
      } else {
        toast.error(response.message)
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");;
    }

  }
  useEffect(() => {
    if (assignPId && staffData.length > 0) {

      const selectedPermission = permissions.find(
        p => p._id === assignPId
      );

      if (!selectedPermission) return;

      const preSelected = staffData.filter(item =>
        selectedPermission.staffEmp?.includes(item.value)
      );

      setSelectedStaff(preSelected);
      setStaffEmp(preSelected.map(item => item.value));
    }
  }, [assignPId, staffData, permissions]);


  return (
    <>
      {loading ? <Loader />
        : <div className="main-content flex-grow-1 p-3 overflow-auto">
          <form action="">
            <div className="row mb-3">
              <div className="d-flex align-items-center justify-content-between sub-header-bx">
                <div>
                  <h3 className="innr-title">Permission</h3>
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
                          Permission
                        </li>
                      </ol>
                    </nav>
                  </div>
                </div>

                <div className="add-nw-bx d-flex gap-3">
                  <a href="javascript:void(0)" className="add-nw-btn nw-thm-btn" onClick={() => {
                    fetchLabPermission(1000)
                    setSelectedStaff([])
                  }}
                    data-bs-toggle="modal" data-bs-target="#permission-Assign">
                    Assign permission
                  </a>
                  <a href="javascript:void(0)" className="add-nw-btn thm-btn" data-bs-toggle="modal" data-bs-target="#permission-Name">
                    <img src="/plus-icon.png" alt="" /> Permission Name
                  </a>
                </div>

              </div>
            </div>
          </form>

          <div className="row ">
            <div className="d-flex align-items-center justify-content-between">
              <div className="custom-frm-bx">
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key == "Enter") {
                      fetchLabPermission()
                    }
                  }}
                  className="form-control pe-5" placeholder="Search " />

                <div className="search-item-bx">
                  <button className="search-item-btn" onClick={fetchLabPermission}><FontAwesomeIcon icon={faSearch} /></button>
                </div>

              </div>

              <div>
                <div className="page-selector d-flex align-items-center">

                  <div className="custom-frm-bx">
                    <select className="form-select custom-page-dropdown nw-custom-page ">
                      {totalPage > 1 ?
                        Array(totalPage)?.map(_, i => <option value={i}>{i}</option>)
                        : <option value="1" selected>1</option>}

                    </select>
                  </div>

                </div>
              </div>
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
                        <th>Permission Name</th>
                        <th>Permission</th>
                        <th>Action</th>

                      </tr>
                    </thead>
                    <tbody>

                      {permissions?.length > 0 &&
                        permissions?.map((item, key) =>
                          <tr key={key}>
                            <td>{key + 1}.</td>
                            <td>
                              {item?.name}
                            </td>
                            <td>
                              <span><NavLink onClick={() => sessionStorage.setItem('permission', JSON.stringify(item))} to={`/permission-check/${item?.name}/${item?._id}`} className="admin-sub-dropdown"> <FontAwesomeIcon icon={faKey} /> Permission</NavLink></span>
                            </td>
                            <td>
                              <ul className="d-flex gap-2">
                                <li><button type="button" onClick={() => {
                                  setName(item?.name)
                                  setEditId(item?._id)
                                }} className="text-black" data-bs-toggle="modal" data-bs-target="#permission-Name"><FontAwesomeIcon icon={faPen} /></button></li>
                                {/* <li><button onClick={() => deletePermission(item._id)} className="text-black"><FontAwesomeIcon icon={faTrash} /></button></li> */}
                              </ul>
                            </td>
                          </tr>)}



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



      {/* <!-- Client Member Alert Popup Start --> */}
      {/* <!--  data-bs-toggle="modal" data-bs-target="#permission-Name" --> */}
      <div className="modal step-modal fade" id="permission-Name" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content rounded-5">
            <div className="d-flex align-items-center justify-content-between popup-nw-brd px-4 py-3">
              <div>
                <h6 className="lg_title mb-0">Permission Name</h6>
              </div>
              <div>
                <button type="button" className="" data-bs-dismiss="modal" aria-label="Close" style={{ color: "#00000040" }}>
                  <FontAwesomeIcon icon={faCircleXmark} />
                </button>
              </div>
            </div>
            <div className="modal-body px-4">
              <div className="row ">
                <form onSubmit={addLabPermission} className="col-lg-12">
                  <div className="text-center ">
                    <div className="model-permission-bx">
                      <img src="/model-permission-icon.png" alt="" />
                    </div>
                  </div>

                  <div className="custom-frm-bx">
                    <label htmlFor="">Role Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="form-control" placeholder="Enter Role Name" />
                  </div>

                  <div>
                    <button type="submit" className="nw-thm-btn w-100" data-bs-dismiss="modal"> Submit</button>
                  </div>

                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <!-- Meeting Alert Popup End --> */}
      <div className="modal step-modal" id="permission-Assign" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content rounded-5">
            <div className="d-flex align-items-center justify-content-between popup-nw-brd px-4 py-3">
              <div>
                <h6 className="heading-grad fz-24">Assign Permission </h6>
              </div>
              <div>
                <button type="button" className="" data-bs-dismiss="modal" id="closeAssign" aria-label="Close" style={{ color: "#00000040" }}>
                  <FontAwesomeIcon icon={faCircleXmark} />
                </button>
              </div>
            </div>
            <div className="modal-body px-4">
              <div className="row ">
                <form onSubmit={assignPermission} className="col-lg-12">
                  <div className="text-center ">
                    <div className="model-permission-bx">
                      <img src="/model-permission-icon.png" alt="" />
                    </div>
                  </div>

                  <div className="custom-frm-bx">
                    <label htmlFor="">Select Permisssion</label>
                    <select
                      value={assignPId}
                      onChange={(e) => setAssignPId(e.target.value)}
                      className="form-select"
                    >
                      <option value="">---Select---</option>
                      {permissions?.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    {/* <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="form-control" placeholder="Enter Role Name" /> */}
                  </div>
                  <div className="custom-frm-bx">
                    <label htmlFor="">Select Staff</label>
                    <Select
                      options={staffData}
                      isMulti
                      value={selectedStaff}
                      className="custom-select"
                      placeholder="Select staff..."
                      onChange={(selectedOptions) => {
                        setSelectedStaff(selectedOptions);
                        const ids = selectedOptions.map(item => item.value);
                        setStaffEmp(ids);
                      }}
                    />
                  </div>

                  <div>
                    <button type="submit" className="nw-thm-btn w-100" data-bs-dismiss="modal"> Submit</button>
                  </div>

                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  )
}

export default Permission