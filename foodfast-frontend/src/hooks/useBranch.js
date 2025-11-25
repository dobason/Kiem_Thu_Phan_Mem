import { useState } from 'react';
import axios from 'axios';
import useVietMapGeocode from './useVietMapGeocode';

/**
 * Custom hook to fetch branch data and geocode its address
 * @returns {object} - { branchData, branchLoading, branchError, geocodeData, geocodeLoading, geocodeError, refetch }
 */
const useBranch = () => {
    const [branchData, setBranchData] = useState(null);
    const [branchLoading, setBranchLoading] = useState(false);
    const [branchError, setBranchError] = useState(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const {
        data: geocodeData,
        loading: geocodeLoading,
        error: geocodeError,
        refetch: refetchGeocode,
        isFetched: geocodeIsFetched
    } = useVietMapGeocode();

    const fetchBranch = async (branchId) => {
        if (!branchId) {
            setBranchData(null);
            setBranchError(null);
            return;
        }

        if (!API_URL) {
            setBranchError('API URL is not configured');
            return;
        }

        setBranchLoading(true);
        setBranchError(null);

        try {
            const { data } = await axios.get(
                `${API_URL}/api/branches/${branchId}`
            );

            setBranchData(data);

            // Fetch geocode data if branch has address
            if (data?.address) {
                refetchGeocode(data.address);
            }
        } catch (err) {
            console.error('Branch Fetch Error:', err);
            setBranchError(err.response?.data?.message || err.message || 'Failed to fetch branch data');
        } finally {
            setBranchLoading(false);
        }
    };

    const refetch = (branchId) => {
        fetchBranch(branchId);
    };

    return {
        branchData,
        branchLoading,
        branchError,
        geocodeData,
        geocodeLoading,
        geocodeError,
        geocodeIsFetched,
        refetch
    };
};

export default useBranch;
