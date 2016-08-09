window.testing = 0;
window.resm = "";
var tadd_ = function() {
	console.log("adding task...");
	window.testing += 1;
};
var tdone_ = function() {
	window.testing -= 1;
	console.log("done task...");
	if (window.testing < 1) {
		if (window.resm.length) {
			console.error("test done...->" + window.resm);
		} else {
			console.log("test done...->OK");
		}
	}
};

function testEmptyArs() {
	ars.S.clear();
	var n = new ars.ARS();
	n.showlog = false;
	n.start();
	n.start();
	var tid = 0;
	tadd_();
	var end = false;
	var done = function() {
		clearInterval(tid);
		n.stop();
		ars.S.clear();
		tdone_();
		end = true;
	};
	var tkey = window.location.host + window.location.pathname + window.location.origin;
	tid = setInterval(function() {
		console.log("checking....");
		var vals = ars.S.getj(tkey);
		if (!vals) {
			return;
		}
		if (vals.key !== window.location.pathname) {
			window.resm = "check key";
			done();
			return;
		}
		$.each(vals.query, function() {
			window.resm = "having args";
			done();
		});
		if (!end) {
			$.each(vals.hash, function() {
				window.resm = "having hash";
				done();
			});
		}
		if (!end) {
			$.each(vals.user, function() {
				window.resm = "having user";
				done();
			});
		}
		if (!end) {
			if (vals.used > 6000) {
				done();
			}
		}
	}, 1000);
	return "OK";
}

function testHavingArs() {
	ars.S.clear();
	var n = new ars.ARS();
	n.showlog = true;
	n.start();
	var tid = 0;
	tadd_();
	var end = false;
	var done = function() {
		clearInterval(tid);
		n.stop();
		ars.S.clear();
		tdone_();
		end = true;
	};
	var tkey = window.location.host + window.location.pathname + window.location.origin;
	tid = setInterval(function() {
		console.log("checking....");
		var vals = ars.S.getj(tkey);
		if (!vals) {
			return;
		}
		if (vals.key !== window.location.pathname) {
			window.resm = "check key";
			done();
			return;
		}
		$.each(vals.query, function(key, val) {
			if (key === "a") {
				if (val < 1) {
					done();
					window.resm = "value a error";
				}
			} else if (key === "b") {
				if (val < 1) {
					done();
					window.resm = "value b error";
				}
			} else {
				window.resm = "having invalid args";
				done();
			}
		});
		if (!end) {
			$.each(vals.hash, function() {
				window.resm = "having hash";
				done();
			});
		}
		if (!end) {
			$.each(vals.user, function() {
				window.resm = "having user";
				done();
			});
		}
		if (!end) {
			if (vals.used > 6000) {
				if (!vals.query["a"] || vals.query["a"] < 1 ||
					!vals.query["b"] || vals.query["b"] < 1) {
					window.resm = "args not found";
				}
				console.log(vals);
				done();
			}
		}
	}, 1000);
	return "OK";
}


function testHavingHash() {
	ars.S.clear();
	var n = new ars.ARS();
	n.showlog = true;
	n.start();
	var tid = 0;
	tadd_();
	var end = false;
	var done = function() {
		clearInterval(tid);
		n.stop();
		ars.S.clear();
		tdone_();
		end = true;
	};
	var tkey = window.location.host + window.location.pathname + window.location.origin;
	tid = setInterval(function() {
		console.log("checking....");
		var vals = ars.S.getj(tkey);
		if (!vals) {
			return;
		}
		if (vals.key !== window.location.pathname) {
			window.resm = "check key";
			done();
			return;
		}
		$.each(vals.query, function() {
			window.resm = "having args";
			done();
		});
		var notHash = true;
		if (!end) {
			$.each(vals.hash, function() {
				notHash = false;
			});
		}
		if (!end) {
			$.each(vals.user, function() {
				window.resm = "having user";
				done();
			});
		}
		if (!end) {
			if (vals.used > 6000) {
				if (notHash) {
					window.resm = "not hash";
				}
				console.log(vals);
				done();
			}
		}
	}, 1000);
	return "OK";
}

function testHavingUser() {
	ars.S.clear();
	var n = new ars.ARS();
	n.showlog = true;
	n.start();
	n.args.a = "1";
	n.args.b = "2";
	var tid = 0;
	tadd_();
	var end = false;
	var done = function() {
		clearInterval(tid);
		n.stop();
		ars.S.clear();
		tdone_();
		end = true;
	};
	var tkey = window.location.host + window.location.pathname + window.location.origin;
	tid = setInterval(function() {
		console.log("checking....");
		var vals = ars.S.getj(tkey);
		if (!vals) {
			return;
		}
		if (vals.key !== window.location.pathname) {
			window.resm = "check key";
			done();
			return;
		}
		$.each(vals.query, function() {
			window.resm = "having args";
			done();
		});
		if (!end) {
			$.each(vals.hash, function() {
				window.resm = "having hash";
				done();
			});
		}
		if (!end) {
			$.each(vals.user, function(key, val) {
				if (key === "a") {
					if (val < 1) {
						done();
						window.resm = "value a error";
					}
				} else if (key === "b") {
					if (val < 1) {
						done();
						window.resm = "value b error";
					}
				} else {
					window.resm = "having invalid args";
					done();
				}
			});
		}
		if (!end) {
			if (vals.used > 6000) {
				if (!vals.user["a"] || vals.user["a"] < 1 ||
					!vals.user["b"] || vals.user["b"] < 1) {
					window.resm = "args not found";
				}
				console.log(vals);
				done();
			}
		}
	}, 1000);
	return "OK";
}

