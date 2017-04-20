var appControllers = angular.module('appControllers', []);




appControllers.controller('AboutCtrl', ['$scope',
  function ($scope) {

  }]); // About

appControllers.controller('HomeCtrl', ['$scope',
		function ($scope) {

        $scope.name = "Home";

		}]); // Home




appControllers.controller('OrdersCtrl', ['$scope', '$resource', '$http', '$q', 'nrzLightify',
  function ($scope, $resource, $http, $q, nrzLightify) {
        $scope.filterData = {};
        $scope.loadOrders = function () // load Orders
            { 
                $scope.asynchWait = true;
                $http.post('/api/v1/loadorders', {}).then(function success(response) {
                    displayOrders({});
                    $scope.asynchWait = false;
                    nrzLightify({
                        type: 'success',
                        text: 'orders loaded'
                    }, 3000);
                }, function errorCallback(error) {
                    $scope.asynchWait = false;
                    nrzLightify({
                        type: 'danger',
                        text: 'order load error'
                    }, 3000);
                });
            }

        function getOrders() {
            return $http.post('/api/v1/orders', $scope.filterData);
        }

        function displayOrders(filters) {
            aPromise = getOrders(filters);
            aPromise.then(function (response) {
                    $scope.orders = response.data;
                },
                function error(error) {
                    $scope.orders = [];
                });
        }





        displayOrders({}); // load the orders at the start

        nrzLightify({
            type: 'success',
            text: 'Orders loaded'
        }, 6000);


		}]); // Orders



