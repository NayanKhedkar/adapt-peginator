define(function (require) {
    var Backbone = require("backbone");
    var Adapt = require("core/js/adapt");
    var PaginatorDrawerView = require("./adapt-paginatorDrawerView");
    var PaginatorNavigationView = Backbone.View.extend({
        tagName: "a",
        className: "paginator-navigation",
        events: {
            click: "onPaginatorClicked"
        },
        initialize: function () {
            this.listenTo(Adapt, "remove", this.remove);
            this.listenTo(this.collection, "change:_isComplete", this.updateProgressBar);
            this.listenTo(Adapt, "pagination:cleanUpViews", this.remove);
            this.$el.attr("href", "#");
            this.data = {};
            this.data._shouldShowProgress = true;
            if (Adapt.course.get("_paginator")._shouldShowProgressOnMobile === false) {
                this.data._shouldShowProgress = false
            }
            this.render();
            this.updateProgressBar();
            _.defer(function () {
                $(window).resize()
            })
        },
        render: function () {
            var template = Handlebars.templates["paginatorNavigation"];
            $(".navigation-drawer-toggle-button").after(this.$el.html(template(this.data)))
        },
        onPaginatorClicked: function (event) {
            event.preventDefault();
            Adapt.drawer.triggerCustomView(new PaginatorDrawerView({
                collection: this.collection
            }).$el, false)
        },
        updateProgressBar: function () {
            var length = this.collection.where({
                _isComplete: true
            }).length / this.collection.length;
            var width = length * 100;
            this.$(".paginator-navigation-bar").css("width", width + "%")
        }
    });
    return PaginatorNavigationView;
});