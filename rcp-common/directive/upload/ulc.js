
    C4js.NewUer=function(args,auto){
        return new C4js.Uer(DYCONFIG.uploadSrv, {
            m: "C",
            token:GetToken()
        }, auto);
    };
		