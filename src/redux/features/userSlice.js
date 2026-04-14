import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getApiData, getSecureApiData } from "../../services/api";
import { notification } from "antd";

// Async thunk to fetch user profile
export const fetchUserProfile = createAsyncThunk(
    "userProfile/fetch",
    async (searchText, { rejectWithValue }) => {
        try {
            const response = await getApiData(`lab/${localStorage.getItem('userId')}`);
            if (response.success) {
                return response.data;
            }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);
export const fetchUserDetail = createAsyncThunk(
    "userDetail/fetch",
    async (searchText, { rejectWithValue }) => {
        try {
            const response = await getSecureApiData(`lab/detail/${localStorage.getItem('userId')}`);
            if (response.success) {
                return response;
            }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);
export const fetchEmpDetail = createAsyncThunk(
    "empDetail/fetch",
    async (id, { rejectWithValue }) => {
        try {
            const response =id && await getSecureApiData(`api/staff/data/${id}`);
            console.log("res",response)
            if (response.success) {
                return response;
            }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);
const userSlice = createSlice({
    name: "userProfile",
    initialState: {
        profiles: null,
        labPerson: null,
        labAddress: null,
        labImg: null,
        rating: null,
        avgRating: null,
        labLicense: null,
        isRequest: null,
        allowEdit: null,
        paymentInfo:null,
        user:null,
        loading: false,
        error: null,
       staffData: null,
        staffUser:null,
        employment:null,
        isOwner: true,
        permissions:null,
        customId: null,
        notification: 0
    },
    reducers: {
        clearProfiles: (state) => {
            state.profiles = [];
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profiles = action.payload;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchUserDetail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserDetail.fulfilled, (state, action) => {
                state.loading = false;
                state.profiles = action.payload.labData
                state.labAddress = action.payload.labAddress;
                state.labImg = action.payload.labImg;
                state.rating = action.payload.rating;
                state.avgRating = action.payload.avgRating;
                state.labPerson = action.payload.labPerson;
                state.paymentInfo = action.payload.paymentInfo;
                state.isRequest = action.payload.isRequest
                state.allowEdit = action.payload.allowEdit
                state.labLicense = action.payload.labLicense;
                state.customId = action.payload.customId;
                state.user = action.payload.user
                state.notification = action.payload.notifications
                state.isOwner = localStorage.getItem('staffId') ?false :true;
            })
            .addCase(fetchUserDetail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchEmpDetail.fulfilled, (state, action) => {
                state.loading = false;
                state.staffData = action.payload.staffData;
                state.employment=action.payload.employment
                state.staffUser=action.payload.user
                state.isOwner =  false ;
                state.permissions = action.payload.employment.permissionId?.pharmacy || null;
            });
    },
});

export const { clearProfiles, setOwner, setPermissions } = userSlice.actions;
export default userSlice.reducer;
