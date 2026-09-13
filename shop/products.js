/* OMAN SOUNDS — shop catalogue (data).
   This file is the single source of truth for what the storefront SHOWS.
   Edit it with the visual manager at shop/admin.html (Export → replace this
   file), or by hand. Loaded as a plain script so it works from file:// too.

   Money/VAT/inventory/file-delivery live in Lemon Squeezy / Paddle — put each
   variant's checkout link in `checkout` when you wire that up. */
window.OS_PRODUCTS = [
  {
    id: 'slanted-data', type: 'font', name: 'Slanted Data', kind: 'display typeface',
    image: '../MEDIA/ALBUM_ART/SPUNK_FACE_ART_SCREEN.webp', meta: '6 weights + italics · 12 styles',
    delivery: 'download', file: 'slanted-data.zip', soldOut: false,
    blurb: 'The flagship display cut — sharp, off-axis letterforms drawn for covers, posters and the oman sounds identity.',
    variants: [
      { label: 'Desktop — up to 5 devices', price: 39, checkout: '' },
      { label: 'Web (@font-face)', price: 59, checkout: '' },
      { label: 'App / embedding', price: 120, checkout: '' },
      { label: 'Complete — all uses', price: 199, checkout: '' }
    ]
  },
  {
    id: 'slanted-data-var', type: 'font', name: 'Slanted Data Variable', kind: 'variable typeface',
    image: '../MEDIA/ALBUM_ART/SPECTRAL_COMPLICATIONS.webp', meta: '1 variable file · wght + slnt',
    delivery: 'download', file: 'slanted-data-variable.zip', soldOut: false,
    blurb: 'One file, the full range. Animate weight and slant on the web, or pick any static instance for print.',
    variants: [
      { label: 'Desktop — up to 5 devices', price: 39, checkout: '' },
      { label: 'Web (@font-face)', price: 59, checkout: '' },
      { label: 'App / embedding', price: 120, checkout: '' },
      { label: 'Complete — all uses', price: 199, checkout: '' }
    ]
  },
  {
    id: 'hell-poster', type: 'merch', name: 'hell01101111 Poster', kind: 'A2 riso print',
    image: '../MEDIA/ALBUM_ART/QUESTIONS_REMIX_Small.webp', meta: 'A2 · 200gsm · numbered edition',
    delivery: 'ship', soldOut: false,
    blurb: 'A2 print of the hell01101111 artwork. Numbered, shipped rolled in a tube.',
    variants: [ { label: 'A2 print', price: 35, checkout: '' } ]
  },
  {
    id: 'spectral-poster', type: 'merch', name: 'Spectral Complications Poster', kind: 'A2 riso print',
    image: '../MEDIA/ALBUM_ART/SPECTRAL_COMPLICATIONS.webp', meta: 'A2 · 200gsm · numbered edition',
    delivery: 'ship', soldOut: false,
    blurb: 'A2 print of the Spectral Complications cover. Numbered, shipped rolled.',
    variants: [ { label: 'A2 print', price: 35, checkout: '' } ]
  },
  {
    id: 'sigil-tee', type: 'merch', name: 'Sigil Tee', kind: 'heavyweight shirt',
    image: '../MEDIA/ALBUM_ART/NIWIS.webp', meta: 'heavyweight cotton · unisex',
    delivery: 'ship', soldOut: false,
    blurb: 'Heavyweight tee screen-printed with the O sigil. Unisex fit — see the size guide before ordering.',
    variants: [
      { label: 'Size S', price: 40, checkout: '' },
      { label: 'Size M', price: 40, checkout: '' },
      { label: 'Size L', price: 40, checkout: '' },
      { label: 'Size XL', price: 40, checkout: '' }
    ]
  }
];
