import instance from "./instance";

const authServices = {
    superadminLogin: async (data) => {
        return await instance.post('/api/role/admin/login', data);
    },
    superadmin_createOrganization: async (data) => {
        return await instance.post('/api/user/create/organization', data);
    },
    superadmin_createAdmin: async (data) => {
        return await instance.post('/api/user/create/admin', data);
    },
    superadmin_getallOrganization: async (data) => {
        return await instance.get('/api/user/organization', data);
    },
    superadmin_getallOrganizationById: async (id) => {
        return await instance.get(`/api/user/get/organization/${id}`);
    },
    superadmin_createUser: async (data) => {
        return await instance.post('/api/user/create', data);
    },
    superadmin_enableMFA: async (id) => {
        return await instance.post(`/api/user/generate-mfa/${id}`);
    },
    superadmin_getUser: async (data) => {
        return await instance.get('/api/user/get', data);
    },
    superadmin_getUserById: async (id) => {
        return await instance.get(`/api/user/getbyId/${id}`);
    },
    superadmin_updateUser: async (id, data) => {
        return await instance.put(`/api/user/update/${id}`, data);
    },
    superadmin_deleteUser: async (id) => {
        return await instance.delete(`/api/user/delete/${id}`);
    },
    superadmin_activateUser: async (id) => {
        return await instance.patch(`/api/user/activate/${id}`);
    },
    superadmin_generateMFA: async (id) => {
        return await instance.get(`/api/user/generate-mfa/${id}`);
    },
    userLogin: async (data) => {
        return await instance.post('/api/auth/user/login', data);
    },
    user_verifyMfa: async (data) => {
        return await instance.post('/api/auth/user/verify-mfa', data);
    },
};

export default authServices;
