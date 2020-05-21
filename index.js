const Stripe = require('stripe');
const slugify = require('slugify');
const fs = require('fs');
const path = require('path');
const https = require('https');
const debug = require('debug')('gridsome-source-stripe');

// https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore
const upperFirst = string => {
  return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
};

const createDirectory = dir => {
  const pwd = path.join(process.cwd(), dir);

  if (!fs.existsSync(pwd)) {
    fs.mkdirSync(pwd);
  }

  return pwd;
};

class StripeSource {
  static defaultOptions() {
    return {
      typeName: 'Stripe',
      objectTypes: { product: { expand: ['data.skus'] } },
      secretKey: null,
      stripeOptions: {},
      downloadFiles: false,
      imageDirectory: 'stripe_images',
    };
  }

  constructor(api, options) {
    this.options = options;
    api.loadSource(args => this.fetchContent(args));
  }

  async downloadImage(pwd, prefix, imageUrl) {
    if (!imageUrl) {
      return null;
    }
    const filename = `${prefix}_${imageUrl
      .split('/')
      .pop()
      .toLowerCase()}`;
    const filePath = path.resolve(pwd, filename);

    if (fs.existsSync(filePath)) {
      debug(`Image ${filename} already downloaded `);
      return filePath;
    }

    return new Promise((resolve, reject) => {
      debug(`Downloading ${imageUrl}`);
      const file = fs.createWriteStream(filePath);

      https
        .get(imageUrl, response => {
          response.pipe(file);
          file.on('finish', () => {
            console.info('Download finished!');
            file.close(() => resolve(filePath));
          });
        })
        .on('error', err => {
          console.error(`Error on processing image ${filename}`);
          console.error(err.message);
          fs.unlink(filePath, err => {
            if (err) {
              reject(err);
            }

            debug(`Removed the ${filePath} image correct`);
            resolve(filePath);
          });
        });
    });
  }

  async fetchContent(store) {
    const { addCollection } = store;
    const {
      downloadFiles,
      typeName,
      objectTypes,
      secretKey,
      stripeOptions,
    } = this.options;

    const stripe = new Stripe(secretKey, {
      appInfo: {
        name: 'Gridsome Stripe Source Plugin',
        version: '0.0.1',
        url: 'https://github.com/svengau/gridsome-source-stripe',
      },
      ...stripeOptions,
    });

    let pwd;
    if (downloadFiles) {
      pwd = createDirectory(this.options.imageDirectory);
    }

    return Promise.all(
      Object.entries(objectTypes).map(([objectType, options]) =>
        stripe[objectType + 's']
          .list({
            limit: 100,
            ...options,
          })
          .then(async ({ data }) => {
            const contentType = addCollection({
              typeName: `${typeName}${upperFirst(objectType)}`,
            });
            if (downloadFiles) {
              await Promise.all(
                data.map(async node => {
                  if (node.images) {
                    node.images = await Promise.all(
                      node.images.map(image =>
                        this.downloadImage(pwd, node.id, image)
                      )
                    );
                  }
                  if (node.image) {
                    node.image = await this.downloadImage(
                      pwd,
                      node.id,
                      node.image
                    );
                  }
                })
              );
            }

            data.map(async node => {
              if (node.name) {
                node.slug = slugify(node.name, { lower: true });
              }
              debug(`Add node ${node.object} ${node.id}`);
              return contentType.addNode(node);
            });
          })
      )
    );
  }
}

module.exports = StripeSource;
