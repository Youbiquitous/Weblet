///////////////////////////////////////////////////////////////////
//
// Youbiquitous Web Assets
// Copyright (c) Youbiquitous 2024
//
// Author: Youbiquitous Team
// CORE v24  (Mar 25, 2024)
//

var Ybq = Ybq || {};


//////////////////////////////////////////////////////////////////////
//
String.prototype.capitalize = function () {
    return this.replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
};


//////////////////////////////////////////////////////////////////////
// Measure the strength of a password
// 
function __checkPasswordStrength(m) {
    var percentage = 0;
    var color = "";
    var n = m.length;

    if (n < 6) {
        percentage = 0;
        color = "#dd4b39";
    } else if (n < 8) {
        percentage = 20;
        color = "#9c27b0";
    } else if (n < 10) {
        percentage = 40;
        color = "#ff9800";
    } else {
        percentage = 60;
        color = "#4caf50";
    }

    // Check for the character-set constraints 
    // and update percentage variable as needed. 

    // Lowercase only 
    if ((m.match(/[a-z]/) != null)) {
        percentage += 10;
    }

    // Uppercase only 
    if ((m.match(/[A-Z]/) != null)) {
        percentage += 10;
    }

    // Digits only 
    if ((m.match(/0|1|2|3|4|5|6|7|8|9/) != null)) {
        percentage += 10;
    }

    // Special characters 
    if ((m.match(/\W/) != null) && (m.match(/\D/) != null)) {
        percentage += 10;
    }

    // Update the width of the progress bar 
    return { score: percentage, color: color };
}



//////////////////////////////////////////////////////////////////////
//
// General-purpose utilities
//
//

//////////////////////////////////////////////////////////////////////
// Ybq.goto()
// Jump to the given (absolute) URL 
//  
Ybq.goto = function(url) {
    window.location = url;
};

//////////////////////////////////////////////////////////////////////
// Ybq.get()
// Helper function to call a remote URL (GET), returns a promise
// 
Ybq.get = function (url, success, error) {
    var defer = $.Deferred();
    $.ajax({
        cache: false,
        url: url,
        success: success,
        error: error
    });
    defer.resolve("true");
    return defer.promise();
};

//////////////////////////////////////////////////////////////////////
// Ybq.post()
// Helper function to call a remote URL (POST), returns a promise
// 
Ybq.post = function (url, data, success, error) {
    var defer = $.Deferred();
    $.ajax({
        cache: false,
        url: url,
        type: 'post',
        data: data,
        success: success,
        error: error
    });
    defer.resolve("true");
    return defer.promise();
};


//////////////////////////////////////////////////////////////////////
// Capitalize()
// String transformer
// 
String.prototype.capitalize = function () {
    return this.replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
};



//////////////////////////////////////////////////////////////////////
//
// Custom jQuery plugins for UI tasks
//
//

