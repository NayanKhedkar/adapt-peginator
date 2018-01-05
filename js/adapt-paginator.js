define(function (require) {

    var Adapt = require("core/js/adapt");
    var Backbone = require("backbone");
    var PaginatorView = require("./paginatorView");

    Adapt.on("app:dataReady", function() {
        if (isPeginatorAvail(Adapt.course)) {
            Adapt.on("pageView:ready", function(page) {
                if (isPeginatorAvail(page.model)) {
                    setUpView(page);
                }
            });
            Adapt.on("device:changed", function(PaginatorView) {
                Adapt.trigger("pagination:cleanUpViews");
                setUpView(page);
            });
        }
    });
    var setUpView = function(page) {
        var paginatorView = new PaginatorView({
            model: page.model
        });
        page.$el.parent().append(paginatorView.$el);
    };
    var isPeginatorAvail = function(model) {
        return model.get("_paginator") && model.get("_paginator")._isEnabled;
    };
});