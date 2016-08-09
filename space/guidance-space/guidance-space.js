var module = angular.module('RCP', [
    'ngCookies'
]);

module.controller('guidanceSpaceCtr', ['$scope', 'service', function ($scope, service) {
    //===================== 头部 ===========================
    $scope.userAvatar = '../rcp-common/imgs/face/d-face-1.png';

    //未读消息数
    $scope.unReadNum = function () {
        return 10;
    };

    $scope.$on('login', function (rs, data) {
        if (!data) {
            //弹出登陆框
            // service.common.toLogin();
            //跳转到登陆页
            service.common.toLogin(true);
            return;
        }
        $scope.userAvatar = data.avatar || $scope.userAvatar;
    });

    //====================== 用户列表 ========================
    $scope.userList = [
        {type: 0, avatar: '../rcp-common/imgs/face/d-face-1.png', nickName: 'test user name', unread: 100, msgList: [
            {type: 0, message: '这是消息，这是消息，这是消息，重要的是说三遍', time: '10:32'}
        ]},
        {type: 1, avatar: '../rcp-common/imgs/face/d-face-1.png', nickName: 'test user name', unread: 100, msgList: [
            {type: 1, message: '这是消息，这是消息，这是消息，重要的是说三遍', time: '昨天'}
        ]},
        {type: 1, avatar: '../rcp-common/imgs/face/d-face-1.png', nickName: 'test user name', unread: 99, msgList: [
            {type: 1, message: '这是消息，这是消息，这是消息，重要的是说三遍', time: '昨天'}
        ]},
        {type: 1, avatar: '../rcp-common/imgs/face/d-face-1.png', nickName: 'test user name', unread: 98, msgList: [
            {type: 1, message: '这是消息，这是消息，这是消息，重要的是说三遍', time: '昨天'}
        ]},
        {type: 0, avatar: '../rcp-common/imgs/face/d-face-1.png', nickName: 'test user name', unread: 9, msgList: [
            {type: 1, message: '这是消息，这是消息，这是消息，重要的是说三遍', time: '昨天'}
        ]},
        {type: 0, avatar: '../rcp-common/imgs/face/d-face-1.png', nickName: 'test user name', unread: 1, msgList: [
            {type: 1, message: '这是消息，这是消息，这是消息，重要的是说三遍', time: '昨天'}
        ]},
        {type: 0, avatar: '../rcp-common/imgs/face/d-face-1.png', nickName: 'test user name', unread: 100, msgList: [
            {type: 1, message: '这是消息，这是消息，这是消息，重要的是说三遍', time: '昨天'}
        ]},
        {type: 0, avatar: '../rcp-common/imgs/face/d-face-1.png', nickName: 'test user name', unread: 100, msgList: [
            {type: 1, message: '这是消息，这是消息，这是消息，重要的是说三遍', time: '昨天'}
        ]},
        {type: 0, avatar: '../rcp-common/imgs/face/d-face-1.png', nickName: 'test user name', unread: 100, msgList: [
            {type: 1, message: '这是消息，这是消息，这是消息，重要的是说三遍', time: '昨天'}
        ]},
        {type: 0, avatar: '../rcp-common/imgs/face/d-face-1.png', nickName: 'test user name', unread: 100, msgList: [
            {type: 1, message: '这是消息，这是消息，这是消息，重要的是说三遍', time: '昨天'}
        ]},
        {type: 0, avatar: '../rcp-common/imgs/face/d-face-1.png', nickName: 'test user name', unread: 100, msgList: [
            {type: 1, message: '这是消息，这是消息，这是消息，重要的是说三遍', time: '昨天'}
        ]},
        {type: 0, avatar: '../rcp-common/imgs/face/d-face-1.png', nickName: 'test user name', unread: 100, msgList: [
            {type: 1, message: '这是消息，这是消息，这是消息，重要的是说三遍', time: '昨天'}
        ]},
        {type: 0, avatar: '../rcp-common/imgs/face/d-face-1.png', nickName: 'test user name', unread: 100, msgList: [
            {type: 1, message: '这是消息，这是消息，这是消息，重要的是说三遍', time: '昨天'}
        ]},
        {type: 0, avatar: '../rcp-common/imgs/face/d-face-1.png', nickName: 'test user name', unread: 100, msgList: [
            {type: 1, message: '这是消息，这是消息，这是消息，重要的是说三遍', time: '昨天'}
        ]},
        {type: 0, avatar: '../rcp-common/imgs/face/d-face-1.png', nickName: 'test user name', unread: 100, msgList: [
            {type: 1, message: '这是消息，这是消息，这是消息，重要的是说三遍', time: '昨天'}
        ]},
        {type: 0, avatar: '../rcp-common/imgs/face/d-face-1.png', nickName: 'test user name', unread: 100, msgList: [
            {type: 1, message: '这是消息，这是消息，这是消息，重要的是说三遍', time: '昨天'}
        ]},
        {type: 0, avatar: '../rcp-common/imgs/face/d-face-1.png', nickName: 'test user name', unread: 100, msgList: [
            {type: 1, message: '这是消息，这是消息，这是消息，重要的是说三遍', time: '昨天'}
        ]},
        {type: 0, avatar: '../rcp-common/imgs/face/d-face-1.png', nickName: 'test user name', unread: 100, msgList: [
            {type: 1, message: '这是消息，这是消息，这是消息，重要的是说三遍', time: '昨天'}
        ]},
        {type: 0, avatar: '../rcp-common/imgs/face/d-face-1.png', nickName: 'test user name', unread: 100, msgList: [
            {type: 1, message: '这是消息，这是消息，这是消息，重要的是说三遍', time: '昨天'}
        ]},
        {type: 0, avatar: '../rcp-common/imgs/face/d-face-1.png', nickName: 'test user name', unread: 100, msgList: [
            {type: 1, message: '这是消息，这是消息，这是消息，重要的是说三遍', time: '昨天'}
        ]},
        {type: 0, avatar: '../rcp-common/imgs/face/d-face-1.png', nickName: 'test user name', unread: 100, msgList: [
            {type: 1, message: '这是消息，这是消息，这是消息，重要的是说三遍', time: '昨天'}
        ]},
        {type: 0, avatar: '../rcp-common/imgs/face/d-face-1.png', nickName: 'test user name', unread: 100, msgList: [
            {type: 1, message: '这是消息，这是消息，这是消息，重要的是说三遍', time: '昨天'}
        ]},

    ];

    //======================= 即时通讯 ======================
    $scope.chatUser = {
        type: 0,
        avatar: '../rcp-common/imgs/face/d-face-1.png',
        nickName: 'test user name',
        unread: 100,
        address: '广东省广州市',
        msgList: [
            {type: 0, message: '这是消息，这是消息，这是消息，重要的是说三遍', time: '10:32'}
        ]
    };

    //======================= 最右边的导航栏 ======================
    $scope.currentTab = 'browse';

    //======================== 搜索记录 ============================
    $scope.searchLoaded = true;

    $scope.searchList = [
        {keyword: '搜索记录', tags: ['分类1', '分类2'], time: 30, price: 40},
        {keyword: '搜索记录', tags: ['分类1', '分类2'], time: 30, price: 40},
        {keyword: '搜索记录', tags: ['分类1', '分类2'], time: 30, price: 40},
        {keyword: '搜索记录', tags: ['分类1', '分类2'], time: 30, price: 40},
        {keyword: '搜索记录', tags: ['分类1', '分类2'], time: 30, price: 40},
        {keyword: '搜索记录', tags: ['分类1', '分类2'], time: 30, price: 40},
        {keyword: '搜索记录', tags: ['分类1', '分类2'], time: 30, price: 40},
        {keyword: '搜索记录', tags: ['分类1', '分类2'], time: 30, price: 40},
        {keyword: '搜索记录', tags: ['分类1', '分类2'], time: 30, price: 40},
        {keyword: '搜索记录', tags: ['分类1', '分类2'], time: 30, price: 40},
        {keyword: '搜索记录', tags: ['分类1', '分类2'], time: 30, price: 40},
        {keyword: '搜索记录', tags: ['分类1', '分类2'], time: 30, price: 40},
        {keyword: '搜索记录', tags: ['分类1', '分类2'], time: 30, price: 40},
        {keyword: '搜索记录', tags: ['分类1', '分类2'], time: 30, price: 40},
        {keyword: '搜索记录', tags: ['分类1', '分类2'], time: 30, price: 40},
        {keyword: '搜索记录', tags: ['分类1', '分类2'], time: 30, price: 40},
        {keyword: '搜索记录', tags: ['分类1', '分类2'], time: 30, price: 40},
        {keyword: '搜索记录', tags: ['分类1', '分类2'], time: 30, price: 40},
        {keyword: '搜索记录', tags: ['分类1', '分类2'], time: 30, price: 40},
        {keyword: '搜索记录', tags: ['分类1', '分类2'], time: 30, price: 40},
    ];

    //======================== 浏览记录 ============================
    $scope.browseLoaded = true;

    $scope.visitList = [
        {imgUrl: '', title: '花都测试', author: '谢老师', price: 0, service: '', category: '', visitTime: 200, stayTime: 300},
        {imgUrl: '', title: '花都测试花都测试花都花都测试花都测试花都测试测试', author: '谢老师', price: 10, service: ['一宗','二中'], category: '', visitTime: 200, stayTime: 300},
        {imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '花都测试花都测试花都测试', author: '谢老师', price: 10, service: ['一宗','二中'], category: '', visitTime: 200, stayTime: 300},
        {imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '花都测试花都测试花都测试', author: '谢老师', price: 10, service: ['一宗','二中'], category: '', visitTime: 200, stayTime: 300},
        {imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '花都测试花都测试花都测试', author: '谢老师', price: 10, service: ['一宗','二中'], category: '', visitTime: 200, stayTime: 300},
        {imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '花都测试花都测试花都测试', author: '谢老师', price: 10, service: ['一宗','二中'], category: '', visitTime: 200, stayTime: 300},
        {imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '花都测试花都测试花都测试', author: '谢老师', price: 10, service: ['一宗','二中'], category: '', visitTime: 200, stayTime: 300},
        {imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '花都测试花都测试花都测试', author: '谢老师', price: 10, service: ['一宗','二中'], category: '', visitTime: 200, stayTime: 300},
        {imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '花都测试花都测试花都测试', author: '谢老师', price: 10, service: ['一宗','二中'], category: '', visitTime: 200, stayTime: 300},
        {imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '花都测试花都测试花都测试', author: '谢老师', price: 10, service: ['一宗','二中'], category: '', visitTime: 200, stayTime: 300},
        {imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '花都测试花都测试花都测试', author: '谢老师', price: 10, service: ['一宗','二中'], category: '', visitTime: 200, stayTime: 300},
        {imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '花都测试花都测试花都测试', author: '谢老师', price: 10, service: ['一宗','二中'], category: '', visitTime: 200, stayTime: 300},
        {imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '花都测试花都测试花都测试', author: '谢老师', price: 10, service: ['一宗','二中'], category: '', visitTime: 200, stayTime: 300},
        {imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '花都测试花都测试花都测试', author: '谢老师', price: 10, service: ['一宗','二中'], category: '', visitTime: 200, stayTime: 300},
        {imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '花都测试花都测试花都测试', author: '谢老师', price: 10, service: ['一宗','二中'], category: '', visitTime: 200, stayTime: 300},
        {imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '花都测试花都测试花都测试', author: '谢老师', price: 10, service: ['一宗','二中'], category: '', visitTime: 200, stayTime: 300},
        {imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '花都测试花都测试花都测试', author: '谢老师', price: 10, service: ['一宗','二中'], category: '', visitTime: 200, stayTime: 300},
        {imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '花都测试花都测试花都测试', author: '谢老师', price: 10, service: ['一宗','二中'], category: '', visitTime: 200, stayTime: 300},
        {imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '花都测试花都测试花都测试', author: '谢老师', price: 10, service: ['一宗','二中'], category: '', visitTime: 200, stayTime: 300},
        {imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '花都测试花都测试花都测试', author: '谢老师', price: 10, service: ['一宗','二中'], category: '', visitTime: 200, stayTime: 300},
        {imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '花都测试花都测试花都测试', author: '谢老师', price: 10, service: ['一宗','二中'], category: '', visitTime: 200, stayTime: 300},
        {imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '花都测试花都测试花都测试', author: '谢老师', price: 10, service: ['一宗','二中'], category: '', visitTime: 200, stayTime: 300},
        {imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '花都测试花都测试花都测试', author: '谢老师', price: 10, service: ['一宗','二中'], category: '', visitTime: 200, stayTime: 300},
    ];

    //========================== 当前咨询课程 =========================
    $scope.curCourseLoaded = true;

    $scope.curCourse = {
        cid: 1,
        detailUrl: '/course/course-detail.html?cid=57319644bc9a34663b579645',
        imgUrl: '',
        title: '人教版小学一年级语文课程',
        author: '谢老师',
        price: 0,
        join: 20,
        category: ['职业教育', 'IT互联网', '后端开发', '服务器开发'],
        service: ['职业教育', 'IT互联网', '后端开发', '服务器开发'],
        teachers: [{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'}, {
            avatar: 'http://fs.dev.gdy.io/YX6j2t==',
            name: '我是老师'
        }, {avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'}]
    };

    //=========================== 猜TA喜欢 =========================
    $scope.guessLoaded = true;

    $scope.guessList = [
        {detailUrl: '/course/course-detail.html?cid=57319644bc9a34663b579645', imgUrl: '', title: '人教版小学一年级语文课程', author: '谢老师', price: 0, join: 20, category: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], service: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], teachers: [{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'}]},
        {detailUrl: '/course/course-detail.html?cid=57319644bc9a34663b579645', imgUrl: '', title: '人教版小学一年级语文课程', author: '谢老师', price: 0, join: 20, category: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], service: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], teachers: [{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'}]},
        {detailUrl: '/course/course-detail.html?cid=57319644bc9a34663b579645', imgUrl: '', title: '人教版小学一年级语文课程', author: '谢老师', price: 0, join: 20, category: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], service: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], teachers: [{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'}]},
        {detailUrl: '/course/course-detail.html?cid=57319644bc9a34663b579645', imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '人教版小学一年级语文课程', author: '谢老师', price: 0, join: 20, category: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], service: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], teachers: [{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'}]},
        {detailUrl: '/course/course-detail.html?cid=57319644bc9a34663b579645', imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '人教版小学一年级语文课程', author: '谢老师', price: 0, join: 20, category: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], service: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], teachers: [{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'}]},
        {detailUrl: '/course/course-detail.html?cid=57319644bc9a34663b579645', imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '人教版小学一年级语文课程', author: '谢老师', price: 0, join: 20, category: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], service: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], teachers: [{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'}]},
        {detailUrl: '/course/course-detail.html?cid=57319644bc9a34663b579645', imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '人教版小学一年级语文课程', author: '谢老师', price: 0, join: 20, category: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], service: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], teachers: [{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'}]},
        {detailUrl: '/course/course-detail.html?cid=57319644bc9a34663b579645', imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '人教版小学一年级语文课程', author: '谢老师', price: 0, join: 20, category: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], service: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], teachers: [{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'}]},
        {detailUrl: '/course/course-detail.html?cid=57319644bc9a34663b579645', imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '人教版小学一年级语文课程', author: '谢老师', price: 0, join: 20, category: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], service: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], teachers: [{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'}]},
        {detailUrl: '/course/course-detail.html?cid=57319644bc9a34663b579645', imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '人教版小学一年级语文课程', author: '谢老师', price: 0, join: 20, category: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], service: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], teachers: [{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'}]},
        {detailUrl: '/course/course-detail.html?cid=57319644bc9a34663b579645', imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '人教版小学一年级语文课程', author: '谢老师', price: 0, join: 20, category: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], service: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], teachers: [{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'}]},
        {detailUrl: '/course/course-detail.html?cid=57319644bc9a34663b579645', imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '人教版小学一年级语文课程', author: '谢老师', price: 0, join: 20, category: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], service: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], teachers: [{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'}]},
        {detailUrl: '/course/course-detail.html?cid=57319644bc9a34663b579645', imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '人教版小学一年级语文课程', author: '谢老师', price: 0, join: 20, category: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], service: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], teachers: [{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'}]},
        {detailUrl: '/course/course-detail.html?cid=57319644bc9a34663b579645', imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '人教版小学一年级语文课程', author: '谢老师', price: 0, join: 20, category: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], service: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], teachers: [{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'}]},
        {detailUrl: '/course/course-detail.html?cid=57319644bc9a34663b579645', imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '人教版小学一年级语文课程', author: '谢老师', price: 0, join: 20, category: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], service: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], teachers: [{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'}]},
        {detailUrl: '/course/course-detail.html?cid=57319644bc9a34663b579645', imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '人教版小学一年级语文课程', author: '谢老师', price: 0, join: 20, category: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], service: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], teachers: [{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'}]},
        {detailUrl: '/course/course-detail.html?cid=57319644bc9a34663b579645', imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '人教版小学一年级语文课程', author: '谢老师', price: 0, join: 20, category: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], service: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], teachers: [{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'}]},
        {detailUrl: '/course/course-detail.html?cid=57319644bc9a34663b579645', imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '人教版小学一年级语文课程', author: '谢老师', price: 0, join: 20, category: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], service: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], teachers: [{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'}]},
        {detailUrl: '/course/course-detail.html?cid=57319644bc9a34663b579645', imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '人教版小学一年级语文课程', author: '谢老师', price: 0, join: 20, category: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], service: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], teachers: [{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'}]},
        {detailUrl: '/course/course-detail.html?cid=57319644bc9a34663b579645', imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '人教版小学一年级语文课程', author: '谢老师', price: 0, join: 20, category: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], service: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], teachers: [{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'}]},
        {detailUrl: '/course/course-detail.html?cid=57319644bc9a34663b579645', imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '人教版小学一年级语文课程', author: '谢老师', price: 0, join: 20, category: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], service: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], teachers: [{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'}]},
        {detailUrl: '/course/course-detail.html?cid=57319644bc9a34663b579645', imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '人教版小学一年级语文课程', author: '谢老师', price: 0, join: 20, category: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], service: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], teachers: [{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'}]},
        {detailUrl: '/course/course-detail.html?cid=57319644bc9a34663b579645', imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '人教版小学一年级语文课程', author: '谢老师', price: 0, join: 20, category: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], service: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], teachers: [{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'}]},
        {detailUrl: '/course/course-detail.html?cid=57319644bc9a34663b579645', imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '人教版小学一年级语文课程', author: '谢老师', price: 0, join: 20, category: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], service: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], teachers: [{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'}]},
        {detailUrl: '/course/course-detail.html?cid=57319644bc9a34663b579645', imgUrl: 'http://fs.dev.gdy.io/6Es3dt==', title: '人教版小学一年级语文课程', author: '谢老师', price: 0, join: 20, category: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], service: ['职业教育', 'IT互联网', '后端开发', '服务器开发'], teachers: [{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'},{avatar: 'http://fs.dev.gdy.io/YX6j2t==', name: '我是老师'}]},
    ];
}]);