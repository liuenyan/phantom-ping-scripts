/* 使用phantomjs获取webkaka的ping工具的结果.
 * 用法: phantomjs webkaka.js [host]
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

page.open('http://www.webkaka.com/ping.aspx', function(status) {
    console.log("Status: " + status);
    if(status !== "success") {
        console.log('unable to access network');
        phantom.exit();
    }
    else{
        page.evaluate(function(host){
            var chkall = document.getElementById('chkall').checked = true;
            var url = document.getElementById('url').value = host;
            var btn = document.getElementById('btnChk');
            btn.click();
        }, host);
        setTimeout(function(){
            var content = page.evaluate(function(){
                var table = document.getElementById('div_tracert').getElementsByClassName('pingResultTable')[0];
                var trs = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
                var result = new Array();
                for(var i=0; i<trs.length;i++){
                    var tds = trs[i].getElementsByTagName('td');
                    result[i] = new Array();
                    for (var j=0;j<tds.length;j++){
                        result[i][j] = tds[j].textContent;
                    }
                }
                return result;
            });
            var filename = getDateTimeString() + '_' + host;
            var data = "";
            page.render('webkaka/' + filename + '.png');
            for(var i=0;i<content.length; i++){
                if(content[i].length > 1){
                    console.log(content[i]);
                    data += content[i][1].replace(/\(.*\)/, '') + '\n';
                }
            }
            fs = require('fs');
            fs.write('webkaka/' + filename + '.txt', data, 'w');
            phantom.exit();
        }, 3*60*1000);
    }
});
