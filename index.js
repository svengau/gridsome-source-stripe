const Stripe = require('stripe');

// https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore
const upperFirst = (string) => {
  return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
};

class StripeSource {
  static defaultOptions() {
    return {
      typeName: 'Stripe',
      objectTypes: { products: { expand: ['data.skus'] } },
      secretKey: null,
      stripeOptions: {},
    };
  }

  constructor(api, options) {
    this.options = options;
    api.loadSource((args) => this.fetchContent(args));
  }

  async fetchContent(store) {
    const { addCollection } = store;
    const { typeName, objectTypes, secretKey, stripeOptions } = this.options;

    const stripe = new Stripe(secretKey, {
      appInfo: {
        name: 'Gridsome Stripe Source Plugin',
        version: '0.0.1',
        url: 'https://github.com/svengau/gridsome-source-stripe',
      },
      ...stripeOptions,
    });

    await Promise.all(
      Object.entries(objectTypes).map(([objectType, options]) =>
        stripe[objectType]
          .list({
            limit: 100,
            ...options,
          })
          .then(({ data }) => {
            const contentType = addCollection({
              typeName: `${typeName}${upperFirst(objectType)}`,
            });
            data.forEach((item) => contentType.addNode(item));
          })
      )
    );
  }
}

module.exports = StripeSource;
