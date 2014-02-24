/*globals window,$*/

(function () {
    "use strict";

    $(function () {
        
        // when menu item clicked
        $("a[href^='#']").click(function () {
            // scroll to position
            navigateToElement(this);
        });

        $(".MobileToggle a").click(function () {
            var viewport = ($(this).attr('id') === "MobileSite") ?
                            'width=device-width, initial-scale=1.0' :
                            'width=1000';
            $("meta[name=viewport]").attr('content', viewport);
            $(".MobileToggle").toggle();
            return false;
        });

        $("#ViewResume").click(function() {
            //showPdfDialog();
        });
    });

    function navigateToElement(pageLink) {
        // get href attribute
        var idSelector = $(pageLink).attr('href');
        // make sure we have a valid id
        if ($(idSelector).length > 0) {
            // scroll down page
            scrollToElement(idSelector);
            // reset url hash
            setHash(idSelector);
            // return false so we don't refresh
            //return false;    
        }
    }

    function scrollToElement(idSelector) {
        $('html, body').animate({
            scrollTop: $(idSelector).offset().top
        }, 1000);
    }

    function setHash(hash) {
        window.location.hash = hash;
    }

}());

function InitializePage() {
    var key = "0Ai98c4sbCLFEdHRTLWY3UEtTUzUwTVhveGN2bTJicHc";
    var url = "http://cors.io/spreadsheets.google.com/feeds/list/" + key + "/od6/public/values?alt=json";

    $.getJSON(url, function (data) {
        var context = convertData(data);
        
        var template = getTemplate("templates\\template.html","#spice-listing");
        var output = template(context);
        $("#BodyPlaceholder").append(output);

        template = getTemplate("templates\\template.html", "#nav-listing");
        output = template(context);
        $("#NavPlaceholder").append(output);
    });

}

function convertData(originalData) {
    var spices = [];
    var context = new Object;
    
    $.each(originalData.feed.entry, function (index, value) {
        var spice = new Object;
        var category = value.gsx$category.$t;

        spice.Name = value.gsx$name.$t;
        spice.ID = value.gsx$id.$t;
        spice.Image = value.gsx$imageurl.$t;
        spice.Brand = value.gsx$brand.$t;
        spice.PurchasedDate = value.gsx$purchaseddate.$t;
        spice.Price = value.gsx$price.$t;
        spice.Ingredients = value.gsx$ingredients.$t;
        spice.Description = value.gsx$description.$t;
        spice.Link = value.gsx$link.$t;

        //if doesn't already have cateogy
        //create new category
        if (!(category in spices)) {
            var container = new Object;
            container.name = category;
            container.spices = [];
            spices[category] = container;
        }

        spices[category].spices.push(spice);
    });

    //converted named properties to anonymous array
    var spiceArray = [];
    for (var property in spices) {
        if (spices.hasOwnProperty(property)) {
            spiceArray.push(spices[property]);
        }
    }

    context.categories = spiceArray;

    return context;
}

function getTemplate(path, selector) {
    var template;

    $.ajax({
        url: path,
        async: false,
        success: function (data) {
            var source = $(data).filter(selector).html();
            template = Handlebars.compile(source);
        }
    });
    
    return template;
}