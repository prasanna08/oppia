// Copyright 2016 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Directive for the miscellaneous tab in the admin panel.
 */

oppia.directive('adminMiscTab', [
  '$http', '$window', 'AdminTaskManagerService', 'ADMIN_HANDLER_URL',
  'ADMIN_TOPICS_CSV_DOWNLOAD_HANDLER_URL', 'UrlInterpolationService',
  function(
      $http, $window, AdminTaskManagerService, ADMIN_HANDLER_URL,
      ADMIN_TOPICS_CSV_DOWNLOAD_HANDLER_URL, UrlInterpolationService) {
    return {
      restrict: 'E',
      scope: {
        setStatusMessage: '='
      },
      templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
        '/pages/admin/misc_tab/' +
        'admin_misc_tab_directive.html'),
      controller: ['$scope', function($scope) {
        var DATA_EXTRACTION_QUERY_HANDLER_URL = (
          '/explorationdataextractionhandler');

        $scope.clearSearchIndex = function() {
          if (AdminTaskManagerService.isTaskRunning()) {
            return;
          }
          if (!confirm('This action is irreversible. Are you sure?')) {
            return;
          }

          $scope.setStatusMessage('Clearing search index...');

          AdminTaskManagerService.startTask();
          $http.post(ADMIN_HANDLER_URL, {
            action: 'clear_search_index'
          }).then(function() {
            $scope.setStatusMessage('Index successfully cleared.');
            AdminTaskManagerService.finishTask();
          }, function(errorResponse) {
            $scope.setStatusMessage(
              'Server error: ' + errorResponse.data.error);
            AdminTaskManagerService.finishTask();
          });
        };

        $scope.uploadTopicSimilaritiesFile = function() {
          var file = document.getElementById('topicSimilaritiesFile').files[0];
          var reader = new FileReader();
          reader.onload = function(e) {
            var data = e.target.result;
            $http.post(ADMIN_HANDLER_URL, {
              action: 'upload_topic_similarities',
              data: data
            }).then(function() {
              $scope.setStatusMessage(
                'Topic similarities uploaded successfully.');
            }, function(errorResponse) {
              $scope.setStatusMessage(
                'Server error: ' + errorResponse.data.error);
            });
          };
          reader.readAsText(file);
        };

        $scope.downloadTopicSimilaritiesFile = function() {
          $window.location.href = ADMIN_TOPICS_CSV_DOWNLOAD_HANDLER_URL;
        };

        var setDataExtractionQueryStatusMessage = function(message) {
          $scope.showDataExtractionQueryStatus = true;
          $scope.dataExtractionQueryStatusMessage = message;
        };

        $scope.submitQuery = function() {
          var STATUS_PENDING = (
            'Data extraction query has been submitted. Please wait.');
          var STATUS_FINISHED = 'Loading the extracted data ...';
          var STATUS_FAILED = 'Error, ';

          var data = {
            exp_id: $scope.exp_id,
            exp_version: $scope.exp_version,
            state_name: $scope.state_name,
            num_answers: $scope.num_answers
          };

          setDataExtractionQueryStatusMessage(STATUS_PENDING);

          $http.post(DATA_EXTRACTION_QUERY_HANDLER_URL, data).then(
            function(response) {
              var data = response.data;
              if (response.data.success) {
                setDataExtractionQueryStatusMessage(STATUS_FINISHED);
                var extractedAnswers = JSON.stringify(data.extracted_data);
                var dataURL = (
                  'data:application/json;base64,' + btoa(extractedAnswers));
                var downloadURL = (
                  '<a href="' + dataURL +
                  '" download="data.json"> download </a>');
                $window.location.href = (
                  'data:text/html;base64,' + btoa(downloadURL));
                return;
              }
              setDataExtractionQueryStatusMessage(STATUS_FAILED + data.message);
            }, function(response) {
            setDataExtractionQueryStatusMessage(
              STATUS_FAILED + response.data.error);
          });
        };

        $scope.resetForm = function() {
          $scope.exp_id = null;
          $scope.exp_version = 0;
          $scope.state_name = null;
          $scope.num_answers = 0;
        };
      }]
    };
  }
]);
