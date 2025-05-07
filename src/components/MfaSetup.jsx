import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import authServices from '../services/authServices';

const MfaSetup = () => {
    const { userId } = useParams();
    const [otp, setOtp] = useState('');
    const [qrImage, setQrImage] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQR = async () => {
            try {
                const res = await axios.get(`/api/user/generate-mfa/${userId}`);
                setQrImage(res.data.qrImage);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch QR Code');
            }
        };
        fetchQR();
    }, [userId]);

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await authServices.user_verifyMfa({ userId, token: otp });
            setSuccess('MFA Verified Successfully!');
            setTimeout(() => {
                navigate('/user-dashboard');
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-md text-center">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">MFA Verification</h2>
                {qrImage && (
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">Scan QR code with your authenticator app:</p>
                        <img src={qrImage} alt="MFA QR Code" className="mx-auto h-40 w-40" />
                    </div>
                )}
                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-600">{success}</p>}
                <form onSubmit={handleOtpSubmit} className="space-y-4 mt-4">
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        required
                        className="w-full p-2 border rounded-lg text-center"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white p-2 rounded-lg hover:bg-gray-800"
                    >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MfaSetup;
