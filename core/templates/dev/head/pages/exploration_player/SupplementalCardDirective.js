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
 * @fileoverview Controller for the supplemental card.
 */

oppia.directive('supplementalCard', [
  'UrlInterpolationService', function(UrlInterpolationService) {
    return {
      restrict: 'E',
      scope: {
        onClickContinueButton: '&',
        isLearnAgainButton: '&',
        onSubmitAnswer: '&'
      },
      templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
        '/pages/exploration_player/supplemental_card_directive.html'),
      controller: [
        '$scope', '$timeout', '$window',
        'PlayerPositionService', 'PlayerTranscriptService',
        'WindowDimensionsService', 'CONTENT_FOCUS_LABEL_PREFIX',
        'TWO_CARD_THRESHOLD_PX', 'EVENT_ACTIVE_CARD_CHANGED',
        'CONTINUE_BUTTON_FOCUS_LABEL', 'AudioTranslationManagerService',
        'AudioPlayerService', 'AutogeneratedAudioPlayerService',
        'COMPONENT_NAME_FEEDBACK', 'AUDIO_HIGHLIGHT_CSS_CLASS',
        function(
            $scope, $timeout, $window,
            PlayerPositionService, PlayerTranscriptService,
            WindowDimensionsService, CONTENT_FOCUS_LABEL_PREFIX,
            TWO_CARD_THRESHOLD_PX, EVENT_ACTIVE_CARD_CHANGED,
            CONTINUE_BUTTON_FOCUS_LABEL, AudioTranslationManagerService,
            AudioPlayerService, AutogeneratedAudioPlayerService,
            COMPONENT_NAME_FEEDBACK, AUDIO_HIGHLIGHT_CSS_CLASS) {
          var updateActiveCard = function() {
            var index = PlayerPositionService.getActiveCardIndex();
            if (index === null) {
              return;
            }
            $scope.activeCard = PlayerTranscriptService.getCard(index);
            $scope.clearHelpCard();
            $scope.lastAnswer =
              PlayerTranscriptService.getLastAnswerOnActiveCard(index);
          };

          $scope.OPPIA_AVATAR_IMAGE_URL = (
            UrlInterpolationService.getStaticImageUrl(
              '/avatar/oppia_avatar_100px.svg'));

          $scope.CONTINUE_BUTTON_FOCUS_LABEL = CONTINUE_BUTTON_FOCUS_LABEL;

          $scope.helpCardHtml = null;
          $scope.helpCardHasContinueButton = false;

          $scope.windowDimensionsService = WindowDimensionsService;

          // We use the max because the height property of the help card is
          // unstable while animating, causing infinite digest errors.
          var maxHelpCardHeightSeen = 0;
          $scope.clearHelpCard = function() {
            $scope.helpCardHtml = null;
            $scope.helpCardHasContinueButton = false;
            maxHelpCardHeightSeen = 0;
          };

          $scope.isHelpCardTall = function() {
            var helpCard = $('.conversation-skin-help-card');
            if (helpCard.height() > maxHelpCardHeightSeen) {
              maxHelpCardHeightSeen = helpCard.height();
            }
            return maxHelpCardHeightSeen > $(window).height() - 100;
          };

          $scope.getHelpCardBottomPosition = function() {
            var helpCard = $('.conversation-skin-help-card');
            var container = $('.conversation-skin-supplemental-card-container');
            return Math.max(container.height() - helpCard.height() / 2, 0);
          };

          $scope.submitAnswer = function(answer, interactionRulesService) {
            // Do not clear the help card or submit an answer if there is an
            // upcoming card.
            if ($scope.activeCard.getDestStateName()) {
              return;
            }

            $scope.clearHelpCard();
            $scope.onSubmitAnswer({
              answer: answer,
              rulesService: interactionRulesService
            });
          };

          $scope.$on(EVENT_ACTIVE_CARD_CHANGED, function() {
            updateActiveCard();
          });

          $scope.$on('helpCardAvailable', function(event, helpCard) {
            $scope.helpCardHtml = helpCard.helpCardHtml;
            $scope.helpCardHasContinueButton = helpCard.hasContinueButton;
          });

          $scope.getFeedbackAudioHighlightClass = function() {
            if (AudioTranslationManagerService
              .getCurrentComponentName() ===
              COMPONENT_NAME_FEEDBACK &&
              (AudioPlayerService.isPlaying() ||
              AutogeneratedAudioPlayerService.isPlaying())) {
              return AUDIO_HIGHLIGHT_CSS_CLASS;
            }
          };

          updateActiveCard();
        }
      ]
    };
  }
]);
