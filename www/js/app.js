(function($){
    var map = {
        initialize: function(page_elem, map_elem){
            this.page_elem = $(page_elem);
            this.map_elem = $(map_elem);

            this.bind();

            return this;
        },

        bind: function(){
            var me = this;
            me.page_elem.live('pageinit', function(){
                var start_lat_lng = new google.maps.LatLng(-33.959023, 18.459435);
                me.map_elem.gmap({'center': start_lat_lng, 'callback': function(){
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
						self.displayDirections({ 'origin': $('#from').val(), 'destination': $('#to').val(),
                        'travelMode': google.maps.DirectionsTravelMode.DRIVING },
                        {'panel': document.getElementById('directions')}, function(response, status){
							( status === 'OK' ) ? $('#results').show() : $('#results').hide();
						});
						return false;
					});
                
                }});
            });

            me.page_elem.live('pageshow', function(){
                me.map_elem.gmap('refresh');
                me.map_elem.gmap('get', 'getCurrentPosition')();
            });
        }
    };

    var social_media = {
        initialize: function(page_elems){
            this.twitter_page_elem = page_elems.twitter ? $(page_elems.twitter) : null;
            this.bind();

            /*var oauth;
            var requestParams;
            var options = { 
                    consumerKey: 'hWLvkvpI1DxJ6GoEL0AfA',
                    consumerSecret: 'yT4aT1TYOibTGynzAxwk0ecuC7F1wM8fPyEbqA',
                    callbackUrl: 'http://www.your-callback-url.com' };
            var mentionsId = 0;
            var localStoreKey = "tmt5p1";
            var verifier = '21345434';

            oauth = OAuth(options);
            oauth.get('https://api.twitter.com/oauth/request_token',
                    function(data) {
                        requestParams = data.text;
                        console.log("AppLaudLog: requestParams: " + data.text);
                        window.plugins.childBrowser.showWebPage('https://api.twitter.com/oauth/authorize?'+data.text, 
                                { showLocationBar : false });                    
                    },
                    function(data) { 
                        alert('Error : No Authorization'); 
                        console.log("AppLaudLog: 2 Error " + data); 
                        $('#oauthStatus').html('<span style="color:red;">Error during authorization</span>');
                    }
            );
            mentionsId = 0;*/

            return this;
        },

        bind: function(){
            var me = this;
            if(me.twitter_page_elem != null){
                me.twitter_page_elem.live('pageinit', function(){
                    console.log('initting');
                });
            }       
        }
    }

    window.app = {
        initialize: function(){
            this.map = map.initialize('#map', '#map-canvas');
            this.social_media = social_media.initialize({'twitter': '#twitter'});
            
            this.bind();

            return this;
        },
    
        bind: function(){
            $(window).load(function(){
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
    };
})(jQuery);
