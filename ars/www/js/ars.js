/*
 * @author Cny
 */
(function() {
    function ars() {}
    window.ars = ars;
    var S = jswf.NewStore("ars");
    ars.S = S;

    function appendUsed(vals, pkey, targs, used) {
        if (!vals[pkey]) {
            vals[pkey] = {};
        }
        $.each(targs, function(key, val) {
            if (!vals[pkey][key]) {
                vals[pkey][key] = {};
            }
            var vkey = "";
            if (typeof val === "object") {
                vkey = "j_" + JSON.stringify(val);
            } else {
                vkey = val;
            }
            if (!vals[pkey][key][vkey]) {
                vals[pkey][key][vkey] = 0;
            }
            vals[pkey][key][vkey] += used;
        });
    }

    function ukey(x) {
        return x.host + x.key + x.origin;

    }
    ars.ukey = ukey;

    function ARS() {
        var tars = this;
        this.start_ = function() {
            tars.start();
        };
        this.stop_ = function() {
            tars.stop();
        };
        $(window).focus(this.start_).blur(this.stop_);
        this.running = false;
        this.delay = 3000;
        this.pushDelay = 10000;
        this.args = {};
        this.url = "";
        this.showlog = false;
    }
    ARS.prototype.start = function() {
        if (this.running) {
            return;
        }
        var tars = this;
        this.iid = setInterval(function() {
            tars.ontime();
        }, this.delay, this);
        this.running = true;
        this.onStart();
        console.log("ARS start running...");
    };
    ARS.prototype.stop = function() {
        clearInterval(this.iid);
        this.iid = 0;
        this.running = false;
        this.onStop();
        console.log("ARS is stopped...");
    };
    ARS.prototype.ontime = function() {
        this.store(this.delay);
        if (this.url.length > 0) {
            this.push();
        }
    };
    ARS.prototype.parseArgs = function() {
        return {
            host: window.location.host,
            origin: window.location.origin,
            key: window.location.pathname,
            query: jswf.ParseArgs(),
            hash: window.location.hash,
        };
    };
    ARS.prototype.store = function(used) {
        var locv = this.parseArgs();
        var vals = S.getj(ukey(locv));
        if (!vals) {
            vals = {};
        }
        vals.host = locv.host;
        vals.origin = locv.origin;
        vals.key = locv.key;
        if (!vals.hash) {
            vals.hash = {};
        }
        if (locv.hash && locv.hash.length) {
            if (vals.hash[locv.hash]) {
                vals.hash[locv.hash] += used;
            } else {
                vals.hash[locv.hash] = used;
            }
        }
        appendUsed(vals, "query", locv.query, used);
        appendUsed(vals, "user", this.args, used);
        if (vals.used) {
            vals.used += used;
        } else {
            vals.used = used;
        }
        S.setj(ukey(locv), vals);
        if (this.showlog) {
            console.log("store record success by ", vals);
        }
    };
    ARS.prototype.push = function() {
        var cost = 0;
        var last_ = S.get("last");
        if (last_) {
            cost = new Date().getTime() - parseInt(last_);
        } else {
            cost = new Date().getTime();
        }
        if (cost < this.pushDelay || (S.get("pushing") === "1" && cost < 3 * this.pushDelay)) {
            return 1;
        }
        S.set("pushing", "1");
        console.log("ARS do pushing...");
        var idx = S.idx();
        var rs = [];
        $.each(idx, function(key) {
            var tval = S.getj(key);
            if (!tval.key) {
                return;
            }
            var r = {
                host: tval.host,
                origin: tval.origin,
                key: tval.key,
                used: tval.used,
                hash: [],
                query: {},
                user: {},
            };
            $.each(tval.hash, function(key, val) {
                if (key.indexOf("#") < 0) {
                    return;
                }
                r.hash.push({
                    val: key.substr(1).split("/"),
                    used: val,
                });
            });
            $.each(tval.query, function(k1, v1) {
                r.query[k1] = [];
                $.each(v1, function(k2, v2) {
                    r.query[k1].push({
                        val: k2,
                        used: v2,
                    });
                });
            });
            $.each(tval.user, function(k1, v1) {
                r.user[k1] = [];
                $.each(v1, function(k2, v2) {
                    var tval = k2;
                    if (k2.match(/^j_.*$/)) {
                        tval = JSON.parse(tval.substr(2));
                    }
                    r.user[k1].push({
                        val: tval,
                        used: v2,
                    });
                });
            });
            rs.push(r);
        });
        if (rs.length < 1) {
            console.log("ARS do pushing is not required with empty record");
            S.set("pushing", "0");
            return 2;
        }
        var tars = this;
        var beg = new Date().getTime();
        var lastSpeed = S.get("last_speed");
        if (!lastSpeed) {
            lastSpeed = "";
        }
        var turl = "";
        if (this.url.indexOf("?") < 0) {
            turl = this.url + "?last_speed=" + lastSpeed;
        } else {
            turl = this.url + "&last_speed=" + lastSpeed;
        }
        $.ajax({
            type: "POST",
            url: turl,
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(rs),
            success: function(res) {
                lastSpeed = new Date().getTime() - beg;
                if (res.code === 0) {
                    tars.doPushSuccess(rs, lastSpeed);
                    S.set("last", new Date().getTime());
                } else {
                    tars.doPushError(rs, lastSpeed, res);
                }
            },
            error: function(err) {
                cost = new Date().getTime() - beg;
                tars.doPushError(rs, cost, err);
            },
        });
        return 0;
    };
    ARS.prototype.doPushSuccess = function(rs, lastSpeed) {
        $.each(rs, function(key, val) {
            S.setj(ukey(val), {});
        });
        console.log("do push " + rs.length + " record success");
        this.onPushSuccess(rs, lastSpeed);
        S.set("last_speed", lastSpeed);
        S.set("pushing", "0");
    };
    ARS.prototype.doPushError = function(rs, lastSpeed, err) {
        console.error("do push " + rs.length + " record fail with error->" + JSON.stringify(err));
        this.onPushError(rs, lastSpeed, err);
        S.set("last_speed", lastSpeed);
        S.set("pushing", "0");
    };
    ARS.prototype.onPushSuccess = function() {};
    ARS.prototype.onPushError = function() {};
    ARS.prototype.onStart = function() {};
    ARS.prototype.onStop = function() {};
    ars.ARS = ARS;
    return ars;
})();