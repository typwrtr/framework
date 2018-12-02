import { Spec } from '@specron/spec';

/**
 * Spec context interfaces.
 */

interface Data {
  xcert?: any;
  owner?: string;
  bob?: string;
  jane?: string;
  sara?: string;
  zeroAddress?: string;
  id1?: string;
  id2?: string;
  id3?: string;
  uriBase?: string;
  proof1?: string;
  proof2?: string;
  proof3?: string;
}

const spec = new Spec<Data>();

export default spec;

spec.beforeEach(async (ctx) => {
  const accounts = await ctx.web3.eth.getAccounts();
  ctx.set('owner', accounts[0]);
  ctx.set('bob', accounts[1]);
  ctx.set('jane', accounts[2]);
  ctx.set('sara', accounts[3]);
  ctx.set('zeroAddress', '0x0000000000000000000000000000000000000000');
});

spec.beforeEach(async (ctx) => {
  ctx.set('id1', '123');
  ctx.set('id2', '124');
  ctx.set('id3', '125');
  ctx.set('uriBase', 'http://0xcert.org/');
  ctx.set('proof1', '0x973124ffc4a03e66d6a4458e587d5d6146f71fc57f359c8d516e0b12a50ab0d9');
  ctx.set('proof2', '0x6f25b3f4bc7eadafb8f57d69f8a59db3b23f198151dbf3c66ac3082381518329');
  ctx.set('proof3', '0xc77a290be17f8a4ef301c4ca46497c5beb4a0556ec2d5a04dce4ce6ebd439ad1');
});

spec.beforeEach(async (ctx) => {
  const owner = ctx.get('owner');
  const uriBase = ctx.get('uriBase');
  const xcert = await ctx.deploy({ 
    src: './build/mutable-xcert-mock.json',
    contract: 'MutableXcertMock',
    args: ['Foo','F',uriBase,'0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658']
  });

  await xcert.instance.methods.assignAbilities(owner, [1,4]).send({ from: owner });
  ctx.set('xcert', xcert);
});

spec.test('sucesfully updates proof', async (ctx) => {
  const xcert = ctx.get('xcert');
  const owner = ctx.get('owner');
  const bob = ctx.get('bob');
  const id = ctx.get('id1');
  const proof = ctx.get('proof1');
  const newProof = ctx.get('proof2');

  await xcert.instance.methods.mint(bob, id, proof).send({ from: owner });
  const logs = await xcert.instance.methods.updateTokenProof(id, newProof).send({ from: owner });
  ctx.not(logs.events.TokenProofUpdate, undefined);
  const xcertId1Proof = await xcert.instance.methods.tokenProof(id).call();
  ctx.is(xcertId1Proof, newProof);
});

spec.test('throws when a third party tries to update proof', async (ctx) => {
  const xcert = ctx.get('xcert');
  const owner = ctx.get('owner');
  const bob = ctx.get('bob');
  const sara = ctx.get('sara');
  const id = ctx.get('id1');
  const proof = ctx.get('proof1');
  const newProof = ctx.get('proof2');

  await xcert.instance.methods.mint(bob, id, proof).send({ from: owner });
  await ctx.reverts(() => xcert.instance.methods.updateTokenProof(id, newProof).send({ from: sara }));
});

spec.test('throws when trying to update xcert that does not exist', async (ctx) => {
  const xcert = ctx.get('xcert');
  const owner = ctx.get('owner');
  const id = ctx.get('id1');
  const proof = ctx.get('proof1');

  await ctx.reverts(() => xcert.instance.methods.updateTokenProof(id, proof).send({ from: owner }), '010001');
});