ymaps.ready(init);

function getCoordsAsString(feature) {
  return feature.geometry.coordinates.toString();
}

function groupFeaturesByCoords(features) {
  const map = {};
  for (const feature of features) {
    const coords = getCoordsAsString(feature);
    if (coords in map) {
      map[coords].push(feature);
    } else {
      map[coords] = [feature];
    }
  }
  return map;
}


function findNewCases(today, yesterday) {
  const todayCases = today.features;
  const yesterdayCases = yesterday.features;
  const newFeatures = [];
  const groups = groupFeaturesByCoords(yesterdayCases);
  for (const feature of todayCases) {
    const coords = getCoordsAsString(feature);
    if (coords in groups) {
      const foundFeatures = groups[coords];
      foundFeatures.pop();
      if (foundFeatures.length === 0) {
        delete groups[coords];
      }
    } else {
      newFeatures.push(feature);
    }
  }
  return newFeatures;
}

function init() {
  var myMap = new ymaps.Map("map", { center: [56.843363, 60.605016], zoom: 11 });
  const options = {
    clusterize: true,
    gridSize: 32,
    clusterDisableClickZoom: true
  };
  const objectManagerNew = new ymaps.ObjectManager(options);
  const objectManagerOld = new ymaps.ObjectManager(options);
  myMap.controls.add("zoomControl");
  objectManagerNew.objects.options.set('preset', 'islands#redDotIcon');
  objectManagerNew.clusters.options.set('preset', 'islands#redClusterIcons');
  objectManagerOld.objects.options.set('preset', 'islands#blueDotIcon');
  objectManagerOld.clusters.options.set('preset', 'islands#blueClusterIcons');
  myMap.geoObjects.add(objectManagerNew);
  myMap.geoObjects.add(objectManagerOld);

  const defaultData = { "type": "FeatureCollection", "features": [] };
  Promise.all([
    fetch('/data/COVID.json').catch(_ => defaultData).then(res => res.json()),
    fetch('/data/COVID-yesterday.json').catch(_ => defaultData).then(res => res.json())
  ]).then(([today, yesterday]) => {
    const newCases = findNewCases(today, yesterday);
    const newData = { "type": "FeatureCollection", "features": newCases };
    objectManagerOld.add(yesterday);
    objectManagerNew.add(newData);
  });
}
