/*
 * @Author: baozhoutao@steedos.com
 * @Date: 2022-04-27 10:07:56
 * @Description:
 */

const objectql = require("@steedos/objectql");
const steedosI18n = require("@steedos/i18n");
const _ = require("underscore");

const getDateTimeOperators = (lng)=>{
    return [
        'equal', 
        'not_equal', 
        'less', 
        'less_or_equal', 
        'greater', 
        'greater_or_equal', 
        'between',
        {
            "label": steedosI18n.t("creator_filter_operation_between_last_year", {}, lng),
            "value": "between:last_year",
            "values": []
        },
        {
            "label": steedosI18n.t("creator_filter_operation_between_this_year", {}, lng),
            "value": "between:this_year",
            "values": []
        },
        {
            "label": steedosI18n.t("creator_filter_operation_between_next_year", {}, lng),
            "value": "between:next_year",
            "values": []
        },
        {
            "label": steedosI18n.t("creator_filter_operation_between_last_quarter", {}, lng),
            "value": "between:last_quarter",
            "values": []
        },
        {
            "label": steedosI18n.t("creator_filter_operation_between_this_quarter", {}, lng),
            "value": "between:this_quarter",
            "values": []
        },
        {
            "label": steedosI18n.t("creator_filter_operation_between_next_quarter", {}, lng),
            "value": "between:next_quarter",
            "values": []
        },
        {
            "label": steedosI18n.t("creator_filter_operation_between_last_month", {}, lng),
            "value": "between:last_month",
            "values": []
        },
        {
            "label": steedosI18n.t("creator_filter_operation_between_this_month", {}, lng),
            "value": "between:this_month",
            "values": []
        },
        {
            "label": steedosI18n.t("creator_filter_operation_between_next_month", {}, lng),
            "value": "between:next_month",
            "values": []
        },
        {
            "label": steedosI18n.t("creator_filter_operation_between_last_week", {}, lng),
            "value": "between:last_week",
            "values": []
        },
        {
            "label": steedosI18n.t("creator_filter_operation_between_this_week", {}, lng),
            "value": "between:this_week",
            "values": []
        },
        {
            "label": steedosI18n.t("creator_filter_operation_between_next_week", {}, lng),
            "value": "between:next_week",
            "values": []
        },
        {
            "label": steedosI18n.t("creator_filter_operation_between_yestday", {}, lng),
            "value": "between:yestday", // 一个错误的拼写, 待@steedos/filters 修正
            "values": []
        },
        {
            "label": steedosI18n.t("creator_filter_operation_between_today", {}, lng),
            "value": "between:today",
            "values": []
        },
        {
            "label": steedosI18n.t("creator_filter_operation_between_tomorrow", {}, lng),
            "value": "between:tomorrow",
            "values": []
        },
        {
            "label": steedosI18n.t("creator_filter_operation_between_last_7_days", {}, lng),
            "value": "between:last_7_days",
            "values": []
        },
        {
            "label": steedosI18n.t("creator_filter_operation_between_last_30_days", {}, lng),
            "value": "between:last_30_days",
            "values": []
        },
        {
            "label": steedosI18n.t("creator_filter_operation_between_last_60_days", {}, lng),
            "value": "between:last_60_days",
            "values": []
        },
        {
            "label": steedosI18n.t("creator_filter_operation_between_last_90_days", {}, lng),
            "value": "between:last_90_days",
            "values": []
        },
        {
            "label": steedosI18n.t("creator_filter_operation_between_last_120_days", {}, lng),
            "value": "between:last_120_days",
            "values": []
        },
        {
            "label": steedosI18n.t("creator_filter_operation_between_next_7_days", {}, lng),
            "value": "between:next_7_days",
            "values": []
        },
        {
            "label": steedosI18n.t("creator_filter_operation_between_next_30_days", {}, lng),
            "value": "between:next_30_days",
            "values": []
        },
        {
            "label": steedosI18n.t("creator_filter_operation_between_next_60_days", {}, lng),
            "value": "between:next_60_days",
            "values": []
        },
        {
            "label": steedosI18n.t("creator_filter_operation_between_next_90_days", {}, lng),
            "value": "between:next_90_days",
            "values": []
        },
        {
            "label": steedosI18n.t("creator_filter_operation_between_next_120_days", {}, lng),
            "value": "between:next_120_days",
            "values": []
        }
    ]
}


const getFieldOperators = (type, lng)=>{
    switch (type) {
        case 'text':
            return ['equal', 'not_equal', 'like', 'not_like', 'starts_with', 'ends_with']
        case 'currency':
        case 'number':
            return [ 'equal', 'not_equal', 'less', 'less_or_equal', 'greater', 'greater_or_equal', 'between']
        case 'date':
            return getDateTimeOperators(lng)
        case 'datetime':
            return getDateTimeOperators(lng)
        case 'time':
            return [ 'equal', 'not_equal', 'less', 'less_or_equal', 'greater', 'greater_or_equal', 'between']
        case 'lookup':
        case 'master_detail':
        case 'select':
            return [ 'select_equals', 'select_not_equals', 'select_any_in', 'select_not_any_in' ]
        default:
            return ;
    }

}