(function($) {

    ///////////////////////////////////////////////////////////////////////////////////
    // cover() : Add d-none class
    //
    $.fn.cover = function() {
        $(this).addClass("d-none");
        return $(this);
    }

    ///////////////////////////////////////////////////////////////////////////////////
    // uncover() : Remove d-none class
    //
    $.fn.uncover = function() {
        $(this).removeClass("d-none");
        return $(this);
    }

    ///////////////////////////////////////////////////////////////////////////////////
    // spin() : adds a rotating spin to the element
    //
    $.fn.spin = function() {
        var fa = "<i class='ybq-spin ms-1 ml-1 fas fa-spinner fa-pulse'></i>";
        $(this).append(fa);
        return $(this);
    }

    ///////////////////////////////////////////////////////////////////////////////////
    // unspin() : Removes a rotating spin from the element
    //
    $.fn.unspin = function() {
        $(this).find("i.ybq-spin").remove();
        return $(this);
    }

    ///////////////////////////////////////////////////////////////////////////////////
    // disable() : Add the disabled attribute and CSS class
    //
    $.fn.disable = function() {
        $(this).attr("disabled", "disabled");
        $(this).addClass("disabled");
        return $(this);
    }

    ///////////////////////////////////////////////////////////////////////////////////
    // enable() : Remove the disabled attribute and CSS class
    //
    $.fn.enable = function() {
        $(this).removeAttr("disabled");
        $(this).removeClass("disabled");
        return $(this);
    }

    ///////////////////////////////////////////////////////////////////////////////////
    // hideAfter() : Hides element after given time (secs) 
    //
    $.fn.hideAfter = function(secs) {
        secs = (typeof secs !== 'undefined') ? secs : 3;
        var item = $(this);
        window.setTimeout(function () {
            $(item).addClass("d-none");
        }, secs * 1000);
        return $(this);
    }

    ///////////////////////////////////////////////////////////////////////////////////
    // clearAfter : Clears element content after given time (secs) 
    // 
    $.fn.clearAfter = function(secs) {
        secs = (typeof secs !== 'undefined') ? secs : 3;
        var item = $(this);
        window.setTimeout(function () {
            $(item).html("");
            $(item).val("");
        }, secs * 1000);
        return $(this);
    }

    ///////////////////////////////////////////////////////////////////////////////////
    // reloadAfter() : Reloads current page after given time (secs) 
    //
    $.fn.reloadAfter = function(secs) {
        secs = (typeof secs !== 'undefined') ? secs : 3;
        window.setTimeout(function () {
            window.location.reload();
        }, secs * 1000);
        return $(this);
    }

    ///////////////////////////////////////////////////////////////////////////////////
    // gotoAfter() : Navigate to given URL after given time (secs)
    //
    $.fn.gotoAfter = function(url, secs) {
        secs = (typeof secs !== 'undefined') ? secs : 3;
        window.setTimeout(function () {
            window.location.href = url;
        }, secs * 1000);
        return $(this);
    }

    ///////////////////////////////////////////////////////////////////////////////////
    // execAfter() : Execute JS function after given time (secs)
    //
    $.fn.execAfter = function(func, secs) {
        secs = (typeof secs !== 'undefined') ? secs : 3;
        window.setTimeout(function () {
            func();
        }, secs * 1000);
        return $(this);
    }

    ///////////////////////////////////////////////////////////////////////////////////
    // addCssFor() : Adds given CSS class(es) for given time (secs) 
    //
    $.fn.addCssFor = function(css, secs) {
        css = (typeof css !== 'undefined') ? css : "";
        secs = (typeof secs !== 'undefined') ? secs : 2;
        var item = $(this);
        $(this).addClass(css);

        window.setTimeout(function () {
            $(item).removeClass(css);
        }, secs * 1000);
        return $(this);
    }

    ///////////////////////////////////////////////////////////////////////////////////
    // grayOutFor() : Adds opacity for given time (secs) 
    //
    $.fn.grayOutFor = function(secs) {
        return addCssFor("opacity-50", secs); 
    }

    ///////////////////////////////////////////////////////////////////////////////////
    // statusMessage() : show given text with success/failure style
    // 
    $.fn.statusMessage = function(text, success, css1, css2) {
        var successCss = (typeof css1 !== 'undefined') ? css1 : "text-success";
        var failureCss = (typeof css2 !== 'undefined') ? css2 : "text-danger";
        var css = success ? successCss : failureCss;

        $(this).html(text)
            .removeClass(successCss + " " + failureCss)
            .removeClass("d-none")
            .addClass(css);
        return $(this);
    }

    ///////////////////////////////////////////////////////////////////////////////////
    // overlay() : Brings on/off the full screen overlay (if defined)
    //
    $.fn.overlay = function(on) {
        return on
            ? $(this).removeClass("d-none")
            : $(this).addClass("d-none");
    }

    ///////////////////////////////////////////////////////////////////////////////////
    // togglePassword() : Switches password inputs from type=passwrd to type=text
    // 
    $.fn.togglePassword = function(eyeIcon, passwordHidden, passwordClear) {
        var pswd = $(this);
        var icon = $("#" + eyeIcon);
        var hidden = pswd.attr("type") === "password";
        if (hidden) {
            pswd.attr("type", "text");
            icon.removeClass(passwordHidden).addClass(passwordClear);
        } else {
            pswd.attr("type", "password");
            icon.removeClass(passwordClear).addClass(passwordHidden);
        }
        return $(this);
    }
    
    ///////////////////////////////////////////////////////////////////////////////////
    // applyFilter() : Filters table rows based on current value of input field 
    // 
    $.fn.applyFilter = function(tableSelector, cols, css = 'mark') {
        var id = $(this).attr("id");
        if (Number(cols) === cols) {
            cols = [cols];
        }
        if (String(cols) === cols) {
            cols = cols.split(',');
        }

        $(this).on("input",
            function() {
                var remover = $("#" + id + "-remover");
                var filter = $(this).val().toLowerCase();

                if (filter.length > 0) {
                    // decorate headers
                    $(tableSelector + " thead tr").filter(function() {
                        for (var i = 0; i < cols.length; i++) {
                            $(this).find("th:eq(" + cols[i] + ")").addClass(css);
                        }
                    });

                    // show/hide rows
                    $(tableSelector + " tbody tr").filter(function() {
                        var content = "";
                        for (var i = 0; i < cols.length; i++) {
                            content += $(this).find("td:eq(" + cols[i] + ")").text() + "|";
                        }
                        $(this).toggle(content.toLowerCase().indexOf(filter) > -1);

                    });
                    $(remover).removeClass("d-none");
                } else {
                    $(tableSelector + " tbody tr").toggle(true);
                    $(tableSelector + " thead th").removeClass(css);
                    $(remover).addClass("d-none");
                }
            });
        $("#" + id + "-remover").click(function() {
            $("#" + id).val("").trigger("input");
        });
    }

    ///////////////////////////////////////////////////////////////////////////////////
    // handleRowClick() : supports data-url and data-rowClick attributes on TRs 
    // 
    $.fn.handleRowClick = function() {
        var table = $(this);
        table.find("tbody tr").on("click",
            function() {
                var tr = $(this);
                var url = tr.data("url");

                // [url] 
                if (typeof url !== 'undefined' &&
                    $.trim(url).length > 0) {
                    if (!url.startsWith("/"))  
                        url = "/" + url;
                    Ybq.goto(url);
                    return;
                }
                
                var func = tr.data("rowclick");
                if (typeof func !== 'undefined' &&
                    $.trim(func).length > 0) {
                    if (typeof window[func] === 'function') {
                        window[func](tr);
                    } else {
                        eval(func);
                    }
                }
            });
    }
}(jQuery));



///////////////////////////////////////////////////////////////////////////////////
// Document ready common handlers
//  
$(document).ready(function () {

    //////////////////////////////////////////
    // Add a tooltip if the text is clipped
    // 
    $('tbody tr td, thead tr th, .ybq-overflow')
        .on('mouseover', function () {
            var container = this;
            var overflowed = container.scrollWidth > container.clientWidth;
            this.title = overflowed
                ? $.trim(this.textContent.replaceAll("  ", '').replaceAll("\n", " "))
                : '';
        })
        .on('mouseout', function() {
            this.title = '';
        });
});
