const processedContentTypes = {
  'text/html': (text) => text,
  'text/plain': (text) => text,
  'application/json': (json) => json,
  'application/x-www-form-urlencoded': (data) =>
    Object.fromEntries(new URLSearchParams(data)),
};

export default processedContentTypes;
