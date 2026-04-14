import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  // faEye,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FaPlusCircle } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa6";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getSecureApiData, securePostData } from "../../services/api";
import { useSelector } from "react-redux";
import Loader from "../Layouts/Loader";

function Reports() {
  const navigate = useNavigate()
  const { isOwner, permissions } = useSelector(state => state.user)
  const userId = localStorage.getItem('userId')
  const [selectedOption, setSelectedOption] = useState("select");
  const [loading,setLoading]=useState(false)
  const handleRadioChange = (event) => {
    setSelectedOption(event.target.value);
  };
  const [testData, setTestData] = useState({
    labId: userId,
    name: "",
    department: "",
    code: "",
    packageType: "",
    testProcessing: "",
    fastingRequired: null,
    testType: null,
    specialApproval: null,
    price: "",
    status: "inactive",
  });
  const [sampleData, setSampleData] = useState([
    {
      type: "",
      volume: ""
    }
  ])
  const [components, setComponents] = useState([
    {
      name: "",
      unit: "",
      title: '',
      optionType: "text",
      textResult: '',
      result: [{ value: '', note: '' }],
      referenceRange: "",
      status: false,
    },
  ]);

  const [componentErrors, setComponentErrors] = useState([]);
  const validateComponents = () => {
    let newErrors = [];

    components.forEach((comp, index) => {
      let error = {};

      if (!comp.name?.trim()) {
        error.name = "Component name is required";
      }

      if (!comp.unit?.trim()) {
        error.unit = "Component unit is required";
      }

      if (!comp.optionType) {
        error.optionType = "Select type is required";
      }

      if (comp.optionType === "text") {
        if (!comp.textResult?.trim()) {
          error.textResult = "Text result is required";
        }
      }

      if (comp.optionType === "select") {
        if (!comp.result || comp.result.length === 0) {
          error.result = "At least one option required";
        } else {
          let optionErrors = [];

          comp.result.forEach((opt, optIndex) => {
            let optErr = {};

            if (!opt.value?.trim()) {
              optErr.value = "Option value required";
            }

            // ✅ ONLY push if error exists
            if (Object.keys(optErr).length > 0) {
              optionErrors[optIndex] = optErr;
            }
          });

          // ✅ ONLY assign if any real error exists
          if (optionErrors.length > 0) {
            error.optionErrors = optionErrors;
          }
        }
      }

      if (!comp.referenceRange?.trim()) {
        error.referenceRange = "Range is required";
      }

      newErrors[index] = error;
    });

    setComponentErrors(newErrors);

    return {
      isValid: newErrors.every(err => Object.keys(err).length === 0),
      errors: newErrors
    };
  };
  const [testErrors, setTestErrors] = useState({});
  const [deptOption, setDeptOption] = useState([])
  const validateTestData = () => {
    let errors = {};

    if (!testData.shortName?.trim()) {
      errors.name = "Test name is required";
    }

    if (!testData.department) {
      errors.department = "Category is required";
    }

    if (!testData.code?.trim()) {
      errors.code = "Test code is required";
    }

    if (!testData.packageType) {
      errors.packageType = "Package type is required";
    }

    if (!testData.testProcessing) {
      errors.testProcessing = "Processing time is required";
    }

    if (testData.fastingRequired === null) {
      errors.fastingRequired = "Please select fasting requirement";
    }

    if (testData.testType === null) {
      errors.testType = "Please select test type";
    }

    if (testData.specialApproval === null) {
      errors.specialApproval = "Please select approval requirement";
    }

    if (!testData.price) {
      errors.price = "Price is required";
    } else if (isNaN(testData.price) || Number(testData.price) <= 0) {
      errors.price = "Enter valid price";
    }



    setTestErrors(errors);

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const handleComponentChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updated = [...components];

    // checkbox handling
    updated[index][name] = type === "checkbox" ? checked : value;

    // optionType switch handling
    if (name === "optionType") {
      if (value === "text") {
        updated[index].textResult = "";
      } else if (value === "select") {
        updated[index].result = [{ value: "", note: "" }];
      }
    }

    setComponents(updated);
  };





  // -------------------- Add Component --------------------
  const addComponent = () => {
    setComponents([
      ...components,
      { name: "", unit: "", optionType: "text", textResult: "", result: [{ value: '', note: '' }], referenceRange: "", status: false },
    ]);
  };

  // -------------------- Remove Component --------------------
  const removeComponent = (index) => {
    const updatedComponents = components.filter((_, i) => i !== index);
    setComponents(updatedComponents);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTestData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddOption = (componentIndex) => {
    const updated = [...components];
    updated[componentIndex].result.push({ value: "", note: "" });
    setComponents(updated);
  };


  const handleOptionChange = (componentIndex, optionIndex, field, value) => {
    const updated = [...components];
    updated[componentIndex].result[optionIndex][field] = value;
    setComponents(updated);
  };


  const handleRemoveOption = (componentIndex, optionIndex) => {
    const updated = [...components];
    updated[componentIndex].result.splice(optionIndex, 1);
    setComponents(updated);
  };

  const testSubmit = async (e) => {
    e.preventDefault()
    const sampleValidation = validateSamples();
    const componentValidation = validateComponents();
    const testValidation = validateTestData();
    if (
      !sampleValidation.isValid ||
      !componentValidation.isValid ||
      !testValidation.isValid
    ) {
      return;
    }
    // if (!isOwner && !permissions.addTest) {
    //   toast.error('You do not have permission to add test ')
    //   return
    // }
    const data = { ...testData, component: components, sample: sampleData }
    try {
      const response = await securePostData(`lab/test`, data)
      if (response.success) {
        toast.success('Test data saved successfully')
        navigate('/tests')
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      toast.error(error)
    }
  }
  // -------------------- Add Sample --------------------
  const addSample = () => {
    setSampleData([
      ...sampleData,
      { type: "", volume: "" },
    ]);
  };

  // -------------------- Remove Component --------------------
  const removeSample = (index) => {
    const updatedComponents = sampleData.filter((_, i) => i !== index);
    setSampleData(updatedComponents);
  };
  const handleSampleChange = (index, e) => {
    const { name, value } = e.target;

    const updatedSamples = [...sampleData];
    updatedSamples[index][name] = value;

    setSampleData(updatedSamples);

    // clear error for that field
    const updatedErrors = [...sampleErrors];
    if (updatedErrors[index]) {
      delete updatedErrors[index][name];
    }
    setSampleErrors(updatedErrors);
  };
  const [sampleErrors, setSampleErrors] = useState([]);
  const validateSamples = () => {
    let newErrors = [];

    sampleData.forEach((sample, index) => {
      let error = {};

      if (!sample.type.trim()) {
        error.type = "Sample type is required";
      }

      if (!sample.volume.trim()) {
        error.volume = "Volume is required";
      }

      newErrors[index] = error;
    });

    setSampleErrors(newErrors);

    return {
      isValid: newErrors.every(err => Object.keys(err).length === 0),
      errors: newErrors
    };
  };
 const fetchDepartments = async () => {
      try {
        setLoading(true);
        const res = await getSecureApiData(`api/department/list?limit=100&type=LAB`);
        if (res.success) {
          setDeptOption(res.data);
        }
  
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    useEffect(() => {
      fetchDepartments()
    }, [])
  return (
    <>
      {loading?<Loader/>
      :<div className="main-content flex-grow-1 p-3 overflow-auto">
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
            {/* <div className="add-nw-bx d-flex gap-2">
              <a href="javascript:void(0)" className="add-nw-btn nw-thm-btn patient-thm-btn">
                <FontAwesomeIcon icon={faEye} /> Patient Details
              </a>

              <a href="javascript:void(0)" className="add-nw-btn nw-meeting-thm-btn " data-bs-toggle="modal" data-bs-target="#edit-Request" >
                <FaPlusCircle /> Print
              </a>
            </div> */}
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
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="custom-frm-bx">
                      <label htmlFor="">Select Department</label>
                      <select name="department" value={testData.department} onChange={handleChange} id="" className="form-select nw-control-frm">
                        <option value="">---Select---</option>
                        {deptOption?.map((item,key)=>
                        <option value={item?._id}>{item?.departmentName}</option>)}
                      </select>
                    </div>
                    {testErrors?.department && <span className="text-danger">{testErrors?.department}</span>}
                  </div>

                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="custom-frm-bx">
                      <label htmlFor="">Name</label>
                      <input type="text" className="form-control nw-control-frm" name="shortName" value={testData.shortName} onChange={handleChange} />
                      {testErrors?.name && <span className="text-danger">{testErrors?.name}</span>}
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="custom-frm-bx">
                      <label htmlFor="">Code</label>
                      <input type="text" className="form-control nw-control-frm" name="code" value={testData.code} onChange={handleChange} />
                      {testErrors?.code && <span className="text-danger">{testErrors?.code}</span>}
                    </div>
                  </div>

                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="custom-frm-bx">
                      <label htmlFor="">Package Type</label>
                      <select name="packageType" value={testData.packageType} onChange={handleChange} id="" className="form-select nw-control-frm">
                        <option value="">---Select Categories---</option>
                        <option value="single">Single</option>
                        <option value="profile">Profile</option>
                        <option value="package">Package</option>
                      </select>
                      {testErrors?.packageType && <span className="text-danger">{testErrors?.packageType}</span>}
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="custom-frm-bx">
                      <label htmlFor="">Test Type</label>
                      <select name="testType" value={testData.testType} onChange={handleChange} id="" className="form-select nw-control-frm">
                        <option value="">---Select---</option>
                        <option value="Single">Routine</option>
                        <option value="Profile">Urgent</option>
                      </select>
                      {testErrors?.testType && <span className="text-danger">{testErrors?.testType}</span>}
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="custom-frm-bx">
                      <label htmlFor="">Fasting Requried</label>
                      <select name="fastingRequired" value={testData.fastingRequired} onChange={handleChange} id="" className="form-select nw-control-frm">
                        <option value="">---Select---</option>
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                      </select>
                      {testErrors?.fastingRequired && <span className="text-danger">{testErrors?.fastingRequired}</span>}
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="custom-frm-bx">
                      <label htmlFor="">Special Approval Required</label>
                      <select name="specialApproval" value={testData.specialApproval} onChange={handleChange} id="" className="form-select nw-control-frm">
                        <option value="">---Select---</option>
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                      </select>
                      {testErrors?.specialApproval && <span className="text-danger">{testErrors?.specialApproval}</span>}
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="custom-frm-bx">
                      <label htmlFor="">Test Processing</label>
                      <select name="testProcessing" value={testData.testProcessing} onChange={handleChange} id="" className="form-select nw-control-frm">
                        <option value="">---Select---</option>
                        <option value={"Machine"}>Machine</option>
                        <option value={"Manual"}>Manual</option>
                        <option value={"Batch"}>Batch</option>
                      </select>
                      {testErrors?.testProcessing && <span className="text-danger">{testErrors?.testProcessing}</span>}
                    </div>
                  </div>


                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="custom-frm-bx">
                      <label htmlFor="">Price</label>
                      <input type="text" className="form-control nw-control-frm" name="price" value={testData.price} onChange={handleChange} />

                      <div className="reprt-price-bx">
                        <a href="javascript:void(0)" className="reprt-price-btn">$</a>
                      </div>
                    </div>
                    {testErrors?.price && <span className="text-danger my-5">{testErrors?.price}</span>}
                  </div>


                </div>

                <div className="lab-chart-crd reporting-crd-bx mb-5">
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="lab-tp-title patient-bio-tab report-bio-tp d-flex align-items-center justify-content-between py-3 sub-header-bx gap-2">
                        <div>
                          <h6 className="mb-0 text-black">Sample Collection</h6>
                        </div>

                        <div className="add-nw-bx d-flex gap-2">

                          <button type="button" onClick={addSample} className="add-nw-btn thm-btn">
                            <img src="/plus-icon.png" alt="" /> Sample
                          </button>

                        </div>

                      </div>

                      <div className="patient-bio-tab">
                        <div className="table-section mega-table-section reporting-table-section">
                          <div className="table table-responsive mb-0">
                            <table className="table mb-0">
                              <thead>
                                <tr>
                                  <th>Type</th>
                                  <th>Sample Amount</th>
                                  <th>Action</th>

                                </tr>
                              </thead>
                              <tbody>

                                {sampleData.map((s, index) => (
                                  <React.Fragment key={index}>
                                    <tr >
                                      <td className="h-auto w-auto">
                                        <div className="custom-frm-bx">
                                          <input
                                            type="text"
                                            name="type"
                                            className="form-control"
                                            placeholder="Blood"
                                            value={s.type}
                                            onChange={(e) => handleSampleChange(index, e)}
                                          />
                                          {sampleErrors[index]?.type && (
                                            <span className="text-danger">{sampleErrors[index].type}</span>
                                          )}
                                        </div>

                                      </td>
                                      <td className="h-auto w-auto">
                                        <div className="custom-frm-bx">
                                          <input
                                            type="text"
                                            name="volume"
                                            className="form-control"
                                            placeholder="0.5mm/dl"
                                            value={s.volume}
                                            onChange={(e) => handleSampleChange(index, e)}
                                          />
                                          {sampleErrors[index]?.volume && (
                                            <span className="text-danger">{sampleErrors[index].volume}</span>
                                          )}
                                        </div>

                                      </td>
                                      <td className="h-auto w-auto">
                                        <button
                                          type="button"
                                          disabled={sampleData?.length == 1}
                                          className="text-black"
                                          onClick={() => removeSample(index)}
                                        >
                                          <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                      </td>
                                    </tr>
                                  </React.Fragment>
                                ))}

                              </tbody>
                            </table>

                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lab-chart-crd reporting-crd-bx">
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="lab-tp-title patient-bio-tab report-bio-tp d-flex align-items-center justify-content-between py-3 sub-header-bx gap-2">
                        <div>
                          <h6 className="mb-0 text-black">Test Components</h6>
                        </div>

                        <div className="add-nw-bx d-flex gap-2">
                          {/* <button type="button" onClick={addTitle} className="add-nw-btn thm-btn">
                            <img src="/plus-icon.png" alt="" /> Title
                          </button> */}

                          <button type="button" onClick={addComponent} className="add-nw-btn thm-btn">
                            <img src="/plus-icon.png" alt="" /> Component
                          </button>

                        </div>

                      </div>

                      <div className="patient-bio-tab">
                        <div className="table-section mega-table-section reporting-table-section">
                          <div className="table table-responsive mb-0">
                            <table className="table mb-0">
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>Unit</th>
                                  <th>Result</th>
                                  <th>Reference Range</th>
                                  {/* <th>Status</th> */}
                                  <th>Action</th>

                                </tr>
                              </thead>
                              <tbody>

                                {components.map((component, index) => (
                                  <React.Fragment key={index}>
                                    <tr>
                                      <td>
                                        <div className="custom-frm-bx">
                                          <input
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            placeholder="Lymphocyte"
                                            value={component.name}
                                            onChange={(e) => handleComponentChange(index, e)}
                                          />
                                          {componentErrors[index]?.name && (
                                            <span className="text-danger">
                                              {componentErrors[index].name}
                                            </span>
                                          )}
                                        </div>
                                      </td>

                                      <td>
                                        <div className="custom-frm-bx">
                                          <input
                                            type="text"
                                            name="unit"
                                            className="form-control"
                                            placeholder="mm/dl"
                                            value={component.unit}
                                            onChange={(e) => handleComponentChange(index, e)}
                                          />
                                          {componentErrors[index]?.unit && (
                                            <span className="text-danger">
                                              {componentErrors[index].unit}
                                            </span>
                                          )}
                                        </div>
                                      </td>

                                      <td>
                                        <div className="custom-radio-group">

                                          {/* RADIO */}
                                          <div className="form-check form-check-inline">
                                            <input
                                              className="form-check-input"
                                              type="radio"
                                              name="optionType"
                                              value="text"
                                              checked={component.optionType == "text"}
                                              onChange={(e) => handleComponentChange(index, e)}
                                            />
                                            <label className="form-check-label">Text</label>
                                          </div>

                                          <div className="form-check form-check-inline mb-2">
                                            <input
                                              className="form-check-input"
                                              type="radio"
                                              name="optionType"
                                              value="select"
                                              checked={component.optionType == "select"}
                                              onChange={(e) => handleComponentChange(index, e)}
                                            />
                                            <label className="form-check-label">Select</label>
                                          </div>

                                          {componentErrors[index]?.optionType && (
                                            <sapn className="text-danger d-block">
                                              {componentErrors[index].optionType}
                                            </sapn>
                                          )}

                                          {/* SELECT TYPE */}
                                          {component.optionType === "select" ? (
                                            <div className="report-droping-bx mt-0">

                                              <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h5 className="optin-title">Options</h5>
                                                <button
                                                  type="button"
                                                  className="option-rep-add-btn"
                                                  onClick={() => handleAddOption(index)}
                                                >
                                                  <FaPlusCircle />
                                                </button>
                                              </div>

                                              {component.result.map((opt, optIndex) => (
                                                <div key={optIndex} className="mb-2">

                                                  <div className="d-flex align-items-center gap-2">

                                                    {/* VALUE */}
                                                    <div className="custom-frm-bx mb-0 flex-grow-1">
                                                      <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Option"
                                                        value={opt.value}
                                                        onChange={(e) =>
                                                          handleOptionChange(index, optIndex, "value", e.target.value)
                                                        }
                                                      />
                                                      {componentErrors[index]?.optionErrors?.[optIndex]?.value && (
                                                        <span className="text-danger">
                                                          {componentErrors[index].optionErrors[optIndex].value}
                                                        </span>
                                                      )}
                                                    </div>

                                                    {/* NOTE */}
                                                    <div className="custom-frm-bx mb-0 flex-grow-1">
                                                      <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Note"
                                                        value={opt.note}
                                                        onChange={(e) =>
                                                          handleOptionChange(index, optIndex, "note", e.target.value)
                                                        }
                                                      />
                                                    </div>

                                                    {/* REMOVE */}
                                                    <button
                                                      type="button"
                                                      className="text-black"
                                                      onClick={() => handleRemoveOption(index, optIndex)}
                                                    >
                                                      <FaTrash />
                                                    </button>

                                                  </div>
                                                </div>
                                              ))}

                                              {componentErrors[index]?.result && (
                                                <span className="text-danger">
                                                  {componentErrors[index].result}
                                                </span>
                                              )}

                                            </div>
                                          ) : (
                                            <div className="custom-frm-bx mb-0 flex-grow-1">
                                              <textarea
                                                rows={5}
                                                name="textResult"
                                                value={component.textResult}
                                                onChange={(e) => handleComponentChange(index, e)}
                                                className="form-control"
                                              />
                                              {componentErrors[index]?.textResult && (
                                                <span className="text-danger">
                                                  {componentErrors[index].textResult}
                                                </span>
                                              )}
                                            </div>
                                          )}

                                        </div>
                                      </td>

                                      <td>
                                        <div className="custom-frm-bx">
                                          <textarea
                                            name="referenceRange"
                                            className="form-control"
                                            style={{ resize: "auto", height: "100px" }}
                                            value={component.referenceRange}
                                            onChange={(e) => handleComponentChange(index, e)}
                                            placeholder="20-100"
                                          />
                                          {componentErrors[index]?.referenceRange && (
                                            <span className="text-danger">
                                              {componentErrors[index].referenceRange}
                                            </span>
                                          )}
                                        </div>
                                      </td>

                                      {/* <td>
                                        <div className="custom-frm-bx form-check custom-check pt-0">
                                          <input
                                            type="checkbox"
                                            name="status"
                                            checked={component.status}
                                            onChange={(e) => handleComponentChange(index, e)}
                                            className="form-check-input"
                                          />
                                        </div>
                                      </td> */}

                                      <td>
                                        <button
                                          type="button"
                                          disabled={components?.length === 1}
                                          className="text-black"
                                          onClick={() => removeComponent(index)}
                                        >
                                          <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                      </td>
                                    </tr>

                                    <tr>
                                      <td colSpan={6} className="h-auto">
                                        <div className="custom-frm-bx mb-0">
                                          <input
                                            type="text"
                                            name="title"
                                            value={component.title}
                                            onChange={(e) => handleComponentChange(index, e)}
                                            className="form-control nw-control-frm"
                                            placeholder="Blood details"
                                          />
                                        </div>
                                      </td>
                                    </tr>

                                  </React.Fragment>
                                ))}

                              </tbody>
                            </table>

                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="d-flex justify-content-between mt-3">
                  <Link to={-1} className="nw-thm-btn rounded-3 outline" >
                    Go Back
                  </Link>
                  <button to="submit" className="nw-thm-btn sub-nw-brd-tbn">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>}

    </>
  )
}

export default Reports