import 'jasmine';
import * as actionCreator from '../src/actionCreator';
import * as dispatcher from '../src/dispatcher';
import * as globalContext from '../src/globalContext';

describe('dispatcher', () => {
    let mockGlobalContext: any;

    beforeEach(() => {
        mockGlobalContext = {
            subscriptions: {},
            dispatchWithMiddleware: jasmine.createSpy('dispatchWithMiddleware'),
        };

        spyOn(globalContext, 'getGlobalContext').and.returnValue(mockGlobalContext);
    });

    it('subscribe registers a callback for a given action', () => {
        // Arrange
        let actionId = 'testActionId';
        let callback = () => {};

        // Act
        dispatcher.subscribe(actionId, callback);

        // Assert
        expect(mockGlobalContext.subscriptions[actionId]).toBeDefined();
        expect(mockGlobalContext.subscriptions[actionId].length).toBe(1);
        expect(mockGlobalContext.subscriptions[actionId][0]).toBe(callback);
    });

    it('subscribe can register multiple callbacks', () => {
        // Arrange
        let actionId = 'testActionId';
        let callback0 = () => {};
        let callback1 = () => {};

        // Act
        dispatcher.subscribe(actionId, callback0);
        dispatcher.subscribe(actionId, callback1);

        // Assert
        expect(mockGlobalContext.subscriptions[actionId]).toEqual([callback0, callback1]);
    });

    it('dispatch calls dispatchWithMiddleware', () => {
        // Arrange
        let actionMessage = {};

        // Act
        dispatcher.dispatch(actionMessage);

        // Assert
        expect(mockGlobalContext.dispatchWithMiddleware).toHaveBeenCalledWith(actionMessage);
    });

    it('dispatch calls finalDispatch if dispatchWithMiddleware is null', () => {
        // Arrange
        mockGlobalContext.dispatchWithMiddleware = null;
        let actionId = 'testActionId';
        spyOn(actionCreator, 'getPrivateActionId').and.returnValue(actionId);

        let callback = jasmine.createSpy('callback0');
        mockGlobalContext.subscriptions[actionId] = [callback];

        // Act
        dispatcher.dispatch({});

        // Assert
        expect(callback).toHaveBeenCalled();
    });

    it('finalDispatch calls all subscribers for a given action', () => {
        // Arrange
        let actionMessage = {};
        let actionId = 'testActionId';
        spyOn(actionCreator, 'getPrivateActionId').and.returnValue(actionId);

        let callback0 = jasmine.createSpy('callback0');
        let callback1 = jasmine.createSpy('callback1');
        mockGlobalContext.subscriptions[actionId] = [callback0, callback1];

        // Act
        dispatcher.finalDispatch(actionMessage);

        // Assert
        expect(callback0).toHaveBeenCalledWith(actionMessage);
        expect(callback1).toHaveBeenCalledWith(actionMessage);
    });

    it('finalDispatch handles the case where there are no subscribers', () => {
        // Arrange
        spyOn(actionCreator, 'getPrivateActionId').and.returnValue('testActionId');

        // Act / Assert
        expect(() => {
            dispatcher.finalDispatch({});
        }).not.toThrow();
    });
});
