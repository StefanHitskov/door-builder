/**
 * Created by Хицков Стефан on 12.11.2015.
 */

$(document).ready(function(){

    var scene;

    $('input#show').click(function(){
        var data = getData();
        console.log(data);
        $('.controls').hide();
        $('#container').show();
        scene = new createScene(data);
    });

    function getData(){

        var data = {
            width : $('#width').val(),
            height : $('#height').val(),
            count : $('#count').val(),
            perehlest : $('#perehlest').val(),
            profile : $('#profile').find('option:selected').val(),
            color : $('#color').find('option:selected').val(),
        };

        console.log(data);
        return data ;
    }

});