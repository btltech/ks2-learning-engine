// Cloudflare Pages Function - serves the Kokoro-82M text-to-speech model files.
// The R2 bucket stays private; only an allow-listed set of model files is exposed.
// The ~90MB model is over Pages' 25MB static asset limit, so it lives in R2.

type PagesFunction<E = unknown> = (context: {
  request: Request;
  env: E;
  params: Record<string, string | string[]>;
}) => Response | Promise<Response>;

interface Env {
  APP_AUDIO?: R2Bucket;
}

const MODEL_PREFIX = 'models/kokoro-82m-v1.0';
const ALLOWED_FILES = /^(config\.json|tokenizer\.json|tokenizer_config\.json|onnx\/model_quantized\.onnx|voices\/(bf|bm)_[a-z]+\.bin)$/;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  if (!env.APP_AUDIO) return json(503, { error: 'App audio storage is not configured' });

  // URL shape: /api/kokoro-model/<model id>/<file path>; the model id segment is fixed by the worker.
  const segments = Array.isArray(params.path) ? params.path : [params.path];
  const [modelId, ...rest] = segments;
  const file = rest.join('/');
  if (modelId !== 'v1.0' || !ALLOWED_FILES.test(file)) return json(404, { error: 'Not found' });

  const object = await env.APP_AUDIO.get(`${MODEL_PREFIX}/${file}`);
  if (!object) return json(404, { error: 'Model file not found' });

  const headers = new Headers({
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
  });
  if (object.httpEtag) headers.set('ETag', object.httpEtag);
  if (object.size !== undefined) headers.set('Content-Length', String(object.size));
  return new Response(object.body, { status: 200, headers });
};
