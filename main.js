var mLonLat;
var map = {
    init: function(wgslon, wgslat, zoom) {

	this.options = {
	    projection: new OpenLayers.Projection("EPSG:900913"),
	    displayProjection: new OpenLayers.Projection("EPSG:4326"),
	    controls: [
		new OpenLayers.Control.Navigation(),
		new OpenLayers.Control.ArgParser()
	    ]
	};
	if(navigator.userAgent.match(/mobile/i) === null) {
	    this.options.controls.push(new OpenLayers.Control.ZoomPanel())
	}
	this.map = new OpenLayers.Map('map', this.options);
	this.mapnik = new OpenLayers.Layer.OSM();
	this.map.addLayer(this.mapnik);

	this.markers = new OpenLayers.Layer.Markers("Markers");
	map.map.addLayer(this.markers);
	
	this.markers.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(wgslon, wgslat).transform(map.map.displayProjection, map.map.projection)));
	this.centerMarker = this.markers.markers[0]
	this.centerMarker.map = this.map;
	
	this.updateCenter({"coords": {"longitude": wgslon, "latitude": wgslat}}, zoom);
    },
    updateCenter: function(geo, zoom) {
	map.map.setCenter(new OpenLayers.LonLat(geo.coords.longitude, geo.coords.latitude).transform(map.map.displayProjection, map.map.projection), zoom);
    },
    updateCenterMarker: function(geo) {
	mLonLat = new OpenLayers.LonLat(geo.coords.longitude, geo.coords.latitude).transform(map.map.displayProjection, map.map.projection);
	this.centerMarker.lonlat = mLonLat;
	map.centerMarker.moveTo(map.map.getLayerPxFromLonLat(mLonLat));
    }
}

var track = {
    trackId: undefined,
    latestGeo: undefined,
    isTracking: function () {
	if(typeof(this.trackId) === "undefined") {
	    return false;
	} else {
	    return true;
	}
    },
    startTrack: function () {
	if(this.isTracking()) {
	    return;
	} else {
	    navigator.geolocation.watchPosition(this.handleWatch);
	}
    },
    stopTrack: function () {
	if(!main.states.followMe && !main.states.updateMarker) {
	    //Only stop tracking if BOTH follow-me and updateMarker is disabled
	    navigator.geolocation.clearWatch(this.trackId);
	    this.trackId = undefined;
	    this.latestGeo = undefined;
	}
    },
    handleWatch: function(geo) {
	track.latestGeo = geo;
	if(main.states.followMe) {
	    map.updateCenter(geo);
	}
	if(main.states.updateMarker) {
	    map.updateCenterMarker(geo);
	}
    }
}

function error(e) {
    if(typeof(console) !== "undefined") {
	console.warn(e);
    }
}

var main = {
    watch: false,
    states: {
	"followMe": false,
	"updateMarker": false
    },
    init: function() {
	$("div#map").css("height", window.innerHeight-$("footer").height());
	if(typeof(navigator) === "undefined" || typeof(navigator.geolocation) === "undefined") {
	    alert("Your browser does not support the HTML5 geolocation API, super lame");
	    return;
	}
	map.init(18.064488, 59.33278800000001, 14);
    },
    followMe: function() {
	if(this.states.followMe) {
	    this.states.followMe = false;
	    track.stopTrack()
	} else {
	    this.states.followMe = true;
	    if(track.latestGeo) {
		map.updateCenter(track.latestGeo);
	    }
	    track.startTrack()
	}
    },
    updateMarker: function() {
	if(this.states.updateMarker) {
	    this.states.updateMarker = false;
	    track.stopTrack()
	} else {
	    this.states.updateMarker = true;
	    if(track.latestGeo) {
		map.updateCenterMarker(track.latestGeo);
	    }
	    track.startTrack()
	}
    },
    initSearch: function() {
	alert("Not implemented");
    }
}
