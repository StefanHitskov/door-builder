/**
 * Created by ������ ������ on 12.11.2015.
 */

var defaultWidth = 2000;
var defaultHeight = 2000;
var defaultCount = 2;
var defaultPereh = 1;
var defaultProfile = '3';
var defaultTexture = 'derevo';

var scene;

var oldData;

var plankaWidth = 40;

var sections = [];

var textures = [
    {
        name: 'test1',
        val: 'derevo'
    },
    {
        name: 'test2',
        val: 'tree'
    },
    {
        name: 'test3',
        val: '1'
    }
];

var profiles = [
    {
        name : 'slim',
        val : '1'
    },
    {
        name : 'КВАДРО',
        val : '2'
    },
    {
        name : 'ПРЕСТИЖ',
        val : '3'
    }

];

//Переписать!!
var texturesSelect = '<select>';
for (var i = 0; i < textures.length; i++) {
    texturesSelect += '<option value="' + textures[i].val + '">' + textures[i].name + '</option>';
}
texturesSelect += '</select>';

//Переписать!!
var profileSelect = '<select>';
for (var i = 0; i < profiles.length; i++) {
    profileSelect += '<option value="' + profiles[i].val + '">' + profiles[i].name + '</option>';
}
profileSelect += '</select>';

//var sections = [[[{"w":100,"h":40,"img":0}],[{"w":45,"h":107,"img":0},{"w":45,"h":107,"img":0}],[{"w":45,"h":133,"img":0},{"w":45,"h":133,"img":0}]],[[{"w":45,"h":50,"img":0},{"w":45,"h":50,"img":0}],[{"w":100,"h":40,"img":0}],[{"w":100,"h":40,"img":0}],[{"w":100,"h":40,"img":0}],[{"w":100,"h":40,"img":0}],[{"w":100,"h":40,"img":0}]],[[{"w":100,"h":90,"img":0}],[{"w":100,"h":200,"img":0}]],[[{"w":100,"h":40,"img":0}],[{"w":25,"h":250,"img":0},{"w":30,"h":250,"img":0},{"w":25,"h":250,"img":0}]],[[{"w":100,"h":300,"img":0}]]];
//
//var sections = [
//    [
//        [
//            {w: 1000, h: 400, img: 0}
//        ],
//        [
//            {w: 480, h: 1560, img: 0},
//            {w: 480, h: 1560, img: 0}
//        ]
//    ],
//    [
//        [
//            {w : 480, h : 300, img: 0 },
//            {w : 480, h : 300, img: 0 }
//        ],
//        [
//            {w : 1000, h : 300, img: 0 }
//        ],
//        [
//            {w : 1000, h : 300, img: 0 }
//        ],
//        [
//            {w : 1000, h : 300, img: 0 }
//        ],
//        [
//            {w : 1000, h : 300, img: 0 }
//        ],
//        [
//            {w : 1000, h : 300, img: 0 }
//        ]
//    ]
//];

var sections2 = [
    [
        {
            height: 40,
            cells: [{
                width: 100,
                img: 0
            }]
        },

        {
            height: 250,
            cells: [
                {
                    width: 45,
                    img: 0
                },
                {
                    width: 45,
                    img: 0
                }
            ]
        }
    ],

    [
        {
            height: 50,
            cells: [
                {
                    width: 45,
                    img: 0

                },
                {
                    width: 45,
                    img: 0

                }


            ]
        },

        {
            height: 40,
            cells: [
                {
                    width: 100,
                    img: 0
                }
            ]
        }
    ]

];

var doors;

Object.eq = function (obj1, obj2) {
    if (obj1 == obj2) return true;
    if (obj1 == undefined || obj2 == undefined) return false;
    for (var k in obj1) {
        if (obj1[k] !== obj2[k]) {
            return false;
        }
    }
    return true;
};

$(document).ready(function () {

    function initDefault() {
        $('input#width').val(defaultWidth);
        $('input#height').val(defaultHeight);
        $('input#count').val(defaultCount);
        $('input#pereh').val(defaultPereh);

        var select = $(profileSelect);

        $('#prof').append(select);
        select.find('option[value="' + defaultProfile+ '"]').attr('selected', 'selected');
        select.change(reload);
    }

    initDefault();


    scene = createScene();

    scene.setOnDoorSelectListener(function (door) {
        $('#doors').find('div.item').removeClass('select');
        $('#doors').find('div.item:nth-child(' + (door.position + 1) + ')').addClass('select');
    });

    oldData = {
        width: defaultWidth,
        height: defaultHeight,
        count: defaultCount,
        perehlest: defaultPereh,
        profile: defaultProfile,
        color: 'gray',
        textures: [],
        sections: sections
    };

    for (var i = 0; i < defaultCount; i++) {
        oldData.textures.push(defaultTexture);
    }
    showTexturesChooser(oldData);

    doors = scene.rebuild(oldData);

    setEvents();

    //$('input#show').click(function(){
    //    var data = getData();
    //    console.log(data);
    //    $('.controls').hide();
    //    $('#container').show();
    //    scene = new createScene(data);
    //});
    //
    //function getData(){
    //
    //    var data = {
    //        width : $('#width').val(),
    //        height : $('#height').val(),
    //        count : $('#count').val(),
    //        perehlest : $('#pereh').val(),
    //        profile : $('#profile').find('option:selected').val(),
    //        color : $('#color').find('option:selected').val()
    //    };
    //
    //    console.log(data);
    //    return data ;
    //}


    function setEvents() {
        $('#show').click(reload);
    }

    function reload() {

        var data = {
            width: $('input#width').val(),
            height: $('input#height').val(),
            count: $('input#count').val(),
            perehlest: $('input#pereh').val(),
            profile: $('#prof').find('select').find('option:selected').val(),
            color: 'gray',
            sections: sections,

        };
        data.textures = getTextures(data.count);
        if (!Object.eq(data, oldData)) {
            console.log('reload');
            oldData = data;
            scene.rebuild(data);
            showTexturesChooser(data);
        }
    }

    function getTextures(count) {
        var doors = $('#doors').find('div.item');
        var textures = [];
        for (var i = 0; i < count; i++) {
            if (i < doors.length) {
                textures.push($(doors[i]).find('select option:selected').val());
            } else {
                textures.push(defaultTexture);
            }
        }
        //console.log(textures);
        return textures;

    }

    function showTexturesChooser(data) {

        var container = $('#doors');
        container.html('');
        for (var i = 0; i < data.count; i++) {
            var block = $('<div class="item""><label>Дверь №' + (i + 1) + '</label></div>');
            block.find('label').append(texturesSelect);
            var select = block.find('select');
            select.attr('rel', i);
            select.change(function () {
                //console.log($(this).attr('rel'));
                var s = $(this);
                scene.setTexture(s.attr('rel'), s.find('option:selected').val());
            });
            if (i < data.textures.length) {
                block.find('option[value="' + data.textures[i] + '"]').attr('selected', 'selected');
            } else {
                block.find('option[value="' + defaultTexture + '"]').attr('selected', 'selected');
            }
            container.append(block);
        }

    }


});