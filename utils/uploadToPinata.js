const pinataSdk = require("@pinata/sdk");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const pinata = pinataSdk(
  process.env.PINATA_API_KEY,
  process.env.PINATA_API_SECRET
);

async function storeImages(imagesFilePath) {
  // if your image path is ./images/randomNft/imagename.png then path.resolve() will give you full
  // image path
  const fullImagePath = await path.resolve(imagesFilePath);

  // fs.readdirSync(path) will read all the files in the directory of the path.
  const files = fs.readdirSync(fullImagePath);
  //console.log(files);
  let responses = [];
  for (fileIndex in files) {
    console.log(`upload fileIndex at position ${fileIndex}`);

    // creating a file stream as images are loads of bytes that can be read by only via stream
    const readFileStream = fs.createReadStream(
      `${fullImagePath}/${files[fileIndex]}`
    );

    try {
      const response = await pinata.pinFileToIPFS(readFileStream);
      responses.push(response);
    } catch (error) {
      console.log(`Error in image upload: ${error}`);
    }
  }
  return { responses, files };
}

async function storeMetadata(metadata) {
  try {
    const response = await pinata.pinJSONToIPFS(metadata);
    return response;
  } catch (error) {
    console.log(`Error in metadata upload: ${error}`);
  }
  return null;
}

module.exports = { storeImages, storeMetadata };
