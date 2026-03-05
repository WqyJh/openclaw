import type { ImageDescriptionRequest, ImageDescriptionResult } from "../../types.js";
import { describeImageWithModel } from "../image.js";

const DEFAULT_XIAOMI_IMAGE_MODEL = "mimo_omni";

export async function describeXiaomiImage(
  params: ImageDescriptionRequest,
): Promise<ImageDescriptionResult> {
  // Force model to mimo_omni for image — mimo-pro doesn't support image input.
  // The runner may pass the active text model (e.g. mimo-0218_pro), which we override here.
  return describeImageWithModel({
    ...params,
    model: DEFAULT_XIAOMI_IMAGE_MODEL,
  });
}
