/**
 * 用于存放sso相关的请求或方法
 */

module.factory('ssoMethod', ['request', function (request) {
    var ssoUrl = DYCONFIG.sso.rUrl;
    var extraUrl = DYCONFIG.extra.rUrl;
    return {
        /**
         * 获取uinfo.js返回的attrs信息
         * @returns {*|data.attrs|{certification}|{pass}|reqData.attrs|{basic}}
         */
        getUserAttrs: function () {
            if (UINFO && UINFO.usr && UINFO.usr.attrs) {
                return UINFO.usr.attrs;
            }
        },

        /**
         * 获取用户信息 api： https://api.gdy.io/#w_gdy_io_dyf_uas_ucs_ssoUinfo
         * @param params
         * @param filter
         * @returns {*}
         */
        userInfo: function (params, filter) {
            params = params || {};
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: ssoUrl + 'sso/api/uinfo',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 更新用户信息 api: https://api.gdy.io/#w_gdy_io_dyf_uas_ucs_ssoUpdate
         * @param data
         * @param filter
         * @returns {*}
         */
        updateUser: function (data, filter) {
            var option = {
                method: 'POST',
                url: ssoUrl + 'usr/api/update',
                params: {
                    token: rcpAid.getToken()
                },
                data: data
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 发送验证码给手机 api：https://api.gdy.io/#w_gdy_io_dyf_uas_ucs_tloginSendPhoneMessage
         * @param params
         * @param filter
         * @returns {*}
         */
        sendMessage: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: ssoUrl + 'tlogin/api/sendMessage',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 绑定手机 api：https://api.gdy.io/#w_gdy_io_dyf_uas_ucs_tloginBindUserPhone
         * @param params
         * @param filter
         * @returns {*}
         */
        bindPhone: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: ssoUrl + 'tlogin/api/bindPhone',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 修改密码 api：https://api.gdy.io/#w_gdy_io_dyf_uas_ucs_tloginResetPassword
         * @param params
         * @param filter
         * @returns {*}
         */
        resetPassword: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: ssoUrl + 'tlogin/api/resetPwd',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        // 获取实名认证列表 api:https://api.gdy.io/#w_gdy_io_dyf_uas_ucs_certificationGCertList
        GCertList: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: ssoUrl + 'cert/api/list',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        // 实名认证 api:https://api.gdy.io/#w_gdy_io_dyf_uas_ucs_certificationUCertStatus
        UCertStatus: function (data, filter) {
            var option = {
                method: 'POST',
                url: ssoUrl + 'cert/api/update',
                params: {
                    token: rcpAid.getToken()
                },
                data: data
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 搜索用户 api: https://api.gdy.io/#w_gdy_io_dyf_uas_ucs_ssoSearch
         * @param params
         * @param filter
         * @returns {*}
         */
        searchUser: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: ssoUrl + 'usr/api/search',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },
        
        
        
        //----------------------机构相关---------------------- BEGIN


        /**
         * 获取机构列表 api: https://api.gdy.io/#w_gdy_io_dyf_uas_orgManage_orgapiListOrgs
         * @param params
         * @param filter
         * @returns {*}
         */
        getOrgList: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: ssoUrl + 'usr/api/listOrgs',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 创建机构 api: https://api.gdy.io/#w_gdy_io_dyf_uas_orgManage_orgapiCreateOrg
         * @param params
         * @param filter
         * @returns {*}
         */
        createOrg: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: ssoUrl + 'usr/api/createOrg',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 更改机构 api: https://api.gdy.io/#w_gdy_io_dyf_uas_orgManage_orgapiModifyOrg
         * @param params
         * @param filter
         * @returns {*}
         */
        modifyOrg: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: ssoUrl + 'usr/api/modifyOrg',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 创建机构用户 api: https://api.gdy.io/#w_gdy_io_dyf_uas_orgManage_orgapiCreateOrgMembers
         * @param params
         * @param filter
         * @returns {*}
         */
        createOrgMember: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: ssoUrl + 'usr/api/createOrgMembers',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 获取所有标签 api: https://api.gdy.io/#w_gdy_io_dyf_uas_orgManage_orgapiGetAllTags
         * @param params
         * @param filter
         * @returns {*}
         */
        getAllTags: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: ssoUrl + 'usr/api/getAllTags',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },
        
        /**
         * 获取所有标签 api: https://api.gdy.io/#w_gdy_io_dyf_uas_orgManage_orgapiListOrgMembers
         * @param params
         * @param filter
         * @returns {*}
         */
        getOrgMember: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: ssoUrl + 'usr/api/listOrgMembers',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 创建标签 api: https://api.gdy.io/#w_gdy_io_dyf_uas_orgManage_orgapiCreateOrgMemTags
         * @param params
         * @param filter
         * @returns {*}
         */
        createOrgTag: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: ssoUrl + 'usr/api/createOrgMemTags',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 编辑和删除标签 api: https://api.gdy.io/#w_gdy_io_dyf_uas_orgManage_orgapiMdyOrgMemTag
         * @param params
         * @param filter
         * @returns {*}
         */
        modifyTag: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: ssoUrl + 'usr/api/mdyOrgMemTag',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 更改机构成员信息 api: https://api.gdy.io/#w_gdy_io_dyf_uas_orgManage_orgapiModifyOrgMembers
         * @param params
         * @param filter
         * @returns {*}
         */
        modifyMembers: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: ssoUrl + 'usr/api/modifyOrgMembers',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },
        
        /**
         * 更改机构成员信息 api: https://api.gdy.io/#w_gdy_io_dyf_uas_orgManage_orgapiUpdateAllAtrrOfOrg
         * @param params
         * @param filter
         * @returns {*}
         */
        updateOrgMembers: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: ssoUrl + 'usr/api/updateAtrrs',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        //----------------------机构相关----------------------  END

        //----------------------举报相关---------------------- BEGIN

        /**
         * 获取举报列表 api: https://api.gdy.io/#w_gdy_io_dyf_extra_extraapi
         * @param params
         * @param filter
         * @returns {*}
         */
        getReportList: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: extraUrl + 'usr/api/listInfo',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        },

        /**
         * 处理举报信息 api: https://api.gdy.io/#w_gdy_io_dyf_extra_extraapi
         * @param params
         * @param filter
         * @returns {*}
         */
        handleInfo: function (params, filter) {
            params.token = rcpAid.getToken();
            var option = {
                method: 'GET',
                url: extraUrl + 'usr/api/handleInfo',
                params: params
            };
            return request(angular.extend(option, filter || {}));
        }

        //----------------------举报相关---------------------- END
    }
}]);

module.run(['service', 'ssoMethod', function (service, ssoMethod) {
    service.expand('ssoMethod', function () {
        return ssoMethod;
    });
}]);