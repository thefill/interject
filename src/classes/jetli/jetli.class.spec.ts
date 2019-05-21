// Create injection constructor mock
import {Jetli} from './jetli.class';
import {IInjection} from '../../interfaces/injection';
import Mock = jest.Mock;

// Create injection constructor mock
const injectionMock: IInjection = {
    init: jest.fn()
};

class InjectionConstructorMock {
    constructor() {
        return injectionMock;
    }
}

// Create class constructor mock
const classObject = {a: 1};

// tslint:disable-next-line
class ClassConstructorMock {
    constructor() {
        return classObject;
    }
}

// Create function mock
const functionValue = {b: 1};
// tslint:disable-next-line
const functionMock = function () {
    return functionValue;
};

const primitiveTypes = {
    number: 123,
    string: 'abc',
    array: [1, 2, 3],
    object: {a: 1, b: 2}
};

const constructorTypes = {
    class: ClassConstructorMock,
    injection: InjectionConstructorMock,
    function: functionMock
};

// Stubbed constructors used in later tests when we need to spy execution
const stubbedConstructorTypes = {
    class: jest.fn(),
    injection: jest.fn(),
    function: jest.fn()
};

// What should constructor return
const constructorTypeDerivatives = {
    class: classObject,
    injection: injectionMock,
    function: functionValue
};

const undefinedDependencies = {
    // tslint:disable-next-line
    'null': null,
    // tslint:disable-next-line
    'undefined': undefined
};

const invalidDependencyIdentificators = {
    // tslint:disable-next-line
    'null': null,
    // tslint:disable-next-line
    'undefined': undefined,
    // tslint:disable-next-line
    'number': 123,
    // tslint:disable-next-line
    'array': [],
    // tslint:disable-next-line
    'arrow function': () => {
    }
};

