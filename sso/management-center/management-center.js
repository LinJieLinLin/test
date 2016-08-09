/**
 * Created by LouGaZen on 2016-05-06.
 */

var module = angular.module('RCP', [
        'ngCookies',
        'ngRoute',
        'LocalStorageModule'
    ])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider

        //默认路由，用于判断账户类型再跳转
            .when('/', {
                controller: 'mcIndexCtrl',
                templateUrl: 'management-center/mc-index/mc-index.html'
            })

            //实名认证
            .when('/member-approval', {
                controller: 'maCtrl',
                templateUrl: 'management-center/member-approval/member-approval.html'
            })

            //课程审核
            .when('/course-approval', {
                controller: 'caCtrl',
                templateUrl: 'management-center/course-approval/course-approval.html'
            })

            //用户审核详情
            .when('/member-detail/:account', {
                controller: 'mdCtrl',
                templateUrl: 'management-center/member-detail/member-detail.html'
            })

            //课程认证
            .when('/course-identify', {
                controller: 'ciCtrl',
                templateUrl: 'management-center/course-identify/course-identify.html'
            })

            //机构管理
            .when('/manage-organization', {
                controller: 'moCtrl',
                templateUrl: 'management-center/manage-organization/manage-organization.html'
            })

            //机构编辑
            .when('/manage-organization-edit/:type/:id', {
                controller: 'moeCtrl',
                templateUrl: 'management-center/manage-organization/manage-organization-edit.html'
            })

            //用户管理
            .when('/manage-user', {
                controller: 'muCtrl',
                templateUrl: 'management-center/manage-user/manage-user.html'
            })

            //用户编辑
            .when('/manage-user-edit/:type/:id', {
                controller: 'mueCtrl',
                templateUrl: 'management-center/manage-user/manage-user-edit.html'
            })

            //举报管理
            .when('/manage-report', {
                controller: 'mrCtrl',
                templateUrl: 'management-center/manage-report/manage-report.html'
            })
            //高校概况
            .when('/college-analyze', {
                controller: 'collegeAlyCtrl',
                templateUrl: 'management-center/manage-analyze/college-analyze.html'
            })

            //课程统计
            .when('/course-analyze', {
                controller: 'courseAlyCtrl',
                templateUrl: 'management-center/manage-analyze/course-analyze.html'
            })

            //教师统计
            .when('/teacher-analyze', {
                controller: 'teacherAlyCtrl',
                templateUrl: 'management-center/manage-analyze/teacher-analyze.html'
            })
            //首页管理
            .when('/manage-home', {
                controller: 'homeCtrl',
                templateUrl: 'management-center/manage-home/manage-home.html'
            })
            //分类管理
            .when('/manage-sort', {
                controller: 'sortCtrl',
                templateUrl: 'management-center/manage-sort/manage-sort.html'
            })

            .otherwise({
                redirectTo: '/'
            })
    }])

    .controller('mcCtrl', ['$scope', '$rootScope', '$location', 'service', function ($scope, $rootScope, $location, service) {
        var noTokenUrl = rcpAid.getNoTokenUrl();
        var temUrl = rcpAid.queryString('url');
        var regExp = {
            host: /[a-zA-z]+:\/\/[^\s\/]*/
        };
        if (!temUrl) {
            temUrl = DYCONFIG.sso.login;
        } else {
            temUrl = regExp.host.exec(temUrl);
        }
        $scope.loginUrl = rcpAid.getUrl('登录', {
            url: temUrl
        });
        $scope.exitUrl = rcpAid.getUrl('退出', {
            url: encodeURIComponent(temUrl)
        });

        //首页跳转
        $scope.url = {
            'kx': rcpAid.getUrl('酷校'),
            'akx': rcpAid.getUrl('爱科学')
        };
        //===================== 用户信息 ==========================
        $scope.userInfo = {};

        $scope.$on('login', function (rs, data) {
            if (!data) {
                //弹出登陆框
                // service.common.toLogin();
                //跳转到登陆页
                service.common.toLogin(true);
                return;
            }
            $scope.userInfo = data;
        });
        
        $scope.$watch(function () {
            return $location.path();
        }, function (value) {
            if (value) {
                $rootScope.curPath = value.replace('/', '').split('/')[0];
            }
        });

        $scope.tabList = [];

        //配置左侧导航栏
        if ($rootScope.currentUser.role != '') {
            //平台管理员
            $scope.tabList = [
                {
                    title: '认证管理',
                    css: 'image-mgmt-cert',
                    list: [
                        {
                            name: '实名认证',
                            url: 'member-approval',
                            active: {
                                'member-approval': true,
                                'member-detail': true
                            }
                        }
                    ]
                },
                {
                    title: '审核管理',
                    css: 'image-mgmt-aprv',
                    list: [
                        {
                            name: '课程审核',
                            url: 'course-approval',
                            active: {
                                'course-approval': true
                            }
                        }
                    ]
                },
                {
                    title: '账号管理',
                    css: 'image-mgmt-user',
                    list: [
                        {
                            name: '机构管理',
                            url: 'manage-organization',
                            active: {
                                'manage-organization': true,
                                'manage-organization-edit': true
                            }
                        }
                    ]
                },
                {

                    title: '举报管理',
                    css: 'image-mgmt-rpt',
                    list: [
                        {
                            name: '举报管理',
                            url: 'manage-report',
                            active: {
                                'manage-report': true
                            }
                        }
                    ]
                },
                {
                    title: '学情统计',
                    css: 'image-mgmt-analyze',
                    list: [
                        {
                            name: '高校概况',
                            url: 'college-analyze',
                            active: {
                                'college-analyze': true,
                                'course-analyze': false,
                                'teacher-analyze': false
                            }
                        },
                        {
                            name: '课程统计',
                            url: 'course-analyze',
                            active: {
                                'college-analyze': false,
                                'course-analyze': true,
                                'teacher-analyze': false
                            }
                        },
                        {
                            name: '教师统计',
                            url: 'teacher-analyze',
                            active: {
                                'college-analyze': false,
                                'course-analyze': false,
                                'teacher-analyze': true
                            }
                        }
                    ]
                },
                {
                    title: '内容管理',
                    css: 'image-mgmt-appm',
                    list: [
                        {
                            name: '首页管理',
                            url: 'manage-home',
                            active: {
                                'manage-home': true,
                                'manage-sort': false
                            }
                        },
                        {
                            name: '分类管理',
                            url: 'manage-sort',
                            active: {
                                'manage-home': false,
                                'manage-sort': true
                            }
                        }
                    ]
                }
            ];
        } else if ($rootScope.currentUser.org != '') {
            //机构管理员
            $scope.tabList = [
                {
                    title: '认证管理',
                    css: 'image-mgmt-cert',
                    list: [
                        {
                            name: '课程认证',
                            url: 'course-identify',
                            active: {
                                'course-identify': true
                            }
                        }
                    ]
                },
                {
                    title: '账号管理',
                    css: 'image-mgmt-user',
                    list: [
                        {
                            name: '用户管理',
                            url: 'manage-user',
                            active: {
                                'manage-user': true,
                                'manage-user-edit': true
                            }
                        }
                    ]
                }
            ]
        }
    }]);