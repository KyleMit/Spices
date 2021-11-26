/*globals window,$,Enumerable,Handlebars*/

(function () {
    "use strict";
    $(function () {
        tryInitializePage();
    });

    function tryInitializePage() {
        try {
            initializePage();

        } catch (ex) {
            //notifyUserOfProblem
            document.getElementById('loading').style.display = 'none';
            alert('An error occurred while loading data from Google.');
        }
    }

    function initializePage() {
        var key = "0Ai98c4sbCLFEdHRTLWY3UEtTUzUwTVhveGN2bTJicHc";
        var url = "https://spreadsheets.google.com/feeds/list/" + key + "/od6/public/values" +
                  "?alt=json-in-script&duration=0&noStore=true&callback=?";

        $.getJSON(url, function (data) {
            tryCreatePage(data);
        });

    }

    function tryCreatePage(data) {
        try {
            createPage(data);

        } catch (ex) {
            //notifyUserOfProblem
            document.getElementById('loading').style.display = 'none';
            alert('An error occurred while creating the page.');
        }
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
        var context = new Object;

        var grouped = Enumerable.From(originalData.feed.entry)
                    .OrderBy("$.gsx$categorysort.$t")
                    .ThenBy("$.gsx$name.$t")
                    .GroupBy(function (value) {           // Key selector
                            return value.gsx$category.$t;;
                        },
                        function (value) {                // Element selector
                            return {
                                Name : value.gsx$name.$t,
                                Category : value.gsx$category.$t,
                                ID : value.gsx$id.$t,
                                Image : value.gsx$imageurl.$t,
                                Brand : value.gsx$brand.$t,
                                PurchasedDate : value.gsx$purchaseddate.$t,
                                Price : value.gsx$price.$t,
                                Ingredients : value.gsx$ingredients.$t,
                                Description : value.gsx$description.$t,
                                Link : value.gsx$link.$t
                            };
                        },
                        function (key, grouping) {         // Result selector
                            return {
                                name: key,
                                spices: grouping.source
                            };
                        })
                    .ToArray();

        context.categories = grouped;

        return context;
    }

    function applyTemplates(context) {
        applyTemplate(context, "#SideNavBarTemplate", "#SideNavBarPlaceholder");
        applyTemplate(context, "#TopNavBarTemplate", "#TopNavBarPlaceholder");
        applyTemplate(context, "#SpiceContentTemplate", "#SpiceContentPlaceholder");
    }

    function applyTemplate(context, templateID, targetID) {
        var template = getTemplate("templates\\template.html", templateID);
        var output = template(context);
        $(targetID).html(output);
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
            // get href attribute
            var idSelector = $(this).attr('href');
            // scroll to position
            navigateToElement(idSelector);
        });
    }

    function goToCurrentAnchor() {
        //wait until page is rendered to scroll to location
        setTimeout(function () {
            navigateToElement(window.location.hash);
        }, 100);
    }

    function navigateToElement(idSelector) {
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
