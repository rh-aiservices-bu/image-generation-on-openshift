import config from '@app/config';
import * as React from 'react';
import axios from 'axios';
import Emitter from '../../utils/emitter';
import DocumentRenderer from '../DocumentRenderer/DocumentRenderer';
import { Page, PageSection, Text, TextContent, TextVariants, Flex, FlexItem, Button, Card, Form, FormGroup, CardTitle, CardBody, TextArea, ActionGroup, FormSelect, FormSelectOption, Slider, SliderOnChangeEvent, Popover, Progress, ProgressMeasureLocation } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import styles from '@patternfly/react-styles/css/components/Form/form';

interface SDXLMiniStudioProps { }

class GenerateParameters {
  prompt: string;
  guidance_scale: number;
  num_inference_steps: number;
  crops_coords_top_left: number[];
  width: number;
  height: number;
  denoising_limit: number;

  constructor(
    prompt: string = '',
    guidance_scale: number = 8.0,
    num_inference_steps: number = 40,
    crops_coords_top_left: number[] = [0, 0],
    width: number = 1024,
    height: number = 1024,
    denoising_limit: number = 0.8
  ) {
    this.prompt = prompt;
    this.guidance_scale = guidance_scale;
    this.num_inference_steps = num_inference_steps;
    this.crops_coords_top_left = crops_coords_top_left;
    this.width = width;
    this.height = height;
    this.denoising_limit = denoising_limit;
  }
}

