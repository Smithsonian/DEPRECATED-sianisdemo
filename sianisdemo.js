// Demo of Sidora Analysis API for Islandora
// file: sianisdemo.js
// author: Gert Schmeltz Pedersen - gertsp45@gmail.com
/***************************************************************************************************/
		
function sianisdemoOnload() {
    sianisdemoStatusLine('Welcome!');
	workflowName = ''; 
	speciesName = ' '; 
	obstablePids = '';
	markersArray = [];
	sianisdemoGetWorkflows();
	sianisdemoDrawMap();
	sianisdemoGetProjectStructure();
	sianisdemoGetObstables();
}

function sianisdemoStatusLine(message) {
    $('#sianisdemoStatusArea').html(sianisdemoGetDateTime()+' '+message+sianisdemoGetPreviousStatus());
}

function sianisdemoGetDateTime() {
	return (new Date()).toLocaleString();
}

function sianisdemoGetPreviousStatus() {
	return '<br/>'+$('#sianisdemoStatusArea').html();
}

function sianisdemoGetWorkflows() {
    sianisdemoStatusLine('Getting workflow list ...');
	var url = '/sianisdemo/sianisdemoGetFile/sianisdemoWorkflows.html';
	$('#sianisdemoWorkflowSelectDiv').load(
			encodeURI(url)+' #sianisdemoWorkflowList',
			function(response, status, xhr) {
				if (status == 'error') {
				    sianisdemoStatusLine('Error: '+xhr.status+' '+xhr.statusText);
				} else {
				    sianisdemoStatusLine('Got workflow list');
				}
			}
	);
}

function sianisdemoGetProjectStructure() {
    sianisdemoStatusLine('Getting project structure ...');
	var url = '/sianisdemo/sianisdemoGetProjectStructure';
	$('#sianisdemoProjectStructureArea').load(
			encodeURI(url)+' #sianisGetProjectStructureResult',
			function(response, status, xhr) {
				if (status == 'error') {
				    sianisdemoStatusLine('Error: '+xhr.status+' '+xhr.statusText);
				} else {
					var $count = $('#sianisGetProjectStructureCount').text();
					if ($count == '') $count = '!ERROR!';
				    sianisdemoStatusLine('Found '+$count+' observation tables in the project structure');
				    $('#sianisdemoObstablesCount').html($count);
				}
			}
	);
}

function sianisdemoGetSpecies() {
	sianisdemoGetObstables();
    sianisdemoStatusLine('Getting species names from the selected observation tables ...');
    $('#sianisdemoSpecies').html('<option value=" ">getting names ...</option>');
	document.getElementById("sianisdemoStatusDiv").style.display = "";
	var url = '/sianisdemo/sianisdemoGetSpecies/'+escape(obstablePids);
	$('#sianisdemoAjaxArea').load(
			encodeURI(url)+' #sianisGetSpeciesResult',
			function(response, status, xhr) {
				if (status == 'error') {
				    sianisdemoStatusLine('Error: '+xhr.status+' '+xhr.statusText);
				} else {
					if ($('#sianisdemoAjaxArea').text().indexOf('SIANIS ERROR')>-1) {
					    sianisdemoStatusLine($('#sianisdemoAjaxArea').text());
					} else {
					    sianisdemoStatusLine('Got species names');
					    $('#sianisdemoSpecies').html($('#sianisGetSpeciesResult')[0].innerHTML);
					}
				}
			}
	);
}

