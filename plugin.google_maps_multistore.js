multiStore=function(cfg){
	this.init(cfg);
};

multiStore.prototype={

	googleLoaderSrc:'http://www.google.com/jsapi?key={{YOUR_KEY}}',
	travelModes:
		{'pied':'google.maps.DirectionsTravelMode.WALKING',
		'voiture':'google.maps.DirectionsTravelMode.DRIVING',
		'velo':'google.maps.DirectionsTravelMode.BICYCLING'
	},

	init:function(cfg){
		this.cfg				=cfg;
		this.container			=document.getElementById(cfg.container.replace('#', ''));
		this.panel			=document.getElementById(cfg.panel.replace('#', ''));
		this.pixelTracking 		=cfg.pixeltrackingClick || false
		this.travelMode 		=this.travelModes[cfg.mode] || 'google.maps.DirectionsTravelMode.WALKING';
		this.directionsDisplay 		=null
		this.directionService 		=null;
		this.request  			=null;
		
		this.loadGoogleLoader();

	},

	loadGoogleLoader:function(){
		var 	scripts 			=document.getElementsByTagName('script'),
			apiAlreadyLoaded 	=false,
			self 			=this;

		//Parcours des scripts de la page, si le script est dÃƒÂ©jÃƒ  prÃƒÂ©sent, on ne le recahrge pas Ãƒ  nouveau
		for (var i=0, l=scripts.length; i < l; i++){
			if(scripts[i].src==this.googleLoaderSrc){ 
				apiAlreadyLoaded=true;
			}
		} 

		if(!apiAlreadyLoaded){
			var tag 		= document.createElement('script');
			firstScriptTag 		= document.getElementsByTagName('script')[0];
			tag.src 			= this.googleLoaderSrc;
			tag.setAttribute("type", "text/javascript");
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		}

		//On regarde si l objet google est disponible, sinon, setTimeOut, on attend
		if(typeof (google)=='undefined'){
			this.waitGoogleLoader();
		}
		//si oui, on charge l api Google Maps
		else{
			google.load("maps", "3.14", {other_params:'sensor=true', callback: function(){
					self.initialize();
			}});
		}
	},

	//Fonction passerelle d attente de l API Google Maps
	waitGoogleLoader:function(){
		var self=this;
		setTimeout(function() {
			self.loadGoogleLoader();
		}, 100);
	},

	initialize:function(){
		this.createDirectionRenderer();
		this.createMap();
	},

	createDirectionRenderer:function(){
		var rendererOptions = {
			suppressMarkers : true
		}
		this.directionsDisplay  = new google.maps.DirectionsRenderer(rendererOptions);
		
		
	},

	//CrÃƒÂ©e le plan
	createMap:function(){
		this.userPosition = new google.maps.LatLng(this.cfg.from.lat, this.cfg.from.long);
		var mapOptions = {
			zoom: 13,
			center: this.userPosition,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
		}
		this.map= new google.maps.Map(this.container, mapOptions);
		
		

		this.directionsDisplay.setMap(this.map);
		this.directionsDisplay.setPanel(this.panel);

		for(var i=0, nbStores=this.cfg.to.length;i<nbStores;i++){
			this.addMarker(this.cfg.to[i]);
		}
	},

	//initialise l objet avec les donnÃƒÂ©es nÃƒÂ©cessiares
	createRequest:function(position){
		this.request ={
			origin 		: this.userPosition,
			destination 	: new google.maps.LatLng(position.ob, position.pb),
			travelMode 	: eval(this.travelMode)
		}
		this.drawItinerary();
	},

	//Trace l itinÃƒÂ©raire sur la map
	drawItinerary:function(){
		var self=this;
		this.directionService 	= new google.maps.DirectionsService();	
		this.directionService.route(this.request, function(response, status){
			if(status === google.maps.DirectionsStatus.OK){
				self.directionsDisplay.setDirections(response);
			}
			else{
				console.log(status);
			}
		});
	},

	addMarker : function(position){
		var self=this;
		var marker = new google.maps.Marker({
		    position 	: new google.maps.LatLng(position.lat, position.long),
		    map      	: this.map,
		    title   	: "Mac	Do",
		    icon     	: this.cfg.iconStore,
		    shadow     	: this.cfg.iconShadow
		});
		marker.setMap(this.map);
		google.maps.event.addListener(marker, 'click', function(evt) {
				self.createRequest(this.position);
				if(self.pixelTracking ){
					self.createPixelTracking();
				}
		});
	},

	createPixelTracking:function(){
		var	img 			=document.createElement('img');
			img.src 		=this.pixelTracking;
			img.style.width 	=0;
			img.style.height 	=0;
		document.body.appendChild(img);
	},
}