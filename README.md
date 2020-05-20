# Gridsome Source for Stripe

Source plugin for fetching data into [Gridsome](https://gridsome.org/) from [Stripe](https://stripe.com/).

## Install

`npm install --save gridsome-source-stripe`

## How to use

```javascript
// In your gridsome.config.js
plugins: [
  {
    use: 'gridsome-source-stripe',
    options: {
      bucketSlug: 'gridsome-blog-stripe',
      objectTypes: { products: { expand: ['data.skus'] }, plans: {</* query options for plans */>} },
      secretKey: 'xxxxxxxxx',
    },
  },
];
```

## How to query and filter

You can query the nodes created from Cosmic JS with the following:

```javascript
query IndexQuery {
  allStripeProducts {
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
query query($id: String!) {
  stripeProducts(id: $id) {
    id
    name
  }
}
```
