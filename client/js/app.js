var app = angular.module('app', ['chart.js']);
var url = "http://localhost:3008/api"
app.controller('AppCtrl', function($scope, $http) {
    $scope.menu = 'margin';
});

app.controller('MarginCtrl', function($scope, $http) {
    $scope.totalMargin = 0;
    $scope.totalOmzet = 0;
    var loadData = function (){
        $http.get(url + "/margin").then(function (res){
            $scope.totalMargin = res.data.margin;
            $scope.totalOmzet = res.data.omzet;
        }, function (err){
            console.log(err);
        });
    };
    loadData();
});

app.controller('TopProductCtrl', function($scope, $http, $filter) {
    $scope.types = [{id: 1, name: 'Top Selling'}, {id: 2, name: 'Top Margin'}];
    $scope.form = {
        top: 5,
        type: $scope.types[0]
    };

    var loadData = function (){
        var a = angular.copy($scope.form);
        var q = "";
        var title = "";
        if (a.startDate === undefined || a.startDate === null || a.endDate === undefined || a.endDate === null){
            q = "top=" + a.top;
            title = "(All Time)";
        }else{
            var b = $filter('date')(a.startDate, 'yyyy-MM-dd');
            var c = $filter('date')(a.endDate, 'yyyy-MM-dd');
            var b1 = $filter('date')(a.startDate, 'dd MMM yyyy');
            var c1 = $filter('date')(a.endDate, 'dd MMM yyyy');
            q = "top=" + a.top + "&startDate=" + b + "&endDate=" + c;
            title = "(" + b1 + " - " + c1 + ")";
        }
        $scope.labels = [];
        $scope.series = ['Series A'];
        $scope.data = [];
        $scope.dataTable = [];
        var dataSeries = [];
        var ax = $scope.form.type.id === 1 ? '/topsell?' : '/topmargin?';
        $http.get(url + ax + q).then(function (result){
            console.log(result);
            var data = result.data;
            $scope.dataTable = data;
            if (data.length === 0)
                alert("Data tidak ada..");
            else
                $scope.formType = $scope.form.type.name + " " + title;
            for (var i = 0; i<data.length; i++){
                var o = data[i];
                $scope.labels.push(o.product);
                dataSeries.push(o.value);
            }
            $scope.data.push(dataSeries);
        }, function (a){
            console.log(a);
        });
    };
    loadData();

    $scope.search = function (){
        loadData();
    }

});