const SDXLMiniStudio: React.FunctionComponent<SDXLMiniStudioProps> = () => {

  const [imagePanelTitle, setImagePanelTitle] = React.useState('Instructions');
  const [documentRendererVisible, setDocumentRendererVisible] = React.useState(false);
  const [progressVisible, setProgressVisible] = React.useState(false);

  const [generateParameters, setGenerateParameters] = React.useState<GenerateParameters>(new GenerateParameters());
  const handleGenerateParametersChange = (value, field) => {
    setGenerateParameters(prevState => ({
      ...prevState,
      [field]: value,
    }));;
  }

  const [prompt, setPrompt] = React.useState('');
  const handlePromptChange = (_event: React.FormEvent<HTMLTextAreaElement>, value: string) => {
    setPrompt(value);
    handleGenerateParametersChange(value, 'prompt');
  }

  const sizeOptions = [
    { value: 'standard', label: 'Standard, 1:1, 1024 x 1024' },
    { value: 'vertical', label: 'Vertical, 4:7, 768 x 1344' },
    { value: 'portrait', label: 'Portrait, 9:9, 896 x 1152' },
    { value: 'photo', label: 'Photo, 9:7, 1152 x 896' },
    { value: 'landscape', label: 'Landscape, 19:13, 1216 x 832' },
    { value: 'widescreen', label: 'Widescreen, 7:4, 1344 x 768' },
    { value: 'cinematic', label: 'Cinematic, 12:5, 1536 x 640' },
  ];
  const [sizeOption, setSizeOption] = React.useState('standard');
  const handleSizeOptionChange = (_event: React.FormEvent<HTMLSelectElement>, value: string) => {
    switch (value) {
      case 'standard':
        handleGenerateParametersChange(1024, 'width');
        handleGenerateParametersChange(1024, 'height');
        break;
      case 'vertical':
        handleGenerateParametersChange(768, 'width');
        handleGenerateParametersChange(1344, 'height');
        break;
      case 'portrait':
        handleGenerateParametersChange(896, 'width');
        handleGenerateParametersChange(1152, 'height');
        break;
      case 'photo':
        handleGenerateParametersChange(1152, 'width');
        handleGenerateParametersChange(896, 'height');
        break;
      case 'landscape':
        handleGenerateParametersChange(1216, 'width');
        handleGenerateParametersChange(832, 'height');
        break;
      case 'widescreen':
        handleGenerateParametersChange(1344, 'width');
        handleGenerateParametersChange(768, 'height');
        break;
      case 'cinematic':
        handleGenerateParametersChange(1536, 'width');
        handleGenerateParametersChange(640, 'height');
        break;
    }
    setSizeOption(value);
  }

  const [guidance_scale, setGuidanceScale] = React.useState(8.0);
  const handleGuidanceScaleChange = (_event: SliderOnChangeEvent, value: number) => {
    setGuidanceScale(value);
    handleGenerateParametersChange(value, 'guidance_scale');
  }

  const [num_inference_steps, setNumInferenceSteps] = React.useState(40);
  const handleNumInferenceStepsChange = (_event: SliderOnChangeEvent, value: number) => {
    setNumInferenceSteps(value);
    handleGenerateParametersChange(value, 'num_inference_steps');
  }

  const [denoising_limit, setDenoisingLimit] = React.useState(80);
  const handleDenoisingLimitChange = (_event: SliderOnChangeEvent, value: number) => {
    setDenoisingLimit(value);
    handleGenerateParametersChange(value / 100, 'denoising_limit');
  }

  const [fileData, setFileData] = React.useState('');
  const [fileName, setFileName] = React.useState('');
  const [phase, setPhase] = React.useState('Base');
  const [baseStep, setBaseStep] = React.useState(0);
  const [refinerStep, setRefinerStep] = React.useState(0);

  const handleGenerateImage = (event) => {
    event.preventDefault();
    setImagePanelTitle('Sending generation request');
    setDocumentRendererVisible(true);
    Emitter.emit('notification', {
      variant: 'success',
      title: '',
      description: 'Generation request sent! Please wait...',
    });

    axios
      .post(`${config.backend_api_url}/generate`, generateParameters)
      .then((response) => {
        // Extract the job_id from the response.
        const { job_id } = response.data;
        if (!job_id) {
          Emitter.emit('notification', {
            variant: 'warning',
            title: '',
            description: 'No job_id received from backend!',
          });
          return;
        }

        // Create the WebSocket URL derived from backend API.
        const wsProtocol = config.backend_api_url.startsWith('https') ? 'wss' : 'ws';
        const backendHost = config.backend_api_url.replace(/^https?:\/\//, '');
        const wsUrl = `${wsProtocol}://${backendHost}/generate/progress/${job_id}`;

        // Open a WebSocket connection.
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('WebSocket connected for job_id:', job_id);
        };

        ws.onmessage = (messageEvent) => {
          try {
            const msg = JSON.parse(messageEvent.data);

            // If this is a queue update, update queue info.
            if (msg.status && msg.status === 'queued') {
              if (msg.position === -1) {
                setImagePanelTitle('Image generation is starting...');
              } else if (msg.position === 1) {
                setImagePanelTitle('You are next! (#1 in the queue)');
              }
              else {
                setImagePanelTitle('Currently serving others, you are #' + msg.position + ' in the queue.');
              }
              setProgressVisible(false);
              setFileName('');
              setFileData('');
            }

            // If this is a progress update, update UI elements.
            if (msg.status && msg.status === 'progress') {
              setImagePanelTitle('The image is being generated...');
              setProgressVisible(true);
              if (msg.pipeline && msg.pipeline === 'base') {
                setPhase('Base');
                setBaseStep(msg.step + 1);
              }
              if (msg.pipeline && msg.pipeline === 'refiner') {
                setPhase('Refiner');
                setRefinerStep(msg.step + 1);
              }

              setFileName('new_image.png');
              setFileData(msg.image);
            }

            // If the job is complete, update the image data and close the WebSocket.
            if (msg.status && msg.status === 'completed') {
              setProgressVisible(false);
              setBaseStep(0);
              setRefinerStep(0);
              setFileName('new_image.png');
              setFileData(msg.image);
              setImagePanelTitle('Image generated in ' + msg.processing_time.toFixed(1) + ' seconds');
              Emitter.emit('notification', {
                variant: 'success',
                title: '',
                description: 'Image generated!',
              });
              ws.close();
            }
          } catch (err) {
            console.error('Error parsing message from WebSocket:', err);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          Emitter.emit('notification', {
            variant: 'warning',
            title: '',
            description: 'WebSocket error occurred.',
          });
        };

        ws.onclose = () => {
          console.log('WebSocket connection closed.');
        };
      })
      .catch((error) => {
        setDocumentRendererVisible(false);
        Emitter.emit('notification', {
          variant: 'warning',
          title: '',
          description:
            'Connection failed with the error: ' +
            (error.response && error.response.data && error.response.data.message 
              ? error.response.data.message
              : error.message),
        });
      });
  };


  const handleReset = (event) => {
    event.preventDefault();
    setDocumentRendererVisible(false);
    setGenerateParameters(new GenerateParameters());
    setPrompt('');
    setImagePanelTitle('Instructions');
    setSizeOption('standard');
    setGuidanceScale(8.0);
    setNumInferenceSteps(40);
    setDenoisingLimit(80);
    setBaseStep(0);
    setRefinerStep(0);
    setFileData('');
    setFileName('');
  }

  return (
    <Page className='sdxl-ministudio'>
      <PageSection>
        <TextContent>
          <Text component={TextVariants.h1}>SDXL Mini Studio</Text>
        </TextContent>
      </PageSection>
      <PageSection>
        <Flex>
          <FlexItem flex={{ default: 'flex_1' }}>
            <Card component="div">
              <CardTitle>Parameters</CardTitle>
              <CardBody>
                <Form onSubmit={handleGenerateImage}>
                  <FormGroup
                    label="Prompt"
                    fieldId="prompt"
                    labelIcon={
                      <Popover
                        headerContent={
                          <div>
                            The description of the image to generate.
                          </div>
                        }
                        bodyContent={
                          <div>
                            <p>Describe what you want to generate.</p>
                            <p>For example, "A beautiful sunset over the ocean with a sailboat in the distance".</p>
                            <p>Here is a <a href="https://blog.segmind.com/prompt-guide-for-stable-diffusion-xl-crafting-textual-descriptions-for-image-generation/" target="_blank" rel="noreferrer">full guide</a> for Stable Diffusion XL prompting.</p>
                          </div>
                        }
                      >
                        <button
                          type="button"
                          aria-label="More info for name field"
                          onClick={(e) => e.preventDefault()}
                          aria-describedby="simple-form-name-02"
                          className={styles.formGroupLabelHelp}
                        >
                          <HelpIcon />
                        </button>
                      </Popover>
                    }>
                    <TextArea
                      value={prompt}
                      id="prompt"
                      name="prompt"
                      aria-label="prompt"
                      placeholder="Describe what you want to generate"
                      onChange={handlePromptChange}
                    />
                  </FormGroup>
                  <FormGroup
                    label="Size"
                    fieldId="size"
                    labelIcon={
                      <Popover
                        headerContent={
                          <div>
                            The size of the image to generate.
                          </div>
                        }
                        bodyContent={
                          <div>
                            <p>SDXL can only generate images of predefined sizes.</p>
                            <p>Select one.</p>
                          </div>
                        }
                      >
                        <button
                          type="button"
                          aria-label="More info for name field"
                          onClick={(e) => e.preventDefault()}
                          aria-describedby="simple-form-name-02"
                          className={styles.formGroupLabelHelp}
                        >
                          <HelpIcon />
                        </button>
                      </Popover>
                    }>
                    <FormSelect
                      value={sizeOption}
                      id="size"
                      name="size"
                      aria-label="size"
                      onChange={handleSizeOptionChange}
                    >
                      {sizeOptions.map((option, index) => (
                        <FormSelectOption key={index} value={option.value} label={option.label} />
                      ))}
                    </FormSelect>
                  </FormGroup>
                  <FormGroup
                    label={`Guidance Scale: ${guidance_scale}`}
                    fieldId="guidance_scale"
                    labelIcon={
                      <Popover
                        bodyContent={
                          <div>
                            <p><b>Guidance scale</b> is a parameter that controls the balance between adhering to the provided text prompt and the inherent "creativity" or randomness of the model.</p>
                            <p>
                              <ul>
                                <li><b>Low guidance scale</b>: The model has more creative freedom, and the resulting image may not closely match the prompt but can introduce unexpected details.</li>
                                <li><b>High guidance scale</b>: The model is more constrained by the prompt, leading to images that align more strictly with the given description but may be less varied or imaginative.</li>
                              </ul>
                            </p>
                          </div>
                        }
                      >
                        <button
                          type="button"
                          aria-label="More info for name field"
                          onClick={(e) => e.preventDefault()}
                          aria-describedby="simple-form-name-02"
                          className={styles.formGroupLabelHelp}
                        >
                          <HelpIcon />
                        </button>
                      </Popover>
                    }>
                    <Slider
                      id="guidance_scale"
                      value={guidance_scale}
                      onChange={handleGuidanceScaleChange}
                      aria-labelledby="Guidance Scale"
                      hasTooltipOverThumb
                      min={0}
                      max={20}
                      step={0.5}
                    />
                  </FormGroup>
                  <FormGroup
                    label={`Number of Inference Steps: ${num_inference_steps}`}
                    fieldId="num_inference_steps"
                    labelIcon={
                      <Popover
                        bodyContent={
                          <div>
                            <p>
                              <b>Number of inference steps</b> is a parameter that controls the number of steps the model takes to generate an image.
                            </p>
                            <p>
                              <ul>
                                <li><b>Low number of inference steps</b>: The model generates images more quickly but may produce lower-quality results.</li>
                                <li><b>High number of inference steps</b>: The model generates images more slowly but may produce higher-quality results.</li>
                              </ul>
                            </p>
                            <p>
                              A minimum of <b>30 steps</b> is recommended for high-quality results.
                            </p>
                          </div>
                        }
                      >
                        <button
                          type="button"
                          aria-label="More info for name field"
                          onClick={(e) => e.preventDefault()}
                          aria-describedby="simple-form-name-02"
                          className={styles.formGroupLabelHelp}
                        >
                          <HelpIcon />
                        </button>
                      </Popover>
                    }>
                    <Slider
                      id="num_inference_steps"
                      value={num_inference_steps}
                      onChange={handleNumInferenceStepsChange}
                      aria-labelledby="Number of Inference Steps"
                      hasTooltipOverThumb
                      min={10}
                      max={100}
                      step={1}
                    />
                  </FormGroup>
                  <FormGroup
                    label={`Denoising Limit: ${denoising_limit} %`}
                    fieldId="denoising_limit"
                    labelIcon={
                      <Popover
                        bodyContent={
                          <div>
                            <p>
                              Stable Diffusion XL uses two models: a diffusion model to generate the image and a denoising model to refine it.
                            </p>
                            <p>
                              The <b>denoising limit</b> parameter controls when the generation model passes over to the refining model.
                            </p>
                            <p>
                              With 40 steps and a denoising limit at 80%, 32 steps will be used for generation, and 8 for refinement.
                            </p>
                          </div>
                        }
                      >
                        <button
                          type="button"
                          aria-label="More info for name field"
                          onClick={(e) => e.preventDefault()}
                          aria-describedby="simple-form-name-02"
                          className={styles.formGroupLabelHelp}
                        >
                          <HelpIcon />
                        </button>
                      </Popover>
                    }>
                    <Slider
                      id="denoising_limit"
                      value={denoising_limit}
                      onChange={handleDenoisingLimitChange}
                      areCustomStepsContinuous
                      aria-labelledby="Denoising Limit"
                      hasTooltipOverThumb
                      min={1}
                      max={99}
                      step={1}
                    />
                  </FormGroup>
                  <ActionGroup>
                    <Button type="submit" variant="primary">Generate the image</Button>
                    <Button variant="secondary" onClick={handleReset}>Reset</Button>
                  </ActionGroup>
                </Form>
              </CardBody>
            </Card>
          </FlexItem>
          <FlexItem flex={{ default: 'flex_3' }}>
            <Card component="div">
              <CardTitle>{imagePanelTitle}</CardTitle>
              <CardBody>
                {progressVisible &&
                  <Progress
                    title="Generation progress"
                    value={baseStep + refinerStep}
                    valueText={`Step ${baseStep + refinerStep} out of ${num_inference_steps} - ${phase} phase`}
                    label={`Step ${baseStep + refinerStep} out of ${num_inference_steps} - ${phase} phase`}
                    max={generateParameters.num_inference_steps}
                    measureLocation={ProgressMeasureLocation.top}
                    style={{ paddingBottom: '1rem' }}
                  />
                }
                {documentRendererVisible && <DocumentRenderer fileData={fileData} fileName={fileName} width={generateParameters.width} height={generateParameters.height} />}
                {!documentRendererVisible && <p>Enter the description of the image to generate in the prompt, adjust the parameters if you want, and click on <b>Generate the image</b>.</p>}
              </CardBody>
            </Card>
          </FlexItem>
        </Flex>
      </PageSection>
    </Page>

  )
};

export default SDXLMiniStudio;