appControllers.controller('BasketCtrl', ['$scope', '$resource', '$http', '$q', 'nrzLightify',
  function ($scope, $resource, $http, $q, nrzLightify) {
        $scope.filterData = {};




        $scope.requeryBasket = function (filters) {
            displayBasket(filters);

        }

        $scope.reset = function () {
            $scope.filterData = {};
            displayBasket({});
        }

        $scope.loadBasket = function () // load basket
            { 
                $scope.asynchWait = true;
                $http.post('/api/v1/loadbasket', {}).then(function success(response) {
                    displayBasket({});

                    $scope.asynchWait = false;
                    nrzLightify({
                        type: 'success',
                        text: 'basket loaded'
                    }, 3000);
                }, function errorCallback(error) {
                    $scope.asynchWait = false;
                    nrzLightify({
                        type: 'danger',
                        text: 'basket load error'
                    }, 3000);
                });


            }

        function getBasket() {

            return $http.post('/api/v1/basket', $scope.filterData);

        }

        function displayBasket(filters) {
            aPromise = getBasket(filters);

            aPromise.then(function (response) {
                    $scope.basket = response.data;
                },
                function error(error) {
                    $scope.basket = [];
                });


        }


        $scope.add2Order = function (basket, subtotal, firstname, lastname, address, oemail) {
            var OrderDate = Date.now();
            console.log(basket, subtotal, OrderDate, firstname, lastname, address, oemail);
            $http.put('/api/v1/order', {
                orderinfo: basket,
                subtotal,
                OrderDate,
                firstname,
                lastname,
                address,
                oemail
            }).then(function success(response) {
                $scope.newOrderRaw = {
                    "json": ""
                };
                nrzLightify({
                    type: 'success',
                    text: 'item inserted to order'
                }, 3000);
            }, function errorCallback(error) {
                nrzLightify({
                    type: 'danger',
                    text: 'basket item insertion order'
                }, 3000);
            });
            displayBasket({});
        }






        //Specials


        $scope.loadSpecials = function () // load specials
            { 
                $scope.asynchWait = true;
                $http.post('/api/v1/loadspecials', {}).then(function success(response) {
                    displaySpecials({});
                    $scope.asynchWait = false;
                    nrzLightify({
                        type: 'success',
                        text: 'speicals loaded'
                    }, 3000);
                }, function errorCallback(error) {
                    $scope.asynchWait = false;
                    nrzLightify({
                        type: 'danger',
                        text: 'specials load error'
                    }, 3000);
                });

            }

        function getSpecials() {



            return $http.post('/api/v1/specials', $scope.filterData);


        }

        function displaySpecials(filters) {
            aPromise = getSpecials(filters);

            aPromise.then(function (response) {
                    $scope.specials = response.data;
                },
                function error(error) {
                    $scope.specials = [];
                });


        }


        $scope.loadSpecials = function () // load specials
            { 


                $scope.asynchWait = true;
                $http.post('/api/v1/loadspecials', {}).then(function success(response) {
                    displaySpecials({});
                    $scope.asynchWait = false;

                    nrzLightify({
                        type: 'success',
                        text: 'specials loaded'
                    }, 3000);
                }, function errorCallback(error) {
                    $scope.asynchWait = false;
                    nrzLightify({
                        type: 'danger',
                        text: 'specials load error'
                    }, 3000);
                });
            }
            //Specials     

        $scope.subtotal = function () {
            var total = 0;

            angular.forEach($scope.basket, function (key, value) {
                total += key.price;
            });
            return total;
        }


        $scope.basketcompare = function () {
            var total = "";

            angular.forEach($scope.basket, function (key, value) {
                total += key.name + " " + key.catagory + " ";
            });
            return total;
        }





        $scope.localbasket = function () {
            var total = "";
            angular.forEach($scope.basket, function (key, value) {
                total += key.catagory + " " + key.name + " " + key.price + " " + key._id + " ";
            });
            return total;
            window.localStorage.setItem("basketJS", total);

            console.log(total);
        }









        $scope.deleteBasketItem = function (index, id, food) {
            correctIndex = $scope.basket.indexOf(food);
            $http.delete('/api/v1/basketitem/' + id).then(function success(response) {
                $scope.basket.splice(correctIndex, 1);
                nrzLightify({
                    type: 'success',
                    text: 'basket item deleted'
                }, 3000);
            }, function errorCallback(error) {
                nrzLightify({
                    type: 'danger',
                    text: 'basket  deletion error'
                }, 3000);
            });
        }


        $scope.deleteBasket = function () //delete basket
            { 
                $scope.firstname = "";
                $scope.lastname = "";
                $scope.address = "";
                $scope.oemail = "";

                $scope.asynchWait = true;
                $http.delete('/api/v1/deletebasket', {}).then(function success(response) {
                    displayBasket({});
                    $scope.asynchWait = false;
                    nrzLightify({
                        type: 'success',
                        text: 'basket deleted'
                    }, 3000);
                }, function errorCallback(error) {
                    $scope.asynchWait = false;
                    nrzLightify({
                        type: 'danger',
                        text: 'basket deletion error'
                    }, 3000);
                });
            }


        $scope.add2Basket = function (index, id, food) {
            console.log(food);
            $http.put('/api/v1/basketitem', food).then(function success(response) {
                $scope.newBasketItemRaw = {
                    "json": ""
                };

                nrzLightify({
                    type: 'success',
                    text: 'item inserted to basket'
                }, 3000);
            }, function errorCallback(error) {
                nrzLightify({
                    type: 'danger',
                    text: 'basket item insertion error'
                }, 3000);
            });
            displayBasket({});
        }


        /*
    Show Specials by Day Code 
    
    $scope.day = function() {
    var date = new Date();
var weekday = new Array(7);
weekday[0] =  "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";

var today = weekday[date.getDay()];
        
return today;

  }*/






        displaySpecials({});
        displayBasket({}); // load the basket at the start



        nrzLightify({
            type: 'success',
            text: 'Basket loaded'
        }, 6000);
        nrzLightify({
            type: 'success',
            text: 'Specials loaded'
        }, 6000);




  }]); // Basket	


