import kserve
import numpy as np
import base64
from io import BytesIO
from typing import Dict
import numpy as np

from diffusers import StableDiffusionXLPipeline
from diffusers.pipelines.stable_diffusion import StableDiffusionSafetyChecker
from transformers import CLIPImageProcessor, CLIPTokenizer, CLIPModel
import torch 
import torch.nn as nn
from torchvision.transforms.functional import pil_to_tensor, to_pil_image
from PIL import Image as PIL_Image

from kserve import InferResponse, InferRequest
from kserve.logging import logger
from kserve.utils.utils import get_predict_response

class SafetyChecker(kserve.Model):
    def __init__(self, name: str):
        super().__init__(name)
        self.name = name
        self.ready = True
        self.modify = True

        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.dtype=torch.float16

        self.feature_extractor = CLIPImageProcessor.from_pretrained("openai/clip-vit-base-patch32")
        self.safety_checker = StableDiffusionSafetyChecker.from_pretrained(
            "CompVis/stable-diffusion-safety-checker").to(self.device)

        if self.modify:
            image_to_ban = PIL_Image.open("green-fedora.png").convert("RGB")
            self.add_nsfw_embedding(image_to_ban, 0.6)

    def add_nsfw_embedding(self, image: PIL_Image, weight: int):
        safety_checker_input = self.feature_extractor(image, return_tensors="pt").to(self.device)

        pooled_output  = self.safety_checker.vision_model(safety_checker_input.pixel_values.to(self.dtype))[1]
        image_embeds = self.safety_checker.visual_projection(pooled_output)
        
        self.safety_checker.concept_embeds = nn.Parameter(torch.cat([self.safety_checker.concept_embeds, image_embeds]))
        self.safety_checker.concept_embeds_weights = nn.Parameter(torch.cat([self.safety_checker.concept_embeds_weights, torch.Tensor([0.6]).to(self.device)]))


    def predict(self,
        payload: InferRequest,
        headers: Dict[str, str] = None,
        response_headers: Dict[str, str] = None,
    ) -> InferResponse:

        logger.info(payload)

        image_data = payload.inputs[0].data

        logger.info(image_data)

        # Decode the base64 image
        image_bytes = base64.b64decode(image_data[0])
        image = PIL_Image.open(BytesIO(image_bytes)).convert("RGB")

        safety_checker_input = self.feature_extractor(image, return_tensors="pt").to(self.device)
        image, has_nsfw_concept = self.safety_checker(
            images=pil_to_tensor(image).unsqueeze(0), clip_input=safety_checker_input.pixel_values.to(self.dtype)
        )
        return get_predict_response(payload, np.asarray(has_nsfw_concept), self.name)