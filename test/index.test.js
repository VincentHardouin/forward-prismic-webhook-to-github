const { expect, nock, sinon } = require('./test-helper');
const {
  getGitHubActionsUrl,
  getHeaders,
  getResponse,
  handler,
} = require('../index');

describe('Unit | index', () => {
  describe('#getGitHubActionsUrl', () => {
    it('should return github actions url', () => {
      const owner = 'testOwner';
      const repository = 'testRepository';

      const response = getGitHubActionsUrl(owner, repository);

      expect(response).to.equal(
        `https://api.github.com/repos/${owner}/${repository}/dispatches`
      );
    });
  });

  describe('#getHeaders', () => {
    it('should create headers with Authorization', () => {
      const authorization = 'token test';

      const response = getHeaders(authorization);

      expect(response).to.deep.equal({ Authorization: authorization });
    });
  });

  describe('#getResponse', () => {
    it('should create response', () => {
      const statusCode = 400;
      const body = 'body test';

      const response = getResponse(statusCode, body);

      const expectedResponse = {
        statusCode,
        headers: {
          'Content-Type': 'text/html',
        },
        body,
      };
      expect(response).to.deep.equal(expectedResponse);
    });
  });

  describe('#handler', () => {
    describe('when query params are missing', () => {
      [
        { queryStringParameters: {} },
        { queryStringParameters: { owner: 'owner' } },
        { queryStringParameters: { owner: 'owner', repository: 'repo' } },
        {
          queryStringParameters: {
            owner: 'owner',
            repository: 'repo',
            event_type: undefined,
          },
        },
      ].forEach((testCase) => {
        it('should return bad request', async () => {
          const event = {
            queryStringParameters: testCase.queryStringParameters,
          };

          const response = await handler(event);

          const expectedResponse = {
            statusCode: 400,
            headers: {
              'Content-Type': 'text/html',
            },
            body: 'Bad Request: need owner, repository and event_type in query parameters',
          };
          expect(response).to.deep.equal(expectedResponse);
        });
      });
    });

    describe('when authorization headers is missing', () => {
      it('should return 400 - Bad Request', async () => {
        const event = {
          queryStringParameters: {
            owner: 'owner',
            repository: 'repo',
            event_type: 'event',
          },
          headers: {},
        };

        const response = await handler(event);

        const expectedResponse = {
          statusCode: 400,
          headers: {
            'Content-Type': 'text/html',
          },
          body: 'Bad Request: need Authorization headers with GitHub PAT',
        };
        expect(response).to.deep.equal(expectedResponse);
      });
    });

    describe('when github api call failed', () => {
      it('should return 500', async () => {
        const event = {
          queryStringParameters: {
            owner: 'owner',
            repository: 'repo',
            event_type: 'event',
          },
          headers: {
            Authorization: 'token github PAT',
          },
        };
        const url = 'https://api.github.com';
        const endpoint = `/repos/${event.queryStringParameters.owner}/${event.queryStringParameters.repository}/dispatches`;
        const scope = nock(url)
          .post(endpoint, {
            event_type: event.queryStringParameters.event_type,
          })
          .reply(500);
        sinon.stub(console, 'log');

        const response = await handler(event);

        const expectedResponse = {
          statusCode: 500,
          headers: {
            'Content-Type': 'text/html',
          },
          body: 'Failed to call GitHub Actions',
        };
        scope.done();
        expect(response).to.deep.equal(expectedResponse);
      });
    });

    it('should forward request to github', async () => {
      const event = {
        queryStringParameters: {
          owner: 'owner',
          repository: 'repo',
          event_type: 'event',
        },
        headers: {
          Authorization: 'token github PAT',
        },
      };
      const url = 'https://api.github.com';
      const endpoint = `/repos/${event.queryStringParameters.owner}/${event.queryStringParameters.repository}/dispatches`;
      const scope = nock(url)
        .post(endpoint, { event_type: event.queryStringParameters.event_type })
        .reply(200, {});
      sinon.stub(console, 'log');

      const response = await handler(event);

      const expectedResponse = {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html',
        },
        body: {},
      };
      scope.done();
      expect(response).to.deep.equal(expectedResponse);
    });
  });
});