appControllers.controller('MenuCtrl', ['$scope', '$resource', '$http', '$q', 'nrzLightify',
    function ($scope, $resource, $http, $q, nrzLightify) {

        var correctIndex; 
        var editMode;

        $scope.asynchWait = false;
        $scope.filterData = {};
        $scope.newBasketItemRaw = {
            json: ""
        };
        $scope.editId = null;





        //Specials


        $scope.loadSpecials = function () // load Specials
            { 
                $scope.asynchWait = true;
                $http.post('/api/v1/loadspecials', {}).then(function success(response) {
                    displaySpecials({});
                    $scope.asynchWait = false;
                    nrzLightify({
                        type: 'success',
                        text: 'speicals loaded'
                    }, 3000);
                }, function errorCallback(error) {
                    $scope.asynchWait = false;
                    nrzLightify({
                        type: 'danger',
                        text: 'specials load error'
                    }, 3000);
                });


            }

        function getSpecials() {


            return $http.post('/api/v1/specials', $scope.filterData);


        }

        function displaySpecials(filters) {
            aPromise = getSpecials(filters);

            aPromise.then(function (response) {
                    $scope.specials = response.data;
                },
                function error(error) {
                    $scope.specials = [];
                });


        }


        $scope.loadSpecials = function () // load Specials
            { 


                $scope.asynchWait = true;
                $http.post('/api/v1/loadspecials', {}).then(function success(response) {
                    displaySpecials({});
                    $scope.asynchWait = false;

                    nrzLightify({
                        type: 'success',
                        text: 'specials loaded'
                    }, 3000);
                }, function errorCallback(error) {
                    $scope.asynchWait = false;
                    nrzLightify({
                        type: 'danger',
                        text: 'specials load error'
                    }, 3000);
                });
            }




        $scope.basketcompare = function () {
            var total = "";

            angular.forEach($scope.basket, function (key, value) {
                total += key.name + " " + key.catagory + " ";;
            });
            return total;
        }

      

        //Specials



        $scope.requeryMenu = function (filters) {
            displayMenu(filters);
        }

        $scope.reset = function () {
            $scope.filterData = {};
            displayMenu({});
        }


        $scope.add2Basket = function (index, id, food) {
            console.log(food);
            $http.put('/api/v1/basketitem', food).then(function success(response) {
                $scope.newBasketItemRaw = {
                    "json": ""
                };
                nrzLightify({
                    type: 'success',
                    text: 'item inserted to basket'
                }, 3000);
            }, function errorCallback(error) {
                nrzLightify({
                    type: 'danger',
                    text: 'basket item insertion error'
                }, 3000);
            });
            displayBasket({});
        }




        $scope.loadMenu = function () // load menu
            { 
                $scope.asynchWait = true;
                $http.post('/api/v1/loadmenu', {}).then(function success(response) {
                    displayMenu({});
                    $scope.asynchWait = false;
                    nrzLightify({
                        type: 'success',
                        text: 'menu loaded'
                    }, 3000);
                }, function errorCallback(error) {
                    $scope.asynchWait = false;
                    nrzLightify({
                        type: 'danger',
                        text: 'food load error'
                    }, 3000);
                });
            }

        $scope.deleteMenu = function () // delete menu
            { 
                $scope.asynchWait = true;
                $http.delete('/api/v1/deletemenu', {}).then(function success(response) {
                    displayMenu({});
                    $scope.asynchWait = false;
                    nrzLightify({
                        type: 'success',
                        text: 'menu deleted'
                    }, 3000);
                }, function errorCallback(error) {
                    $scope.asynchWait = false;
                    nrzLightify({
                        type: 'danger',
                        text: 'menu deletion error'
                    }, 3000);
                });
            }

        function getMenu() {
            return $http.post('/api/v1/menu', $scope.filterData);
        }


        var aPromise;


        function displayMenu(filters) {
            aPromise = getMenu(filters);

            aPromise.then(function (response) {
                    $scope.menu = response.data;
                },
                function error(error) {
                    $scope.menu = [];
                });
        }



        $scope.getTemplate = function (food) {
            return 'displayfood';
        };



        $scope.loadBasket = function () // load basket
            { 
                $scope.asynchWait = true;
                $http.post('/api/v1/loadbasket', {}).then(function success(response) {
                    displayBasket({});
                    $scope.asynchWait = false;
                    nrzLightify({
                        type: 'success',
                        text: 'basket loaded'
                    }, 3000);
                }, function errorCallback(error) {
                    $scope.asynchWait = false;
                    nrzLightify({
                        type: 'danger',
                        text: 'basket load error'
                    }, 3000);
                });


            }

        function getBasket() {

            return $http.post('/api/v1/basket', $scope.filterData);


        }


        function displayBasket(filters) {
            aPromise = getBasket(filters);

            aPromise.then(function (response) {
                    $scope.basket = response.data;



                },
                function error(error) {
                    $scope.basket = [];
                });


        }


        $scope.subtotal = function () {
            var total = 0;
            angular.forEach($scope.basket, function (key, value) {
                total += key.price;
            });
            return total;

        }




        displayMenu({}); // load the menu at the start
        displayBasket({}); // load the basket at the start
        displaySpecials({});


        nrzLightify({
            type: 'success',
            text: 'Menu loaded'
        }, 6000);

		}]); // Menu
