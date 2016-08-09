/**
 * Created by LouGaZen on 2016-05-11.
 * 模块说明：管理中心→实名认证人员详情
 * 公共组件依赖：loader-ui
 */

module.controller('mdCtrl', ['$scope', 'dialog', 'ssoMethod', '$routeParams', function ($scope, dialog, ssoMethod, $routeParams) {

    /**
     * 截取所需数据
     * @param arg_data 返回数据中data字段
     * @returns {{id: string, name: *, phoneNum: string, idCardNum: *, idCardFront: string, idCardBack: string, status: string, reason: *}}
     */
    function convertMemberData(arg_data) {
        if (arg_data.length) {
            var _check = arg_data[0].hasOwnProperty('attrs') && arg_data[0].attrs.hasOwnProperty('certification');
            return {
                id:          arg_data[0].hasOwnProperty('id') ? arg_data[0].id : '',
                name:        _check && arg_data[0].attrs.certification.hasOwnProperty('realName')    ? arg_data[0].attrs.certification.realName : '',
                phoneNum:    _check && arg_data[0].attrs.certification.hasOwnProperty('phone')       ? arg_data[0].attrs.certification.phone : '',
                idCardNum:   _check && arg_data[0].attrs.certification.hasOwnProperty('idCardNo')    ? arg_data[0].attrs.certification.idCardNo : '',
                idCardFront: _check && arg_data[0].attrs.certification.hasOwnProperty('idCardFront') ? arg_data[0].attrs.certification.idCardFront : '',
                idCardBack:  _check && arg_data[0].attrs.certification.hasOwnProperty('idCardBack')  ? arg_data[0].attrs.certification.idCardBack : '',
                status:      _check && arg_data[0].attrs.certification.hasOwnProperty('status')      ? arg_data[0].attrs.certification.status : '',
                reason:      _check && arg_data[0].attrs.certification.hasOwnProperty('reason')      ? arg_data[0].attrs.certification.reason : ''
            }
        }
    }

    if ($scope.currentUser == null || $scope.currentUser.role == '') {
        dialog.alert('请先登录管理员账号');
        return;
    }

    $scope.member = {};
    $scope.showLoading = true;

    //从url获取用户id
    var userAccount = $routeParams.account;
    if (!userAccount) {
        dialog.alert('账号不能为空');
        setTimeout("location.href = rcpAid.getUrl('审核管理', {token: rcpAid.getToken()});", 2000);
        return;
    }
    ssoMethod.GCertList({
        param: {
            usr_filter: userAccount,
            p: "1"
        }
    }).then(function (data) {
        data.data = data.data || [];
        if (data.data.length) {
            $scope.member = convertMemberData(data.data);
        } else {
            dialog.alert('账号不存在');
            setTimeout("location.href = rcpAid.getUrl('审核管理', {token: rcpAid.getToken()});", 2000);
        }
        $scope.showLoading = false;
    }, function (err) {
        $scope.showLoading = false;
        // dialog.alert('获取详细信息失败，错误编码：' + err.data.data.code + '，错误信息：' + (err.data.data.msg || err.data.data.dmsg));
        dialog.showErrorTip(err, {
            moduleName: '实名认证详情',
            funcName: 'GCertList',
            text: '获取详细信息失败'
        });
    });

    /**
     * 更新用户状态
     * @param arg_type (value range: 1 -> pass, 0 -> fail)
     * @param arg_reason (selectable when arg_type === 0)
     */
    $scope.certUpdate = function (arg_type, arg_reason) {
        arg_reason = arg_reason || null;
        if (arg_type != 1 && arg_type != 0) {
            dialog.alert('[certUpdate] invalid value of type');
            return;
        }

        angular.element('.cert-btn').addClass('btn-disabled');

        ssoMethod.UCertStatus({
            attrs: {
                certification: {
                    reason: arg_reason
                },
                pass: {
                    certification: arg_type
                }
            },
            id: $scope.member.id
        }).then(function (data) {
            if (data.code == 0) {
                angular.element('.cd-popup').removeClass('is-visible');
                dialog.alert('操作成功');
            }

            setTimeout("location.reload(true)", 2000);
        }, function (err) {
            // dialog.alert("操作失败，错误信息：" + err.data.data.code);
            // console.log(err);
            // var _msg = '';
            // switch (err.date.data.code){
            //     case 1:
            //         _msg = '参数错误';
            //         break;
            //     case 2:
            //         _msg = 'json body错误';
            //         break;
            //     default: break;
            // }
            // dialog.alert('操作失败' + (_msg == '' ? '' : ('，错误信息：' + _msg)));
            dialog.showErrorTip(err, {
                moduleName: '实名认证详情',
                funcName: 'certUpdate',
                text: '操作失败'
            });
            angular.element('.cert-btn').removeClass('btn-disabled');
        });
    };

    //dialog effect
    $scope.failClick = function () {
        angular.element('.cd-popup').addClass('is-visible');
    }

}]);