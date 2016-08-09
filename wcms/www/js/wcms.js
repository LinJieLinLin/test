/*
 * @author Cny
 */
var wcms = (function() {
    function wcms() {}
    wcms.langs = {};
    wcms.langs.en = {};
    wcms.langs.ch = {};
    wcms.vals = wcms.langs.en;
    //create one local store by name,limit size.
    function LocStore(name, limit) {
        if (typeof(name) !== "string" || name.trim().length < 1) {
            throw "the name must be string and not empty";
        }
        this.name = name;
        if (limit) {
            if (typeof(limit) !== "number" || limit < 1) {
                throw "the limit must be integer and >0";
            }
            this.limit = limit;
        } else {
            this.limit = 5 * 1024 * 1024;
        }
    }
    //load string data.
    LocStore.prototype.get = function(key) {
        return window.localStorage[this.name + "_" + key];
    };
    //load json data.
    LocStore.prototype.getj = function(key) {
        try {
            var val = this.get(key);
            if (val && val.length) {
                return JSON.parse(val);
            } else {
                return null;
            }
        } catch (e) {
            console.error("get json by key(" + key + ") error:" + e);
            return null;
        }
    };
    //store string data.
    LocStore.prototype.set = function(key, data) {
        data = data + "";
        var val = this.get(key);
        var size = 0;
        if (val) {
            size = this.size() + data.length - val.length;
        } else {
            size = this.size() + data.length;
        }
        if (size > this.limit) {
            return false;
        }
        var idx = this.idx();
        idx[key] = data.length;
        window.localStorage[this.name + "_" + key] = data;
        window.localStorage[this.name + "_size"] = size;
        window.localStorage[this.name + "_idx"] = JSON.stringify(idx);
        return true;
    };
    //store json data.
    LocStore.prototype.setj = function(key, data) {
        return this.set(key, JSON.stringify(data));
    };
    //delete data by key.
    LocStore.prototype.del = function(key) {
        var val = this.get(key);
        if (!val) {
            return false;
        }
        var idx = this.idx();
        delete idx[key];
        window.localStorage.removeItem(this.name + "_" + key);
        //
        window.localStorage[this.name + "_size"] = this.size() - val.length;
        window.localStorage[this.name + "_idx"] = JSON.stringify(idx);
        return true;
    };
    //load stored index.
    LocStore.prototype.idx = function() {
        var idx = window.localStorage[this.name + "_idx"];
        if (idx && idx.length) {
            return JSON.parse(idx);
        } else {
            return {};
        }
    };
    //the store size.
    LocStore.prototype.size = function() {
        var size = window.localStorage[this.name + "_size"];
        if (size) {
            return parseInt(size);
        } else {
            return 0;
        }
    };
    //clear the store
    LocStore.prototype.clear = function() {
        var idx = this.idx();
        for (var i in idx) {
            window.localStorage.removeItem(this.name + "_" + i);
        }
        window.localStorage.removeItem(this.name + "_size");
        window.localStorage.removeItem(this.name + "_idx");
        return true;
    };
    //
    wcms.LocStore = LocStore;
    //default new store impl.
    wcms.NewStore = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        return new LocStore(arg0, arg1);
    };
    //delete local store.
    wcms.DelStroe = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        return new LocStore(arg0, arg1).clear();
    };
    //////
    //////
    function Res() {}
    //register the done callback function.
    Res.prototype.done = function(f) {
        this.done_ = f;
        return this;
    };
    //emit done event.
    Res.prototype.ondone = function(arg0, arg1, arg2) {
        if (this.done_) {
            this.done_(arg0, arg1, arg2);
        }
    };
    //register the fail callback function.
    Res.prototype.fail = function(f) {
        this.fail_ = f;
        return this;
    };
    //emit fail event.
    Res.prototype.onfail = function(arg0, arg1, arg2) {
        if (this.fail_) {
            this.fail_(arg0, arg1, arg2);
        }
    };
    wcms.Res = Res;

    wcms.create = "/art/api/create";
    wcms.update = "/art/api/update";
    wcms.load = "/art/api/load";
    wcms.ART_TABLE = "T";

    //the article builder constructor.
    function Article(aid, type, count) {
        if (!aid || aid.length < 1) {
            throw "article id is null or empty";
        }
        this.aid = aid;
        this.type = type;
        if (count && count > 0) {
            this.count = count;
        } else {
            this.count = 10;
        }
        this.args = {};
        this.store = wcms.NewStore(aid, 4 * 1024 * 1024);
        this.init();
    }
    //initial the article, it will check the client cache and using it first.
    Article.prototype.init = function() {
        this.inited = false;
        this.saving = false;
        var art = this.store.getj("art");
        if (art) {
            console.log("the local article data found, using cache");
            this.art = art;
            this.cached = true;
        } else {
            this.art = {
                ver: -1
            };
        }
        var einfo = this.store.getj("einfo");
        if (einfo) {
            console.log("the local einfo data found, using cache");
            this.einfo = einfo;
        } else {
            this.einfo = {}; //not access mapping item id to group id
        }
        var updated = this.store.getj("updated");
        if (updated) {
            console.log("the local updated data found, using cache");
            this.updated = updated;
        } else {
            this.updated = {
                gids: {},
                iids: {},
                gidx: false,
                iidx: false,
            };
        }
        var updated_ = this.store.getj("updated_");
        if (updated_) {
            console.log("the local updated_ data found, using cache");
            this.updated_ = updated_;
        } else {
            this.updated_ = {
                gids: {},
                iids: {},
                gidx: false,
                iidx: false,
            };
        }
        var sequence_ = this.store.get("sequence");
        if (sequence_) {
            this.sequence = parseInt(sequence_);
        } else {
            this.sequence = 0;
        }
    };
    //sync article data to local storage.
    Article.prototype.ls_sync = function() {
        this.store.setj("art", this.art);
        this.store.setj("sequence", this.sequence);
        this.store.setj("einfo", this.einfo);
        this.store.setj("updated", this.updated);
        this.store.setj("updated_", this.updated_);
    };
    //clear all stored cache data.
    Article.prototype.ls_clear = function() {
        this.store.clear();
        this.init(); //reinit
    };
    //create new client id by article sequence.
    Article.prototype.nid = function() {
        var tid = "l" + (this.sequence++);
        this.ls_sync();
        return tid;
    };
    Article.prototype.nfid = function() {
        var tid = "l" + (new Date().getTime()) + (this.sequence++);
        this.ls_sync();
        return tid;
    };
    //check update record whether is having updated item.
    Article.prototype.chk_updated = function(up) {
        for (var gid in up.gids) {
            return true;
        }
        for (var iid in up.iids) {
            return true;
        }
        return up.gidx || up.iidx;
    };
    //whether update record is having updated item.
    Article.prototype.isUpdated = function() {
        return this.chk_updated(this.updated);
    };
    //whether update record which is using for saving data is having updated item.
    Article.prototype.isUpdated_ = function() {
        return this.chk_updated(this.updated_);
    };
    //reset the updated record
    Article.prototype.resetUpdated = function() {
        this.updated.gids = {};
        this.updated.iids = {};
        this.updated.gidx = false;
        this.updated.iidx = false;
    };
    //reset the updated pending record
    Article.prototype.resetUpdated_ = function() {
        this.updated_.gids = {};
        this.updated_.iids = {};
        this.updated_.gidx = false;
        this.updated_.iidx = false;
    };
    //merge updated record
    Article.prototype.art_merge_u = function(a, b) {
        a.gidx = a.gidx || b.gidx;
        a.iidx = a.iidx || b.iidx;
        for (var gid in b.gids) {
            a.gids[gid] = b.gids[gid];
        }
        for (var iid in b.iids) {
            a.iids[iid] = b.iids[iid];
        }
    };
    //merge item data from b to a.
    Article.prototype.art_merge_i = function(a, b) {
        if (!b.items) {
            return;
        }
        if (!a.items) {
            a.items = b.items;
            return;
        }
        for (var item in b.items) {
            if (this.updated.iids[item]) {
                continue;
            }
            a.items[item] = b.items[item];
        }
    };
    //merge group data from b to a.
    Article.prototype.art_merge_g = function(a, b) {
        if (!b.groups) {
            return;
        }
        if (!a.groups) {
            a.groups = b.groups;
            return;
        }
        for (var group in b.groups) {
            if (this.updated.gids[group]) {
                continue;
            }
            a.groups[group] = b.groups[group];
        }
    };
    //merge article data from b to a.
    Article.prototype.art_merge = function(a, b) {
        if (typeof(b.ver) != "undefined") {
            a.ver = b.ver;
        }
        if (b.idx) {
            a.idx = b.idx;
        }
        this.art_merge_i(a, b);
        this.art_merge_g(a, b);
    };
    //merge error access info for item from b to a.
    Article.prototype.einfo_merge = function(a, b) {
        if (!b) {
            return;
        }
        for (var item in b) {
            a[item] = b[item];
        }
    };
    //check whether article is initialed.
    Article.prototype.chk_init = function() {
        if (!this.inited) {
            throw "Article is not inited";
        }
    };
    //base loader for loading article data.
    Article.prototype.load_ = function(items, groups, type, count, itemc, idx, access, last) {
        var args = {};
        args.aid = this.aid;
        if (items && items.length) {
            args.items = items;
        }
        if (groups && groups.length) {
            args.groups = groups;
        }
        if (type && type.length) {
            args.type = type;
        }
        if (count) {
            args.count = count;
        }
        if (itemc) {
            args.itemc = itemc;
        }
        if (idx) {
            args.idx = idx;
        }
        if (access) {
            args.access = access;
        }
        if (last) {
            args.last = last;
        }
        for (var arg in this.args) {
            args[arg] = this.args[arg];
        }
        console.log("load article by " + JSON.stringify(args));
        var res = new Res();
        $.getJSON(wcms.load, args, function(data) {
            res.ondone(data);
        }).fail(function(xhr) {
            res.onfail("load fail by state:" + xhr.readyState + ", error:" + xhr.statusText + ", text:\n" + xhr.responseText, xhr);
        });
        return res;
    };
    //loader for loading article data and merge to client cache.
    Article.prototype.load = function(items, groups, type, count, itemc, idx, access, last) {
        var res = new Res();
        var art = this;
        this.load_(items, groups, type, count, itemc, idx, access, last).done(function(data) {
            if (data.code !== 0) {
                var err = "load article fail by code:" + data.code + ", msg:" + data.msg + ", dmsg:" + data.dmsg;
                console.error(err);
                art.onLoadFail(err, data);
                res.onfail(err, data);
                return;
            }
            if (art.art.ver < 0) {
                console.log("load and merge article success on first load, the base version: " + data.data.art.ver);
                art.art = data.data.art;
                art.einfo = data.data.einfo;
                art.onLoadDone(art, data.data);
                res.ondone(art, data.data);
                art.ls_sync();
                return;
            }
            if (art.art.ver == data.data.art.ver) {
                console.log("load and merge article success on the same version: " + art.art.ver);
                art.art_merge(art.art, data.data.art);
                art.einfo_merge(art.einfo, data.data.einfo);
                art.onLoadDone(art, data.data);
                res.ondone(art, data.data);
                art.ls_sync();
            } else {
                console.error("load article fail by having new version->", data.data.art.ver);
                art.onNewVer(art, data.data);
                res.onfail("NEW_VER", data.data);
            }
        }).fail(function(err, xhr) {
            art.onLoadFail(err, xhr);
            res.onfail(err, xhr);
        });
        return res;
    };
    //start run the article builder.
    Article.prototype.run = function() {
        var art = this;
        var res = new Res();
        var reloaded = false;
        var dcall = function() {
            var idx = 1;
            var type = wcms.ART_TABLE;
            var count = art.count;
            if (art.art.idx && art.art.idx.iids) { //local cache found.
                idx = 0;
                type = "";
                count = 0;
            }
            art.load(null, null, type, count, idx, idx, idx, idx).done(function(art, data) {
                art.inited = true;
                res.ondone(art, data);
            }).fail(function(err, xhr) {
                if (reloaded || err !== "NEW_VER") {
                    res.onfail(err, xhr);
                    return;
                }
                art.ls_clear();
                art.init();
                reloaded = true;
                dcall();
            });
        };
        dcall();
        return res;
    };
    //load more item by items.
    Article.prototype.next = function(items) {
        var tis = [];
        for (var i = 0; i < items.length; i++) {
            if (this.art.items[items[i]]) {
                continue;
            }
            if (this.einfo[items[i]]) {
                continue;
            }
            tis.push(items[i]);
        }
        var art = this;
        if (tis.length < 1) {
            var res = new Res();
            res.done = function(f) {
                f(art);
                return this;
            };
            return res;
        }
        return this.load(tis.join(","));
    };
    //list groups by group id.
    Article.prototype.listGroup = function(groups) {
        var tis = [];
        for (var i = 0; i < groups.length; i++) {
            if (this.art.groups[groups[i]]) {
                continue;
            }
            if (groups[i] == "_" || groups[i] == "E") {
                continue;
            }
            tis.push(groups[i]);
        }
        var art = this;
        if (tis.length < 1) {
            var res = new Res();
            res.done = function(f) {
                f(art);
                return this;
            };
            return res;
        }
        return this.load(null, tis.join(","));
    };
    //get all item id index
    Article.prototype.findIids = function(types) {
        this.chk_init();
        if (!(this.art.idx && this.art.idx.iids)) {
            return [];
        }
        if (!types) {
            return this.art.idx.iids;
        }
        var tids = [];
        for (var i = 0; i < this.art.idx.iids.length; i++) {
            var id = this.art.idx.iids[i];
            if (types[this.art.idx.i2t[id]]) {
                tids.push(id);
            }
        }
        return tids;
    };
    //get all group id index
    Article.prototype.findGids = function() {
        this.chk_init();
        if (this.art.idx && this.art.idx.gids) {
            return this.art.idx.gids;
        } else {
            return [];
        }
    };
    //get item by id and data selector on group/group item count.
    Article.prototype.findItem = function(iid, group, gic) {
        this.chk_init();
        var item = null;
        if (this.art.items && this.art.items[iid]) {
            item = this.art.items[iid];
            item.visiable = true;
        } else if (this.einfo && this.einfo[iid]) {
            item = {
                g: this.einfo[iid],
                visiable: false,
            };
        } else {
            return null;
        }
        if (group) {
            if (this.art.groups && this.art.groups[item.g]) {
                item.group = this.art.groups[item.g];
            } else {
                item.group = null;
            }
        }
        if (gic) {
            if (this.art.idx && this.art.idx.gic && this.art.idx.gic[item.g]) {
                item.gic = this.art.idx.gic[item.g];
            } else {
                item.gic = null;
            }
        }
        return item;
    };
    //get the group info.
    Article.prototype.findGroup = function(gid) {
        this.chk_init();
        if (this.art.groups && this.art.groups[gid]) {
            return this.art.groups[gid];
        } else {
            return null;
        }
    };
    //
    //move item on index a to index b.
    Article.prototype.moveItem = function(idxa, idxb) {
        this.chk_init();
        if (idxa < 0 || idxb < 0 || idxa > this.art.idx.iids.length - 1 || idxb > this.art.idx.iids.length - 1) {
            throw "index out of bound " + JSON.stringify({
                idxa: idxa,
                idxb: idxb,
                ilen: this.art.idx.iids.length
            });
        }
        this.art.idx.iids.splice(idxb, 0, this.art.idx.iids.splice(idxa, 1)[0]);
        this.updated.iidx = true;
        this.ls_sync();
    };
    //move the item up/down by item index
    Article.prototype.moveItem2 = function(idx, up) {
        if (up) {
            this.moveItem(idx, idx - 1);
        } else {
            this.moveItem(idx, idx + 1);
        }
    };
    //move item up/down by item id.
    Article.prototype.moveItem3 = function(iid, up) {
        this.chk_init();
        var idx = -1;
        for (var i = 0; i < this.art.idx.iids.length; i++) {
            if (this.art.idx.iids[i] == iid) {
                idx = parseInt(i);
                break;
            }
        }
        if (idx < 0) {
            throw "the item id(" + iid + ") is not found on article";
        }
        this.moveItem2(idx, up);
    };
    //move items up/down by first item id.
    Article.prototype.moveItemGrp = function(idx, idxt, length, up) {
        this.chk_init();
        var iids = this.art.idx.iids;

        var grp = iids.splice(idx, length);

        var gf = [];
        if (up) {
            gf = iids.splice(0, idxt);
        } else {
            gf = iids.splice(0, idxt - length);
        }

        this.art.idx.iids = gf.concat(grp,iids);

        this.updated.iidx = true;
        this.ls_sync();
    };
    //update the item content by item id.
    Article.prototype.updateItem = function(iid, item) {
        this.chk_init();
        if (!this.art.items[iid]) {
            throw "the item id(" + iid + ") is not found on article";
        }
        if (this.art.items[iid].t != item.t) {
            throw "the item(" + iid + ") type can not be updated";
        }
        this.art.items[iid] = item;
        this.updated.iids[iid] = 1;
        this.ls_sync();
    };
    //update the group content by group id.
    Article.prototype.updateGroup = function(gid, group) {
        this.chk_init();
        if (!this.art.groups[gid]) {
            throw "the group id(" + gid + ") is not found on article";
        }
        this.art.groups[gid] = group;
        this.updated.gids[gid] = 1;
        this.ls_sync();
    };
    //adding item and insert to index, 
    //if index is not setted, it will inset to the end of item list.
    Article.prototype.addItem = function(item, idx) {
        this.chk_init();
        if (typeof(idx) === "undefined") {
            idx = this.art.idx.iids.length;
        }
        var iid = this.nid();
        if (!this.art.items) {
            this.art.items = {};
        }
        this.art.items[iid] = item;
        this.art.idx.iids.splice(idx, 0, iid);
        this.art.idx.i2t[iid] = item.t;
        this.updated.iidx = true;
        this.updated.iids[iid] = 1;
        this.ls_sync();
        console.log("add item success by id(" + iid + ") on index" + idx + "->", JSON.stringify(item));
        return iid;
    };
    //adding group and insert to index, 
    //if index is not setted, it will insert to the end of group list.
    Article.prototype.addGroup = function(group, idx) {
        this.chk_init();
        if (typeof(idx) === "undefined") {
            idx = this.art.idx.gids.length;
        }
        var gid = this.nid();
        if (!this.art.groups) {
            this.art.groups = {};
        }
        this.art.groups[gid] = group;
        this.art.idx.gids.splice(idx, 0, gid);
        this.updated.gidx = true;
        this.updated.gids[gid] = 1;
        this.ls_sync();
        console.log("add group success by id(" + gid + ") on index" + idx + "->", JSON.stringify(group));
        return gid;
    };
    //remove the item.
    Article.prototype.removeItem = function(iid) {
        this.chk_init();
        var idx = -1;
        for (var i = 0; i < this.art.idx.iids.length; i++) {
            if (this.art.idx.iids[i] == iid) {
                idx = parseInt(i);
                break;
            }
        }
        if (idx < 0) {
            throw "the item id(" + iid + ") is not found on article";
        }
        delete(this.art.items[iid]);
        this.art.idx.iids.splice(idx, 1);
        delete(this.art.idx.i2t[iid]);
        this.updated.iidx = true;
        this.ls_sync();
    };
    //save all updated to server.
    Article.prototype.save_ = function() {
        var res = new Res();
        if (this.saving) {
            var err = "there is already having task to save article";
            console.log(err);
            res.fail = function(f) {
                f(err);
                return this;
            };
            return res;
        }
        this.saving = true;
        this.art_merge_u(this.updated_, this.updated);
        this.resetUpdated();
        this.ls_sync();
        console.log("saving article....");
        var art = this;
        var args = {};
        args.ver = art.art.ver;
        args.id = art.art.id;
        args.title = art.art.title;
        args.desc = art.art.desc;
        args.idx = {};
        if (this.updated_.iidx) {
            args.idx.iids = art.art.idx.iids;
        }
        if (this.updated_.gidx) {
            args.idx.gids = art.art.idx.gids;
        }
        args.items = {};
        for (var iid in this.updated_.iids) {
            args.items[iid] = art.art.items[iid];
        }
        args.groups = {};
        for (var gid in this.updated_.gids) {
            args.groups[gid] = art.art.groups[gid];
        }
        var jstr = JSON.stringify(args);
        console.log("saving the article by args:", args);
        $.ajax({
            url: wcms.update + "?" + $.param(art.args),
            type: 'POST',
            data: jstr,
            dataType: 'json',
            contentType: 'application/json',
            success: function(data, status, xhr) {
                art.saving = false;
                res.ondone(art, data, status, xhr);
            },
            error: function(xhr, error, exception) {
                art.saving = false;
                res.onfail("save fail by state:" + xhr.readyState + ", error:" + xhr.statusText + ", text:\n" + xhr.responseText, xhr, error, exception);
            }
        });
        return res;
    };
    //save all updated to server and merge client data.
    Article.prototype.save = function() {
        var res = new Res();
        var art = this;
        if (!this.isUpdated()) {
            res.done = function(f) {
                f(art);
                return this;
            };
            return res;
        }
        this.save_().done(function(tart, data) {
            if (data.code === 0) {
                art.art_merge(art.art, data.data.art);
                var gidmc = 0;
                var iidmc = 0;
                for (var gid in data.data.gidm) {
                    delete(art.art.groups[gid]);
                    gidmc++;
                }
                for (var iid in data.data.iidm) {
                    delete(art.art.items[iid]);
                    iidmc++;
                }
                console.log("update article success to ver(" + data.data.art.ver + ") with gidmc(" + gidmc + "),iidmc(" + iidmc + ")");
                art.resetUpdated_();
                art.ls_sync();
                art.onSaveDone(art, data.data, gidmc, iidmc);
                res.ondone(art, data.data, gidmc, iidmc);
            } else if (data.code === 409) {
                console.error("update article faild base ver(" + art.art.ver + ")->" + JSON.stringify(data.data.art.last));
                art.art_merge_u(art.updated, art.updated_);
                art.resetUpdated_();
                art.ls_sync();
                art.onSaveConfict(art, data.data);
                res.onfail("confict", data.data);
            } else {
                var err = "update article fail by code:" + data.code + ", msg:" + data.msg + ", dmsg:" + data.dmsg;
                console.error(err);
                art.art_merge_u(art.updated, art.updated_);
                art.resetUpdated_();
                art.ls_sync();
                art.onSaveFail(err, data);
                res.onfail(err, data);
            }
            this.saving = false;
        }).fail(function(err, xhr) {
            art.art_merge_u(art.updated, art.updated_);
            art.resetUpdated_();
            art.ls_sync();
            art.onSaveFail(err, xhr);
            res.onfail(err, xhr);
        });
        return res;
    };
    //
    //
    Article.prototype.onSaveDone = function(art, data, gidmc, iidmc) {};
    Article.prototype.onSaveConfict = function(art, data) {};
    Article.prototype.onSaveFail = function(art, data) {};
    Article.prototype.onNewVer = function(art, data) {};
    Article.prototype.onLoadDone = function(art, data) {};
    Article.prototype.onLoadFail = function(err, xhr) {};
    wcms.Article = Article;
    window.wcms = wcms;
    return wcms;
})();