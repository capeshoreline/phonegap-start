(function($){
    function on_pause(){
        window.localStorage.setItem("laststate", "LOLSTATE");
    }

    function on_resume(){
        console.log("Device resumed");
        alert("Device resumed");
    }

    function on_device_ready(){
        navigator.notification.alert('Window loaded!', function(){}, 'Loading complete', 'Yabru');
        alert(window.localStorage.getItem("laststate"));
        $(document).bind('pause', on_pause);
        $(document).bind('resume', on_resume);
    }

    $(window).load(function(){
        $(document).bind('deviceready', on_device_ready);
    });
})(jQuery);
