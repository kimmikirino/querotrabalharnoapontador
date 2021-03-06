'use strict';
/* global angular, confirm */

var local = angular.module('local', ['ngRoute', 'appConfig', 'localServices']);

local.config(['$routeProvider', '$httpProvider',
    function($routeProvider, $httpProvider) {
        $httpProvider.defaults.withCredentials = false;

        $routeProvider
            .when('/local/:placeId?', {
                templateUrl: 'components/local.html',
                controller: 'localController'
            });
    }
]);


/************************************************************************************************
 * Controllers
 ************************************************************************************************/

local.controller('localController', ['$scope', '$rootScope', '$routeParams','apontadorConfig', 'localServices', 'authServices',
    function($scope, $rootScope, $routeParams, apontadorConfig, localServices, authServices ) {
        $scope.placeId = $routeParams.placeId ? $routeParams.placeId : apontadorConfig.place_id;
        $scope.mapUrl = '';

        if (authServices.getAccessToken()) {
            localServices.getLocalInfo($scope.placeId).$promise.then( function (data) {
                $scope.place = data.place;
                $scope.mapUrl = 'https://widget.maplink.com.br/WidGetGenerator/?v=4.1&lat=' + data.place.location.lat + '&lng=' + data.place.location.lng + '&w=300&h=200&m=400&image=http://static.portal.maplink.com.br/images/markers/marker_apontador_map.png&count=0';

                localServices.getLocalPhotos($scope.placeId, 0).$promise.then( function(photoData) {
                    $scope.placePhotos = photoData.photoResults;
                    $scope.photos = photoData.photoResults.photos.slice(0,5);
                    $scope.imageSelected = photoData.photoResults.photos[0];
                });
            });
        } else {
            window.location.href = '#';
        }

        $scope.selectImage = function (img) {
            $scope.imageSelected = img;
        };

        $scope.gotoApontador = function () {
            window.location.href = 'https://www.apontador.com.br/local/sp/sao_paulo/parques/B37822W2/parque_do_ibirapuera/como-chegar.html';
        };
    }
]);

/************************************************************************************************
 * Directives
 ************************************************************************************************/

local.directive('localDetails', ['$routeParams', '$location', function ($routeParams, $location) {
    // Runs during compile
    return {
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        templateUrl: 'components/partials/localDetails.html',
        replace: true,
        link: function ($scope, iElm, iAttrs, controller) {

        }
    };
}]);

local.directive('localPhotos', ['$routeParams', '$location', function ($routeParams, $location) {
    // Runs during compile
    return {
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        templateUrl: 'components/partials/localPhotos.html',
        replace: true,
        link: function ($scope, iElm, iAttrs, controller) {
            $scope.gotoApontador = function () {
                window.location.href = 'https://www.apontador.com.br/local/sp/sao_paulo/parques/B37822W2/parque_do_ibirapuera/fotos.html';
            };
        }
    };
}]);

local.directive('reviews', ['$routeParams', '$location', 'localServices', function ($routeParams, $location, localServices) {
    // Runs during compile
    return {
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        templateUrl: 'components/partials/reviews.html',
        replace: true,
        scope: {placeid: '='},
        link: function ($scope, iElm, iAttrs, controller) {
            $scope.options = { year: 'numeric', month: 'numeric', day: 'numeric' };

            localServices.getReviews($scope.placeid, 0, 5).$promise.then( function(reviews) {
                $scope.reviewResults = reviews.reviewResults;
            });

            $scope.showMore = function (start, rows) {
                localServices.getReviews($scope.placeid, start + rows, rows).$promise.then( function(reviews) {
                    $scope.reviewResults.reviews = $scope.reviewResults.reviews.concat(reviews.reviewResults.reviews);
                    $scope.reviewResults.header = reviews.reviewResults.header;
                });
            };
        }
    };
}]);

local.directive('similarPlaces', ['$routeParams', '$location', 'localServices', function ($routeParams, $location, localServices) {
    // Runs during compile
    return {
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        templateUrl: 'components/partials/similarPlaces.html',
        replace: true,
        scope: {vanityname: '=', city: '=', placeid: '='},
        link: function ($scope, iElm, iAttrs, controller) {
            localServices.getPlaces($scope.vanityname, $scope.city).$promise.then( function(places) {
                $scope.places = places.results.places.filter( function(place) {
                    return place.id !== $scope.placeid;
                });
            });
        }
    };
}]);
