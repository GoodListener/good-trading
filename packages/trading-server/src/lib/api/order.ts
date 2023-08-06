import axios from '@nestjs/axios'
const { v4 : uuidv4 } = require("uuid")
const crypto = require('crypto')
const sign = require('jsonwebtoken').sign
const queryEncode = require("querystring").encode

const state = require('../state/state');

const access_key = process.env.UPBIT_API_KEY
const secret_key = process.env.UPBIT_API_SECRET
const server_url = process.env.UPBIT_API_URL

function findOrderChance() {
  const body = {
    market: state.market
  }

  const query = queryEncode(body)

  const hash = crypto.createHash('sha512')
  const queryHash = hash.update(query, 'utf-8').digest('hex')

  const payload = {
    access_key: access_key,
    nonce: uuidv4(),
    query_hash: queryHash,
    query_hash_alg: 'SHA512',
  }

  const token = sign(payload, secret_key)

  const options = {
    method: "GET",
    url: server_url + "/v1/orders/chance?" + query,
    headers: {Authorization: `Bearer ${token}`},
    json: body
  }

  return new Promise((res, rej) => {
    request(options, (error, response, body) => {
      if (error) rej(error);
      res(body)
    })
  });
}

function bidOrder(volume, price) {
  const body = {
    market: state.market,
    side: 'bid',
    volume: volume,
    price: price,
    ord_type: 'limit',
  }

  const query = queryEncode(body)

  const hash = crypto.createHash('sha512')
  const queryHash = hash.update(query, 'utf-8').digest('hex')

  const payload = {
    access_key: access_key,
    nonce: uuidv4(),
    query_hash: queryHash,
    query_hash_alg: 'SHA512',
  }

  const token = sign(payload, secret_key);

  const options = {
    method: "POST",
    url: server_url + "/v1/orders",
    headers: {Authorization: `Bearer ${token}`},
    json: body
  }

  return new Promise(res => {
    request(options, (error, response, body) => {
      if (error) throw new Error(error)
      res(body)
    })
  });
}

function askOrder(volume, price) {
  const body = {
    market: state.market,
    side: 'ask',
    volume: volume,
    price: price,
    ord_type: 'limit',
  }

  const query = queryEncode(body)

  const hash = crypto.createHash('sha512')
  const queryHash = hash.update(query, 'utf-8').digest('hex')

  const payload = {
    access_key: access_key,
    nonce: uuidv4(),
    query_hash: queryHash,
    query_hash_alg: 'SHA512',
  }

  const token = sign(payload, secret_key);

  const options = {
    method: "POST",
    url: server_url + "/v1/orders",
    headers: {Authorization: `Bearer ${token}`},
    json: body
  }

  return new Promise(res => {
    request(options, (error, response, body) => {
      if (error) throw new Error(error)
      res(body)
    })
  });
}

function findOrderList() {
  const state = 'wait'

  const non_array_body = {
    state: state,
  }

  const body = {
    ...non_array_body
  }

  // const array_body = {
  //     uuids: uuids,
  // }
  // const body = {
  //     ...non_array_body,
  //     ...array_body
  // }

  // const uuid_query = uuids.map(uuid => `uuids[]=${uuid}`).join('&')

  const query = queryEncode(non_array_body);

  const hash = crypto.createHash('sha512')
  const queryHash = hash.update(query, 'utf-8').digest('hex')

  const payload = {
    access_key: access_key,
    nonce: uuidv4(),
    query_hash: queryHash,
    query_hash_alg: 'SHA512',
  }

  const token = sign(payload, secret_key)

  const options = {
    method: "GET",
    url: server_url + "/v1/orders?" + query,
    headers: {Authorization: `Bearer ${token}`},
    json: body
  }

  return new Promise((res, rej) => {
    request(options, (error, response, body) => {
      if (error) rej(error)
      res(body)
    })
  });
}

module.exports = {
  findOrderChance,
  bidOrder,
  askOrder,
  findOrderList
}