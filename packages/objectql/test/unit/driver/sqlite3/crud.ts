import { SteedosSqlite3Driver } from "../../../../src/driver";
import { expect } from 'chai';
import path = require("path");

let databaseUrl = path.join(__dirname, "sqlite-test.db");
// let databaseUrl = ':memory:';
let tableName = "TestCrudForSqlite3";

describe('crud for sqlite3 database', () => {
    try {
        require("sqlite3");
    }
    catch (ex) {
        return true;
    }
    before(async () => {
        let driver = new SteedosSqlite3Driver({ url: `${databaseUrl}` });
        let result: any = await driver.run(`select count(*) as count from sqlite_master where type = 'table' and name = '${tableName}'`);

        expect(result[0].count).to.be.not.eq(undefined);
        if (result[0].count) {
            await driver.run(`DROP TABLE ${tableName}`);
        }
        await driver.run(`
            CREATE TABLE ${tableName}(
                [id] TEXT primary key,
                [name] TEXT,
                [title] TEXT,
                [count] INTEGER
            );
        `);
    });

    it('create one record', async () => {
        let driver = new SteedosSqlite3Driver({ url: `${databaseUrl}` });
        let result: any = await driver.insert(tableName, { id: "ptr", name: "ptr", title: "PTR", count: 46 })
        expect(result.id).to.be.eq("ptr");
    });

    it('update one record', async () => {
        let driver = new SteedosSqlite3Driver({ url: `${databaseUrl}` });
        let result: any = await driver.update(tableName, "ptr", { name: "ptr-", title: "PTR-", count: 460 })

        expect(result).to.be.length(0);
    });

    it('read one record', async () => {
        let driver = new SteedosSqlite3Driver({ url: `${databaseUrl}` });
        let queryOptions = {
            fields: ["name", "count"]
        };
        let result: any = await driver.findOne(tableName, "ptr", queryOptions);

        expect(result.name).to.be.eq("ptr-");
        expect(result.count).to.be.eq(460);
    });

    it('delete one record', async () => {
        let driver = new SteedosSqlite3Driver({ url: `${databaseUrl}` });
        let result: any = await driver.delete(tableName, "ptr");

        expect(result).to.be.length(0);
    });
});