describe('Jetli class', () => {
    let jetli: Jetli;

    beforeEach(() => {
        jetli = new Jetli();
        stubbedConstructorTypes.class.mockReset();
        stubbedConstructorTypes.injection.mockReset();
        stubbedConstructorTypes.function.mockReset();
    });

    describe('should allow to set any type of dependency via set method', () => {
        Object.keys(primitiveTypes).forEach((typeName) => {
            it(typeName, () => {
                const dependency = primitiveTypes[typeName];
                jetli.set(typeName, dependency);
                const retrievedDependency = jetli.get(typeName);

                expect(retrievedDependency).toEqual(dependency);
            });
        });
        Object.keys(constructorTypes).forEach((typeName) => {
            it(typeName, () => {
                const dependency = constructorTypes[typeName];
                jetli.set(typeName, dependency);
                const retrievedDependency = jetli.get(typeName);
                const expectedDerivative = constructorTypeDerivatives[typeName];

                expect(retrievedDependency).not.toEqual(dependency);
                expect(retrievedDependency).toEqual(expectedDerivative);
            });
        });
    });

    describe('should throw error for multiple dependency registrations via set method', () => {
        Object.keys(primitiveTypes).forEach((typeName) => {
            it(typeName, () => {
                const dependency = primitiveTypes[typeName];
                jetli.set(typeName, dependency);

                try {
                    jetli.set(typeName, dependency);
                } catch (error) {
                    expect(error).toBeTruthy();
                }
            });
        });
        Object.keys(constructorTypes).forEach((typeName) => {
            it(typeName, () => {
                const dependency = constructorTypes[typeName];
                jetli.set(typeName, dependency);

                try {
                    jetli.set(typeName, dependency);
                } catch (error) {
                    expect(error).toBeTruthy();
                }
            });
        });
    });

    describe('should not initialise constructor by default via set method', () => {
        Object.keys(stubbedConstructorTypes).forEach((typeName) => {
            it(`for ${typeName}`, () => {
                const dependency: Mock = stubbedConstructorTypes[typeName];
                jetli.set(typeName, dependency);

                expect(dependency).not.toBeCalled();
            });
        });
    });

    describe('should initialise constructor via set method', () => {
        Object.keys(stubbedConstructorTypes).forEach((typeName) => {
            it(`for ${typeName}`, () => {
                const dependency: Mock = stubbedConstructorTypes[typeName];
                jetli.set(typeName, dependency, false);

                expect(dependency).toBeCalledTimes(1);
            });
        });
    });

    describe('should initialise constructor once via set method', () => {
        Object.keys(stubbedConstructorTypes).forEach((typeName) => {
            it(`for ${typeName}`, () => {
                const dependency: Mock = stubbedConstructorTypes[typeName];
                jetli.set(typeName, dependency, false);
                jetli.get(typeName);
                jetli.get(typeName);
                jetli.get(typeName);

                expect(dependency).toBeCalledTimes(1);
            });
        });
    });

    describe('should initialise constructor with correct arguments via set method', () => {
        Object.keys(stubbedConstructorTypes).forEach((typeName) => {
            it(`for ${typeName}`, () => {
                const argument1 = 'abc';
                const argument2 = 123;
                const argument3 = [1, 2, 3];
                const dependency: Mock = stubbedConstructorTypes[typeName];
                jetli.set(typeName, dependency, false, argument1, argument2, argument3);

                expect(dependency).toBeCalledWith(argument1, argument2, argument3);
            });
        });
    });

    describe('should allow to retrieve dependency with string key via get method', () => {
        Object.keys(primitiveTypes).forEach((typeName) => {
            it(`for ${typeName}`, () => {
                const dependency = primitiveTypes[typeName];
                jetli.set(typeName, dependency);
                const retrievedDependency = jetli.get(typeName);

                expect(retrievedDependency).toEqual(dependency);
            });
        });
        Object.keys(constructorTypes).forEach((typeName) => {
            it(`for ${typeName}`, () => {
                const dependency = constructorTypes[typeName];
                jetli.set(typeName, dependency);
                const retrievedDependency = jetli.get(typeName);
                const expectedDerivative = constructorTypeDerivatives[typeName];

                expect(retrievedDependency).not.toEqual(dependency);
                expect(retrievedDependency).toEqual(expectedDerivative);
            });
        });
    });

    describe('should allow to retrieve dependency with constructor via get method', () => {
        Object.keys(constructorTypes).forEach((typeName) => {
            it(`for ${typeName}`, () => {
                const dependency = constructorTypes[typeName];
                const retrievedDependency = jetli.get(dependency);
                const expectedDerivative = constructorTypeDerivatives[typeName];

                expect(retrievedDependency).not.toEqual(dependency);
                expect(retrievedDependency).toEqual(expectedDerivative);
            });
        });
    });

    describe('should unset dependency', () => {
        it(`for string key`, () => {
            Object.keys(constructorTypes).forEach((typeName) => {
                const dependency = constructorTypes[typeName];
                jetli.set(typeName, dependency);
                jetli.unset(typeName);

                try {
                    jetli.get(typeName);
                } catch (error) {
                    expect(error).toBeTruthy();
                }
            });
        });
    });

    describe('should throw error for requesting unset dependency via get method', () => {
        it(`for string key`, () => {
            Object.keys(constructorTypes).forEach((typeName) => {
                const dependency = constructorTypes[typeName];
                jetli.set(typeName, dependency);
                jetli.unset(typeName);

                try {
                    jetli.get(typeName);
                } catch (error) {
                    expect(error).toBeTruthy();
                }
            });
        });
    });

    describe('should throw error for requesting unregistered dependency via get method', () => {
        it(`for string key`, () => {
            Object.keys(constructorTypes).forEach((typeName) => {
                const dependency = constructorTypes[typeName];

                try {
                    jetli.get(typeName);
                } catch (error) {
                    expect(error).toBeTruthy();
                }
            });
        });
        it(`for constructor key`, () => {
            Object.keys(constructorTypes).forEach((typeName) => {
                const dependency = constructorTypes[typeName];

                try {
                    jetli.get(dependency);
                } catch (error) {
                    expect(error).toBeTruthy();
                }
            });
        });
    });

    describe('should throw error for requesting unregistered dependency via set method', () => {
        Object.keys(undefinedDependencies).forEach((typeName) => {
            it(`for ${typeName} dependency`, () => {
                const dependency = constructorTypes[typeName];

                try {
                    jetli.set('someType', dependency);
                } catch (error) {
                    expect(error).toBeTruthy();
                }
            });
        });
    });

    describe('should throw error for requesting dependency with invalid identificator via get method', () => {
        Object.keys(invalidDependencyIdentificators).forEach((typeName) => {
            it(`for ${typeName} dependency`, () => {
                const identificator = invalidDependencyIdentificators[typeName];

                try {
                    jetli.get(identificator);
                } catch (error) {
                    expect(error).toBeTruthy();
                }
            });
        });
    });

    describe('should initialise constructor via get method', () => {
        describe('for string key', () => {
            Object.keys(stubbedConstructorTypes).forEach((typeName) => {
                it(`for ${typeName}`, () => {
                    const dependency: Mock = stubbedConstructorTypes[typeName];
                    jetli.set(typeName, dependency);
                    expect(dependency).not.toBeCalled();

                    jetli.get(typeName);
                    expect(dependency).toBeCalledTimes(1);
                });
            });
        });
        describe('for constructor key', () => {
            Object.keys(stubbedConstructorTypes).forEach((typeName) => {
                it(`for ${typeName}`, () => {
                    const dependency: Mock = stubbedConstructorTypes[typeName];

                    jetli.get(dependency);
                    expect(dependency).toBeCalledTimes(1);
                });
            });
        });
    });

    describe('should initialise constructor once via get method', () => {
        describe('for string key', () => {
            Object.keys(stubbedConstructorTypes).forEach((typeName) => {
                it(`for ${typeName}`, () => {
                    const dependency: Mock = stubbedConstructorTypes[typeName];
                    jetli.set(typeName, dependency);

                    jetli.get(typeName);
                    jetli.get(typeName);
                    jetli.get(typeName);
                    expect(dependency).toBeCalledTimes(1);
                });
            });
        });
        describe('for constructor key', () => {
            Object.keys(stubbedConstructorTypes).forEach((typeName) => {
                it(`for ${typeName}`, () => {
                    const dependency: Mock = stubbedConstructorTypes[typeName];

                    jetli.get(dependency);
                    jetli.get(dependency);
                    jetli.get(dependency);
                    expect(dependency).toBeCalledTimes(1);
                });
            });
        });
    });

    describe('should initialise constructor with correct arguments via get method', () => {
        describe('for string key', () => {
            Object.keys(stubbedConstructorTypes).forEach((typeName) => {
                it(`for ${typeName}`, () => {
                    const argument1 = 'abc';
                    const argument2 = 123;
                    const argument3 = [1, 2, 3];
                    const dependency: Mock = stubbedConstructorTypes[typeName];
                    jetli.set(typeName, dependency, true, argument1, argument2, argument3);
                    jetli.get(typeName);

                    expect(dependency).toBeCalledWith(argument1, argument2, argument3);
                });
            });
        });
        describe('for constructor key', () => {
            Object.keys(stubbedConstructorTypes).forEach((typeName) => {
                it(`for ${typeName}`, () => {
                    const argument1 = 'abc';
                    const argument2 = 123;
                    const argument3 = [1, 2, 3];
                    const dependency: Mock = stubbedConstructorTypes[typeName];
                    jetli.get(dependency, argument1, argument2, argument3);

                    expect(dependency).toBeCalledWith(argument1, argument2, argument3);
                });
            });
        });
    });

});