function testFocus() {
	ars.S.clear();
	var n = new ars.ARS();
	n.showlog = true;
	n.start();
	$(window).blur();
	if (n.running) {
		return "running";
	}
	n.start_();
	if (!n.running) {
		return "not running";
	}
	return "OK";
}

function testPush() {
	ars.S.clear();
	var n = new ars.ARS();
	n.showlog = true;
	n.args.c = "1";
	n.args.d = "2";
	n.url = "/push";
	n.pushDelay = 5000;
	tadd_();
	tadd_();
	n.onPushSuccess = function() {
		tdone_();
		if (window.testing === 0) {
			n.stop();
		}
	};
	n.onPushError = function(rs, cost, err) {
		window.resm = "return error" + JSON.stringify(err);
		tdone_();
		if (window.testing === 0) {
			n.stop();
		}
	};
	n.start();
	return "OK";
}

function testPush2() {
	ars.S.clear();
	ars.S.set("pushing", "1");
	var n = new ars.ARS();
	n.showlog = true;
	n.args.c = "1";
	n.args.d = "2";
	n.url = "/push";
	n.delay = 500;
	n.pushDelay = 1000;
	tadd_();
	n.onPushSuccess = function() {
		tdone_();
		if (window.testing === 0) {
			n.stop();
		}
	};
	n.onPushError = function(rs, cost, err) {
		window.resm = "return error" + JSON.stringify(err);
		tdone_();
		if (window.testing === 0) {
			n.stop();
		}
	};
	n.start();
	return "OK";
}

function testPush3() {
	ars.S.clear();
	ars.S.set("pushing", "1");
	var n = new ars.ARS();
	n.showlog = true;
	n.args.c = "1";
	n.args.d = "2";
	n.args.obj = {
		"a": 1,
		"x": 2,
	};
	n.url = "/push";
	n.delay = 500;
	n.pushDelay = 1000;
	tadd_();
	n.onPushSuccess = function() {
		tdone_();
		if (window.testing === 0) {
			n.stop();
		}
	};
	n.onPushError = function(rs, cost, err) {
		window.resm = "return error" + JSON.stringify(err);
		tdone_();
		if (window.testing === 0) {
			n.stop();
		}
	};
	n.start();
	return "OK";
}

function testPushToken() {
	ars.S.clear();
	ars.S.set("pushing", "1");
	var n = new ars.ARS();
	n.showlog = true;
	n.args.c = "1";
	n.args.d = "2";
	n.args.obj = {
		"a": 1,
		"x": 2,
	};
	n.url = "/push?token=abc";
	n.delay = 500;
	n.pushDelay = 1000;
	tadd_();
	n.onPushSuccess = function() {
		tdone_();
		if (window.testing === 0) {
			n.stop();
		}
	};
	n.onPushError = function(rs, cost, err) {
		window.resm = "return error" + JSON.stringify(err);
		tdone_();
		if (window.testing === 0) {
			n.stop();
		}
	};
	n.start();
	return "OK";
}

function testPushErr() {
	ars.S.clear();
	var n = new ars.ARS();
	n.showlog = true;
	n.args.c = "1";
	n.args.d = "2";
	n.url = "/push_err";
	tadd_();
	n.onPushSuccess = function() {
		window.resm = "is success";
		tdone_();
		if (window.testing === 0) {
			n.stop();
		}
	};
	n.onPushError = function() {
		tdone_();
		if (window.testing === 0) {
			n.stop();
		}
	};
	n.start();
	return "OK";
}

function testPushErr2() {
	ars.S.clear();
	var n = new ars.ARS();
	n.showlog = true;
	n.args.c = "1";
	n.args.d = "2";
	n.url = "/push_err_not";
	tadd_();
	n.onPushSuccess = function() {
		window.resm = "is success";
		tdone_();
		if (window.testing === 0) {
			n.stop();
		}
	};
	n.onPushError = function() {
		tdone_();
		if (window.testing === 0) {
			n.stop();
		}
	};
	n.start();
	return "OK";
}

function testPushErr2() {
	ars.S.clear();
	var n = new ars.ARS();
	n.showlog = true;
	n.args.c = "1";
	n.args.d = "2";
	n.url = "/push_err_not";
	tadd_();
	n.onPushSuccess = function() {
		window.resm = "is success";
		tdone_();
		if (window.testing === 0) {
			n.stop();
		}
	};
	n.onPushError = function() {
		tdone_();
		if (window.testing === 0) {
			n.stop();
		}
	};
	n.start();
	return "OK";
}

function testPushErr3() {
	ars.S.clear();
	var n = new ars.ARS();
	n.showlog = true;
	n.args.c = "1";
	n.args.d = "2";
	n.url = "/push_err_not";
	if (n.push() === 0) {
		window.resm = "the return code is zero";
		return window.resm;
	} else {
		return "OK";
	}
}

function testSome() {
	var n = new ars();
	n = new ars.ARS();
	n.onPushSuccess();
	n.onPushError();
	return "OK";
}


window.startDemo = function() {
	var n = new ars.ARS();
	n.showlog = true;
	n.start();
};

window.testAll = function() {
	testEmptyArs();
	testHavingArs();
	testHavingHash();
	testHavingUser();
	testFocus();
	testPush();
	testPush2();
	testPush3();
	testPushToken();
	testPushErr();
	testPushErr2();
	testPushErr3();
	testSome();
};

$(function() {
	$(document).focus();
});


// });
// window.document.addEventListener("blur", function() {
// 	console.log("onblur");
// });
// window.document.onfoucs = function() {
// 	console.log("onfoucs");
// };

// $(document).bind('focus', function() {
// 	console.log('welcome (back)');
// }).bind('blur', function() {
// 	console.log('bye bye');
// });