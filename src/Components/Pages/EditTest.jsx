import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FaPlusCircle } from "react-icons/fa";
import React, { useEffect, useRef, useState } from "react";
import { FaTrash } from "react-icons/fa6";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getApiData, getSecureApiData, securePostData, updateApiData } from "../../services/api";
import Loader from "../Layouts/Loader";
import { useSelector } from "react-redux";

function EditTest() {
  const navigate = useNavigate();
  const params = useParams();
  const testId = params.id;
  const { isOwner, permissions } = useSelector((state) => state.user);
  const userId = localStorage.getItem("userId");

  const [loading, setLoading] = useState(false);
  const [catData, setCatData] = useState([]);
  const [subCatData, setSubCatData] = useState([]);
  const [testErrors, setTestErrors] = useState({});

  const [testData, setTestData] = useState({
    labId: userId,
    category: "",
    totalAmount:0,
  });

  // Edit flow mein useEffect wala fetchSubTestCategory skip karne ke liye
  const isEditLoaded = useRef(false);

  // ─── Handlers ────────────────────────────────────────────────

  const handleCheckbox = (id) => {
    setSubCatData((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handlePriceChange = (id, value) => {
    setSubCatData((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, customPrice: value } : item
      )
    );
  };

  // ─── Submit ───────────────────────────────────────────────────

  const testSubmit = async (e) => {
    e.preventDefault();

    if (!testData.category) {
      setTestErrors({ category: "Category select karo" });
      return;
    }
    setTestErrors({});

    const selectedSubs = subCatData.map((item) => ({
      subCat: item._id,
      price: item.customPrice,
      status: item.selected ? "active" : "inactive",
    }));

    

    if (selectedSubs.length === 0) {
      toast.error("Please select at least 1 sub category");
      return;
    }

    const data = {
      ...testData,
      subCatData: JSON.stringify(selectedSubs),
      
    };

    try {
      setLoading(true);
      const response = await updateApiData(`lab/test`, data);
      if (response.success) {
        toast.success("Test updated successfully");
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

  // ─── Fetch all categories ─────────────────────────────────────

  useEffect(() => {
    fetchTestCategory();
  }, []);

  async function fetchTestCategory() {
    try {
      const res = await getApiData("api/comman/test-category");
      if (res.success) {
        setCatData(res.data);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  // ─── Sub-categories fetch — sirf jab user manually category change kare ───

  async function fetchSubTestCategory(categoryId) {
    try {
      const res = await getApiData(
        `api/comman/sub-test-category/${categoryId}`
      );
      if (res.success) {
        setSubCatData(
          res.data.map((item) => ({
            ...item,
            selected: false,
            customPrice: 0,
          }))
        );
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  // Category change useEffect — edit load hone par skip karo
  useEffect(() => {
    if (!testData.category) {
      setSubCatData([]);
      return;
    }
    if (isEditLoaded.current) {
      // Edit data set hua tha, skip karo — next manual change allow hoga
      isEditLoaded.current = false;
      return;
    }
    fetchSubTestCategory(testData.category);
  }, [testData.category]);

  // ─── Edit: existing test data fetch + sub-cat merge ──────────

  const getTestData = async () => {
    setLoading(true);
    try {
      const response = await getSecureApiData(`lab/test-data/${testId}`);
      if (response.success) {
        const data = response.data;

        // Step 1: useEffect skip karane ke liye flag set karo
        isEditLoaded.current = true;

        // Step 2: Category state set karo
        setTestData((prev) => ({
          ...prev,
          testId,
          totalAmount:data.totalAmount,
          category: data.category?._id,
        }));

        // Step 3: Us category ki sari sub-categories fetch karo
        const res = await getApiData(
          `api/comman/sub-test-category/${data.category?._id}`
        );

        if (res.success) {
          // Step 4: Saved subCatData ka lookup map banao
          // subCat field string (id) ya object — dono handle karo
          const savedMap = {};
          data.subCatData?.forEach((s) => {
            const id = s.subCat?._id || s.subCat;
            savedMap[id] = s;
          });

          // Step 5: Har sub-category ko saved data se match karke set karo
          setSubCatData(
            res.data.map((item) => {
              const saved = savedMap[item._id];
              return {
                ...item,
                selected: saved ? saved.status === "active" : false,
                customPrice: saved ? saved.price : 0,
              };
            })
          );
        } else {
          toast.error(res.message);
        }
      } else {
        toast.error(response.message);
        navigate(-1);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (testId) {
      getTestData();
    }
  }, [testId]);


  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="main-content flex-grow-1 p-3 overflow-auto">
          <div className="row mb-3">
            <div className="d-flex align-items-center justify-content-between tp-sub-main-bx">
              <div>
                <h3 className="innr-title">Edit Test</h3>
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
                      <li className="breadcrumb-item active" aria-current="page">
                        Edit Test
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
                  {/* Category Select */}
                  <div className="row">
                    <div className="col-md-6">
                      <div className="custom-frm-bx">
                        <label htmlFor="category">Select Category</label>
                        <select
                          name="category"
                          id="category"
                          value={testData.category}
                          onChange={(e) => {
                            // User manually change kar raha hai
                            isEditLoaded.current = false;
                            setTestData({ ...testData, category: e.target.value });
                          }}
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
                        <span className="text-danger">{testErrors.category}</span>
                      )}
                    </div>
                    {subCatData?.length > 0 && <div className="col-md-6">
                      <div className="custom-frm-bx">
                        <label htmlFor="">Total Amount</label>
                        {/* ✅ Fix 6: onChange mein e.target.value use kiya */}
                        <input type="text" onChange={(e) => setTestData({ ...testData, totalAmount: e.target.value })} value={testData?.totalAmount} className="form-control" />
                      </div>
                    </div>}
                  </div>

                  {/* Sub-category Table */}
                  {testData?.category && (
                    <div className="row mt-3">
                      <div className="col-lg-12 col-md-12 col-sm-12">
                        <div className="table-section mega-table-section">
                          <div className="table table-responsive mb-0">
                            <table className="table mb-0">
                              <thead>
                                <tr>
                                  <th>S.no.</th>
                                  <th>
                                    {/* Select All */}
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

                                      {/* Checkbox */}
                                      <td>
                                        <div className="form-check custom-check">
                                          <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={item.selected}
                                            onChange={() => handleCheckbox(item._id)}
                                          />
                                        </div>
                                      </td>

                                      <td className="text-capitalize">
                                        {item?.subCategory}
                                      </td>
                                      <td>{item?.shortName}</td>

                                      {/* Editable Price */}
                                      <td>
                                        <input
                                          type="number"
                                          className="form-control"
                                          value={item.customPrice}
                                          min={0}
                                          required
                                          disabled={!item.selected}
                                          onChange={(e) =>
                                            handlePriceChange(item._id, e.target.value)
                                          }
                                          style={{ width: "110px" }}
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
                      Update
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

export default EditTest;