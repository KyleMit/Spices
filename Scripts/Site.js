/*globals window,$*/

(function () {
    "use strict";

    $(function () {
        


    });

    
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

        $('body').scrollspy({
            target: '#sidebar',
            offset: 70
        });
        
        scrollToElement(window.location.hash);
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

function scrollToElement(idSelector) {
    $('html, body').animate({
        scrollTop: $(idSelector).offset().top
    }, 1000);
}
