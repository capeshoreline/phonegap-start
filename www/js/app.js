var app;

(function($){
    app = {
        initialize: function(){
            this.bind();        
        },
    
        bind: function(){
            $(window).load(function(){
                $.mobile.defaultPageTransition = 'slide';
                $(document).bind('deviceready', app.on_device_ready);
            });
        },

        on_device_ready: function(){
            navigator.notification.alert('Window loaded!', function(){}, 'Loading complete', 'Yabru');
            alert(window.localStorage.getItem("laststate"));
            $(document).bind('pause', app.on_pause);
            //$(document).bind('backbutton', app.on_pause);
            $(document).bind('resume', app.on_resume);
        },

        on_pause: function(){
            window.localStorage.setItem("laststate", "LULSTATE");
        },

        on_resume: function(){
            console.log("Device resumed");

            setTimeout(function() {
              alert("Device resumed");
            }, 0);
        }
    }
})(jQuery);
