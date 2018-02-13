/***************************************************************************************************
LoadingOverlay - A flexible loading overlay jQuery plugin
    Author          : Gaspare Sganga
    Version         : 1.6.0
    License         : MIT
    Documentation   : https://gasparesganga.com/labs/jquery-loading-overlay/
****************************************************************************************************/
;(function(factory){
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module
        define(["jquery"], factory);
    } else if (typeof exports === "object") {
        // Node/CommonJS
        factory(require("jquery"));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function($, undefined){
    // Default Settings
    var _defaults = {
        "color"             : "rgba(255, 255, 255, 0.8)",
        "custom"            : "",
        "fade"              : true,
        "fontawesome"       : "",
        "imagePosition"     : "center center",
        "maxSize"           : "100px",
        "minSize"           : "20px",
        "resizeInterval"    : 50,
        "size"              : "50%",
        "zIndex"            : 2147483647
    };
    
    $.LoadingOverlaySetup = function(settings){
        $.extend(true, _defaults, settings);
    };
    
    $.LoadingOverlay = function(action, options){
        switch (action.toLowerCase()) {
            case "show":
                var settings = $.extend(true, {}, _defaults, options);
                _Show("body", settings);
                break;
                
            case "hide":
                _Hide("body", options);
                break;
        }
    };
    
    $.fn.LoadingOverlay = function(action, options){
        switch (action.toLowerCase()) {
            case "show":
                var settings = $.extend(true, {}, _defaults, options);
                return this.each(function(){
                    _Show(this, settings);
                });
                
            case "hide":
                return this.each(function(){
                    _Hide(this, options);
                });
        }
    };
    
    
    function _Show(container, settings){
        if($("#overlay-animation").length ==0){
            $("<style id=\"overlay-animation\">").html(" @keyframes loadingOverlayAnimation { from { transform: scale(1); } to { transform: scale(.2); } }").appendTo("body");
        }
        container = $(container);
        var wholePage   = container.is("body");
        var count       = container.data("LoadingOverlayCount");
        if (count === undefined) count = 0;
        if (count === 0) {
            var overlay = $("<div>", {
                "class" : "loadingoverlay",
                "css"   : {
                    "background-color"  : settings.color,
                    "position"          : "relative",
                    "display"           : "flex",
                    "flex-direction"    : "column",
                    "align-items"       : "center",
                    "justify-content"   : "center"
                }
            });
            var t = .6;
            var overlayCirle = $("<div>", { "class": "loadingoverlaycircle", "css": {
                "position"        : "absolute",
                "width"           : 13,
                "height"          : 13,
                "backgroundColor" : "#000",
                "borderRadius"    : "100%",
                "animation": "loadingOverlayAnimation " + t +"s infinite cubic-bezier(.3,0,1,.75)"
            } });
            var centeredSquare = $("<div>", {"css":{
                "position" : "relative",
                "width"    : "300px",
                "height"   : "300px",
                "maxWidth" : "100%",
                "maxHeight": "100%" 
            }
            });
            overlay.append(centeredSquare);

            if (settings.zIndex !== undefined) overlay.css("z-index", settings.zIndex);
            if (settings.fontawesome) $("<div>", {
                "class" : "loadingoverlay_fontawesome " + settings.fontawesome
            }).appendTo(overlay);
            if (settings.custom) $(settings.custom).appendTo(overlay);
            if (wholePage) {
                overlay.css({
                    "position"  : "fixed",
                    "top"       : 0,
                    "left"      : 0,
                    "width"     : "100%",
                    "height"    : "100%"
                });
            } else {
                overlay.css("position", (container.css("position") === "fixed") ? "fixed" : "absolute");
            }
            _Resize(container, overlay, settings, wholePage);

            if (settings.resizeInterval > 0) {
                var resizeIntervalId = setInterval(function(){
                    _Resize(container, overlay, settings, wholePage);
                }, settings.resizeInterval);
                container.data("LoadingOverlayResizeIntervalId", resizeIntervalId);
            }
            if (!settings.fade) {
                settings.fade = [0, 0];
            } else if (settings.fade === true) {
                settings.fade = [400, 200];
            } else if (typeof settings.fade === "string" || typeof settings.fade === "number") {
                settings.fade = [settings.fade, settings.fade];
            }
            container.data({
                "LoadingOverlay"                : overlay,
                "LoadingOverlayFadeOutDuration" : settings.fade[1]
            });
            overlay
                .hide()
                .appendTo("body")
                .fadeIn(settings.fade[0]);

            var r = 50;
            var pi = Math.PI;
            var n = 12;
            var w = centeredSquare.innerWidth();
            var h = centeredSquare.innerHeight();
            for (var i = 0; i < n; i++) {
                centeredSquare.append(overlayCirle.clone().css({
                    left: (w / 2 + Math.sin((2 * pi / n) * i) * r),
                    top: (h / 2 + Math.cos((2 * pi / n) * i) * r),
                    animationDelay: -t / n * i + 's'
                }));
            }
        }
        count++;
        container.data("LoadingOverlayCount", count);
    }

    function _Hide(container, force){
        container = $(container);
        var count = container.data("LoadingOverlayCount");
        if (count === undefined) return;
        count--;
        if (force || count <= 0) {
            var resizeIntervalId = container.data("LoadingOverlayResizeIntervalId");
            if (resizeIntervalId) clearInterval(resizeIntervalId);
            container.data("LoadingOverlay").fadeOut(container.data("LoadingOverlayFadeOutDuration"), function(){
                $(this).remove();
            });
            container.removeData(["LoadingOverlay", "LoadingOverlayCount", "LoadingOverlayFadeOutDuration", "LoadingOverlayResizeIntervalId"]);
        } else {
            container.data("LoadingOverlayCount", count);
        }
    }
    
    function _Resize(container, overlay, settings, wholePage){
        if (!wholePage) {
            var x = (container.css("position") === "fixed") ? container.position() : container.offset();
            overlay.css({
                "top"       : x.top + parseInt(container.css("border-top-width"), 10),
                "left"      : x.left + parseInt(container.css("border-left-width"), 10),
                "width"     : container.innerWidth(),
                "height"    : container.innerHeight()
            });
        }
        var c    = wholePage ? $(window) : container;
        var size = "auto";
        if (settings.size && settings.size != "auto") {
            size = Math.min(c.innerWidth(), c.innerHeight()) * parseFloat(settings.size) / 100;
            if (settings.maxSize && size > parseInt(settings.maxSize, 10)) size = parseInt(settings.maxSize, 10) + "px";
            if (settings.minSize && size < parseInt(settings.minSize, 10)) size = parseInt(settings.minSize, 10) + "px";
        }
        overlay.children(".loadingoverlay_fontawesome").css("font-size", size);
    }
    
}));