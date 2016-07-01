/* 使用phantomjs获取chinaz站长工具的ping结果
 * 用法：phantomjs chinaz.js [host]
 */

var args = require('system').args;
if (args.length === 1){
    console.log('Try to pass some arguments when invoking this script!');
    phantom.exit();
};

function jsonToWwwFormEncoded(jsonData){
    var query = "";
    for(key in jsonData){
        query += encodeURIComponent(key) + "=" +  encodeURIComponent(jsonData[key]) + "&";
    }
    return query;
};

function getDateTimeString(){
    var date = new Date();
    return date.toString().replace(/ /g, '_');
};

var postData = {
    'host': args[1],
    'linetype': '电信,多线,联通,移动,海外'
    //'linetype': '海外'
};

var formData = jsonToWwwFormEncoded(postData);

var page = require('webpage').create();

page.onConsoleMessage = function(msg) {
    console.log(msg);
};

page.open('http://ping.chinaz.com', 'post', formData, function(status) {
    //console.log("Status: " + status);
    if(status !== "success") {
        console.log('unable to access network');
        phantom.exit();
    }
    else{
        setTimeout(function(){
            var content = page.evaluate(function(){
                var speedList = document.getElementById('speedlist');
                var lis = speedList.getElementsByTagName('li');
                var result = new Array();
                for(var i=0; i<lis.length; i++){
                    result[i] = new Array();
                    var spans = lis[i].getElementsByTagName('span');
                     for (var j=0;j<spans.length;j++){
                         result[i][j] = spans[j].textContent;
                     }
                }
                for(var i=0; i<result.length; i++){
                    console.log(result[i]);
                }
                return result;
            });
            //console.log(content);
            var fs = require('fs');
            var filename = getDateTimeString() + '_' + args[1];
            var data = "";
            for (var i=0; i<content.length; i++){
                data += content[i][1]+"\n";
            }
            //fs.write(filename + '.txt', JSON.stringify(content), "w");
            fs.write('chinaz/'+ filename + '.txt', data, "w");
            page.render('chinaz/' + filename + ".png");
            phantom.exit();
        }, 3*60000);
    }
});

