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
            this.facebook_page_elem = page_elems.facebook ? $(page_elems.facebook) : null;
        
            this.initialize_oauth();

            this.bind();

            return this;
        },

        initialize_oauth: function(){
            var me = this;
            me.facebook_oauth = null;
            me.twitter_oauth = null;
            me.request_params_twitter = null;
            
            window.plugins.childBrowser.onLocationChange = function(loc){
                if(loc.indexOf('facebook') != -1){
                    me.authentication_callback_facebook(loc);
                }
                else{
                    me.authentication_callback_twitter(loc);
                }              
            }
        },

        authentication_callback_twitter: function(loc){
            var me = this;
            
            // If user hit "No, thanks" when asked to authorize access
            if (loc.indexOf("http://test.kevinstrumental.com/?denied") != -1) {
                window.plugins.childBrowser.close();
                return;
            }
            
            // The supplied oauth_callback_url for this session is being loaded
            if (loc.indexOf("http://test.kevinstrumental.com/?") != -1) {
                var index, verifier = '';            
                var params = loc.substr(loc.indexOf('?') + 1);
                
                params = params.split('&');
                for (var i = 0; i < params.length; i++) {
                    var y = params[i].split('=');
                    if(y[0] === 'oauth_verifier') {
                        verifier = y[1];
                    }
                }

                var access_token_url = 'https://api.twitter.com/oauth/access_token?oauth_verifier='+verifier+'&'+me.request_params_twitter;
           
                // Exchange request token for access token
                me.twitter_oauth.get(access_token_url,
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

                        var verify_credentials_url = 'https://api.twitter.com/1/account/verify_credentials.json?skip_status=true';

                        me.twitter_oauth.get(verify_credentials_url,
                                function(data) {
                                    var entry = JSON.parse(data.text);
                                    //alert(entry);
                                    me.twitter_oauth.post('https://api.twitter.com/1/statuses/update.json',
                                        { 'status' : 'From Android',  // jsOAuth encodes for us
                                          'trim_user' : 'true' },
                                        function(data) {
                                            alert("Success");
                                        },
                                        function(data) { 
                                            alert('Error Tweeting.');
                                        }
                                    );                  
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
        },

        authentication_callback_facebook(loc){
            var fb_code = loc.match(/code=(.*)$/)[1];
            var access_token_url = "https://graph.facebook.com/oauth/access_token?";
            var options = { 
                client_id: '349230908495725',
                client_secret: '71c96f7cd51b305692b44ec24a6bb424',
                code: fb_code,
                redirect_uri: 'http://www.facebook.com/connect/login_success.html'
            };
            
            $.post(access_token_url + $.param(options), function(data){
                            
            });        
        },

        authenticate_twitter: function(){
            var me = this;
            var options = { 
                consumerKey: 'hWLvkvpI1DxJ6GoEL0AfA',
                consumerSecret: 'yT4aT1TYOibTGynzAxwk0ecuC7F1wM8fPyEbqA',
                callbackUrl: 'http://test.kevinstrumental.com'
            };

            me.twitter_oauth = OAuth(options);
            me.twitter_oauth.get('https://api.twitter.com/oauth/request_token',
                function(data){
                    me.request_params_twitter = data.text;
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

        authenticate_facebook: function(){
            var me = this;
            var authorize_url = "https://graph.facebook.com/oauth/authorize?";
            var options = { 
                client_id: '349230908495725',
                redirect_uri: 'http://www.facebook.com/connect/login_success.html',
                scope: 'publish_stream'
            };

            window.plugins.childBrowser.showWebPage(authorize_url + $.param(options));
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

            if(me.facebook_page_elem != null){
                me.facebook_page_elem.live('pageinit', function(){
                    me.authenticate_facebook();
                    console.log('initting fb');
                });

                me.facebook_page_elem.live('pageshow', function(){
                    console.log('onpage');
                });
            }       
        }
    }

    window.app = {
        initialize: function(){
            this.map = map.initialize('#map', '#map-canvas');
            this.social_media = social_media.initialize({
                'twitter': '#twitter', 
                'facebook': '#facebook'
            });
            
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
