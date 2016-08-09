/**
 * Created by FENGSB on 2015/8/24.
 */
 
module.factory('dialog', function() {
	var services = {
		alert: function(msg, opts) {
			jf.alert(msg, opts);
		},
		confirm: function(str, opts, defineCallback, cancelCallback) {
			jf.confirm(str, opts, defineCallback, cancelCallback);
		}
	};
	return services;
});

module.run(['service', 'dialog', function (service,dialog){
    service.expand('dialog',function (){
        return dialog;
    });
}]);