module.exports = {
    name: "amis-metadata-listviews",
    mixins: [],
    /**
     * Settings
     */
    settings: {},

    /**
     * Dependencies
     */
    dependencies: [],

    /**
     * Actions
     */
    actions: {
        getFilterFields: {
            rest: {
                method: "GET",
                path: "/getFilterFields",
            },
            async handler(ctx) {
                const fields = await this.getFilterFields(ctx);
                return { fields }
            },
        },
        getSelectFieldOptions: {
            rest: {
                method: "GET",
                path: "/getSelectFieldOptions",
            },
            async handler(ctx) {
                const options = await this.getSelectFieldOptions(ctx);
                return { status: 0, data: { options } }
            },
        }
    },

    /**
     * Events
     */
    events: {},

    /**
     * Methods
     */
    methods: {
        getFilterFields: {
            async handler(ctx) {
                const userSession = ctx.meta.user;
                const { objectName } = ctx.params;
                const lng = userSession.language || "zh-CN";
                const spaceId = userSession.spaceId;
                const objectConfig = await objectql.getObjectConfig(objectName);

                steedosI18n.translationObject(lng, objectConfig.name, objectConfig);

                const fieldsArr = [];
                _.each(objectConfig.fields , (field, field_name)=>{
                    if(!_.has(field, "name")){
                        field.name = field_name
                    }
                    fieldsArr.push(field)
                })
                const fields = [];
                _.each(_.sortBy(fieldsArr, "sort_no"), function(field){
                    if(!field.hidden && !_.includes(["grid", "object", "[Object]", "[object]", "Object", "markdown", "html"], field.type)){
                        field.label = field.label || field.name
                        switch (field.type) {
                            case 'text':
                                fields.push({
                                    label: field.label,
                                    type: field.type,
                                    name: field.name,
                                    operators: getFieldOperators(field.type, lng)
                                });
                                break;
                            case 'currency':
                            case 'number':
                                fields.push({
                                    label: field.label,
                                    type: 'number',
                                    name: field.name,
                                    operators: getFieldOperators('number', lng)
                                });
                                break;
                            // 以下date 、datetime、time 不能作为amis 表单项的格式 . filters 对此格式做个特殊兼容,
                            case 'date':
                                // 华炎魔方中日期字段存的是utc的0点
                                fields.push({
                                    label: field.label,
                                    type: field.type,
                                    name: field.name,
                                    format: "YYYY-MM-DDT00:00:00+00:00",
                                    operators: getFieldOperators(field.type, lng)
                                });
                                break;
                            case 'datetime':
                                // 即amis中日期时间控件的format默认值为"YYYY-MM-DDTHH:mm+08:00"正好满足需求
                                fields.push({
                                    label: field.label,
                                    type: field.type,
                                    name: field.name,
                                    operators: getFieldOperators(field.type, lng)
                                });
                                break;
                            case 'time':
                                // 华炎魔方中时间字段存的是1970-01-01的utc时间
                                fields.push({
                                    label: field.label,
                                    type: field.type,
                                    name: field.name,
                                    format: "1970-01-01THH:mm+00:00",
                                    operators: getFieldOperators(field.type, lng)
                                });
                                break;
                            case 'lookup':
                            case 'master_detail':
                            case 'select':
                                fields.push({
                                    label: field.label,
                                    type: 'select',
                                    name: field.name,
                                    source: {
                                        "method": "get",
                                        "url": "${context.rootUrl}" + `/service/api/amis-metadata-listviews/getSelectFieldOptions?objectName=${objectName}&fieldName=${field.name}`,
                                        "dataType": "json",
                                        "headers": {
                                          "Authorization": "Bearer ${context.tenantId},${context.authToken}"
                                        }
                                      }
                                    ,
                                    searchable: true,
                                    operators: getFieldOperators(field.type, lng)
                                });
                                break;
                            case 'boolean':
                            case 'toggle':
                                fields.push({
                                    label: field.label,
                                    type: "select",
                                    name: field.name,
                                    options: [
                                        {label: steedosI18n.t("True", {}, lng), value: true},
                                        {label: steedosI18n.t("False", {}, lng), value: false}
                                    ],
                                    operators: [
                                      "equal",
                                      "not_equal"
                                    ]
                                  });
                            default:
                                break;
                        }
                    }
                });

                return fields;
            },
        },
        getSelectFieldOptions: {
            async handler(ctx) {
                const userSession = ctx.meta.user;
                const { objectName, fieldName } = ctx.params;
                const lng = userSession.language || "zh-CN";
                const objectConfig = await objectql.getObjectConfig(objectName);

                steedosI18n.translationObject(lng, objectConfig.name, objectConfig);

                const field = objectConfig.fields[fieldName];
                if(field.type === 'select'){
                    return field.options;
                }else if(field.reference_to){
                    const records = await objectql.getObject(field.reference_to).find({filters: [[]]})
                    return _.map(records, (record)=>{
                        return {
                            label: record[objectConfig._NAME_FIELD_KEY || 'name'],
                            value: record[objectConfig._idFieldName || '_id']
                        };
                    })
                }
            },
        }
    },
};
