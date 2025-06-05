const Ajv = require('ajv');

module.exports = {
  checkItem
};

const defsSchema = {
  $id: 'https://schemas.datasafe.dev/json-schemas/defs.json',
  definitions: {
    localized: {
      type: 'object',
      nullable: false,
      properties: {
        en: { type: 'string' },
        fr: { type: 'string' },
        es: { type: 'string' }
      },
      required: ['en']
    }
  }
};

const itemSchema = {
  $id: 'https://schemas.datasafe.dev/json-schemas/item.json',
  type: 'object',
  nullable: false,
  properties: {
    version: { type: 'string' },
    label: { $ref: 'defs.json#/definitions/localized' },
    description: { $ref: 'defs.json#/definitions/localized' },
    streamId: { type: 'string' },
    repeatable: { enum: ['any', 'none', 'daily'] },
    type: { enum: ['number', 'text', 'select', 'checkbox', 'date'] },
    eventType: { type: 'string' },
    options: {
      type: 'array',
      items: {
        type: 'object',
        nullable: false,
        properties: {
          value: { type: ['number', 'string'] },
          label: { $ref: 'defs.json#/definitions/localized' }
        },
        required: ['value', 'label'],
        additionalProperties: false
      }
    },
    variations: {
      type: 'object',
      nullable: false,
      properties: {
        eventTypes: {
          type: 'object'
        }
      }
    }
  },
  required: ['version', 'label', 'description', 'streamId', 'type'],
  additionalProperties: false
};

const ajv = new Ajv({ schemas: [itemSchema, defsSchema] });
const validateItem = ajv.getSchema('https://schemas.datasafe.dev/json-schemas/item.json');

function checkItem (item) {
  const valid = validateItem(item);
  if (!valid) {
    console.log(item);
    console.log(validateItem.errors);
    throw new Error(validateItem.errors);
  }
}
