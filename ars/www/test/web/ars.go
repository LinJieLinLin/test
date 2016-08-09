package main

import (
	"github.com/Centny/gwf/log"
	"github.com/Centny/gwf/routing"
	"github.com/Centny/gwf/util"
	"net/http"
	"os"
)

func main() {
	routing.Shared.HFunc("^/push(\\?.*)?$", Push)
	routing.Shared.HFunc("^/push_err(\\?.*)?$", PushErr)
	routing.Shared.Handler("^.*$", http.FileServer(http.Dir(".")))
	routing.ListenAndServe(os.Args[1])
}

func Push(hs *routing.HTTPSession) routing.HResult {
	var ress []util.Map
	var err = hs.UnmarshalJ(&ress)
	if err != nil {
		return hs.MsgResErr2(1, "arg-err", err)
	}
	log.D("receive value->\n%v", util.S2Json(ress))
	if len(ress) < 1 {
		return hs.MsgResErr2(2, "arg-err", util.Err("at least one"))
	}
	var res = ress[0]
	if len(res.StrValP("/host")) < 1 || len(res.StrValP("/origin")) < 1 ||
		len(res.StrValP("/key")) < 1 || res.IntValP("/used") < 1 {
		return hs.MsgResErr2(3, "arg-err", util.Err("value error"))
	}
	// if len(res.AryMapValP("/hash")) < 1 {
	// 	return hs.MsgResErr2(4, "arg-err", util.Err("value error"))
	// }
	if len(res.AryMapValP("/query/a")) != 1 || res.IntValP("/query/a/0/used") < 1 ||
		len(res.AryMapValP("/query/b")) != 1 || res.IntValP("/query/b/0/used") < 1 {
		return hs.MsgResErr2(5, "arg-err", util.Err("value error"))
	}
	if len(res.AryMapValP("/user/c")) != 1 || res.IntValP("/user/c/0/used") < 1 ||
		len(res.AryMapValP("/user/d")) != 1 || res.IntValP("/user/d/0/used") < 1 {
		return hs.MsgResErr2(6, "arg-err", util.Err("value error"))
	}
	log.D("receiving valid data->\n%v", util.S2Json(ress))
	return hs.MsgRes("OK")
}

func PushErr(hs *routing.HTTPSession) routing.HResult {
	return hs.MsgResErr2(1, "srv-err", util.Err("mock"))
}
