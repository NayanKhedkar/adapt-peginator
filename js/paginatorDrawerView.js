define(function (require) {
    var Backbone = require("backbone");
    var Adapt = require("core/js/adapt");
    var PaginatorDrawerView = Backbone.View.extend({
        className: "paginator-drawer",
        initialize: function () {
            this.listenTo(Adapt, "remove", this.remove);
            this.listenTo(Adapt, "pagination:cleanUpViews", this.remove);
            this.render()
        },
        events: {
            "click .paginator-drawer-item a": "scrollToPageElement"
        },
        scrollToPageElement: function (evt) {
            evt.preventDefault();
            var $ele = $("." + $(evt.currentTarget).attr("data-paginator-drawer-id"));
            $(window).scrollTo($ele, {
                offset: {
                    top: -$(".navigation").height()
                }
            });
            Adapt.trigger("page:scrollTo", i);
            Adapt.trigger("drawer:closeDrawer")
        },
        render: function () {
            var data = this.collection.toJSON();
            var template = Handlebars.templates["paginatorDrawer"];
            this.$el.html(template({
                items: data
            }));
            return this
        }
    });
    return PaginatorDrawerView;
});