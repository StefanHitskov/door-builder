(function($){

    $(document).ready(function(){


        $('div.tabs div.tab').click(function(){
            var tab = $(this);

            if($('div.tabs').find('div.tab.active').length == 0){
                tab.addClass('active');
                var target = $('div.tab-container > div[data-tab="'+tab.data('target')+'"]');
                target.addClass('visible');
                $('div.tab-container').animate({'left' : '50px'});

            } else {
                if(!tab.hasClass('active')){
                    $('div.tabs div.tab').removeClass('active');
                    tab.addClass('active');
                    $('div.tab-container > div').removeClass('visible');
                    var target = $('div.tab-container > div[data-tab="'+tab.data('target')+'"]');
                    target.addClass('visible');
                } else {
                    tab.removeClass('active');
                    $('div.tab-container > div').removeClass('visible');
                    $('div.tab-container').animate({'left' : '-230px'});
                }
            }



        });
    });

})(jQuery);