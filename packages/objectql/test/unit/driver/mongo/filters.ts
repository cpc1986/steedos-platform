import { SteedosMongoDriver } from "../../../../src/driver";
import { expect } from 'chai';
import { SteedosQueryOptions } from "../../../../src/types/query";

let tableName = "mongo-driver-test-filters";
let driver = new SteedosMongoDriver({ url: "mongodb://127.0.0.1/steedos" });

describe('filters for mongo database', () => {
    let result: any;
    let expected: any;
    let testIndex: number = 0;

    let tests = [
        {
            title: "filter records with filters",
            options: {
                fields: ["id", "name"],
                filters: [["name", "=", "ptr"], ["title", "=", "PTR"]]
            },
            expected: {
                length: 1
            }
        },
        {
            title: "filter records with odata query string",
            options: {
                fields: ["id", "name"],
                filters: "(name eq 'ptr') and (title eq 'PTR')"
            },
            expected: {
                length: 1
            }
        },
        {
            title: "filter records with empty array",
            options: {
                fields: ["id", "name"],
                filters: []
            },
            expected: {
                length: 2
            }
        },
        {
            title: "filter records with empty string",
            options: {
                fields: ["id", "name"],
                filters: ""
            },
            expected: {
                length: 2
            }
        },
        {
            title: "records count with filters",
            function: "count",
            options: {
                fields: ["id", "name"],
                filters: [["name", "=", "ptr"], ["title", "=", "PTR"]]
            },
            expected: {
                eq: 1
            }
        },
        {
            title: "records count with odata query string",
            function: "count",
            options: {
                fields: ["id", "name"],
                filters: "(name eq 'ptr') and (title eq 'PTR')"
            },
            expected: {
                eq: 1
            }
        }
    ];

    before(async () => {
    });

    beforeEach(async () => {
        await driver.insert(tableName, { _id: "ptr", name: "ptr", title: "PTR" });
        await driver.insert(tableName, { _id: "cnpc", name: "cnpc", title: "CNPC" });

        let queryOptions: SteedosQueryOptions = tests[testIndex].options;
        expected = tests[testIndex].expected;
        let functionName: string = tests[testIndex].function;
        try {
            if (functionName) {
                result = await driver[functionName](tableName, queryOptions);
            }
            else {
                result = await driver.find(tableName, queryOptions);
            }
        }
        catch (ex) {
            result = ex;
        }
    });

    afterEach(async () => {
        await driver.delete(tableName, "ptr");
        await driver.delete(tableName, "cnpc");
    });

    tests.forEach(async (test) => {
        it(`arguments:${JSON.stringify(test)}`, async () => {
            testIndex++;
            if (expected.error !== undefined) {
                expect(result.message).to.be.eq(expected.error);
            }
            if (expected.length !== undefined) {
                expect(result).to.be.length(expected.length);
            }
            if (expected.eq !== undefined) {
                expect(result).to.be.eq(expected.eq);
            }
        });
    });
});

