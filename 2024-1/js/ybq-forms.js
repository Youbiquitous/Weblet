///////////////////////////////////////////////////////////////////
//
// Youbiquitous Web Assets
// Copyright (c) Youbiquitous 2024
//
// Author: Youbiquitous Team
// FORMS v24  (Mar 25, 2024)
//

var Ybq = Ybq || {};



/////////////////////////////////////////////////////////////////////////////////////////
// Number formatting
// Input text handler able to auto-format for thousands, decimals, min/max
//
$("input[type=numeric]")
    .on('keyup',
        function() {
            var requestedDecimals = parseInt($(this).data("decimals"));
            var buddy = "#" + $(this).data("ref");
            if (isNaN(requestedDecimals))
                requestedDecimals = 0;

            var decSep = (1.1).toLocaleString().match(/\d(.*?)\d/)[1];
            var raw = $(this).val();
            var splits = raw.split(decSep);
            var intPart = splits[0];
            var decPart = splits[1];

            // Handle integer part
            var x = intPart.replace(/[^\d]/g, '');
            var i = parseFloat(x);
            if (isNaN(i)) {
                //$(this).val("0");
                $(this).val("");
                $(buddy).val("0");
                return true;
            }
            var intPartFmt = i.toLocaleString();
            if (requestedDecimals === 0) {
                $(this).val(intPartFmt);
                $(buddy).val(i);
                return true;
            }

            // Handle decimal part 
            if (decPart === undefined) {
                $(this).val(intPartFmt);
                $(buddy).val(i);
                return true;
            }
            if (decPart == null || decPart.length === 0) {
                $(this).val(intPartFmt + decSep);
                $(buddy).val(i);
                return true;
            }

            var digits = decPart.substr(0, requestedDecimals);
            $(this).val(intPartFmt + decSep + digits);
            $(buddy).val(i + parseFloat("0." + digits));
            return true;
        })
    .on("blur", function() {
        var buddy = "#" + $(this).data("ref");
        var requestedDecimals = parseInt($(this).data("decimals"));
        var num = parseFloat(parseFloat($(buddy).val()).toFixed(requestedDecimals));
        if (isNaN(num))
            return;
        var min = parseFloat(parseFloat($(this).attr("min")).toFixed(requestedDecimals));
        var max = parseFloat(parseFloat($(this).attr("max")).toFixed(requestedDecimals));
        if (isNaN(min)) {
            min = -1000000000000;
        }
        if (isNaN(max)) {
            max = 1000000000000;
        }

        // If empty but not required => valid input
        var text = $.trim($(this).val());
        var required = $(this).attr("required") !== undefined;
        var invalid = (text.length === 0 && required);

        // UI elements for showing errors
        var message = $(this).data("error");
        var uiElem = $(this).data("error-ui");

        if (invalid || (num < min || num > max)) {
            $(this).addClass("is-invalid");
            if (uiElem !== null)
                $(uiElem).html(message);
        } else {
            $(this).removeClass("is-invalid");
            if (uiElem !== null)
                $(uiElem).html("");
        }
    });
    
    
/////////////////////////////////////////////////////////////////////////////////////////
// Alphanumeric text 
// Does not accept other than digits and letters 
//
$("input[type=text][data-alphanumeric]").on("keypress",
    function (event) {
        var re = /[a-zA-Z0-9-_]/;
        var code = event.charCode || event.keyCode;    
        var chr = String.fromCharCode(code);          
        var success = re.test(chr);
        if (success) {
            return true;
        } else {
            event.preventDefault();
            return false;
        }
    });


/////////////////////////////////////////////////////////////////////////////////////////
// Password
// Does not accept spaces 
//
$("input[type=password]").on("keydown",
    function(event) {
        if (event.key === ' ') {
            // Prevent the default action (typing the space)
            event.preventDefault();
        }
    });


//////////////////////////////////////////////////////////////////////////////////////
// Click handler for the SWITCH visibility password button
//
$("div[data-pswd-viewer-icons]")
    .on("click",
        function() {
            var id = $(this).data("buddy");
            var selector = "#" + $(this).data("buddy");
            var icons = $(this).data("pswd-viewer-icons").split(',');
            $(selector).togglePassword(id + "-icon", icons[0], icons[1]);
        });


