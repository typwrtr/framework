import { sha } from '@0xcert/utils';
import { Spec } from '@hayspec/spec';
import * as Ajv from 'ajv';
import { Object87, schema87 } from '../assets/87-asset-evidence';

const spec = new Spec<{
  validate: any;
}>();

spec.before((stage) => {
  stage.set('validate', new Ajv({ allErrors: true }).compile(schema87));
});

spec.test('passes for valid data', (ctx) => {
  const schema: Object87 = {
    '$schema': 'http://json-schema.org/draft-07/schema',
    'data': [
      {
        'path': [],
        'nodes': [
          {
            'index': 1,
            'hash': '9b61df344ebc1740d60333efc401150f756c3e3bc13f9ca31ddd96b8fc7180fe',
          },
        ],
        'values': [
          {
            'index': 3,
            'value': 'https://troopersgame.com/dog.jpg',
            'nonce': '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
          },
        ],
      },
    ],
  };
  ctx.true(ctx.get('validate')(schema));
});

spec.test('fails for valid data', (ctx) => {
  const schema = {
    '$schema': 'http://json-schema.org/draft-07/schema',
    'data': [
      {
        'nodes': [
          {
            'index': '9b61df344ebc1740d60333efc401150f756c3e3bc13f9ca31ddd96b8fc7180fe',
          },
        ],
        'values': [
          {
            'index': 'foo',
            'value': 'https://troopersgame.com/dog.jpg',
            'nonce': '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
          },
        ],
      },
    ],
  };
  ctx.false(ctx.get('validate')(schema));
});

spec.test('matches unique schema ID', async (ctx) => {
  ctx.is(await sha(256, JSON.stringify(schema87)), '8fb2992291698b165e7f6b7e43627243767984e3e6ff1b8e7903f59723c94b24');
});

export default spec;
