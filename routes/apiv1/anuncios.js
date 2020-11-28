'use strict';

const express = require('express');
const mongoose = require('mongoose');
const upload = require('../../lib/multerConfig');
const router = express.Router();
const Anuncio = mongoose.model('Anuncio');

router.get('/', (req, res, next) => {
  const start = parseInt(req.query.start) || 0;
  const limit = parseInt(req.query.limit) || 1000; // nuestro api devuelve max 1000 registros
  const sort = req.query.sort || '_id';
  const includeTotal = req.query.includeTotal === 'true';
  const filters = {};
  if (typeof req.query.tags !== 'undefined') {
    filters.tags = { $all: req.query.tags.split(',') };
  }

  if (typeof req.query.sale !== 'undefined') {
    filters.sale = req.query.sale;
  }

  if (typeof req.query.price !== 'undefined' && req.query.price !== '-') {
    if (req.query.price.indexOf('-') !== -1) {
      filters.price = {};
      let rango = req.query.price.split('-');
      if (rango[0] !== '') {
        filters.price.$gte = rango[0];
      }

      if (rango[1] !== '') {
        filters.price.$lte = rango[1];
      }
    } else {
      filters.price = req.query.price;
    }
  }

  if (typeof req.query.name !== 'undefined') {
    filters.name = new RegExp('^' + req.query.name, 'i');
  }

  Anuncio.list(filters, start, limit, sort, includeTotal)
    .then(anuncios => {
      //res.json({ ok: true, result: anuncios });
      res.json(anuncios);
    })
    .catch(err => next(err));
});

router.post('/', upload.single('photo'), async (req, res, next) => {
  try {
    const anuncio = new Anuncio(req.body);
    console.log(anuncio) 
    await anuncio.setPhoto(req.file); // save image

    const saved = await anuncio.save();
    
    res.json({ ok: true, result: saved });
    
  } catch (err) {
    next(err);
  }
});


router.get('/tags', function (req, res) {
  res.json({ ok: true, result: Anuncio.allowedTags() });
});

router.get('/:id', (req, res, next) => {
  const filter = { _id: req.params.id };
  Anuncio.list(filter)
    .then(anuncios => {
      res.json({ ok: true, result: anuncios.rows[0] || null });
    })
    .catch(err => next(err));
});

router.delete('/:id', (req, res, next) => {
  Anuncio.findByIdAndRemove(req.params.id)
    .exec()
    .then(anuncio => {
      res.json({ ok: true, result: anuncio });
    })
    .catch(err => next(err));
});

module.exports = router;
