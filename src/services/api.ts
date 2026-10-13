import {
  ImageAnalysisResponse,
  VideoAnalysisResponse,
  ModelInfoResponse,
} from '../types/detection';

const API_BASE = '/api';

export class ApiError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export async function checkBackendHealth(): Promise<{ status: string; uptime?: number; version?: string; detector?: string }> {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new ApiError(`Backend returned status ${res.status}`, res.status);
    }
    return await res.json();
  } catch (err: unknown) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      'Cannot connect to backend server. Ensure FastAPI is running on port 8000.'
    );
  }
}

export async function getModelInfo(): Promise<ModelInfoResponse> {
  try {
    const res = await fetch(`${API_BASE}/model/info`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new ApiError(`Failed to fetch model info (${res.status})`, res.status);
    }
    return await res.json();
  } catch (err: unknown) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Model info currently unavailable');
  }
}

export async function analyzeImage(file: File): Promise<ImageAnalysisResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${API_BASE}/detect/image`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      let errorMsg = `Detection failed with status ${res.status}`;
      try {
        const errorJson = await res.json();
        if (errorJson.detail) {
          errorMsg = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
        }
      } catch {
        // use fallback text
      }
      throw new ApiError(errorMsg, res.status);
    }

    return await res.json();
  } catch (err: unknown) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Network error while uploading image for analysis');
  }
}

export async function analyzeVideo(file: File): Promise<VideoAnalysisResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${API_BASE}/detect/video`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      let errorMsg = `Video analysis failed with status ${res.status}`;
      try {
        const errorJson = await res.json();
        if (errorJson.detail) {
          errorMsg = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
        }
      } catch {
        // use fallback text
      }
      throw new ApiError(errorMsg, res.status);
    }

    return await res.json();
  } catch (err: unknown) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Network error while processing video');
  }
}
