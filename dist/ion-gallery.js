(function () {
  'use strict';

  angular
    .module('ion-gallery', [])
    .directive('ionGallery', ionGallery);

  ionGallery.$inject = ['$ionicPlatform', 'ionGalleryHelper', 'ionGalleryConfig'];

  function ionGallery($ionicPlatform, ionGalleryHelper, ionGalleryConfig) {
    controller.$inject = ["$scope"];
    return {
      restrict: 'AE',
      scope: {
        ionGalleryItems: '=ionGalleryItems',
        ionGalleryRowSize: '=?ionGalleryRow',
        ionItemCallback: '&?ionItemCallback'
      },
      controller: controller,
      link: link,
      replace: true,
      templateUrl: 'gallery.html'
    };

    function controller($scope) {
      var _rowSize = parseInt($scope.ionGalleryRowSize);

      var _drawGallery = function () {
        $scope.ionGalleryRowSize = ionGalleryHelper.getRowSize(_rowSize || ionGalleryConfig.row_size, $scope.ionGalleryItems.length);
        $scope.actionLabel = ionGalleryConfig.action_label;
        $scope.items = ionGalleryHelper.buildGallery($scope.ionGalleryItems, $scope.ionGalleryRowSize);
        $scope.responsiveGrid = parseInt((1 / $scope.ionGalleryRowSize) * 100);
      };

      _drawGallery();

      (function () {
        $scope.$watch(function () {
          return $scope.ionGalleryItems.length;
        }, function (newVal, oldVal) {
          if (newVal !== oldVal) {
            _drawGallery();
          }
        });
      }());

    }

    function link(scope, element, attrs) {

      scope.customCallback = angular.isFunction(scope.ionItemCallback) && attrs.hasOwnProperty('ionItemCallback')

      scope.ionSliderToggle = attrs.ionGalleryToggle === 'false' ? false : ionGalleryConfig.toggle;
    }
  }
})();

