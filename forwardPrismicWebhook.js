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
			'Content-Type': 'text/html'
		},
		body
	};
}

exports.handler = async (event) => {
	const { owner, repository } = event.queryStringParameters;
	const url = getGitHubActionsUrl(owner, repository);
	const headers = getHeaders(event.headers.authorization);
	const data = { event_type: 'deploy' };

	try {
		const response = await axios.post(url, data, { headers });
		return getResponse(200, response.data);
	} catch(err) {
		console.log(err);
		return getResponse(500, "Failed to call GitHub Actions");
	}
};