//////////////////////////////////////////////////////////////////////////////////////
// Manage the evaluation of the password strength
//
$("input[type=password][data-score-indicator]").on("keyup",
    function() {
        var e = $.Event("passwordScoreChanged");
        e.value = 0;

        var p = $(this).val();
        var ui = $(this).data("score-indicator");
        var lblId = $(ui).data("label");
        var lbl = $("#" + lblId);
        if (p.length === 0) {
            $(ui).css("width", "0");
            $(this).trigger(e);
            lbl.cover();
            return;
        }
        var strength = __checkPasswordStrength(p);
        $(ui).css("background", strength.color);
        $(ui).css("width", strength.score + "%");
        lbl.uncover();

        e.value = strength.score;
        $(this).trigger(e);
    });

function __updatePasswordScore(ui, lbl) {
    var strength = __checkPasswordStrength(p);
    $(ui).css("background", strength.color);
    $(ui).css("width", strength.score + "%");
    lbl.uncover();
}

/////////////////////////////////////////////////////////////////////////////////////////
// Enter to click
// Simulates clicking on given button ID when Enter is pressed
//
$("input[data-click-on-enter]").each(function () {
    $(this).attr("onkeyup",
        "__clickOnEnter(event, '" + $(this).data("click-on-enter") + "')");
});
$("textarea[data-click-on-enter]").each(function() {
    $(this).attr("onkeydown",
        "__clickOnEnter(event, '" + $(this).data("click-on-enter") + "')");
});



/////////////////////////////////////////////////////////////////////////////////////////
// File - uploads
//
$(".ybq-inputfile").each(function () {
    var elem = $(this);
    __inputFileInitialize(elem);
});

/////////////////////////////////////////////////////////////////////////////////////////
// Ybq.postForm() 
// Helper function to post the content of a HTML form
// 
Ybq.postForm = function (formSelector, success, error) {
    var form = $(formSelector);
    var formData = new FormData(form[0]);
    form.find("input[type=file]").each(function () {
        formData.append($(this).attr("name"), $(this)[0].files[0]);
    });

    __notifyBeginOfOperation(formSelector);
    $.ajax({
        cache: false,
        url: form.attr("action"),
        type: form.attr("method"),
        dataType: "html",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) { __notifyEndOfOperation(formSelector); success(data); },
        error: function (data) { __notifyEndOfOperation(formSelector); error(data); }
    });
};

/////////////////////////////////////////////////////////////////////////////////////////
// Ybq.postFormAuto()
// Greatly simplified helper function to post the content of a HTML form
//  
Ybq.postFormAuto = function(formSelector, redirectUrl, clearForm, genericErrorMessage) {

    if (clearForm == null) {
        clearForm = false;
    }
    if (genericErrorMessage == null) {
        genericErrorMessage = "Something went unexpectedly wrong while posting the content";
    }
    Ybq.postForm(formSelector, 
        function (data) {
            var response = "";
            try {
                response = JSON.parse(data);
            } catch(e) {
                Ybq.alert(genericErrorMessage, false, false, 0);
                return;
            };
            var title = response.success ? "All done|" : "It didn't work|";
            Ybq.alert(title + response.message, response.success)
                .then(function () {
                    if (response.success)
                        Ybq.goto(redirectUrl);
                    if (clearForm) {
                        var form = $(formSelector);
                        form.find("input[type=text]").val("");
                        form.find("input[type=password]").val("");
                        form.find("input[type=email]").val("");
                        form.find("input[type=url]").val("");
                        form.find("input[type=number]").val("");
                        form.find("textarea").val("");
                    }
                });
        });
};






/////////////////////////////////////////////////////////////////////////////////////////
//              Internal(s)
///////////////////////////////////////////////////////////////////////////////////////// 




/////////////////////////////////////////////////////////////////////////////////////////
// __clickOnEnter() : Clicks selected element on [Enter]
//
function __clickOnEnter(event, selector) {
    if (event.keyCode === 13) {
        event.preventDefault();
        $(selector).click();
    }
}