(function(){
  'use strict';

  angular
    .module('ion-gallery')
    .provider('ionGalleryConfig',ionGalleryConfig);

  ionGalleryConfig.$inject = [];

  function ionGalleryConfig(){
    this.config = {
      action_label: 'Done',
      toggle: true,
      row_size: 3,
      fixed_row_size: true
    };

    this.$get = function() {
        return this.config;
    };

    this.setGalleryConfig = function(config) {
        angular.extend(this.config, this.config, config);
    };
  }

})();
(function(){
  'use strict';

  angular
    .module('ion-gallery')
    .service('ionGalleryHelper',ionGalleryHelper);

  ionGalleryHelper.$inject = ['ionGalleryConfig'];

  function ionGalleryHelper(ionGalleryConfig) {

    this.getRowSize = function(size,length){
      var rowSize;

      if(isNaN(size) === true || size <= 0){
        rowSize = ionGalleryConfig.row_size;
      }
      else if(size > length && !ionGalleryConfig.fixed_row_size){
        rowSize = length;
      }
      else{
        rowSize = size;
      }

      return rowSize;

    };

    this.buildGallery = function(items,rowSize){
      var _gallery = [];
      var row = -1;
      var col = 0;

      for(var i=0;i<items.length;i++){

        if(i % rowSize === 0){
          row++;
          _gallery[row] = [];
          col = 0;
        }

        if(!items[i].hasOwnProperty('sub')){
          items[i].sub = '';
        }

        if(!items[i].hasOwnProperty('thumb')){
          items[i].thumb = items[i].src;
        }

        items[i].position = i;

        _gallery[row][col] = items[i];
        col++;
      }

      return _gallery;
    };
  }
})();
(function(){
  'use strict';

  angular
    .module('ion-gallery')
    .directive('ionRowHeight',ionRowHeight);

  ionRowHeight.$inject = ['ionGalleryConfig'];

  function ionRowHeight(ionGalleryConfig){

    return {
      restrict: 'A',
      link : link
    };

    function link(scope, element, attrs) {
      scope.$watch(
        function(){
          return scope.ionGalleryRowSize;
        },
        function(newValue,oldValue){
          if(newValue > 0){
            element.css('height',element[0].offsetWidth * parseInt(scope.responsiveGrid)/100 + 'px');
          }
        });
    }
  }
})();
(function(){
  'use strict';

  angular
    .module('ion-gallery')
    .directive('ionSlideAction',ionSlideAction);

  ionSlideAction.$inject = ['$ionicGesture','$timeout'];

  function ionSlideAction($ionicGesture, $timeout){

    return {
      restrict: 'A',
      link : link
    };

    function link(scope, element, attrs) {

      var isDoubleTapAction = false;

      var pinchZoom = function pinchZoom(){
          scope.$emit('ZoomStarted');
      };

      var imageDoubleTapGesture = function imageDoubleTapGesture(event) {

        isDoubleTapAction = true;

        $timeout(function(){
          isDoubleTapAction = false;
          scope.$emit('DoubleTapEvent',{ 'x': event.gesture.touches[0].pageX, 'y': event.gesture.touches[0].pageY});
        },200);
      };

      var imageTapGesture = function imageTapGesture(event) {

        if(isDoubleTapAction === true){
          return;
        }
        else{
          $timeout(function(){
            if(isDoubleTapAction === true){
              return;
            }
            else{
              scope.$emit('TapEvent');
            }
          },200);
        }
      };

      var swipeDragLeft = function swipeDragLeft(event) {
          scope.$emit('SwipeDragLeftEvent');
      }

      var swipeDragRight = function swipeDragRight(event) {
          scope.$emit('SwipeDragRightEvent');
      }

      var pinchEvent = $ionicGesture.on('pinch',pinchZoom,element);
      var doubleTapEvent = $ionicGesture.on('doubletap', function(e){imageDoubleTapGesture(e);}, element);
      var tapEvent = $ionicGesture.on('tap', imageTapGesture, element);
      // var swipeLeftEvent = $ionicGesture.on('swipeleft', swipeDragLeft, element);
      // var swipeRightEvent = $ionicGesture.on('swiperight', swipeDragRight, element);
      var dragLeftEvent = $ionicGesture.on('dragleft', swipeDragLeft, element);
      var dragRightEvent = $ionicGesture.on('dragright', swipeDragRight, element);

      scope.$on('$destroy', function() {
        $ionicGesture.off(doubleTapEvent, 'doubletap', imageDoubleTapGesture);
        $ionicGesture.off(tapEvent, 'tap', imageTapGesture);
        $ionicGesture.off(pinchEvent, 'pinch', pinchZoom);
        // $ionicGesture.off(swipeLeftEvent, 'swipeleft', swipeDragLeft);
        // $ionicGesture.off(swipeRightEvent, 'swiperight', swipeDragRight);
        $ionicGesture.off(dragLeftEvent, 'dragleft', swipeDragLeft);
        $ionicGesture.off(dragRightEvent, 'dragright', swipeDragRight);
      });
    }
  }
})();
(function(){
  'use strict';

  angular
    .module('ion-gallery')
    .directive('ionSlider',ionSlider);

  ionSlider.$inject = ['$ionicModal','ionGalleryHelper','$ionicPlatform','$timeout','$ionicScrollDelegate',
                       '$ionicSlideBoxDelegate'];

  function ionSlider($ionicModal,ionGalleryHelper,$ionicPlatform,$timeout,$ionicScrollDelegate,$ionicSlideBoxDelegate){

    controller.$inject = ["$scope"];
    return {
      restrict: 'A',
      controller: controller,
      link : link
    };

    function controller($scope){
      var zoomStart = false;

      $scope.slideChanged = function(index) {
        $scope.selectedSlide = index;
        $ionicScrollDelegate.$getByHandle('slide-' + $scope.previousSlide).zoomTo(1, true);
      };

      $scope.showImage = function(index) {
        $scope.slides = [];

        $scope.slides = $scope.ionGalleryItems;
        $scope.selectedSlide = index;

        $scope.loadModal();
      };

      $scope.$on('ZoomStarted', function(e){
        $timeout(function () {
          zoomStart = true;
        });
      });

      $scope.$on('TapEvent', function(e){
        $timeout(function () {
          _onTap();
        });
      });

      $scope.$on('DoubleTapEvent', function(event,position){
        $timeout(function () {
          _onDoubleTap(position);
        });
      });

      $scope.$on('SwipeDragLeftEvent', function(event){
        $timeout(function () {
          _onSwipeDragLeftEvent(event);
        });
      });

      $scope.$on('SwipeDragRightEvent', function(event){
        $timeout(function () {
          _onSwipeDragRightEvent(event);
        });
      });


      var _onTap = function _onTap(){
        $scope.closeModal();
      };

      var _onDoubleTap = function _onDoubleTap(position){
        if(zoomStart === false){
          $ionicScrollDelegate.$getByHandle('slide-' + $scope.selectedSlide).zoomTo(3, true, position.x, position.y);
          zoomStart = true;
        }
        else{
          $ionicScrollDelegate.$getByHandle('slide-' + $scope.selectedSlide).zoomTo(1, true);

          $timeout(function () {
            _isOriginalSize();
          },300);
        }
      };

      var _onSwipeDragLeftEvent = function _onSwipeDragLeftEvent(event) {
        var scrollLeft = $ionicScrollDelegate.$getByHandle('slide-' + $scope.selectedSlide).getScrollPosition().left,
            scrollView = $ionicScrollDelegate.$getByHandle('slide-' + $scope.selectedSlide).getScrollView();
        $scope.previousSlide = $scope.selectedSlide;

        if (scrollLeft === scrollView.__maxScrollLeft) {
            $timeout(function() {
              $ionicSlideBoxDelegate.enableSlide(true);
            });
        } else {
           $timeout(function() {
              $ionicSlideBoxDelegate.enableSlide(false);
            });
        }
      };

      var _onSwipeDragRightEvent = function _onSwipeDragRightEvent(event) {
        var scrollLeft = $ionicScrollDelegate.$getByHandle('slide-' + $scope.selectedSlide).getScrollPosition().left;
        $scope.previousSlide = $scope.selectedSlide;

        if (scrollLeft === 0) {
            $timeout(function() {
              $ionicSlideBoxDelegate.enableSlide(true);
            });
        } else {
            $timeout(function() {
              $ionicSlideBoxDelegate.enableSlide(false);
            });
        }
      };

      function _isOriginalSize(){
        zoomStart = false;
      }
    }

    function link(scope, element, attrs) {
      var _modal;

      scope.loadModal = function(){
        $ionicModal.fromTemplateUrl('slider.html', {
          scope: scope,
          animation: 'fade-in'
        }).then(function(modal) {
          _modal = modal;
          scope.openModal();
        });
      };

      scope.openModal = function() {
        _modal.show();
      };

      scope.closeModal = function() {
        _modal.hide();
      };

      scope.$on('$destroy', function() {
        try{
          _modal.remove();
        } catch(err) {
          console.log(err.message);
        }
      });
    }
  }
})();
