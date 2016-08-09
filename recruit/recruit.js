var module = angular.module("RCP", [
    'ngRoute',
    'ngCookies',
    'ngSanitize',
    'LocalStorageModule'
]);
module.filter("sanitize", ['$sce', function($sce) {
    return function(htmlCode) {
        return $sce.trustAsHtml(htmlCode);
    };
}]);
module.controller('recruitCtrl', ['$scope', function($scope) {
    $('body').show();
    $scope.type = 0;
    $scope.email = '广州大洋信息技术股份有限公司（fanff@itdayang.com）';
    $scope.filterName = { type: '' };
    $scope.works = [{
        name: '产品经理',
        money: '9k-15k',
        style: {
            background: 'url(/imgs/recruit/i-0.png) 50% 100% no-repeat rgb(97,187,196)',
        },
        num: 1,
        resume: '广州 经验2-3年 本科及以上 全职',
        describe: '<p style="font-size:14px;font-family:宋体;color:#777777;argin-left: 36px;line-height: 21px"><span style="font-size:14px;font-family:宋体;color:#777777;background: #FAFAFA">职位描述：</span></p><p style="margin-left: 36px;line-height: 21px"><span style="font-size:14px;font-family:宋体;color:#777777;background:#FAFAFA">1</span><span style="font-size:14px;font-family:宋体;color:#777777;background:#FAFAFA">、负责产品模块需求的调研、收集、分析、跟进和整理，完善和维护产品原型设计，给出产品模块业务主流程用例和分支流程用例；</span></p><p style="margin-left: 36px;line-height: 21px"><span style="font-size:14px;font-family:宋体;color:#777777;background:#FAFAFA">2</span><span style="font-size:14px;font-family:宋体;color:#777777;background:#FAFAFA">、负责同行产品的差异分析与研究，整理、归纳和更新产品设计；</span></p><p style="margin-left: 36px;line-height: 21px"><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777;background:#FAFAFA">3</span><span style="font-size:14px;font-family:宋体;color:#777777;background:#FAFAFA">、根据产品原型安排、组织评审产品模块的界面</span><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777;background:#FAFAFA">UI</span><span style="font-size:14px;font-family:宋体;color:#777777;background:#FAFAFA">设计；</span></p><p style="margin-left: 36px;line-height: 21px"><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777;background:#FAFAFA">4</span><span style="font-size:14px;font-family:宋体;color:#777777;background:#FAFAFA">、根据产品需求落实产品模块的开发，管控开发进度，负责产品的版本迭代发布，以及收集、反馈产品对外运营情况；</span></p><p style="margin-left: 36px;line-height: 21px"><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777;background:#FAFAFA">5</span><span style="font-size:14px;font-family:宋体;color:#777777;background:#FAFAFA">、组织、安排、编写产品需求规格说明书、产品方案、产品使用说明书、产品宣传方案等文档资料。</span></p><p style="margin-left: 36px;line-height: 21px"><span style="font-size:14px;font-family:宋体;color:#777777">&nbsp;</span></p><p style="margin-left: 36px;line-height: 21px"><span style="font-size:14px;font-family:宋体;color:#777777;background: #FAFAFA">任职要求：</span></p><p style="margin-left: 36px;line-height: 21px"><span style="font-size:14px;font-family:宋体;color:#777777;background:#FAFAFA">1</span><span style="font-size:14px;font-family:宋体;color:#777777;background:#FAFAFA">、有2年以上产品工作经验，优先考虑从事过教育行业产品经验者；</span></p><p style="margin-left: 36px;line-height: 21px"><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777;background:#FAFAFA">2</span><span style="font-size:14px;font-family:宋体;color:#777777;background:#FAFAFA">、能够合理的判断需求，有引导力和控制力，善于沟通、表达，有良好的文字表达能力；</span></p><p style="margin-left: 36px;line-height: 21px"><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777;background:#FAFAFA">3</span><span style="font-size:14px;font-family:宋体;color:#777777;background:#FAFAFA">、熟练使用Office系列办公软件和Visio、Axure等产品原型设计软件。</span></p><p style="margin-left: 36px;line-height: 21px"><span style="font-size:14px;font-family:宋体;color:#777777">&nbsp;</span></p><p style="margin-left: 36px;line-height: 21px"><span style="font-size:14px;font-family:宋体;color:#777777;background: #FAFAFA">备注：为了节省你的时间，投递简历时请上传个人作品，以便于我们能更好的了解你的能力。</span></p><p><br/></p>',
        viewStyle: false,
        type: '产品',
    }, {
        name: '项目经理',
        money: '8K-10K',
        style: {
            background: 'url(/imgs/recruit/i-1.png) 50% 100% no-repeat rgb(221, 88, 119)',
        },
        num: 1,
        resume: '广州/经验1-3年/本科及以上/全职',
        describe: '<div style="font-size:14px;font-family:宋体;color:#777777;"><p>岗位职责：</p><p>1、负责公司项目售前技术支持；</p><p>2、负责对技术方案的评审，组织投标书的准备、制作、讲解及用户答疑等工作</p><p>3、支持销售部门完成用户需求方案（含招标、控标）</p><p>4、完成项目的调试与技术支持类工作</p><p>5、监督审查客户经理报价成本</p><p>6、公司资质方面维护、申报、换证等</p><p>任职要求：</p><p>1、本科以上，计算机、信息工程、通信及相关专业，具备中级、高级项目经理证书者优先；</p><p>2、从事IT技术岗位1年以上，有系统集成技术经验者优先；</p><p>3、熟悉系统集成、软件等招投标流程；</p><p>4、了解多种大型网络架构平台；</p><p>5、掌握数据、语音及视频等方面的技术知识，并能够把握相关技术的发展动向；</p><p>6、具有小型机、各种档次服务器、存储、交换、路由等设备的调试经验；</p><p>7、熟知各种软件；有数据分析及挖掘工具（如SAS）等产品经验；</p></div>',
        viewStyle: false,
        type: '项目',
    }, {
        name: 'Android开发工程师',
        money: '8k-15k',
        style: {
            background: 'url(/imgs/recruit/i-2.png) 50% 100% no-repeat rgb(153,199, 55)',
        },
        num: 1,
        resume: '广州/经验1-3年/大专及以上/全职',
        describe: '<p style="margin: 9px 0 20px 36px"><span style="font-family:宋体;color:#555555">职位描述</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">岗位职责：</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">1</span><span style="font-size:14px;font-family:宋体;color:#777777">、负责开发和维护产品Android客户端；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">2</span><span style="font-size:14px;font-family:宋体;color:#777777">、负责客户端版本的系统设计、改进、性能调优、设备适配等工作；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">3</span><span style="font-size:14px;font-family:宋体;color:#777777">、理解产品需求，根据产品模块业务流程用例保质保量完成开发任务，给出开发规划；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">4</span><span style="font-size:14px;font-family:宋体;color:#777777">、负责APP产品的用户体验改善及更新，解决在产品使用中遇到的各种问题，并进行总结与改进。</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">&nbsp;</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">&nbsp;</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">岗位要求：</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">1</span><span style="font-size:14px;font-family:宋体;color:#777777">、有</span><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">1</span><span style="font-size:14px;font-family:宋体;color:#777777">年以上</span><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">Android</span><span style="font-size:14px;font-family:宋体;color:#777777">平台开发经验；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">2</span><span style="font-size:14px;font-family:宋体;color:#777777">、完整完成过Andriod平台手机应用软件开发，熟悉手机客户端应用软件的开发流程；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">3</span><span style="font-size:14px;font-family:宋体;color:#777777">、了解移动网络特点及相关协议，有手机终端软件设计和架构能力；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">4</span><span style="font-size:14px;font-family:宋体;color:#777777">、JAVA基础扎实，精通常用数据结构与算法，熟练Android UI框架及相关开发工具；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">5</span><span style="font-size:14px;font-family:宋体;color:#777777">、了解多设备适配的解决方案；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">6</span><span style="font-size:14px;font-family:宋体;color:#777777">、责任心强，具备良好的沟通和团队协作能力。</span></p><p><br/></p>',
        viewStyle: false,
        type: '技术',
    }, {
        name: 'iOS开发工程师',
        money: '8k-15k',
        style: {
            background: 'url(/imgs/recruit/i-3.png) 50% 100% no-repeat rgb(249, 180, 77)',
        },
        num: 1,
        resume: '广州/经验1-3年/大专及以上/全职',
        describe: '<p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">岗位职责：</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">1</span><span style="font-size:14px;font-family:宋体;color:#777777">、负责开发和维护产品IOS客户端；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">2</span><span style="font-size:14px;font-family:宋体;color:#777777">、负责客户端版本的系统设计、改进、性能调优、设备适配等工作；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">3</span><span style="font-size:14px;font-family:宋体;color:#777777">、理解产品需求，根据产品模块业务流程用例保质保量完成开发任务，给出开发规划；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">4</span><span style="font-size:14px;font-family:宋体;color:#777777">、负责APP产品的用户体验改善及更新，解决在产品使用中遇到的各种问题，并进行总结与改进。</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">&nbsp;</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">岗位要求：</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">1</span><span style="font-size:14px;font-family:宋体;color:#777777">、有1年以上的IOS开发经验；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">2</span><span style="font-size:14px;font-family:宋体;color:#777777">、完整完成过IOS平台手机应用软件开发，熟悉手机客户端应用软件的开发流程；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">3</span><span style="font-size:14px;font-family:宋体;color:#777777">、熟悉object-c或c++,熟悉面向对象的程序设计方法；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">4</span><span style="font-size:14px;font-family:宋体;color:#777777">、熟悉Linux编程，TCP/IP和无线通讯协议，有手机终端软件设计和架构能力；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">5</span><span style="font-size:14px;font-family:宋体;color:#777777">、有AppStore上架作品者优先考虑；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">6</span><span style="font-size:14px;font-family:宋体;color:#777777">、责任心强，具备良好的沟通和团队协作能力。</span></p><p><br/></p>',
        viewStyle: false,
        type: '技术',
    }, {
        name: '教育服务运营经理',
        money: '10K-15K',
        style: {
            background: 'url(/imgs/recruit/i-4.png) 50% 100% no-repeat rgb(67, 202, 162)',
        },
        num: 1,
        resume: '广州/经验1-3年/本科及以上/全职',
        describe: '<div style="font-size:14px;font-family:宋体;color:#777777;"><p>岗位职责：</p><p>1.负责公司教育软件产品的整体运营工作，规避网站发展风险、制定网站战略规划及长短期运营目标；</p><p>2.线下组织教育资源（优质课程）；</p><p>3.分析把握市场和用户需求，并针对市场的变化制定和调整后续运营计划；</p><p>4.建设网站运营团队，优化网站运营流程，完善网站客服体制；</p><p>5.负责业内相关产品监制，竞争对手分析。</p><p>岗位要求：</p><p>1.市场营销管理或教育类相关专业本科及以上学历；</p><p>2.2年以上运营、项目管理工作经验，有较强的数据分析能力；</p><p>3.丰富的市场运营、策划推广、人员组织的实践经验和业绩；</p><p>4.良好的团队合作精神和沟通协调能力。</p></div>',
        viewStyle: false,
        type: '运营',
    }, {
        name: '运营经理',
        money: '10K-15K',
        style: {
            background: 'url(/imgs/recruit/i-5.png) 50% 100% no-repeat rgb(10, 110, 144)',
        },
        num: 1,
        resume: '广州/经验1-3年/本科及以上/全职',
        describe: '<div style="font-size:14px;font-family:宋体;color:#777777;"><p>岗位职责：</p><p>1.负责网站产品策划，功能测试，并及时提出需求方案及运营策略建议；</p><p>2.跟住业务部门及用户需求，提出有限解决方案并协助发部门进行产品开发；</p><p>3.收集行业及竞争对手动态，协助确定产品发展目标及策略，改善平台展示结构；</p><p>4.对网站架构认识清晰，对网站运营理解深入，具有较强的网站整体功能策划能力；</p><p>5.统计网站各项数据和反馈，搜集运营中购买及功能需求，综合各部门的意见制订方案；</p><p>6.协调研发部门确保平台功能实现。</p><p><br></p><p>岗位要求：</p><p>1.大专以上学历，2年以上互联网产品从业经验，熟悉教育互联网产品策划者优秀；</p><p>2.对电子商务市场和行业敏锐、思维活跃、思路清晰，有较高的逻辑分析和理解能力；</p><p>3.熟悉互联网产品策划、活动营销的实施，熟练掌握各种策划类软件的使用；</p><p>4.良好的用户感和运营数据分析能力；</p><p>5.良好的沟通技巧，能和其他部门同时高效及顺畅沟通；</p><p>6.较强的执行力，能承受一定压力并高效工作，了解教育行业优先。</p></div>',
        viewStyle: false,
        type: '运营',
    }, {
        name: '运维工程师',
        money: '8k-20k',
        style: {
            background: 'url(/imgs/recruit/i-6.png) 50% 100% no-repeat rgb(105, 128, 162)',
        },
        num: 1,
        resume: '广州/经验2年以上/大专及以上/全职',
        describe: '<p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">岗位职责： &nbsp;&nbsp;</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">1</span><span style="font-size:14px;font-family:宋体;color:#777777">、协助完成IT系统基础架构的设计规划； &nbsp;&nbsp;</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">2</span><span style="font-size:14px;font-family:宋体;color:#777777">、负责系统硬件架构(服务器以及附属设备)的实施部署工作； &nbsp;</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">3</span><span style="font-size:14px;font-family:宋体;color:#777777">、负责Windows、Linux以及Unix服务器系统的日常运维工作； &nbsp;</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">4</span><span style="font-size:14px;font-family:宋体;color:#777777">、负责数据库(包括但不仅限于Oracle、MS SQL Server)的日常运维； &nbsp;</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">5</span><span style="font-size:14px;font-family:宋体;color:#777777">、承担机房的运维工作； &nbsp;</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">6</span><span style="font-size:14px;font-family:宋体;color:#777777">、负责备份系统的日常维护；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">7</span><span style="font-size:14px;font-family:宋体;color:#777777">、负责监控运营产品服务器的状态，处理异常情况；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">8</span><span style="font-size:14px;font-family:宋体;color:#777777">、负责运营产品的部署和版本升级。</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">&nbsp;</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">任职要求：</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">1</span><span style="font-size:14px;font-family:宋体;color:#777777">、有</span><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">2</span><span style="font-size:14px;font-family:宋体;color:#777777">年以上的运维工作经验，男女不限，大专以上学历，计算机专业；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">2</span><span style="font-size:14px;font-family:宋体;color:#777777">、学习能力强，有责任心；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">3</span><span style="font-size:14px;font-family:宋体;color:#777777">、熟练掌握Windows、Unix以及Linux操作系统的安装、操作和维护；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">4</span><span style="font-size:14px;font-family:宋体;color:#777777">、对Nginx、Apache、IIS、Tomcat、MySQL等有一定的维护经验；&nbsp;</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">5</span><span style="font-size:14px;font-family:宋体;color:#777777">、了解网络安全及相关服务器配置； &nbsp;</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">6</span><span style="font-size:14px;font-family:宋体;color:#777777">、有主流大型数据库的实际维护经验； &nbsp;</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">7</span><span style="font-size:14px;font-family:宋体;color:#777777">、能积极协调各供应商提供服务保障。</span></p><p><br/></p>',
        viewStyle: false,
        type: '技术',
    }, {
        name: '测试工程师',
        money: '5k-10k',
        style: {
            background: 'url(/imgs/recruit/i-7.png) 50% 100% no-repeat rgb(142,127, 117)',
        },
        num: 1,
        resume: '广州/经验1年以下/大专及以上/全职',
        describe: '<p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">工作职责：</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">1</span><span style="font-size:14px;font-family:宋体;color:#777777">、配合产品经理，负责产品模块的功能测试；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">2</span><span style="font-size:14px;font-family:宋体;color:#777777">、配合产品迭代发布，做好回归测试、兼容性测试，记录问题，汇报测试结果；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">3</span><span style="font-size:14px;font-family:宋体;color:#777777">、负责监控产品每日的稳定性，记录问题，及时反馈给运维组；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">4</span><span style="font-size:14px;font-family:宋体;color:#777777">、根据产品业务流程用例，对产品做压力测试、稳定性测试，记录问题，汇报测试结果。</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">&nbsp;</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">任职要求：</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">1</span><span style="font-size:14px;font-family:宋体;color:#777777">、</span><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">1</span><span style="font-size:14px;font-family:宋体;color:#777777">年以上测试开发经验，大专以上学历，计算机相关专业毕业；</span></p><p style="margin-left: 36px;line-height: 21px"><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">2</span><span style="font-size:14px;font-family:宋体;color:#777777">、熟悉iOS及Android系统的常规应用；</span></p><p style="margin-left: 36px;line-height: 21px"><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">3</span><span style="font-size:14px;font-family:宋体;color:#777777">、熟悉自动化系统框架，有自动化框架搭建、二次开发经验者优先；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">4</span><span style="font-size:14px;font-family:宋体;color:#777777">、了解压力测试、稳定性测试的基本指标，有编程开发做压力测试的优先；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">5</span><span style="font-size:14px;font-family:宋体;color:#777777">、责任心强，具备良好的学习能力、沟通和团队协作能力。</span></p><p><br/></p>',
        viewStyle: false,
        type: '技术',
    }, {
        name: 'COCOS2D-X',
        money: '15k-30k',
        style: {
            background: 'url(/imgs/recruit/i-8.png) 50% 100% no-repeat rgb(139,127, 210)',
        },
        num: 1,
        resume: '广州/经验1-3年/学历不限/全职',
        describe: '<div class="" style="font-size:14px;font-family:宋体;color:#777777;">岗位职责：</p><p class="">1、使用COCOS2D-X开发基于iOS/Android平台手机游戏；</p><p class="">2、负责科学实验仿真教育游戏；</p><p class="">3、根据策划文档，与策划、美工、服务端积极沟通，开发实现相关功能</p><p class="">4、要求开发效率高，速度快</p><p class=""><br></p><p class="">任职要求：</p><p class="">1、熟悉COCOS2D-X引擎和框架，熟悉quickcocos2d-X引擎</p><p class="">2、精通C/C++编程语言，熟练使用Lua语言</p><p class="">3、精通COCOSTUDIO编辑器及粒子效果</p><p class="">4、对iOS/Android开发模式有一定了解</p><p class="">5、有COCOS2D-x开发经验优先</div>',
        viewStyle: false,
        type: '技术',
    }, {
        name: '后端开发工程师',
        money: '9k-15k',
        style: {
            background: 'url(/imgs/recruit/i-9.png) 50% 100% no-repeat rgb(243,107,107)',
        },
        num: 1,
        resume: '广州/经验1-3年/本科及以上/全职',
        describe: '<p style="margin: 9px 0 20px 36px"><span style="font-family:宋体;color:#555555">职位描述</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">工作职责：</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">1</span><span style="font-size:14px;font-family:宋体;color:#777777">、理解产品需求，根据产品模块业务流程用例建模、分析、设计系统后端服务器，开发模块接口给移动端、web端对接使用；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">2</span><span style="font-size:14px;font-family:宋体;color:#777777">、撰写相关技术文档如接口文档等；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">3</span><span style="font-size:14px;font-family:宋体;color:#777777">、负责开发模块的代码质量，做好产品模块的压力测试和稳定性测试，保质保量完成开发任务。</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">&nbsp;</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">职位要求：</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">1</span><span style="font-size:14px;font-family:宋体;color:#777777">、有</span><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">1</span><span style="font-size:14px;font-family:宋体;color:#777777">年以上的工作经验，优先考虑有Go语言相关开发经验者；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">2</span><span style="font-size:14px;font-family:宋体;color:#777777">、至少熟练一种后端开发语言，如Java、Python、C++、Golang等；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">3</span><span style="font-size:14px;font-family:宋体;color:#777777">、熟悉Web相关技术, 对Unix/Linux有深入了解；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">5</span><span style="font-size:14px;font-family:宋体;color:#777777">、熟悉常用数据库，如mysql,oracle,MongoDB等。</span></p><p><br/></p>',
        viewStyle: false,
        type: '技术',
    }, {
        name: '项目协助',
        money: '3K-6K',
        style: {
            background: 'url(/imgs/recruit/i-9.png) 50% 100% no-repeat rgb(243,107,107)',
        },
        num: 1,
        resume: '广州/经验1-3年/大专及以上/全职',
        describe: '<div style="font-size:14px;font-family:宋体;color:#777777;"><p>职位描述:<br>1、系统运营维护，简单的系统故障处理；<br>2、在用户现场进行系统集成项目支持工作；<br>3、保障项目正式实施前期、中期、后期的质量；<br>4、协助项目经理处理日常事务和突发事件；<br>5、对客户的反馈意见及时进行处理，以保障项目按计划实施。<br><br><br>职位要求：<br>1、1年以上系统集成项目相关职位工作经验；<br>2、熟悉Winows、Linux操作系统&nbsp;；<br>3、熟悉网络环境，能够按要求搭建网络环境。</div>',
        viewStyle: false,
        type: '项目',
    }, {
        name: '前端开发工程师-WEB',
        money: '7k-12k',
        style: {
            background: 'url(/imgs/recruit/i-9.png) 50% 100% no-repeat rgb(243,107,107)',
        },
        num: 1,
        resume: '广州/经验1-3年/本科及以上/全职',
        describe: '<p style="font-size:14px;font-family:宋体;color:#777777;margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">岗位职责 ：</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">1. </span><span style="font-size:14px;font-family:宋体;color:#777777">理解产品需求，根据产品模块业务流程用例开发实现</span><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">WEB</span><span style="font-size:14px;font-family:宋体;color:#777777">页面架构，以及公共组件开发；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">2.</span><span style="font-size:14px;font-family:宋体;color:#777777">负责对Web页面进行性能优化以及特性开发，解决主流浏览器javascript兼容问题；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">3. </span><span style="font-size:14px;font-family:宋体;color:#777777">与产品、后台开发人员保持良好沟通，准确理解、设计、实现用户界面需求；</span></p><p style="margin-left: 36px"><span style="font-size:15px;font-family:宋体">&nbsp;</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">职位要求 ：</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">1. </span><span style="font-size:14px;font-family:宋体;color:#777777">有</span><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">1</span><span style="font-size:14px;font-family:宋体;color:#777777">年以上Web前端开发经验；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">2. </span><span style="font-size:14px;font-family:宋体;color:#777777">熟练应用各种Web前端技术（HTML</span><span style="font-size:14px;font-family:&#39;Calibri&#39;,sans-serif;color:#777777">5</span><span style="font-size: 14px;font-family:宋体;color:#777777">/CSS/Javascript/Ajax/JQuery</span><span style="font-size: 14px;font-family:宋体;color:#777777">等）；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">3. </span><span style="font-size:14px;font-family:宋体;color:#777777">对目前互联网流行的网页制作方法（Web2.0）DIV+CSS，以及各大浏览器兼容性有深刻认识与解决方案。</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">4. </span><span style="font-size:14px;font-family:宋体;color:#777777">对用户体验、交互设计、页面代码结构、页面交互性能等有深入的理解。</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">&nbsp;</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">备注:<span style="background:#FAFAFA">为了节省你的时间，投递简历时请上传个人作品，以便于我们能更好的了解你的能力。</span></span></p><p><br/></p>',
        viewStyle: false,
        type: '技术',
    }, {
        name: '产品助理',
        money: '5k-7k',
        style: {
            background: 'url(/imgs/recruit/i-9.png) 50% 100% no-repeat rgb(243,107,107)',
        },
        num: 1,
        resume: '广州/经验1-3年/本科及以上/全职',
        describe: '<p style="font-size:14px;font-family:宋体;color:#777777;margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">职位描述：&nbsp;&nbsp;&nbsp;&nbsp;</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">1.</span><span style="font-size:14px;font-family:宋体;color:#777777">负责调研、收集、分析用户需求，产品定义及需求跟踪</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">2.</span><span style="font-size:14px;font-family:宋体;color:#777777">负责产品用户研究分析，包括用户使用习惯、业务流程设计；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">3.</span><span style="font-size:14px;font-family:宋体;color:#777777">负责用Axure等软件设计产品原型，参与产品的交互界面讨论和制定，分析影响产品用户体验的因素并修正；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">&nbsp;&nbsp;&nbsp;&nbsp;</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">任职要求：</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">1.</span><span style="font-size:14px;font-family:宋体;color:#777777">熟练使用Axure、Visio等产品原型设计软件；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">2.</span><span style="font-size:14px;font-family:宋体;color:#777777">一年以上的产品分析或需求分析经验；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">3.</span><span style="font-size:14px;font-family:宋体;color:#777777">具有良好的沟通协调能力；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">4.</span><span style="font-size:14px;font-family:宋体;color:#777777">较强的逻辑分析能力和文字表达能力；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">5.</span><span style="font-size:14px;font-family:宋体;color:#777777">热爱教育及互联网行业；</span></p><p style="margin-left: 36px"><span style="font-size:14px;font-family:宋体;color:#777777">6.</span><span style="font-size:14px;font-family:宋体;color:#777777">责任心强，具备良好的学习能力、沟通和团队协作能力。</span></p><p><br/></p>',
        viewStyle: false,
        type: '产品',
    }, ];
    $scope.changeStatus = function(argData) {
        argData.viewStyle = !argData.viewStyle;
    };
    $scope.changeType = function(argType) {
        $scope.type = argType;
        var f = '';
        switch (argType) {
            case 1:
                f = '产品';
                break;
            case 2:
                f = '运营';
                break;
            case 3:
                f = '技术';
                break;
            case 4:
                f = '项目';
                break;
        }
        $scope.filterName.type = f;
    };
    $scope.view = function(argData, argIndex) {
        argData.viewStyle = true;
        var newHash = 'work';
        $scope.filterName.type = argData.type;
        switch ($scope.filterName.type) {
            case '产品':
                $scope.type = 1;
                break;
            case '运营':
                $scope.type = 2;
                break;
            case '技术':
                $scope.type = 3;
                break;
            case '项目':
                $scope.type = 4;
                break;
            default:
                $scope.type = 0;
                break;
        }
        $('html,body').stop().animate({ scrollTop: $('#' + newHash).offset().top }, 'normal');
    };
}]);
