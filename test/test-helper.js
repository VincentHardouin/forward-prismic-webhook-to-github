const { expect } = require('chai');
const nock = require('nock');
const sinon = require('sinon');

beforeEach(() => {
  nock.disableNetConnect();
});

afterEach(function () {
  sinon.restore();
});

module.exports = {
  expect,
  nock,
  sinon,
};