function sianisdemoSelectObstables() {
	sianisdemoShowProjectTree();
	var north = document.getElementById("sianisdemoNorth").value.substring(0,8);
	var east = document.getElementById("sianisdemoEast").value.substring(0,8);
	var south = document.getElementById("sianisdemoSouth").value.substring(0,8);
	var west = document.getElementById("sianisdemoWest").value.substring(0,8);
	var beginDateFrom = document.getElementById("sianisdemoBeginFrom").value.replace(/\//g, '');
	var beginDateTo = document.getElementById("sianisdemoBeginTo").value.replace(/\//g, '');
	var endDateFrom = document.getElementById("sianisdemoEndFrom").value.replace(/\//g, '');
	var endDateTo = document.getElementById("sianisdemoEndTo").value.replace(/\//g, '');
    sianisdemoStatusLine('Selecting observation tables ...');
	var url = '/sianisdemo/sianisdemoSelectObstables/'+south+'/'+west+'/'+north+'/'+east+'/'+beginDateFrom+'/'+beginDateTo+'/'+endDateFrom+'/'+endDateTo;
	$('#sianisdemoAjaxArea').load(
			encodeURI(url)+' #sianisSelectObstablesResult',
			function(response, status, xhr) {
				if (status == 'error') {
				    sianisdemoStatusLine('Error: '+xhr.status+' '+xhr.statusText);
				} else {
				    sianisdemoStatusLine(' Found '+$('#sianisSelectObstablesCount').text()+' observation tables within the geographic box and the date interval');
				    sianisdemoShowSelection();
				}
			}
	);
}

function sianisdemoDrawMap() {
	var mapOptions = {
		center: new google.maps.LatLng(0, 0),
		zoom: 1,
		scaleControl: true,
		mapTypeId: google.maps.MapTypeId.HYBRID
	};
	sianisdemoMap = new google.maps.Map(document.getElementById("sianisdemoMapArea"), mapOptions);
	rectangleOptions = {
			fillColor: '#ffff00',
			fillOpacity: 0.2,
			strokeWeight: 2,
			clickable: false,
			zIndex: 1,
			editable: true
		};
	drawingManager = new google.maps.drawing.DrawingManager({
		drawingMode: google.maps.drawing.OverlayType.RECTANGLE,
		drawingControl: true,
		drawingControlOptions: {
			position: google.maps.ControlPosition.TOP_CENTER,
			drawingModes: [ google.maps.drawing.OverlayType.RECTANGLE ]
		},
		rectangleOptions: rectangleOptions
	});
	drawingManager.setMap(sianisdemoMap);
	currentBBox = new google.maps.Rectangle(rectangleOptions);
	currentBBox.setMap(sianisdemoMap);
	google.maps.event.addListener(drawingManager, 'rectanglecomplete', 
			function(bBox) {
				sianisdemoClear();
				drawingManager.setDrawingMode(null);
				currentBBox = bBox;
				sianisdemoBBoxDrawn(bBox);
				google.maps.event.addListener(bBox, 'bounds_changed', 
						function() {
							sianisdemoBBoxDrawn(currentBBox);
						    sianisdemoStatusLine('Bounding box drawn');
						}
				);
			}
	);
}

function sianisdemoBBoxDrawn(bBox) {
	sianisdemoShowGeoDiv();
	document.getElementById("sianisdemoNorth").value = bBox.getBounds().getNorthEast().lat();
	document.getElementById("sianisdemoEast").value = bBox.getBounds().getNorthEast().lng();
	document.getElementById("sianisdemoSouth").value = bBox.getBounds().getSouthWest().lat();
	document.getElementById("sianisdemoWest").value = bBox.getBounds().getSouthWest().lng();
	sianisdemoMap.fitBounds(bBox.getBounds());
	document.getElementById("sianisdemoFindButton").disabled = "";
	document.getElementById("sianisdemoClearButton").disabled = "";
}

function sianisdemoBBoxChanged() {
	var north = document.getElementById("sianisdemoNorth").value;
	var east = document.getElementById("sianisdemoEast").value;
	var south = document.getElementById("sianisdemoSouth").value;
	var west = document.getElementById("sianisdemoWest").value;
	if ( !north || !south || !west || !east ) {
		return;
	}
	if ( north>90 || north<-90 || south>90 || south<-90 || west>180 || west<-180 || east>180 || east<-180 ) {
		alert("Coordinates not within bounds south,west=("+south+","+west+") north,east=("+north+","+east+")");
		return;
	}
	if (north <= south) {
		alert("Coordinates wrong, north="+north+" must be larger than south="+south);
		return;
	}
	currentBBox.setBounds(new google.maps.LatLngBounds(new google.maps.LatLng(south, west), new google.maps.LatLng(north, east))); 
	sianisdemoMap.fitBounds(currentBBox.getBounds());
	document.getElementById("sianisdemoFindButton").disabled = "";
	document.getElementById("sianisdemoClearButton").disabled = "";
}

function sianisdemoShowGeoDiv() {
	document.getElementById('sianisdemoSelectGeo').style.display='';
	document.getElementById('sianisdemoShowGeoDiv').style.display='none';
	document.getElementById('sianisdemoHideGeoDiv').style.display='';
}

function sianisdemoHideGeoDiv() {
	document.getElementById('sianisdemoSelectGeo').style.display='none';
	document.getElementById('sianisdemoShowGeoDiv').style.display='';
	document.getElementById('sianisdemoHideGeoDiv').style.display='none';
}

function sianisdemoShowProjectTree() {
	document.getElementById('sianisdemoProjectStructureArea').style.display='';
	document.getElementById('sianisdemoShowProjectTree').style.display='none';
	document.getElementById('sianisdemoHideProjectTree').style.display='';
}

function sianisdemoHideProjectTree() {
	document.getElementById('sianisdemoProjectStructureArea').style.display='none';
	document.getElementById('sianisdemoShowProjectTree').style.display='';
	document.getElementById('sianisdemoHideProjectTree').style.display='none';
}

function sianisdemoItemClick(item) {
	var pid = item.id.substring("item".length);
	var menu = document.getElementById("menu"+pid);
	menu.style.backgroundColor = "#888888";
	menu.style.border = "thin solid";
	menu.style.zIndex = "101";
	menu.style.position = "absolute";
	menu.style.left = "100px";
	menu.style.display = "";
}

function sianisdemoItemOver(item) {
	item.style.backgroundColor = "#dddddd";
}

function sianisdemoItemOut(item) {
	item.style.backgroundColor = "#eedd99";
	var pid = item.id.substring("item".length);
	var menu = document.getElementById("menu"+pid);
	menu.style.display = "none";
}

function sianisdemoMenuOver(menu) {
	menu.style.display = "";
}

function sianisdemoMenuOut(menu) {
	menu.style.display = "none";
}

function sianisdemoProjectShow(projectShowA) {
	projectPid = projectShowA.id.substring("projectShowA".length);
	var projectElement = document.getElementById("item"+projectPid);
	var parkElement = projectElement.nextSibling;
	while (parkElement && parkElement.className != "sianisdemoProjectItem") {
		if (parkElement.className == "sianisdemoParkItem") {
			parkElement.style.display = "";
		}
		parkElement = parkElement.nextSibling;
	}
	var latElement = projectElement.firstChild;
	while (latElement && latElement.localName != "span") {
		latElement = latElement.nextSibling;
	}
	if (latElement && latElement.localName == "span") {
		var lonElement = latElement.nextSibling;
		while (lonElement && lonElement.localName != "span") {
			lonElement = lonElement.nextSibling;
		}
		if (lonElement && lonElement.localName == "span") {
			sianisdemoMap.setCenter(new google.maps.LatLng(latElement.textContent,lonElement.textContent));
			sianisdemoMap.setZoom(5);
			drawingManager.setDrawingMode(null);
		}
	}
	return false;
}

function sianisdemoProjectHide(projectHideA) {
	projectPid = projectHideA.id.substring("projectHideA".length);
	var projectElement = document.getElementById("item"+projectPid);
	var parkElement = projectElement.nextSibling;
	while (parkElement && parkElement.className != "sianisdemoProjectItem") {
		if (parkElement.className == "sianisdemoParkItem") {
			parkElement.style.display = "none";
			sianisdemoParkHide(document.getElementById("parkHideA"+parkElement.id.substring("item".length)));
		}
		parkElement = parkElement.nextSibling;
	}
	return false;
}

function sianisdemoProjectSelect(projectElement) {
	projectPid = projectElement.id.substring("item".length);
	var parkElement = projectElement.nextSibling;
	while (parkElement && parkElement.className != "sianisdemoProjectItem") {
		if (parkElement.className == "sianisdemoParkItem") {
			parkElement.style.display = "";
			sianisdemoParkSelect(parkElement);
		}
		parkElement = parkElement.nextSibling;
	}
	return false;
}

function sianisdemoProjectDeselect(projectElement) {
	var parkElement = projectElement.nextSibling;
	while (parkElement && parkElement.className != "sianisdemoProjectItem") {
		if (parkElement.className == "sianisdemoParkItem") {
			sianisdemoParkDeselect(parkElement);
		}
		parkElement = parkElement.nextSibling;
	}
	return false;
}

function sianisdemoParkShow(parkShowA) {
	parkPid = parkShowA.id.substring("parkShowA".length);
	var parkElement = document.getElementById("item"+parkPid);
	var siteElement = parkElement.nextSibling;
	while (siteElement && siteElement.className != "sianisdemoParkItem" && siteElement.className != "sianisdemoProjectItem") {
		if (siteElement.className == "sianisdemoSiteItem") {
			siteElement.style.display = "";
		}
		siteElement = siteElement.nextSibling;
	}
	return false;
}

function sianisdemoParkHide(parkHideA) {
	parkPid = parkHideA.id.substring("parkHideA".length);
	var parkElement = document.getElementById("item"+parkPid);
	var siteElement = parkElement.nextSibling;
	while (siteElement && siteElement.className != "sianisdemoParkItem" && siteElement.className != "sianisdemoProjectItem") {
		if (siteElement.className == "sianisdemoSiteItem") {
			siteElement.style.display = "none";
			sianisdemoSiteHide(document.getElementById("siteHideA"+siteElement.id.substring("item".length)));
		}
		siteElement = siteElement.nextSibling;
	}
	return false;
}

function sianisdemoParkSelect(parkElement) {
	parkPid = parkElement.id.substring("item".length);
	var siteElement = parkElement.nextSibling;
	while (siteElement && siteElement.className != "sianisdemoParkItem" && siteElement.className != "sianisdemoProjectItem") {
		if (siteElement.className == "sianisdemoSiteItem") {
			siteElement.style.display = "";
			sianisdemoSiteSelect(siteElement);
		}
		siteElement = siteElement.nextSibling;
	}
	return false;
}

function sianisdemoParkDeselect(parkElement) {
	var siteElement = parkElement.nextSibling;
	while (siteElement && siteElement.className != "sianisdemoParkItem" && siteElement.className != "sianisdemoProjectItem") {
		if (siteElement.className == "sianisdemoSiteItem") {
			sianisdemoSiteDeselect(siteElement);
		}
		siteElement = siteElement.nextSibling;
	}
	return false;
}

function sianisdemoSiteShow(siteShowA) {
	sitePid = siteShowA.id.substring("siteShowA".length);
	var siteElement = document.getElementById("item"+sitePid);
	var cameratrapElement = siteElement.nextSibling;
	while (cameratrapElement && cameratrapElement.className != "sianisdemoSiteItem" && cameratrapElement.className != "sianisdemoParkItem" && cameratrapElement.className != "sianisdemoProjectItem") {
		if (cameratrapElement.className == "sianisdemoCameratrapItem") {
			cameratrapElement.style.display = "";
		}
		cameratrapElement = cameratrapElement.nextSibling;
	}
	return false;
}

function sianisdemoSiteHide(siteHideA) {
	sitePid = siteHideA.id.substring("siteHideA".length);
	var siteElement = document.getElementById("item"+sitePid);
	var cameratrapElement = siteElement.nextSibling;
	while (cameratrapElement && cameratrapElement.className != "sianisdemoSiteItem" && cameratrapElement.className != "sianisdemoParkItem" && cameratrapElement.className != "sianisdemoProjectItem") {
		if (cameratrapElement.className == "sianisdemoCameratrapItem") {
			cameratrapElement.style.display = "none";
			sianisdemoCameratrapHide(document.getElementById("cameratrapHideA"+cameratrapElement.id.substring("item".length)));
		}
		cameratrapElement = cameratrapElement.nextSibling;
	}
	return false;
}

function sianisdemoSiteSelect(siteElement) {
	sitePid = siteElement.id.substring("item".length);
	var cameratrapElement = siteElement.nextSibling;
	while (cameratrapElement && cameratrapElement.className != "sianisdemoSiteItem" && cameratrapElement.className != "sianisdemoParkItem" && cameratrapElement.className != "sianisdemoProjectItem") {
		if (cameratrapElement.className == "sianisdemoCameratrapItem") {
			cameratrapElement.style.display = "";
			sianisdemoCameratrapSelect(cameratrapElement);
		}
		cameratrapElement = cameratrapElement.nextSibling;
	}
	return false;
}

function sianisdemoSiteDeselect(siteElement) {
	var cameratrapElement = siteElement.nextSibling;
	while (cameratrapElement && cameratrapElement.className != "sianisdemoSiteItem" && cameratrapElement.className != "sianisdemoParkItem" && cameratrapElement.className != "sianisdemoProjectItem") {
		if (cameratrapElement.className == "sianisdemoCameratrapItem") {
			sianisdemoCameratrapDeselect(cameratrapElement);
		}
		cameratrapElement = cameratrapElement.nextSibling;
	}
	return false;
}

function sianisdemoCameratrapShow(cameratrapShowA) {
	cameratrapPid = cameratrapShowA.id.substring("cameratrapShowA".length);
	var cameratrapElement = document.getElementById("item"+cameratrapPid);
	var obstableElement = cameratrapElement.nextSibling;
	while (obstableElement && obstableElement.className != "sianisdemoCameratrapItem" && obstableElement.className != "sianisdemoSiteItem" && obstableElement.className != "sianisdemoParkItem" && obstableElement.className != "sianisdemoProjectItem") {
		if (obstableElement.className == "sianisdemoObstableItem") {
			obstableElement.style.display = "";
		}
		obstableElement = obstableElement.nextSibling;
	}
	return false;
}

function sianisdemoCameratrapHide(cameratrapHideA) {
	cameratrapPid = cameratrapHideA.id.substring("cameratrapHideA".length);
	var cameratrapElement = document.getElementById("item"+cameratrapPid);
	var obstableElement = cameratrapElement.nextSibling;
	while (obstableElement && obstableElement.className != "sianisdemoCameratrapItem" && obstableElement.className != "sianisdemoSiteItem" && obstableElement.className != "sianisdemoParkItem" && obstableElement.className != "sianisdemoProjectItem") {
		if (obstableElement.className == "sianisdemoObstableItem") {
			obstableElement.style.display = "none";
		}
		obstableElement = obstableElement.nextSibling;
	}
	return false;
}

function sianisdemoCameratrapSelect(cameratrapElement) {
	cameratrapPid = cameratrapElement.id.substring("item".length);
	var obstableElement = cameratrapElement.nextSibling;
	while (obstableElement && obstableElement.className != "sianisdemoCameratrapItem" && obstableElement.className != "sianisdemoSiteItem" && obstableElement.className != "sianisdemoParkItem" && obstableElement.className != "sianisdemoProjectItem") {
		if (obstableElement.className == "sianisdemoObstableItem") {
			obstableElement.style.display = "";
			for (var i=0; i<obstableElement.childNodes.length; i++) {
				var obstableCheckBoxElement = obstableElement.childNodes[i];
				if (obstableCheckBoxElement.nodeType == 1 && obstableCheckBoxElement.type == "checkbox") {
					obstableCheckBoxElement.checked = true;
					sianisdemoObstableClicked(obstableCheckBoxElement);
				}
			}
		}
		obstableElement = obstableElement.nextSibling;
	}
	return false;
}

function sianisdemoCameratrapDeselect(cameratrapElement) {
	var obstableElement = cameratrapElement.nextSibling;
	while (obstableElement && obstableElement.className != "sianisdemoCameratrapItem" && obstableElement.className != "sianisdemoSiteItem" && obstableElement.className != "sianisdemoParkItem" && obstableElement.className != "sianisdemoProjectItem") {
		if (obstableElement.className == "sianisdemoObstableItem") {
			for (var i=0; i<obstableElement.childNodes.length; i++) {
				var obstableCheckBoxElement = obstableElement.childNodes[i];
				if (obstableCheckBoxElement.nodeType == 1 && obstableCheckBoxElement.type == "checkbox") {
					obstableCheckBoxElement.checked = false;
					sianisdemoObstableClicked(obstableCheckBoxElement);
				}
			}
		}
		obstableElement = obstableElement.nextSibling;
	}
	return false;
}

function sianisdemoObstableCameraLocation(obstableElement) {
	var cameraLocation;
	var latElement = obstableElement.firstChild;
	while (latElement && latElement.localName != "span") {
		latElement = latElement.nextSibling;
	}
	if (latElement && latElement.localName == "span") {
		var lonElement = latElement.nextSibling;
		while (lonElement && lonElement.localName != "span") {
			lonElement = lonElement.nextSibling;
		}
		if (lonElement && lonElement.localName == "span") {
			cameraLocation = new google.maps.LatLng(latElement.textContent,lonElement.textContent);
		}
	}
	return cameraLocation;
}

function sianisdemoObstableClicked(obstableCheckBoxElement) {
	var obstableElement = obstableCheckBoxElement.parentNode;
	var cameraLocation = sianisdemoObstableCameraLocation(obstableElement);
	var markerTitle = document.getElementById(obstableCheckBoxElement.value+"Label").textContent;
	sianisdemoObstableSwitch(obstableCheckBoxElement, markerTitle, cameraLocation);
	sianisdemoSetRunWorkflowButton(document.getElementById("sianisdemoWorkflowSelect"));
}

function sianisdemoObstableSwitch(obstableCheckBoxElement, markerTitle, cameraLocation) {
	if (obstableCheckBoxElement.checked && !obstableCheckBoxElement.disabled) {
		obstableCheckBoxElement.title = "Deselect the ObservationTable";
		for (var i=0; i<markersArray.length; i++) {
			var marker = markersArray[i];
			if (marker.getTitle() == markerTitle) {
				return;
			}
		}
		sianisdemoMap.setCenter(cameraLocation);
		sianisdemoSetMarker(cameraLocation, obstableCheckBoxElement.value, markerTitle);
	} else {
		obstableCheckBoxElement.title = "Select the ObservationTable";
		for (var i=0; i<markersArray.length; i++) {
			var marker = markersArray[i];
			if (marker.getTitle() == markerTitle) {
				sianisdemoClearMarker(markersArray[i]);
				markersArray.splice(i, 1);
			}
		}
	}
}

function sianisdemoClear() {
	sianisdemoClearMarkers();
	currentBBox.setMap(null);
	document.getElementById("sianisdemoNorth").value = '';
	document.getElementById("sianisdemoEast").value = '';
	document.getElementById("sianisdemoSouth").value = '';
	document.getElementById("sianisdemoWest").value = '';
	document.getElementById("sianisdemoClearButton").disabled = "true";
	document.getElementById("sianisdemoFindButton").disabled = "true";
	drawingManager.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
	currentBBox = new google.maps.Rectangle(rectangleOptions);
	currentBBox.setMap(sianisdemoMap);
    sianisdemoStatusLine('Selection cleared');
	sianisdemoSetRunWorkflowButton(document.getElementById("sianisdemoWorkflowSelect"));
}

function sianisdemoShowSelection() {
	sianisdemoClearMarkers();
	var resultElement = document.getElementById("sianisSelectObstablesResult");
	var resultElementChild = resultElement.firstChild;
	while (resultElementChild && resultElementChild.localName != "span") {
		if (resultElementChild.localName == "div") {
			var resultElementChildId = resultElementChild.textContent;
			var resultElementChildTitle = document.getElementById(resultElementChildId+"Label").textContent;
			var resultElementChildLat = document.getElementById(resultElementChildId+"Lat").textContent;
			var resultElementChildLon = document.getElementById(resultElementChildId+"Lon").textContent;
			var cameraLocation = new google.maps.LatLng(resultElementChildLat,resultElementChildLon);
			sianisdemoMap.setCenter(cameraLocation);
			sianisdemoSetMarker(cameraLocation, resultElementChildId, resultElementChildTitle);
			var inputNodes = document.getElementsByTagName("input");
			for (var i=0; i<inputNodes.length; i++) {
				var inputNode = inputNodes[i];
				if (inputNode.value == resultElementChildId && inputNode.type == 'checkbox') {
					inputNode.checked = true;
					inputNode.title = "Deselect the ObservationTable";
					var obstableElement = inputNode.parentNode;
					obstableElement.style.display = "";
					var cameratrapElement = obstableElement.previousSibling;
					while (cameratrapElement && cameratrapElement.className != "sianisdemoCameratrapItem") {
						cameratrapElement = cameratrapElement.previousSibling;
					}
					cameratrapElement.style.display = "";
					var siteElement = cameratrapElement.previousSibling;
					while (siteElement && siteElement.className != "sianisdemoSiteItem") {
						siteElement = siteElement.previousSibling;
					}
					siteElement.style.display = "";
					var parkElement = siteElement.previousSibling;
					while (parkElement && parkElement.className != "sianisdemoParkItem") {
						parkElement = parkElement.previousSibling;
					}
					parkElement.style.display = "";
					var projectElement = parkElement.previousSibling;
					while (projectElement && projectElement.className != "sianisdemoProjectItem") {
						projectElement = projectElement.previousSibling;
					}
					projectElement.style.display = "";
				}
			}
		}
		resultElementChild = resultElementChild.nextSibling;
	}
	sianisdemoSetRunWorkflowButton(document.getElementById("sianisdemoWorkflowSelect"));
}

function sianisdemoObstableFilter() {
	var researcherCheckboxChecked = (document.getElementById("sianisdemoResearcherCheckbox")).checked;
	var volunteerCheckboxChecked = (document.getElementById("sianisdemoVolunteerCheckbox")).checked;
	var beginDateFrom = document.getElementById("sianisdemoBeginFrom").value.replace(/\//g, '');
	var beginDateTo = document.getElementById("sianisdemoBeginTo").value.replace(/\//g, '');
	var endDateFrom = document.getElementById("sianisdemoEndFrom").value.replace(/\//g, '');
	var endDateTo = document.getElementById("sianisdemoEndTo").value.replace(/\//g, '');
	var inputNodes = document.getElementsByTagName("input");
	for (var i=0; i<inputNodes.length; i++) {
		var inputNode = inputNodes[i];
		if (inputNode.name == "obstable" && inputNode.type == 'checkbox') {
			var inputNodeText = inputNode.nextSibling.textContent;
			var cameratrapBeginDate = inputNode.previousSibling.previousSibling.textContent;
			var cameratrapEndDate = inputNode.previousSibling.textContent;
			var intervalCheck = false;
			if (beginDateFrom <= cameratrapBeginDate && cameratrapBeginDate <= beginDateTo  && endDateFrom <= cameratrapEndDate  && cameratrapEndDate <= endDateTo) {
				intervalCheck = true;
			}
			if (inputNodeText.indexOf("esearcher") > -1) {
				inputNode.disabled = !researcherCheckboxChecked || !intervalCheck;
			} else if (inputNodeText.indexOf("olunteer") > -1) {
				inputNode.disabled = !volunteerCheckboxChecked || !intervalCheck;
			} else {
				inputNode.disabled = !intervalCheck;
			}
			sianisdemoObstableClicked(inputNode);
		}
	}
	sianisdemoGetObstables();
}

function sianisdemoSetMarker(cameraLocation, obstablePid, markerTitle) {
	var marker = new google.maps.Marker({
		position: cameraLocation,
		map: sianisdemoMap,
		title: markerTitle
		}); 
	markersArray.push(marker);
	var infoNode = document.getElementById(obstablePid+"Info");
	marker.infoWindow = new google.maps.InfoWindow({
		content: infoNode.innerHTML
	});
	google.maps.event.addListener(marker, 'click', function() {
		marker.infoWindow.open(sianisdemoMap, marker);
	}); 
}

function sianisdemoClearMarkers() {
	for (var i=0; i<markersArray.length; i++) {
		sianisdemoClearMarker(markersArray[i]);
	}
	markersArray = [];
	sianisdemoClearObstables();
}

function sianisdemoClearObstables() {
	var inputNodes = document.getElementsByTagName("input");
	for (var i=0; i<inputNodes.length; i++) {
		var inputNode = inputNodes[i];
		if (inputNode.name == 'obstable' && inputNode.type == 'checkbox') {
			inputNode.checked = false;
		}
	}
}

function sianisdemoClearMarker(marker) {
	marker.infoWindow.setMap(null);
	marker.infoWindow = null;
	marker.setMap(null);
}

function sianisdemoWorkflowSelected(selectWorkflowElement) {
	var i = selectWorkflowElement.selectedIndex;
    var elementId = "sianisdemoWorkflowsInput"+i;
    var element = document.getElementById(elementId);
    var inputNames = element.textContent;
	document.getElementById("sianisdemoSelectObservationTables").style.display = "";
	if (inputNames.indexOf('species_name')==-1) {
		document.getElementById("sianisdemoSpecies").disabled = "true";
		document.getElementById("sianisdemoGetSpeciesButton").disabled = "true";
		document.getElementById("sianisdemoSpecies").selectedIndex = 0;
		speciesName = ' '; 
	} else {
		document.getElementById("sianisdemoSpecies").disabled = "";
		document.getElementById("sianisdemoGetSpeciesButton").disabled = "";
	}
	if (i>-1) {
		var selectedOptionElement = selectWorkflowElement.options[i];
		workflowName = selectedOptionElement.value;
	}
	sianisdemoSetRunWorkflowButton(selectWorkflowElement);
}

function sianisdemoSetRunWorkflowButton(selectWorkflowElement) {
	sianisdemoGetObstables();
	var i = selectWorkflowElement.selectedIndex;
	if (i<0) return;
    var elementId = "sianisdemoWorkflowsInput"+i;
    var element = document.getElementById(elementId);
    var inputNames = element.textContent;
	if (inputNames.indexOf('species_name')==-1) {
		if (obstablePids=="") {
			document.getElementById("sianisdemoRunWorkflowButton").disabled = "true";
		} else {
			document.getElementById("sianisdemoRunWorkflowButton").disabled = "";
		}
	} else {
		if (obstablePids=="" || speciesName==" ") {
			document.getElementById("sianisdemoRunWorkflowButton").disabled = "true";
		} else {
			document.getElementById("sianisdemoRunWorkflowButton").disabled = "";
		}
	}
}

function sianisdemoSpeciesSelected(selectSpeciesElement) {
	var i = selectSpeciesElement.selectedIndex;
	if (i>-1) {
		var selectedOptionElement = selectSpeciesElement.options[i];
		speciesName = selectedOptionElement.value;
	}
	sianisdemoSetRunWorkflowButton(document.getElementById("sianisdemoWorkflowSelect"));
}

function sianisdemoGetObstables() {
	obstablePids = "";
	obstablesInit = "";
	obstablesSelected = 0;
	var infoElement = document.getElementById("sianisGetProjectStructureResult");
	if (!infoElement) return;
	var infoElementChild = infoElement.firstChild;
	while (infoElementChild && infoElementChild.localName != "span") {
		if (infoElementChild.localName == "div" && infoElementChild.className == "sianisdemoObstableItem") {
			var infoElementChildChecked = false;
			var infoElementChildDisabled = false;
			var infoElementChildId = "";
			for (var j=0; j<infoElementChild.childNodes.length; j++) {
				var infoElementChildChild = infoElementChild.childNodes[j];
				if (infoElementChildChild.nodeType == 1 && infoElementChildChild.type == "checkbox") {
					infoElementChildChecked = infoElementChildChecked || infoElementChildChild.checked;
					infoElementChildDisabled = infoElementChildDisabled || infoElementChildChild.disabled;
					infoElementChildId = infoElementChildChild.value;
				}
			}
			if (infoElementChildChecked && !infoElementChildDisabled) {
				var infoElementChildTitle = document.getElementById(infoElementChildId+"Label").textContent;
				if (obstablePids) {
					obstablePids += ", ";
				}
				obstablesSelected = obstablesSelected+1;
				obstablePids += infoElementChildId;
				obstablesInit += '<br/>'+sianisdemoGetDateTime()+' with Observation Table: '+infoElementChildTitle+' ('+infoElementChildId+')';
			}
		}
		infoElementChild = infoElementChild.nextSibling;
	}
	if (obstablesSelected == 0) {
		obstablesSelected = '0';
		document.getElementById("sianisdemoClearButton").disabled = "true";
	} else {
		document.getElementById("sianisdemoClearButton").disabled = "";
	}
    $('#sianisdemoSelectedObstablesCount').html(obstablesSelected);
}

function sianisdemoRun() {
	var workflowSelect = document.getElementById("sianisdemoWorkflowSelect");
	var workflowSelectedOption = workflowSelect.options[workflowSelect.selectedIndex];
	var workflowInit = sianisdemoGetDateTime()+' Initializing Workflow: '+workflowSelectedOption.textContent+' ('+workflowSelectedOption.value+')';
	sianisdemoGetObstables();
    $('#sianisdemoStatusArea').html(workflowInit);
	document.getElementById("sianisdemoStatusDiv").style.display = "";
	UUID = "";
	var url = '/gflow/gflowRun/'+workflowName;
	$('#sianisdemoAjaxArea').load(
			encodeURI(url)+' #gflowResult',
			function(response, status, xhr) {
				if (status == 'error') {
				    sianisdemoStatusLine('Error: '+xhr.status+' '+xhr.statusText);
				} else {
					if ($('#sianisdemoAjaxArea').text().indexOf('GFLOW ERROR')>-1) {
					    sianisdemoStatusLine($('#sianisdemoAjaxArea').text());
					} else {
						UUID = $('#sianisdemoAjaxArea').text();
					    sianisdemoStatusLine('Initialized : UUID='+UUID);
					    var inputs = new Array('pids_of_observation_tables', obstablePids);
					    if (speciesName != " ") {
					    	inputs.push('species_name');
					    	inputs.push(speciesName);
					    }
					    sianisdemoSetInputs(UUID, inputs);
					}
				}
			}
	);
}

function sianisdemoSetInputs(UUID, inputs) {
	var url = '/gflow/gflowSetInput/'+UUID+'/'+inputs.shift()+'/'+inputs.shift();
	$('#sianisdemoAjaxArea').load(
			encodeURI(url)+' #gflowResult',
			function(response, status, xhr) {
				if (status == 'error') {
				    sianisdemoStatusLine('Error: '+xhr.status+' '+xhr.statusText);
				} else {
					tavernaStatus = $('#sianisdemoAjaxArea').text();
				    sianisdemoStatusLine(tavernaStatus);
				    if (inputs.length > 0) {
					    sianisdemoSetInputs(UUID, inputs);
				    } else {
				    	sianisdemoSetStatus(UUID, 'Operating');
				    }
				}
			}
	);
}

function sianisdemoSetStatus(UUID, newStatus) {
	var url = '/gflow/gflowSetStatus/'+UUID+'/'+newStatus;
	$('#sianisdemoAjaxArea').load(
			encodeURI(url)+' #gflowResult',
			function(response, status, xhr) {
				if (status == 'error') {
				    sianisdemoStatusLine('Error: '+xhr.status+' '+xhr.statusText);
				} else {
					tavernaStatus = $('#sianisdemoAjaxArea').text();
				    sianisdemoStatusLine(tavernaStatus);
				    if (tavernaStatus == 'Operating') {
				    	window.setTimeout("sianisdemoWaitFinish(UUID)",3000);
				    } else {
					    if (tavernaStatus == 'Finished') {
					    	sianisdemoWaitFinish(UUID);
					    } else {
						    sianisdemoStatusLine('Error:<BR/>'+$('#sianisdemoAjaxArea').text());
					    }
				    }
				}
			}
	);
}

function sianisdemoWaitFinish(UUID) {
	var url = '/gflow/gflowWaitFinish/'+UUID;
	$('#sianisdemoAjaxArea').load(
			encodeURI(url)+' #gflowResult',
			function(response, status, xhr) {
				if (status == 'error') {
				    sianisdemoStatusLine('Error: '+xhr.status+' '+xhr.statusText);
				} else {
					tavernaStatus = $('#sianisdemoAjaxArea').text();
				    sianisdemoStatusLine(tavernaStatus);
				    if (tavernaStatus == 'Operating') {
				    	window.setTimeout("sianisdemoWaitFinish(UUID)",3000);
				    } else {
					    if (tavernaStatus == 'Finished') {
					    	sianisdemoGetResult(UUID);
					    } else {
						    sianisdemoStatusLine('Error:<BR/>'+$('#sianisdemoAjaxArea').text());
					    }
				    }
				}
			}
	);
}

function sianisdemoGetResult(UUID) {
	var url = '/gflow/gflowGetResult/'+UUID;
	$('#sianisdemoAjaxArea').load(
			encodeURI(url)+' #gflowResult',
			function(response, status, xhr) {
				if (status == 'error') {
				    sianisdemoStatusLine('Error: '+xhr.status+' '+xhr.statusText);
				} else {
					if ($('#sianisdemoAjaxArea').text().indexOf('GFLOW ERROR')>-1) {
					    sianisdemoStatusLine($('#sianisdemoAjaxArea').text());
					} else {
					    sianisdemoStatusLine('<a id="sianisdemoResultButton" target="'+UUID+'" href="'+$('#sianisdemoAjaxArea').text()+'">Retrieve the Result</a><br/>');
					}
				}
			}
	);
}
