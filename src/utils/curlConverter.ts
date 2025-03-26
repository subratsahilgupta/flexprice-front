export type SupportedLanguage = 'cURL' | 'Python' | 'JavaScript' | 'PHP' | 'Go' | 'Java' | 'Ruby' | 'Swift' | 'C#';

interface ParsedCurl {
	method: string;
	url: string;
	headers: Record<string, string>;
	body?: string;
}

const parseCurl = (curl: string): ParsedCurl => {
	const parsed: ParsedCurl = {
		method: 'GET',
		url: '',
		headers: {},
	};

	// Remove newlines and extra spaces
	const cleanCurl = curl.replace(/\\\n\s*/g, '').trim();
	const parts = cleanCurl.split(' ');

	for (let i = 1; i < parts.length; i++) {
		const part = parts[i];

		if (part === '--request' || part === '-X') {
			parsed.method = parts[++i];
		} else if (part === '--url') {
			parsed.url = parts[++i];
		} else if (part === '--header' || part === '-H') {
			const header = parts[++i].replace(/['"]/g, '');
			const [key, value] = header.split(':').map((s) => s.trim());
			parsed.headers[key] = value;
		} else if (part === '--data' || part === '-d') {
			parsed.body = parts[++i].replace(/['"]/g, '');
			if (!parsed.method) parsed.method = 'POST';
		}
	}

	return parsed;
};

const toPython = (parsed: ParsedCurl): string => {
	const headerStr = Object.entries(parsed.headers)
		.map(([k, v]) => `    '${k}': '${v}'`)
		.join(',\n');

	return `import requests

response = requests.${parsed.method.toLowerCase()}(
    '${parsed.url}',
    headers={
${headerStr}
    }${parsed.body ? `,\n    json=${parsed.body}` : ''}
)`;
};

const toJavaScript = (parsed: ParsedCurl): string => {
	const headerStr = Object.entries(parsed.headers)
		.map(([k, v]) => `    '${k}': '${v}'`)
		.join(',\n');

	return `fetch('${parsed.url}', {
  method: '${parsed.method}',
  headers: {
${headerStr}
  }${parsed.body ? `,\n  body: '${parsed.body}'` : ''}
})`;
};

const toPhp = (parsed: ParsedCurl): string => {
	const headerStr = Object.entries(parsed.headers)
		.map(([k, v]) => `  '${k}: ${v}'`)
		.join(',\n');

	return `<?php
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => '${parsed.url}',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => '${parsed.method}',
  CURLOPT_HTTPHEADER => array(
${headerStr}
  )${parsed.body ? `,\n  CURLOPT_POSTFIELDS => '${parsed.body}'` : ''}
));

$response = curl_exec($curl);
curl_close($curl);`;
};

const toGo = (parsed: ParsedCurl): string => {
	const headerStr = Object.entries(parsed.headers)
		.map(([k, v]) => `\treq.Header.Add("${k}", "${v}")`)
		.join('\n');

	return `package main

import (
    "fmt"
    "net/http"
    ${parsed.body ? '\n    "strings"' : ''}
)

func main() {
    client := &http.Client{}
    req, err := http.NewRequest("${parsed.method}", "${parsed.url}", ${parsed.body ? `strings.NewReader("${parsed.body}")` : 'nil'})
    if err != nil {
        fmt.Println(err)
        return
    }
${headerStr}

    resp, err := client.Do(req)
    if err != nil {
        fmt.Println(err)
        return
    }
    defer resp.Body.Close()
}`;
};

const toJava = (parsed: ParsedCurl): string => {
	const headerStr = Object.entries(parsed.headers)
		.map(([k, v]) => `        .header("${k}", "${v}")`)
		.join('\n');

	return `import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;

HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create("${parsed.url}"))
        .method("${parsed.method}", ${parsed.body ? `HttpRequest.BodyPublishers.ofString("${parsed.body}")` : 'HttpRequest.BodyPublishers.noBody()'})
${headerStr}
        .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());`;
};

export const convertCurlToLanguage = (curl: string, language: SupportedLanguage): string => {
	try {
		const parsed = parseCurl(curl);

		switch (language) {
			case 'Python':
				return toPython(parsed);
			case 'JavaScript':
				return toJavaScript(parsed);
			case 'PHP':
				return toPhp(parsed);
			case 'Go':
				return toGo(parsed);
			case 'Java':
				return toJava(parsed);
			default:
				return curl;
		}
	} catch (error) {
		console.error('Error converting curl command:', error);
		return `// Error converting to ${language}`;
	}
};
