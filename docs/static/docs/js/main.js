// 格式化json
var formatJson = function (json, options) {
    var reg = null,
        formatted = '',
        pad = 0,
        PADDING = '    ';
    options = options || {};
    options.newlineAfterColonIfBeforeBraceOrBracket = (options.newlineAfterColonIfBeforeBraceOrBracket === true) ? true : false;
    options.spaceAfterColon = (options.spaceAfterColon === false) ? false : true;
    if (typeof json !== 'string') {
        json = JSON.stringify(json);
    } else {
        json = JSON.parse(json);
        json = JSON.stringify(json);
    }
    reg = /([\{\}])/g;
    json = json.replace(reg, '\r\n$1\r\n');
    reg = /([\[\]])/g;
    json = json.replace(reg, '\r\n$1\r\n');
    reg = /(\,)/g;
    json = json.replace(reg, '$1\r\n');
    reg = /(\r\n\r\n)/g;
    json = json.replace(reg, '\r\n');
    reg = /\r\n\,/g;
    json = json.replace(reg, ',');
    if (!options.newlineAfterColonIfBeforeBraceOrBracket) {
        reg = /\:\r\n\{/g;
        json = json.replace(reg, ':{');
        reg = /\:\r\n\[/g;
        json = json.replace(reg, ':[');
    }
    if (options.spaceAfterColon) {
        reg = /\:/g;
        json = json.replace(reg, ':');
    }
    (json.split('\r\n')).forEach(function (node, index) {
        var i = 0,
            indent = 0,
            padding = '';

        if (node.match(/\{$/) || node.match(/\[$/)) {
            indent = 1;
        } else if (node.match(/\}/) || node.match(/\]/)) {
            if (pad !== 0) {
                pad -= 1;
            }
        } else {
            indent = 0;
        }

        for (i = 0; i < pad; i++) {
            padding += PADDING;
        }

        formatted += padding + node + '\r\n';
        pad += indent;
    });
    return formatted;
};


// format方法
String.prototype.format = function (args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if (args[key] != undefined) {
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    var reg = new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
};


(function () {
    // 添加按钮
    $("#requestModal").on('show.bs.modal', modalShowBefore);

    // 模态框消失
    $("#requestModal").on('hide.bs.modal', modalShowBehind);

    $("#tokenModal").on('show.bs.modal', getToken);

}());

// 获取本地token
function getToken() {
    var token = localStorage.getItem("authorization");
    $('textarea[id="localToken"]').val(token);
    return token
}

// 将token存储到本地
function saveToken() {
    var token = $('textarea[id="localToken"]').val();
    localStorage.setItem("authorization", token)
}

// 清除token
function clearToken() {
    localStorage.removeItem("authorization")
}

// 模态框关闭前
function modalShowBehind() {
    $("#response").html('<div><h3>Response</h3><p class="lead text-center">Awaiting request...</p></div>')
}

function showFileName(inputEle) {
    var eleDoc = $(inputEle);
    var fileName = eleDoc.val().split('\\').pop();
    eleDoc.parent().parent().next().children().text(fileName);
    console.log($(inputEle));
    console.log($(inputEle)[0].files[0])
}

// 获取参数的html
function eachJson(data) {
    var fieldsHtml = '';
    $.each(data, function (i, v) {
        if (v.description == null) {
            v.description = ''
        }

        if (v.field_name == "authorization") {
            v.default = "Bearer " + getToken()
        }

        var fields = "";

        if (v.param_type == 'file') {
            fields = '<div class="form-group">' +
                '<label class="col-sm-4 control-label">' +
                v.field_name +
                '&nbsp;&nbsp;<span style="color:#18bc9c">' +
                v.description +
                '</span></label><div class="col-sm-2">' +
                '<button class="form-control input-sm btn-success" style="position: relative">上传<input type="file" id="' +
                v.field_name +
                '" class="form-control input-sm" onchange="showFileName(this)" placeholder="" value="" style="position: absolute;top: 0;left: 0;right: 0;opacity: 0;"></button></div>' +
                '<div class="col-sm-3"><span style="line-height: 35px;' +
                'display: block;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">未选择任何文件</span></div><div class="col-sm-3">' +
                '<span class="label label-info">' +
                v.param_type +
                '</span>';
        } else {
            fields = '<div class="form-group">' +
                '<label class="col-sm-4 control-label">' +
                v.field_name +
                '&nbsp;&nbsp;<span style="color:#18bc9c">' +
                v.description +
                '</span></label><div class="col-sm-5">' +
                '<input type="text" id="' +
                v.field_name +
                '" class="form-control input-sm" placeholder="' +
                v.default +
                '" value="' +
                v.default +
                '"></div><div class="col-sm-3">' +
                '<span class="label label-info">' +
                v.param_type +
                '</span>';
        }
        var require = '<span class="label label-primary label-required"' +
            ' title="Required">R</span></div></div>';
        if (v.required == true) {
            ele = fields + require
        } else {
            ele = fields + '</div></div>'
        }
        fieldsHtml += ele;
    });
    return fieldsHtml
}

// 模态框显示之前
function modalShowBefore(event) {
    var buttonEle = $(event.relatedTarget);
    var method = buttonEle.text();
    var titleMethodHtml = "";
    var requestMethodHtml = "";
    var title = buttonEle.parent().parent().prev().find("#requestUrl").text();
    if (method == "GET") {
        titleMethodHtml = title + ' <span class="label label-success">GET</span>';
        requestMethodHtml = '<span class="btn btn-sm method get active">GET</span>'
    } else if (method == "POST") {
        titleMethodHtml = title + ' <span class="label label-warning">POST</span>';
        requestMethodHtml = '<span class="btn btn-sm method post active">POST</span>'
    } else if (method == "OPTIONS") {
        titleMethodHtml = title + ' <span class="label label-info">OPTIONS</span>';
        requestMethodHtml = '<span class="btn btn-sm method options active">OPTIONS</span>'
    } else if (method == "DELETE") {
        titleMethodHtml = title + ' <span class="label label-danger">DELETE</span>';
        requestMethodHtml = '<span class="btn btn-sm method get active">DELETE</span>'
    } else if (method == "PATCH") {
        titleMethodHtml = title + ' <span class="label label-info">PATCH</span>';
        requestMethodHtml = '<span class="btn btn-sm method patch active">PATCH</span>'
    } else if (method == "PUT") {
        titleMethodHtml = title + ' <span class="label label-info">PUT</span>';
        requestMethodHtml = '<span class="btn btn-sm method put active">PUT</span>'
    }
    $("#titleMethod").html(titleMethodHtml);
    $("#requestMethod").html(requestMethodHtml);
    var params = buttonEle.attr('data-params');
    var headers = buttonEle.attr('data-headers');
    var headers_json = JSON.parse(headers);
    var params_json = JSON.parse(params);
    var requestUrl = buttonEle.parent().parent().prev().find("#requestUrl span").html();
    $("#Endpoint").val(requestUrl);
    $("#requestHeaders div").remove();
    $("#requestParams div").remove();
    $("#requestHeaders").append(eachJson(headers_json.data));
    $("#requestParams").append(eachJson(params_json.data));
}


String.prototype.format = function (args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if (args[key] != undefined) {
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    var reg = new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
};

// 获取Json对象
function getJsonParams(array) {
    var json_str = "{";
    $.each(array, function (i, v) {

        var key = $(v).attr("id");
        var value = $(v).val();
        if ($(v).attr('type') == 'file') {
            value = $(v)[0].files[0];
            return true
        }
        var temp_str = '"{0}":"{1}"'.format(key, value);
        json_str += temp_str;
        if (i == array.length - 1) {
        } else {
            json_str += ','
        }
    });
    json_str += "}";
    return JSON.parse(json_str)
}


function ajaxSuccess(data, textStatus, xhr) {
    var statusCodeClass = "";
    if (xhr.status >= 100 && xhr.status < 200) {
        statusCodeClass = "status-code-1"
    } else if (xhr.status >= 200 && xhr.status < 300) {
        statusCodeClass = "status-code-2"
    } else if (xhr.status >= 300 && xhr.status < 400) {
        statusCodeClass = "status-code-3"
    } else if (xhr.status >= 400 && xhr.status < 500) {
        statusCodeClass = "status-code-4"
    } else {
        statusCodeClass = "status-code-5"
    }
    var resultJson = formatJson(data);

    var ele = '<div><h3><span>Response </span><span class="label status-code pull-right ' +
        statusCodeClass +
        '" >' +
        xhr.status +
        '</span></h3><div><strong>Status</strong><span">: </span><span class="status-text" >' +
        textStatus +
        '</span>' +
        '</div><pre><code class="json">' +
        resultJson +
        '</code></pre></div>';
    $("#response").html(ele)
}

function ajaxError(XMLHttpRequest, textStatus, errorThrown) {
    var statusCodeClass = "";
    if (XMLHttpRequest.status >= 100 && XMLHttpRequest.status < 200) {
        statusCodeClass = "status-code-1"
    } else if (XMLHttpRequest.status >= 200 && XMLHttpRequest.status < 300) {
        statusCodeClass = "status-code-2"
    } else if (XMLHttpRequest.status >= 300 && XMLHttpRequest.status < 400) {
        statusCodeClass = "status-code-3"
    } else if (XMLHttpRequest.status >= 400 && XMLHttpRequest.status < 500) {
        statusCodeClass = "status-code-4"
    } else {
        statusCodeClass = "status-code-5"
    }
    var responseData = "";
    if (XMLHttpRequest.hasOwnProperty("responseJSON") || XMLHttpRequest.readyState == 0) {
        responseJsonStr = JSON.stringify(XMLHttpRequest.responseJSON);
        responseData = formatJson(responseJsonStr);
    } else {
        responseData = XMLHttpRequest.statusText
    }
    var ele = '<div><h3><span>Response </span><span class="label status-code pull-right ' +
        statusCodeClass +
        '" >' +
        XMLHttpRequest.status +
        '</span></h3><div><strong>Status</strong><span">: </span><span class="status-text" >' +
        textStatus +
        '</span>' +
        '</div><pre><code class="json">' +
        responseData +
        '</code></pre></div>';
    $("#response").html(ele)
}

function sendRequest(b) {

    $("#myLoad").show();
    var bodyEle = $(b).parent().prev();
    var requestUrl = bodyEle.find('#Endpoint').val();
    var requestMethod = bodyEle.find("#requestMethod").children().text().toLowerCase();
    var headers = bodyEle.find("#requestHeaders input");
    var params = bodyEle.find("#requestParams input");
    var requestHeaders = getJsonParams(headers);
    var requestParams = "";
    var processDataBool = true;
    var contentTypeBool = "application/x-www-form-urlencoded";
    var uploadFile = bodyEle.find("#requestParams input[type=file]");
    if (uploadFile.length == 0) {
        requestParams = getJsonParams(params);
    } else {
        $("#requestForm").attr("enctype", "multipart/form-data");
        processDataBool = false;
        contentTypeBool = false;
        requestParams = new FormData();
        $.each(params, function (i, v) {
            var key = $(v).attr("id");
            var value = $(v).val();
            if ($(v).attr('type') == 'file') {
                value = $(v)[0].files[0];
            }
            requestParams.append(key, value)
        });
    }

    $.ajax({
        url: requestUrl,
        type: requestMethod,
        dataType: "json",
        headers: requestHeaders,
        data: requestParams,
        processData: processDataBool,
        contentType: contentTypeBool,
        beforeSend: function () {
            $("#loading").show();
        },
        success: ajaxSuccess,
        error: ajaxError,
        complete: function () {
            $("#loading").hide();
        }
    })
}