// ==UserScript==
// @name         安全微伴刷课助手（2023年新界面）
// @version      0.8.2
// @description  通过在h5上模拟点击，调用结束课程请求等方法实现自动化刷课，具有一定隐蔽性，不会被发现
// @author       九尾妖渚 Modifyed By lony2003
// @match      *://weiban.mycourse.cn/*
// @match      https://mcwk.mycourse.cn/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant 		 none
// @run-at       document-end
// @namespace https://greasyfork.org/users/822791
// @license GPL-v3
// ==/UserScript==

(function() {
    'use strict';

    const addHistoryEvent = function(type) {
        var originalMethod = history[type];
        return function() {
            var recallMethod = originalMethod.apply(this, arguments);
            var e = new Event(type);
            e.arguments = arguments;
            window.dispatchEvent(e);
            return recallMethod;
        };
    };
    history.pushState = addHistoryEvent('pushState');
    history.replaceState = addHistoryEvent('replaceState');

    var getVal = function(fun1, fun2){
        let id = setInterval(()=>{
            var val = fun1();
            if (val.length) {
                clearInterval(id);
                fun2(val);
            }
        }, 100)
        }
    var start = function(e) {
        $(function(){
            setTimeout(()=>{
                //console.log(window.location);
                // 第一阶段 在主页
                if (window.location.hash === '#/') {
                    getVal(()=>{return $("div.task-block")}, (res)=>{
                        //console.log(res);
                        setTimeout(()=>{
                            res[0].click();
                        }, 200);

                    })
                }
                // 第二阶段 在学习任务
                var reg = /course.*projectId.*projectType.*/
                let taskNumber = 0;
                if (window.location.hash.match(reg)) {
                    // 先检测出还需要完成的任务
                    getVal(()=>{return $("div.van-cell--clickable")},(res)=>{
                        res = res.filter(function(index){
                            let text = res[index].querySelector("div.count").innerText;
                            let part = text.split("/");
                            if (part[0] == part[1]) {
                                return false;
                            }
                            return true;
                        })

                        taskNumber = parseInt(res[0].querySelector("div.count").innerText.split("/")[1]) - parseInt(res[0].querySelector("div.count").innerText.split("/")[0]);

                        if(!res[0].classList.contains("van-collapse-item__title--expanded")){
                            res[0].click();
                        }

                    })
                    //打开任务
                    setTimeout(() => {
                        getVal(()=>{return $("li.img-texts-item")},(res)=>{
                            res = res.filter(function(index){

                                //console.log(res[index].classList);

                                if(res[index].classList.contains("passed")){
                                    return false;
                                }
                                return true;
                            })
                            //console.log(res);
                            getVal(()=>{return res.find('.title')}, (res2)=>{
                                if(res2.length / 2 == 0){

                                    console.log("reloading");

                                    location.reload();
                                }
                                res2[0].click();
                            })
                        })
                    }, 5000);

                };
            }, 1000)

        });
    }
    window.addEventListener('pushState', start);
    window.addEventListener('popstate', ()=> {location.reload()});
    //console.log("脚本执行");
    // 第四阶段 此时在异域iframe中
    if (window.location.href.indexOf("mcwk.mycourse.cn/course/") != -1) {
        // console.log(window.location.href);
        $(function(){
            setTimeout(()=>{
                try{console.log(exportRoot.currentFrame)}catch(e){}
                try {
                    function getQueryString(query) {	
	                    var reg = new RegExp("(^|&)" + query + "=([^&]*)(&|$)");
                        var r = decodeURI(window.location.search.substr(1)).match(reg);
                        if (r != null)return unescape(r[2]);
		                return null;
                    }
                    var userid = getQueryString("userCourseId");
                    var jiaoxuejihuaid = getQueryString("tenantCode");
                    var finishWxHost = document.referrer.replace("http://","").replace("https://","").split("/")[0];
                    if(document.referrer=="" || document.referrer==null || document.referrer==undefined){
                        finishWxHost = "weiban.mycourse.cn"
                    }

                    var webUrl = window.location.href;
                    function getRecordUrl(url) {
                        if(url.indexOf('open.mycourse.cn') > 0) {
                            return `https://open.mycourse.cn/proteus/usercourse/finish.do`;
                        } else {
                            return `https://weiban.mycourse.cn/pharos/usercourse/v1/${methodToken}.do`;
                        }
                    }
                    var finishWxUrl=getRecordUrl(webUrl);
                    if(finishWxHost.indexOf("218.25.139.161") > 0){
                        //finishWxUrl = "http://"+finishWxHost+"/pharos/usercourse/finish.do";
                        finishWxUrl = "https://"+finishWxHost+"/pharos/usercourse/finish.do";
                    }

                    var finishData = {"userCourseId": userid, "tenantCode": jiaoxuejihuaid};

                    $.ajax({
                        async: false,
                        url: finishWxUrl,
                        type: "GET",
                        dataType: "jsonp",
                        data: finishData,
                        timeout: 5000,

                        success : function (data) {
                            backToList();
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                        }
                    });
                } catch (e) {
                    alert("报了啥错误" + e)
                }

            }, 10000)

        })

    }
    else if (window.location.href.indexOf("weiban.mycourse.cn/") != -1) {
        //console.log(window.location.href);
        $(function(){
            start();
        })
    }

    // Your code here...
})();