/////////////////////////////////////////////////////////////////////////////////////////
// __formValidateContent()
// Parses expression to validate content of the form (returns Boolean)
// EX: [#email: valid, #lastname: required, #age: range]
//  
function __formValidateContent(expression) {
    var guards = expression.split(',');
    var invalid = [];

    for (var i = 0; i < guards.length; i++) {
        var g = guards[i];
        var token = g.split(':');
        var selector = $.trim(token[0]);
        var condition = $.trim(token[1]);
        var value, input;

        // Supported: required, valid, range

        // REQUIRED: support multi-element CSS selectors
        // RANGE/VALID: direct, ID-based selectors only

        if (condition === "required") {
            $.each($(selector), function() {
                var text = $.trim($(this).val()); 
                var fieldSelector = "#" + $(this).attr("id");
                if (text.length === 0) {
                    __trackInvalidField(invalid, fieldSelector);
                }
            });
        } 
        else if (condition === "valid") {
            input = $(selector);
            value = input.val();
            if (value.length === 0)
                __trackInvalidField(invalid, selector);
            else {
                var type = input.attr("type");
                if (type === "email" && !__isValidEmail(value))
                    __trackInvalidField(invalid, selector);
                if (type === "email" && !__isValidUrl(value))
                    __trackInvalidField(invalid, selector);
            }
        } else if (condition === "range") {
            input = $(selector);
            value = input.val();
            var min = parseInt(input.attr("min"));
            min = isNaN(min) ? -1000000000 : min;
            var max = parseInt(input.attr("max"));
            max = isNaN(max) ? 1000000000 : max;
            if (value >= min && value <= max ? 0 : 1)
                __trackInvalidField(invalid, selector);
        }
    }

    return invalid;
}

/////////////////////////////////////////////////////////////////////////////////////////
// __formSubmitContent()
// Bound to buttons or any other clickable elements, it manages the validation of the 
// form content and auto postback of the form
// EX: [#email: valid, #lastname: required, #age: range]
//  
function __formSubmitContent(trigger, secs, wait) {
    var button = $(trigger);
    var formId = button.closest("form").attr("id");
    var validationExpression = button.data("ui-validation");
    var invalidFields = validationExpression.length > 0
        ? __formValidateContent(validationExpression)
        : [];

    // Clear invalid CSS within the form
    var formSelector = "#" + formId;
    $(formSelector + " input").each(function() {
        var input = $(this);
        input.removeClass("is-invalid");
        var feedbackSelector = input.data("ui-feedback");
        if (feedbackSelector != null) {
            $(feedbackSelector).html("").addClass("d-none");
        }
    });

    // Flag all invalid input fields
    for (var i = 0; i < invalidFields.length; i++) {
        var descriptor = invalidFields[i];
        if (typeof descriptor.elementSelector !== 'undefined' &&
            typeof descriptor.text !== 'undefined') {
            $(descriptor.elementSelector).removeClass("d-none").html(descriptor.text);
        }

        $(descriptor.fieldSelector).addClass("is-invalid");
    }

    // Show time-based general (validation) error message 
    var feedbackElement = $(button.data("ui-feedback"));
    secs = (typeof secs !== 'undefined') ? secs : 2;
    var cssFailure = button.data("ui-css-failure");
    if (invalidFields.length > 0) {
        feedbackElement
            .statusMessage(button.data("ui-error"), false, "", cssFailure)
            .hideAfter(secs);

        // Set focus on #1 input invalid
        $(invalidFields[0].fieldSelector).focus();
        return;
    }

    // Post form (assume CommandResponse back)
    button.spin();

    Ybq.postForm(formSelector,
        function(data) {
            button.unspin();
            try {
                var response = JSON.parse(data);
                __formFinalizeAction(button, response, secs, wait);
            } catch (e) {
                feedbackElement
                    .statusMessage(button.data("ui-general-error"), false, "", cssFailure)
                    .hideAfter(secs);
            }
        },
        function() {
            button.unspin();
            feedbackElement
                .statusMessage(button.data("ui-general-error"), false, "", cssFailure)
                .hideAfter(secs);
        });

    return;
}

