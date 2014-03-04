/*globals window,$*/

(function () {
    "use strict";
    $(function () {
        initializePage();
    });
    

    function initializePage() {
        var key = "0Ai98c4sbCLFEdHRTLWY3UEtTUzUwTVhveGN2bTJicHc";
        var url = "http://cors.io/spreadsheets.google.com/feeds/list/" + key + "/od6/public/values?alt=json";

        $.getJSON(url, function (data) {
            createPage(data);
        });

    }

    function createPage(data) {
        var context = convertData(data);

        applyTemplates(context);

        addMenuNavBarHandler();

        addScrollSpy();

        addSmoothScrollingToAnchors();

        goToCurrentAnchor();
    }

    function convertData(originalData) {
        var spices = [];
        var context = new Object;

        $.each(originalData.feed.entry, function (index, value) {
            var spice = new Object;

            spice.Name = value.gsx$name.$t;
            spice.Category = value.gsx$category.$t;
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
            if (!(spice.Category in spices)) {
                var container = new Object;
                container.name = spice.Category;
                container.spices = [];
                spices[spice.Category] = container;
            }

            spices[spice.Category].spices.push(spice);
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

    function applyTemplates(context) {
        applyTemplate(context, "#SpiceContentTemplate", "#SpiceContentPlaceholder");
        applyTemplate(context, "#SideNavBarTemplate", "#SideNavBarPlaceholder");
        applyTemplate(context, "#TopNavBarTemplate", "#TopNavBarPlaceholder");
    }

    function applyTemplate(context, templateID, targetID) {
        var template = getTemplate("templates\\template.html", templateID);
        var output = template(context);
        $(targetID).append(output);
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

    function addMenuNavBarHandler() {
        $('body').click(function (e) {
            var toggleClicked = ($(e.target).closest(".navbar-header").length > 0);
            var $openParent = $(".navbar-default .parentMenu.in");
            var $openChildren = $(".navbar-default .childMenu.in");
            var hasOpenChildren = ($openChildren.length > 0);

            //always close child menus
            $openChildren.removeClass("in").addClass("collapse");

            // if toggle clicked, open parent will automatically close, 
            if (!toggleClicked) {
                // otherwise close manually
                $openParent.removeClass("in").addClass("collapse");
            }

            // if toggle was clicked, and something was open
            if (toggleClicked && hasOpenChildren) {
                //quickly open menu so it can be closed by toggle click
                $(".navbar-default .parentMenu.collapse")
                    .removeClass("collapse").addClass("in");
            }

        });
    }

    function addScrollSpy() {
        $('body').scrollspy({
            target: '#sidebar',
            offset: 200
        });
    }

    function addSmoothScrollingToAnchors() {
        // when menu item clicked
        $("a[href^='#']").click(function () {
            // scroll to position
            navigateToElement(this);
        });
    }

    function goToCurrentAnchor() {
        scrollToElement(window.location.hash);
    }

    function navigateToElement(pageLink) {
        // get href attribute
        var idSelector = $(pageLink).attr('href');
        // make sure we have a valid id
        if ($(idSelector).length > 0) {
            // scroll down page
            scrollToElement(idSelector);
            // reset url hash
            setHash(idSelector);
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
