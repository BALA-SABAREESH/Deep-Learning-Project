export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export type DetectionClass =
  | 'person'
  | 'helmet'
  | 'no_helmet'
  | 'vest'
  | 'no_vest'
  | 'worker_compliant'
  | 'worker_violation';

export interface DetectionItem {
  id: string;
  class_name: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
  is_violation: boolean;
  color: string;
  label: string;
  associated_worker_id?: string;
}

export interface WorkerCompliance {
  worker_id: string;
  bbox: [number, number, number, number];
  has_helmet: boolean;
  has_vest: boolean;
  is_compliant: boolean;
  violations: string[];
}

export interface ImageAnalysisResponse {
  success: boolean;
  image_id: string;
  filename: string;
  image_width: number;
  image_height: number;
  processing_time_ms: number;
  model_mode: 'custom_ppe' | 'yolo_heuristics' | 'coco_standard';
  model_name: string;
  annotated_image_url?: string;
  annotated_image_base64?: string;
  counts: {
    total_persons: number;
    helmets: number;
    missing_helmets: number;
    vests: number;
    missing_vests: number;
    compliant_workers: number;
    violation_workers: number;
  };
  compliance_percentage: number;
  detections: DetectionItem[];
  workers: WorkerCompliance[];
  summary: string;
}

export interface VideoAnalysisResponse {
  success: boolean;
  video_id: string;
  filename: string;
  video_url: string;
  total_frames: number;
  processed_frames: number;
  fps: number;
  processing_time_s: number;
  model_name: string;
  summary: {
    total_persons_detected: number;
    total_helmet_violations: number;
    total_vest_violations: number;
    average_compliance_percentage: number;
    peak_concurrent_workers: number;
  };
  frame_samples?: {
    frame_number: number;
    timestamp_s: number;
    compliance_rate: number;
    violations_count: number;
  }[];
}

export interface ModelInfoResponse {
  model_name: string;
  model_type: 'custom_ppe' | 'yolo_standard';
  weights_loaded: boolean;
  weights_path: string;
  supported_classes: string[];
  detection_classes_breakdown: {
    equipment: string[];
    violations: string[];
    subjects: string[];
  };
  confidence_threshold: number;
  iou_threshold: number;
  inference_device: string;
  status_message: string;
  recommended_custom_weights: string;
}

export interface AnalysisRecord {
  id: string;
  timestamp: string;
  type: 'image' | 'video';
  filename: string;
  previewUrl: string;
  annotatedUrl?: string;
  total_persons: number;
  helmet_violations: number;
  vest_violations: number;
  compliance_percentage: number;
  processing_time: string;
  model_mode: string;
  status: 'compliant' | 'warning' | 'critical';
  details?: ImageAnalysisResponse | VideoAnalysisResponse;
}
