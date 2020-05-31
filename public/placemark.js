ymaps.ready(init);

function init() {
    var myMap = new ymaps.Map("map", { center: [56.843363, 60.605016], zoom: 11 }),
        objectManager = new ymaps.ObjectManager({
            clusterize: true,
            gridSize: 32,
            clusterDisableClickZoom: true
        });

    myMap.controls.add("zoomControl");

    objectManager.objects.options.set('preset', 'islands#blueDotIcon');
    objectManager.clusters.options.set('preset', 'islands#blueClusterIcons');
    myMap.geoObjects.add(objectManager);

    fetch('/data/COVID.json')
        .then(res => res.json())
        .then(data => objectManager.add(data));
}
