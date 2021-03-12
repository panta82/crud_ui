'use strict';

const http = require('http');
const express = require('express');

const { crudUI } = require('../dist');

const app = express();

app.use(
  '/',
  crudUI({
    name: 'user',
    recordId: 'id',
    fields: [
      {
        name: 'name',
        label: 'Name',
      },
      {
        name: 'phone',
        label: 'Phone number',
      },
    ],
    actions: {
      getList: () => {
        return [
          { name: 'Mark', phone: '+123 456 789' },
          { name: 'Milo', phone: '' },
          { name: 'Sandra', phone: '+1 33 55 66' },
        ];
      },
    },
  })
);

http.createServer(app).listen(3000);
