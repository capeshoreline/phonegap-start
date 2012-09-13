var app;

(function($){
    app = {
        initialize: function(){
            this.bind();

            this.map.bind();        
        },

        map: {
            bind: function(){
                $('#acura').live('pageinit', function(){
                    var yourStartLatLng = new google.maps.LatLng(-33.959023, 18.459435);
                    $('#map-canvas').gmap({'center': yourStartLatLng, 'disableDefaultUI': true, 'callback': function(){
                        var self = this;
						self.addMarker({'position': self.get('map').getCenter() }).click(function() {
							self.openInfoWindow({ 'content': 'Hello World!' }, this);
						});

                        self.set('getCurrentPosition', function() {
							self.getCurrentPosition( function(position, status) {
								if ( status === 'OK' ) {
									var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
									self.get('map').panTo(latlng);
									self.search({ 'location': latlng }, function(results, status) {
										if ( status === 'OK' ) {
											$('#from').val(results[0].formatted_address);
										}
									});
								}
							});
						});


                        $('#submit').click(function(){
							self.displayDirections({ 'origin': $('#from').val(), 'destination': $('#to').val(), 'travelMode': google.maps.DirectionsTravelMode.DRIVING }, { 'panel': document.getElementById('directions')}, function(response, status) {
								( status === 'OK' ) ? $('#results').show() : $('#results').hide();
							});
							return false;
						});
                    
                    }});
                });

                $('#acura').live('pageshow', function(){
                    var yourStartLatLng = new google.maps.LatLng(59.3426606750, 18.0736160278);
                    $('#map-canvas').gmap('refresh');
                    $('#map-canvas').gmap('get', 'getCurrentPosition')();
                });
            }
        },
    
        bind: function(){
            $(window).load(function(){
                $(document).bind('mobileinit', app.on_mobile_init);
                $(document).bind('deviceready', app.on_device_ready);
            });
        },

        on_mobile_init: function(){
            $.mobile.defaultPageTransition = 'slide';        
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
