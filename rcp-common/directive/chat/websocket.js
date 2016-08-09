var IM = (function() {
    var slice = [].slice;
    function IM(url, recon) {
        this.url = url;
        this.events = {};
        this.reconnect = recon;
        this.times = 0;
        this.tdata = '';
        this.closed = true;
        this.showlog = true;
        this.mrs = {};
        this.connect();
    }
    IM.WIN_SEQ = "^-^";
    IM.prototype.log = function() {
        if (!this.showlog) {
            return;
        }
        switch (arguments.length) {
            case 1:
                console.log(arguments[0]);
                break;
            case 2:
                console.log(arguments[0], arguments[1]);
                break;
            case 3:
                console.log(arguments[0], arguments[1], arguments[2]);
                break;
            case 4:
                console.log(arguments[0], arguments[1], arguments[2], arguments[3]);
                break;
            default:
                console.log(arguments[0]);
                break;
        }
    };
    IM.prototype.connect = function() {
        var tar = this;
        this.ws = new WebSocket(this.url);
        this.ws.onerror = function(e) {
            tar.onError(e);
        };
        this.ws.onopen = function(e) {
            tar.onOpen(e);
        };
        this.ws.onmessage = function(e) {
            tar.onMessage(e);
        };
        this.ws.onclose = function(e) {
            tar.onClose(e);
        };
        this.log('connecting->' + this.url);
    };
    IM.prototype.onError = function(e) {
        this.log('onerror->', e);
        this.trigger('error', e);
    };
    IM.prototype.onOpen = function(e) {
        this.log('onopen->', this.url);
        this.trigger('connect', e);
        this.trigger('open', e);
        this.times = 0;
        this.closed = false;
    };
    IM.prototype.onMessage = function(e) {
        this.tdata += e.data;
        if (this.tdata.substr(this.tdata.length - 1) != "\n") {
            return;
        }
        var tdata = this.tdata;
        var cmds = tdata.split('^-^');
        this.tdata = '';
        if (cmds.length < 2) {
            this.log('receive invalid data: ' + tdata);
            return;
        }
        var args = JSON.parse(cmds[1]);
        if (cmds[0] == 'm') {
            var tim = this;
            if (this[args.i]) {
                return;
            }
            args.c = Base64.decode(args.c);
            this[args.i] = true;
        }
        this.trigger(cmds[0], args);
    };
    IM.prototype.onClose = function(e) {
        this.log('onclose->', e);
        this.closed = true;
        this.trigger('close', e);
        this.log('ws is closed..');
        if (this.reconnect) {
            this.log('ws will reconnect after ' + (this.times * 100) + ' ms');
            var tim = this;
            setTimeout(function() {
                tim.connect();
            }, this.times * 300);
            this.times++;
        }
    };
    IM.prototype.markRead = function (ids, target) {
        this.emit('mr', {
            i: ids,
            a: target,
        });
    };
    IM.prototype.on = function(name, func) {
        this.events[name] = func;
    };
    IM.prototype.trigger = function(name) {
        var arg = slice.call(arguments, 1);
        if (typeof this.events[name] === 'function') {
            this.events[name].apply(this, arg);
        }
    };
    IM.prototype.emit = function(name, args) {
        this.ws.send(name + IM.WIN_SEQ + JSON.stringify(args) + '\n');
    };
    //send text message.
    IM.prototype.sms = function(r, t, c) {
        if (!r || r.length < 1 || t === undefined || !c) {
            this.log('sms args error', r, t, c);
            return;
        }
        this.emit('m', {
            r: r,
            t: t,
            c: Base64.encode(c),
        });
    };
    IM.prototype.sms2 = function(m) {
        if (!m.r || m.r.length < 1 || m.t === undefined || !m.c) {
            this.log('sms args error', m);
            return;
        }
        this.emit('m', {
            r: m.r,
            t: m.t,
            c: Base64.encode(m.c),
        });
    };
    IM.NewIm = function(url, recon) {
        return new IM(url, recon);
    };
    return IM;
})();