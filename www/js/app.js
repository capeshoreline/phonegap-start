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
        
            this.initialize_oauth();

            this.bind();

            /*var oauth;
            var requestParams;
            var options = { 
                    consumerKey: 'hWLvkvpI1DxJ6GoEL0AfA',
                    consumerSecret: 'yT4aT1TYOibTGynzAxwk0ecuC7F1wM8fPyEbqA',
                    callbackUrl: 'http://test.kevinstrumental.com' };
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

        initialize_oauth: function(){
            this.facebook_oauth = null;
            this.twitter_oauth = null;
        },

        authenticate_twitter: function(){
            var request_params;
            var me = this;
            if (typeof window.plugins.childBrowser.onLocationChange !== "function") {
                window.plugins.childBrowser.onLocationChange = function(loc){
                    alert('location changed ' + loc);
      
                    // If user hit "No, thanks" when asked to authorize access
                    if (loc.indexOf("http://test.kevinstrumental.com/?denied") >= 0) {
                        window.plugins.childBrowser.close();
                        return;
                    }
                    
                    // The supplied oauth_callback_url for this session is being loaded
                    if (loc.indexOf("http://test.kevinstrumental.com/?") >= 0) {
                        var index, verifier = '';            
                        var params = loc.substr(loc.indexOf('?') + 1);
                        
                        params = params.split('&');
                        for (var i = 0; i < params.length; i++) {
                            var y = params[i].split('=');
                            if(y[0] === 'oauth_verifier') {
                                verifier = y[1];
                            }
                        }
                   
                        // Exchange request token for access token
                        me.twitter_oauth.get('https://api.twitter.com/oauth/access_token?oauth_verifier='+verifier+'&'+request_params,
                            function(data) {               
                                var access_params = {};
                                var qvars_tmp = data.text.split('&');
                                for (var i = 0; i < qvars_tmp.length; i++) {
                                    var y = qvars_tmp[i].split('=');
                                    access_params[y[0]] = decodeURIComponent(y[1]);
                                }
                                me.twitter_oauth.setAccessToken([access_params.oauth_token, access_params.oauth_token_secret]);
                                
                                // Save access token/key in localStorage
                                var access_data = {};
                                access_data.access_token_key = access_params.oauth_token;
                                access_data.access_token_secret = access_params.oauth_token_secret;
                                console.log("AppLaudLog: Storing token key/secret in localStorage");
                                //localStorage.setItem(localStoreKey, JSON.stringify(accessData));

                                me.twitter_oauth.get('https://api.twitter.com/1/account/verify_credentials.json?skip_status=true',
                                        function(data) {
                                            var entry = JSON.parse(data.text);
                                            console.log("AppLaudLog: screen_name: " + entry.screen_name);
                                        },
                                        function(data) { 
                                            alert('Error getting user credentials'); 
                                            console.log("AppLaudLog: Error " + data);
                                        }
                                );                                         
                                window.plugins.childBrowser.close();
                            },
                            function(data) { 
                                alert('Error : No Authorization'); 
                                console.log("AppLaudLog: 1 Error " + data);
                            }
                        );
                    }
                };  
            }

            var options = { 
                consumerKey: 'hWLvkvpI1DxJ6GoEL0AfA',
                consumerSecret: 'yT4aT1TYOibTGynzAxwk0ecuC7F1wM8fPyEbqA',
                callbackUrl: 'http://test.kevinstrumental.com'
            };

            me.twitter_oauth = OAuth(options);
            me.twitter_oauth.get('https://api.twitter.com/oauth/request_token',
                function(data){
                    request_params = data.text;
                    console.log("AppLaudLog: requestParams: " + data.text);
                    window.plugins.childBrowser.showWebPage('https://api.twitter.com/oauth/authorize?'+data.text, 
                        { showLocationBar : false });
                },
                function(data){ 
                    alert('Error : No Authorization');
                    console.log("AppLaudLog: 2 Error " + data);
                }
            );          
        },

        bind: function(){
            var me = this;
            if(me.twitter_page_elem != null){
                me.twitter_page_elem.live('pageinit', function(){
                    me.authenticate_twitter();
                });

                me.twitter_page_elem.live('pageshow', function(){
                    console.log('onpage');
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
