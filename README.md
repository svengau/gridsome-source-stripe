# Gridsome Source for Stripe

Source plugin for fetching data from [Stripe](https://stripe.com/) into [Gridsome](https://gridsome.org/).

## Install

`npm install --save gridsome-source-stripe`

## How to use

```javascript
// In your gridsome.config.js
plugins: [
  {
    use: 'gridsome-source-stripe',
    options: {
      objectTypes: { product: { expand: ['data.skus'] }, plans: {</* query options for plans */>} },
      secretKey: 'xxxxxxxxx',
      // optional params
      stripeOptions: {},
      downloadFiles: true,
      imageDirectory: 'stripe_images',
    },
  },
];
```

if downloadFiles is `true` the plugin will download all assets associated to fields `image` and `images` into `imageDirectory`.

## How to query and filter

For example, you can query the product nodes created from Stripe with the following:

```javascript
query products {
  allStripeProduct {
    edges {
      node {
        id
        name
        createdAt(format: "DD MMMM, YYYY")
      }
    }
  }
}
```

and you can filter specific node using this:

```javascript
query product($id: String!) {
  stripeProduct(id: $id) {
    id
    name
  }
}
```

## Sponsor

This plugin has been developed with the kind support of [Fullstack Rocket](https://www.fullstackrocket.com/)
