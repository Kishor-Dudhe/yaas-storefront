/*
 * [y] hybris Platform
 *
 * Copyright (c) 2000-2014 hybris AG
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of hybris
 * ("Confidential Information"). You shall not disclose such Confidential
 * Information and shall use it only in accordance with the terms of the
 * license agreement you entered into with hybris.
 */

describe('SessionSvc', function () {

    var mockedState, $q, $scope, SessionSvc, accountDef, mockedStateParams = {},
    mockedAccountSvc = {
            updateAccount: jasmine.createSpy()
        },
        mockedCartSvc = {},
        mockedGlobalData = {
            getCurrency: function(){
                return 'USD'
            },
            setCurrency: jasmine.createSpy(),

            getLanguageCode: function(){
                return 'en'
            },

            setLanguage: jasmine.createSpy(),

            customerAccount: {}
        };

    mockedState = {
        is: jasmine.createSpy('is').andReturn(true),
        go: jasmine.createSpy('go'),
        transitionTo: jasmine.createSpy(),
        data: {auth: 'authenticated'}
    };

    var homeState = 'homeState';
    var mockedSettings = {
        homeState: homeState
    }

    beforeEach(module('ds.auth', function($provide) {
        $provide.value('AccountSvc', mockedAccountSvc);
        $provide.value('CartSvc', mockedCartSvc);
        $provide.value('GlobalData', mockedGlobalData);
        $provide.value('$state', mockedState);
        $provide.value('$stateParams', mockedStateParams);
        $provide.value('settings', mockedSettings);
    }));

    beforeEach(inject(function(_SessionSvc_,  _$q_, _$rootScope_) {
        SessionSvc = _SessionSvc_;
        $q = _$q_;
        $scope = _$rootScope_.$new();
    }));

    describe('afterLogIn()', function(){

        beforeEach(function(){
            accountDef = $q.defer();
            mockedAccountSvc.account = jasmine.createSpy('account').andCallFake(function(){
                return accountDef.promise;
            });

        });

        it('should get account data', function(){
            SessionSvc.afterLogIn();
            expect(mockedAccountSvc.account).wasCalled();
        });

        it('should update account with current language and currency if from signUp', function(){

            var account = {id: 'abc'};
            SessionSvc.afterLogIn({fromSignUp: true});

            var updatedAccount = {id: 'abc', preferredCurrency: 'USD', preferredLanguage: 'en' };
            accountDef.resolve(account);
            $scope.$apply();
            expect(mockedAccountSvc.updateAccount).wasCalledWith(updatedAccount);
        });

        it('should set language and currency preference if set', function(){
            var lang = 'de';
            var cur = 'EUR';
            var account = {id: 'abc', preferredCurrency: cur, preferredLanguage: lang};
            SessionSvc.afterLogIn();

            accountDef.resolve(account);
            $scope.$apply();
            expect(mockedGlobalData.setLanguage).wasCalledWith(lang);
            expect(mockedGlobalData.setCurrency).wasCalledWith(cur);
        });


        it('should navigate to target state if indicated', function(){
            var account = {id: 'abc'};
            var toState = 'target';
            SessionSvc.afterLogIn({targetState: toState});
            accountDef.resolve(account);
            $scope.$apply();
            expect(mockedState.go).wasCalledWith(toState, {});
        });

        it('should navigate to target state even if account lookup failed', function(){
            var account = {id: 'abc'};
            var toState = 'target';
            SessionSvc.afterLogIn({targetState: toState});
            accountDef.reject(account);
            $scope.$apply();
            expect(mockedState.go).wasCalledWith(toState, {});
        });

        it('should reload current page if no target state', function(){
            var account = {id: 'abc'};

            SessionSvc.afterLogIn();
            accountDef.resolve(account);
            $scope.$apply();
            expect(mockedState.transitionTo).wasCalled();
        });

        it('should retrieve any open cart for the current user', function(){
            // FUTURE functionality
        });

    });

    describe('afterLogOut()', function(){

        it('should set current customer to null', function(){
            SessionSvc.afterLogOut();
            expect(mockedGlobalData.customerAccount).toBeFalsy();
        });

        it('should navigate to home page if current state is protected', function(){
            SessionSvc.afterLogOut();
            expect(mockedState.go).wasCalledWith(homeState);
        });

        it('should reset the cart', function(){
            // FUTURE functionality
        });
    });

});