'use strict';

const fs = require('fs');
const path = require('path');
const LoadTesting = require('easygraphql-load-tester');
const { fileLoader } = require('merge-graphql-schemas');

const schema = fs.readFileSync(path.join(__dirname, 'schema.gql'), 'utf8');
const queries = fileLoader(path.join(__dirname, './graphql'));

const args = {
  GET_RESERVATION: [
    {
      id: 1,
    },
  ],
};

const easyGraphQLLoadTester = new LoadTesting(schema, args);

const testCases = easyGraphQLLoadTester.artillery({
  customQueries: queries,
  onlyCustomQueries: true,
  selectedQueries: ['GET_RESERVATION'],
  queryFile: true,
});

module.exports = { testCases };
