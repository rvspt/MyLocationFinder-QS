/*globals define*/
define( ['./js/qsocks.bundle','qlik','css!./styles/style.css'], function ( qsocks, qlik ) {
	'use strict';
	return {
		definition: {
			type: "items",
			component: "accordion",
			items: {
				myLocConfigs: {
					type: "items",
					component: "expandable-items",
					label: "My Location Finder Configuration",
					items: {
						fields:{
							type: "items",
							label: "Fields",
							items: {
								lat_field:{
								  ref:"properties.myLocConfigs.lat_field",
								  label: "Latitude Field",
								  type: "string",
								  expression: ""
								},//"properties.myLocConfigs.lat_field"
								lng_field:{
								  ref:"properties.myLocConfigs.lng_field",
								  label: "Longitude Field",
								  type: "string",
								  expression: ""
								}//"properties.myLocConfigs.lng_field"
							}
						},
						myloc_point:{
							type: "items",
							label: "Variable to store my position",
							items: {
								myloc_point:{
								  ref: "properties.myLocConfigs.myloc_point",
								  label: "Variable for my position",
								  type: "string",
								  expression: ""
								}//properties.myLocConfigs.myloc_point
							}
						},
						distance:{
							type: "items",
							label: "Search Reach",
							items: {
								distance:{
								  ref: "properties.myLocConfigs.distance",
								  label: "Reach distance in km",
								  type: "string",
								  expression: ""
								}//properties.myLocConfigs.distance
							}
						}
					}
				},
				settings: {
					uses: "settings"
				}
			}
		},
		snapshot: {
			canTakeSnapshot: false
		},
		paint: function ( $element, layout ) {			
			var myLocConfigs = layout.properties.myLocConfigs;
			
			if(!myLocConfigs.lat_field || !myLocConfigs.lng_field || !myLocConfigs.distance){
			  $element.html("Please setup the extension properties");
			}
			else{
			  $element.html("<div id='geo_button' class='available'></div>");
			  document.getElementById("geo_button").onclick=findNearMe;
			}
			
			function findNearMe(){
				document.getElementById("geo_button").className="searching";
				if ("geolocation" in navigator) {
				  navigator.geolocation.getCurrentPosition(function(position) {
					var coordinatesBounds = searchableCoordinates(position.coords.latitude, position.coords.longitude);
					searchValuesApp(coordinatesBounds);
					var pos_coords = "[" + position.coords.longitude + "," + position.coords.latitude + "]";
					qlik.currApp(this).variable.setStringValue(myLocConfigs.myloc_point,pos_coords);
					
				  });
				} else {
				  $element.html("You have no geonavigation available!");
				}
			}
			
			/**
			 * @param {float} latitude
			 * @param {float} longitude
			 * @description
			 *   Computes the bounding coordinates of all points on the surface of a sphere
			 *   that has a great circle distance to the point represented by the centerPoint
			 *   argument that is less or equal to the distance argument.
			 *   Technique from: Jan Matuschek <http://JanMatuschek.de/LatitudeLongitudeBoundingCoordinates>
			 * @author Alex Salisbury
			*/
			function searchableCoordinates(latitude,longitude){
			  'use strict';
			  // console.log("Distance returned: ", myLocConfigs.distance);
			  var MIN_LAT, MAX_LAT, MIN_LON, MAX_LON, R, radDist, degLat, degLon, radLat, radLon, minLat, maxLat, minLon, maxLon, deltaLon;
			  var distance = myLocConfigs.distance; //distance in km

			  // helper functions (degrees<–>radians)
			  Number.prototype.degToRad = function () {
				return this * (Math.PI / 180);
			  };
			  Number.prototype.radToDeg = function () {
				return (180 * this) / Math.PI;
			  };
			  // coordinate limits
			  MIN_LAT = (-90).degToRad();
			  MAX_LAT = (90).degToRad();
			  MIN_LON = (-180).degToRad();
			  MAX_LON = (180).degToRad();
			  // Earth's radius (km)
			  R = 6378.1;
			  // angular distance in radians on a great circle
			  radDist = distance / R;
			  // center point coordinates (deg)
			  degLat = latitude;
			  degLon = longitude;
			  // center point coordinates (rad)
			  radLat = degLat.degToRad();
			  radLon = degLon.degToRad();
			  // minimum and maximum latitudes for given distance
			  minLat = radLat - radDist;
			  maxLat = radLat + radDist;
			  // minimum and maximum longitudes for given distance
			  minLon = void 0;
			  maxLon = void 0;
			  // define deltaLon to help determine min and max longitudes
			  deltaLon = Math.asin(Math.sin(radDist) / Math.cos(radLat));
			  if (minLat > MIN_LAT && maxLat < MAX_LAT) {
				minLon = radLon - deltaLon;
				maxLon = radLon + deltaLon;
				if (minLon < MIN_LON) {
				  minLon = minLon + 2 * Math.PI;
				}
				if (maxLon > MAX_LON) {
				  maxLon = maxLon - 2 * Math.PI;
				}
			  }
			  // a pole is within the given distance
			  else {
				minLat = Math.max(minLat, MIN_LAT);
				maxLat = Math.min(maxLat, MAX_LAT);
				minLon = MIN_LON;
				maxLon = MAX_LON;
			  }

			  return {
				minLat: minLat.radToDeg(),
				minLng: minLon.radToDeg(),
				maxLat: maxLat.radToDeg(),
				maxLng: maxLon.radToDeg()
			  };
			}//searchableCoordinates 
			
			function searchValuesApp(coordinatesBounds){
				var config = {
					host: window.location.hostname,
					port: window.location.port,
					isSecure: window.location.protocol === "https:"
				};
				
				qsocks.Connect(config).then(function(global) {
					global.openDoc(qlik.currApp().id).then(function(app){
						var lat_loSearch = {
						  "qInfo": {
							"qId": "ListObject01_latitudes",
							"qType": "ListObject"
						  },
						  "qListObjectDef": {
							"qStateName": "$",
							"qLibraryId": "",
							"qDef": {
							  "qFieldDefs": [
								myLocConfigs.lat_field
							  ],
							  "qFieldLabels": [
								"Latitude"
							  ]
							},
							"qInitialDataFetch": [
							  {
								"qTop": 0,
								"qHeight": 10000,
								"qLeft": 0,
								"qWidth": 1
							  }
							]
						  },
						  "title": "Search Latitudes",
						  "Number": 1,
						  "Boolean": true
						}

						var latitudes = [];
						
						var lng_loSearch = {
						  "qInfo": {
							"qId": "ListObject02_longitudes",
							"qType": "ListObject"
						  },
						  "qListObjectDef": {
							"qStateName": "$",
							"qLibraryId": "",
							"qDef": {
							  "qFieldDefs": [
								myLocConfigs.lng_field
							  ],
							  "qFieldLabels": [
								"Longitude"
							  ]
							},
							"qInitialDataFetch": [
							  {
								"qTop": 0,
								"qHeight": 10000,
								"qLeft": 0,
								"qWidth": 1
							  }
							]
						  },
						  "title": "Search Latitudes",
						  "Number": 1,
						  "Boolean": true
						}

						var longitudes = [];

						app.getAppLayout().then(function(app_layout){

							if(app_layout.qLocaleInfo.qDecimalSep!='.'){
								coordinatesBounds.minLat=coordinatesBounds.minLat.toString().replace('.',',');
								coordinatesBounds.maxLat=coordinatesBounds.maxLat.toString().replace('.',',');
								coordinatesBounds.minLng=coordinatesBounds.minLng.toString().replace('.',',');
								coordinatesBounds.maxLng=coordinatesBounds.maxLng.toString().replace('.',',');
							}

							app.createSessionObject(lat_loSearch).then(function(lat_listObject){
							  var search_lats_string = ">="+coordinatesBounds.minLat+"<="+coordinatesBounds.maxLat;
							  lat_listObject.searchListObjectFor("/qListObjectDef",search_lats_string).then(function(lat_searchResultsRaw){
							  	lat_listObject.getLayout().then(function(lat_searchResultsLayout){
								  for(var i=0; i<lat_searchResultsLayout.qListObject.qDataPages.length; i++){
									var lats_tmp=lat_searchResultsLayout.qListObject.qDataPages[i].qMatrix;
									for(var j=0; j<lats_tmp.length; j++){
									  latitudes.push(lats_tmp[j][0].qNum);
									}
								  }
								  app.destroySessionObject("ListObject01_latitudes").then(function(){
								  	app.createSessionObject(lng_loSearch).then(function(lng_listObject){
									  var search_lngs_string = ">="+coordinatesBounds.minLng+"<="+coordinatesBounds.maxLng;
									  lng_listObject.searchListObjectFor("/qListObjectDef", search_lngs_string).then(function(lng_searchResultsRaw){
										lng_listObject.getLayout().then(function(lng_searchResultsLayout){
										  for(var i=0; i<lng_searchResultsLayout.qListObject.qDataPages.length; i++){
											var lngs_tmp=lng_searchResultsLayout.qListObject.qDataPages[i].qMatrix;
											for(var j=0; j<lngs_tmp.length; j++){
											  longitudes.push(lngs_tmp[j][0].qNum);
											}
										  }
										  app.destroySessionObject("ListObject02_longitudes").then(function(){
											var possible_coordinates={
												"latitudes": latitudes,
												"longitudes": longitudes
											}
											global.connection.close();
											selectCoordinates(possible_coordinates);
										  }); //qsocks destroy longitudes session object
										});//wildcard search results
									  });//wildcard search for longitudes intervals
								  	}); //qsocks session obj for longitudes
								  });//qsocks destroy latitudes session object
								});//latitudes wildcard search result
							  });//qsocks wildcard search latitudes
							});//qsocks latitudes session object
						});
					});//qsocks opendoc
				});//qsocks connect
			} //searchValuesApp
			
			function selectCoordinates(possible_coordinates){
				var app = qlik.currApp();
				app.field(myLocConfigs.lat_field).selectValues(possible_coordinates.latitudes,false, true);
				app.field(myLocConfigs.lng_field).selectValues(possible_coordinates.longitudes,false,true);
				document.getElementById("geo_button").className="available";
			} //selectCoordinates
		}
	};
} );
