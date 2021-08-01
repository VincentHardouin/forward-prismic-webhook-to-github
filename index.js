const axios = require('axios');

function getGitHubActionsUrl(owner, repository) {
  return `https://api.github.com/repos/${owner}/${repository}/dispatches`;
}

function getHeaders(authorization) {
  return {
    Authorization: authorization,
  };
}

function getResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'text/html',
    },
    body,
  };
}

async function handler(event) {
  const { owner, repository, event_type } = event.queryStringParameters;
  if (!owner || !repository || !event_type) {
    return getResponse(
      400,
      'Bad Request: need owner, repository and event_type in query parameters'
    );
  }
  if (!event.headers || !event.headers['Authorization']) {
    return getResponse(
      400,
      'Bad Request: need Authorization headers with GitHub PAT'
    );
  }
  const githubToken = event.headers['Authorization'];
  const url = getGitHubActionsUrl(owner, repository);
  const headers = getHeaders(githubToken);
  const data = { event_type };

  try {
    const response = await axios.post(url, data, { headers });
    return getResponse(200, response.data);
  } catch (err) {
    console.log(err);
    return getResponse(500, 'Failed to call GitHub Actions');
  }
}

if (process.env.NODE_ENV !== 'test') {
  module.exports = {
    getGitHubActionsUrl,
    getHeaders,
    getResponse,
    handler,
  };
} else {
  exports.handler = handler;
}
