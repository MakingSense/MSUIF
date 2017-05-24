$(".case-studies__item").click(function() {
    var item = $(this);
    if (!item.hasClass('active') && !item.hasClass('closing')) {
        item.addClass("index");
        item.addClass("active");
        setTimeout(function() {
            item.removeClass("index");
            item.find('.content').addClass("visible");
        }, 450);
    }
});

$(".case-studies__close").click(function() {
    var item = $(this).parents('.case-studies__item');
    item.removeClass("active");
    item.addClass("index");
    item.addClass("closing");
    item.find('.content').removeClass("visible");
    setTimeout(function() {
        item.removeClass("closing");
        item.removeClass("index");
    }, 450);
});