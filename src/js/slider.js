(function(){
  'use strict';

  angular
    .module('ion-gallery')
    .directive('ionSlider',ionSlider);

  ionSlider.$inject = ['$ionicModal'];

  function ionSlider($ionicModal){
    
    return {
      restrict: 'A',
      controller: controller,
      link : link
    };
    
    function controller($scope){
      var lastSlideIndex,
          currentImage,
          galleryLength = $scope.ionGalleryItems.length;
          

      $scope.selectedSlide = 1;

      $scope.showImage = function(row,col) {
        $scope.slides = [];
        
        currentImage = row*3 + col;
        
        var index = currentImage;
        var previndex = index - 1;
        var nextindex = index + 1;

        if( previndex < 0 ){
          previndex = galleryLength - 1;
        }

        if( nextindex >= galleryLength ){
          nextindex = 0;
        }

        $scope.slides[0] = {
          'thumbnail': $scope.ionGalleryItems[previndex].src,
        };
        $scope.slides[1] = {
          'thumbnail': $scope.ionGalleryItems[index].src,
        };
        $scope.slides[2] = {
          'thumbnail': $scope.ionGalleryItems[nextindex].src,
        };
        
        console.log( 'loadSingles: ' + previndex + ' ' + index + ' ' + nextindex);

        lastSlideIndex = 1;
        $scope.loadModal();
      };

      $scope.slideChanged = function(currentSlideIndex) {

        var slideToLoad,
            imageToLoad;
        
        switch( lastSlideIndex + '>' + currentSlideIndex ) {
          case '0>1':
            {
              slideToLoad = 2;
              currentImage++;
              imageToLoad = currentImage + 1;
              break;
            }
          case '1>2':
            {
              slideToLoad = 0;
              currentImage++;
              imageToLoad = currentImage + 1;
              break;
            }
          case '2>0':
            {
              slideToLoad = 1;
              currentImage++;
              imageToLoad = currentImage + 1;
              break;
            }
          case '0>2':
            {
              slideToLoad = 1;
              currentImage--;
              imageToLoad = currentImage - 1;
              break;
            }
          case '1>0':
            {
              slideToLoad = 2;
              currentImage--;
              imageToLoad = currentImage - 1;
              break;
            }
          case '2>1':
            {
              slideToLoad = 0;
              currentImage--;
              imageToLoad = currentImage - 1;   
              break;
            }
        }

        if( currentImage < 0 ){
          currentImage = galleryLength - 1;
        }

        if( currentImage > galleryLength ){
          currentImage = 0;
        }

        if( imageToLoad < 0 ){
          imageToLoad = galleryLength + imageToLoad;
        }

        if( imageToLoad >= galleryLength ){
          imageToLoad = imageToLoad - galleryLength;
        }

        $scope.slides[slideToLoad] = {
          'thumbnail': $scope.ionGalleryItems[imageToLoad].src
        };
      };
    }

    function link(scope, element, attrs) {
      var rename;

      scope.loadModal = function(){
        $ionicModal.fromTemplateUrl('templates/slider.html', {
          scope: scope,
          animation: 'fade-in'
        }).then(function(modal) {
          rename = modal;
          scope.openModal();
        });
      };

      scope.openModal = function() {
        rename.show();
      };

      scope.closeModal = function() {
        rename.hide();
      };

      scope.$on('$destroy', function() {
        rename.remove();
      });
    }
  }
})();