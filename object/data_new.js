// TODO: Figure out why the bottom parts of the Float32Array is all 0 and what's the purpose
// of chunksize 
// Notice: when chunksize = 1 a piece of the training image shows up
// It seems like the larger the chunksize, the more non-zero terms in the ImageArray

const IMAGE_SIZE = 300 * 300 * 3;
const ROWS_PER_IMAGE = 300 * 300 * 3 / 100 / 100;
const NUM_CLASSES = 2;
const NUM_DATASET_ELEMENTS = 100 + 100;

const NUM_TRAIN_ELEMENTS = NUM_DATASET_ELEMENTS * 0.8;
const NUM_TEST_ELEMENTS = NUM_DATASET_ELEMENTS - NUM_TRAIN_ELEMENTS;

// This iamge is of shape 784 (28 * 28) * 65000, containing everything in MNIST
const MNIST_IMAGES_SPRITE_PATH =
    './data/sprite.png';
const MNIST_LABELS_PATH =
    './labels';

// console.log("data_new_new.js");

/**
 * A class that fetches the sprited MNIST dataset and returns shuffled batches.
 *
 * NOTE: This will get much easier. For now, we do data fetching and
 * manipulation manually.
 */
export class ObjectData {
  constructor() {
    this.shuffledTrainIndex = 0;
    this.shuffledTestIndex = 0;
  }

  async load() {
    // Make a request for the MNIST sprited image.
    const img = new Image(); // Javascript image
    const canvas = document.createElement('canvas'); // HTML canvas
    const ctx = canvas.getContext('2d');
    const imgRequest = new Promise((resolve, reject) => {
      img.crossOrigin = '';
      img.onload = () => {
        img.width = img.naturalWidth;
        img.height = img.naturalHeight;

        // console.log("sprite dimensions");
        // console.log(img.width);
        // console.log(img.height);

        // A Javascript arraybuffer is a fixed-length array of bytes
        const datasetBytesBuffer =
            new ArrayBuffer(NUM_DATASET_ELEMENTS * IMAGE_SIZE * 4);

        const chunkSize = 1; // single image
        canvas.width = img.width; //10000
        canvas.height = ROWS_PER_IMAGE * chunkSize; //27

        for (let i = 0; i < NUM_DATASET_ELEMENTS / chunkSize; i++) {
          // Store the arraybuffer in a viewable object
          const datasetBytesView = new Float32Array(
              datasetBytesBuffer, i * IMAGE_SIZE * chunkSize * 4,
              IMAGE_SIZE * chunkSize);
          ctx.drawImage(
              img, 0, i * ROWS_PER_IMAGE * chunkSize, img.width, ROWS_PER_IMAGE * chunkSize, 
              0, 0, img.width, ROWS_PER_IMAGE * chunkSize); // image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          // console.log("image data length is: ");
          // console.log(imageData.data.length); // should be 300 * 300 * 3 * 1 * 4, correct
          // console.log(datasetBytesView.length);
          
          // console.log(i * ROWS_PER_IMAGE * chunkSize);

          for (let j = 0; j < imageData.data.length / 4; j++) {
            // All channels hold an equal value since the image is grayscale, so
            // just read the red channel.
            datasetBytesView[j] = imageData.data[j * 4] / 255; // This needs to be reviewed
          }
        }
        // Here, finish parsing the sprite image into an array of images
        this.datasetImages = new Float32Array(datasetBytesBuffer); // array length is correct
        // console.log("Hello");
        // console.log(this.datasetImages);

        resolve();
      };
      img.src = MNIST_IMAGES_SPRITE_PATH;
    });

    const labelsRequest = fetch(MNIST_LABELS_PATH, {mode: 'no-cors'});
    const [imgResponse, labelsResponse] =
        await Promise.all([imgRequest, labelsRequest]);

    // this.datasetLabels = new Uint8Array(await labelsResponse.arrayBuffer());
    this.datasetLabels = new Float64Array(await labelsResponse.arrayBuffer()); // datatype matched the binary file
    this.datasetLabels = Array.from(this.datasetLabels);
    // console.log('data.js, MnistData, datasetLabels:')
    // console.log(typeof(this.datasetLabels));

    // Create shuffled indices into the train/test set for when we select a
    // random dataset element for training / validation.
    this.trainIndices = tf.util.createShuffledIndices(NUM_TRAIN_ELEMENTS);
    this.testIndices = tf.util.createShuffledIndices(NUM_TEST_ELEMENTS);

    // Slice the the images and labels into train and test sets.
    this.trainImages =
        this.datasetImages.slice(0, IMAGE_SIZE * NUM_TRAIN_ELEMENTS);
    this.testImages = this.datasetImages.slice(IMAGE_SIZE * NUM_TRAIN_ELEMENTS);
    this.trainLabels =
        this.datasetLabels.slice(0, NUM_CLASSES * NUM_TRAIN_ELEMENTS);
    this.testLabels =
        this.datasetLabels.slice(NUM_CLASSES * NUM_TRAIN_ELEMENTS);
  }

  nextTrainBatch(batchSize) {
    return this.nextBatch(
        batchSize, [this.trainImages, this.trainLabels], () => {
          this.shuffledTrainIndex =
              (this.shuffledTrainIndex + 1) % this.trainIndices.length;
          return this.trainIndices[this.shuffledTrainIndex];
        });
  }

  nextTestBatch(batchSize) {
    return this.nextBatch(batchSize, [this.testImages, this.testLabels], () => {
      this.shuffledTestIndex =
          (this.shuffledTestIndex + 1) % this.testIndices.length;
      return this.testIndices[this.shuffledTestIndex];
    });
  }

  nextBatch(batchSize, data, index) {
    const batchImagesArray = new Float32Array(batchSize * IMAGE_SIZE);
    const batchLabelsArray = new Float32Array(batchSize * NUM_CLASSES);

    for (let i = 0; i < batchSize; i++) {
      const idx = index();
      // console.log("idx: ");
      // console.log(idx);

      const image =
          data[0].slice(idx * IMAGE_SIZE, idx * IMAGE_SIZE + IMAGE_SIZE);
      // console.log("idx * image_size: ");
      // console.log(idx * IMAGE_SIZE);
      // const image = data[0].slice(37800, 37800 + 5);
      if (i < 5) {
        // console.log("data length: ");
        // console.log(data[0].length);
        // console.log("image: ");
        // console.log(image);
      }
      batchImagesArray.set(image, i * IMAGE_SIZE);

      const label =
          data[1].slice(idx * NUM_CLASSES, idx * NUM_CLASSES + NUM_CLASSES);
      batchLabelsArray.set(label, i * NUM_CLASSES);
    }
    // console.log("batchImagesArray: \n");
    // console.log(batchImagesArray);
    // console.log("batchLabelsArray: \n");
    // console.log(batchLabelsArray);

    const xs = tf.tensor2d(batchImagesArray, [batchSize, IMAGE_SIZE]);
    // console.log("xs: \n");
    // console.log(xs);
    const labels = tf.tensor2d(batchLabelsArray, [batchSize, NUM_CLASSES]);
    // console.log("labels: \n");
    // console.log(labels);

    return {xs, labels};
  }
}