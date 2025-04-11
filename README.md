# Image Generation Models on OpenShift

In this repo you will find resources, demos, recipes... to work with Image Generation Models (IGM) on OpenShift with OpenShift AI or Open Data Hub.

Follow [this walkthrough](https://ai-on-openshift.io/generative-ai/building-an-image-generation-app/) to use the files in this repository.

## Content

The following Serving Runtimes for IGMs can be deployed on OpenShift, either standalone or using OpenShift AI.

- [SDXL](./sdxl/Readme.md): a custom runtime to deploy the Stable Diffusion XL model (or models from the same family).
- [StableDiffusionSafetyChecker](./stabe-diffusion-safety-checker/README.md): a custom runtime and examples to deploy and run the Stable Diffusion Safety Checker for classifying images as NSFW or safe.