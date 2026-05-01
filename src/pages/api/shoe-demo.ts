import type { APIRoute } from 'astro';
import { Client } from '@gradio/client';

const HF_SPACE_REF = 'badgaitintin/shoedetclss';

function normalizeResult(data: unknown) {
  if (Array.isArray(data) && data.length === 1) {
    return data[0];
  }
  return data;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const inputImage = formData.get('input_image');

    if (!(inputImage instanceof File)) {
      return new Response(JSON.stringify({ ok: false, error: 'input_image is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = import.meta.env.HF_TOKEN || import.meta.env.HUGGINGFACE_TOKEN || import.meta.env.HF_SPACE_TOKEN;
    const client = await Client.connect(HF_SPACE_REF, token ? { token: token as `hf_${string}` } : undefined);
    const output = await client.predict('/predict', [inputImage]);

    return new Response(JSON.stringify({
      ok: true,
      data: normalizeResult(output.data),
      space: HF_SPACE_REF,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Shoe demo proxy error:', error);
    return new Response(JSON.stringify({
      ok: false,
      error: error?.message || 'Failed to run shoe demo inference',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};