/////////////////////////////////////////////////////////////////////////////////////////
// __formFinalizeAction() : Performs the final action after the post
//
function __formFinalizeAction(button, response, secs, wait) {
    var action = button.data("post-action");
    var param = button.data("post-action-param");
    var cssSuccess = button.data("ui-css-success");
    var cssFailure = button.data("ui-css-failure");
    var feedbackElement = button.data("ui-feedback");


    if (typeof action === 'undefined')
        action = "showfeedbackandcontinue";

    // Show feedback, hide message, and continue
    if (action === "showfeedbackandcontinue") {
        $(feedbackElement)
            .statusMessage(response.message, response.success, cssSuccess, cssFailure)
            .hideAfter(secs);
        return;
    }

    // Ready to disable input fields before moving away
    var formSelector = "#" + $(button.closest("form")).attr("id");

    // Show feedback, hide message, and run given function (if success)
    if (action === "showfeedbackandfunction") {
        if (typeof param === 'undefined') {
            $(feedbackElement)
                .statusMessage(response.message, response.success, cssSuccess, cssFailure)
                .hideAfter(secs); 
            return;
        }

        // Operation failed
        if (!response.success) {
            $(feedbackElement)
                .statusMessage(response.message, response.success, cssSuccess, cssFailure)
                .hideAfter(secs);
            return;
        }

        // Operation successful (show anyway message)
        __notifyBeginOfOperation(formSelector);
        $(feedbackElement)
            .statusMessage(response.message, response.success, cssSuccess, cssFailure)
            .execAfter(() => window[param](button, response), wait);

        __notifyEndOfOperation(formSelector);
        $(feedbackElement).hideAfter(1);
        return;
    }

    // Show feedback on error, and run given function (if success)
    if (action === "showfeedbackonerrorandfunction") {
        if (typeof param === 'undefined') {
            $(feedbackElement)
                .statusMessage(response.message, response.success, cssSuccess, cssFailure)
                .hideAfter(secs);
            return;
        }

        // Operation failed
        if (!response.success) {
            $(feedbackElement)
                .statusMessage(response.message, response.success, cssSuccess, cssFailure)
                .hideAfter(secs);
            return;
        }

        // Operation successful (show anyway message)
        __notifyBeginOfOperation(formSelector);
        window[param](button, response);
        return;
    }

    // Show feedback, keep message and disable button 
    if (action === "alwaysshowfeedback") {
        button.addClass("d-none");
        $(feedbackElement)
            .statusMessage(response.message, response.success, cssSuccess, cssFailure);
        return;
    }

    // Reload
    if (action === "reload") {
        __notifyBeginOfOperation(formSelector);
        $(feedbackElement)
            .statusMessage(response.message, response.success, cssSuccess, cssFailure)
            .reloadAfter(secs);
        return;
    }

    // Redirect
    if (action === "redirect") {
        if (typeof param === 'undefined')
            return;

        __notifyBeginOfOperation(formSelector);
        $(feedbackElement)
            .statusMessage(response.message, response.success, cssSuccess, cssFailure)
            .gotoAfter(param, secs);
        return;
    }

    // Custom code (plain action regardless of the result of the action)
    if (action === "executefunction") {
        if (typeof param === 'undefined')
            return;

        __notifyBeginOfOperation(formSelector);
        window[param](button, response);
        return;
    }
}

/////////////////////////////////////////////////////////////////////////////////////////
// __trackInvalidField() : Add information about a failed input field in a form
//
function __trackInvalidField(array, fieldSelector) {
    //$(fieldSelector).addClass("is-invalid");
    array.push({
        fieldSelector: fieldSelector,
        elementSelector: $(fieldSelector).data("ui-feedback"),
        text: $(fieldSelector).data("ui-error")
    });
}

