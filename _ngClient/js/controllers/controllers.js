var appControllers = angular.module('appControllers', []);
 

  appControllers.controller('PlaceboCtrl', ['$rootScope','$scope'  ,
        function($rootScope,$scope) {
      // a global controller in case needed
          console.log("PlaceboCtrl"); 

      		$rootScope.recaptchaCodeAvailable = false;			
 
 		}]); // PlaceboCtrl
 
appControllers.controller('HomeCtrl', ['$scope' ,
		function($scope) {
			
			$scope.name= "Home";
	 
		}]); // HomeCtrl
	
 
	
appControllers.controller('AboutCtrl', ['$scope', 
  function($scope) {
  
  }]); // AboutCtrl		


appControllers.controller('BasketCtrl', ['$scope', '$resource', '$http',  '$q', 'nrzLightify',
  function($scope, $resource,  $http, $q, nrzLightify) {
      		$scope.filterData = {};

      
      		$scope.requeryBasket = function(filters)
		{	 
			displayBasket(filters);
		}

		$scope.reset = function()
		{
			$scope.filterData = {};
			displayBasket({});
		}
      
      $scope.loadBasket = function() // load many
		{ // add test data
		    $scope.asynchWait = true;
			$http.post('/api/v1/loadbasket', {}).then(function success (response) {  	
			                    // var result = {'errorFlag' : errorFlag , 'insertCount' : insertCount};
								displayBasket({});
								$scope.asynchWait = false;
								nrzLightify({ type: 'success', text: 'basket loaded'  }, 3000);
							}, function errorCallback(error) {
								$scope.asynchWait = false;
                               nrzLightify({ type: 'danger', text: 'basket load error'  }, 3000);						 						 
						}); 
          
		}
      
        function getBasket()
		{
			
         return $http.post('/api/v1/basket', $scope.filterData); 			
		}
      
      function displayBasket(filters)
		{ 		
			aPromise = getBasket(filters);
			
			aPromise.then(function(response) 
						  {
							$scope.basket = response.data;
						  },
						  function error(error)
						  {
							  $scope.basket = [];					  
						  });
		}
      
      
      displayBasket({}); // load the basket at the start
		nrzLightify({ type: 'success', text: 'Basket loaded'  }, 6000);	
    
 		

  }]); // BasketCtrl	
	
	
