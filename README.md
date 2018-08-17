# MyLocationFinder-QS
Qlik Sense extension that uses your location and selects the coordinates of what is near to you based on a configurable distance.

Tested with Qlik Sense June 2018.

For previous Qlik Sense versions, please make sure you are using at least the extension version 1.1.1. Previous extension versions were forcing longitudes data to be defined on a field named "Longitude". Thanks to [Patric Nordström](https://github.com/patricnordstrom) to note that something odd was happening.

Features included are:
  * Uses your browser's geolocation feature to find your current location (for this you must allow your browser to use this feature. More info - http://www.w3schools.com/html/html5_geolocation.asp)
  * Definable search range in Km
  * v1.2: Possibility to identify an application variable to store the user (browser's) location. Thanks to [Patric Nordström](https://github.com/patricnordstrom).

An example app can be found in the 'App Example' folder.

How to use:
 - Go to the extension's settings and indicate which is the name of the fields that hold the Latitudes and Longitudes to search. As the extension is searching by range you will need to have these fields in separated columns instead of the traditional 'Point Data Format' - http://help.qlik.com/en-US/sense/2.2/Subsystems/Hub/Content/Visualizations/Map/load-map-data.htm
 - Define what is the distance range in Km

 - Important: your browser must allow the geolocation feature to be used (this means that Sense Desktop will not allow you to use the feature. Instead access http://localhost:4848/hub using your favorite browser)
