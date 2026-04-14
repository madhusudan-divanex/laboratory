import axios from "axios"
import base_url from "../../baseUrl";

export const getApiData=async(endpoint)=>{
    const res=await axios.get(`${base_url}/${endpoint}`)
    return res.data
}
export const getSecureApiData = async (endpoint) => {
  try {
    const res = await axios.get(`${base_url}/${endpoint}`, {
      headers: {
        Token: `${localStorage.getItem('token')}`,
      },
    });

    return res.data;
  } catch (error) {
    // Handle token-related errors or network issues
    if (error.response) {
      return error.response.data;
    }
    return { status: false, message: 'Network error' };
  }
};
export const postApiData=async(endpoint,data)=>{
    const res=await axios.post(`${base_url}/${endpoint}`,data)
    return res.data
}
export const updateApiData=async(endpoint,data)=>{


    const res=await axios.put(`${base_url}/${endpoint}`,data,{
        headers:{
            'Token': `${localStorage.getItem("token")}`
        }
    })
    return res.data
}
export const securePostData=async(endpoint,data)=>{


    const res=await axios.post(`${base_url}/${endpoint}`,data,{
        headers:{
            'Token': `${localStorage.getItem("token")}`
        }
    })
    return res.data
}
export const deleteApiData = async (endpoint, data) => {
  const res = await axios.delete(`${base_url}/${endpoint}`, {
    data: data,
    headers: {
      Token: localStorage.getItem("token")
    }
  });
  return res.data;
};
