define(function(require) {
    'use strict';
    var Adapt = require("core/js/adapt");
    var Backbone = require("backbone");
    var PaginatorView = Backbone.View.extend({
        className: "paginator",
        initialize: function() {
            this.listenTo(Adapt, "remove", this.cleanupView);
            this.render();
        },
        events: {
            "click .paginator-item-link": "onItemClicked",
            "mouseover .paginator-item-link": "onItemMouseOver",
            "mouseout .paginator-item-link": "onItemMouseOut",
            "click .paginator-control-up": "onControlUpClicked",
            "click .paginator-control-down": "onControlDownClicked",
            "touchstart .paginator-item-link": "onItemTouched"
        },
        preRender: function() {
            console.log("PreRender");
            this.data = this.model.toJSON();
            this.paginationMode = this.model.get("_paginator")._paginationMode || "articles";
            if (this.paginationMode === "blocks") {
                this.paginationElement = "block"
            } else if (this.paginationMode === "articles") {
                this.paginationElement = "article"
            }
            this.items = this.model.findDescendants(this.paginationMode);
            this.data.items = this.items.toJSON();
            this.listenTo(this.items, "change:_isComplete", this.onItemComplete);
            this.onPageViewReady();

        },
        render: function() {
            this.preRender();
            var template = Handlebars.templates["paginator"];
            var items = {
                _items: this.model.findDescendants('blocks').toJSON()
            };
            this.$el.html(template(items));
            _.defer(_.bind(function() {
                this.postRender()
            }, this));
            return this
        },
        postRender: function() {
            this.setupFirstItem();
            this.checkIfAnyElementsAreAlreadyComplete();
        },
        setupFirstItem: function() {
            this.$(".paginator-item").eq(0).addClass("active");
        },
        checkIfAnyElementsAreAlreadyComplete: function() {
            this.items.each(function(e) {
                this.onItemComplete(e, e.get("_isComplete"));
            }, this)
        },
        onItemClicked: function(e) {
            e.preventDefault();
            var t = $(e.currentTarget).attr("data-index");
            this.scrollToIndex(t);
        },
        onItemMouseOver: function(event) {
            $(event.currentTarget).siblings(".paginator-item-title").removeClass("display-none").velocity({
                opacity: 1,
                right: "+=10px"
            })
        },
        onItemMouseOut: function(event) {
            var t = $(event.currentTarget).siblings(".paginator-item-title");
            t.velocity({
                opacity: 0,
                right: "-=10px"
            }, {
                complete: function(e) {
                    t.addClass("display-none");
                }
            })
        },
        onControlUpClicked: function(e) {
            e.preventDefault();
            if (this.itemIndex === 0) return;
            this.scrollToIndex(this.itemIndex - 1);
        },
        onControlDownClicked: function(event) {
            event.preventDefault();
            if (this.itemIndex === this.items.length - 1) return;
            this.scrollToIndex(this.itemIndex + 1);
        },
        onItemTouched: function(event) {
            event.preventDefault();
            var index = $(event.currentTarget).attr("data-index");
            this.scrollToIndex(index);
            this.onItemMouseOver(event);
            var self = this;
            _.delay(function() {
                self.onItemMouseOut(event);
            }, 2000)
        },
        onPageViewReady: function(e) {
            _.defer(function() {
                $(window).resize()
            });
            this.scrollTop = 0;
            this.itemIndex = 0;
            this._isScrolling = false;
            this._isAnimating = false;
            if (this.shouldPaginate()) {
                if (this.paginationMode === "blocks") {
                    this.removeArticleText()
                }
                this.addClassToActiveElement(this.itemIndex);
                this.removePageText();
                this.setSizeOfElements();
                $("html").addClass("paginator-active").removeClass("paginator-half-active")
            } else {
                $("html").removeClass("paginator-active").addClass("paginator-half-active");
                this.addClassToActiveElement(this.itemIndex)
            }
        },
        shouldPaginate: function() {
            return false
        },
        removePageText: function() {
            $(".page-title, .page-body").addClass("display-none")
        },
        showPageText: function() {
            $(".page-title, .page-body").removeClass("display-none")
        },
        removeArticleText: function() {
            $(".article-title, .article-body").addClass("display-none")
        },
        showArticleText: function() {
            $(".article-title, .article-body").removeClass("display-none")
        },
        setSizeOfElements: function() {
            var e = $(window).width();
            var t = $(window).height();
            var i = $(".navigation").height();
            var s = this.$el.height();
            var n = e;
            var o = t - i;
            this.itemHeight = o;
            $(".page, ." + this.paginationElement).width(n).height(o);
            this.$el.css({
                "margin-top": -(s / 2)
            })
        },
        setupPageEvents: function() {
            var e = this;
            var t = function(t) {
                t.preventDefault();
                if (t.originalEvent.wheelDelta > 0 || t.originalEvent.detail < 0) {
                    e.scrollUp()
                } else {
                    e.scrollDown()
                }
            };
            var i = _.debounce(t, 350, true);
            $(window).on("mousewheel DOMMouseScroll", i);
            $("body").on("keyup", function(t) {
                if (t.which === 40) {
                    if ($(document.activeElement).is("body") || $(document.activeElement).is(".paginator a")) {
                        e.scrollDown()
                    }
                }
                if (t.which === 38) {
                    if ($(document.activeElement).is("body") || $(document.activeElement).is(".paginator a")) {
                        e.scrollUp()
                    }
                }
            });
            var s;
            var n = 0;
            var o;
            var r = 150;
            var a = 300;
            $("body").on("touchstart", function(e) {
                s = e.originalEvent.touches[0].pageY;
                n = (new Date).getTime()
            });
            $("body").on("touchmove", function(e) {
                o = e.originalEvent.changedTouches[0].pageY;
                if (Math.abs(o - s) > 10) {
                    e.preventDefault()
                }
            });
            $("body").on("touchend", function(t) {
                endY = t.originalEvent.changedTouches[0].pageY;
                endTime = (new Date).getTime();
                var i = endTime - n;
                if (i <= a) {
                    if (Math.abs(endY - s) >= r) {
                        if (endY - s < 0) {
                            e.scrollDown()
                        } else {
                            e.scrollUp()
                        }
                    }
                }
            })
        },
        removePageEvents: function() {
            $(window).off("mousewheel DOMMouseScroll");
            if (this.scrollCallback) {
                $(window).off("scroll", this.scrollCallback)
            }
            $("body").off("keyup touchstart touchmove touchend")
        },
        scrollUp: function() {
            if (this.itemIndex === 0) return;
            this.scrollToIndex(this.itemIndex - 1)
        },
        scrollDown: function() {
            if (this.itemIndex === this.items.length - 1) return;
            this.scrollToIndex(this.itemIndex + 1)
        },
        scrollToIndex: function(e) {
            if (this._isAnimating) return;
            this._isAnimating = true;
            this.itemIndex = parseInt(e);
            this.setElementsToHidden();
            this.addClassToActiveElement(this.itemIndex);
            if (this.shouldPaginate()) {
                $(".page-inner").velocity({
                    "margin-top": -(this.itemIndex * this.itemHeight)
                }, {
                    complete: _.bind(function() {
                        this.updateSidebar();
                        Adapt.trigger("paginator:scrolledToIndex:" + this.itemIndex);
                        this.setElementsToVisible();
                        this._isAnimating = false;
                        if (this.itemIndex === this.items.length - 1) {
                            Adapt.trigger("paginator:scrolledToIndex:lastItem")
                        }
                    }, this),
                    easing: "easeInOutQuad",
                    duration: 1400
                })
            } else {
                $.scrollTo($("." + this.paginationElement)[this.itemIndex], 1400, {
                    axis: "y",
                    interrupt: false,
                    onAfter: _.bind(function() {
                        this.updateSidebar();
                        Adapt.trigger("paginator:scrolledToIndex:" + this.itemIndex);
                        this.setElementsToVisible();
                        this._isAnimating = false;
                        if (this.itemIndex === this.items.length - 1) {
                            Adapt.trigger("paginator:scrolledToIndex:lastItem")
                        }
                    }, this),
                    offset: {
                        top: -$(".navigation").height()
                    }
                })
            }
        },
        jumpToIndex: function(e) {
            if (this._isAnimating) return;
            this.itemIndex = parseInt(e);
            this.addClassToActiveElement(this.itemIndex);
            $(".page-inner").css({
                "margin-top": -(this.itemIndex * this.itemHeight)
            })
        },
        addClassToActiveElement: function(e) {
            $("." + this.paginationElement).removeClass("paginator-active-element").eq(e).addClass("paginator-active-element")
        },
        setElementsToVisible: function(e) {
            this.model.setOnChildren({
                _isVisible: true
            }, {
                pluginName: "_paginator"
            });
            $(".paginator-active-element .component").each(function() {
                var e = $("*", $(this)).each(function() {
                    if ($(this).data("inview") !== undefined) {
                        $(this).data("inview", false)
                    }
                });
                $(window).scroll()
            })
        },
        setElementsToHidden: function(e) {
            this.model.setOnChildren({
                _isVisible: false
            }, {
                pluginName: "_paginator"
            })
        },
        updateSidebar: function() {
            this.$(".paginator-item").removeClass("active").eq(this.itemIndex).addClass("active")
        },
        cleanupView: function() {
            $("html").removeClass("paginator-active");
            this.removePageEvents();
            this.remove()
        },
        onWindowResize: function() {
            if (this.shouldPaginate()) {
                this.removePageText();
                if (this.paginationMode === "blocks") {
                    this.removeArticleText()
                }
                this.jumpToIndex(this.itemIndex);
                this.setupPageEvents();
                this.$el.removeClass("display-none");
                this.setSizeOfElements();
                $("html").addClass("paginator-active").removeClass("paginator-half-active")
            } else {
                this.showPageText();
                this.showArticleText();
                this.removePageEvents();
                this.setupScrollProgressTracker();
                var e = this.$el.height();
                this.$el.css({
                    "margin-top": -(e / 2)
                });
                $("html").removeClass("paginator-active").addClass("paginator-half-active");
                $(".page, ." + this.paginationElement).width("").height("");
                $("." + this.paginationElement).removeClass("paginator-active-element")
            }
            Adapt.trigger("paginator:resize");
        },
        onPageLevelProgressItemClicked: function(e) {
            var t = $(e).closest("." + this.paginationElement).index();
            this.scrollToIndex(t - 1)
        },
        onItemComplete: function(e, t) {
            if (t) {
                this.$("#paginator-" + e.get("_id")).addClass("paginator-complete")
            }
        },
        setupScrollProgressTracker: function() {
            var e = this;
            var t = $(window);
            var i = $("." + this.paginationElement);
            i.each(function(e) {
                $(this).attr("data-index", e)
            });
            var s = function(t) {
                var s = 160;
                i.each(function(i) {
                    var n = $(this).offset().top;
                    var o = $(this).height();
                    var r = n + o;
                    if (i < e.items.length - 1) {
                        if (t + s >= n && t <= r) {
                            e.itemIndex = i
                        }
                    } else {
                        if (t + s >= n && t <= r || $(window).scrollTop() + $(window).height() > $(document).height() - 100) {
                            e.itemIndex = i
                        }
                    }
                });
                e.updateSidebar()
            };
            if ($("html").hasClass("iPad") || $("html").hasClass("iPhone")) {
                _.throttle($("body").on("touchmove", function(e) {
                    s($(this).scrollTop())
                }), 700, true)
            } else {
                this.scrollCallback = function() {
                    s($(this).scrollTop())
                };
                _.throttle(t.on("scroll", this.scrollCallback), 350, true)
            }
        }
    });
    return PaginatorView;
});