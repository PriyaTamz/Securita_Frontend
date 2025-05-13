import React, { useState, useEffect } from 'react';
import authServices from '../services/authServices';
import { useNavigate } from 'react-router-dom';

const SuperadminDashboard = () => {
    const [tab, setTab] = useState('create'); // create | list
    const [organization, setOrganization] = useState('');
    const [adminData, setAdminData] = useState({ username: '', password: '', organizationId: '' });
    const [viewedUser, setViewedUser] = useState(null);
    const [userData, setUserData] = useState({
        organizationId: '',
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        mfaEnabled: false
    });
    const [organizations, setOrganizations] = useState([]);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [mfaQr, setMfaQr] = useState(null);
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [inactiveUsers, setInactiveUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrganizations();
        fetchUsers();
        fetchInactiveUsers();
    }, []);

    const fetchOrganizations = async () => {
        try {
            const res = await authServices.superadmin_getallOrganization();
            setOrganizations(res.data.orgs);
        } catch (err) {
            console.error('Failed to fetch organizations:', err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await authServices.superadmin_getUser({});
            const activeUsers = res.data.users.filter(user => user.isActive);
            setUsers(activeUsers);
        } catch (err) {
            alert("Failed to fetch users");
        }
    };

    const handleCreateOrg = async (e) => {
        e.preventDefault();
        try {
            await authServices.superadmin_createOrganization({ organization });
            alert('Organization created!');
            setOrganization('');
            fetchOrganizations();
        } catch (err) {
            alert('Error creating organization');
        }
    };

    const handleView = async (id) => {
        try {
            const response = await authServices.superadmin_getUserById(id);
            console.log("View user response:", response);
            setViewedUser(response.data.user); // Save org + userCount to state
        } catch (err) {
            console.error("Failed to fetch organization by ID:", err);
        }
    };

    /*const handleView = async (id) => {
        try {
            const response = await authServices.superadmin_getUserById(id);
            setViewedUser(response.data); // Save user details to display
            setEditingUser(null); // Close edit if open
        } catch (err) {
            console.error("Failed to fetch user by ID:", err);
        }
    };*/


    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        try {
            const res = await authServices.superadmin_createAdmin(adminData);
            alert('Admin created!');
            setAdminData({ username: '', password: '', organizationId: '' });
        } catch (err) {
            alert('Error creating admin');
        }
    };

    const handleUserCreate = async (e) => {
        e.preventDefault();
        try {
            const response = await authServices.superadmin_createUser({
                ...userData,
                mfaEnabled: false,
            }); // Adjust for your service name

            alert('User created successfully!');

            if (userData.mfaEnabled) {
                const mfaResponse = await authServices.superadmin_generateMFA(response.data.user._id);
                console.log("MFA Response:", mfaResponse.data);
                // show QR code to scan
                setMfaQr(mfaResponse.data.qrCodeImage);
            }
            setUserData({ organizationId: '', username: '', password: '', firstName: '', lastName: '', email: '', phone: '', mfaEnabled: false });
        } catch (error) {
            alert(error.response?.data?.message || 'Something went wrong');
            console.log(error.response);
        }
    };

    const handleEdit = async (id) => {
        try {
            const res = await authServices.superadmin_getUserById(id);
            setEditingUser(id);
            setEditFormData(res.data.user);
        } catch (err) {
            alert("Failed to get user");
        }
    };

    const handleUpdate = async () => {
        try {
            await authServices.superadmin_updateUser(editingUser, editFormData);
            alert("User updated");
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            alert("Update failed");
        }
    };

    const handleDeactivate = async (id) => {
        if (!window.confirm("Are you sure you want to deactivate this user?")) return;
        try {
            await authServices.superadmin_deleteUser(id); // still uses your soft delete API
            alert("User deactivated");
            fetchUsers(); // refresh list
        } catch (err) {
            alert("Deactivation failed");
        }
    };

    const fetchInactiveUsers = async () => {
        try {
            const res = await authServices.superadmin_getUser({});
            const filtered = res.data.users.filter(user => !user.isActive); // Only inactive
            setInactiveUsers(filtered);
        } catch (err) {
            alert("Failed to fetch inactive users");
        }
    };

    const handleActivate = async (id) => {
        try {
            await authServices.superadmin_activateUser(id); // You need this in your backend
            alert("User activated successfully");
            fetchInactiveUsers();  // Refresh the inactive list
        } catch (err) {
            alert("Failed to activate user");
        }
    };

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Superadmin Dashboard</h1>
                <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                    Logout
                </button>
            </div>

            <div className="mb-4 flex gap-4">
                <button onClick={() => setTab('create')} className={`px-4 py-2 rounded ${tab === 'create' ? 'bg-black text-white' : 'bg-white border'}`}>
                    Create Organization/Admin
                </button>
                <button onClick={() => setTab('list')} className={`px-4 py-2 rounded ${tab === 'list' ? 'bg-black text-white' : 'bg-white border'}`}>
                    List Organizations
                </button>
                <button onClick={() => setTab('create-user')} className={`px-4 py-2 rounded ${tab === 'create-user' ? 'bg-black text-white' : 'bg-white border'}`}>
                    Create User
                </button>
                <button onClick={() => setTab('user-manage')} className={`px-4 py-2 rounded ${tab === 'user-manage' ? 'bg-black text-white' : 'bg-white border'}`}>
                    User Management
                </button>
                <button onClick={() => setTab('user-activate')} className={`px-4 py-2 rounded ${tab === 'user-activate' ? 'bg-black text-white' : 'bg-white border'}`}>
                    Activate User
                </button>
            </div>

            {tab === 'create' && (
                <div className="space-y-6">
                    <form onSubmit={handleCreateOrg} className="bg-white p-4 rounded shadow">
                        <h2 className="text-lg font-semibold mb-2">Create Organization</h2>
                        <input
                            type="text"
                            placeholder="Organization Name"
                            value={organization}
                            onChange={(e) => setOrganization(e.target.value)}
                            className="w-full mb-2 border p-2 rounded"
                            required
                        />
                        <button type="submit" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">Create</button>
                    </form>

                    <form onSubmit={handleCreateAdmin} className="bg-white p-4 rounded shadow">
                        <h2 className="text-lg font-semibold mb-2">Create Admin</h2>
                        <select
                            value={adminData.organizationId}
                            onChange={(e) => setAdminData({ ...adminData, organizationId: e.target.value })}
                            className="w-full mb-2 border p-2 rounded"
                            required
                        >
                            <option value="">Select Organization</option>
                            {organizations.map((org) => (
                                <option key={org._id} value={org._id}>
                                    {org.organization}
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Username"
                            value={adminData.username}
                            onChange={(e) => setAdminData({ ...adminData, username: e.target.value })}
                            className="w-full mb-2 border p-2 rounded"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={adminData.password}
                            onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                            className="w-full mb-2 border p-2 rounded"
                            required
                        />
                        <button type="submit" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">Create</button>
                    </form>
                </div>
            )}

            {tab === 'list' && (
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-4">All Organizations</h2>
                    {organizations.length === 0 ? (
                        <p>No organizations found.</p>
                    ) : (
                        <table className="min-w-full table-auto border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-2 text-left">#</th>
                                    <th className="px-4 py-2 text-left">Organization Name</th>
                                    <th className="px-4 py-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {organizations.map((org, index) => (
                                    <tr key={org._id} className="border-t">
                                        <td className="px-4 py-2">{index + 1}</td>
                                        <td className="px-4 py-2">{org.organization}</td>
                                        <td className="px-4 py-2">
                                            <button
                                                onClick={() => handleView(org._id)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                View
                                            </button>

                                            <button className="ml-2 text-red-600 hover:text-red-800">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {selectedOrg && (
                        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
                            <h3 className="mb-4 text-xl font-bold text-gray-800 border-b pb-2">Organization Details</h3>
                            <div className="space-y-2 text-gray-700">
                                <p><span className="font-medium">Name:</span> {selectedOrg.orgs.organization}</p>
                                <p><span className="font-medium">Users:</span> {selectedOrg.userCount}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {tab === 'create-user' && (
                <div className="bg-white p-4 rounded shadow max-w-xl mx-auto">
                    <h2 className="text-lg font-semibold mb-4">Create User</h2>
                    <form onSubmit={handleUserCreate}>
                        <div className="grid grid-cols-2 gap-4">
                            <select
                                value={userData.organizationId}
                                onChange={(e) => setUserData({ ...userData, organizationId: e.target.value })}
                                className="w-full mb-2 border p-2 rounded"
                                required
                            >
                                <option value="">Select Organization</option>
                                {organizations.map((org) => (
                                    <option key={org._id} value={org._id}>
                                        {org.organization}
                                    </option>
                                ))}
                            </select>
                            <input type="text" placeholder="Username" className="border p-2 rounded" value={userData.username} onChange={e => setUserData({ ...userData, username: e.target.value })} required />
                            <input type="password" placeholder="Password" className="border p-2 rounded" value={userData.password} onChange={e => setUserData({ ...userData, password: e.target.value })} required />
                            <input type="text" placeholder="First Name" className="border p-2 rounded" value={userData.firstName} onChange={e => setUserData({ ...userData, firstName: e.target.value })} />
                            <input type="text" placeholder="Last Name" className="border p-2 rounded" value={userData.lastName} onChange={e => setUserData({ ...userData, lastName: e.target.value })} />
                            <input type="email" placeholder="Email" className="border p-2 rounded" value={userData.email} onChange={e => setUserData({ ...userData, email: e.target.value })} />
                            <input type="text" placeholder="Phone" className="border p-2 rounded" value={userData.phone} onChange={e => setUserData({ ...userData, phone: e.target.value })} />
                        </div>
                        <div className="mt-4">
                            <label className="inline-flex items-center">
                                <input type="checkbox" className="form-checkbox" checked={userData.mfaEnabled} onChange={e => setUserData({ ...userData, mfaEnabled: e.target.checked })} />
                                <span className="ml-2">Enable MFA</span>
                            </label>
                        </div>
                        <button type="submit" className="mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800">Create User</button>
                    </form>
                    {mfaQr && (
                        <div className="mt-6 text-center">
                            <p className="mb-2 text-gray-700">Scan this QR code using Google Authenticator or Authy</p>
                            <img src={mfaQr} alt="MFA QR Code" className="inline-block w-40 h-40" />
                        </div>
                    )}
                </div>
            )}

            {tab === 'user-manage' && (
                <div className="p-4 max-w-4xl mx-auto bg-white shadow rounded">
                    <h2 className="text-lg font-semibold mb-4">User Management</h2>
                    {editingUser && editFormData && (
                        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                            <h3 className="text-lg font-semibold mb-4">Editing User Overview</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Username</label>
                                    <input
                                        className="border p-2 w-full"
                                        value={editFormData.username || ''}
                                        onChange={(e) =>
                                            setEditFormData({ ...editFormData, username: e.target.value })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Password</label>
                                    <input
                                        className="border p-2 w-full"
                                        value={editFormData.password || ''}
                                        onChange={(e) =>
                                            setEditFormData({ ...editFormData, password: e.target.value })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Email</label>
                                    <input
                                        className="border p-2 w-full"
                                        value={editFormData.email || ''}
                                        onChange={(e) =>
                                            setEditFormData({ ...editFormData, email: e.target.value })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">First Name</label>
                                    <input
                                        className="border p-2 w-full"
                                        value={editFormData.firstName || ''}
                                        onChange={(e) =>
                                            setEditFormData({ ...editFormData, firstName: e.target.value })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Last Name</label>
                                    <input
                                        className="border p-2 w-full"
                                        value={editFormData.lastName || ''}
                                        onChange={(e) =>
                                            setEditFormData({ ...editFormData, lastName: e.target.value })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Phone</label>
                                    <input
                                        className="border p-2 w-full"
                                        value={editFormData.phone || ''}
                                        onChange={(e) =>
                                            setEditFormData({ ...editFormData, phone: e.target.value })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">MFA Enabled</label>
                                    <select
                                        className="border p-2 w-full"
                                        value={editFormData.mfaEnabled}
                                        onChange={(e) =>
                                            setEditFormData({
                                                ...editFormData,
                                                mfaEnabled: e.target.value === 'true',
                                            })
                                        }
                                    >
                                        <option value="false">No</option>
                                        <option value="true">Yes</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={handleUpdate}
                                    className="bg-green-600 text-white px-4 py-2 rounded"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setEditingUser(null)}
                                    className="bg-gray-400 text-white px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                    {viewedUser && (
                        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                            <h3 className="text-lg font-semibold mb-4">Viewed User Overview</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <strong>Username:</strong> {viewedUser.username}
                                </div>
                                <div>
                                    <strong>Email:</strong> {viewedUser.email}
                                </div>
                                <div>
                                    <strong>First Name:</strong> {viewedUser.firstName}
                                </div>
                                <div>
                                    <strong>Last Name:</strong> {viewedUser.lastName}
                                </div>
                                <div>
                                    <strong>Phone:</strong> {viewedUser.phone}
                                </div>
                                <div>
                                    <strong>MFA Enabled:</strong> {viewedUser.mfaEnabled ? "Yes" : "No"}
                                </div>
                            </div>
                            <div className="mt-4">
                                <button
                                    onClick={() => setViewedUser(null)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded"
                                >
                                    Close View
                                </button>
                            </div>
                        </div>
                    )}
                    <table className="w-full border text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">Username</th>
                                <th className="border p-2">Organization</th>
                                <th className="border p-2">Email</th>
                                <th className="border p-2">MFA Enabled</th>
                                <th className="border p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id}>
                                    {/* Username */}
                                    <td className="border p-2">
                                        {editingUser === user._id ? (
                                            <input
                                                className="border p-1 w-full"
                                                value={editFormData.username || ''}
                                                onChange={(e) =>
                                                    setEditFormData({ ...editFormData, username: e.target.value })
                                                }
                                            />
                                        ) : (
                                            user.username
                                        )}
                                    </td>

                                    {/* Organization */}
                                    <td className="border p-2">{user.organization?.organization || 'N/A'}</td>

                                    {/* Email */}
                                    <td className="border p-2">
                                        {editingUser === user._id ? (
                                            <input
                                                className="border p-1 w-full"
                                                value={editFormData.email || ''}
                                                onChange={(e) =>
                                                    setEditFormData({ ...editFormData, email: e.target.value })
                                                }
                                            />
                                        ) : (
                                            user.email
                                        )}
                                    </td>

                                    {/* MFA */}
                                    <td className="border p-2 text-center">
                                        {user.mfaEnabled ? 'Yes' : 'No'}
                                    </td>

                                    {/* Actions */}
                                    <td className="border p-2 text-center">
                                        {editingUser === user._id ? (
                                            <>
                                                <button onClick={handleUpdate} className="text-green-600 mr-2">
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingUser(null)}
                                                    className="text-gray-600"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleView(user._id)}
                                                    className="text-red-600"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(user._id)}
                                                    className="text-blue-600 mr-2"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeactivate(user._id)}
                                                    className="text-red-600"
                                                >
                                                    Deactivate
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {tab === 'user-activate' && (
                <div className="p-4 max-w-4xl mx-auto bg-white shadow rounded">
                    <h2 className="text-lg font-semibold mb-4">Inactive Users</h2>
                    {inactiveUsers.length === 0 ? (
                        <p>No inactive users found.</p>
                    ) : (
                        <table className="w-full border text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border p-2">Username</th>
                                    <th className="border p-2">Organization</th>
                                    <th className="border p-2">Email</th>
                                    <th className="border p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inactiveUsers.map(user => (
                                    <tr key={user._id}>
                                        <td className="border p-2">{user.username}</td>
                                        <td className="border p-2">{user.organization?.organization || 'N/A'}</td>
                                        <td className="border p-2">{user.email}</td>
                                        <td className="border p-2 text-center">
                                            <button onClick={() => handleActivate(user._id)} className="text-green-600">
                                                Activate
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default SuperadminDashboard;
