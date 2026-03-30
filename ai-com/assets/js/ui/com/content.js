$(document).ready(function () {
    var isSubmitTried = false;

    /* =========================================================
        # COMMON
    ========================================================= */
    function hasElement(selector) {
        return $(selector).length > 0;
    }

    function getValue(selector) {
        return $.trim($(selector).val());
    }

    function getGroup(selector) {
        return $(selector).closest(".form-group");
    }

    function setError($group, isError) {
        if (!$group.length) {
            return;
        }

        if (isError) {
            $group.addClass("is-error");
            $group.find("input, select").attr("aria-invalid", "true");
        } else {
            $group.removeClass("is-error");
            $group.find("input, select").removeAttr("aria-invalid");
        }
    }

    function openSystemAlert(message) {
        alert(message);
    }

    function bindNumberOnly() {
        $(document).on("input", "#tel-mid, #tel-last, #account-number", function () {
            this.value = this.value.replace(/[^0-9]/g, "");
        });
    }

    function bindFocusState() {
        $(document).on("focus", ".form-group input, .form-group select", function () {
            $(this).closest(".form-group").addClass("is-focus");
        });

        $(document).on("blur", ".form-group input, .form-group select", function () {
            $(this).closest(".form-group").removeClass("is-focus");
        });
    }

    /* =========================================================
        # TOOLTIP
    ========================================================= */
    function closeAllTooltips() {
        $(".tooltip-wrap").removeClass("is-open");
        $(".btn-tooltip").attr("aria-expanded", "false");
    }

    function bindTooltip() {
        $(document).on("click", ".btn-tooltip", function (e) {
            var $wrap = $(this).closest(".tooltip-wrap");
            var isOpen = $wrap.hasClass("is-open");

            e.preventDefault();
            closeAllTooltips();

            if (!isOpen) {
                $wrap.addClass("is-open");
                $(this).attr("aria-expanded", "true");
            }
        });

        $(document).on("click", function (e) {
            if (!$(e.target).closest(".tooltip-wrap").length) {
                closeAllTooltips();
            }
        });
    }

    /* =========================================================
        # TERMS
    ========================================================= */
    function validateTerms() {
        if (!$(".chkReq").length) {
            return true;
        }

        return $(".chkReq").length === $(".chkReq:checked").length;
    }

    /* =========================================================
        # AUTH PAGE VALIDATION
    ========================================================= */
    function hasTelField() {
        return hasElement("#tel-first") || hasElement("#tel-mid") || hasElement("#tel-last");
    }

    function validateTel(showError) {
        var $group = getGroup("#tel-first");
        var telFirst = getValue("#tel-first");
        var telMid = getValue("#tel-mid");
        var telLast = getValue("#tel-last");
        var isValid = true;

        if (hasTelField()) {
            isValid = telFirst !== "" && /^[0-9]{3,4}$/.test(telMid) && /^[0-9]{4}$/.test(telLast);
        }

        if (showError) {
            setError($group, !isValid);
        }

        return isValid;
    }

    function hasAddressField() {
        return hasElement("#zip-code") || hasElement("#address-base") || hasElement("#address-detail");
    }

    function validateAddress(showError) {
        var $group = getGroup("#zip-code");
        var zipCode = getValue("#zip-code");
        var addressBase = getValue("#address-base");
        var addressDetail = getValue("#address-detail");
        var isValid = true;

        if (hasAddressField()) {
            isValid = zipCode !== "" && addressBase !== "" && addressDetail !== "";
        }

        if (showError) {
            setError($group, !isValid);
        }

        return isValid;
    }

    function bindAddressApi() {
        $(document).on("click", "#btn-postcode", function () {
            if (typeof kakao === "undefined" || !kakao.Postcode) {
                return;
            }

            new kakao.Postcode({
                oncomplete: function (data) {
                    $("#zip-code").val(data.zonecode);
                    $("#address-base").val(data.roadAddress || data.jibunAddress);

                    if (isSubmitTried) {
                        validateAddress(true);
                    }

                    $("#address-detail").focus();
                }
            }).open();
        });
    }

    /* =========================================================
        # PAYMENT PAGE VALIDATION
    ========================================================= */
    function hasDepositorField() {
        return hasElement("#depositor-name");
    }

    function validateDepositor(showError) {
        var $group = getGroup("#depositor-name");
        var isValid = true;

        if (hasDepositorField()) {
            isValid = getValue("#depositor-name") !== "";
        }

        if (showError) {
            setError($group, !isValid);
        }

        return isValid;
    }

    function hasAccountField() {
        return hasElement("#bank-code") || hasElement("#account-number");
    }

    function validateAccount(showError) {
        var $group = getGroup("#bank-code");
        var bankValue = getValue("#bank-code");
        var accountValue = getValue("#account-number");
        var isValid = true;

        if (hasAccountField()) {
            isValid = bankValue !== "" && bankValue !== "0" && accountValue !== "";
        }

        if (showError) {
            setError($group, !isValid);
        }

        return isValid;
    }

    function hasEmailField() {
        return hasElement("#email-id") || hasElement("#email-domain");
    }

    function validateEmail(showError) {
        var $group = getGroup("#email-id");
        var emailId = getValue("#email-id");
        var emailDomain = getValue("#email-domain");
        var emailIdReg = /^[A-Za-z0-9._%+-]+$/;
        var emailDomainReg = /^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        var isValid = true;

        if (hasEmailField()) {
            isValid = emailId !== "" && emailDomain !== "" && emailIdReg.test(emailId) && emailDomainReg.test(emailDomain);
        }

        if (showError) {
            setError($group, !isValid);
        }

        return isValid;
    }

    function hasPaymentField() {
        return $("input[name='payment-type']").length > 0;
    }

    function getPaymentType() {
        return $("input[name='payment-type']:checked").val() || "next-month";
    }

    function getActiveDayButton() {
        var $buttons = $(".btn-payment-day");
        var $activeButton = $buttons.filter(".is-active");

        if (!$activeButton.length && $buttons.length) {
            $activeButton = $buttons.eq(0);
            $activeButton.addClass("is-active");
        }

        return $activeButton;
    }

    function updateFirstPaymentDate() {
        var $dateText = $("#first-payment-date");
        var paymentType = getPaymentType();
        var directDateValue = getValue("#direct-payment-date");
        var $activeButton = getActiveDayButton();
        var resultDate = "";

        if (!$dateText.length) {
            return;
        }

        if (paymentType === "direct-input") {
            resultDate = directDateValue !== "" ? directDateValue.replace(/-/g, ".") : "";
        } else if (paymentType === "current-month") {
            resultDate = $activeButton.attr("data-current-date") || "";
        } else {
            resultDate = $activeButton.attr("data-next-date") || "";
        }

        $dateText.text(resultDate);
    }

    function togglePaymentSchedule() {
        if (!hasPaymentField()) {
            return;
        }

        if (getPaymentType() === "direct-input") {
            $("#schedule-button-area").hide();
            $("#schedule-direct-area").show();
        } else {
            $("#schedule-button-area").show();
            $("#schedule-direct-area").hide();
        }

        updateFirstPaymentDate();
    }

    function validatePayment(showError) {
        var $group = $("#payment-date-title").closest(".info-card");
        var isValid = true;

        if (hasPaymentField() && getPaymentType() === "direct-input") {
            isValid = getValue("#direct-payment-date") !== "";
        }

        if (showError) {
            setError($group, !isValid);
        }

        return isValid;
    }

    /* =========================================================
        # LIVE VALIDATION
    ========================================================= */
    function bindLiveValidation() {
        $(document).on("blur input", "#depositor-name", function () {
            if (isSubmitTried) {
                validateDepositor(true);
            }
        });

        $(document).on("blur change input", "#bank-code, #account-number", function () {
            if (isSubmitTried) {
                validateAccount(true);
            }
        });

        $(document).on("blur input", "#email-id, #email-domain", function () {
            if (isSubmitTried) {
                validateEmail(true);
            }
        });

        $(document).on("blur change input", "#tel-first, #tel-mid, #tel-last", function () {
            if (isSubmitTried) {
                validateTel(true);
            }
        });

        $(document).on("blur input", "#address-detail", function () {
            if (isSubmitTried) {
                validateAddress(true);
            }
        });

        $(document).on("change", "input[name='payment-type']", function () {
            togglePaymentSchedule();

            if (isSubmitTried) {
                validatePayment(true);
            }
        });

        $(document).on("click", ".btn-payment-day", function () {
            $(".btn-payment-day").removeClass("is-active");
            $(this).addClass("is-active");
            updateFirstPaymentDate();

            if (isSubmitTried) {
                validatePayment(true);
            }
        });

        $(document).on("change input", "#direct-payment-date", function () {
            updateFirstPaymentDate();

            if (isSubmitTried) {
                validatePayment(true);
            }
        });
    }

    /* =========================================================
        # SUBMIT VALIDATION
        # 수정: 페이지 위에서 아래 순서대로 검사
    ========================================================= */
    function getValidationTasks() {
        return [
            {
                isActive: function () {
                    return $(".chkReq").length > 0;
                },
                validate: function () {
                    return validateTerms();
                },
                focus: function () {
                    $(".chkReq").eq(0).focus();
                },
                message: "필수 약관에 모두 동의해 주세요."
            },
            {
                isActive: function () {
                    return hasDepositorField();
                },
                validate: function () {
                    return validateDepositor(true);
                },
                focus: function () {
                    $("#depositor-name").focus();
                }
            },
            {
                isActive: function () {
                    return hasAccountField();
                },
                validate: function () {
                    return validateAccount(true);
                },
                focus: function () {
                    $("#bank-code").focus();
                }
            },
            {
                isActive: function () {
                    return hasEmailField();
                },
                validate: function () {
                    return validateEmail(true);
                },
                focus: function () {
                    $("#email-id").focus();
                }
            },
            {
                isActive: function () {
                    return hasTelField();
                },
                validate: function () {
                    return validateTel(true);
                },
                focus: function () {
                    $("#tel-first").focus();
                }
            },
            {
                isActive: function () {
                    return hasAddressField();
                },
                validate: function () {
                    return validateAddress(true);
                },
                focus: function () {
                    if (hasElement("#btn-postcode")) {
                        $("#btn-postcode").focus();
                    }
                }
            },
            {
                isActive: function () {
                    return hasPaymentField();
                },
                validate: function () {
                    return validatePayment(true);
                },
                focus: function () {
                    if (getPaymentType() === "direct-input" && hasElement("#direct-payment-date")) {
                        $("#direct-payment-date").focus();
                    } else {
                        $("input[name='payment-type']").eq(0).focus();
                    }
                }
            }
        ];
    }

    function runSubmitValidation() {
        var tasks = getValidationTasks();
        var i;
        var task;

        isSubmitTried = true;

        for (i = 0; i < tasks.length; i += 1) {
            task = tasks[i];

            if (!task.isActive()) {
                continue;
            }

            if (!task.validate()) {
                if (task.message) {
                    openSystemAlert(task.message);
                }

                if (typeof task.focus === "function") {
                    task.focus();
                }

                return false;
            }
        }

        return true;
    }

    function bindSubmit() {
        $(document).on("click", ".btn-submit", function () {
            if (!runSubmitValidation()) {
                return;
            }

            openSystemAlert("다음 단계 진행");
        });
    }

    /* =========================================================
        # DETAIL TERMS PAGE
        # 수정: 공통 accordionToggle 중복 바인딩 제거
    ========================================================= */
    function hasDetailTermsPage() {
        return $(".detail-contract .accordion-item").length > 0;
    }

    function getDetailTermsItems() {
        return $(".detail-contract .accordion-item");
    }

    function getDetailSubmitButton() {
        return $("#detail-sign-submit-btn");
    }

    function getTermStatus($item) {
        return $item.find(".term-status").first();
    }

    function isTermComplete($item) {
        return $.trim(getTermStatus($item).text()) === "확인 완료";
    }

    function syncDetailTermsState() {
        getDetailTermsItems().each(function () {
            var $item = $(this);
            var $tit = $item.children(".tit");
            var $toggleBtn = $tit.find(".btn-toggle");

            if (isTermComplete($item)) {
                $item.addClass("is-complete");
            } else {
                $item.removeClass("is-complete");
                getTermStatus($item).text("미확인");
            }

            $tit.attr("aria-expanded", $item.hasClass("on") ? "true" : "false");

            if ($toggleBtn.length) {
                $toggleBtn.attr("title", $item.hasClass("on") ? "닫기" : "열기");
            }
        });
    }

    function openDetailAccordion($item) {
        var $tit = $item.children(".tit");
        var $toggleBtn = $tit.find(".btn-toggle");

        $item.addClass("on");
        $tit.attr("aria-expanded", "true");

        if ($toggleBtn.length) {
            $toggleBtn.attr("title", "닫기");
        }
    }

    function closeDetailAccordion($item) {
        var $tit = $item.children(".tit");
        var $toggleBtn = $tit.find(".btn-toggle");

        $item.removeClass("on");
        $tit.attr("aria-expanded", "false");

        if ($toggleBtn.length) {
            $toggleBtn.attr("title", "열기");
        }
    }

    function toggleDetailAccordion($item) {
        if ($item.hasClass("on")) {
            closeDetailAccordion($item);
        } else {
            openDetailAccordion($item);
        }
    }

    function setDetailTermComplete($item) {
        getTermStatus($item).text("확인 완료");
        $item.addClass("is-complete");
    }

    function isAllDetailTermsComplete() {
        var $items = getDetailTermsItems();

        if (!$items.length) {
            return false;
        }

        return $items.length === $items.filter(function () {
            return isTermComplete($(this));
        }).length;
    }

    function updateDetailSubmitButton() {
        var $submitBtn = getDetailSubmitButton();
        var isEnabled = isAllDetailTermsComplete();

        if (!$submitBtn.length) {
            return;
        }

        $submitBtn.prop("disabled", !isEnabled);

        if (isEnabled) {
            $submitBtn.removeAttr("aria-disabled");
        } else {
            $submitBtn.attr("aria-disabled", "true");
        }
    }

    function bindDetailTermsAccordion() {
        if (!hasDetailTermsPage()) {
            return;
        }

        syncDetailTermsState();
        updateDetailSubmitButton();

        /* 수정: 공통 accordionToggle 클릭 이벤트 제거 */
        $(document).off("click", ".accordionToggle .accordion-item > .tit");

        /* 수정: 상세약정 전용 토글 1회만 바인딩 */
        $(document).off("click.detailTerms", ".detail-contract .accordion-item > .tit");
        $(document).on("click.detailTerms", ".detail-contract .accordion-item > .tit", function (e) {
            var $target = $(e.target);

            if ($target.closest(".detail-terms-action").length) {
                return;
            }

            toggleDetailAccordion($(this).closest(".accordion-item"));
        });

        $(document).off("keydown.detailTerms", ".detail-contract .accordion-item > .tit");
        $(document).on("keydown.detailTerms", ".detail-contract .accordion-item > .tit", function (e) {
            if (e.keyCode === 13 || e.keyCode === 32) {
                e.preventDefault();
                toggleDetailAccordion($(this).closest(".accordion-item"));
            }
        });

        $(document).off("click.detailTermsConfirm", ".detail-contract .btn-confirm-term");
        $(document).on("click.detailTermsConfirm", ".detail-contract .btn-confirm-term", function (e) {
            var $item = $(this).closest(".accordion-item");

            e.preventDefault();

            setDetailTermComplete($item);
            closeDetailAccordion($item);
            updateDetailSubmitButton();
        });

        $(document).off("click.detailTermsClose", ".detail-contract .btn-line");
        $(document).on("click.detailTermsClose", ".detail-contract .btn-line", function (e) {
            e.preventDefault();
        });

        $(document).off("click.detailTermsSubmit", "#detail-sign-submit-btn");
        $(document).on("click.detailTermsSubmit", "#detail-sign-submit-btn", function (e) {
            if ($(this).prop("disabled")) {
                e.preventDefault();
                return false;
            }
        });
    }

    /* =========================================================
        # SUMMARY PAGE
        # 수정: 체크박스 체크 시 하단 버튼 활성화
    ========================================================= */
    function hasSummaryPage() {
        return $("#same-email").length > 0 && $("#summary-next-btn").length > 0;
    }

    function updateSummarySubmitButton() {
        var $agreeCheck = $("#same-email");
        var $nextBtn = $("#summary-next-btn");

        if (!$agreeCheck.length || !$nextBtn.length) {
            return;
        }

        $nextBtn.prop("disabled", !$agreeCheck.prop("checked"));

        if ($agreeCheck.prop("checked")) {
            $nextBtn.removeAttr("aria-disabled");
        } else {
            $nextBtn.attr("aria-disabled", "true");
        }
    }

    function bindSummaryCheck() {
        if (!hasSummaryPage()) {
            return;
        }

        updateSummarySubmitButton();

        $(document).on("change", "#same-email", function () {
            updateSummarySubmitButton();
        });

        $(document).on("click", "#summary-next-btn", function (e) {
            if ($(this).prop("disabled")) {
                e.preventDefault();
                return false;
            }
        });
    }

    /* =========================================================
        # E-SIGN POPUP
        # 수정: 서명 캔버스 + 인감도장 업로드
    ========================================================= */
    function hasEsignPopup() {
        return $("#esign-popup").length > 0;
    }

    function hasEsignCanvas() {
        return $(".js-sign-wrap .esign-sign-canvas").length > 0;
    }

    function formatFileSize(bytes) {
        if (bytes >= 1024 * 1024) {
            return (bytes / (1024 * 1024)).toFixed(1) + "MB";
        }

        if (bytes >= 1024) {
            return Math.round(bytes / 1024) + "kb";
        }

        return bytes + "byte";
    }

    function resetEsignUpload() {
        var $uploadBox = $(".esign-upload-box");
        var $fileInput = $("#esign-stamp-file");
        var $fileLabel = $uploadBox.find(".esign-file .fileLabel");

        $uploadBox.removeClass("is-complete");
        $uploadBox.find(".esign-upload-file-name").text("");
        $uploadBox.find(".esign-upload-file-size").text("");
        $fileInput.val("");
        $fileLabel.text("파일 선택"); /* 수정: 삭제 후 라벨 문구 초기화 */
    }

    function setEsignUpload(file) {
        var fileName = file.name;
        var fileSize = formatFileSize(file.size);
        var extension = fileName.split(".").pop().toLowerCase();
        var allowedExtensions = ["png", "jpg", "jpeg"];
        var $uploadBox = $(".esign-upload-box");
        var $fileLabel = $uploadBox.find(".esign-file .fileLabel");

        if ($.inArray(extension, allowedExtensions) === -1) {
            openSystemAlert("PNG, JPG 파일만 업로드할 수 있습니다.");
            resetEsignUpload();
            return false;
        }

        if (file.size >= 300 * 1024) {
            openSystemAlert("300KB 미만 파일만 업로드할 수 있습니다.");
            resetEsignUpload();
            return false;
        }

        $uploadBox.addClass("is-complete");
        $uploadBox.find(".esign-upload-file-name").text(fileName);
        $uploadBox.find(".esign-upload-file-size").text(fileSize);
        $fileLabel.text(fileName); /* 수정: 파일 선택 시 라벨도 파일명으로 변경 */

        return true;
    }

    function bindEsignUpload() {
        if (!hasEsignPopup()) {
            return;
        }

        $(document).off("change.esignUpload", "#esign-stamp-file");
        $(document).on("change.esignUpload", "#esign-stamp-file", function () {
            var file = this.files && this.files[0] ? this.files[0] : null;

            if (!file) {
                resetEsignUpload();
                return;
            }

            setEsignUpload(file);
        });

        $(document).off("click.esignUploadDelete", ".btn-upload-delete");
        $(document).on("click.esignUploadDelete", ".btn-upload-delete", function (e) {
            e.preventDefault();
            resetEsignUpload();
        });
    }

    function initEsignCanvas() {
        if (!hasEsignCanvas()) {
            return;
        }

        $(".js-sign-wrap").each(function () {
            var $wrap = $(this);
            var $canvas = $wrap.find(".esign-sign-canvas");
            var $resetBtn = $wrap.find(".btn-sign-reset");
            var $placeholder = $wrap.find(".esign-sign-placeholder");
            var canvas = $canvas[0];
            var ctx = canvas.getContext("2d");
            var isDrawing = false;
            var hasDrawn = false;

            function setCanvasStyle() {
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.strokeStyle = "#222222";
                ctx.lineWidth = 2;
            }

            function resizeCanvas() {
                var width = $wrap.innerWidth();
                var height = $wrap.innerHeight();
                var imageData = null;

                if (canvas.width && canvas.height) {
                    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                }

                canvas.width = width;
                canvas.height = height;

                setCanvasStyle();

                if (imageData) {
                    ctx.putImageData(imageData, 0, 0);
                }
            }

            function getPoint(e) {
                var rect = canvas.getBoundingClientRect();
                var originalEvent = e.originalEvent;
                var point = originalEvent.touches ? originalEvent.touches[0] : e;

                return {
                    x: point.clientX - rect.left,
                    y: point.clientY - rect.top
                };
            }

            function showPlaceholder(isShow) {
                if (isShow) {
                    $wrap.removeClass("is-signed");
                    $placeholder.show();
                } else {
                    $wrap.addClass("is-signed");
                    $placeholder.hide();
                }
            }

            function startDraw(e) {
                var point;

                e.preventDefault();
                isDrawing = true;
                point = getPoint(e);

                ctx.beginPath();
                ctx.moveTo(point.x, point.y);
            }

            function draw(e) {
                var point;

                if (!isDrawing) {
                    return;
                }

                e.preventDefault();
                point = getPoint(e);

                ctx.lineTo(point.x, point.y);
                ctx.stroke();

                if (!hasDrawn) {
                    hasDrawn = true;
                    showPlaceholder(false);
                }
            }

            function endDraw() {
                if (!isDrawing) {
                    return;
                }

                isDrawing = false;
                ctx.closePath();
            }

            function resetCanvas() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                hasDrawn = false;
                showPlaceholder(true);
            }

            resizeCanvas();
            showPlaceholder(true);

            $canvas.off(".esignCanvas");
            $resetBtn.off(".esignCanvas");

            $canvas.on("mousedown.esignCanvas", startDraw);
            $canvas.on("mousemove.esignCanvas", draw);
            $canvas.on("mouseleave.esignCanvas", endDraw);
            $canvas.on("touchstart.esignCanvas", startDraw);
            $canvas.on("touchmove.esignCanvas", draw);
            $canvas.on("touchend.esignCanvas touchcancel.esignCanvas", endDraw);

            $(document).off("mouseup.esignCanvas").on("mouseup.esignCanvas", endDraw);
            $(window).off("resize.esignCanvas").on("resize.esignCanvas", function () {
                resizeCanvas();
            });

            $resetBtn.on("click.esignCanvas", function (e) {
                e.preventDefault();
                resetCanvas();
            });
        });
    }

    /* =========================================================
        # LOADING TEXT CONTROL
        # 수정: 상태별 텍스트만 변경
    ========================================================= */
    var loadingStateMap = {
        check: {
            title: "안전한 금융거래를 위해<br />신원 확인 및 권한 검증을 진행하고 있습니다.",
            desc: "페이지를 새로고침 하거나 창을 닫을 경우 인증이 취소될 수 있습니다.<br />잠시만 기다려 주세요."
        },
        delay: {
            title: "인증 처리 시간이 예상보다 길어지고 있습니다.",
            desc: "통신 환경에 따라 다소 시간이 걸릴 수 있으며, 계속해서 화면이 멈춰있다면,<br />고객센터 또는 담당자에게 연락 주시면 빠르게 확인 도와드리겠습니다."
        },
        encrypt: {
            title: "서명 정보 결합 및 보안 암호화 처리를<br />진행하고 있습니다.",
            desc: "페이지를 새로고침 하거나 창을 닫을 경우 인증이 취소될 수 있습니다.<br />잠시만 기다려 주세요."
        }
    };

    function setLoadingState(type) {
        var state = loadingStateMap[type];

        if (!state) {
            return;
        }

        $("#loading-title").html(state.title);
        $("#loading-desc").html(state.desc);
    }

    window.setLoadingState = setLoadingState;

    /* =========================================================
        # INIT
    ========================================================= */
    function init() {
        bindNumberOnly();
        bindFocusState();
        bindTooltip();
        bindAddressApi();
        bindLiveValidation();
        bindSubmit();
        togglePaymentSchedule();
        bindDetailTermsAccordion();
        bindSummaryCheck();
        initEsignCanvas();
        bindEsignUpload();
    }

    init();
});