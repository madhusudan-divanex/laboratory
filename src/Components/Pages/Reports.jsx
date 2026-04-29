import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FaPlusCircle } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getApiData, getSecureApiData, securePostData } from "../../services/api";
import { useSelector } from "react-redux";
import Loader from "../Layouts/Loader";

function Reports() {
  const navigate = useNavigate();
  const { isOwner, permissions } = useSelector((state) => state.user);
  const userId = localStorage.getItem("userId");

  const [loading, setLoading] = useState(false);
  const [catData, setCatData] = useState([]);
  const [subCatData, setSubCatData] = useState([]);

  // ✅ Fix 1: testErrors state declare kiya
  const [testErrors, setTestErrors] = useState({});

  const [testData, setTestData] = useState({
    labId: userId,
    category: "",
    totalAmount:0,
  });

  // ✅ Fix 2: Checkbox toggle — individual item ka selected state toggle
  const handleCheckbox = (id) => {
    setSubCatData((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // ✅ Fix 3: Price change — editable price per row
  const handlePriceChange = (id, value) => {
    setSubCatData((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, customPrice: value } : item
      )
    );
  };

  // ✅ Fix 4: Submit — validation + sirf selected sub-categories bhejo
  const testSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!testData.category) {
      setTestErrors({ category: "Category select karo" });
      return;
    }
    setTestErrors({});

    const selectedSubs = subCatData
      // .filter((item) => item.selected)
      .map((item) => ({
        subCat: item._id,
        price: item.customPrice,
        status: item.selected ? "active" : "inactive",
      }));

    if (selectedSubs.length === 0) {
      toast.error("Please select at least 1 sub category");
      return;
    }

    const data = { ...testData, subCatData: JSON.stringify(selectedSubs) };

    try {
      setLoading(true);
      const response = await securePostData("lab/test", data);
      if (response.success) {
        toast.success("Test data saved successfully");
        navigate("/tests");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Category fetch
  useEffect(() => {
    fetchTestCategory();
  }, []);

  async function fetchTestCategory() {
    try {
      let myCat = []
      const result = await getSecureApiData('api/comman/my-test-category')
      if (result.success) {
        myCat = result.data?.length > 0 ? result.data.map(item => item?.category) : []
      }
      const res = await getApiData("api/comman/test-category");
      if (res.success) {
        if (myCat?.length > 0) {
          const data = res.data?.filter(item => !myCat.includes(item?._id))
          setCatData(data)
        } else {
          setCatData(res.data);
        }
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  // ✅ Fix 5: Sub-category fetch — selected aur customPrice add kiya
  async function fetchSubTestCategory() {
    try {
      const res = await getApiData(
        `api/comman/sub-test-category/${testData?.category}`
      );
      if (res.success) {
        // Har item mein selected (false) aur customPrice initialize karo
        setSubCatData(
          res.data.map((item) => ({
            ...item,
            selected: false,
            price: 0,
          }))
        );
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  }

  useEffect(() => {
    if (testData.category) {
      fetchSubTestCategory();
    } else {
      setSubCatData([]);
    }
  }, [testData.category]);
  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="main-content flex-grow-1 p-3 overflow-auto">
          <div className="row mb-3">
            <div className="d-flex align-items-center justify-content-between tp-sub-main-bx">
              <div>
                <h3 className="innr-title">Add Test</h3>
                <div className="admin-breadcrumb">
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb custom-breadcrumb">
                      <li className="breadcrumb-item">
                        <NavLink to="/dashboard" className="breadcrumb-link">
                          Dashboard
                        </NavLink>
                      </li>
                      <li className="breadcrumb-item">
                        <a href="#" className="breadcrumb-link">
                          Test Categories
                        </a>
                      </li>
                      <li
                        className="breadcrumb-item active"
                        aria-current="page"
                      >
                        Add Test
                      </li>
                    </ol>
                  </nav>
                </div>
              </div>
            </div>
          </div>

          <div className="lab-chart-crd">
            <div className="row">
              <div className="col-lg-12">
                <div className="lab-tp-title patient-bio-tab report-profile-tp">
                  <div>
                    <h6 className="mb-0 text-white">Test</h6>
                  </div>
                </div>

                <form onSubmit={testSubmit} className="patient-bio-tab">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="custom-frm-bx">
                        <label htmlFor="category">Select Category</label>
                        {/* ✅ Fix 6: onChange mein e.target.value use kiya */}
                        <select
                          name="category"
                          id="category"
                          value={testData.category}
                          onChange={(e) =>
                            setTestData({ ...testData, category: e.target.value })
                          }
                          className="form-select nw-control-frm"
                        >
                          <option value="">---Select---</option>
                          {catData?.map((item) => (
                            <option value={item?._id} key={item?._id}>
                              {item?.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {testErrors?.category && (
                        <span className="text-danger">
                          {testErrors?.category}
                        </span>
                      )}
                    </div>
                    {subCatData?.length>0 &&<div className="col-md-6">
                      <div className="custom-frm-bx">
                        <label htmlFor="">Total Amount</label>
                        {/* ✅ Fix 6: onChange mein e.target.value use kiya */}
                        <input type="text" onChange={(e)=>setTestData({...testData,totalAmount:e.target.value})} value={testData?.totalAmount} className="form-control" />
                      </div>
                    </div>}
                  </div>

                  {/* Sub-category table — category select hone ke baad show hogi */}
                  {testData?.category && (
                    <div className="row mt-3">
                      <div className="col-lg-12 col-md-12 col-sm-12">
                        <div className="table-section mega-table-section">
                          <div className="table table-responsive mb-0">
                            <table className="table mb-0">
                              <thead>
                                <tr>
                                  <th>S.no.</th>
                                  {/* ✅ Select All checkbox */}
                                  <th>
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      checked={
                                        subCatData.length > 0 &&
                                        subCatData.every((i) => i.selected)
                                      }
                                      onChange={(e) =>
                                        setSubCatData((prev) =>
                                          prev.map((item) => ({
                                            ...item,
                                            selected: e.target.checked,
                                          }))
                                        )
                                      }
                                      title="Select All"
                                    />
                                  </th>
                                  <th>Sub Category</th>
                                  <th>Test</th>
                                  <th>Price (₹)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {subCatData?.length > 0 ? (
                                  subCatData.map((item, key) => (
                                    <tr
                                      key={item._id}
                                      style={{
                                        background: item.selected
                                          ? "rgba(30,120,200,0.05)"
                                          : "",
                                      }}
                                    >
                                      <td>{key + 1}</td>

                                      {/* ✅ Fix 7: Checkbox — selected state se controlled */}
                                      <td>
                                        <div className="form-check custom-check">
                                          <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={item.selected}
                                            onChange={() =>
                                              handleCheckbox(item._id)
                                            }
                                          />
                                        </div>
                                      </td>

                                      <td className="text-capitalize">
                                        {item?.subCategory}
                                      </td>
                                      <td>{item?.shortName}</td>

                                      {/* ✅ Fix 8: Price — editable input */}
                                      <td>
                                        <input
                                          type="number"
                                          className="form-control"
                                          value={item.customPrice}
                                          min={0}
                                          required
                                          onChange={(e) =>
                                            handlePriceChange(
                                              item._id,
                                              e.target.value
                                            )
                                          }
                                          style={{ width: "110px" }}
                                          disabled={!item.selected}
                                        />
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={5} className="text-center text-muted py-3">
                                      No sub category found in this category
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="d-flex justify-content-between mt-3">
                    <Link to={-1} className="nw-thm-btn rounded-3 outline">
                      Go Back
                    </Link>
                    <button type="submit" className="nw-thm-btn sub-nw-brd-tbn">
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Reports;