appControllers.controller('MenuCtrl', [  '$scope', '$resource', '$http',  '$q', 'nrzLightify',
    function( $scope, $resource,  $http, $q, nrzLightify) {
		
		var correctIndex; // ng-repeat orderBy order different to the underlying source array
		var editMode;		
		
		$scope.edittingFood = false;		
		$scope.asynchWait = false;
		$scope.filterData = {};
		$scope.newFoodRaw = {"json" : ""};
        $scope.newBasketItemRaw = {json: ""};
		$scope.editId = null;
				 
		$scope.requeryMenu = function(filters)
		{	 
			displayMenu(filters);
		}

		$scope.reset = function()
		{
			$scope.filterData = {};
			displayMenu({});
		}
        
        
        $scope.add2Basket = function(index,id,food)
		{
            $scope.date = new Date();
            food._id = $scope.date;
            console.log(food);
                $http.put('/api/v1/basketitem', food).then(function success (response) {  									
								$scope.newBasketItemRaw = {"json" : ""};										
								nrzLightify({ type: 'success', text: 'item inserted to basket'  }, 3000);	
							}, function errorCallback(error) {
                               nrzLightify({ type: 'danger', text: 'basket item insertion error'  }, 3000);							 						 
						}); 		
		}
	
        
        
        $scope.deleteFood = function(index,id, food)
		{
			correctIndex =   $scope.menu.indexOf(food);
			$http.delete('/api/v1/food/'+ id).then(function success (response) {  	
			                    $scope.menu.splice(correctIndex, 1);
								nrzLightify({ type: 'success', text: 'food deleted'  }, 3000);	
							}, function errorCallback(error) {
                               	nrzLightify({ type: 'danger', text: 'food deletion error'  }, 3000);				 						 
						}); 				
		}
        
        
        
	
		$scope.insertFood2 = function() // v2
		{
			$http.put('/api/v1/food', $scope.newFoodRaw.json).then(function success (response) {  									
								$scope.newFoodRaw = {"json" : ""};										
								nrzLightify({ type: 'success', text: 'food inserted'  }, 3000);	
							}, function errorCallback(error) {
                               	nrzLightify({ type: 'danger', text: 'food insertion error'  }, 3000);						 						 
						}); 		
		}	

		$scope.insertFood = function(newFood) // v1
		{
			$http.put('/api/v1/food', newFood).then(function success (response) {  									
								$scope.newFoodRaw = {"json" : ""};										
								nrzLightify({ type: 'success', text: 'food inserted'  }, 3000);	
							}, function errorCallback(error) {
                               nrzLightify({ type: 'danger', text: 'food insertion error'  }, 3000);							 						 
						}); 		
		}
		
		
		$scope.loadMenu = function() // load many
		{ // add test data
		    $scope.asynchWait = true;
			$http.post('/api/v1/loadmenu', {}).then(function success (response) {  	
			                    // var result = {'errorFlag' : errorFlag , 'insertCount' : insertCount};
								displayMenu({});
								$scope.asynchWait = false;
								nrzLightify({ type: 'success', text: 'menu loaded'  }, 3000);
							}, function errorCallback(error) {
								$scope.asynchWait = false;
                               nrzLightify({ type: 'danger', text: 'food load error'  }, 3000);						 						 
						}); 			 
		}	

		$scope.deleteMenu = function() // load many
		{ // add test data
		    $scope.asynchWait = true;		
			$http.delete('/api/v1/deletemenu', {}).then(function success (response) {  	
			                    // var result = {'errorFlag' : errorFlag , 'insertCount' : insertCount};
								displayMenu({});
								$scope.asynchWait = false;
								nrzLightify({ type: 'success', text: 'menu deleted'  }, 3000);
							}, function errorCallback(error) {
								$scope.asynchWait = false;
                               nrzLightify({ type: 'danger', text: 'menu deletion error'  }, 3000);						 						 
						}); 			 
		}	 
		
		function getMenu()
		{
			/*
			// you would use this style if chaining i.e. return deferred and resolve/reject as late as possible
			var deferred = $q.defer();
			return $http.get('/api/v1/menu', { })  // returns a promise 
						.then(function success (response) {  					
								deferred.resolve(response.data);
							}, function errorCallback(error) {
 
								deferred.reject(error);								 
						});	
			return deferred.promise;	
			*/
     
         return $http.post('/api/v1/menu', $scope.filterData); 			
		}	
    
      
		var aPromise;
		
		
		function displayMenu(filters)
		{ 		
			aPromise = getMenu(filters);
			
			aPromise.then(function(response) 
						  {
							$scope.menu = response.data;
						  },
						  function error(error)
						  {
							  $scope.menu = [];					  
						  });
		}
        
        
			
		$scope.getTemplate = function (food) {
			//if (contact.id === $scope.model.selected.id) return 'edit';
			//else return 'display';
			return 'displayfood';
		};		
		
		$scope.cancelFoodEdit = function()
		{
			$scope.edittingFood = false;
		}
 		
		$scope.editFood = function(index,id,food)
		{
			$scope.editTitle = "Edit Food";
			editMode = "existing";
			$scope.edittingFood = true;
			correctIndex =   $scope.menu.indexOf(food);
			$scope.editData = angular.copy($scope.menu[correctIndex]);
			$scope.editData.index = index + 1;
			$scope.editData._id = id;
		}	

		$scope.saveFood = function()
		{
			$scope.edittingFood = false;
			
			if (editMode === "existing")
			{
			var dataToSave = angular.copy($scope.editData);
			delete dataToSave.index;
			$http.post('/api/v1/food', dataToSave).then(function success (response) {  	
			                    $scope.menu[correctIndex] = $scope.editData;
								$scope.asynchWait = false;
								nrzLightify({ type: 'success', text: 'food saved'  }, 3000);
							}, function errorCallback(error) {
								$scope.asynchWait = false;
                               nrzLightify({ type: 'danger', text: 'food save error'  }, 3000);					 						 
						}); 
            }		
            else
			{
				delete $scope.editData.index;
				$scope.insertFood($scope.editData); // put operation
			}				
		}		
		
		$scope.newFood = function()
		{
			$scope.editTitle = "New Food";
			editMode = "new";
			$scope.edittingFood = true;
			correctIndex =   -1;
			$scope.editData = {};
			$scope.editData.index = -1;
			$scope.editData._id = null;			
		}
		
		displayMenu({}); // load the menu at the start
		nrzLightify({ type: 'success', text: 'Menu loaded'  }, 6000);	
 
		}]); // MenuCtrl
 