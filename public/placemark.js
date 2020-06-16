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
  myMap.geoObjects.add(objectManagerOld);
  myMap.geoObjects.add(objectManagerNew);

  const defaultData = { "type": "FeatureCollection", "features": [] };
  Promise.all([
    fetch('/data/COVID.json').catch(_ => defaultData).then(res => res.json()),
    fetch('/data/COVID-yesterday.json').catch(_ => defaultData).then(res => res.json())
  ]).then(([today, yesterday]) => {
    const newCases = findNewCases(today, yesterday);
    console.log(`new cases: ${newCases.length}`);
    const newData = { "type": "FeatureCollection", "features": newCases };
    objectManagerOld.add(yesterday);
    objectManagerNew.add(newData);
    const CustomControlClass = createControlClass();
    const customControl = new CustomControlClass({
      newCaseCount: newCases.length,
      totalCaseCount: yesterday.features.length + newCases.length,
    });
    myMap.controls.add(customControl, {
      float: 'true',
      position: {
        top: 46,
        left: 10
      },
    });
  });
}

function createControlClass() {
  const CustomControlClass = function (options) {
    CustomControlClass.superclass.constructor.call(this, options);
    this._$content = null;
    this._geocoderDeferred = null;
    this.newCaseCount = options.newCaseCount;
    this.totalCaseCount = options.totalCaseCount;
  };

  ymaps.util.augment(CustomControlClass, ymaps.collection.Item, {
    onAddToMap: function (map) {
      CustomControlClass.superclass.onAddToMap.call(this, map);
      this._lastCenter = null;
      this.getParent().getChildElement(this).then(this._onGetChildElement, this);
    },

    onRemoveFromMap: function (oldMap) {
      this._lastCenter = null;
      if (this._$content) {
        this._$content.remove();
        this._mapEventGroup.removeAll();
      }
      CustomControlClass.superclass.onRemoveFromMap.call(this, oldMap);
    },

    _onGetChildElement: function (parentDomContainer) {
      const div = document.createElement('div');
      div.className = 'new-cases-label';
      this._$content = parentDomContainer.appendChild(div);
      this._mapEventGroup = this.getMap().events.group();
      const newCasesDiv = document.createElement('div');
      newCasesDiv.appendChild(document.createTextNode(`New cases today: ${this.newCaseCount}`));
      const totalCasesDiv = document.createElement('div');
      totalCasesDiv.appendChild(document.createTextNode(`Total cases: ${this.totalCaseCount}`));
      this._$content.appendChild(newCasesDiv);
      this._$content.appendChild(totalCasesDiv);
    },

  });
  return CustomControlClass;
}
