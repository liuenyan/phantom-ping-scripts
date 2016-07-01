/* 使用phantomjs获取 https://asm.ca.com/zh_cn/ping.php 的ping工具的结果.
 * 用法: phantomjs ca.js [host]
 */

var args = require('system').args;
if (args.length === 1){
    console.log('Try to pass some arguments when invoking this script!');
    phantom.exit();
};

function getDateTimeString(){
    var date = new Date();
    return date.toString().replace(/ /g, '_');
};

var host = args[1];
console.log(host);

var page = require('webpage').create();

page.onConsoleMessage = function(msg) {
    console.log(msg);
};

page.open("https://asm.ca.com/zh_cn/ping.php", function(status){
    console.log("Status: " + status);
    if(status !== "success") {
        console.log('unable to access network');
        phantom.exit();
    }
    else{
        console.log(page.title);
        page.evaluate(function(host){
            var varghost = document.getElementById('varghost');
            varghost.value = host;
            var btn = document.getElementById('start-button');
            btn.click();
        }, host);
        setTimeout(function(){
            var content = page.evaluate(function(){
                var table = document.getElementById('pingtable');
                var trs = table.getElementsByTagName('tr');
                var result = new Array();
                for(var i=0; i<trs.length; i++){
                    var tds = trs[i].getElementsByTagName('td');
                    result[i] = new Array();
                    for (var j=0; j<tds.length; j++){
                        result[i][j] = tds[j].textContent;
                    }
                }
                return result;
            });
            var filename = getDateTimeString() + '_' + host;
            var data = "";
            for (var i=0;i<content.length; i++){
                if(content[i].length === 6){
                    data += content[i][5] + "\n";
                    //console.log(content[i]);
                }
            }
            fs = require('fs');
            fs.write("ca/" + filename + ".txt", data, "w");
            page.render("ca/" + filename + '.png');
            phantom.exit();
        }, 60*1000);
    }
});
