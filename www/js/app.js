(function($){
    function on_pause(){
        console.log("Device paused");
    }

    function on_resume(){
        console.log("Device resumed");
    }

    function on_device_ready(){
        alert("Device ready");
        $(document).bind('pause', on_pause);
        $(document).bind('resume', on_resume);
    }

    $(window).load(function(){
        navigator.notification.alert('Window loaded!', function(){}, 'Loading complete', 'Yabru');
        $(document).bind('deviceready', on_device_ready);
    });
})(jQuery);
