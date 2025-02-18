export interface Payload {
  prompt: string;
  guidance_scale: number;
  num_inference_steps: number;
  crops_coords_top_left: [number, number];
  width: number;
  height: number;
  denoising_limit: number;
  past_threshold: boolean;
  image_failed_check: boolean;
}