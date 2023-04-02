/*
 * @Author: sunhaolin@hotoa.com
 * @Date: 2023-03-23 15:12:14
 * @LastEditors: sunhaolin@hotoa.com
 * @LastEditTime: 2023-03-29 14:59:59
 * @Description: 
 */

"use strict";
const { SteedosDatabaseDriverType, getObject } = require('@steedos/objectql');
const {
    generateActionGraphqlProp,
    generateSettingsGraphql,
    getGraphqlActions,
    getQueryFields
} = require('./lib');
const open = require('open');

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
module.exports = {
    name: 'graphql',
    namespace: "steedos",
    mixins: [],

    globalTypeDefs: [], // service-api 里generateGraphQLSchema使用 

    projectStarted: false,

    /**
     * Settings
     */
    settings: {
        graphql: {
            // query: ['spaces(fields: JSON, filters: JSON, top: Int, skip: Int, sort: String): [spaces]'],
            // mutation: mutation,
            // resolvers: {
            //     Query: {
            //         spaces: {
            //             action: "find"
            //         }              
            //     }
            // }
        }
    },

    /**
     * Dependencies
     */
    dependencies: [],

    /**
     * Actions
     */
    actions: {
        // expand、related等actions
        ...getGraphqlActions(),

        // meteor、default database 默认不返回is_deleted = true的数据
        find: {
            params: {
                fields: { type: 'array', items: "string", optional: true },
                filters: [{ type: 'array', optional: true }, { type: 'string', optional: true }],
                top: { type: 'number', optional: true },
                skip: { type: 'number', optional: true },
                sort: { type: 'string', optional: true }
            },
            // graphql: {
            //     query:
            //     [
            //         gql`
            //             users(fields: JSON, filters: JSON, top: Int, skip: Int, sort: String): [space_users]
            //         `,
            //         gql`
            //             space_users(fields: JSON, filters: JSON, top: Int, skip: Int, sort: String): [space_users]
            //         `    
            //     ]
            // },
            async handler(ctx) {
                const resolveInfo = ctx.meta.resolveInfo
                const objectName = resolveInfo.fieldName
                const objectConfig = await getObject(objectName).getConfig()
                // filters: 如果filters中没有查询 is_deleted 则自动添加is_deleted != true 条件
                if (objectConfig.datasource.driver === SteedosDatabaseDriverType.MeteorMongo || objectConfig.datasource.driver === SteedosDatabaseDriverType.Mongo) {
                    const { filters } = ctx.params;
                    if (filters) {
                        if (_.isString(filters)) {
                            if (filters.indexOf('(is_deleted eq true)') < 0) {
                                ctx.params.filters = `(${filters}) and (is_deleted ne true)`;
                            }
                        }
                        if (_.isArray(filters)) {
                            const filtersStr = formatFiltersToODataQuery(filters);
                            if (filtersStr.indexOf('(is_deleted eq true)') < 0) {
                                ctx.params.filters = [ctx.params.filters, ['is_deleted', '!=', true]]
                            }
                        }
                    } else {
                        ctx.params.filters = '(is_deleted ne true)'
                    }
                }
                if (_.isEmpty(ctx.params.fields)) {
                    const { resolveInfo } = ctx.meta;

                    const fieldNames = getQueryFields(resolveInfo);

                    if (!_.isEmpty(fieldNames)) {
                        ctx.params.fields = fieldNames;
                    }
                }
                const userSession = ctx.meta.user;
                return this.find(objectName, ctx.params, userSession)
            }
        },
        count: {
            params: {
                fields: { type: 'array', items: "string", optional: true },
                filters: [{ type: 'array', optional: true }, { type: 'string', optional: true }],
                top: { type: 'number', optional: true },
                skip: { type: 'number', optional: true },
                sort: { type: 'string', optional: true }
            },
            async handler(ctx) {
                const resolveInfo = ctx.meta.resolveInfo
                const objectName = resolveInfo.fieldName.replace('__count', '')
                const objectConfig = await getObject(objectName).getConfig()
                // filters: 如果filters中没有查询 is_deleted 则自动添加is_deleted != true 条件
                if (objectConfig.datasource.driver === SteedosDatabaseDriverType.MeteorMongo || objectConfig.datasource.driver === SteedosDatabaseDriverType.Mongo) {
                    const { filters } = ctx.params;
                    if (filters) {
                        if (_.isString(filters)) {
                            if (filters.indexOf('(is_deleted eq true)') < 0) {
                                ctx.params.filters = `(${filters}) and (is_deleted ne true)`;
                            }
                        }
                        if (_.isArray(filters)) {
                            const filtersStr = formatFiltersToODataQuery(filters);
                            if (filtersStr.indexOf('(is_deleted eq true)') < 0) {
                                ctx.params.filters = [ctx.params.filters, ['is_deleted', '!=', true]]
                            }
                        }
                    } else {
                        ctx.params.filters = '(is_deleted ne true)'
                    }
                }

                const userSession = ctx.meta.user;
                return this.count(objectName, ctx.params, userSession)
            }
        },
        findOne: {
            params: {
                id: { type: "any" },
                query: { type: "object", optional: true }
            },
            async handler(ctx) {
                const resolveInfo = ctx.meta.resolveInfo
                const objectName = resolveInfo.fieldName.replace('__findOne', '')
                const userSession = ctx.meta.user;
                const { id, query } = ctx.params;
                return this.findOne(objectName, id, query, userSession)
            }
        },
        insert: {
            params: {
                doc: [
                    { type: "object" },
                    { type: "string" }
                ]
            },
            async handler(ctx) {
                const resolveInfo = ctx.meta.resolveInfo
                const objectName = resolveInfo.fieldName.replace('__insert', '')
                const object = getObject(objectName)
                const userSession = ctx.meta.user;
                const { doc } = ctx.params;
                let data = '';
                if (_.isString(doc)) {
                    data = JSON.parse(doc);
                } else {
                    data = JSON.parse(JSON.stringify(doc));
                }
                if (userSession && (await object.getField('space'))) {
                    data.space = userSession.spaceId;
                }
                return this.insert(objectName, data, userSession)
            }
        },
        update: {
            params: {
                id: { type: "any" },
                doc: [
                    { type: "object" },
                    { type: "string" }
                ]
            },
            async handler(ctx) {
                const resolveInfo = ctx.meta.resolveInfo
                const objectName = resolveInfo.fieldName.replace('__update', '')
                const userSession = ctx.meta.user;
                const { id, doc } = ctx.params;
                let data = '';
                if (_.isString(doc)) {
                    data = JSON.parse(doc);
                } else {
                    data = JSON.parse(JSON.stringify(doc));
                }
                delete data.space;
                return this.update(objectName, id, data, userSession)
            }
        },
        delete: {
            params: {
                id: { type: "any" }
            },
            async handler(ctx) {
                const resolveInfo = ctx.meta.resolveInfo
                const objectName = resolveInfo.fieldName.replace('__delete', '')
                const objectConfig = await getObject(objectName).getConfig()
                const userSession = ctx.meta.user;
                const { id } = ctx.params;
                const enableTrash = objectConfig.enable_trash
                if (!enableTrash) {
                    return this.delete(objectName, id, userSession)
                } else {
                    const data = {
                        is_deleted: true,
                        deleted: new Date(),
                        deleted_by: userSession ? userSession.userId : null
                    }
                    return this.update(objectName, id, data, userSession)
                }
            }
        },

        /**
         * @api {get} /service/api/graphql/generateGraphqlSchemaInfo 生成graphql schema
         * @apiName generateGraphqlSchemaInfo
         * @apiGroup service-object-graphql
         * @apiSuccess {Object} 
         */
        generateGraphqlSchemaInfo: {
            rest: {
                method: 'GET',
                path: '/generateGraphqlSchemaInfo'
            },
            params: {
            },
            async handler(ctx) {
                this.broker.logger.info('[service][graphql]===>', 'generateGraphqlSchemaInfo', ctx.params.name)
                const settingsGraphql = await this.generateObjGraphqlMap(this.name)
                return settingsGraphql
            }
        },

    },

    /**
     * Events
     */
    events: {
        // 此事件表示软件包发生变化（包括加载、卸载、对象发生变化），接收到此事件后重新生成graphql schema
        "$packages.changed": {
            params: {},
            async handler(ctx) {
                // console.log("Payload:", ctx.params);
                // console.log("Sender:", ctx.nodeID);
                // console.log("Metadata:", ctx.meta);
                // console.log("The called event name:", ctx.eventName);

                const objGraphqlMap = await this.generateObjGraphqlMap(this.name)

                let globalTypeDefs = []
                let query = []
                let mutation = []
                let resolvers = {}
                let resolversQuery = {}
                let resolversMutation = {}

                for (const objectName in objGraphqlMap) {
                    if (Object.hasOwnProperty.call(objGraphqlMap, objectName)) {
                        const gMap = objGraphqlMap[objectName];
                        globalTypeDefs.push(gMap.type)
                        query = query.concat(gMap.query)
                        mutation = mutation.concat(gMap.mutation)
                        resolvers = Object.assign(resolvers, gMap.resolvers)
                        resolversQuery = Object.assign(resolversQuery, gMap.resolversQuery)
                        resolversMutation = Object.assign(resolversMutation, gMap.resolversMutation)
                    }
                }

                this.globalTypeDefs = globalTypeDefs

                this.settings.graphql = {
                    query: query,
                    mutation: mutation,
                    resolvers: {
                        ...resolvers,
                        Query: resolversQuery,
                        Mutation: resolversMutation
                    }
                }

                // console.log('graphql:', new Date())
                // console.log(JSON.stringify(query, null, 2))

                // 发送事件，通知ApolloService重新加载graphql schema
                ctx.emit('$services.changed');

                if (!this.projectStarted) {
                    this.projectStarted = true
                    console.log('');
                    console.log(`Project is running at ${process.env.ROOT_URL}`);
                    console.log('');
                    if (process.env.STEEDOS_AUTO_OPEN_BROWSER != 'false') { // 默认打开，如果不想打开，设置STEEDOS_AUTO_OPEN_BROWSER=false
                        try {
                            open(process.env.ROOT_URL);
                        } catch (error) {
                            console.error(error);
                            console.error('auto open browser failed.');
                        }
                    }
                }
            }
        }
    },

    /**
     * Methods
     */
    methods: {

        find: {
            async handler(objectName, query, userSession) {
                const obj = getObject(objectName)
                if (objectName == 'users') {
                    return await obj.find(query)
                }
                return await this.broker.call("objectql.find", {
                    objectName: objectName,
                    query: query
                }, {
                    meta: {
                        user: userSession
                    }
                })
            }
        },
        count: {
            async handler(objectName, query, userSession) {
                const obj = getObject(objectName)
                return await this.broker.call("objectql.count", {
                    objectName: objectName,
                    query: query,
                }, {
                    meta: {
                        user: userSession
                    }
                })
            }
        },
        findOne: {
            async handler(objectName, id, query, userSession) {
                const obj = getObject(objectName)
                if (objectName == 'users') {
                    return await obj.findOne(id, query)
                }
                return await this.broker.call("objectql.findOne", {
                    objectName: objectName,
                    id: id,
                    query: query,
                }, {
                    meta: {
                        user: userSession
                    }
                })
            }
        },
        insert: {
            async handler(objectName, doc, userSession) {
                const obj = getObject(objectName)
                return await this.broker.call("objectql.insert", {
                    objectName: objectName,
                    doc: doc,
                }, {
                    meta: {
                        user: userSession
                    }
                })
            }
        },
        update: {
            async handler(objectName, id, doc, userSession) {
                const obj = getObject(objectName)
                return await this.broker.call("objectql.update", {
                    objectName: objectName,
                    id: id,
                    doc: doc,
                }, {
                    meta: {
                        user: userSession
                    }
                })
            }
        },
        delete: {
            async handler(objectName, id, userSession) {
                const obj = getObject(objectName)
                return await this.broker.call("objectql.delete", {
                    objectName: objectName,
                    id: id,
                }, {
                    meta: {
                        user: userSession
                    }
                })
            }
        },

        async generateObjGraphqlMap(graphqlServiceName) {
            const objGraphqlMap = {}
            const objectConfigs = await this.broker.call("objects.getAll");
            for (const object of objectConfigs) {
                // console.log('===>object.metadata.name: ', object.metadata.name)
                const objectConfig = object.metadata
                const objectName = objectConfig.name
                // 排除 __MONGO_BASE_OBJECT __SQL_BASE_OBJECT
                if (['__MONGO_BASE_OBJECT', '__SQL_BASE_OBJECT'].includes(objectName)) {
                    continue
                }
                /**
                 * objGraphqlMap[objectName] 结构
                {
                    type: "",
                    resolvers: {
                        [objectName]: {
                            [`${name}${EXPAND_SUFFIX}`]: {},
                            [relatedFieldName]: {},
                            [DISPLAY_PREFIX]: {},
                            [UI_PREFIX]: {},
                            [PERMISSIONS_PREFIX]: {},
                            [`${RELATED_PREFIX}_files`]: {},
                            [`${RELATED_PREFIX}_tasks`]: {},
                            [`${RELATED_PREFIX}_notes`]: {},
                            [`${RELATED_PREFIX}_events`]: {},
                            [`${RELATED_PREFIX}_audit_records`]: {},
                            [`${RELATED_PREFIX}_instances`]: {},
                            [`${RELATED_PREFIX}_approvals`]: {}
                        }
                    },
                    query: [],
                    resolversQuery: {
                        [objectName]: { action: 'find' },
                        [`${objectName}__count`]: { action: 'count' },
                        [`${objectName}__findOne`]: { action: 'findOne' }
                    },
                    mutation: [],
                    resolversMutation: {
                        [`${objectName}__insert`]: { action: 'insert' },
                        [`${objectName}__update`]: { action: 'update' },
                        [`${objectName}__delete`]: { action: 'delete' }
                    }
                }
                 */
                const gMap = {}

                const typeAndResolves = await generateSettingsGraphql(objectConfig, graphqlServiceName)

                gMap.type = typeAndResolves.type
                gMap.resolvers = typeAndResolves.resolvers

                if (objectName == 'users') {
                    objGraphqlMap[objectName] = gMap
                    continue
                }
                gMap.query = []
                gMap.resolversQuery = {}
                gMap.mutation = []
                gMap.resolversMutation = {}

                gMap.query.push(generateActionGraphqlProp('find', objectConfig))
                gMap.resolversQuery[objectName] = { action: 'find' }

                gMap.query.push(generateActionGraphqlProp('count', objectConfig))
                gMap.resolversQuery[`${objectName}__count`] = { action: 'count' }

                gMap.query.push(generateActionGraphqlProp('findOne', objectConfig))
                gMap.resolversQuery[`${objectName}__findOne`] = { action: 'findOne' }

                gMap.mutation.push(generateActionGraphqlProp('insert', objectConfig))
                gMap.resolversMutation[`${objectName}__insert`] = { action: 'insert' }

                gMap.mutation.push(generateActionGraphqlProp('update', objectConfig))
                gMap.resolversMutation[`${objectName}__update`] = { action: 'update' }

                gMap.mutation.push(generateActionGraphqlProp('delete', objectConfig))
                gMap.resolversMutation[`${objectName}__delete`] = { action: 'delete' }

                objGraphqlMap[objectName] = gMap
            };

            return objGraphqlMap
        }
    },

    /**
     * Service created lifecycle event handler
     */
    created() {
    },

    merged(schema) {
    },

    /**
     * Service started lifecycle event handler
     */
    async started() {
        // const that = this;
        // setTimeout(async function () {
        //     const objGraphqlMap = await that.generateObjGraphqlMap(that.name)

        //     let globalTypeDefs = []
        //     let query = []
        //     let mutation = []
        //     let resolvers = {}
        //     let resolversQuery = {}
        //     let resolversMutation = {}

        //     for (const objectName in objGraphqlMap) {
        //         if (Object.hasOwnProperty.call(objGraphqlMap, objectName)) {
        //             const gMap = objGraphqlMap[objectName];
        //             globalTypeDefs.push(gMap.type)
        //             query = query.concat(gMap.query)
        //             mutation = mutation.concat(gMap.mutation)
        //             resolvers = Object.assign(resolvers, gMap.resolvers)
        //             resolversQuery = Object.assign(resolversQuery, gMap.resolversQuery)
        //             resolversMutation = Object.assign(resolversMutation, gMap.resolversMutation)
        //         }
        //     }

        //     that.globalTypeDefs = globalTypeDefs

        //     that.settings.graphql = {
        //         query: query,
        //         mutation: mutation,
        //         resolvers: {
        //             ...resolvers,
        //             Query: resolversQuery,
        //             Mutation: resolversMutation
        //         }
        //     }

        //     console.log('graphql:', new Date())
        // }, 20000)
    },

    /**
     * Service stopped lifecycle event handler
     */
    async stopped() {

    }
};