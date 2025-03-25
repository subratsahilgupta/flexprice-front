const API_DOCS_URL = 'https://raw.githubusercontent.com/flexprice/flexprice-docs/main/api-reference/openapi.json';

/**
 * Fetch OpenAPI JSON from URL
 */
const fetchOpenApiJson = async (url) => {
	try {
		const response = await fetch(url);
		return await response.json();
	} catch (error) {
		console.error('❌ Error fetching OpenAPI JSON:', error);
	}
};

/**
 * Extract cURL commands filtered by a specific tag
 */
const extractCurlSnippetsByTag = (openApiJson, tag) => {
	const baseUrl = openApiJson?.servers?.[0]?.url || '';
	const snippets = [];

	Object.entries(openApiJson.paths).forEach(([path, methods]) => {
		Object.entries(methods).forEach(([method, details]) => {
			if (!details.tags || !details.tags.includes(tag)) return;

			let url = `${baseUrl}${path}`;
			let curlCommand = `curl --request ${method.toUpperCase()} \\\n--url "${url}" \\\n`;

			// Extract headers
			if (details?.parameters) {
				details.parameters
					.filter((p) => p.in === 'header')
					.forEach((header) => {
						curlCommand += `--header '${header.name}: <value>' \\\n`;
					});
			}

			// Extract query parameters
			let queryParams = details?.parameters?.filter((p) => p.in === 'query') || [];
			if (queryParams.length > 0) {
				const queryString = queryParams.map((q) => `${q.name}=<value>`).join('&');
				url += `?${queryString}`;
			}

			// Extract request body
			const requestBody =
				details?.requestBody?.content?.['application/json']?.example ||
				details?.requestBody?.content?.['application/json']?.schema?.example;

			if (requestBody) {
				curlCommand += `--header 'Content-Type: application/json' \\\n`;
				curlCommand += `--data '${JSON.stringify(requestBody, null, 2)}'`;
			}

			snippets.push(curlCommand);
		});
	});

	return snippets;
};

/**
 * Main function to execute in browser console
 */
const generateCurlForTag = async (tag) => {
	if (!tag) return console.error('❌ Please provide a tag!');

	console.log(`🔍 Fetching OpenAPI JSON...`);
	const openApiJson = await fetchOpenApiJson(API_DOCS_URL);
	if (!openApiJson) return;

	const snippets = extractCurlSnippetsByTag(openApiJson, tag);
	if (snippets.length === 0) {
		console.log(`❌ No API requests found for tag: "${tag}"`);
	} else {
		console.log(`✅ Found ${snippets.length} API requests for tag: "${tag}"`);
		snippets.forEach((curl, index) => console.log(`\n📌 Request ${index + 1}\n${curl}\n`));
	}
};

// Run this function in the browser console by calling:
generateCurlForTag('Customers');
