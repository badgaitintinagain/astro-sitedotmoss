import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@gradio/client';

const HF_SPACE_REF = 'badgaitintin/shoedetclss';
const HF_SPACE_URL = 'https://badgaitintin-shoedetclss.hf.space';

function normalizeResult(data: unknown) {
  if (Array.isArray(data) && data.length === 1) {
    return data[0];
  }
  return data;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const inputImage = formData.get('input_image');

    if (!(inputImage instanceof File)) {
      return NextResponse.json({ error: 'input_image is required' }, { status: 400 });
    }

    const token = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN || process.env.HF_SPACE_TOKEN;
    const client = await Client.connect(HF_SPACE_URL, token ? { token: token as `hf_${string}` } : undefined);
    const output = await client.predict('/predict', [inputImage]);

    return NextResponse.json({
      ok: true,
      data: normalizeResult(output.data),
      space: HF_SPACE_REF,
    });
  } catch (error: any) {
    console.error('Shoe demo proxy error:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Failed to run shoe demo inference' },
      { status: 500 }
    );
  }
}