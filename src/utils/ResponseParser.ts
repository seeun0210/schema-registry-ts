// utils/ResponseParser.ts

export function parseHttpResponse(response: string): {
  statusCode: number;
  body: string;
} {
  const [headerPart, ...bodyParts] = response.split("\r\n\r\n");
  const body = bodyParts.join("\r\n\r\n");
  const headerLines = headerPart.split("\r\n");
  const statusLine = headerLines.shift();
  if (!statusLine) {
    throw new Error("Invalid HTTP response: Missing status line");
  }
  const [protocol, statusCodeStr] = statusLine.split(" ");
  const statusCode = parseInt(statusCodeStr, 10);
  return { statusCode, body };
}