/////////////////////////////////////////////////////////////////////////////////////////
// __isValidEmail() : Validates an email address
//
function __isValidEmail(email) {
    var re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

/////////////////////////////////////////////////////////////////////////////////////////
// __isValidUrl() : Validates the format of given URL 
//
function __isValidUrl(url) {
    var re =
        /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
    return re.test(url);
}

/////////////////////////////////////////////////////////////////////////////////////////
// __notifyBeginOfOperation() : Disables controls in the form  
//  
function __notifyBeginOfOperation(formSelector) {
    $(formSelector + " input").attr("disabled", "disabled");
    $(formSelector + " textarea").attr("disabled", "disabled");
    $(formSelector + " button").attr("disabled", "disabled");
    $(formSelector + " a").attr("disabled", "disabled");
};

/////////////////////////////////////////////////////////////////////////////////////////
// __notifyEndOfOperation() : Re-enables disabled controls in the form  
// 
function __notifyEndOfOperation(formSelector) {
    $(formSelector + " button").removeAttr("disabled");
    $(formSelector + " a").removeAttr("disabled");
    $(formSelector + " input").removeAttr("disabled");
    $(formSelector + " textarea").removeAttr("disabled");
};

/////////////////////////////////////////////////////////////////////////////////////////
// __inputFileImgLoadError() : Shows the selected image file
//
function __inputFileImgLoadError(img) {
    var placeholderId = $(img).data("fileid") + "-placeholder";
    $(img).hide();
    $(placeholderId).show();
    var removerId = $(img).data("fileid") + "-remover";
    $(removerId).hide();
};

/////////////////////////////////////////////////////////////////////////////////////////
// __initializeInputFile() : Sets up custom INPUT file
//
function __inputFileInitialize(container) {
    var inputFile = container.find("input[type=file]").first();
    inputFile.hide();

    // Sets references to internal components
    var baseId = "#" + $(inputFile).attr("id");
    var isDefinedId = baseId + "-isdefined";
    var previewId = baseId + "-preview";
    var removerId = baseId + "-remover";
    var placeholderId = baseId + "-placeholder";
    var isAnyImageLinked = ($(isDefinedId).val() === "true");

    // Preserves original values of ISDEFINED and PREVIEW
    $(isDefinedId).data("orig", isAnyImageLinked);
    $(previewId).data("orig", $(previewId).attr("src"));

    __inputFileApplyInternalState(inputFile);

    // Sets up the remover
    if (isAnyImageLinked)
        $(removerId).show();
    else
        $(removerId).hide();

    // Sets up CLICK handler for the photo placeholder
    $(placeholderId).click(function () {
        inputFile.click();
    });

    // Sets up CLICK handler for the remover
    $(removerId).click(function () {
        inputFile.val("");
        inputFile.trigger("change");
        $(previewId).removeAttr("src").removeAttr("title");
        $(previewId).hide();
        $(placeholderId).show();
        $(this).hide();
        $(isDefinedId).val("false");
        return false;
    });

    // Sets up CHANGE handler for INPUT file
    var sizeErrorMsg = inputFile.data("size-error");
    inputFile.change(function (evt) {
        var files = evt.target.files;
        if (files && files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $(previewId).attr("src", e.target.result);
                $(previewId).show();
                $(placeholderId).hide();
                $(removerId).show();
                $(isDefinedId).val("true");
            };
            if (files[0].size > 2097152) { // 2MB
                var msg = sizeErrorMsg.replace("$", (files[0].size / 1024 / 1024).toFixed(2) + " MB");
                Ybq.alert(msg, false);
                $(removerId).click();
                return;
            }
            reader.readAsDataURL(files[0]);
        }
    });

    inputFile.click(function (ev) {
        return ev.stopPropagation();
    });
};

/////////////////////////////////////////////////////////////////////////////////////////
// __inputFileApplyInternalState() : Makes internal changes based on the state of INPUT elements
//
function __inputFileApplyInternalState(inputFile) {
    // Get further references
    var baseId = "#" + $(inputFile).attr("id");
    var isDefinedId = baseId + "-isdefined";
    var previewId = baseId + "-preview";
    var removerId = baseId + "-remover";
    var placeholderId = baseId + "-placeholder";
    var isAnyImageLinked = ($(isDefinedId).val() === "true");

    // Sets up the image placeholder  
    if (isAnyImageLinked) {
        $(placeholderId).hide();
    } else {
        $(placeholderId).show();
    }

    // Sets up the image preview
    $(previewId).data("fileid", baseId);
    if (isAnyImageLinked)
        $(previewId).show();
    else
        $(previewId).hide();
    $(previewId).click(function () {
        inputFile.click();
    });

    // Sets up the remover
    if (isAnyImageLinked)
        $(removerId).show();
    else
        $(removerId).hide();
};

/////////////////////////////////////////////////////////////////////////////////////////
// __inputFileResetInternalState() : Reset custom INPUT file to original configuration
//
function __inputFileResetInternalState(inputFile) {
    var isDefinedId = "#" + inputFile.attr("id") + "-isdefined";
    $(isDefinedId).val($(isDefinedId).data("orig"));

    var previewId = "#" + inputFile.attr("id") + "-preview";
    $(previewId).attr("src", $(previewId).data("orig"));
};

/////////////////////////////////////////////////////////////////////////////////////////
// __inputFileSetDefaultImage() : Set SRC in case of missing images
//
function __inputFileSetDefaultImage(img, defaultImg) {
    img.onerror = "";
    img.src = defaultImg;
};


