var app1 = (function ($, d3) {
    'use strict';

    var a = {},
        chartSize = { x: 130, y: 130 },
        chartColors = ['#FFC424', '#FFFFFF'],
        speed = 250;

    a.createDataCards = function (cardDataArray) {
        var $cardList = $('ul.card-list'),
            $card,
            cardData,
            i;

        for(i = 0; i < cardDataArray.length; i += 1) {
            cardData = cardDataArray[i];
            $card = a.createCard(cardData);

            $('<li />').append($card).appendTo($cardList);

            // set the cards to cascade fading in
            $card.delay(speed * i).fadeIn(speed);

            console.log('Created card for: ' + cardData.title);
        }
    };

    // gets jquery object from a template collection
    a.getTemplate = function (name) {
        var $template = $('[data-template="' + name +'"]').clone();
        $template.removeAttr('data-template');
        return $template;
    };

    // creates the html element for a single data card
    a.createCard = function (cardData) {
        var $card = a.getTemplate('card'),
            totalValue = 0,
            leftReadableValue,
            rightReadableValue,
            i;

        // calculate total value
        for(i = 0; i < cardData.data.length; i++) {
            totalValue += cardData.data[i].count;
        }

        // populate title
        $card.find('div.card-title p').text(cardData.title);

        // populate icon
        $card.find('div.card-title i.fa').addClass(cardData.icon);

        // populate labels
        leftReadableValue = Math.round(cardData.data[0].count / totalValue * 100) + "%";
        $card.find('div.chart-display div.label-left p.chart-key').text(cardData.data[0].label);
        $card.find('div.chart-display div.label-left p.chart-value').text(leftReadableValue);

        rightReadableValue = Math.round(cardData.data[1].count / totalValue * 100) + "%";
        $card.find('div.chart-display div.label-right p.chart-key').text(cardData.data[1].label);
        $card.find('div.chart-display div.label-right p.chart-value').text(rightReadableValue);

        // populate chart
        a.createPieChart($card.find('div.chart')[0], cardData.data);

        // populate link
        $card.find('a.card-btn').attr('href', '/' + cardData.url);


        return $card;
    };

    a.createPieChart = function (element, data) {
        var radius, color, svg, arc, pie, path;

        // calc the radius from the min size dimension
        radius = Math.min(chartSize.x, chartSize.y) / 2;

        // set our color array
        color = d3.scale.ordinal().range(chartColors);

        // create an svg element with the "g" internal element type
        svg = d3.select(element)
            .append('svg')
            .attr('width', chartSize.x)
            .attr('height', chartSize.y)
            .append('g')
            .attr('transform', 'translate(' + chartSize.x / 2 + ',' + chartSize.y / 2 + ')');
        
        // create our encompasing circle
        // rotate it 180 degrees to have the labels match the sections
        arc = d3.svg.arc()
            .outerRadius(radius)
            .startAngle(function (d) { return d.startAngle + Math.PI; })
            .endAngle(function (d) { return d.endAngle + Math.PI; });

        // use the pie method to create segments
        // the "count" property here refers to the name of the field in the dataset
        // that contains the value of the segment
        pie = d3.layout.pie()
            .value(function(d) { return d.count; })
            .sort(null);

        // now we have all elements, fill in the chart
        path = svg.selectAll('path')
            .data(pie(data))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', function(d, i) {
                return color(d.data.label);
            });

    };

    return a;
}($, d3));