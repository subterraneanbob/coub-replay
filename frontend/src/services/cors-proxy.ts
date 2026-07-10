async function corsProxyGet(url: string): Promise<Response> {
  const proxyResponse = await window.saucer.exposed.cors_proxy_get(url);

  if (proxyResponse.error) {
    throw new Error(proxyResponse.error);
  }

  const dataResponse = await fetch(proxyResponse.data);
  const data = await dataResponse.blob();

  return new Response(data.stream(), {
    status: proxyResponse.status,
    headers: {
      "Content-Type": data.type,
      "Content-Length": data.size.toString(),
    },
  });
}

export { corsProxyGet };
