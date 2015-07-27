var myapp = angular.module('app', []);

myapp.controller('UserController', ['$scope', '$http', UserController])
	.controller('carHireController', [ '$http', carHireController])
	.directive('myCarMap', myCarMap);

function UserController($scope, $http) {
  $http.get("angular/data1.json").success(function(response) {
    $scope.user = response;
  });
}

function carHireController( $http) {
	/**
	 * You can think of Controller as a class. Each time you call ng-controller
	 * angular will create a new instance of Controller by calling
	 * `new Controller()`.
	 * Then with "Controller as ctrl" angular automatically link it to scope, same
	 * as: `$scope.ctrl = new Controller();`. So if in controller you have some
	 * properties like `this.title = 'The title';`, then in $scope you have
	 * `$scope.ctrl.title = 'TheTitle';`. Why you need it? Because of Misko advise
	 * about a must-have 'dot' in ng-model. I recommend this video by
	 * John Lindquist https://egghead.io/lessons/angularjs-the-dot and an article
	 * by Todd http://toddmotto.com/digging-into-angulars-controller-as-syntax/
	 *
	 * vm stand for view model, what John Papa recommended in his style guide
	 * https://github.com/johnpapa/angular-styleguide. You can learn many thing
	 * from him
	 */
  var vm = this;
  vm.search = null;

  $http.get('angular/data1.json').success(function(data) {
    vm.results = data.results;
  }).error(function(data, status, headers, config) {
    console.log('error');
  });

	vm.backgroundColor = function (index) {
		return ['#00829E', '#00A65A', '#F39C12', '#DD4B39'][index];
	};
}

function myCarMap() {
	return {
		restrict: 'EA',
		/**
		 * this is isolate scope. You use a object to describe what will be pass
		 * to directive's scope. The '=' sign mean you pass reference to variable
		 * the '@' sign mean that you pass a string value. And '&' mean you pass
		 * a function pointer.
		 * Here is some detail explain
		 * http://csharperimage.jeremylikness.com/2015/05/understanding-angularjs-isolated-scope.html
		 */
		scope: {
			selected: '='
		},
		link: link
	};

	function link(scope, elm, attrs) {
		/**
		 * link function will be executed once right after element attached to the
		 * DOM. You initialize all persistence things here. The handler in watch
		 * function will be executed everytime value changed. You don't want to
		 * create map and marker again and again, right?.
		 */
		// create map
		var mapOptions = {
	    zoom: 4,
	    center: new google.maps.LatLng(30.200000,69.225487),
	    mapTypeId: google.maps.MapTypeId.ROADMAP,
	    streetViewControl: true
	  };
	  map = new google.maps.Map(elm[0], mapOptions);

		//create a marker
		var marker = new google.maps.Marker({
	    map: map
	  });

		var ib = new InfoBox();
		var boxText = document.createElement("div");
	  boxText.style.cssText = "margin-top: 10px; background: rgba(255,255,255,0.7); padding: 10px; border-radius: 10px; color: #000";

	  var boxOptions = {
	    content: boxText,
	    disableAutoPan: false,
	    maxWidth: 0,
	    pixelOffset: new google.maps.Size(-100, 0),
	    zIndex: null,
	    boxStyle: {
	      background: "url('tip.png') no-repeat",
	      width: "250px",
	    },
	    closeBoxURL: "",
	    infoBoxClearance: new google.maps.Size(1, 1),
	    isHidden: false,
	    pane: "floatPane",
	    enableEventPropagation: false
	  };
		ib.setOptions(boxOptions);

		google.maps.event.addListener(marker, 'click', function() {
	    ib.open(map, marker);
	  });

	  google.maps.event.addListener(map, 'click', function() {
	    ib.close();
	  });

		// what for selected change
		scope.$watch('selected', function (value) {
			if(!value) {
				// clear marker and ib;
				marker.setMap(null);
				ib.close();
				return;
			}
			var position = {
				lat: Number(value.company.location.latitude),
				lng: Number(value.company.location.longitude)
			};
			marker.setOptions({
				position: position,
				title: value.company.name,
				icon: value.company.location.cat ? value.company.location.cat + '.png' : null
			});
			marker.setMap(map);
			map.setCenter(position);
			boxText.innerHTML =  "<b>"+value.company.name+"<\/b><br \/>";
		});
	}
}
